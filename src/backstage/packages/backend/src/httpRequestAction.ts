import { createBackendModule } from '@backstage/backend-plugin-api';
import { createTemplateAction, scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';

const createHttpRequestAction = () => {
    return createTemplateAction({
        id: 'http:request',
        description: 'Sends an HTTP request to an external URL.',
        schema: {
            input: (z) => z.object({
                method: z
                    .enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
                    .describe('HTTP method'),
                url: z.string().describe('The full URL to send the request to'),
                headers: z.record(z.string()).optional().describe('Request headers'),
                basicAuth: z
                    .object({
                        username: z.string().describe('Username (can be empty for token-only auth)'),
                        password: z.string().describe('Password or token'),
                    })
                    .optional()
                    .describe('If provided, adds a Basic Authorization header (base64-encoded username:password)'),
                basicAuthEnvVar: z
                    .string()
                    .optional()
                    .describe('Name of an environment variable containing a token. Builds Basic auth as base64(:token). Takes precedence over basicAuth.'),
                body: z.string().optional().describe('Request body'),
                continueOnBadResponse: z
                    .boolean()
                    .optional()
                    .describe('If true, continue to next step even on 4xx/5xx responses'),
            }),
            output: (z) => z.object({
                code: z.number().optional().describe('HTTP response status code'),
                headers: z.record(z.any()).optional().describe('Response headers'),
                body: z.any().optional().describe('Response body'),
            }),
        },
        async handler(ctx) {
            const { url, method, headers, basicAuth, body, continueOnBadResponse } = ctx.input;
            const basicAuthEnvVar = (ctx.input as { basicAuthEnvVar?: string }).basicAuthEnvVar;

            ctx.logger.info(`Creating ${method} request to ${url}`);

            const requestHeaders: Record<string, string> = { ...(headers ?? {}) };
            if (basicAuthEnvVar) {
                const token = process.env[basicAuthEnvVar];
                if (!token) {
                    throw new Error(`Environment variable '${basicAuthEnvVar}' is not set`);
                }
                const encoded = Buffer.from(`:${token}`).toString('base64');
                requestHeaders.Authorization = `Basic ${encoded}`;
            } else if (basicAuth) {
                const encoded = Buffer.from(`${basicAuth.username}:${basicAuth.password}`).toString('base64');
                requestHeaders.Authorization = `Basic ${encoded}`;
            }

            const response = await fetch(url, {
                method,
                headers: requestHeaders,
                body: body ?? undefined,
                signal: AbortSignal.timeout(60000),
            });

            const responseHeaders: Record<string, string> = {};
            for (const [name, value] of response.headers) {
                responseHeaders[name] = value;
            }

            const contentType = responseHeaders['content-type'] ?? '';
            const text = await response.text();
            let responseBody: unknown;
            try {
                if (contentType.includes('application/json')) {
                    const trimmed = text.trim();
                    responseBody = trimmed === '' ? null : JSON.parse(trimmed);
                } else {
                    responseBody = { message: text };
                }
            } catch (e) {
                responseBody = {
                    message: `Could not parse response: ${e}`,
                    raw: text,
                };
            }

            if (response.status >= 400) {
                ctx.logger.error(
                    `Request failed with status ${response.status}: ${JSON.stringify(responseBody)}`,
                );
                if (!continueOnBadResponse) {
                    throw new Error(
                        `Request to ${url} failed with status ${response.status}`,
                    );
                }
            }

            ctx.output('code', response.status);
            ctx.output('headers', responseHeaders);
            ctx.output('body', responseBody);
        },
    });
};

const createHttpRequestPollAction = () => {
    return createTemplateAction({
        id: 'http:request:poll',
        description: 'Polls an HTTP endpoint until a condition is met or timeout is reached.',
        schema: {
            input: (z) => z.object({
                url: z.string().describe('The URL to poll'),
                headers: z.record(z.string()).optional().describe('Request headers'),
                basicAuthEnvVar: z
                    .string()
                    .optional()
                    .describe('Name of an environment variable containing a token. Builds Basic auth as base64(:token).'),
                jsonPathField: z
                    .string()
                    .describe(
                        'Dot-notation path to the field in the JSON response to check (e.g. properties.provisioningState)',
                    ),
                expectedValue: z.string().describe('The expected value of the field'),
                intervalMs: z
                    .number()
                    .optional()
                    .describe('Polling interval in milliseconds (default: 10000)'),
                timeoutMs: z
                    .number()
                    .optional()
                    .describe('Max time to wait in milliseconds (default: 300000)'),
            }),
            output: (z) => z.object({
                code: z.number().optional().describe('Last HTTP response status code'),
                body: z.any().optional().describe('Last response body'),
            }),
        },
        async handler(ctx) {
            const { url, headers, jsonPathField, expectedValue } = ctx.input;
            const basicAuthEnvVar = (ctx.input as { basicAuthEnvVar?: string }).basicAuthEnvVar;
            const intervalMs = (ctx.input as { intervalMs?: number }).intervalMs ?? 10000;
            const timeoutMs = (ctx.input as { timeoutMs?: number }).timeoutMs ?? 300000;

            const pollHeaders: Record<string, string> = { ...(headers ?? {}) };
            if (basicAuthEnvVar) {
                const token = process.env[basicAuthEnvVar];
                if (!token) {
                    throw new Error(`Environment variable '${basicAuthEnvVar}' is not set`);
                }
                const encoded = Buffer.from(`:${token}`).toString('base64');
                pollHeaders.Authorization = `Basic ${encoded}`;
            }

            ctx.logger.info(
                `Polling ${url} until ${jsonPathField} equals "${expectedValue}" (timeout: ${timeoutMs / 1000}s)`,
            );

            const startTime = Date.now();
            while (Date.now() - startTime < timeoutMs) {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: pollHeaders,
                    signal: AbortSignal.timeout(30000),
                });

                const pollText = await response.text();
                let body: Record<string, unknown> = {};
                try {
                    const trimmed = pollText.trim();
                    if (trimmed !== '') {
                        body = JSON.parse(trimmed) as Record<string, unknown>;
                    }
                } catch {
                    ctx.logger.warn('Could not parse poll response as JSON');
                }

                let current: unknown = body;
                for (const key of jsonPathField.split('.')) {
                    if (current && typeof current === 'object' && key in current) {
                        current = (current as Record<string, unknown>)[key];
                    } else {
                        current = undefined;
                        break;
                    }
                }

                ctx.logger.info(
                    `Poll: ${jsonPathField} = "${current}" (expected: "${expectedValue}")`,
                );

                if (String(current) === expectedValue) {
                    ctx.logger.info('Polling condition met.');
                    ctx.output('code', response.status);
                    ctx.output('body', body);
                    return;
                }

                if (String(current) === 'Failed') {
                    throw new Error(`Resource entered Failed state while polling ${url}`);
                }

                await new Promise(resolve => setTimeout(resolve, intervalMs));
            }

            throw new Error(
                `Polling timed out after ${timeoutMs / 1000}s waiting for ${jsonPathField} to equal "${expectedValue}"`,
            );
        },
    });
};

