# Queue Sentinel Architecture

Queue Sentinel uses the current Devvit Web split between client, server, and shared code. Sprint 7 adds marketplace readiness, submission documentation, privacy and safety packaging, release checklists, and production-safe mode copy on top of the Sprint 6 judge-demo and private playtest foundation.

## High-Level Shape

- `devvit.json` declares the app name, post entrypoint, server bundle, and moderator menu item.
- `src/client` contains the React workbench shell rendered through `app.html`.
- `src/server` contains a Hono server mounted through `@devvit/web/server`.
- `src/shared` holds incident contracts, API response types, safe demo data, synthetic queue signals, playtest fixtures, fixture packs, demo-flow helpers, and the deterministic scoring engine.
- `tests` provides smoke, route, authorization, diagnostics, audit, ingestion, store, demo-flow, docs, marketplace readiness, production defaults, clustering, scoring, and workbench helper coverage.
- `.github/workflows/ci.yml` runs install, type-check, lint, test, and build checks for pull requests and main branch pushes.

## Client

The client is API-first. `useIncidentWorkbench` loads `/api/incidents`, `/api/scoring/preview`, and `/api/ingestion/status`, tracks loading and mutation state, exposes refresh/seed/reset/status/preview/recompute actions, and falls back to local deterministic scoring when the API is unavailable during browser-only preview.

The visible sections are Dashboard, Incidents, Case Card, Metrics, and Settings. Dashboard shows Judge Demo Mode, model version, signal provenance, signals processed, clusters formed, average score, and top scored incident. Incident cards and previews show score, cluster size, top factors, provenance labels, and explanation reasons. Case Card includes signal provenance, cluster summary, and score breakdown panels. Settings includes safe seed/reset, read-only ingestion status/preview/seed/reset, fixture pack selection, diagnostics, recent audit entries, readiness mode summaries, and recompute controls.

All Reddit-facing enforcement controls remain disabled. Sprint 7 exposes only guarded read-only metadata persistence for allowlisted private playtests; it does not expose approve, remove, lock, ban, escalation, webhook, AI, notification, or automatic enforcement paths.

## Judge Demo Flow

`src/shared/demoFlow.ts` builds the Dashboard Judge Demo Mode sequence from diagnostics, ingestion status, scoring preview, incidents, audit entries, and data source. Each step can be blocked, ready, complete, or fallback:

- Refresh diagnostics.
- Confirm playtest readiness.
- Preview fixture metadata.
- Seed playtest metadata.
- Recompute scoring.
- Inspect the top incident.
- Review audit trail.
- Reset playtest signals.

The browser-only fallback path is explicit: it can demonstrate UI and deterministic synthetic data, but it does not claim live Reddit data, authorization, audit writes, or playtest mutations.

## Scoring Pipeline

The scoring pipeline accepts either the synthetic demo signal set or accepted playtest signals from the read-only signal store:

- `src/shared/demoSignals.ts` defines safe report-like `QueueSignal` inputs.
- `src/shared/playtestInputs.ts` defines the default safe private-playtest fixture metadata.
- `src/shared/playtestFixturePacks.ts` defines selectable metadata-only private playtest packs.
- `clusterQueueSignals` groups signals deterministically by exact item, thread/rule, domain/rule time windows, author/rule thresholds, and rule-area time windows.
- Safety-adjacent privacy signals avoid broad automatic grouping unless exact item, thread, or domain evidence is strong.
- `scoreIncidentCluster` calculates a numeric score, priority label, confidence label, factors, and human-readable reasons.
- `materializeClusteredIncidents` converts clustered signals into `QueueIncident` objects with `clusterSummary` and `priorityScore`.
- Incidents carry `ingestionProvenance` labels: `Synthetic demo`, `Playtest read-only`, or `Fallback`.

Server service files in `src/server/services` expose the clustering, scoring, and materialization boundaries used by routes and tests.

## Submission Readiness

Sprint 7 adds a documentation package for review and marketplace preparation:

- `docs/submission-copy.md` for Devpost, app listing, or hackathon form copy.
- `docs/demo-video-script.md` for 60 second and extended demo recording.
- `docs/release-checklist.md` for commands, evidence, environment matrix, and safety gates.
- `docs/privacy-and-safety.md` for storage, privacy, authorization, ingestion, reset, and fallback boundaries.
- `docs/devvit-publish-readiness.md` for visible project config, local scripts, Devvit CLI commands, manual publish checks, and unknowns requiring manual verification.

The repository should read as a reviewable product candidate while retaining production-safe defaults.

