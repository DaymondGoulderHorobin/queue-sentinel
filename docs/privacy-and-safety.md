# Queue Sentinel Privacy and Safety

Queue Sentinel is a human-in-the-loop moderation workbench. It provides triage context for moderators and has no automatic enforcement.

## What Queue Sentinel Stores

- Incident records derived from safe synthetic demo signals or accepted read-only playtest metadata.
- Accepted metadata signals, including item identifiers, item type, safe source keys, rule area, report reason, timestamps, tags, and provenance.
- Diagnostics counts such as store mode, ingestion state, signal count, incident count, scoring model version, authorization mode, and audit count.
- Audit operation metadata such as route, operation type, outcome, store mode, safe counts, timestamp, and safe actor hashes.
- Safe actor context keys that are hashed or local/test labels.

## What Queue Sentinel Does Not Store

- Full post or comment bodies.
- Raw usernames in audit entries.
- External command payloads.
- Webhook payloads.
- AI decision records.
- Reddit moderation action payloads.
- Unsafe rejected fields from ingestion requests.

## Enforcement Boundary

Queue Sentinel does not approve, remove, lock, ban, mute, enforce flair, escalate to Reddit, send webhooks, send notifications, call AI decisioning, or perform automatic moderation. Disabled action controls in the UI are safety boundary indicators only.

Internal status updates change Queue Sentinel incident state only. They do not write to Reddit moderation state.

## Ingestion Boundary

Read-only ingestion is disabled by default. Private playtest ingestion requires:

```bash
QUEUE_SENTINEL_ENABLE_READONLY_INGESTION=true
QUEUE_SENTINEL_INGESTION_MODE=playtest-readonly
QUEUE_SENTINEL_TEST_SUBREDDIT=queue_sentinel_lab
```

The allowlist can also be configured with `QUEUE_SENTINEL_ALLOWED_SUBREDDITS`. Metadata is accepted only when the ingestion flag is enabled and the subreddit is allowlisted.

Preview routes normalize fixture metadata without mutating the signal store. Seed and reset routes require moderator authorization or an explicit local/test bypass.

## Authorization Boundary

Sensitive Queue Sentinel mutation routes require moderator authorization:

- Demo seed/reset.
- Playtest seed/reset.
- Scoring recompute.
- Incident status updates.
- Incident metadata updates.

For tests and local demos, `NODE_ENV=test` or `QUEUE_SENTINEL_ALLOW_LOCAL_MUTATIONS=true` enables an explicit local bypass. Production-like runs should not use that bypass.

Denied mutation responses use a generic message and do not expose private subreddit names or raw user data.

## Reset and Data Removal

Use Settings to reset demo incidents and playtest signals when authorized. The playtest reset clears accepted read-only signals from the signal store. Browser fallback mode has no server-side signal store to reset.

## Browser Fallback

Browser-only shell mode uses deterministic synthetic data when the Devvit API is unavailable. It cannot prove Redis persistence, moderator authorization, audit writes, or playtest mutations. The UI must continue to state this clearly.

## Known Limitations

- Queue Sentinel is currently scoped to synthetic demo data and allowlisted private-playtest metadata.
- Production subreddit ingestion outside the existing allowlisted read-only path is not implemented.
- Marketplace submission requirements should be verified against current Reddit Devvit review guidance before publishing.
- Scores are review context only and should not be treated as allegations, decisions, or enforcement recommendations.
