# Sprint 7 Notes: Marketplace Readiness and Production Packaging

Sprint 7 turns the Sprint 6 private playtest and judge-demo build into a submission-ready product candidate. The work is intentionally packaging, documentation, production-safe defaults, and reviewer clarity.

## Added

- Submission copy for Devpost, app listing, or hackathon form reuse.
- Demo video script with 60 second and 2 minute versions.
- Release checklist with dependency, build, CI, Devvit, screenshot, and safety preflight checks.
- Privacy and safety document for reviewers and moderators.
- Devvit publish readiness checklist based on local project config and CLI help.
- Settings readiness summary for demo, private playtest, production-safe default, browser fallback, and authorization state.

## Safety Boundaries

- No approve, remove, lock, ban, mute, flair enforcement, Reddit escalation, webhook, AI decisioning, notification, external messaging, analytics, or automatic enforcement path is active.
- Read-only ingestion remains disabled by default.
- Mutation routes remain guarded by moderator authorization or explicit local/test bypass.
- No full post/comment bodies or raw usernames are stored in audit entries.
- Browser fallback copy remains explicit about synthetic local data.

## Validation Targets

- `npm run check`
- `npm run build`
- Browser shell review for Dashboard, Judge Demo Mode, Settings readiness, fallback copy, docs links in README, and a 390px viewport.

Sprint 7 targets `main` directly and builds on the merged Sprint 6 demo hardening foundation.
