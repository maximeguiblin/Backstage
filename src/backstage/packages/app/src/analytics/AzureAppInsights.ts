import {
    AnalyticsApi,
    AnalyticsEvent,
    ConfigApi,
} from '@backstage/core-plugin-api';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

export class AzureAppInsightsAnalytics implements AnalyticsApi {
    private readonly appInsights: ApplicationInsights | undefined;
    private lastTemplateRef: string | undefined;

    private constructor(connectionString: string | undefined) {
        if (!connectionString) return;

        this.appInsights = new ApplicationInsights({
            config: {
                connectionString,
                // Only capture explicit trackEvent() calls — no auto-tracking
                disableAjaxTracking: true,
                disableFetchTracking: true,
                disableExceptionTracking: true,
                disableCookiesUsage: true,
                disableCorrelationHeaders: true,
                autoTrackPageVisitTime: false,
            },
        });
        this.appInsights.loadAppInsights();
    }

    static fromConfig(configApi: ConfigApi): AzureAppInsightsAnalytics {
        const connectionString = configApi.getOptionalString(
            'app.analytics.azureAppInsights.connectionString',
        );
        return new AzureAppInsightsAnalytics(connectionString);
    }

    captureEvent(event: AnalyticsEvent): void {
        if (!this.appInsights) return;

        const { action, subject, value, attributes, context } = event;

        // Keep track of last visited template page to enrich create events.
        // URL pattern: /create/templates/{namespace}/{name}
        if (action === 'navigate') {
            const match = subject.match(/^\/create\/templates\/([^/]+)\/([^/]+)$/);
            if (match) {
                this.lastTemplateRef = `template:${match[1]}/${match[2]}`;
            }
        }

        // Only track when the user launches a template (scaffolder create action)
        if (!(action === 'create' && context.pluginId === 'scaffolder')) return;

        this.appInsights.trackEvent(
            { name: action },
            {
                subject,
                ...(value !== undefined && { value }),
                ...(this.lastTemplateRef && { templateRef: this.lastTemplateRef }),
                ...attributes,
            },
        );
        this.appInsights.flush();
    }
}
