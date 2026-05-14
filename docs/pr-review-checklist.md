# PR Review Checklist

Use this checklist when asking ChatGPT to review Queue Sentinel pull requests.

## Required Context

- PR title and summary.
- Changed file tree.
- Install output from `npm install`.
- Build output from `npm run build`.
- Type-check output from `npm run type-check`.
- Lint output from `npm run lint`.
- Test output from `npm run test`.
- Screenshot or concise description of Dashboard, Incidents, Case Card, and Settings demo controls.
- Store mode notes: Redis, memory fallback, or browser-shell fallback.
- Any Devvit warnings or local playtest limitations.

## Acceptance Criteria

- App shell runs through the documented Devvit workflow.
- Dashboard loads incident data through `/api/incidents` when the server is available and falls back safely in browser-only preview.
- Dashboard shows queue pressure metrics, top incident, priority distribution, API/fallback state, and refresh control.
- Ten safe demo incidents are available after seed or reset.
- Incidents page supports search, filters, sorting, selection, selected preview, refresh, loading/error/empty states, and internal status updates.
- Case Card follows the selected incident and includes context, signals, timeline, rationale draft, internal status, and disabled Reddit-facing actions.
- Settings exposes refresh, seed demo, and reset demo controls with visible store mode and count.
- Server exposes typed health, list, detail, status update, metadata update, seed, and reset routes.
- Store abstraction supports Redis and memory modes without changing route or client contracts.
- Unsafe metadata updates and invalid statuses are rejected by route tests.
- No real approve, remove, lock, ban, Reddit escalation, webhook, or ingestion actions are active.
- README documents install, run, build, test, and Sprint 2 limitations.
- PR remains focused on persistence, API contracts, and safe demo seeding.

## Manual Review

- Open Dashboard and confirm it renders incident metrics, top incident, data source badge, and refresh action.
- Open Incidents and confirm search/filter/sort still work with persisted data.
- Seed demo and reset demo from Settings, then confirm the count returns to 10.
- Change an incident status and confirm it updates Queue Sentinel state only.
- Open Case Card and confirm all Reddit action buttons remain disabled.
- Check a 390px mobile viewport for readable text and non-overlapping controls.
- Confirm browser console has no app errors.

## Hackathon Fit

- Does the shell communicate a serious moderation workbench?
- Is the human-in-the-loop workflow obvious?
- Is the persistence/API step useful without enabling unsafe actions?
- Is the scope narrow enough to support later ingestion and scoring work without refactor?
- Are policy and safety risks low for this PR?
