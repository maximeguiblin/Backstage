# Azure Repository Template Self-Service Guide

This guide explains how to use the Azure Repository template in the Sodexo Developer Portal to initialize a new project repository with the AIP (AI Platform) CookieCutter template structure.

## Overview

The Azure Repository template is a self-service tool that creates a new project repository with a standardized structure based on the AI Platform CookieCutter template. It provides a consistent foundation for data science and machine learning projects within the Sodexo Data Factory ecosystem.

## What is CookieCutter?

CookieCutter is a command-line utility that creates projects from templates. The AIP CookieCutter template provides a standardized project structure with pre-configured files, folders, and configurations optimized for AI Platform workflows.

## Prerequisites

- Access to Azure DevOps organization (sdxcloud)
- Permissions to create repositories in the target project
- Understanding of your project's infrastructure requirements
- Valid Azure subscription and resource group for infrastructure integration

## Step-by-Step Usage Guide

### Step 1: Access the Template

1. Navigate to your Sodexo Developer Portal instance
2. Go to the **"Create"** section
3. Find and select **"Initialize a project repository with CookieCutter template"**

### Step 2: Configure CookieCutter Parameters

#### Author Information

**Author Name**
- **Field**: `author_name`
- **Description**: Name of the author or team responsible for the project
- **Default**: "Data Factory"
- **Example**: "Data Science Team", "Analytics Department"

**Author Email**
- **Field**: `author_email`
- **Description**: Contact email for the project team
- **Default**: "nicolas.marchand@sodexo.com"
- **Example**: "datascience@sodexo.com", "your.team@sodexo.com"

#### Project Configuration

**Project Name**
- **Field**: `project_name`
- **Description**: Full name of the project
- **Default**: "GLB.GLB.DataLab.AIPlatform"
- **Example**: "GLB.GLB.DataLab.CustomerAnalytics"
- **Format**: Follow Sodexo naming conventions

**Project Slug**
- **Field**: `project_slug`
- **Description**: Short identifier used for CookieCutter template processing
- **Default**: "test_dummy_project"
- **Example**: "customer_analytics", "sales_forecasting"
- **Requirements**: Use underscores, lowercase letters, and numbers only

**Project Short Description**
- **Field**: `project_short_description`
- **Description**: Brief description of the project's purpose
- **Default**: "This repository contains all the structure code you need to create a AIP Project compatible with Sodexo Data Factory AI Platform."
- **Example**: "Customer behavior analysis and segmentation for marketing optimization"

#### Infrastructure Type Selection

**Project Infrastructure**
- **Field**: `project_infra`
- **Description**: Choose the target infrastructure type for your project
- **Options**:
  - **`adb`**: Azure Databricks - For big data processing and collaborative analytics
  - **`aml`**: Azure Machine Learning - For traditional ML workflows and model management
  - **`aml2`**: Azure Machine Learning v2 - For modern MLOps and advanced ML capabilities
  - **`app`**: Application - For web applications and API services
  - **`all`**: All Infrastructure Types - For projects requiring multiple infrastructure components

#### Use Case Configuration

**Use Case Name**
- **Field**: `usecase_name`
- **Description**: Specific name for the business use case
- **Default**: "test_dummy_project"
- **Example**: "customer_churn_prediction", "inventory_optimization"

**Version**
- **Field**: `version`
- **Description**: Initial version of the project
- **Default**: "0.1.0"
- **Format**: Follow semantic versioning (MAJOR.MINOR.PATCH)

#### Licensing

**Code License**
- **Field**: `code_license`
- **Description**: License type for the project code
- **Options**:
  - **SODEXO license** (Default) - Internal Sodexo projects
  - **MIT license** - Open source permissive license
  - **BSD license** - Open source permissive license
  - **ISC license** - Open source permissive license
  - **Apache Software License 2.0** - Open source with patent protection
  - **GNU General Public License v3** - Copyleft open source license

#### Additional Features

**Add Notebooks**
- **Field**: `add_notebooks`
- **Description**: Include Jupyter notebooks in the project structure
- **Options**:
  - **`n`** (Default): No notebooks - For production code projects
  - **`y`**: Include notebooks - For data exploration and experimentation

### Step 3: Configure Infrastructure Parameters

#### Repository Configuration

