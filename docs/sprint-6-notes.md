# Sprint 6 Notes: Demo Hardening and Playtest Runbook

Sprint 6 turns Queue Sentinel into a repeatable private subreddit playtest and judge-demo package. The core moderation safety posture is unchanged: Queue Sentinel provides read-only metadata ingestion, deterministic clustering, and triage context only.

## Added

- Judge Demo Mode on Dashboard with step states for diagnostics, readiness, fixture preview, seed, recompute, case review, audit review, and reset.
- Shared demo-flow helper for blocked, ready, complete, and fallback states.
- Clearer browser fallback, disabled ingestion, unauthorized mutation, no-signal, no-incident, and memory-store copy.
- `docs/playtest-runbook.md` for private subreddit operators.
- `docs/demo-evidence.md` for screenshot, video, safety, impact, and limitation evidence.
- Tests for demo-flow states, diagnostics safety, audit safety, fixture flow, fallback copy, and docs presence.

## Safety Boundaries

- Read-only ingestion is disabled by default.
- Playtest persistence still requires the explicit ingestion flag and an allowlisted test subreddit.
- Mutations remain guarded by moderator authorization or the explicit local/test bypass.
- Audit entries remain capped and metadata-only.
- No approve, remove, lock, ban, mute, flair enforcement, Reddit escalation, webhook, AI decisioning, notification, external messaging, analytics, or automatic enforcement path is active.
- Scores remain triage aids, not allegations or decisions.

## Manual Demo Flow

1. Refresh diagnostics.
2. Confirm read-only ingestion and authorization mode.
3. Preview a metadata-only fixture pack.
4. Seed playtest metadata when authorized.
5. Recompute deterministic scoring.
6. Inspect the highest-priority Case Card.
7. Review recent audit entries.
8. Reset playtest signals.

## Branch Note

Sprint 6 targets `main` directly and builds on the merged Sprint 5 private playtest authorization foundation.
