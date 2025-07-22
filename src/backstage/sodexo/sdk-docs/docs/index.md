# AIP SDK Documentation

Welcome to the AI Platform SDK documentation. This SDK provides a Python library with classes and methods to interact with AI Platform environments and assets from any Python project.

## Overview

The AIP SDK is designed to help developers quickly integrate with the Sodexo Data Factory AI Platform, providing standardized access to:

- Environment management
- Asset configuration
- Data processing workflows
- Security and compliance features

## Quick Start

```python
from aipsdk import AIPClient

# Initialize the client
client = AIPClient()

# Access your environment
env = client.get_environment("dev")

# Work with assets
assets = env.list_assets()
```

## Features

- **Environment Management**: Easily switch between development, staging, and production environments
- **Asset Configuration**: Manage and configure AI Platform assets
- **Security Integration**: Built-in compliance with Sodexo security policies
- **Standardized Workflows**: Pre-built templates for common data processing tasks

## Getting Started

See the [Getting Started](getting-started.md) guide for detailed installation and setup instructions.

## API Reference

For detailed API documentation, see the [API Reference](api-reference.md) section. 