# Developer portal with Backstage

This repository contains the source code for a backstage based developer portal

This project package was initiated based on Sodexo AI Platform Cookiecutter project template.


## Run Locally Using Docker

### Building the Docker Image

Navigate to the Backstage directory and build the image:

```bash
cd src/backstage
docker build -t backstage -f Dockerfile .
```

**Fast rebuild with cache** (recommended after first build):
```bash
docker build -t backstage -f Dockerfile .
```

**Clean rebuild without cache** (use only if needed):
```bash
docker build --no-cache -t backstage -f Dockerfile .
```

### Running Modes

The application supports two deployment modes:

#### 1. **Local Mode** (SQLite - Development)
Uses an in-memory SQLite database. Perfect for local testing without external dependencies.

```bash
docker run -d \
  --name backstage-local \
  -p 7007:7007 \
  -e USE_PRODUCTION_CONFIG=false \
  -e BACKSTAGE_DEVOPS_TOKEN="<your-token>" \
  -e BACKSTAGE_SONARQUBE_TOKEN="<your-token>" \
  -e BACKSTAGE_STORAGE_HOST="<storage-host>" \
  -e BACKSTAGE_STORAGE_ACCOUNT="<storage-account>" \
  -e BACKSTAGE_STORAGE_KEY="<storage-key>" \
  -e BACKSTAGE_STORAGE_REPORT_SAS_TOKEN="<sas-token>" \
  backstage
```

Access the application at: **http://localhost:7007**

#### 2. **Production Mode** (PostgreSQL)
Uses Azure PostgreSQL database for persistent storage.

```bash
docker run -d \
  --name backstage-prod \
  -p 7007:7007 \
  -e USE_PRODUCTION_CONFIG=true \
  -e POSTGRES_HOST="<your-host>.postgres.database.azure.com" \
  -e POSTGRES_PORT="5432" \
  -e POSTGRES_USER="<your-user>" \
  -e POSTGRES_PASSWORD="<your-password>" \
  -e BACKEND_SECRET="<your-secret>" \
  -e BACKSTAGE_DEVOPS_TOKEN="<your-token>" \
  -e BACKSTAGE_SONARQUBE_TOKEN="<your-token>" \
  -e BACKSTAGE_STORAGE_HOST="<storage-host>" \
  -e BACKSTAGE_STORAGE_ACCOUNT="<storage-account>" \
  -e BACKSTAGE_STORAGE_KEY="<storage-key>" \
  -e BACKSTAGE_STORAGE_REPORT_SAS_TOKEN="<sas-token>" \
  backstage
```

**For local PostgreSQL testing**, use `host.docker.internal`:
```bash
-e POSTGRES_HOST="host.docker.internal"
```

### Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `USE_PRODUCTION_CONFIG` | No | Set to `false` for SQLite, `true` for PostgreSQL | `false` |
| `POSTGRES_HOST` | Prod only | PostgreSQL hostname | `azieps1aip001.postgres.database.azure.com` |
| `POSTGRES_PORT` | Prod only | PostgreSQL port | `5432` |
| `POSTGRES_USER` | Prod only | Database user | `sdxpostgreadminuser` |
| `POSTGRES_PASSWORD` | Prod only | Database password | `<secure-password>` |
| `BACKEND_SECRET` | Prod only | Backend auth secret | `<random-secret>` |
| `BACKSTAGE_DEVOPS_TOKEN` | Yes | Azure DevOps PAT | `<your-pat-token>` |
| `BACKSTAGE_SONARQUBE_TOKEN` | Yes | SonarQube token | `squ_...` |
| `BACKSTAGE_STORAGE_HOST` | Yes | Azure Blob Storage host | `aziest1doc001.blob.core.windows.net` |
| `BACKSTAGE_STORAGE_ACCOUNT` | Yes | Storage account name | `aziest1doc001` |
| `BACKSTAGE_STORAGE_KEY` | Yes | Storage account key | `<storage-key>` |
| `BACKSTAGE_STORAGE_REPORT_SAS_TOKEN` | Yes | SAS token for reports | `sp=r&st=...` |

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

The final image is ~2.1GB and includes:
- Node.js 22 (Bookworm Slim)
- Compiled Backstage backend bundle
- Production dependencies only
- Local catalog files (`sodexo/*.yaml`)

Both frontend and backend run on **port 7007** in a monolithic setup


## Deploy in Azure


### Setup working environment

Before deploying in Azure, you must setup your working environment by running the following steps:

* Open the URL and log in with your AZ account https://azeuvs1gct987.visualstudio.com/_usersSettings/tokens
* Generate an Azure Devops Personal Access Token by selecting "All accessible organizations" and at least the permission "Read" under section "Packaging"
* Copy the generated token and put it into the following command in replacement of the string REPLACE_BY_TOKEN :

  ```
  $ export PIP_EXTRA_INDEX_URL=https://build:REPLACE_BY_TOKEN@sdxcloud.pkgs.visualstudio.com/_packaging/AIP-feed/pypi/simple/
  ```

* Copy the resuling command at the end of your file ~/.bashrc


### Installing

* Clone the project repository
* Install the dependencies of the project into a new virtual environment with Python >= 3.8 (recommending 3.10)

  ```
  $ bash scripts/install_requirements.sh --python_version 3.10
  ```


### How to deploy

To deploy in Azure Container Apps, you can use the command:

  ```
  $ aip app container deploy
  ```


## Documentation

The documentation of the project is available in the following links: To be filled

Please fill here the links to code and product documentations


## Contributing

* Contribute by committing your changes into a new feature branch
* Run the unit tests and make sure no regression is introduced
* Create a pull request from your feature branch to the develop branch
* Request another team member for approval and merge
