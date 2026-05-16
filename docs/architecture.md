# Queue Sentinel Architecture

Queue Sentinel uses the current Devvit Web split between client, server, and shared code. Sprint 4 adds a controlled read-only ingestion layer for private playtests while keeping enforcement safely disabled.

## High-Level Shape

- `devvit.json` declares the app name, post entrypoint, server bundle, and moderator menu item.
- `src/client` contains the React workbench shell rendered through `app.html`.
- `src/server` contains a Hono server mounted through `@devvit/web/server`.
- `src/shared` holds incident contracts, API response types, safe demo data, synthetic queue signals, playtest fixtures, and the deterministic scoring engine.
- `tests` provides smoke, route, ingestion, store, clustering, scoring, and workbench helper coverage.
- `.github/workflows/ci.yml` runs install, type-check, lint, test, and build checks for pull requests and main branch pushes.

## Client

The client is API-first. `useIncidentWorkbench` loads `/api/incidents`, `/api/scoring/preview`, and `/api/ingestion/status`, tracks loading and mutation state, exposes refresh/seed/reset/status/preview/recompute actions, and falls back to local deterministic scoring when the API is unavailable during browser-only preview.

The visible sections are Dashboard, Incidents, Case Card, Metrics, and Settings. Dashboard shows model version, signal provenance, signals processed, clusters formed, average score, and top scored incident. Incident cards and previews show score, cluster size, top factors, provenance labels, and explanation reasons. Case Card includes signal provenance, cluster summary, and score breakdown panels. Settings includes safe seed/reset, read-only ingestion status/preview/seed/reset, and recompute controls.

All Reddit-facing enforcement controls remain disabled. Sprint 4 exposes only guarded read-only metadata persistence for allowlisted private playtests; it does not expose approve, remove, lock, ban, escalation, webhook, AI, notification, or automatic enforcement paths.

## Scoring Pipeline

The scoring pipeline accepts either the synthetic demo signal set or accepted playtest signals from the read-only signal store:

- `src/shared/demoSignals.ts` defines safe report-like `QueueSignal` inputs.
- `src/shared/playtestInputs.ts` defines safe private-playtest fixture metadata.
- `clusterQueueSignals` groups signals deterministically by exact item, thread/rule, domain/rule time windows, author/rule thresholds, and rule-area time windows.
- Safety-adjacent privacy signals avoid broad automatic grouping unless exact item, thread, or domain evidence is strong.
- `scoreIncidentCluster` calculates a numeric score, priority label, confidence label, factors, and human-readable reasons.
- `materializeClusteredIncidents` converts clustered signals into `QueueIncident` objects with `clusterSummary` and `priorityScore`.
- Incidents carry `ingestionProvenance` labels: `Synthetic demo`, `Playtest read-only`, or `Fallback`.

Server service files in `src/server/services` expose the clustering, scoring, and materialization boundaries used by routes and tests.

## Read-only Ingestion

Sprint 4 ingestion is opt-in and playtest-only:

- Default mode is `disabled`.
- `playtest-readonly` requires `QUEUE_SENTINEL_ENABLE_READONLY_INGESTION=true` and at least one allowlisted subreddit through `QUEUE_SENTINEL_TEST_SUBREDDIT` or `QUEUE_SENTINEL_ALLOWED_SUBREDDITS`.
- The normalizer accepts minimal metadata only: item id/type, subreddit, safe keys, report reason, timestamps, safe excerpt, and tags.
- Body/content fields and moderation-side command fields are rejected without being echoed back in API payloads.
- Preview validates and normalizes without mutating the signal store.
- Seed writes accepted signals to `QueueSignalStore`; recompute then scores those signals through the existing deterministic pipeline.

## Server

The server is assembled through `createServerApp(store, signalStore, ingestionConfig)` and mounted in `src/server/index.ts`.

Routes:

- `GET /api/health` returns sprint, store mode, and scoring model version.
- `GET /api/incidents` lists persisted demo incidents, including optional score and cluster fields.
- `GET /api/incidents/:id` returns one incident or a typed 404.
- `PATCH /api/incidents/:id/status` updates internal Queue Sentinel status only.
- `PATCH /api/incidents/:id/metadata` accepts safe metadata fields only.
- `POST /api/demo/seed` seeds the safe scored demo queue.
- `POST /api/demo/reset` resets the safe scored demo queue.
- `GET /api/ingestion/status` returns mode, allowlist, signal count, last run, and model version.
- `POST /api/ingestion/preview` normalizes fixture or provided metadata without persistence.
- `POST /api/ingestion/playtest-seed` persists accepted read-only playtest signals when explicitly enabled.
- `POST /api/ingestion/reset` clears accepted playtest signals when explicitly enabled.
- `GET /api/scoring/preview` returns deterministic scoring output without mutating the store.
- `POST /api/scoring/recompute-demo` recomputes and persists scored incidents from accepted playtest signals when present, otherwise synthetic demo signals.
- `POST /internal/menu/post-create` creates a Queue Sentinel custom post from a subreddit moderator menu.

## Storage Boundary

`incidentStore` is the storage boundary for incidents. It exposes list, detail, upsert, status, metadata, seed, and reset operations. Sprint 4 still upserts recomputed scored incidents through it.

`QueueSignalStore` is the separate storage boundary for accepted playtest signals. It exposes list, upsert, batch upsert, reset, and last-run summary operations. Redis and memory adapters intentionally mirror the incident store pattern without sharing keys.

The default adapters use Devvit Redis through `@devvit/web/server`. Set `QUEUE_SENTINEL_STORE_MODE=memory` to force in-memory adapters for local debugging or tests. The browser-only Vite shell can still use local deterministic fallback data if the server is not running.

## Future Moderator Actions

Approve, remove, lock, ban, escalation, and other enforcement actions must remain disabled until a later sprint implements explicit moderator confirmation, audit visibility, and Devvit policy review.
