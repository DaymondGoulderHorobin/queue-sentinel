# Private Playtest Checklist

Use this checklist for Sprint 5 private subreddit playtests.

## Preflight

- Confirm the branch targets `main`.
- Confirm read-only ingestion is disabled by default without playtest env vars.
- Configure the private test subreddit allowlist:

```bash
QUEUE_SENTINEL_ENABLE_READONLY_INGESTION=true
QUEUE_SENTINEL_INGESTION_MODE=playtest-readonly
QUEUE_SENTINEL_TEST_SUBREDDIT=queue_sentinel_lab
```

- For local-only mutation testing, set `QUEUE_SENTINEL_ALLOW_LOCAL_MUTATIONS=true`.
- Confirm production-like runs without moderator context return 403 for mutation routes.

## Diagnostics

- Open Settings and refresh diagnostics.
- Confirm runtime mode, incident store, signal store, audit store, authorization mode, signal count, incident count, last ingestion run, scoring model version, and last scoring recompute render.
- Confirm fallback warning appears only when the API is unavailable.
- Confirm `GET /api/diagnostics` does not expose raw usernames.

## Fixture Packs

- Preview each fixture pack from Settings:
  - Default read-only mix.
  - Spam repost wave.
  - Heated thread.
  - Solicitation self-promo.
  - Privacy-adjacent isolated.
  - Formatting cleanup.
- Confirm preview does not mutate the signal store.
- Seed one fixture pack only when authorized.
- Recompute scoring and confirm incidents show Playtest read-only provenance.
- Reset playtest signals and confirm signal count returns to zero.

## Audit

- Confirm seed demo, reset demo, seed playtest, reset playtest, scoring recompute, status update, and metadata update write audit entries when authorized.
- Confirm denied mutation attempts write denied audit entries.
- Confirm `GET /api/audit/recent` returns at most 25 entries.
- Confirm audit payloads do not include body text, usernames, raw authors, unsafe rejected field names, external command strings, or moderation actions.

## Safety

- Confirm no approve, remove, lock, ban, mute, flair enforcement, Reddit escalation, webhook, AI decisioning, notification, or automatic enforcement action is available.
- Confirm status and metadata updates affect Queue Sentinel internal state only.
- Confirm scoring output is presented as review context, not a moderation decision.
- Confirm private subreddit names are not included in denied responses.

## Evidence

- Record `npm run check`.
- Record `npm run build`.
- Capture or describe Dashboard, Incidents, Case Card, Metrics, Settings diagnostics, fixture selection, audit log, ingestion preview/seed/reset, and scoring recompute behavior.
