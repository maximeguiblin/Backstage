// CUSTOM: Webapp proxy plugin - proxies requests to deployed container apps
import {
    createBackendPlugin,
    coreServices,
} from '@backstage/backend-plugin-api';
import { readFileSync } from 'fs';
import { Agent } from 'https';
import WebSocket, { WebSocketServer } from 'ws';

export const webappProxyPlugin = createBackendPlugin({
    pluginId: 'webapp-proxy',
    register(env) {
        env.registerInit({
            deps: {
                httpRouter: coreServices.httpRouter,
                logger: coreServices.logger,
                config: coreServices.rootConfig,
            },
            async init({ httpRouter, logger, config }) {
                const { Router } = await import('express');
                const router = Router();

                const certPath = config.getOptionalString('webappProxy.clientCertPath') ?? '/app/certs/client.pem';
                const keyPath = config.getOptionalString('webappProxy.clientKeyPath') ?? '/app/certs/client-key.pem';
                const gatewayIp = config.getOptionalString('webappProxy.gatewayIp');

                let cert: Buffer | undefined;
                let key: Buffer | undefined;

                // Try env vars first (PEM content passed directly), then fall back to files
                const certEnv = process.env.WEBAPP_CLIENT_CERT;
                const keyEnv = process.env.WEBAPP_CLIENT_KEY;
                if (certEnv && keyEnv) {
                    cert = Buffer.from(certEnv);
                    key = Buffer.from(keyEnv);
                    logger.info('Loaded mTLS client certificate from environment variables');
                } else {
                    try {
                        cert = readFileSync(certPath);
                        key = readFileSync(keyPath);
                        logger.info(`Loaded mTLS client certificate from ${certPath}`);
                    } catch (error) {
                        logger.warn(`Could not load mTLS certificates (${certPath}, ${keyPath}): ${error}. Proxy will connect without client cert.`);
                    }
                }

                const makeAgent = (hostname: string) => new Agent({
                    ...(cert && key ? { cert, key } : {}),
                    rejectUnauthorized: false,
                    servername: hostname,
                });

                // Helper for standard HTTP(S) proxying
                const proxyRequest = (targetUrl: string): Promise<{ status: number; headers: Record<string, string>; body: Buffer }> => {
                    const { request } = require('https') as typeof import('https');
                    const url = new URL(targetUrl);
                    const agent = makeAgent(url.hostname);

                    return new Promise((resolve, reject) => {
                        const options = {
                            hostname: gatewayIp || url.hostname,
                            port: url.port || 443,
                            path: url.pathname + url.search,
                            method: 'GET',
                            headers: { Host: url.hostname },
                            agent,
                        };

                        const req = request(options, (response) => {
                            const chunks: Buffer[] = [];
                            response.on('data', (chunk: Buffer) => chunks.push(chunk));
                            response.on('end', () => {
                                const headers: Record<string, string> = {};
                                for (const [name, value] of Object.entries(response.headers)) {
                                    if (typeof value === 'string') {
                                        headers[name] = value;
                                    } else if (Array.isArray(value)) {
                                        headers[name] = value.join(', ');
                                    }
                                }
                                resolve({ status: response.statusCode ?? 502, headers, body: Buffer.concat(chunks) });
                            });
                        });

                        req.on('error', reject);
                        req.setTimeout(30000, () => req.destroy(new Error('Request timeout')));
                        req.end();
                    });
                };

                // Proxy endpoint: /api/webapp-proxy/<fqdn>/<path>
                router.use('/', async (req, res) => {
                    const pathParts = req.path.replace(/^\//, '').split('/');
                    const fqdn = pathParts[0];
                    const subPath = pathParts.slice(1).join('/');

                    if (!fqdn) {
                        res.status(400).json({ error: 'Missing FQDN in path' });
                        return;
                    }

                    const targetUrl = `https://${fqdn}/${subPath}`;
                    // Per-request log kept at debug level: Streamlit polling generates one entry
                    // per ~1s and was the top contributor to Log Analytics ingestion (AB#783907).
                    logger.debug(`Proxying request to ${targetUrl}`);

                    try {
                        const response = await proxyRequest(targetUrl);
                        res.status(response.status);

                        const contentType = response.headers['content-type'];
                        if (contentType) res.setHeader('Content-Type', contentType);
                        const cacheControl = response.headers['cache-control'];
                        if (cacheControl) res.setHeader('Cache-Control', cacheControl);

                        if (contentType?.includes('text/html')) {
                            let html = response.body.toString('utf-8');
                            html = html.replace(
                                /((?:href|src|action)\s*=\s*["'])\//g,
                                `$1/api/webapp-proxy/${fqdn}/`,
                            );
                            res.send(html);
                        } else {
                            res.send(response.body);
                        }
                    } catch (error) {
                        logger.error(`Proxy error for ${targetUrl}: ${error}`);
                        res.status(502).json({ error: 'Bad Gateway', message: `Failed to reach ${fqdn}` });
                    }
                });

                httpRouter.use(router);
                httpRouter.addAuthPolicy({ path: '/', allow: 'unauthenticated' });

                // WebSocket upgrade proxy — forward ws:// → wss:// to the target app
                httpRouter.addAuthPolicy({ path: '/*', allow: 'unauthenticated' });

                // Attach WS upgrade handler to the HTTP server
                // We hook into the underlying server via the router's handle upgrade
                const wss = new WebSocketServer({ noServer: true });

                // The Backstage httpRouter exposes a way to attach upgrade listeners
                // We use the express router handle on the server's 'upgrade' event
                (router as any).__webappWss = wss;
                (router as any).__webappGatewayIp = gatewayIp;
                (router as any).__webappCert = cert;
                (router as any).__webappKey = key;
                (router as any).__webappLogger = logger;

                // We attach the upgrade handler via a one-time server hook
                // Backstage exposes the underlying http.Server via lifecycle
                process.nextTick(() => {
                    // Find the http server in the global event listeners — fallback approach
                    // that works with Backstage's new backend system
                    const listeners = (process as any)._getActiveHandles?.() ?? [];
                    const httpServers = listeners.filter((h: any) => h?.constructor?.name === 'Server');

                    for (const server of httpServers) {
                        if (server._events?.upgrade) continue; // already hooked

                        server.on('upgrade', (request: any, socket: any, head: any) => {
                            const url = request.url as string;
                            if (!url?.startsWith('/api/webapp-proxy/')) return;

                            const pathParts = url.replace('/api/webapp-proxy/', '').split('/');
                            const fqdn = pathParts[0];
                            const subPath = pathParts.slice(1).join('/');

                            if (!fqdn) {
                                socket.destroy();
                                return;
                            }

                            const targetWsUrl = `wss://${gatewayIp || fqdn}/${subPath}`;
                            // Per-upgrade log kept at debug level for the same reason as the
                            // HTTP proxy log above (AB#783907).
                            logger.debug(`WebSocket upgrade: proxying to ${targetWsUrl}`);

                            const agent = makeAgent(fqdn);
                            const upstream = new WebSocket(targetWsUrl, {
                                agent,
                                headers: { Host: fqdn },
                                rejectUnauthorized: false,
                            });

                            // Wait for upstream to be open before sending 101 to browser.
                            // If we upgraded the browser first and upstream then fails, the
                            // browser sees "closed before connection established".
                            upstream.on('open', () => {
                                wss.handleUpgrade(request, socket, head, (clientWs) => {
                                    clientWs.on('message', (data) => upstream.send(data));
                                    upstream.on('message', (data) => clientWs.send(data));
                                    clientWs.on('close', () => upstream.close());
                                    upstream.on('close', () => clientWs.close());
                                    clientWs.on('error', (err) => logger.error(`WS client error: ${err}`));
                                    upstream.on('error', (err) => logger.error(`WS upstream error: ${err}`));
                                });
                            });
                            upstream.on('error', (err) => {
                                logger.error(`WS upstream connection failed for ${targetWsUrl}: ${err}`);
                                // Reject without sending 101 — browser will see a clean failure
                                socket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
                                socket.destroy();
                            });
                        });

                        logger.info('WebSocket upgrade handler attached to HTTP server');
                    }
                });

                logger.info('Webapp proxy plugin initialized (HTTP + WebSocket)');
            },
        });
    },
});
