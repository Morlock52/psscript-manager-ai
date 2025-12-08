# Action Item 04: Frontend API Alignment & UX Guardrails (Verified as of 2024-12-25)

## Why this matters
The React frontend must align with backend route shapes and handle errors gracefully to keep uploads, analysis triggers, and search usable even when downstream services hiccup.

## Current gaps observed
- The monorepo scripts start the frontend with Vite, but there is limited guidance on configuring API base URLs or feature flags (voice, AI chat) per environment.
- Error surfacing for failed analyses is not documented, risking silent failures in production.

## Plan to fix and improve
1. **Centralize API client configuration**
   - Add `src/frontend/src/config/api.ts` that reads `VITE_API_BASE_URL` and `VITE_AI_BASE_URL` with sane defaults for localhost and Docker.
   - Ensure Axios instances include auth headers and request IDs for traceability.
2. **Tighten React Query usage**
   - Wrap uploads and analysis mutations with `onError` handlers that raise toast notifications and log details to the console in dev mode.
   - Add query keys for scripts, analyses, and embeddings to avoid stale cache usage after uploads/deletions.
3. **Improve UX fallbacks**
   - Provide placeholder states for empty script lists and analysis pending states, ensuring the UI communicates progress.
   - Add retry affordances (e.g., "Retry analysis" button) that call the hardened backend routes.
4. **Documentation and examples**
   - Update `src/frontend/README.md` with environment variable examples and a quick-start section for interacting with the backend mock AI.
   - Include a short snippet demonstrating how to call the `/health/ai` endpoint and render status in a status badge.

## Deployment and verification steps
- **Local**: `npm run dev -w psscript-frontend` should read base URLs from `.env.local` without manual code edits.
- **E2E**: run `npm run test:ui` (or `test-website-puppeteer.js`) after triggering a mock analysis to confirm errors render as toasts instead of silent failures.
- **Container**: verify the frontend uses the Nginx reverse proxy paths (`/api`, `/ai`) when `VITE_API_BASE_URL` is undefined.

## Example snippets
```typescript
// src/frontend/src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
export const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL ?? '/ai';
```

```tsx
// Sample status badge component
const AiStatus: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery(['ai-health'], () => axios.get(`${AI_BASE_URL}/health`));
  if (isLoading) return <span>Checking AI…</span>;
  if (error) return <button onClick={() => refetch()}>Retry AI</button>;
  return <span className="text-green-600">AI OK ({data.data.latency} ms)</span>;
};
```
