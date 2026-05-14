# Sprint 0 Notes

Sprint 0 created the Queue Sentinel foundation and scaffold.

## Implemented

- Devvit Web configuration with a post entrypoint and server bundle.
- TypeScript, Vite, ESLint, Prettier, and Vitest setup.
- Responsive React app shell with Dashboard, Incidents, Case Card, Metrics, and Settings.
- Typed mock incident contract and three safe demo incidents.
- Hono health and mock incidents routes.
- Devvit moderator menu route for creating a workbench post.
- Storage and priority scoring boundaries for future Redis and ranking work.
- Documentation and PR review checklist.

## Not Implemented

- Real report clustering.
- Real priority scoring.
- Redis persistence.
- Real Reddit triggers.
- Real moderation actions.
- External integrations.

## Sprint 1 Should Build

- A stronger queue workbench layout using the existing navigation and incident types.
- Better incident list density, filtering, and priority presentation.
- First-pass visual polish for case cards.
- Mock-data-driven dashboard behavior before adding Redis.

## Template Deviations

The scaffold keeps the current Devvit React template split and Vite plugin, but replaces the starter counter/game example with a moderation workbench shell. It uses a single `app.html` post entrypoint rather than separate starter splash/game pages. Browser-only UI preview uses `vite.shell.config.ts` so Vitest and local Vite review do not load the Devvit build-only plugin.
