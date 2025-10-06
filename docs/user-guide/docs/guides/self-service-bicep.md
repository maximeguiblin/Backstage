# Azure Bicep Template Self-Service Guide

This guide explains how to use the Azure Bicep template in the Sodexo Developer Portal to provision Azure resources in the SDX Sandbox environment.

## Overview

The Azure Bicep template is a self-service tool that allows you to provision pre-configured Azure resource patterns in the SDX Sandbox environment. It leverages Azure Bicep templates and Azure DevOps pipelines to automate the deployment process.

## What is Azure Bicep?

Azure Bicep is a domain-specific language (DSL) that uses declarative syntax to deploy Azure resources. It provides a more concise and readable alternative to ARM templates while offering the same capabilities.

## Prerequisites

- Access to the SDX Sandbox environment
- An existing Azure Resource Group
- Appropriate permissions in Azure DevOps
- Understanding of your infrastructure requirements

## Available Resource Patterns

The template offers two main patterns for different use cases:

### Pattern 1: Azure Databricks Pattern (`pattern_sandbox_adb`)
**Includes:**
- Azure Databricks workspace
- Azure Storage Account
- Azure Key Vault
- Azure Application Insights

**Best for:** Data engineering, ETL processes, big data analytics, and collaborative data science workflows.

### Pattern 2: Azure Machine Learning Pattern (`pattern_sandbox_amls`)
**Includes:**
- Azure Machine Learning workspace
- Azure Storage Account
- Azure Key Vault
- Azure Container Registry
- Azure Application Insights

**Best for:** Machine learning model development, training, deployment, and MLOps workflows.

## Additional Resources

You can enhance your base pattern with additional resources:

- **Azure Databricks**: Additional Databricks workspace (if not included in base pattern)
- **Azure Data Factory**: For data integration and ETL pipelines
- **Azure Data Lake**: For large-scale data storage and analytics

## Step-by-Step Usage Guide

### Step 1: Access the Template

1. Navigate to your Sodexo Developer Portal instance
2. Go to the **"Create"** section
3. Find and select **"Provisioning resources in SDX Sandbox"**

### Step 2: Configure Basic Parameters

#### Resource Group
- **Field**: `resource_group`
- **Description**: Name of your existing Azure Resource Group
- **Example**: `rg-myproject-sandbox-001`
- **Note**: The resource group must already exist in your Azure subscription

#### Resource Suffix
- **Field**: `resource_suffix`
- **Description**: 6-character suffix for naming your resources
- **Requirements**: Exactly 6 characters (letters and numbers)
- **Example**: `proj01`, `test01`, `dev001`
- **Purpose**: Ensures unique resource names and helps with organization

#### Pattern Selection
- **Field**: `pattern`
- **Options**:
  - **Pattern 1**: Azure Databricks + Storage + Key Vault + App Insights
  - **Pattern 2**: Azure ML + Storage + Key Vault + Container Registry + App Insights
- **Choose based on**: Your primary use case (data engineering vs. machine learning)

### Step 3: Configure Additional Resources

#### Extra Resources
- **Field**: `extra_resources`
- **Type**: Multi-select checkboxes
- **Options**:
  - **None**: No additional resources
  - **Azure Databricks**: Add Databricks workspace
  - **Azure Data Factory**: Add data integration capabilities
  - **Azure Data Lake**: Add large-scale data storage
- **Note**: Select only what you need to optimize costs

### Step 4: Authentication Configuration

#### User Login Identity
- **Field**: `user_login`
- **Options**:
  - **Yes**: Use your personal Azure credentials for provisioning
  - **No**: Use Developer Portal service identity for provisioning
- **Recommendation**: Choose "Yes" if you have sufficient permissions
- **Warning**: Selecting "No" may cause pipeline failures due to insufficient permissions

### Step 5: Repository Configuration

#### Project Repository URL
- **Field**: `project_repository_url`
- **Description**: URL where infrastructure configuration files will be pushed
- **Format**: `https://sdxcloud.visualstudio.com/IST.GLB.GLB.DataFactory_DeveloperPlatform/_git/your-project`

### Step 6: Key Vault Configuration

#### Automatic Parameter Configuration
- **Field**: `configure_params`
- **Options**:
  - **Yes**: Automatically configure infrastructure parameters in Key Vault
  - **No**: Manual configuration using Post-Deployment template
- **Recommendation**: Choose "Yes" for automated setup

### Step 7: Execute the Template

1. Review all your configurations
2. Click **"Create"** to trigger the deployment
3. Click on **"Show logs"** to find the URL of the pipeline
4. The template will:
   - Validate your parameters
   - Trigger Azure DevOps Pipeline (ID: 8986)
     - If you selected "Yes" for user_login, you will need to authenticate when prompted in the pipeline
   - Deploy resources using Bicep templates
   - Configure Key Vault parameters (if selected)

