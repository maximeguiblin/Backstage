# API Reference

This page provides detailed information about the AIP SDK classes and methods.

## AIPClient

The main client class for interacting with the AI Platform.

### Constructor

```python
AIPClient(
    tenant_id: str = None,
    client_id: str = None,
    client_secret: str = None,
    environment: str = None
)
```

### Methods

#### `authenticate_interactive()`

Authenticates using interactive browser login.

```python
client = AIPClient()
client.authenticate_interactive()
```

#### `get_environment(name: str) -> Environment`

Returns an environment instance.

```python
dev_env = client.get_environment("dev")
```

#### `list_environments() -> List[str]`

Returns a list of available environment names.

```python
environments = client.list_environments()
```

## Environment

Represents an AI Platform environment.

### Methods

#### `list_assets() -> List[Asset]`

Returns all assets in the environment.

```python
assets = env.list_assets()
```

#### `get_asset(name: str) -> Asset`

Returns a specific asset by name.

```python
data_factory = env.get_asset("my-data-factory")
```

#### `create_asset(name: str, type: str, configuration: dict) -> Asset`

Creates a new asset in the environment.

```python
new_asset = env.create_asset(
    name="my-new-asset",
    type="datafactory",
    configuration={
        "location": "West Europe",
        "version": "1.0"
    }
)
```

#### `delete_asset(name: str) -> bool`

Deletes an asset from the environment.

```python
success = env.delete_asset("my-asset")
```

## Asset

Represents an asset in the AI Platform.

### Properties

- `name: str` - The asset name
- `type: str` - The asset type
- `configuration: dict` - The asset configuration
- `status: str` - The current status

### Methods

#### `update_configuration(config: dict) -> bool`

Updates the asset configuration.

```python
success = asset.update_configuration({
    "new_setting": "value"
})
```

#### `get_status() -> str`

Returns the current status of the asset.

```python
status = asset.get_status()
```

## Error Handling

The SDK raises custom exceptions for different error scenarios:

### `AIPAuthenticationError`

Raised when authentication fails.

```python
try:
    client = AIPClient()
    client.authenticate_interactive()
except AIPAuthenticationError as e:
    print(f"Authentication failed: {e}")
```

### `AIPAssetNotFoundError`

Raised when an asset is not found.

```python
try:
    asset = env.get_asset("non-existent-asset")
except AIPAssetNotFoundError as e:
    print(f"Asset not found: {e}")
```

### `AIPConfigurationError`

Raised when there's a configuration issue.

```python
try:
    client = AIPClient()
except AIPConfigurationError as e:
    print(f"Configuration error: {e}")
``` 