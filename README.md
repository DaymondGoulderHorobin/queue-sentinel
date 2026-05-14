# Queue Sentinel

Queue Sentinel is a Reddit Devvit moderation workbench for noisy mod queues. Sprint 0 creates the foundation only: a Devvit Web scaffold, typed mock incident data, a responsive app shell, server route boundaries, storage and scoring seams, docs, and review checklists.

The eventual product will help moderators collapse duplicate reports into explainable incident cards, rank queue pressure, and keep all enforcement decisions human-in-the-loop. Sprint 0 does not perform real moderation actions.

## Sprint Status

- Sprint: `0 - Foundation and Scaffold`
- Branch: `sprint-0-foundation-scaffold`
- Devvit pattern: Devvit Web with `src/client`, `src/server`, and `src/shared`
- Data: safe mock incidents only
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

Run all Sprint 0 quality gates:

```bash
npm run check
```

Publish later, after review and real Devvit app setup:

```bash
npm run deploy
npm run launch
```

## Implemented in Sprint 0

- Devvit-compatible `devvit.json` and Vite build setup.
- Responsive Queue Sentinel app shell with Dashboard, Incidents, Case Card, Metrics, and Settings views.
- Three safe mock incidents with typed contracts.
- Hono server entry with `/api/health` and `/api/incidents` routes.
- `incidentStore` boundary prepared for future Redis-backed data.
- `priorityScoring` boundary with placeholder scoring behavior only.
- Documentation for architecture, Sprint 0 notes, and PR review.
- Smoke tests for mock data and placeholder scoring.

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
tests/      Sprint 0 smoke tests
docs/       Architecture, sprint notes, and PR review checklist
```

## Pull Request Evidence

For ChatGPT review, include:

- PR title and summary.
- Changed file tree.
- Output from `npm install`, `npm run build`, `npm run type-check`, `npm run lint`, and `npm run test`.
- Screenshot or short description of the visible app shell.
- Any Devvit warnings, setup limitations, or template deviations.