**Project Repository URL**
- **Field**: `project_repository_url`
- **Description**: Target repository URL where the CookieCutter output will be pushed
- **Format**: `https://sdxcloud.visualstudio.com/PROJECT/_git/REPOSITORY_NAME`
- **Example**: `https://sdxcloud.visualstudio.com/GLB.GLB.DataLab.AIPlatform/_git/my-new-project`
- **Note**: The repository should already exist or be created beforehand

#### Azure Configuration

**Subscription**
- **Field**: `subscription`
- **Description**: Azure subscription ID for resource retrieval
- **Format**: GUID format (e.g., `12345678-1234-1234-1234-123456789012`)
- **Purpose**: Links the project to specific Azure resources

**Resource Group**
- **Field**: `resource_group`
- **Description**: Azure Resource Group containing the project's infrastructure
- **Example**: `rg-myproject-dev-001`
- **Note**: Must exist and contain the necessary resources for your infrastructure type

#### Authentication

**User Login Identity**
- **Field**: `user_login`
- **Description**: Choose authentication method for resource retrieval
- **Options**:
  - **"false"**: Use Developer Portal service identity (may have limited permissions)
  - **"true"**: Use your personal Azure credentials (recommended for better access)

### Step 4: Execute the Template

1. Review all your configurations carefully
2. Click **"Create"** to trigger the repository initialization
3. Click on **"Show logs"** to find the pipeline URL for monitoring
4. The template will:
   - Validate your parameters
   - Prompt for Azure login if using personal credentials
   - Trigger Azure DevOps Pipeline (ID: 8853)
   - Generate project structure using CookieCutter
   - Push the generated code to your specified repository
   - Configure project metadata and settings

## What Happens Behind the Scenes

### Pipeline Execution
1. **Parameter Validation**: All inputs are validated against requirements
2. **CookieCutter Processing**: Template is processed with your parameters
3. **Code Generation**: Project structure is created with customized content
4. **Repository Push**: Generated code is pushed to your target repository
5. **Infrastructure Integration**: Project is linked to specified Azure resources

### Generated Project Structure

The CookieCutter template creates a standardized structure including:

```
your-project/
├── .gitignore                 # Git ignore patterns
├── README.md                  # Project documentation
├── pyproject.toml            # Python project configuration
├── requirements.txt          # Python dependencies
├── src/                      # Source code directory
│   └── your_project/         # Main project package
├── tests/                    # Test files
├── docs/                     # Documentation
├── notebooks/                # Jupyter notebooks (if selected)
├── config/                   # Configuration files
├── data/                     # Data directories
└── scripts/                  # Utility scripts
```

### Infrastructure-Specific Content

Based on your selected `project_infra` type:

#### Azure Databricks (`adb`)
- Databricks notebooks and configurations
- Spark job definitions
- Cluster configuration templates
- Data pipeline scripts

#### Azure Machine Learning (`aml`/`aml2`)
- ML pipeline definitions
- Model training scripts
- Experiment configurations
- Deployment templates

#### Application (`app`)
- Web application structure
- API endpoint definitions
- Docker configurations
- Deployment scripts

#### All Infrastructure (`all`)
- Combined structure with all components
- Multi-environment configurations
- Comprehensive deployment options

## Monitoring Your Repository Creation

### Azure DevOps Pipeline
- **Pipeline ID**: 8853
- **Organization**: sdxcloud
- **Project**: GLB.GLB.DataLab.AIPlatform
- **Branch**: master

### Tracking Progress
1. Note the pipeline run ID from the Developer Portal logs
2. Navigate to Azure DevOps to monitor execution
3. Check pipeline logs for detailed progress information
4. Verify repository creation and code push completion

## Post-Creation Steps

### Verify Repository Content
1. **Repository Access**: Ensure you can access the newly created repository
2. **Code Structure**: Review the generated project structure
3. **Configuration Files**: Check that all configuration files are properly customized
4. **Dependencies**: Verify that requirements and dependencies are correctly specified

### Initial Setup
1. **Clone Repository**: Clone the repository to your local development environment
2. **Environment Setup**: Follow the generated README instructions for environment setup
3. **Dependencies Installation**: Install required dependencies using the provided requirements
4. **Configuration**: Update any environment-specific configurations

