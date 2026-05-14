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
- Screenshot or concise description of Dashboard, Incident workbench, and Case Card.
- Any Devvit warnings or local playtest limitations.

## Acceptance Criteria

- Repository scaffold includes Devvit config, source, docs, tests, and ignore files.
- App shell runs through the documented Devvit workflow.
- Dashboard displays Queue Sentinel branding, navigation, queue pressure metrics, top incident, and priority distribution.
- At least eight safe mock incidents are available and visible.
- Incidents page supports search, filters, sorting, selection, selected preview, and empty state.
- Case Card page follows the selected incident and includes context, signals, timeline, rationale draft, and disabled actions.
- Server exposes a health route and mock incidents route.
- `incidentStore` exists as the future Redis storage boundary.
- README documents install, run, build, and test commands.
- No real approve, remove, lock, ban, or escalation actions are active.
- PR remains focused on foundation and scaffold only.

## Hackathon Fit

- Does the shell communicate a serious moderation workbench?
- Is the human-in-the-loop workflow obvious?
- Is the scope narrow enough to support Sprint 1 without refactor?
- Are policy and safety risks low for this foundation PR?
