# Queue Sentinel Architecture

Queue Sentinel uses the current Devvit Web split between client, server, and shared code. Sprint 3 adds a deterministic clustering and priority scoring layer while keeping the moderation workflow safely read-only from Reddit's point of view.

## High-Level Shape

- `devvit.json` declares the app name, post entrypoint, server bundle, and moderator menu item.
- `src/client` contains the React workbench shell rendered through `app.html`.
- `src/server` contains a Hono server mounted through `@devvit/web/server`.
- `src/shared` holds incident contracts, API response types, safe demo data, synthetic queue signals, and the deterministic scoring engine.
- `tests` provides smoke, route, store, clustering, scoring, and workbench helper coverage.
- `.github/workflows/ci.yml` runs install, type-check, lint, test, and build checks for pull requests and main branch pushes.

## Client

The client is API-first. `useIncidentWorkbench` loads `/api/incidents` and `/api/scoring/preview`, tracks loading and mutation state, exposes refresh/seed/reset/status/recompute actions, and falls back to local deterministic scoring when the API is unavailable during browser-only preview.

The visible sections are Dashboard, Incidents, Case Card, Metrics, and Settings. Dashboard shows model version, signals processed, clusters formed, average score, and top scored incident. Incident cards and previews show score, cluster size, top factors, and explanation reasons. Case Card includes cluster summary and score breakdown panels. Settings includes safe seed/reset and recompute controls.

All Reddit-facing enforcement controls remain disabled. Sprint 3 does not expose approve, remove, lock, ban, escalation, ingestion, webhook, AI, or external integration paths.

## Scoring Pipeline

The synthetic signal pipeline is demo-only:

- `src/shared/demoSignals.ts` defines safe report-like `QueueSignal` inputs.
- `clusterQueueSignals` groups signals deterministically by exact item, thread/rule, domain/rule time windows, author/rule thresholds, and rule-area time windows.
- Safety-adjacent privacy signals avoid broad automatic grouping unless exact item, thread, or domain evidence is strong.
- `scoreIncidentCluster` calculates a numeric score, priority label, confidence label, factors, and human-readable reasons.
- `materializeClusteredIncidents` converts clustered signals into `QueueIncident` objects with `clusterSummary` and `priorityScore`.

Server service files in `src/server/services` expose the clustering, scoring, and materialization boundaries used by routes and tests.

## Server

The server is assembled through `createServerApp(store)` and mounted in `src/server/index.ts`.

Routes:

- `GET /api/health` returns sprint, store mode, and scoring model version.
- `GET /api/incidents` lists persisted demo incidents, including optional score and cluster fields.
- `GET /api/incidents/:id` returns one incident or a typed 404.
- `PATCH /api/incidents/:id/status` updates internal Queue Sentinel status only.
- `PATCH /api/incidents/:id/metadata` accepts safe metadata fields only.
- `POST /api/demo/seed` seeds the safe scored demo queue.
- `POST /api/demo/reset` resets the safe scored demo queue.
- `GET /api/scoring/preview` returns deterministic scoring output without mutating the store.
- `POST /api/scoring/recompute-demo` recomputes and persists scored demo incidents from synthetic signals only.
- `POST /internal/menu/post-create` creates a Queue Sentinel custom post from a subreddit moderator menu.

## Storage Boundary

`incidentStore` is the storage boundary for incidents. It exposes list, detail, upsert, status, metadata, seed, and reset operations. Sprint 3 uses the existing contract and upserts recomputed scored incidents through it.

The default adapter uses Devvit Redis through `@devvit/web/server`. Set `QUEUE_SENTINEL_STORE_MODE=memory` to force the in-memory adapter for local debugging or tests. The browser-only Vite shell can still use local deterministic fallback data if the server is not running.

## Future Moderator Actions

Approve, remove, lock, ban, escalation, and other enforcement actions must remain disabled until a later sprint implements explicit moderator confirmation, audit visibility, and Devvit policy review.
