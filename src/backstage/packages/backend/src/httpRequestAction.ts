// CUSTOM: http:request action for external HTTP calls
import { createBackendModule } from '@backstage/backend-plugin-api';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';


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
                    createAzurePipelineTriggerAction(),
                );
            },
        });
    },
});
