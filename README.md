# Queue Sentinel

Queue Sentinel is a Reddit Devvit moderation workbench for noisy mod queues. Sprint 3 adds deterministic incident clustering and explainable priority scoring over safe synthetic demo signals.

The eventual product will help moderators collapse duplicate reports into explainable incident cards, rank queue pressure, and keep all enforcement decisions human-in-the-loop. Sprint 3 still does not ingest live Reddit data or perform real moderation actions.

## Sprint Status

- Sprint: `3 - Clustering and Priority Scoring`
- Branch: `sprint-3-clustering-priority-scoring`
- Base: stacked on `sprint-2-persistence-api-demo-seeding` until Sprint 2 is merged into `main`
- Devvit pattern: Devvit Web with `src/client`, `src/server`, and `src/shared`
- Data: safe synthetic queue signals and scored demo incidents only
- Moderation actions: disabled placeholders only; scoring output is triage context, not an enforcement decision

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

Then open the Vite URL and navigate to `/src/client/app.html` if Vite does not open the nested entry automatically. The browser-only shell falls back to deterministic local scoring over the synthetic demo signal set when the Devvit server API is unavailable.

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

## Implemented

- Devvit-compatible `devvit.json` and Vite build setup.
- Responsive Queue Sentinel workbench with Dashboard, Incidents, Case Card, Metrics, and Settings views.
- Ten safe demo incidents and a separate synthetic `QueueSignal` dataset.
- Deterministic clustering over exact item, thread/rule, domain/rule, author/rule, and rule-area time-window signals with safety-adjacent isolation.
- Explainable priority scoring with numeric score, priority label, confidence label, factor contributions, and model version `sprint-3-deterministic-v1`.
- Hono server app with typed incident, demo, health, scoring preview, and recompute routes.
- `incidentStore` abstraction with Redis adapter and memory fallback for persisted scored demo incidents.
- API-first client loading with refresh, seed/reset, recompute, loading/error/empty states, and local deterministic fallback.
- Dashboard, Incidents, Case Card, Metrics, and Settings surfaces for score explanations and cluster summaries.
- Documentation for architecture, sprint notes, PR review, and safety boundaries.
- Store, route, clustering, scoring, smoke, and workbench helper tests.
- GitHub Actions CI for install, type-check, lint, test, and build.

## Not Implemented Yet

- Real Reddit ingestion.
- Automatic moderation enforcement.
- Approve, remove, lock, ban, escalation, or other live moderation actions.
- Reddit event triggers or webhooks.
- External Slack, Discord, webhook, email, or analytics integrations.
- AI-generated moderation decisions.

## Project Layout

```text
src/
  client/   React app shell, API clients, hooks, components, pages, and CSS
  server/   Hono app, API routes, Devvit menu handler, store adapters, and service wrappers
  shared/   Shared constants, demo data, demo signals, API types, scoring engine, and contracts
tests/      Smoke, store, route, clustering, scoring, and workbench helper tests
docs/       Architecture, sprint notes, and PR review checklist
```

## Pull Request Evidence

For ChatGPT review, include:

- PR title and summary.
- Changed file tree.
- Output from `npm install`, `npm run build`, `npm run check`, and CI.
- Screenshot or short description of Dashboard, Incidents, Case Card, Metrics, Settings, and recompute behavior.
- Notes on store mode, browser-shell fallback behavior, stacked Sprint 2 base, and any Devvit playtest limitations.
