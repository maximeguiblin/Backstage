# backstage

This repository contains the source code for a backstage based developer portal

This project package was initiated based on Sodexo AI Platform Cookiecutter project template.


## Setup working environment

Before installing & running, you must setup your working environment by running the following steps:

* Open the URL and log in with your AZ account https://azeuvs1gct987.visualstudio.com/_usersSettings/tokens
* Generate an Azure Devops Personal Access Token by selecting "All accessible organizations" and at least the permission "Read" under section "Packaging"
* Copy the generated token and put it into the following command in replacement of the string REPLACE_BY_TOKEN :

  ```
  $ export PIP_EXTRA_INDEX_URL=https://build:REPLACE_BY_TOKEN@sdxcloud.pkgs.visualstudio.com/_packaging/AIP-feed/pypi/simple/
  ```

* Copy the resuling command at the end of your file ~/.bashrc


## Installing

* Clone the project repository
* Install the dependencies of the project into a new virtual environment with Python >= 3.8 (recommending 3.10)

  ```
  $ bash scripts/install_requirements.sh --python_version 3.10
  ```


## How to run

To run, deploy or manage your project in AMLS or Databricks, you will find several commands in the AIP CLI by using the help option:

  ```
  $ aip --help
  ```


## Documentation

The documentation of the project is available in the following links:

Please fill here the links to code and product documentations


## Contributing

* Contribute by committing your changes into a new feature branch
* Run the unit tests and make sure no regression is introduced
* Create a pull request from your feature branch to the develop branch
* Request another team member for approval and merge
