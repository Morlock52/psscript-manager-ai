# Action Item 02: Database Migrations & pgvector Readiness (Verified as of 2024-12-25)

## Why this matters
The platform depends on PostgreSQL with `pgvector` for semantic search. Without consistent migrations and seeding, services can diverge in schema expectations, causing runtime failures when uploading or analyzing scripts.

## Current gaps observed
- Multiple migration scripts exist (e.g., `run-migration.js`, `run-script-analysis-migration.sh`), but there is no single ordered migration history or automated seeding flow.
- `docker-compose.yml` provisions Postgres but does not guarantee the pgvector extension is created before application boot.

## Plan to fix and improve
1. **Adopt a single migration toolchain**
   - Use `sequelize-cli` migrations for the backend and place them under `src/backend/migrations` with timestamped filenames.
   - Provide a wrapper script (`npm run db:migrate`) that runs inside both local and container contexts.
2. **Enforce pgvector setup**
   - Add an idempotent migration that executes `CREATE EXTENSION IF NOT EXISTS vector;` on startup.
   - Gate backend startup with a connectivity check that validates the extension is present.
3. **Seed deterministic data**
   - Convert ad-hoc seed scripts into `sequelize-cli` seeders for categories, demo users, and sample scripts used in tests (`test-data.csv`).
   - Add a `npm run db:seed` entry point that can be called after migrations.
4. **Schema contract tests**
   - Implement a `npm run db:check` script that asserts critical tables/columns exist (scripts, analyses, embeddings, users).
   - Wire this check into CI so schema drift is caught before deploy.

## Deployment and verification steps
- **Local**: `npm run db:migrate && npm run db:seed` inside `src/backend` should complete without errors on a fresh database.
- **Container**: `docker compose run --rm backend npm run db:migrate` should succeed with pgvector enabled.
- **Smoke test**: upload a sample script via `test-upload.sh` and confirm embeddings are created without SQL errors.

## Example snippets
```bash
# Inside src/backend
npm install --save-dev sequelize-cli
npx sequelize-cli migration:generate --name add-embeddings-table
npm run db:migrate && npm run db:seed
```

```sql
-- Migration fragment to ensure pgvector
CREATE EXTENSION IF NOT EXISTS vector;
```
