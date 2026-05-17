# Sprint 4 Notes: Read-only Ingestion and Playtest Hardening

Sprint 4 introduces a guarded playtest ingestion path that normalizes minimal Reddit metadata into the existing `QueueSignal` clustering and scoring pipeline.

## Added

- `SignalSource`, `IngestionMode`, `ReadonlyIngestionConfig`, `IngestionRunSummary`, and provenance fields on scored incidents.
- Safe playtest fixture metadata in `src/shared/playtestInputs.ts`.
- Read-only ingestion config with disabled default mode, explicit enable flag, and subreddit allowlist checks.
- Normalizer that accepts minimal metadata, derives rule areas when needed, hashes author keys, and rejects body/content or moderation-side fields.
- Separate `QueueSignalStore` with memory and Redis adapters, batch upsert, reset, and last-run summary support.
- Ingestion routes for status, preview, playtest seed, and reset.
- Scoring preview/recompute integration that uses accepted playtest signals when present and synthetic demo signals otherwise.
- Dashboard, Incident, Case Card, Metrics, and Settings provenance labels and ingestion controls.
- Tests for normalizer guardrails, route behavior, store boundaries, scoring integration, malformed input, and unsafe-field rejection.

## Safety Boundaries

- Ingestion is disabled by default.
- Playtest persistence requires `QUEUE_SENTINEL_ENABLE_READONLY_INGESTION=true` and an allowlisted subreddit.
- Preview does not mutate the signal store.
- Accepted playtest data stores minimal metadata only; full post/comment bodies are rejected.
- API rejections do not echo unsafe moderation-side command keys.
- No approve, remove, lock, ban, mute, flair enforcement, Reddit escalation, webhook, AI, notification, or automatic enforcement path is active.
- Scores remain triage aids, not claims of wrongdoing.

## Environment

```bash
QUEUE_SENTINEL_ENABLE_READONLY_INGESTION=true
QUEUE_SENTINEL_INGESTION_MODE=playtest-readonly
QUEUE_SENTINEL_TEST_SUBREDDIT=queue_sentinel_lab
```

`QUEUE_SENTINEL_ALLOWED_SUBREDDITS` can also provide a comma-separated allowlist for local tests.

## Branch Note

Sprint 4 now targets `main` directly and builds on the merged Sprint 3 foundation.
