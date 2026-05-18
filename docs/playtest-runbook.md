# Queue Sentinel Private Playtest Runbook

This runbook lets a reviewer execute a private subreddit playtest without reading the codebase. Queue Sentinel remains human-in-the-loop: it clusters and scores read-only metadata for triage context, but it does not perform Reddit moderation actions.

## Devvit Login and Local Startup

1. Install dependencies:

```bash
npm install
```

2. Log in to Devvit:

```bash
npm run login
```

3. Start the Devvit playtest server:

```bash
npm run dev
```

4. For browser-only UI review, run:

```bash
npm run dev:shell
```

Browser-only shell mode uses synthetic fallback data. Redis, moderator authorization, audit writes, and playtest mutations are unavailable there by design.

## Private Subreddit Setup

- Use a private or restricted subreddit for playtest work.
- Default test name: `queue_sentinel_lab`.
- Install or playtest the Devvit app only in the private test subreddit.
- Do not use production subreddit queues for the Sprint 7.1 review build.

## Required Environment

Enable read-only playtest ingestion:

```bash
QUEUE_SENTINEL_ENABLE_READONLY_INGESTION=true
QUEUE_SENTINEL_INGESTION_MODE=playtest-readonly
QUEUE_SENTINEL_TEST_SUBREDDIT=queue_sentinel_lab
```

Optional local-only testing bypass:

```bash
QUEUE_SENTINEL_ALLOW_LOCAL_MUTATIONS=true
```

Use the local bypass only for local demos or tests. Production-like runs should rely on moderator context.

## Authorization Check

To confirm production-like safety, run without `QUEUE_SENTINEL_ALLOW_LOCAL_MUTATIONS=true` and try a mutation route or disabled UI control. Expected result: mutation routes return 403 with a generic moderator authorization message, and private subreddit or raw user details are not exposed.

Read-only routes should remain available:

- `GET /api/health`
- `GET /api/diagnostics`
- `GET /api/audit/recent`
- `GET /api/incidents`
- `GET /api/incidents/:id`
- `GET /api/ingestion/status`
- `POST /api/ingestion/preview`
- `GET /api/scoring/preview`

## Fixture Preview, Seed, Recompute, Inspect, Audit, Reset

1. Open Dashboard and review Judge Demo Mode.
   Expected: the guided steps show complete, blocked, ready, or fallback state.

2. Open Settings and refresh diagnostics.
   Expected: runtime mode, store modes, authorization mode, signal count, incident count, scoring model, and audit count render.

3. Confirm ingestion status.
   Expected: `playtest-readonly`, allowlist configured, and the private test subreddit count is present without exposing raw names in diagnostics.

4. Choose a fixture pack.
   Suggested first pack: `Spam repost wave`.

5. Preview fixture metadata.
   Expected: normalizer accepts metadata-only records and does not mutate the signal store.

6. Seed playtest metadata when authorized.
   Expected: accepted signal count increases, rejected count stays explainable, and an audit entry is recorded.

7. Recompute scoring.
   Expected: incidents use accepted playtest signals when present; otherwise they use synthetic demo signals.

8. Open the highest-priority incident.
   Expected: Case Card shows score factors, cluster summary, provenance, rationale draft, and disabled moderation actions.

9. Review recent audit entries in Settings.
   Expected: entries show operation type, outcome, route, safe actor context, and counts only.

10. Reset playtest signals.
    Expected: signal count returns to zero and reset is audited.

## Expected Results by Page

- Dashboard: Judge Demo Mode, recommended review focus, deterministic score metrics, top scored incident, and human-in-the-loop copy.
- Incidents: searchable scored incident list, selected preview, provenance, score and cluster details, and internal status updates only.
- Case Card: score factors, cluster summary, rationale draft, provenance, timeline, safety boundary, and disabled Reddit-facing actions.
- Metrics: signals processed, accepted/rejected playtest counts, clusters formed, average score, collapsed signals, and priority distribution.
- Settings: diagnostics, fixture pack selector, authorization state, ingestion controls, scoring controls, and recent audit entries.

## Failure Recovery

- Redis unavailable: set `QUEUE_SENTINEL_STORE_MODE=memory` for local demos and mention memory mode in evidence.
- API unavailable: use browser fallback for UI screenshots only; mutation, authorization, and audit evidence require the Devvit server.
- Authorization unavailable: confirm mutation controls are disabled and mutation routes return 403.
- Ingestion disabled: confirm the env vars above are present and the allowlist contains the private test subreddit.
- No signals: preview a fixture pack, then seed when authorized.
- No incidents: seed demo incidents when authorized or recompute scoring.
- Fallback mode: refresh diagnostics and confirm the server URL is reachable.

## Safety Verification

- No live approve, remove, lock, ban, mute, flair enforcement, Reddit escalation, webhook, AI decisioning, notification, or automatic enforcement path should appear.
- Full post/comment bodies are not accepted or stored.
- Audit entries are Queue Sentinel operation logs, not Reddit moderation logs.
- Status changes affect Queue Sentinel internal state only.
