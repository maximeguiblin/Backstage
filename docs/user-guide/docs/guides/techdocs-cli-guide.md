# TechDocs CLI Guide

This guide explains how to use the TechDocs CLI to build and manage documentation for the Sodexo Developer Portal.

## Overview

The TechDocs CLI is a command-line tool that helps you build, preview, and publish documentation for the Developer Portal's TechDocs feature. It's essential when using the "external" builder configuration, as in this Developer Portal instance.

## Installation

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Install TechDocs CLI

```bash
# Install globally
npm install -g @techdocs/cli

# Or install locally in your project
npm install --save-dev @techdocs/cli

# Or use npx (no installation required)
npx @techdocs/cli --help
```

## Basic Commands

### 1. Generate Documentation

Build your documentation from Markdown files:

```bash
# Basic generation
npx @techdocs/cli generate

# Specify source and output directories
npx @techdocs/cli generate --source-dir ./docs --output-dir ./site

# Generate with verbose output
npx @techdocs/cli generate --verbose
```

**Parameters:**
- `--source-dir` (default: `.`): Directory containing your mkdocs.yml and documentation
- `--output-dir` (default: `./site`): Directory where built documentation will be placed
- `--verbose`: Show detailed build information
- `--docker`: Use Docker for building (requires Docker installation)

### 2. Serve Documentation Locally

Preview your documentation locally before publishing:

```bash
# Serve on default port (3000)
npx @techdocs/cli serve

# Serve on custom port
npx @techdocs/cli serve --port 8080

# Serve with auto-rebuild on changes
npx @techdocs/cli serve --watch
```

**Parameters:**
- `--port` (default: `3000`): Port to serve documentation
- `--watch`: Automatically rebuild when files change
- `--verbose`: Show detailed serving information

### 3. Publish Documentation

Upload documentation to external storage (Azure Blob Storage in our case):

```bash
# Publish to configured storage
npx @techdocs/cli publish --publisher-type azureBlobStorage \
  --storage-name <storage-account-name> \
  --azureAccountKey <account-key> \
  --entity <namespace/kind/name>

# Example for our setup
npx @techdocs/cli publish --publisher-type azureBlobStorage \
  --storage-name backstage-docs \
  --azureAccountKey "your-key-here" \
  --entity default/component/backstage-user-guide
```

## Practical Examples

### Example 1: Build User Guide Documentation

```bash
# Navigate to the user guide directory
cd docs/user-guide

# Generate the documentation
npx @techdocs/cli generate --source-dir . --output-dir ./site

# Preview locally
npx @techdocs/cli serve --port 3000
```

### Example 2: Build with Docker (Recommended for Production)

```bash
# Build using Docker for consistent environment
npx @techdocs/cli generate --source-dir . --output-dir ./site --docker

# This ensures the same build environment as production
```

### Example 3: Continuous Development Workflow

```bash
# Start development server with auto-rebuild
npx @techdocs/cli serve --watch --verbose

# In another terminal, make changes to your .md files
# The documentation will automatically rebuild and refresh
```

## Configuration

### MkDocs Configuration Requirements

Your `mkdocs.yml` must include the `techdocs-core` plugin:

```yaml
plugins:
  - techdocs-core
```

### Environment Variables

For publishing, you can set environment variables instead of command-line parameters:

```bash
# Azure Blob Storage configuration
export AZURE_ACCOUNT_NAME="your-storage-account"
export AZURE_ACCOUNT_KEY="your-account-key"

# Then publish without specifying credentials
npx @techdocs/cli publish --publisher-type azureBlobStorage \
  --entity default/component/your-component
```

## Integration with CI/CD

### Azure DevOps Pipeline Example

```yaml
# azure-pipelines.yml
steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '16.x'
    displayName: 'Install Node.js'

  - script: |
      npm install -g @techdocs/cli
      cd docs/user-guide
      npx @techdocs/cli generate --source-dir . --output-dir ./site
    displayName: 'Build Documentation'

  - script: |
      npx @techdocs/cli publish --publisher-type azureBlobStorage \
        --storage-name $(BACKSTAGE_STORAGE_ACCOUNT) \
        --azureAccountKey $(BACKSTAGE_STORAGE_KEY) \
        --entity default/component/backstage-user-guide
    displayName: 'Publish Documentation'
```

