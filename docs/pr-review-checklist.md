# PR Review Checklist

Use this checklist when asking ChatGPT to review Queue Sentinel pull requests.

## Required Context

- PR title and summary.
- Changed file tree.
- Install output from `npm install`.
- Build output from `npm run build`.
- Full check output from `npm run check`.
- Screenshot or concise description of Dashboard, Incidents, Case Card, Metrics, Settings, and recompute demo scoring.
- Store mode notes: Redis, memory fallback, or browser-shell fallback.
- Branch/base note when Sprint 3 is stacked on Sprint 2.
- Any Devvit warnings or local playtest limitations.

## Acceptance Criteria

- App shell runs through the documented Devvit workflow.
- Safe synthetic queue signals exist separately from live Reddit data.
- Dashboard shows deterministic scoring active, model version, signals processed, clusters formed, average score, top scored incident, refresh, and recompute controls.
- Ten safe scored demo incidents are available after seed, reset, or recompute.
- Incidents page supports search, filters, sorting, selection, selected preview, refresh, loading/error/empty states, score display, cluster summary, and internal status updates.
- Case Card follows the selected incident and includes context, timeline, rationale draft, score breakdown, cluster summary, internal status, and disabled Reddit-facing actions.
- Metrics shows signals processed, clusters formed, average score, duplicate signals collapsed, high-priority share, and rule areas surfaced.
- Settings exposes refresh, seed demo, reset demo, and recompute demo scoring controls with safe synthetic-only copy.
- Server exposes typed health, list, detail, status update, metadata update, seed, reset, scoring preview, and scoring recompute routes.
- Preview route does not mutate store state.
- Recompute route persists only scored demo incident state and rejects external scoring inputs.
- Clustering and scoring are deterministic and covered by tests.
- No real approve, remove, lock, ban, Reddit escalation, webhook, AI, external integration, or ingestion actions are active.
- README documents install, run, build, test, Sprint 3 limitations, and stacked base if applicable.
- PR remains focused on deterministic clustering, priority scoring, API, UI, docs, and tests.

## Manual Review

- Open Dashboard and confirm scoring metrics, top scored incident, model badge, refresh, and recompute action render.
- Open Incidents and confirm score/cluster details appear on cards and preview while search/filter/sort still work.
- Recompute demo scoring from Dashboard or Settings and confirm the incident count remains 10.
- Open Case Card and confirm score breakdown, factor explanations, cluster summary, and disabled Reddit action buttons.
- Open Metrics and confirm scoring impact metrics render.
- Seed/reset from Settings and confirm scored demo data returns.
- Change an incident status and confirm it updates Queue Sentinel state only.
- Check a 390px mobile viewport for readable text and non-overlapping controls.
- Confirm browser console has no app errors.

## Hackathon Fit

- Does the shell communicate a serious moderation workbench?
- Is the human-in-the-loop workflow obvious?
- Does deterministic scoring make the product materially smarter without enabling unsafe actions?
- Is the scope narrow enough to support read-only Reddit ingestion later?
- Are policy and safety risks low for this PR?
