# Sodexo Developer Portal User Guide

Welcome to the comprehensive user guide for the Sodexo Developer Portal. This guide provides step-by-step instructions for using the self-service templates and features available in the Sodexo Developer Portal.

## Overview

The Sodexo Developer Portal is your central hub for managing data science and machine learning projects within the Sodexo Data Factory ecosystem. It provides self-service templates, documentation management, and infrastructure automation to streamline your development workflow.

## Quick Start

New to the Sodexo Developer Portal? Start here:

1. **[Navigation and Filters](guides/navigation-and-filters.md)** - Find your team's components using Developer Portal filters
2. **[Documentation Management](guides/usecase-documentation.md)** - Learn how to upload and display your project documentation
3. **[Repository Creation](guides/self-service-repo.md)** - Initialize new projects with standardized templates
4. **[Infrastructure Provisioning](guides/self-service-bicep.md)** - Deploy Azure resources for your projects
5. **[TechDocs CLI Guide](guides/techdocs-cli-guide.md)** - Build and manage documentation using TechDocs CLI

## Getting Started with the Sodexo Developer Portal

### Navigation and Discovery
**[Navigation and Filters Guide](guides/navigation-and-filters.md)**

Learn how to effectively navigate the Sodexo Developer Portal and find your team's components, services, and documentation using filters and search.

**Key Features:**
- Filter by owner, type, and lifecycle stage
- Advanced search techniques and text filtering
- Component relationship discovery
- Team-specific navigation workflows

**Best for:** All users who need to find and explore components in the Developer Portal catalog

---

## Available Self-Service Templates & Guides

### Documentation Management
**[Usecase Documentation Guide](guides/usecase-documentation.md)**

Learn how to upload your documentation to the Developer Portal's storage account and create components to display it using TechDocs.

**Key Features:**
- Upload documentation to Azure Blob Storage
- Create Developer Portal components with documentation references
- Integrate with MkDocs for professional documentation rendering
- Automatic synchronization from AIP WebApp

**Best for:** Teams wanting to centralize and standardize their project documentation

---

### Infrastructure Provisioning
**[Azure Bicep Template Guide](guides/self-service-bicep.md)**

Provision Azure resources in the SDX Sandbox environment using pre-configured Bicep templates.

**Key Features:**
- Two main patterns: Azure Databricks and Azure Machine Learning
- Additional resources: Data Factory, Data Lake, extra Databricks
- Automated Key Vault configuration
- Integration with existing resource groups

**Best for:** Teams needing standardized Azure infrastructure for data science and ML projects

---

### Repository Initialization
**[Azure Repository Template Guide](guides/self-service-repo.md)**

Initialize new project repositories with the AI Platform CookieCutter template structure.

**Key Features:**
- Standardized project structure using CookieCutter
- Multiple infrastructure types (Databricks, ML, Applications)
- Integration with AI Platform ecosystem (CLI, SDK, WebApp)
- Customizable project metadata and licensing

**Best for:** Teams starting new data science or ML projects and wanting a standardized foundation

---

### Technical Documentation
**[TechDocs CLI Guide](guides/techdocs-cli-guide.md)**

Learn how to use the TechDocs CLI to build, preview, and publish documentation for the Sodexo Developer Portal.

**Key Features:**
- Build documentation from Markdown files
- Local preview with live reloading
- Publish to Azure Blob Storage
- CI/CD integration examples

**Best for:** Technical users who need to build and manage documentation locally or in automated pipelines

## Platform Components

### AI Platform Integration
The templates integrate seamlessly with the AI Platform ecosystem:

- **AIP CLI**: Command-line interface for platform interactions
- **AIP SDK**: Software development kit for AI Platform services  
- **AIP WebApp**: Web application for project management and documentation
- **Standardized Templates**: Consistent project structures and best practices

### Azure Integration
The Sodexo Developer Portal connects with Azure services to provide:

- **Azure DevOps**: Pipeline automation and repository management
- **Azure Blob Storage**: Documentation and artifact storage
- **Azure Resource Management**: Infrastructure provisioning and configuration
- **Azure Key Vault**: Secure parameter and secret management

