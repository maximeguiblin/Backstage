# Getting Started

This guide will help you get started with the AIP SDK.

## Installation

Install the SDK using pip:

```bash
pip install aipsdk
```

Or install from the Sodexo package feed:

```bash
pip install aipsdk --extra-index-url https://sdxcloud.pkgs.visualstudio.com/_packaging/AIP-feed/pypi/simple/
```

## Configuration

### Environment Variables

Set up the following environment variables:

```bash
export AIP_ENVIRONMENT=dev
export AIP_TENANT_ID=your-tenant-id
export AIP_CLIENT_ID=your-client-id
export AIP_CLIENT_SECRET=your-client-secret
```

### Authentication

The SDK supports multiple authentication methods:

1. **Service Principal Authentication** (Recommended for production)
2. **Interactive Authentication** (For development)

```python
from aipsdk import AIPClient

# Using service principal
client = AIPClient(
    tenant_id="your-tenant-id",
    client_id="your-client-id",
    client_secret="your-client-secret"
)

# Using interactive login
client = AIPClient()
client.authenticate_interactive()
```

## Basic Usage

### Initialize the Client

```python
from aipsdk import AIPClient

client = AIPClient()
```

### Access Environments

```python
# Get a specific environment
dev_env = client.get_environment("dev")
prod_env = client.get_environment("prod")

# List all available environments
environments = client.list_environments()
```

### Work with Assets

```python
# List assets in an environment
assets = dev_env.list_assets()

# Get a specific asset
data_factory = dev_env.get_asset("my-data-factory")

# Create a new asset
new_asset = dev_env.create_asset(
    name="my-new-asset",
    type="datafactory",
    configuration={...}
)
```

## Next Steps

- Read the [API Reference](api-reference.md) for detailed information about all available methods
- Check out the examples in the SDK repository
- Join the AIP team channel for support and questions 