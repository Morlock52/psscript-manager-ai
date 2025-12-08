# Action Item 05: Deployment, Monitoring, and CI/CD (Verified as of 2024-12-25)

## Why this matters
Reliable deployment ensures the multi-service stack (frontend, backend, AI, executor, Postgres, Redis) can be promoted from dev to prod without configuration drift, while monitoring surfaces issues early.

## Current gaps observed
- Multiple deployment scripts exist (`deploy`, `deploy-to-remote.sh`, `Docker-Deployment-Guide.md`), but no single CI workflow to build/test images before pushing.
- Nginx reverse proxy configuration and SSL steps are scattered across docs, leaving room for misconfiguration.

## Plan to fix and improve
1. **Standardize Docker build outputs**
   - Create versioned, multi-stage Dockerfiles per service with small runtime images (Node 20 Alpine / Python slim) and explicit health checks.
   - Add `docker compose build --parallel` as the canonical build command in `DEPLOYMENT.md`.
2. **Introduce CI pipeline**
   - Add GitHub Actions workflow that runs lint/tests for each workspace, builds Docker images, and runs `docker compose -f docker-compose.test.yml up --abort-on-container-exit`.
   - Publish images to a registry (GHCR) tagged with branch and git SHA.
3. **Define promotion steps**
   - Document a staging profile in Compose (separate `.env.staging`) and a production profile with Nginx, SSL certificates (Let’s Encrypt or provided certs), and resource limits.
   - Add a rollback checklist (re-deploy previous tag, restore DB from latest backup).
4. **Monitoring and logging**
   - Integrate structured logging (Winston/JSON for Node, `uvicorn --access-log` for FastAPI) with a log shipper (Filebeat/Vector) to a centralized store.
   - Provide sample Grafana dashboards for request rates, AI latency, and DB health using Prometheus exporters.

## Deployment and verification steps
- **CI**: on every push, GitHub Actions should build images, run tests, and publish artifacts; failures should block deploys.
- **Staging**: `docker compose --profile staging up -d` should bring up Nginx + app services with HTTPS termination using staging certificates.
- **Production**: use `docker compose --profile production pull` followed by `docker compose --profile production up -d` to promote tested images.

## Example snippets
```yaml
# .github/workflows/ci.yml fragment
jobs:
  test-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test -ws --if-present
      - run: docker compose -f docker-compose.test.yml up --abort-on-container-exit
      - run: docker compose build --parallel
```

```bash
# Deploy with explicit profile and env file
ENV_FILE=env/.env.production docker compose --profile production --env-file $ENV_FILE up -d
```
