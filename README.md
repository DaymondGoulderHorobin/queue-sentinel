# Queue Sentinel

Queue Sentinel is a Reddit Devvit moderation workbench for noisy mod queues. Sprint 1 builds on the Devvit Web foundation with a polished, mock-data-driven queue triage workbench.

The eventual product will help moderators collapse duplicate reports into explainable incident cards, rank queue pressure, and keep all enforcement decisions human-in-the-loop. Sprint 1 still does not perform real moderation actions.

## Sprint Status

- Sprint: `1 - Core Queue Workbench UI`
- Branch: `sprint-1-core-workbench-ui`
- Devvit pattern: Devvit Web with `src/client`, `src/server`, and `src/shared`
- Data: safe mock incidents only, expanded for search/filter/sort demos
- Moderation actions: disabled placeholders only

## Requirements

- Node.js `>=22.2.0`
- npm
- Reddit Devvit CLI access through the `devvit` package

## Commands

Install dependencies:

```bash
npm install
```

Run the Devvit playtest workflow:

```bash
npm run login
npm run dev
```

Run a browser-only shell preview for UI review:

```bash
npm run dev:shell
```

Then open the Vite URL and navigate to `/src/client/app.html` if Vite does not open the nested entry automatically.

Build the Devvit bundle:

```bash
npm run build
```

Run static checks:

```bash
npm run type-check
npm run lint
npm run test
```

Run all quality gates:

```bash
npm run check
```

Publish later, after review and real Devvit app setup:

```bash
npm run deploy
npm run launch
```

## Implemented

- Devvit-compatible `devvit.json` and Vite build setup.
- Responsive Queue Sentinel workbench with Dashboard, Incidents, Case Card, Metrics, and Settings views.
- Ten safe mock incidents with typed contracts, tags, signal labels, review guidance, and timeline events.
- Hono server entry with `/api/health` and `/api/incidents` routes.
- `incidentStore` boundary prepared for future Redis-backed data.
- `priorityScoring` boundary with placeholder scoring behavior only.
- Search, filtering, sorting, selected incident preview, priority distribution, and mock metric aggregation.
- Documentation for architecture, Sprint 0 notes, Sprint 1 notes, and PR review.
- Smoke and helper tests for mock data, placeholder scoring, filtering, sorting, and metrics.

## Not Implemented Yet

- Real incident clustering.
- Real priority scoring.
- Redis persistence.
- Reddit event triggers.
- Approve, remove, lock, ban, escalation, or other live moderation actions.
- External Slack, Discord, webhook, or analytics integrations.

## Project Layout

```text
src/
  client/   React app shell, components, pages, and CSS
  server/   Hono server routes, Devvit menu handler, service boundaries
  shared/   Shared constants, mock data, and TypeScript contracts
tests/      Smoke and workbench helper tests
docs/       Architecture, sprint notes, and PR review checklist
```

## Pull Request Evidence

For ChatGPT review, include:

- PR title and summary.
- Changed file tree.
- Output from `npm install`, `npm run build`, `npm run type-check`, `npm run lint`, and `npm run test`.
- Screenshot or short description of the visible app shell.
- Any Devvit warnings, setup limitations, or template deviations.
