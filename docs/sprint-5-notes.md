# Sprint 5 Notes: Private Playtest Authorization

Sprint 5 prepares Queue Sentinel for a private subreddit playtest by adding server-side mutation authorization, diagnostics, fixture packs, and safe audit visibility on top of the merged Sprint 4 read-only ingestion foundation.

## Added

- Moderator authorization guard for demo seed/reset, playtest seed/reset, scoring recompute, incident status update, and incident metadata update routes.
- Local/test bypass only through `NODE_ENV=test` or `QUEUE_SENTINEL_ALLOW_LOCAL_MUTATIONS=true`.
- Safe 403 denied responses that do not include private subreddit names or raw user data.
- `AuditLogStore` with memory and Redis adapters, capped recent reads, operation counts, safe actor context, and no body text or raw author persistence.
- `GET /api/audit/recent` for the latest 25 safe audit entries.
- `GET /api/diagnostics` for runtime mode, store modes, ingestion state, allowlist state, signal count, incident count, last run, scoring model, last recompute, authorization mode, fallback warning, and fixture pack options.
- Metadata-only fixture packs for spam repost waves, heated threads, solicitation/self-promo, privacy-adjacent isolated reports, and formatting/flair cleanup.
- Settings diagnostics panel, fixture pack selector, mutation-aware controls, and recent audit log display.
- Tests for authorization guard behavior, guarded routes, diagnostics, audit log safety, fixture packs, and existing read-only ingestion/scoring behavior.

## Safety Boundaries

- Read-only ingestion remains disabled by default.
- Playtest persistence still requires `QUEUE_SENTINEL_ENABLE_READONLY_INGESTION=true` and an allowlisted test subreddit.
- Preview/status/health/list/detail routes remain read-only and accessible.
- Seed/reset/recompute/status/metadata mutation routes require authorization or the explicit local/test bypass.
- Audit entries store operation metadata and counts only.
- No approve, remove, lock, ban, mute, flair enforcement, Reddit escalation, webhook, AI decisioning, notification, or automatic enforcement path is active.
- Scores remain triage aids, not claims of wrongdoing.

## Environment

```bash
QUEUE_SENTINEL_ENABLE_READONLY_INGESTION=true
QUEUE_SENTINEL_INGESTION_MODE=playtest-readonly
QUEUE_SENTINEL_TEST_SUBREDDIT=queue_sentinel_lab
```

Optional local playtest mutation bypass:

```bash
QUEUE_SENTINEL_ALLOW_LOCAL_MUTATIONS=true
```

## Branch Note

Sprint 5 targets `main` directly and builds on the merged Sprint 4 read-only ingestion foundation.
