# Queue Sentinel

Queue Sentinel is a Reddit Devvit moderation workbench for noisy mod queues. Sprint 2 moves the demo from a local-only mock interface to typed server-backed persistence contracts with safe demo seeding.

The eventual product will help moderators collapse duplicate reports into explainable incident cards, rank queue pressure, and keep all enforcement decisions human-in-the-loop. Sprint 2 still does not ingest live Reddit data or perform real moderation actions.

## Sprint Status

- Sprint: `2 - Persistence, API, and Demo Seeding`
- Branch: `sprint-2-persistence-api-demo-seeding`
- Devvit pattern: Devvit Web with `src/client`, `src/server`, and `src/shared`
- Data: safe demo incidents through typed API routes, Redis when available, memory fallback otherwise
- Moderation actions: disabled placeholders only; internal status updates affect Queue Sentinel state only

## Requirements

- Node.js `>=22.2.0`
- npm
- Reddit Devvit CLI access through the `devvit` package

## Commands

Install dependencies:

```bash
npm install
```

Run the Devvit playtest workflow:

```bash
npm run login
npm run dev
```

Run a browser-only shell preview for UI review:

```bash
npm run dev:shell
```

Then open the Vite URL and navigate to `/src/client/app.html` if Vite does not open the nested entry automatically. The browser-only shell falls back to local demo data when the Devvit server API is unavailable.

Build the Devvit bundle:

```bash
npm run build
```

Run static checks:

```bash
npm run type-check
npm run lint
npm run test
```

Run all quality gates:

```bash
npm run check
```

Publish later, after review and real Devvit app setup:

```bash
npm run deploy
npm run launch
```

## Implemented

- Devvit-compatible `devvit.json` and Vite build setup.
- Responsive Queue Sentinel workbench with Dashboard, Incidents, Case Card, Metrics, and Settings views.
- Ten safe demo incidents with typed contracts, tags, signal labels, review guidance, and timeline events.
- Hono server app with typed `/api/health`, `/api/incidents`, `/api/incidents/:id`, `/api/incidents/:id/status`, `/api/incidents/:id/metadata`, `/api/demo/seed`, and `/api/demo/reset` routes.
- `incidentStore` abstraction with Redis adapter and memory fallback for list, detail, upsert, internal status, metadata, seed, and reset operations.
- API-first client loading with refresh, loading/error/empty states, fallback demo data, and Settings seed/reset controls.
- Internal status updates that persist through the store without enabling Reddit enforcement actions.
- `priorityScoring` boundary with placeholder scoring behavior only.
- Documentation for architecture, sprint notes, PR review, and demo safety boundaries.
- Store, route, smoke, and workbench helper tests.
- GitHub Actions CI for install, type-check, lint, test, and build.

## Not Implemented Yet

- Real Reddit ingestion.
- Real incident clustering.
- Real priority scoring.
- Approve, remove, lock, ban, escalation, or other live moderation actions.
- Reddit event triggers or webhooks.
- External Slack, Discord, webhook, or analytics integrations.
- AI-generated moderation decisions.

## Project Layout

```text
src/
  client/   React app shell, API client, hooks, components, pages, and CSS
  server/   Hono app, API routes, Devvit menu handler, and store adapters
  shared/   Shared constants, demo data, API types, and TypeScript contracts
tests/      Smoke, store, route, and workbench helper tests
docs/       Architecture, sprint notes, and PR review checklist
```

## Pull Request Evidence

For ChatGPT review, include:

- PR title and summary.
- Changed file tree.
- Output from `npm install`, `npm run build`, `npm run type-check`, `npm run lint`, and `npm run test`.
- Screenshot or short description of the visible app shell.
- Notes on store mode, browser-shell fallback behavior, and any Devvit playtest limitations.