const createCatalogRegisterInlineAction = () => {
    return createTemplateAction({
        id: 'catalog:register:inline',
        description: 'Registers an entity by writing a catalog YAML file to the dynamic-entities directory watched by the catalog.',
        schema: {
            input: (z) => z.object({
                entity: z
                    .any()
                    .describe('The entity object to register (apiVersion, kind, metadata, spec)'),
            }),
            output: (z) => z.object({
                entityRef: z.string().optional().describe('The entity reference of the registered entity'),
                filePath: z.string().optional().describe('The path of the written catalog file'),
            }),
        },
        async handler(ctx) {
            const { entity } = ctx.input;
            const fs = await import('fs');
            const path = await import('path');

            const dynamicDir = path.join(process.cwd(), 'dynamic-entities');
            if (!fs.existsSync(dynamicDir)) {
                fs.mkdirSync(dynamicDir, { recursive: true });
            }

            const entityName = entity.metadata?.name ?? 'unknown';
            const fileName = `${entityName}.yaml`;
            const filePath = path.join(dynamicDir, fileName);

            const lines: string[] = [
                `apiVersion: ${entity.apiVersion ?? 'backstage.io/v1alpha1'}`,
                `kind: ${entity.kind ?? 'Component'}`,
                'metadata:',
                `  name: ${entity.metadata?.name ?? 'unknown'}`,
            ];
            if (entity.metadata?.description) {
                lines.push(`  description: "${entity.metadata.description}"`);
            }
            if (entity.metadata?.annotations) {
                lines.push('  annotations:');
                for (const [key, value] of Object.entries(
                    entity.metadata.annotations as Record<string, string>,
                )) {
                    lines.push(`    ${key}: "${value}"`);
                }
            }
            if (entity.metadata?.links) {
                lines.push('  links:');
                for (const link of entity.metadata.links as Array<{ url: string; title?: string }>) {
                    lines.push(`    - url: "${link.url}"`);
                    if (link.title) {
                        lines.push(`      title: "${link.title}"`);
                    }
                }
            }
            if (entity.spec) {
                lines.push('spec:');
                for (const [key, value] of Object.entries(entity.spec as Record<string, unknown>)) {
                    if (typeof value === 'string') {
                        lines.push(`  ${key}: ${value}`);
                    } else {
                        lines.push(`  ${key}: ${JSON.stringify(value)}`);
                    }
                }
            }

            const yamlContent = `${lines.join('\n')}\n`;
            fs.writeFileSync(filePath, yamlContent, 'utf8');

            ctx.logger.info(`Wrote entity file to ${filePath}`);

            const entityRef =
                `${entity.kind}:${entity.metadata?.namespace ?? 'default'}/${entityName}`.toLowerCase();
            ctx.output('entityRef', entityRef);
            ctx.output('filePath', filePath);
        },
    });
};

