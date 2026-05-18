# Queue Sentinel

Queue Sentinel is a Reddit Devvit moderation workbench for noisy mod queues. Sprint 6 adds a judge-demo workflow, private playtest runbook, evidence template, and clearer fallback states on top of controlled read-only ingestion and Sprint 5 authorization.

The eventual product will help moderators collapse duplicate reports into explainable incident cards, rank queue pressure, and keep all enforcement decisions human-in-the-loop. Sprint 6 accepts only allowlisted private-playtest metadata, protects mutation routes behind moderator authorization or an explicit local test bypass, and still does not perform real moderation actions.

## Sprint Status

- Sprint: `6 - Demo Hardening and Playtest Runbook`
- Branch: `sprint-6-demo-hardening-runbook`
- Base: `main`
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

Enable local mutation controls outside tests only when intentionally playtesting:

```bash
QUEUE_SENTINEL_ALLOW_LOCAL_MUTATIONS=true
```

Without the explicit ingestion flag and allowlisted subreddit, ingestion status remains disabled and seed/reset endpoints reject playtest writes. Without moderator authorization or the explicit local mutation bypass, sensitive mutation routes return 403.

## Implemented

- Devvit-compatible `devvit.json` and Vite build setup.
- Responsive Queue Sentinel workbench with Dashboard, Incidents, Case Card, Metrics, and Settings views.
- Ten safe demo incidents and a separate synthetic `QueueSignal` dataset.
- Deterministic clustering over exact item, thread/rule, domain/rule, author/rule, and rule-area time-window signals with safety-adjacent isolation.
- Explainable priority scoring with numeric score, priority label, confidence label, factor contributions, and model version `sprint-3-deterministic-v1`.
- Read-only ingestion contracts, normalizer, allowlist guard, playtest fixture, status/preview/seed/reset routes, and signal store boundary.
- Metadata-only playtest fixture packs for repost waves, heated threads, self-promo, privacy-adjacent cases, and formatting cleanup.
- Moderator authorization guard for demo seed/reset, playtest seed/reset, scoring recompute, and incident status/metadata updates, with local/test bypass only.
- Audit log store with memory and Redis adapters plus recent audit API.
- Diagnostics API and Settings diagnostics panel for runtime, stores, ingestion, scoring, authorization, fallback, and audit state.
- Dashboard Judge Demo Mode with blocked, ready, complete, and fallback step states.
- Private playtest runbook and demo evidence template for screenshot/video collection.
- Clearer fallback, disabled ingestion, unauthorized mutation, no-signal, no-incident, and memory-store explanations.
- Hono server app with typed incident, demo, health, ingestion, scoring preview, and recompute routes.
- `incidentStore` abstraction with Redis adapter and memory fallback for persisted scored demo incidents.
- Separate `QueueSignalStore` abstraction with Redis and memory adapters for accepted playtest signals.
- API-first client loading with refresh, seed/reset, recompute, loading/error/empty states, and local deterministic fallback.
- Dashboard, Incidents, Case Card, Metrics, and Settings surfaces for score explanations, cluster summaries, ingestion state, and provenance labels.
- Documentation for architecture, sprint notes, playtest checklist, runbook, demo evidence, PR review, and safety boundaries.
- Store, route, authorization, audit, demo-flow, docs, clustering, scoring, smoke, and workbench helper tests.
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
tests/      Smoke, store, route, ingestion, auth, audit, clustering, scoring, and workbench helper tests
docs/       Architecture, sprint notes, playtest checklist, runbook, evidence, and PR review checklist
```

## Pull Request Evidence

For ChatGPT review, include:

- PR title and summary.
- Changed file tree.
- Output from `npm install`, `npm run build`, `npm run check`, and CI.
- Screenshot or short description of Dashboard, Judge Demo Mode, Incidents, Case Card, Metrics, Settings, diagnostics, ingestion controls, audit log, and recompute behavior.
- Notes on store mode, read-only ingestion mode, authorization mode, browser-shell fallback behavior, main-base status, and any Devvit playtest limitations.
