# Queue Sentinel Architecture

Queue Sentinel uses the current Devvit Web split between client, server, and shared code. Sprint 2 adds a persistence and API layer while keeping the moderation workflow safely read-only from Reddit's point of view.

## High-Level Shape

- `devvit.json` declares the app name, post entrypoint, server bundle, and moderator menu item.
- `src/client` contains the React workbench shell rendered through `app.html`.
- `src/server` contains a Hono server mounted through `@devvit/web/server`.
- `src/shared` holds the incident contracts, API response types, and safe demo data used by both sides.
- `tests` provides smoke, route, store, and workbench helper coverage.
- `.github/workflows/ci.yml` runs install, type-check, lint, test, and build checks for pull requests and main branch pushes.

## Client

The client is API-first. `useIncidentWorkbench` loads `/api/incidents`, tracks loading and mutation state, exposes refresh/seed/reset/status actions, and falls back to local demo incidents when the API is unavailable during browser-only preview.

The visible sections are Dashboard, Incidents, Case Card, Metrics, and Settings. The Incidents workbench supports local search, filters, sorting, selected preview, and Case Card handoff. Settings includes safe demo seed/reset controls. Case Card and preview status selectors update Queue Sentinel incident status only.

All Reddit-facing enforcement controls remain disabled. Sprint 2 does not expose approve, remove, lock, ban, escalation, or trigger paths.

## Server

The server is assembled through `createServerApp(store)` and mounted in `src/server/index.ts`.

Routes:

- `GET /api/health` returns a typed health response with the active store mode.
- `GET /api/incidents` lists persisted demo incidents.
- `GET /api/incidents/:id` returns one incident or a typed 404.
- `PATCH /api/incidents/:id/status` updates internal Queue Sentinel status only.
- `PATCH /api/incidents/:id/metadata` accepts safe metadata fields only.
- `POST /api/demo/seed` seeds the safe demo queue.
- `POST /api/demo/reset` resets the safe demo queue to the Sprint 2 fixture set.
- `POST /internal/menu/post-create` creates a Queue Sentinel custom post from a subreddit moderator menu.

## Storage Boundary

`incidentStore` is the storage boundary for incidents. It exposes:

- `listIncidents`
- `getIncident`
- `upsertIncident`
- `updateIncidentStatus`
- `updateIncidentMetadata`
- `seedDemoIncidents`
- `resetDemoIncidents`

The default adapter uses Devvit Redis through `@devvit/web/server`. Set `QUEUE_SENTINEL_STORE_MODE=memory` to force the in-memory adapter for local debugging or tests. The browser-only Vite shell can still use local fallback demo data if the server is not running.

## Scoring Boundary

`priorityScoring` currently mirrors demo priority values. It exists to mark where deterministic scoring and explainable ranking should live later. Sprint 2 does not implement production clustering or prioritization.

## Future Moderator Actions

Approve, remove, lock, ban, escalation, and other enforcement actions must remain disabled until a later sprint implements explicit moderator confirmation, audit visibility, and Devvit policy review.