## Read-only Ingestion

Sprint 7 ingestion remains opt-in and playtest-only:

- Default mode is `disabled`.
- `playtest-readonly` requires `QUEUE_SENTINEL_ENABLE_READONLY_INGESTION=true` and at least one allowlisted subreddit through `QUEUE_SENTINEL_TEST_SUBREDDIT` or `QUEUE_SENTINEL_ALLOWED_SUBREDDITS`.
- The normalizer accepts minimal metadata only: item id/type, subreddit, safe keys, report reason, timestamps, safe excerpt, and tags.
- Body/content fields and moderation-side command fields are rejected without being echoed back in API payloads.
- Preview validates selected fixture packs or provided metadata without mutating the signal store.
- Seed writes accepted signals to `QueueSignalStore` only after authorization; recompute then scores those signals through the existing deterministic pipeline.
- Reset clears accepted playtest signals only after authorization.

## Authorization and Audit

Sensitive Queue Sentinel mutation routes are guarded server-side:

- Demo seed/reset.
- Playtest seed/reset.
- Scoring recompute.
- Incident status and metadata updates.

The guard allows mutations only for moderator context or when `NODE_ENV=test` or `QUEUE_SENTINEL_ALLOW_LOCAL_MUTATIONS=true` is present. Denied mutation responses use a generic 403 message and do not include private subreddit names or raw user data.

`AuditLogStore` records safe operation metadata: operation type, timestamp, source route, store mode, safe actor context, outcome, and counts. It has memory and Redis adapters and caps recent reads through `GET /api/audit/recent`. Audit entries do not store body text, usernames, raw authors, unsafe rejected field names, external command strings, or moderation actions.

`GET /api/diagnostics` reports runtime mode, store modes, ingestion state, allowlist state, signal count, incident count, last ingestion run, scoring model version, last scoring recompute, authorization mode, fallback warnings, and fixture pack options.

## Server

The server is assembled through `createServerApp(store, signalStore, ingestionConfig, moderatorAuth, auditLogStore)` and mounted in `src/server/index.ts`.

Routes:

- `GET /api/health` returns sprint, store mode, and scoring model version.
- `GET /api/diagnostics` returns read-only runtime and authorization diagnostics.
- `GET /api/audit/recent` returns the capped recent safe audit log.
- `GET /api/incidents` lists persisted demo incidents, including optional score and cluster fields.
- `GET /api/incidents/:id` returns one incident or a typed 404.
- `PATCH /api/incidents/:id/status` updates internal Queue Sentinel status only after authorization.
- `PATCH /api/incidents/:id/metadata` accepts safe metadata fields only after authorization.
- `POST /api/demo/seed` seeds the safe scored demo queue after authorization.
- `POST /api/demo/reset` resets the safe scored demo queue after authorization.
- `GET /api/ingestion/status` returns mode, allowlist, signal count, last run, and model version.
- `POST /api/ingestion/preview` normalizes selected fixture pack or provided metadata without persistence.
- `POST /api/ingestion/playtest-seed` persists accepted read-only playtest signals when explicitly enabled and authorized.
- `POST /api/ingestion/reset` clears accepted playtest signals when explicitly enabled and authorized.
- `GET /api/scoring/preview` returns deterministic scoring output without mutating the store.
- `POST /api/scoring/recompute-demo` recomputes and persists scored incidents after authorization from accepted playtest signals when present, otherwise synthetic demo signals.
- `POST /internal/menu/post-create` creates a Queue Sentinel custom post from a subreddit moderator menu.

## Storage Boundary

`incidentStore` is the storage boundary for incidents. It exposes list, detail, upsert, status, metadata, seed, and reset operations. Sprint 7 still upserts recomputed scored incidents through it.

`QueueSignalStore` is the separate storage boundary for accepted playtest signals. It exposes list, upsert, batch upsert, reset, and last-run summary operations. Redis and memory adapters intentionally mirror the incident store pattern without sharing keys.

`AuditLogStore` is the separate storage boundary for safe mutation audit entries. It exposes append, recent list, and count operations with memory and Redis adapters.

The default adapters use Devvit Redis through `@devvit/web/server`. Set `QUEUE_SENTINEL_STORE_MODE=memory` to force in-memory adapters for local debugging or tests. The browser-only Vite shell can still use local deterministic fallback data if the server is not running.

## Future Moderator Actions

Approve, remove, lock, ban, escalation, and other enforcement actions must remain disabled until a later sprint implements explicit moderator confirmation flows and Devvit policy review.
