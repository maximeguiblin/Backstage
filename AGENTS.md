# AGENTS.md — Sodexo Developer Portal

Guidance for AI agents and contributors working in this repository.

## Goal / Description

This repository hosts the **Sodexo Developer Portal**, a [Backstage](https://backstage.io)-based internal developer platform for the Sodexo Data Factory organization.

It provides:

- A unified **software catalog** (components, systems, APIs, users, groups)
- **Scaffolder templates** for self-service project and infrastructure creation
- **TechDocs** documentation hosting (Azure Blob Storage)
- **RBAC-based permissions** (permission plugin)
- Integrations with **Azure DevOps**, **SonarQube**, and Azure Blob Storage

The application lives under `src/backstage/` (Node.js 24, Yarn 4, TypeScript monorepo). Deployment is managed via the **AIP CLI** (`aipcli-app`) and Azure Container Apps. CI/CD is defined in `devops/azure_pipelines.yml`.

### Related repositories

| Repository | Role |
|---|---|
| **This repo** (`IST.GLB.GLB.DataFactory_DeveloperPlatform.Backstage`) | Backstage application code, Docker image, deployment config |
| [`IST.GLB.GLB.DataFactory_DeveloperPlatform.BackstageCatalog`](https://dev.azure.com/sdxcloud/IST.GLB.GLB.DataFactory_DeveloperPlatform/_git/IST.GLB.GLB.DataFactory_DeveloperPlatform.BackstageCatalog) | Catalog entities and scaffolder templates (loaded via `type: url` location in `app-config.yaml`) |

Catalog and template changes are made in **BackstageCatalog** and picked up automatically by the running portal — no redeployment of this repo is required for catalog-only updates.

### Key paths

| Path | Purpose |
|---|---|
| `src/backstage/` | Backstage app (frontend, backend, plugins, Sodexo customizations) |
| `src/backstage/app-config.yaml` | Base runtime configuration |
| `src/backstage/app-config.sandbox.yaml` | Local/sandbox overrides (guest auth, SQLite) |
| `src/backstage/app-config.production.yaml` | Production overrides (PostgreSQL, Microsoft SSO) |
| `src/backstage/Dockerfile` | Multi-stage production Docker build |
| `conf/app_config.json` | AIP CLI container and Container App deployment config |
| `conf/infra_params.json` | Sandbox infrastructure parameters |
| `conf/infra_params_SDXDEV.json` | SDX DEV infrastructure parameters |
| `devops/azure_pipelines.yml` | Azure DevOps CI/CD pipeline |
| `docs/user-guide/` | End-user TechDocs (MkDocs) |
| `docs/source/` | Product and technical documentation (Sphinx) |

---

## Delivery model

### Branching model

Two long-lived branches drive deployments:

| Branch | Purpose | Deploys to |
|---|---|---|
| `develop` | Integration / pre-production | **SDX Sandbox** (`azieca0aip001`) |
| `main` | Production release | **SDX DEV** (`azieca2frt001` → `https://developer-portal.dev.sodexonet.com`) |

Workflow:

1. Create a **feature branch** from `develop` (e.g. `feature/787100-template_tags`, `fix/auth-token-refresh`).
2. Open a PR targeting **`develop`**.
3. After review and merge into `develop`, the pipeline deploys to Sandbox automatically.
4. When ready for release, open a PR from **`develop` → `main`**.
5. Merge to `main` triggers build and deployment to SDX DEV.

**Hard rule (enforced in CI):** PRs to `main` are **only** allowed from `develop`. The pipeline job `ValidateSourceBranch` rejects any other source branch.

Feature branches should be short-lived and deleted after merge.

### PR strategy

- **Default target:** `develop` for all feature/fix work.
- **Release target:** `develop` → `main` only, when Sandbox validation is complete.
- **Review:** Request approval from another team member before merging.
- **Pre-merge checks:** Ensure CI passes (lint at minimum; run local tests when changing application logic).
- **Link work items** when the change is driven by an Azure DevOps ticket.

**PR title format:** `[Area] Short imperative description`

Examples:
- `[Catalog] Fix tag validation on azure-patterns template`
- `[Auth] Persist SQLite signing keys across container restarts`
- `[TechDocs] Update user-guide navigation section`

**PR description:** One-line summary, then optional sections for What / Why / How to test. Link related work items.

**Commit style:** Reference the Azure DevOps ticket number in the commit message and write a short description of the changes.

**Catalog-only changes:** If the change is limited to catalog entities or scaffolder templates, make the PR in **BackstageCatalog**, not this repo.

### Release process

Releases follow the `develop` → `main` promotion path. There is no separate tagging step documented today; `CHANGELOG.md` follows Keep a Changelog / SemVer but is maintained manually.

#### Pipeline stages (`devops/azure_pipelines.yml`)

Triggered on pushes/PRs to `main` and `develop`.

| Job | When | Action |
|---|---|---|
| `ValidateSourceBranch` | PR to `main` | Ensures source is `develop` |
| `TestAndBuild` | Always | `yarn install --frozen-lockfile` + `yarn lint:all` |
| `DeploySandbox` | Merge to `develop` (or manual `deploy_sandbox=true`) | `aip app container deploy --all` → Sandbox |
| `BuildForSdxDev` | Merge to `main` (or manual `deploy_sdxdev=true`) | Build Docker image, push to ACR |
| `DeploySdxDev` | After `BuildForSdxDev` | Pull image, push to SDX DEV ACR, `aip -i SDXDEV app container deploy --all --deploy_only` |
| `Doc` | After `TestAndBuild` | Build Sphinx docs, push to Azure Blob (`latest` on main, `merge` on develop) |
| `BuildAndPublishTechDocs` | `main` or `develop` | Generate user-guide TechDocs, publish to Sandbox (develop) or SDX DEV (main) storage |

#### Deployment environments

| Environment | Subscription | Container App | URL |
|---|---|---|---|
| Sandbox | SDX Sandbox | `azieca0aip001` | `https://azieca0aip001.*.northeurope.azurecontainerapps.io` |
| SDX DEV | SDX DEV/TEST | `azieca2frt001` | `https://developer-portal.dev.sodexonet.com` |

---

## Test process

### Prerequisites

- **Node.js** 24
- **Yarn** 4.4+ (via Corepack: `corepack enable && corepack prepare yarn@stable --activate`)
- **Docker** (recommended for full-stack local runs)
- **Python >= 3.10 + uv** (only for AIP CLI deployment commands)

All Backstage commands below run from `src/backstage/`.

### Validate changes locally (without Docker)

```bash
cd src/backstage
yarn install --immutable
yarn lint:all          # ESLint — same check as CI
yarn tsc               # TypeScript compile check
yarn test              # Unit tests (Jest)
yarn test:all          # Unit tests with coverage
yarn test:e2e          # Playwright end-to-end tests
yarn build:all         # Full production build
```

Run the subset relevant to your change. At minimum, run **`yarn lint:all`** before opening a PR; run **`yarn tsc`** and **`yarn test`** when modifying application or plugin code.

### Run locally with Docker (recommended for integration testing)

**Local mode** — SQLite + guest auth, no external DB:

```bash
cd src/backstage
docker build -t backstage -f Dockerfile .

docker run -d \
  --name backstage-local \
  -p 7007:7007 \
  -e USE_PRODUCTION_CONFIG=false \
  -e BACKSTAGE_DEVOPS_TOKEN="<your-azure-devops-pat>" \
  -e BACKSTAGE_SONARQUBE_TOKEN="<your-sonarqube-token>" \
  -e BACKSTAGE_STORAGE_HOST="<storage-host>.blob.core.windows.net" \
  -e BACKSTAGE_STORAGE_ACCOUNT="<storage-account>" \
  -e BACKSTAGE_STORAGE_KEY="<storage-account-key>" \
  -e BACKSTAGE_STORAGE_REPORT_SAS_TOKEN="<sas-token>" \
  -e BACKSTAGE_CLIENT_ID="<your-azure-ad-client-id>" \
  -e BACKSTAGE_CLIENT_SECRET="<your-azure-ad-client-secret>" \
  -e BACKSTAGE_TENANT_ID="<your-azure-ad-tenant-id>" \
  backstage
```

Open **http://localhost:7007**.

**Production mode** — PostgreSQL + Microsoft SSO (closer to deployed environments):

Set `USE_PRODUCTION_CONFIG=true` and provide `PG_*` variables. See `README.md` for the full list.

**Live config iteration:** Mount local files into the container:

```bash
docker run -d -p 7007:7007 \
  -v "$(pwd)/sodexo:/app/sodexo" \
  -v "$(pwd)/app-config.yaml:/app/app-config.yaml" \
  -e USE_PRODUCTION_CONFIG=false \
  backstage
```

**Hot reload (Node, no Docker):**

```bash
cd src/backstage
yarn install
yarn start    # starts frontend + backend dev servers
```

### What to verify by change type

| Change type | Validate |
|---|---|
| Backstage plugins / UI | `yarn lint:all`, `yarn tsc`, `yarn test`, manual check in browser |
| Config (`app-config*.yaml`) | Docker run with appropriate `USE_PRODUCTION_CONFIG`; check startup logs for missing env vars |
| Catalog entities / templates | Change in **BackstageCatalog** repo; verify in portal catalog refresh (no redeploy needed) |
| TechDocs user guide (`docs/user-guide/`) | `npx @techdocs/cli generate --source-dir . --output-dir ./techdocs-user-guide` from `docs/user-guide/` |
| Deployment / infra (`conf/`, Dockerfile) | Pipeline run on `develop` first; confirm Sandbox before promoting to `main` |
| Docker image | `docker build` succeeds; container starts without auth/storage errors in logs |

### CI validation

The pipeline runs on every push/PR to `main` and `develop`:

If you want to test your branch before merging it, you can run the pipeline manually by clicking on the "Run Pipeline" button in the Azure DevOps portal and reference the branch you want to test.

### Common local issues

- **401 on catalog refresh:** `BACKSTAGE_DEVOPS_TOKEN` missing `Code (Read)` scope or access to the catalog repo.
- **Auth plugin startup failure:** Microsoft SSO env vars required when `microsoft` provider is active; use sandbox config (`USE_PRODUCTION_CONFIG=false`) for guest auth locally.
- **JWKS token warnings after container restart:** Stale browser session from a previous container; clear cookies / use incognito and sign in again.
- **Invalid catalog tags:** Backstage tags must match `[a-z0-9+#]` separated by `-`, max 63 chars (fix in BackstageCatalog YAML).

---

## Agent-specific notes

- **Minimize scope:** Match existing conventions in `src/backstage/` (Backstage patterns, Sodexo customizations under `sodexo/`).
- **Do not commit secrets:** Tokens, keys, and SAS values belong in env vars or Key Vault, never in tracked files.
- **Two-repo awareness:** Catalog/template work goes to BackstageCatalog; portal code stays here.
- **Config layering:** Runtime config merges `app-config.yaml` + (`app-config.sandbox.yaml` OR `app-config.production.yaml`) depending on `USE_PRODUCTION_CONFIG`.

---

## Forbidden actions

Agents must **never** perform the following unless the user explicitly requests it in the current conversation:

### Secrets and security

- **Never commit, paste, or log secrets** — PATs, API tokens, storage keys, SAS tokens, client secrets, connection strings, or private keys. Use placeholders (`<your-token>`) in docs, commands, and commit messages.
- **Never write secrets into tracked files** — including `app-config*.yaml`, `.env` files intended for git, README, or AGENTS.md.
- **Never disable or weaken security in production config** — e.g. removing Microsoft SSO, RBAC, or auth policies from `app-config.production.yaml`.
- **Never modify Key Vault secrets or Azure resource permissions** via CLI or portal automation.

### Git and version control

- **Never run destructive git commands** — `git push --force` (especially to `main` or `develop`), `git reset --hard`, `git rebase` that rewrites shared history, or branch deletion on remote.
- **Never skip git hooks** — no `--no-verify`, `--no-gpg-sign`, or equivalent unless explicitly requested.
- **Never amend commits** that were already pushed to remote, or commits not created by the agent in the current session.
- **Never update git config** (`git config` global or local).
- **Never create commits, push, or open PRs** unless the user explicitly asks.

### Deployment and infrastructure

- **Never deploy to Sandbox or SDX DEV** (`aip app container deploy`, pipeline triggers, Container App updates) without explicit user approval.
- **Never merge PRs or complete releases** (`develop` → `main`) on the user's behalf.
- **Never change `conf/infra_params*.json`** or production endpoints unless the task is explicitly about infrastructure.
- **Never point `catalog.locations` in `app-config.yaml` at a temporary feature branch** and leave it there — use `main`/`master` for shared environments.

### Code and repository scope

- **Never make unrelated drive-by changes** — no refactors, formatting sweeps, dependency bumps, or new files outside the requested scope.
- **Never create or edit markdown/documentation files** the user did not ask for (README, CHANGELOG, extra guides).
- **Never put catalog entity or scaffolder template changes in this repo** — those belong in **BackstageCatalog**.
- **Never remove or bypass CI checks** defined in `devops/azure_pipelines.yml` (e.g. branch validation, lint step).

### Runtime and local environment

- **Never run commands that exfiltrate credentials** — e.g. echoing env vars containing tokens into logs or chat output.
- **Never store real credentials in shell history, terminal files, or example commands** shared back to the user.

When in doubt, ask before acting on anything that is irreversible, affects a shared environment, or touches authentication and deployment.
