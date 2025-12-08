# Action Item 01: Environment & Configuration Alignment (Verified as of 2024-12-25)

## Why this matters
The repo mixes workspace scripts (`npm run dev`, Docker Compose) and service-level `.env` files. Consistent configuration is required so the backend, AI service, executor, and frontend share the same secrets, URLs, and feature flags when run locally or in containers.

## Current gaps observed
- Root `package.json` runs three services concurrently, but there is no unified `.env.example` covering backend, AI, executor, and frontend values.
- Docker Compose files rely on environment variables that are not centrally documented, increasing drift between local and container runs.

## Plan to fix and improve
1. **Centralize environment contract**
   - Create `/env/.env.example` that lists all required variables (database, Redis, OpenAI keys, JWT secret, frontend API base URLs). Include comments on defaults for local dev.
   - Add service-specific `.env.local` loaders that source from the shared file to avoid duplication.
2. **Normalize service configuration loading**
   - In `src/backend`, ensure `dotenv` loads the shared file early in `index.js` and fails fast if critical keys are missing.
   - Mirror the same pattern for `src/ai` (FastAPI `settings.py`) and `src/executor`.
3. **Align Docker Compose with local dev**
   - Update `docker-compose.yml` to reference the shared env file via `env_file` and remove duplicated inline environment values.
   - Add a `docker-compose.override.yml` example focused on developer overrides (ports, volume mounts).
4. **Document startup matrix**
   - Expand `README.md` with a table that maps each environment variable to the service that consumes it and the default used in Compose.
   - Include quick commands for switching between local-process and containerized runs.

## Deployment and verification steps
- **Local sanity check**: `source env/.env.example && npm run dev` (services should boot without missing-variable errors).
- **Container check**: `docker compose config` should show variables populated from the shared file without undefined placeholders.
- **CI guardrail**: add a lint step that asserts `.env.example` keys match the ones read by each service (e.g., using a small Node script).

## Example snippets
```bash
# Generate a developer env file from the template
cp env/.env.example env/.env.local
# Start all services with shared configuration
source env/.env.local && npm run dev
```

```yaml
# docker-compose.yml excerpt
services:
  backend:
    env_file:
      - ./env/.env.local
    environment:
      NODE_ENV: development
```
