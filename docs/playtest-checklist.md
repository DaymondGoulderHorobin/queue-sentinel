# Private Playtest Checklist

Use this checklist for Sprint 7.2 private subreddit playtests, judge-demo rehearsal, and submission readiness review.

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
- Keep `docs/playtest-runbook.md` open for the full operator sequence.
- Keep `docs/release-checklist.md` open for submission evidence and final safety gates.

## Diagnostics

- Open Settings and refresh diagnostics.
- Confirm Settings shows Demo Mode, Private Playtest Mode, Production-Safe Default Mode, Browser Fallback, and Authorization summaries.
- Confirm runtime mode, incident store, signal store, audit store, authorization mode, signal count, incident count, last ingestion run, scoring model version, and last scoring recompute render.
- Confirm fallback warning appears only when the API is unavailable.
- Confirm `GET /api/diagnostics` does not expose raw usernames.

## Fixture Packs

- Open Dashboard and confirm Judge Demo Mode explains the current blocked, ready, complete, or fallback state.
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
- Use `docs/demo-evidence.md` for the screenshot and 60 second video shot list.
- Use `docs/demo-video-script.md` for the final recording.
- Review `docs/privacy-and-safety.md` and `docs/submission-copy.md` before submitting.
- Capture or describe Dashboard, Judge Demo Mode, Incidents, Case Card, Metrics, Settings diagnostics, fixture selection, audit log, ingestion preview/seed/reset, and scoring recompute behavior.
