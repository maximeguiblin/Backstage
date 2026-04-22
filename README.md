# Sodexo Developer Portal

Backstage-based developer portal for the Sodexo Data Factory organization. It provides a unified software catalog, scaffolder templates, TechDocs, RBAC-based permissions, and integrations with Azure DevOps, self-hosted SonarQube, and SonarCloud.

## Software Catalog

Catalog entities and scaffolder templates are maintained in a **separate repository**:
[`IST.GLB.GLB.DataFactory_DeveloperPlatform.BackstageCatalog`](https://dev.azure.com/sdxcloud/IST.GLB.GLB.DataFactory_DeveloperPlatform/_git/IST.GLB.GLB.DataFactory_DeveloperPlatform.BackstageCatalog)

The Backstage instance loads a `type: url` location pointing to the root `catalog-info.yaml` in that repo. That file is a `kind: Location` entity whose targets reference all individual catalog and template files. Changes pushed to the catalog repo are picked up automatically — no redeployment of this instance is needed. See the BackstageCatalog repo README for the full list of files and how to add new entities or templates.

## Prerequisites

- **Node.js** 20 or 22
- **Yarn** 4.4+ (via Corepack)
- **Docker** (for containerized runs)
- **Python** >= 3.10 + **uv** (only for AIP CLI deployment commands)

## Run Locally Using Docker

### Build the Docker Image

```bash
cd src/backstage
docker build -t backstage -f Dockerfile .
```

Rebuild with cache (fast, recommended after first build):
```bash
docker build -t backstage -f Dockerfile .
```

Clean rebuild without cache:
```bash
docker build --no-cache -t backstage -f Dockerfile .
```

### Running Modes

The application supports two modes controlled by the `USE_PRODUCTION_CONFIG` environment variable.

#### Local Mode (SQLite + guest auth)

Uses an in-memory SQLite database and guest authentication. No external dependencies required.

```bash
docker run -d \
  --name backstage-local \
  -p 7007:7007 \
  -e USE_PRODUCTION_CONFIG=false \
  -e BACKSTAGE_DEVOPS_TOKEN="<your-azure-devops-pat>" \
  -e BACKSTAGE_SONARQUBE_TOKEN="<your-sonarqube-token>" \
  -e BACKSTAGE_SONARCLOUD_TOKEN="<your-sonarcloud-token>" \
  -e BACKSTAGE_STORAGE_HOST="<storage-host>" \
  -e BACKSTAGE_STORAGE_ACCOUNT="<storage-account>" \
  -e BACKSTAGE_STORAGE_KEY="<storage-key>" \
  -e BACKSTAGE_STORAGE_REPORT_SAS_TOKEN="<sas-token>" \
  backstage
```

Open **http://localhost:7007** in a browser.

#### Production Mode (PostgreSQL + Microsoft SSO)

Uses Azure PostgreSQL for persistent storage and Microsoft Entra ID for authentication.

```bash
docker run -d \
  --name backstage-prod \
  -p 7007:7007 \
  -e USE_PRODUCTION_CONFIG=true \
  -e PG_HOST="<host>.postgres.database.azure.com" \
  -e PG_PORT="5432" \
  -e PG_USER="<db-user>" \
  -e PG_PASSWORD="<db-password>" \
  -e PG_DATABASE="<db-name>" \
  -e BACKSTAGE_CLIENT_ID="<azure-ad-client-id>" \
  -e BACKSTAGE_CLIENT_SECRET="<azure-ad-client-secret>" \
  -e BACKSTAGE_TENANT_ID="<azure-ad-tenant-id>" \
  -e BACKSTAGE_DEVOPS_TOKEN="<your-azure-devops-pat>" \
  -e BACKSTAGE_SONARQUBE_TOKEN="<your-sonarqube-token>" \
  -e BACKSTAGE_SONARCLOUD_TOKEN="<your-sonarcloud-token>" \
  -e BACKSTAGE_STORAGE_HOST="<storage-host>" \
  -e BACKSTAGE_STORAGE_ACCOUNT="<storage-account>" \
  -e BACKSTAGE_STORAGE_KEY="<storage-key>" \
  -e BACKSTAGE_STORAGE_REPORT_SAS_TOKEN="<sas-token>" \
  backstage
```

To connect to a local PostgreSQL instance from inside Docker, use `host.docker.internal` as `PG_HOST`.

### Environment Variables

| Variable | When Required | Description |
|----------|---------------|-------------|
| `USE_PRODUCTION_CONFIG` | Always | `true` for PostgreSQL + SSO, `false` for SQLite + guest auth |
| `PG_HOST` | Production | PostgreSQL hostname |
| `PG_PORT` | Production | PostgreSQL port (default `5432`) |
| `PG_USER` | Production | PostgreSQL username |
| `PG_PASSWORD` | Production | PostgreSQL password |
| `PG_DATABASE` | Production | PostgreSQL database name |
| `BACKSTAGE_CLIENT_ID` | Production | Microsoft Entra ID application client ID |
| `BACKSTAGE_CLIENT_SECRET` | Production | Microsoft Entra ID application client secret |
| `BACKSTAGE_TENANT_ID` | Production | Microsoft Entra ID tenant ID |
| `BACKSTAGE_DEVOPS_TOKEN` | Always | Azure DevOps Personal Access Token |
| `BACKSTAGE_SONARQUBE_TOKEN` | Always | SonarQube API token (self-hosted instance) |
| `BACKSTAGE_SONARCLOUD_TOKEN` | When using SonarCloud | User token from [SonarCloud security](https://sonarcloud.io/account/security) for the `sonarcloud` instance in `app-config.yaml` |
| `BACKSTAGE_STORAGE_HOST` | Always | Azure Blob Storage hostname for TechDocs |
| `BACKSTAGE_STORAGE_ACCOUNT` | Always | Azure Storage account name |
| `BACKSTAGE_STORAGE_KEY` | Always | Azure Storage account key |
| `BACKSTAGE_STORAGE_REPORT_SAS_TOKEN` | Always | SAS token for report access |

### Useful Docker Commands

```bash
# View logs
docker logs -f backstage-local

# Stop container
docker stop backstage-local

# Remove container
docker rm backstage-local

# Clean up unused images
docker system prune -a --volumes
docker rmi $(docker images -f "dangling=true" -q)

# Mount local files for live development
docker run -d \
  -p 7007:7007 \
  -v "$(pwd)/sodexo:/app/sodexo" \
  -v "$(pwd)/app-config.yaml:/app/app-config.yaml" \
  -e USE_PRODUCTION_CONFIG=false \
  backstage
```

### Troubleshooting

**Port 7007 already in use:**
```bash
lsof -ti:7007 | xargs kill -9
```

**Cannot connect to PostgreSQL:**
- Ensure PostgreSQL is running
- Use `host.docker.internal` instead of `localhost` for local databases
- Check firewall rules for Azure PostgreSQL

**401 Unauthorized errors:**
- Verify `BACKEND_SECRET` is set in production mode
- Check Azure DevOps token permissions

**TechDocs not loading:**
- Verify Azure Storage credentials
- Check SAS token expiration date

### Architecture

The Docker image uses a multi-stage build for optimization:
1. **Stage 1 (packages)**: Extracts package.json files
2. **Stage 2 (build)**: Installs dependencies and compiles TypeScript
3. **Stage 3 (final)**: Creates minimal runtime image with production dependencies only

The final image includes:
- Node.js 22 (Bookworm Slim)
- Compiled Backstage backend bundle
- Production dependencies only

Both frontend and backend run on **port 7007** in a monolithic setup.

## Deploy in Azure

### Setup working environment

Before deploying in Azure, you must set up your working environment by running the following steps:

* Open the URL and log in with your AZ account https://azeuvs1gct987.visualstudio.com/_usersSettings/tokens
* Generate an Azure DevOps Personal Access Token by selecting "All accessible organizations" and at least the permission "Read" under section "Packaging"
* Install and use uv auth (or set env var => `export UV_EXTRA_INDEX_URL=https://build:YOUR_PAT@sdxcloud.pkgs.visualstudio.com/_packaging/AIP-feed/pypi/simple/`):

  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="${HOME}/.local/bin:${HOME}/.cargo/bin:${PATH}"
  echo "YOUR_PAT" | uv auth login --username build --password - sdxcloud.pkgs.visualstudio.com
  ```

### Installing

* Clone the project repository
* Install the dependencies with **uv** (Python >= 3.10). This creates a virtual environment and installs the `aip` CLI.

  ```bash
  uv sync --all-extras
  ```

* To (re)generate the lock file (`uv.lock`), ensure PPP auth is configured then run `uv lock` and commit the file for reproducible installs. The first run of `scripts/install_requirements.sh` with PPP auth will also create `uv.lock` if it is missing.

### How to deploy

To deploy in Azure Container Apps, you can use the command:

  ```
  $ aip app container deploy
  ```

### Deployment Environments

| Environment | Subscription | Container App | URL |
|-------------|-------------|---------------|-----|
| Sandbox | SDX Sandbox | `azieca0aip001` | `https://azieca0aip001.*.northeurope.azurecontainerapps.io` |
| SDX DEV | SDX DEV/TEST | `azieca2frt001` | `https://developer-portal.dev.sodexonet.com` |

## Documentation

The documentation of the project is available in the following links: To be filled

Please fill here the links to code and product documentations

## Contributing

* Contribute by committing your changes into a new feature branch
* Run the unit tests and make sure no regression is introduced
* Create a pull request from your feature branch to the develop branch
* Request another team member for approval and merge
