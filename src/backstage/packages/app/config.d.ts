/** Configuration for the Backstage app
 * This file is used to add extra configuration
 * to the Backstage app */

export interface Config {
    /** Adding extra configuration for the app */
    app: {
        /** CUSTOM: Whether to show the Guest sign-in option (sandbox only) @visibility frontend */
        enableGuestAuth?: boolean;
        analytics?: {
            azureAppInsights?: {
                /**
                 * Azure Application Insights connection string.
                 * This is a public ingestion endpoint, safe to expose to the browser.
                 * @visibility frontend
                 */
                connectionString?: string;
            };
        };
    };

    /** Adding extra configuration for the custom storage account */
    customStorage: {
        /** Custom storage host @visibility frontend */
        host: string;
        /** Custom storage SAS token @visibility frontend */
        reportSasToken: string;
    };
};