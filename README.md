# Developer portal with Backstage

This repository contains the source code for a backstage based developer portal

This project package was initiated based on Sodexo AI Platform Cookiecutter project template.


## Run in local using docker

First, you need to build a docker image locally by running the command at the root of the repo:

  ```
  $ docker build -t backstage .
  ```

Then, you can run the docker image locally by using the command at the root of the repo:

  ```
  $ docker run -p 3000:3000 -p 7007:7007 backstage
  ```

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