## What Happens Behind the Scenes

### Pipeline Execution
1. **Validation**: Parameters are validated against Azure requirements
2. **Authentication**: Uses your selected authentication method
3. **Bicep Deployment**: Executes Bicep templates to create resources
4. **Configuration**: Sets up Key Vault secrets and parameters
5. **Repository Update**: Pushes configuration files (if repository URL provided)

### Resource Naming Convention
Resources are named using the pattern: `{resource-type}-{suffix}`

**Examples with suffix `proj01`:**
- Storage Account: `aziest1proj01`
- Key Vault: `aziekv1proj01`
- Databricks: `aziedb1proj01`
- Machine Learning: `azieml1proj01`

## Monitoring Your Deployment

### Azure DevOps Pipeline
- **Pipeline ID**: 8986
- **Organization**: sdxcloud
- **Project**: IST.GLB.GLB.DataFactory_DeveloperPlatform
- **Branch**: main

### Tracking Progress
1. After triggering the template, note the pipeline run ID
2. Navigate to Azure DevOps to monitor progress
3. Check the pipeline logs for detailed execution information
4. Verify resource creation in the Azure Portal

## Post-Deployment Steps

### Verify Resource Creation
1. **Azure Portal**: Check your resource group for new resources
2. **Resource Access**: Ensure you have appropriate permissions
3. **Key Vault**: Verify secrets and parameters are configured
4. **Networking**: Check if any additional network configuration is needed

### Configuration Files
If you provided a repository URL:
1. Check your repository for new infrastructure configuration files under the `feature/init_bicep_TIMESTAMP` branch
2. Review the generated Bicep templates
3. Update any environment-specific parameters

## Best Practices

### Resource Naming
- Use descriptive, consistent suffixes
- Follow your organization's naming conventions

### Security
- Use your own identity when possible for better audit trails
- Regularly rotate Key Vault secrets
- Apply principle of least privilege for resource access

### Cost Management
- Only select additional resources you actually need
- Monitor resource usage regularly
- Consider resource lifecycle and cleanup policies

### Documentation
- Document your resource configuration decisions
- Keep track of deployed resources and their purposes
- Maintain infrastructure documentation alongside code

## Troubleshooting

### Common Issues

#### Permission Errors
**Problem**: Pipeline fails with permission errors
**Solution**: 
- Ensure you have Contributor access to the resource group
- Verify your Azure DevOps permissions
- Try using your own identity instead of Developer Portal identity
- Verify all fields in the template are referenced

#### Resource Group Not Found
**Problem**: Specified resource group doesn't exist
**Solution**:
- Verify the resource group name is correct
- Ensure the resource group exists in the correct subscription
- Check you have access to the resource group

#### Naming Conflicts
**Problem**: Resources already exist with the same names
**Solution**:
- Use a different 6-character suffix
- Check if resources were created in a previous deployment
- Clean up any conflicting resources if safe to do so
    - Note that there is a 90 days retention time on KeyVault instances so if you delete a KeyVault named `aziekv1dev001` you will not be able to name another KeyVault with the same name for 90 days

#### Pipeline Timeout
**Problem**: Pipeline execution takes too long or times out
**Solution**:
- Check Azure service health status
- Verify no resource locks are preventing deployment
- Contact platform team if issues persist

### Getting Help

#### Platform Team Support
- Contact the platform team for Azure subscription issues
- Request additional permissions if needed
- Report template bugs or enhancement requests

#### Azure DevOps Pipeline Logs
- Check detailed logs in Azure DevOps for specific error messages
- Look for Bicep compilation errors
- Review resource deployment status

#### Azure Portal
- Monitor resource group activity logs
- Check deployment history
- Verify resource configurations

## Advanced Usage

### Custom Bicep Templates
For advanced users who need custom resource configurations:
1. Fork the infrastructure repository
2. Modify Bicep templates as needed
3. Update pipeline references
4. Test thoroughly in development environment

### Integration with Other Templates
The Bicep template can be combined with other Developer Portal templates:
- Use with the Infrastructure Configuration template for post-deployment setup
- Combine with repository templates for complete project setup
- Integrate with monitoring and alerting templates

## Environment Variables and Configuration

The template uses the following Azure DevOps pipeline configuration:
- **Organization**: sdxcloud
- **Project**: IST.GLB.GLB.DataFactory_DeveloperPlatform
- **Pipeline ID**: 8986
- **Branch**: main

## Related Templates

- **Infrastructure Configuration Template**: For post-deployment parameter configuration
- **Azure Patterns Template**: For more complex multi-region deployments
- **AIP Template**: For AIP-specific resource provisioning

## Feedback and Improvements

The Azure Bicep template is continuously improved based on user feedback:
- Report issues or enhancement requests to the platform team
- Contribute to template improvements through pull requests
- Share best practices and usage patterns with the community
