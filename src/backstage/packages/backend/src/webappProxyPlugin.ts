// CUSTOM: Webapp proxy plugin - proxies requests to deployed container apps
import {
    createBackendPlugin,
    coreServices,
} from '@backstage/backend-plugin-api';
import { readFileSync } from 'fs';
import { Agent } from 'https';

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

                // Load mTLS client certificate and key
                const certPath = config.getOptionalString('webappProxy.clientCertPath') ?? '/app/certs/client.pem';
                const keyPath = config.getOptionalString('webappProxy.clientKeyPath') ?? '/app/certs/client-key.pem';

                // App Gateway IP for custom DNS resolution (equivalent to curl --resolve)
                const gatewayIp = config.getOptionalString('webappProxy.gatewayIp');

                let cert: Buffer | undefined;
                let key: Buffer | undefined;
                try {
                    cert = readFileSync(certPath);
                    key = readFileSync(keyPath);
                    logger.info(`Loaded mTLS client certificate from ${certPath}`);
                } catch (error) {
                    logger.warn(`Could not load mTLS certificates (${certPath}, ${keyPath}): ${error}. Proxy will connect without client cert.`);
                }

                // Helper to perform the proxied HTTPS request using mTLS + gateway resolution
                const proxyRequest = (targetUrl: string): Promise<{ status: number; headers: Record<string, string>; body: Buffer }> => {
                    const { request } = require('https') as typeof import('https');
                    const url = new URL(targetUrl);

                    // Build a per-request agent so we can set servername (SNI) to the
                    // original hostname while connecting to the gateway IP — this is
                    // the Node.js equivalent of curl's --resolve flag.
                    const agent = new Agent({
                        ...(cert && key ? { cert, key } : {}),
                        // -k: the App Gateway presents its own certificate
                        rejectUnauthorized: false,
                        // SNI must match the hostname the gateway expects
                        servername: url.hostname,
                    });

                    return new Promise((resolve, reject) => {
                        const options = {
                            // Connect to the gateway IP instead of DNS-resolved address
                            hostname: gatewayIp || url.hostname,
                            port: url.port || 443,
                            path: url.pathname + url.search,
                            method: 'GET',
                            headers: {
                                Host: url.hostname,
                            },
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
                                resolve({
                                    status: response.statusCode ?? 502,
                                    headers,
                                    body: Buffer.concat(chunks),
                                });
                            });
                        });

                        req.on('error', reject);
                        req.setTimeout(30000, () => {
                            req.destroy(new Error('Request timeout'));
                        });
                        req.end();
                    });
                };

                // Proxy endpoint: /api/webapp-proxy/<fqdn>/<path>
                // The FQDN is the first path segment, everything after is the sub-path
                router.use('/', async (req, res) => {
                    // Extract fqdn and sub-path from the URL
                    // e.g. /my-app.azurecontainerapps.io/some/page → fqdn=my-app.azurecontainerapps.io, subPath=some/page
                    const pathParts = req.path.replace(/^\//, '').split('/');
                    const fqdn = pathParts[0];
                    const subPath = pathParts.slice(1).join('/');

                    if (!fqdn) {
                        res.status(400).json({ error: 'Missing FQDN in path' });
                        return;
                    }

                    const targetUrl = `https://${fqdn}/${subPath}`;

                    logger.info(`Proxying request to ${targetUrl}`);

                    try {
                        const response = await proxyRequest(targetUrl);

                        // Forward status code
                        res.status(response.status);

                        // Forward relevant headers
                        const contentType = response.headers['content-type'];
                        if (contentType) {
                            res.setHeader('Content-Type', contentType);
                        }
                        const cacheControl = response.headers['cache-control'];
                        if (cacheControl) {
                            res.setHeader('Cache-Control', cacheControl);
                        }

                        // For HTML responses, rewrite asset URLs to go through the proxy
                        if (contentType?.includes('text/html')) {
                            let html = response.body.toString('utf-8');
                            // Rewrite absolute paths (href="/...", src="/...")
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
                // Allow unauthenticated access so the iframe can load
                httpRouter.addAuthPolicy({
                    path: '/',
                    allow: 'unauthenticated',
                });

                logger.info('Webapp proxy plugin initialized');
            },
        });
    },
});
