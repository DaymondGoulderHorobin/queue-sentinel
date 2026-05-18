# PR Review Checklist

Use this checklist when asking ChatGPT to review Queue Sentinel pull requests.

## Required Context

- PR title and summary.
- Changed file tree.
- Install output from `npm install`.
- Build output from `npm run build`.
- Full check output from `npm run check`.
- Screenshot or concise description of Dashboard, Judge Demo Mode, Incidents, Case Card, Metrics, Settings, diagnostics, ingestion controls, audit log, and recompute scoring.
- Store mode notes: Redis, memory fallback, or browser-shell fallback.
- Read-only ingestion mode, allowlist, and signal store notes.
- Authorization mode and local/test bypass notes.
- Branch/base note confirming Sprint 7 targets `main`.
- Any Devvit warnings or local playtest limitations.

## Acceptance Criteria

- App shell runs through the documented Devvit workflow.
- Safe synthetic queue signals exist separately from live Reddit data.
- Read-only ingestion is disabled by default and requires the explicit playtest flag plus allowlisted subreddit before persistence.
- Sensitive mutation routes require moderator authorization or the explicit local/test bypass.
- Denied mutation responses return a safe 403 message without private subreddit or raw user data.
- Dashboard shows Judge Demo Mode, deterministic scoring active, model version, provenance, signals processed, clusters formed, average score, top scored incident, refresh, and recompute controls.
- Ten safe scored demo incidents are available after seed, reset, or recompute.
- Incidents page supports search, filters, sorting, selection, selected preview, refresh, loading/error/empty states, score display, cluster summary, and internal status updates.
- Case Card follows the selected incident and includes provenance, context, timeline, rationale draft, score breakdown, cluster summary, internal status, and disabled Reddit-facing actions.
- Metrics shows signals ingested/accepted/rejected, clusters formed, average score, and duplicate signals collapsed.
- Settings exposes refresh, diagnostics, submission readiness summary, recent audit entries, fixture pack selection, seed demo, reset demo, ingestion status/preview/seed/reset, and recompute scored incidents controls.
- Server exposes typed health, diagnostics, audit recent, list, detail, status update, metadata update, seed, reset, ingestion status/preview/seed/reset, scoring preview, and scoring recompute routes.
- Preview routes do not mutate store state.
- Recompute route persists only Queue Sentinel incident state and rejects external scoring inputs.
- Audit logs record safe operation metadata only and cap recent reads at 25 entries.
- Fixture packs cover repost waves, heated threads, self-promo, privacy-adjacent isolation, and formatting cleanup.
- Demo flow, clustering, scoring, normalizer, ingestion routes, authorization, audit, fixture packs, docs, and signal stores are deterministic and covered by tests.
- No real approve, remove, lock, ban, Reddit escalation, webhook, AI, external integration, notification, or automatic enforcement actions are active.
- README documents install, run, build, test, Sprint 7 limitations, ingestion/auth flags, demo runbook, submission docs, release checklist, privacy and safety, Devvit publish readiness, and main-base status.
- PR remains focused on marketplace readiness, production-safe defaults, submission docs, UI copy, safety checks, and tests.

## Manual Review

- Open Dashboard and confirm Judge Demo Mode, scoring metrics, top scored incident, model badge, refresh, and recompute action render.
- Open Incidents and confirm score/cluster details appear on cards and preview while search/filter/sort still work.
- Recompute scoring from Dashboard or Settings and confirm demo scoring still falls back when no playtest signals exist.
- Open Case Card and confirm score breakdown, factor explanations, cluster summary, and disabled Reddit action buttons.
- Open Metrics and confirm scoring and ingestion impact metrics render.
- Seed/reset from Settings only when authorized and confirm scored demo data returns.
- With the playtest flags and authorization set, preview and seed selected playtest fixture packs from Settings, then confirm provenance changes to Playtest read-only.
- Open Settings diagnostics and confirm authorization mode, store modes, signal count, incident count, last run, and audit entries render.
- Open Settings and confirm Demo Mode, Private Playtest Mode, Production-Safe Default Mode, Browser Fallback, and Authorization summaries render.
- Follow `docs/playtest-runbook.md` and confirm `docs/demo-evidence.md` captures the submission assets.
- Review `docs/privacy-and-safety.md`, `docs/submission-copy.md`, `docs/demo-video-script.md`, `docs/release-checklist.md`, and `docs/devvit-publish-readiness.md`.
- Change an incident status and confirm it updates Queue Sentinel state only.
- Check a 390px mobile viewport for readable text and non-overlapping controls.
- Confirm browser console has no app errors.

## Hackathon Fit

- Does the shell communicate a serious moderation workbench?
- Is the human-in-the-loop workflow obvious?
- Does deterministic scoring make the product materially smarter without enabling unsafe actions?
- Is the read-only ingestion path narrow, authorized, auditable, and easy to disable?
- Is the submission package credible for a reviewer or moderator without overstating current capabilities?
- Are policy and safety risks low for this PR?
