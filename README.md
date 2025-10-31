# Developer portal with Backstage

This repository contains the source code for a backstage based developer portal

This project package was initiated based on Sodexo AI Platform Cookiecutter project template.


## Run in local using docker

First, you need to build a docker image locally by running the command at the root of the repo:

  ```
  $ docker build -t backstage .
  ```

Then, you can run the docker image locally.
To do so yu must specify several environment variable.
  * PG_HOST : hostname of the server running Postgresql, ex azieps1aip001.postgres.database.azure.com
  * PG_PORT : port used to connect to PG, ex 5432
  * PG_USER : user to connect to PG, ex sdxpostgreadminuser
  * PG_PASSWORD : password used to connect to PG
  * PG_DATABASE : name of teh PG database that should be used by backstage
  * BACKSTAGE_DEVOPS_TOKEN : the access token used by backstage to access Azure DevOps(see below how to generate it)
  * BACKSTAGE_SONARQUBE_TOKEN : the token to allow sonarqube connexion to backstage
  * BACKSTAGE_STORAGE_HOST : the host of the storage account, ex: aziest1doc001.blob.core.windows.net
  * BACKSTAGE_STORAGE_ACCOUNT : backstage storage account name
  * BACKSTAGE_STORAGE_KEY : backstage storage account key
  * BACKSTAGE_STORAGE_REPORT_SAS_TOKEN : backstage report storage account sas token

Then you can run at the root of the repo ex:

  ```
  $ docker run -p 3000:3000 -p 7007:7007 -e PG_HOST=azieps1aip001.postgres.database.azure.com -e PG_PORT=5432 -e PG_USER=sdxpostgreadminuser -e PG_PASSWORD=<password> -e PG_DATABASE=<db> -e BACKSTAGE_DEVOPS_TOKEN=<PAT_TOKEN> -e BACKSTAGE_SONARQUBE_TOKEN=<SONARQUBE_TOKEN> -e BACKSTAGE_STORAGE_HOST=<STORAGE_HOST> -e BACKSTAGE_STORAGE_ACCOUNT=<STORAGE_ACCOUNT> -e BACKSTAGE_STORAGE_KEY=<STORAGE_ACCOUNT_KEY> -e BACKSTAGE_STORAGE_REPORT_SAS_TOKEN=<REPORT_SAS_TOKEN> backstage
  ```

If you are making changes to yaml files and want to test them locally without rebuilding the docker image and restarting the container, you can mount the folder with yaml files so that they are reloaded dynamically e.g.

  ```
  $ docker run -p 3000:3000 -p 7007:7007 -e PG_HOST=azieps1aip001.postgres.database.azure.com -e PG_PORT=5432 -e PG_USER=sdxpostgreadminuser -e PG_PASSWORD=<password> -e PG_DATABASE=<db> -e BACKSTAGE_DEVOPS_TOKEN=<PAT_TOKEN> -e BACKSTAGE_SONARQUBE_TOKEN=<SONARQUBE_TOKEN> -v "C:\IST.GLB.GLB.DataFactory_DeveloperPlatform.Backstage\src\backstage\sodexo:/workspace/backstage/sodexo" -v "C:\IST.GLB.GLB.DataFactory_DeveloperPlatform.Backstage\src\backstage\app-config.yaml:/workspace/backstage/app-config.yaml" backstage
  ```

Create a file app-config.local.yaml to store local configuration for backstage. This file is gitignored but even if not used should be creted and left empty to avoid errors in the log.

Finally you can open the backstage portal by going into the URL: http://localhost:3000


## Deploy in Azure


### Setup working environment

Before deploying in Azure, you must setup your working environment by running the following steps:

* Open the URL and log in with your AZ account https://azeuvs1gct987.visualstudio.com/_usersSettings/tokens
* Generate an Azure Devops Personal Access Token by selecting "All accessible organizations" and at least the permission "Read" under section "Packaging"
* Copy the generated token and put it into the following command in replacement of the string REPLACE_BY_TOKEN :

  ```
  $ export PIP_EXTRA_INDEX_URL=https://build:REPLACE_BY_TOKEN@sdxcloud.pkgs.visualstudio.com/_packaging/AIP-feed/pypi/simple/
  ```

* Copy the resuling command at the end of your file ~/.bashrc


### Installing

* Clone the project repository
* Install the dependencies of the project into a new virtual environment with Python >= 3.8 (recommending 3.10)

  ```
  $ bash scripts/install_requirements.sh --python_version 3.10
  ```


### How to deploy

To deploy in Azure Container Apps, you can use the command:

  ```
  $ aip app container deploy
  ```


## Documentation

The documentation of the project is available in the following links: To be filled

Please fill here the links to code and product documentations


## Contributing

* Contribute by committing your changes into a new feature branch
* Run the unit tests and make sure no regression is introduced
* Create a pull request from your feature branch to the develop branch
* Request another team member for approval and merge
