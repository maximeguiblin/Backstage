#!/bin/bash

# Simple script to build TechDocs documentation without npx issues

echo "Building TechDocs documentation (simple approach)..."

# Check if we're in the right directory
if [ ! -f "app-config.yaml" ]; then
    echo "Error: app-config.yaml not found. Please run this script from the backstage directory."
    exit 1
fi

# Go to the documentation directory
cd sodexo/sdk-docs

echo "Building documentation from: $(pwd)"

# Check if mkdocs.yml exists
if [ ! -f "mkdocs.yml" ]; then
    echo "Error: mkdocs.yml not found in sodexo/sdk-docs/"
    exit 1
fi

# Install TechDocs CLI locally if not already installed
if [ ! -d "../node_modules/@techdocs" ]; then
    echo "Installing TechDocs CLI locally..."
    cd ..
    npm install --save-dev @techdocs/cli
    cd sodexo/sdk-docs
fi

# Build the documentation using local installation
echo "Running TechDocs build with local installation..."
../node_modules/.bin/techdocs-cli generate --source-dir . --output-dir ./test-build

if [ $? -eq 0 ]; then
    echo "✅ Documentation build successful!"
    echo "📁 Built files are in: sodexo/sdk-docs/test-build/"
    
    # List the built files
    echo "📄 Built files:"
    ls -la test-build/
    
    # Check if index.html exists
    if [ -f "test-build/index.html" ]; then
        echo "✅ index.html found - documentation is ready!"
        echo ""
        echo "🎉 Documentation build completed successfully!"
        echo "📖 You can now view the documentation in Backstage at:"
        echo "   http://localhost:3000/catalog/default/component/sdk-documentation/docs"
    else
        echo "⚠️  index.html not found in build output"
    fi
else
    echo "❌ Documentation build failed"
    exit 1
fi 