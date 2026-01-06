# Action Item 03: Backend ↔ AI Service Integration Hardening (Verified as of 2024-12-25)

## Why this matters
Script analysis, embeddings, and chat features rely on reliable calls from the Node.js backend to the Python AI service. Transient failures or schema mismatches can break uploads and analysis UX.

## Current gaps observed
- Multiple helper scripts (`test-ai`, `test-openai-assistant`) exist, but no unified health check between backend and AI service.
- Error handling in backend routes is not documented, increasing the risk of unhandled AI timeouts or payload mismatches.

## Plan to fix and improve
1. **Define a typed contract**
   - Add a `src/backend/src/clients/ai-client.ts` with TypeScript interfaces for requests/responses (analysis, embeddings, chat).
   - Mirror the schema in the FastAPI Pydantic models to ensure symmetry.
2. **Create health and readiness probes**
   - Implement `/health/ai` in the backend that pings the AI `/health` endpoint and reports latency.
   - Add a startup guard that blocks analysis routes until the AI service responds successfully.
3. **Harden error handling and retries**
   - Wrap outbound calls with timeouts and exponential backoff using `axios` interceptors.
   - Map common failures (429, 5xx) to user-friendly messages surfaced in the frontend.
4. **Add contract tests**
   - Write integration tests (`jest` or `supertest`) that spin up the mock AI service (`src/mock-ai-service.js`) to validate payloads and error paths.
   - Include these tests in the CI workflow and in `test-all-fixes.sh`.

## Deployment and verification steps
- **Local**: run `npm run test:ai-contract` (new script) to validate the backend works against the mock AI.
- **Container**: `docker compose up` should expose `/health/ai` returning HTTP 200 with latency under target threshold.
- **Observability**: add Winston logs with correlation IDs for each AI call to trace failures in production.

## Example snippets
```typescript
// src/backend/src/clients/ai-client.ts
export interface AnalyzeRequest { scriptId: string; content: string; }
export interface AnalyzeResponse { rating: number; summary: string; threats: string[]; }

export async function analyzeScript(req: AnalyzeRequest) {
  const response = await axios.post(`${AI_BASE_URL}/analyze`, req, { timeout: 15000 });
  return response.data as AnalyzeResponse;
}
```

```bash
# Run backend against mock AI for contract testing
node src/mock-ai-service.js &
AI_BASE_URL=http://localhost:5050 npm run test -- workspace=psscript-backend -- tests/ai-contract.test.ts
```
