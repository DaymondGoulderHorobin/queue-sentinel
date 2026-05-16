# Queue Sentinel

Queue Sentinel is a Reddit Devvit moderation workbench for noisy mod queues. Sprint 4 adds controlled read-only playtest ingestion on top of deterministic clustering and explainable priority scoring.

The eventual product will help moderators collapse duplicate reports into explainable incident cards, rank queue pressure, and keep all enforcement decisions human-in-the-loop. Sprint 4 accepts only allowlisted private-playtest metadata and still does not perform real moderation actions.

## Sprint Status

- Sprint: `4 - Read-only Ingestion and Playtest Hardening`
- Branch: `sprint-4-readonly-ingestion-playtest-hardening`
- Base: stacked on `sprint-3-clustering-priority-scoring` until earlier sprint PRs are merged into `main`
- Devvit pattern: Devvit Web with `src/client`, `src/server`, and `src/shared`
- Data: safe synthetic queue signals plus opt-in allowlisted playtest metadata
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

Enable read-only playtest ingestion locally:

```bash
QUEUE_SENTINEL_ENABLE_READONLY_INGESTION=true
QUEUE_SENTINEL_TEST_SUBREDDIT=queue_sentinel_lab
QUEUE_SENTINEL_INGESTION_MODE=playtest-readonly
```

Without the explicit flag and allowlisted subreddit, ingestion status remains disabled and seed/reset endpoints reject playtest writes.

## Implemented

- Devvit-compatible `devvit.json` and Vite build setup.
- Responsive Queue Sentinel workbench with Dashboard, Incidents, Case Card, Metrics, and Settings views.
- Ten safe demo incidents and a separate synthetic `QueueSignal` dataset.
- Deterministic clustering over exact item, thread/rule, domain/rule, author/rule, and rule-area time-window signals with safety-adjacent isolation.
- Explainable priority scoring with numeric score, priority label, confidence label, factor contributions, and model version `sprint-3-deterministic-v1`.
- Read-only ingestion contracts, normalizer, allowlist guard, playtest fixture, status/preview/seed/reset routes, and signal store boundary.
- Hono server app with typed incident, demo, health, ingestion, scoring preview, and recompute routes.
- `incidentStore` abstraction with Redis adapter and memory fallback for persisted scored demo incidents.
- Separate `QueueSignalStore` abstraction with Redis and memory adapters for accepted playtest signals.
- API-first client loading with refresh, seed/reset, recompute, loading/error/empty states, and local deterministic fallback.
- Dashboard, Incidents, Case Card, Metrics, and Settings surfaces for score explanations, cluster summaries, ingestion state, and provenance labels.
- Documentation for architecture, sprint notes, PR review, and safety boundaries.
- Store, route, clustering, scoring, smoke, and workbench helper tests.
- GitHub Actions CI for install, type-check, lint, test, and build.

## Not Implemented Yet

- Production Reddit ingestion outside the allowlisted read-only playtest path.
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
  shared/   Shared constants, demo data, demo/playtest signals, API types, scoring engine, and contracts
tests/      Smoke, store, route, ingestion, clustering, scoring, and workbench helper tests
docs/       Architecture, sprint notes, and PR review checklist
```

## Pull Request Evidence

For ChatGPT review, include:

- PR title and summary.
- Changed file tree.
- Output from `npm install`, `npm run build`, `npm run check`, and CI.
- Screenshot or short description of Dashboard, Incidents, Case Card, Metrics, Settings, ingestion controls, and recompute behavior.
- Notes on store mode, read-only ingestion mode, browser-shell fallback behavior, stacked Sprint 3 base, and any Devvit playtest limitations.
