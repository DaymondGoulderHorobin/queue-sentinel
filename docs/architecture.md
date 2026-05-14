# Queue Sentinel Architecture

Queue Sentinel uses the current Devvit Web split between client, server, and shared code.

## High-Level Shape

- `devvit.json` declares the app name, post entrypoint, server bundle, and moderator menu item.
- `src/client` contains the React workbench shell rendered through `app.html`.
- `src/server` contains a Hono server mounted through `@devvit/web/server`.
- `src/shared` holds the incident contracts and safe demo data used by both sides.
- `tests` provides smoke and workbench helper coverage.

## Client

The client is responsive and mock-data-driven. `App.tsx` owns the active navigation tab, selected incident id, and attempts to load `/api/incidents`. If the API is unavailable during a browser-only preview, the client falls back to local mock data.

The visible sections are Dashboard, Incidents, Case Card, Metrics, and Settings. The Incidents workbench supports local search, filters, sorting, selected preview, and Case Card handoff. All action controls in the Case Card are disabled because Sprint 1 must not provide real enforcement.

## Server

The server is a Hono app with:

- `/api/health` for a typed health response.
- `/api/incidents` for mock incident responses.
- `/internal/menu/post-create` for creating a Queue Sentinel custom post from a subreddit moderator menu.

Future sprints can add Reddit triggers and internal API endpoints without changing the client shell structure.

## Storage Boundary

`incidentStore` is the storage boundary for future Redis implementation. Sprint 1 returns static demo incidents only. Redis calls should be introduced behind this interface so the UI and server routes stay stable.

## Scoring Boundary

`priorityScoring` currently mirrors mock priority values. It exists to mark where deterministic scoring and explainable ranking should live later. Sprint 1 adds client-side ordering helpers for the mock workbench, but does not implement production clustering or prioritization.

## Future Moderator Actions

Approve, remove, lock, ban, escalation, and other enforcement actions must remain disabled until a later sprint implements explicit moderator confirmation, audit visibility, and Devvit policy review.
