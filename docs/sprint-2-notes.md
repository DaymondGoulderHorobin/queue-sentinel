# Sprint 2 Notes: Persistence, API, and Demo Seeding

Sprint 2 moves Queue Sentinel from a client-local demo toward server-backed contracts. The work stays intentionally safe: it persists demo incident state, but it does not ingest live Reddit data or perform moderation actions.

## Added

- `IncidentStore` abstraction with list, detail, upsert, status, metadata, seed, and reset methods.
- Redis-backed store adapter for Devvit runtime usage.
- In-memory store adapter for tests, local debugging, and fallback mode.
- Typed Hono routes for health, incidents, incident detail, internal status, safe metadata, seed, and reset.
- Client API helpers and `useIncidentWorkbench` for API-first loading and mutations.
- Dashboard and Incidents refresh controls, loading state, API/fallback labels, and error notices.
- Settings demo controls for refresh, seed, and reset.
- Internal status selectors in the incident preview and Case Card.
- Store and route tests covering seed/reset, status persistence, validation, and unsafe metadata rejection.
- GitHub Actions CI for install, type-check, lint, test, and build.

## Safety Boundaries

- Internal status updates affect Queue Sentinel incident state only.
- Safe metadata updates are limited to tags, timeline, rationale draft, confidence label, and recommended review action.
- Reddit-facing action controls remain disabled.
- No ingestion, enforcement, webhook, AI, escalation, or external integration path is active.

## Local Review Notes

- `npm run dev` runs the Devvit playtest workflow.
- `npm run dev:shell` runs the browser-only Vite shell.
- The Vite shell can show fallback demo data if the Devvit server API is not available.
- Set `QUEUE_SENTINEL_STORE_MODE=memory` to force the memory adapter.