### GitHub Actions Example

```yaml
# .github/workflows/docs.yml
name: Build and Publish Docs
on:
  push:
    paths:
      - 'docs/**'

jobs:
  build-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          
      - name: Install TechDocs CLI
        run: npm install -g @techdocs/cli
        
      - name: Build Documentation
        run: |
          cd docs/user-guide
          npx @techdocs/cli generate --source-dir . --output-dir ./site
          
      - name: Publish to Azure Blob Storage
        run: |
          npx @techdocs/cli publish --publisher-type azureBlobStorage \
            --storage-name ${{ secrets.AZURE_STORAGE_ACCOUNT }} \
            --azureAccountKey ${{ secrets.AZURE_STORAGE_KEY }} \
            --entity default/component/backstage-user-guide
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Problem**: `mkdocs build` command fails
```bash
# Check MkDocs configuration
npx @techdocs/cli generate --verbose

# Validate mkdocs.yml syntax
python -m mkdocs build --strict
```

**Solutions**:
- Ensure `mkdocs.yml` is valid YAML
- Check that all referenced files exist
- Verify `techdocs-core` plugin is included

#### 2. Missing Dependencies

**Problem**: Missing Python or MkDocs dependencies
```bash
# Install Python dependencies
pip install mkdocs mkdocs-material mkdocs-techdocs-core

# Or use Docker to avoid dependency issues
npx @techdocs/cli generate --docker
```

#### 3. Publishing Errors

**Problem**: Cannot publish to Azure Blob Storage
```bash
# Verify credentials
az storage account show --name <storage-account-name>

# Test connection
az storage blob list --account-name <name> --account-key <key> --container-name documentation
```

**Solutions**:
- Verify Azure Storage Account credentials
- Check container permissions
- Ensure the container exists

#### 4. Local Preview Issues

**Problem**: Documentation doesn't display correctly locally
```bash
# Clear cache and rebuild
rm -rf ./site
npx @techdocs/cli generate --source-dir . --output-dir ./site
npx @techdocs/cli serve --port 3001
```

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
# Enable debug output
DEBUG=@techdocs/cli* npx @techdocs/cli generate --verbose

# Or set log level
npx @techdocs/cli generate --log-level debug
```

## Best Practices

### 1. Development Workflow
- Use `serve --watch` during development for live reloading
- Test builds locally before pushing to production
- Use Docker builds for consistency with production environment

### 2. Production Builds
- Always use `--docker` flag for production builds
- Validate documentation with `--strict` mode
- Use environment variables for sensitive credentials

### 3. Performance Optimization
- Minimize large images and assets
- Use efficient Markdown structure
- Consider documentation size for build performance

### 4. Version Control
- Include `site/` directory in `.gitignore`
- Version control your `mkdocs.yml` configuration
- Document your build process in README files

## Advanced Usage

### Custom Plugins

Add custom MkDocs plugins to your configuration:

```yaml
# mkdocs.yml
plugins:
  - techdocs-core
  - search
  - minify:
      minify_html: true
```

### Multiple Documentation Sites

Manage multiple documentation sites:

```bash
# Build different documentation sets
npx @techdocs/cli generate --source-dir ./docs/api --output-dir ./api-site
npx @techdocs/cli generate --source-dir ./docs/user-guide --output-dir ./guide-site
```

### Automated Quality Checks

```bash
# Check for broken links
npx @techdocs/cli generate --source-dir . --output-dir ./site
# Add link checking tools to your pipeline
```

## Resources

- [TechDocs CLI Documentation](https://backstage.io/docs/features/techdocs/cli)
- [MkDocs Documentation](https://www.mkdocs.org/)
- [Material Theme Documentation](https://squidfunk.github.io/mkdocs-material/)
- [Backstage TechDocs Guide](https://backstage.io/docs/features/techdocs/)

---

*For questions about TechDocs CLI usage, consult the official Backstage documentation or contact the Platform Team.*
