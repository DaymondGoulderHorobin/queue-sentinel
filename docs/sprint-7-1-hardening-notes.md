# Sprint 7.1 Notes: Code Review Hardening

Sprint 7.1 is a narrow production-hardening pass after marketplace readiness. It fixes validated review issues without changing Queue Sentinel's product story or adding moderation powers.

## Fixed

- Batched Redis playtest signal upserts so signal IDs are read once, signal values are written together, and the index is written once.
- Batched Redis demo incident seeding and recompute upserts where practical.
- Returned safe 400 responses for malformed or non-object scoring recompute JSON bodies.
- Replaced count-based audit log IDs with collision-resistant timestamp plus random suffix IDs.
- Always normalized external author keys into hashed internal keys, including values that already start with `author-`.
- Commented and tested `preferScoredIncidents` so stale playtest incidents do not override a synthetic preview after playtest reset.
- Documented the server-side incident materializer import boundary.
- Documented that the scoring model version remains intentionally frozen for the hackathon build.

## Safety Boundaries

- No approve, remove, lock, ban, mute, flair enforcement, Reddit escalation, webhook, AI decisioning, notification, external analytics, or automatic enforcement path was added.
- Read-only ingestion remains disabled by default.
- Mutation routes remain guarded by moderator authorization or explicit local/test bypass.
- Full post/comment bodies are still rejected and are not persisted.
- Audit entries still avoid raw usernames and store safe actor context only.

Sprint 7.1 targets `main` directly and builds on the merged Sprint 7 marketplace readiness foundation.
