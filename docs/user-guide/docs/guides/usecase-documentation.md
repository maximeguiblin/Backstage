# Usecase Documentation Guide

This guide explains how usecases can upload their documentation to the Developer Portal storage account and create Developer Portal components to display it using TechDocs.

## Overview

The Sodexo Developer Portal uses **TechDocs** to serve documentation directly within the platform. Documentation is stored in Azure Blob Storage and automatically rendered as part of your component's interface.

## Prerequisites

- Access to the Azure Storage Account configured for the Developer Portal
- Documentation written in Markdown format
- Basic understanding of Developer Portal catalog entities

## Storage Configuration

The Developer Portal instance is configured to use Azure Blob Storage for TechDocs:

- **Container Name**: `documentation`
- **Storage Account**: Configured via `BACKSTAGE_STORAGE_ACCOUNT` environment variable
- **Access**: Managed through `BACKSTAGE_STORAGE_KEY` environment variable

## Step 1: Prepare Your Documentation

### Documentation from AIP WebAPP

If you documentation is already available in the AIP WebApp, it will automatically be pushed and updated in the Developer Portal's storage account and available.

### MkDocs Configuration

Create an `mkdocs.yml` file in your documentation root:

```yaml
site_name: 'Your Usecase Documentation'
site_description: 'Comprehensive documentation for Your Usecase'

nav:
  - Home: index.md
  - Getting Started: getting-started.md
  - API Reference: api-reference.md
  - Troubleshooting: troubleshooting.md

plugins:
  - techdocs-core

theme:
  name: material
  palette:
    primary: blue
```

## Step 2: Upload Documentation to Azure Blob Storage

### Documentation available in AIP WebApp

If the documentation you want to display is already available in the AIP WebApp, you can skip this entire step and go to [Step 3: Create a Developer Portal Component](#step-3-create-a-developer-portal-component), as explained here in Step 1 above (see "Documentation from AIP WebAPP" section).

### Manual Upload Method

1. **Build the documentation**:

The Developer Portal uses techdocs to display documentation files. This is why using techdocs-cli to build your documentation is advised.

   ```bash
   npx @techdocs/cli generate --source-dir YOUR_SOURCE_DIR --output-dir YOUR_OUTPUT_DIR
   ```

2. **Upload to Azure Blob Storage**:
   - Navigate to the Azure Storage Account in the Azure Portal
   - Go to the `documentation` container
   - Create a folder structure: `default/component/your-component-name/`
   - Upload your built documentation files to this path

### Automated Upload via CI/CD

For automated uploads, you can use the AIP CLI in your pipeline:

```bash
# Example from the existing pipeline
aip core docs push \
  --account_name ${BACKSTAGE_STORAGE_ACCOUNT} \
  --datastore documentation \
  --path_in_datastore default/component/your-component-name/ \
  --path_local docs/your-local-path/ \
  --overwrite true
```

### Expected Storage Path Structure

Your documentation should be uploaded to:
```
documentation/
└── default/
    └── component/
        └── your-component-name/
            ├── techdocs_metadata.json
            ├── index.html
            ├── getting-started/
            ├── api-reference/
            └── assets/
                └── stylesheets/
```

## Step 3: Create a Developer Portal Component

### Component Definition

Create a `catalog-info.yaml` file to define your component:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: your-usecase-component
  description: Documentation for Your Usecase
  annotations:
    # This tells the Developer Portal where to find your documentation
    backstage.io/techdocs-ref: dir:default/component/your-usecase-component/
spec:
  type: documentation
  lifecycle: experimental
  owner: your-team
```

Please note that the 'name' must match 'your-usecase-component'. For example, if I have a component 'default/component/my-awesome-component' then the name must be 'my-awesome-component'.

### Key Configuration Elements

- **`name`**: Unique identifier for your component (must match the storage path)
- **`backstage.io/techdocs-ref`**: Points to your documentation location in Azure Blob Storage
- **`type: documentation`**: Specifies this is a documentation component
- **`owner`**: Your team or group name

## Step 4: Register Your Component

### Add to Existing Catalog File

Add your component definition to one of the existing catalog files:
- `src/backstage/sodexo/aip-catalog.yaml` (for AIP-related documentation)
- `src/backstage/sodexo/4site-catalog.yaml` (for 4Site-related documentation)
- Create a new catalog file for your usecase

## Step 5: Verify Documentation Display

1. Navigate to your component in the Developer Portal catalog
2. Click on the "Docs" tab
3. Your documentation should be rendered using the TechDocs interface

## Examples from Existing Components

### AIP Documentation Component
```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: aip_aip-manuals
  description: Documentation for the AIP
  annotations:
    backstage.io/techdocs-ref: dir:default/component/aip_aip-manuals/
spec:
  type: documentation
  lifecycle: experimental
  owner: aip-team
```

### 4Site Documentation Component
```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: 4-site_4site
  description: Documentation for 4Site
  annotations:
    backstage.io/techdocs-ref: dir:default/component/4-site_4site/
spec:
  type: documentation
  lifecycle: experimental
  owner: 4site-team
  subcomponentOf: 4Site
```

## Best Practices

1. **Naming Convention**: Use descriptive, unique names for your components
2. **Documentation Structure**: Follow standard MkDocs conventions
3. **Regular Updates**: Keep your documentation current with your usecase
4. **Access Control**: Ensure proper permissions for your storage account access
5. **Testing**: Test your documentation locally before uploading

## Troubleshooting

### Common Issues

1. **Documentation not displaying**: 
   - Check the `backstage.io/techdocs-ref` annotation path
   - Verify files are uploaded to the correct Azure Blob Storage location

2. **Build errors**:
   - Ensure `mkdocs.yml` is properly configured
   - Check that all referenced files exist

3. **Access issues**:
   - Verify Azure Storage Account permissions
   - Check environment variables are properly configured

### Getting Help

- Contact the Platform Team for Azure Storage Account access
- Check the Developer Portal logs for detailed error messages
- Refer to the [official TechDocs documentation](https://backstage.io/docs/features/techdocs/)

## Environment Variables Reference

The following environment variables are used for Azure Blob Storage integration:

- `BACKSTAGE_STORAGE_ACCOUNT`: Azure Storage Account name
- `BACKSTAGE_STORAGE_KEY`: Azure Storage Account access key
- `BACKSTAGE_STORAGE_HOST`: Storage account host URL
- `BACKSTAGE_STORAGE_REPORT_SAS_TOKEN`: SAS token for report access