### Integration with AI Platform
1. **AIP CLI Setup**: Configure AIP CLI for your project
2. **Resource Connections**: Verify connections to Azure resources
3. **Authentication**: Set up authentication for AI Platform services
4. **Testing**: Run initial tests to ensure everything works correctly

## Best Practices

### Project Naming
- Use descriptive, meaningful names that reflect the project's purpose
- Follow Sodexo naming conventions consistently
- Consider including business domain or department identifiers
- Use consistent naming across project_name, project_slug, and usecase_name

### Infrastructure Selection
- Choose the infrastructure type that best matches your project requirements
- Consider future scalability and integration needs
- Start with specific types (`adb`, `aml`, `aml2`, `app`) rather than `all` unless necessary
- Align infrastructure choice with your team's expertise and tools

### Repository Management
- Ensure the target repository exists before running the template
- Use meaningful repository names that align with project naming
- Set up appropriate branch protection rules after creation
- Configure repository permissions according to your team structure

### Documentation
- Customize the generated README with project-specific information
- Keep documentation updated as the project evolves
- Include setup instructions for new team members
- Document any deviations from the standard template structure

## Troubleshooting

### Common Issues

#### Repository Access Errors
**Problem**: Cannot access or push to the specified repository
**Solutions**:
- Verify the repository URL is correct and accessible
- Ensure you have write permissions to the target repository
- Check that the repository exists in the specified Azure DevOps project
- Try using your personal credentials instead of Developer Portal identity

#### CookieCutter Template Errors
**Problem**: Template generation fails or produces incorrect structure
**Solutions**:
- Verify all required parameters are provided
- Check that project_slug follows naming conventions (lowercase, underscores)
- Ensure infrastructure type is valid for your use case
- Review parameter values for special characters or invalid formats

#### Pipeline Execution Failures
**Problem**: Azure DevOps pipeline fails during execution
**Solutions**:
- Check pipeline logs for specific error messages
- Verify Azure subscription and resource group permissions
- Ensure the target repository is accessible from the pipeline
- Contact platform team if authentication issues persist

#### Infrastructure Integration Issues
**Problem**: Generated project cannot connect to Azure resources
**Solutions**:
- Verify subscription and resource group parameters are correct
- Check that specified resources exist and are accessible
- Ensure proper authentication configuration
- Review infrastructure type compatibility with existing resources

### Getting Help

#### Platform Team Support
- Contact the platform team for repository creation issues
- Request assistance with Azure DevOps permissions
- Report template bugs or enhancement requests

#### AI Platform Documentation
- Refer to AIP documentation for platform-specific guidance
- Check AIP CLI documentation for command usage
- Review AIP SDK documentation for integration details

#### Azure DevOps Support
- Check Azure DevOps service health for platform issues
- Review organization and project settings
- Verify repository and pipeline permissions

## Advanced Usage

### Custom Template Modifications
For teams requiring customized project structures:
1. Fork the CookieCutter template repository
2. Modify template files according to your needs
3. Update pipeline references to use your custom template
4. Test thoroughly before using in production

### Integration with Other Templates
The Repository template works well with other Developer Portal templates:
- Use after the Azure Bicep template to create infrastructure
- Combine with monitoring templates for observability setup
- Integrate with CI/CD templates for automated deployments

### Batch Repository Creation
For creating multiple similar projects:
1. Document your standard parameter values
2. Create parameter templates for different project types
3. Use consistent naming conventions across projects
4. Consider automation scripts for bulk operations

## Environment Variables and Configuration

The template uses the following Azure DevOps configuration:
- **Organization**: sdxcloud
- **Project**: GLB.GLB.DataLab.AIPlatform
- **Pipeline ID**: 8853
- **Branch**: master

## Related Templates and Tools

- **Azure Bicep Template**: For infrastructure provisioning
- **Infrastructure Configuration Template**: For post-deployment setup
- **AIP Infrastructure Check Template**: For validating project infrastructure
- **AIP CLI**: Command-line tool for AI Platform interactions
- **AIP SDK**: Software development kit for platform integration

## Feedback and Improvements

The Azure Repository template is continuously improved:
- Report issues or enhancement requests to the platform team
- Contribute to template improvements through pull requests
- Share best practices and usage patterns with the community
- Participate in template review and update processes
