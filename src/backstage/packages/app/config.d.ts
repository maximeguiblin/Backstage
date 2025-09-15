export interface Config {
    customStorage: {

        /**
         * Trivy storage host
         * @visibility frontend
         */
        host: string;
        
        /**
         * Trivy storage report SAS token
         * @visibility frontend
         */
        reportSasToken: string;
        };

};