// Used only for debugging pipeline triggers
const createAzurePipelineTriggerAction = () => {
    return createTemplateAction({
        id: 'azure:pipeline:trigger',
        description: 'Triggers an Azure DevOps pipeline run using BACKSTAGE_DEVOPS_TOKEN.',
        schema: {
            input: (z) => z.object({
                organization: z.string().describe('Azure DevOps organization name'),
                project: z.string().describe('Azure DevOps project name'),
                pipelineId: z.string().describe('The pipeline ID to trigger'),
                branch: z.string().optional().describe('Branch to run the pipeline on (default: main)'),
                pipelineParameters: z
                    .record(z.string())
                    .optional()
                    .describe('Template parameters to pass to the pipeline'),
            }),
            output: (z) => z.object({
                runId: z.number().optional().describe('The ID of the pipeline run'),
                runUrl: z.string().optional().describe('Web URL of the pipeline run'),
            }),
        },
        async handler(ctx) {
            const { organization, project, pipelineId, pipelineParameters } = ctx.input;
            const branch = ctx.input.branch ?? 'main';

            const token = process.env.BACKSTAGE_DEVOPS_TOKEN;
            if (!token) {
                throw new Error('Environment variable BACKSTAGE_DEVOPS_TOKEN is not set');
            }
            const authHeader = `Basic ${Buffer.from(`:${token}`).toString('base64')}`;

            const url = `https://dev.azure.com/${encodeURIComponent(organization)}/${encodeURIComponent(project)}/_apis/pipelines/${encodeURIComponent(pipelineId)}/runs?api-version=7.1`;

            const body: Record<string, unknown> = {
                resources: {
                    repositories: {
                        self: {
                            refName: `refs/heads/${branch}`,
                        },
                    },
                },
            };
            if (pipelineParameters && Object.keys(pipelineParameters).length > 0) {
                body.templateParameters = pipelineParameters;
            }

            ctx.logger.info(
                `Triggering pipeline ${pipelineId} in ${organization}/${project} on branch ${branch}`,
            );

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(60000),
            });

            const text = await response.text();
            let responseBody: Record<string, unknown> = {};
            try {
                const trimmed = text.trim();
                if (trimmed !== '') {
                    responseBody = JSON.parse(trimmed) as Record<string, unknown>;
                }
            } catch {
                ctx.logger.warn('Could not parse pipeline response as JSON');
            }

            if (!response.ok) {
                ctx.logger.error(
                    `Pipeline trigger failed with status ${response.status}: ${JSON.stringify(responseBody)}`,
                );
                throw new Error(
                    `Failed to trigger pipeline ${pipelineId} (${response.status}): ${JSON.stringify(responseBody)}`,
                );
            }

            const runId = responseBody.id as number | undefined;
            const runUrl = (responseBody._links as Record<string, { href?: string }> | undefined)
                ?.web?.href;

            ctx.logger.info(`Pipeline run created: id=${runId}, url=${runUrl}`);

            if (runId !== undefined) ctx.output('runId', runId);
            if (runUrl) ctx.output('runUrl', runUrl);
        },
    });
};

export const httpRequestModule = createBackendModule({
    pluginId: 'scaffolder',
    moduleId: 'http-request-external',
    register({ registerInit }) {
        registerInit({
            deps: {
                scaffolder: scaffolderActionsExtensionPoint,
            },
            async init({ scaffolder }) {
                scaffolder.addActions(
                    createHttpRequestAction(),
                    createHttpRequestPollAction(),
                    createCatalogRegisterInlineAction(),
                    createAzurePipelineTriggerAction(),
                );
            },
        });
    },
});
