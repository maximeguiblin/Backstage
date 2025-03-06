# Configuration

The configuration files are:

- Infra configurations: conf/infra_params.json
- ML configuration: conf/ml_config.json
- Project configuration: conf/project_params.json


## Infra configuration

The files conf/infra_params*.json contain the configuration of the infrastructure hosting and processing the data of the project.

As a data-scientist you should not edit those files.

For information, they are used in ML configuration as a sourcing file of infrastructure parameters.


## ML configuration

The conf/ml_config.json defines the AMLS assets that are used into the project: experiments, pipelines, compute targets, environments, ...


## Project configuration

This is a custom configuration specific to the project.

You can add there the parameters of your project related to training for example.
