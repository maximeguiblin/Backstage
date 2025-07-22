#!/bin/bash

# Script to build and publish TechDocs documentation to Azure Blob Storage

echo "Building and publishing TechDocs documentation..."

# Check if we're in the right directory
if [ ! -f "app-config.yaml" ]; then
    echo "Error: app-config.yaml not found. Please run this script from the backstage directory."
    exit 1
fi

# Set Azure Storage details
STORAGE_ACCOUNT="aziest1doc001"
CONTAINER_NAME="documentation"
PATH_PREFIX="backstage/tmp"

echo "Storage Account: $STORAGE_ACCOUNT"
echo "Container: $CONTAINER_NAME"
echo "Path: $PATH_PREFIX"

# Check if Azure CLI is available
if ! command -v az &> /dev/null; then
    echo "Azure CLI not found. Please install Azure CLI first."
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

# Create a temporary directory for building docs
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Copy documentation files to temp directory
echo "Copying documentation files..."
cp -r sodexo/sdk-docs/* "$TEMP_DIR/"

# Change to temp directory
cd "$TEMP_DIR"

# Build the documentation using TechDocs
echo "Building documentation..."
npx @techdocs/cli generate --source-dir . --output-dir ./site

if [ $? -ne 0 ]; then
    echo "Error: Failed to build documentation"
    exit 1
fi

# Upload to Azure Blob Storage
echo "Uploading to Azure Blob Storage..."

# Create the container if it doesn't exist
az storage container create --name "$CONTAINER_NAME" --account-name "$STORAGE_ACCOUNT" --auth-mode key --account-key "295PqTgCec9cXl3eyKHG5hFg1lNLAh+laku6ZvbJvkQEEv79bGolTNCtSkbzcTJaSHZLvjSI4fih+AStxTnyRw=="

# Upload all files from the site directory
az storage blob upload-batch \
    --source ./site \
    --destination "$CONTAINER_NAME" \
    --destination-path "$PATH_PREFIX" \
    --account-name "$STORAGE_ACCOUNT" \
    --auth-mode key \
    --account-key "295PqTgCec9cXl3eyKHG5hFg1lNLAh+laku6ZvbJvkQEEv79bGolTNCtSkbzcTJaSHZLvjSI4fih+AStxTnyRw==" \
    --overwrite

if [ $? -eq 0 ]; then
    echo "✅ Documentation successfully uploaded to Azure Blob Storage!"
    echo "📖 You can now access the documentation in Backstage at:"
    echo "   http://localhost:3000/catalog/default/component/GLB.GLB.DataLab.AIPlatform.SDK/docs"
else
    echo "❌ Failed to upload documentation to Azure Blob Storage"
    exit 1
fi

# Clean up
cd - > /dev/null
rm -rf "$TEMP_DIR"

echo "🎉 Documentation build and publish complete!" 