## Getting Started Workflow

### For New Projects

1. **Plan Your Infrastructure**
   - Determine if you need Databricks, Machine Learning, or both
   - Identify required additional resources (Data Factory, Data Lake)
   - Ensure you have an existing Azure Resource Group

2. **Create Your Repository**
   - Use the [Repository Template](guides/self-service-repo.md) to initialize your project
   - Choose the appropriate infrastructure type
   - Configure project metadata and team information

3. **Provision Infrastructure**
   - Use the [Bicep Template](guides/self-service-bicep.md) to deploy Azure resources
   - Select the pattern that matches your repository's infrastructure type
   - Configure authentication and Key Vault parameters

4. **Set Up Documentation**
   - Follow the [Documentation Guide](guides/usecase-documentation.md) to create your project docs
   - Upload documentation to Developer Portal storage
   - Create Developer Portal components for easy access

### For Existing Projects

1. **Add Documentation**
   - Use the [Documentation Guide](guides/usecase-documentation.md) to integrate existing docs
   - Create Developer Portal components to display your documentation
   - Migrate from existing documentation systems

2. **Standardize Infrastructure**
   - Review your current Azure resources
   - Use the [Bicep Template](guides/self-service-bicep.md) to standardize configurations
   - Migrate to managed infrastructure patterns

3. **Organize Repository Structure**
   - Consider using the [Repository Template](guides/self-service-repo.md) structure as a reference
   - Adopt AI Platform standards and best practices
   - Integrate with platform tools and services

## Best Practices

### Project Organization
- Use consistent naming conventions across all components
- Follow Sodexo standards for project structure and documentation
- Maintain clear separation between development, testing, and production environments
- Document your project's purpose, architecture, and usage instructions

### Security and Compliance
- Use your own identity for authentication when possible for better audit trails
- Regularly rotate Key Vault secrets and access keys
- Apply principle of least privilege for resource access
- Follow Sodexo security policies and guidelines

### Collaboration
- Keep documentation updated and accessible to all team members
- Use standardized templates to ensure consistency across projects
- Share best practices and lessons learned with other teams
- Participate in platform improvement initiatives

### Cost Management
- Only provision resources you actually need
- Monitor resource usage and costs regularly
- Clean up unused or temporary resources
- Consider resource lifecycle and cleanup policies

## Support and Resources

### Getting Help
- **Platform Team**: Contact for infrastructure and template issues
- **AI Platform Documentation**: Comprehensive guides for AIP tools and services
- **Azure DevOps Support**: For pipeline and repository management issues
- **Community**: Share knowledge and best practices with other users

### Additional Resources
- [AI Platform Documentation](https://aip.datalab.sodexo.com/)
- [Azure DevOps Organization](https://dev.azure.com/sdxcloud)
- [Backstage Official Documentation](https://backstage.io/docs)
- [Azure Bicep Documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/)

### Feedback and Improvements
- Report issues or enhancement requests to the platform team
- Contribute to template improvements through pull requests
- Share usage patterns and best practices
- Participate in user feedback sessions and surveys

## Troubleshooting

### Common Issues
- **Permission Errors**: Ensure you have appropriate access to Azure resources and DevOps projects
- **Template Failures**: Check parameter validation and format requirements
- **Authentication Issues**: Verify your credentials and try using personal identity instead of service accounts
- **Resource Conflicts**: Use unique naming and check for existing resources

### Quick Solutions
- Review template logs for specific error messages
- Verify all required parameters are provided and correctly formatted
- Check Azure service health and DevOps status
- Contact platform team for persistent issues

---

## What's Next?

Ready to get started? Choose the guide that best fits your current needs:

- **New to the platform?** Start with [Repository Creation](guides/self-service-repo.md)
- **Need infrastructure?** Go to [Infrastructure Provisioning](guides/self-service-bicep.md)  
- **Want to add documentation?** Check out [Documentation Management](guides/usecase-documentation.md)

For questions or support, don't hesitate to reach out to the platform team or consult the additional resources listed above.

---

*This user guide is maintained by the Platform Team and updated regularly. Last updated: October 2025*
