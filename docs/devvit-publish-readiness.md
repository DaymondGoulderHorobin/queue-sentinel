# Devvit Publish Readiness

This document records what is visible locally for Queue Sentinel publish preparation. It is not a substitute for current Reddit Devvit marketplace or review guidance.

Where current marketplace requirements are not visible in local config or CLI help, manual verification required.

## Current App Config

`devvit.json` currently declares:

- App name: `queue-sentinel`.
- Post entrypoint: `dist/client/app.html`.
- Server bundle: `dist/server/index.cjs`.
- Moderator menu item: `Open Queue Sentinel`.
- Menu endpoint: `/internal/menu/post-create`.
- Menu location: subreddit.
- Menu user type: moderator.

These settings match the intended product shape: a moderator-opened Queue Sentinel workbench post with a Devvit Web client and Hono server.

## Local Scripts

`package.json` exposes:

- `npm run login` for Devvit login.
- `npm run dev` for `devvit playtest`.
- `npm run dev:shell` for the browser-only Vite shell.
- `npm run check` for type-check, lint, and tests.
- `npm run build` for the Devvit bundle.
- `npm run deploy` for `npm run check && devvit upload`.
- `npm run launch` for `npm run deploy && devvit publish`.

## CLI Commands Observed Locally

The locally installed Devvit CLI is `@devvit/cli/0.12.23`. Its help output includes:

- `devvit login`
- `devvit playtest`
- `devvit upload`
- `devvit publish`
- `devvit install`
- `devvit list apps`
- `devvit list installs`
- `devvit view`
- `devvit logs`

Use the package scripts where possible so checks run before upload or publish.

## Manual Publish Checklist

- Confirm current Reddit Devvit app directory or marketplace requirements.
- Confirm app owner and authenticated Reddit account with `npm run login`.
- Confirm the target subreddit is private or explicitly approved for playtest.
- Confirm screenshots and demo video are ready.
- Confirm README, privacy and safety, release checklist, runbook, and submission copy are current.
- Run `npm run check`.
- Run `npm run build`.
- Run `npm run dev` for a private playtest.
- Run `npm run deploy` only when ready to upload for review.
- Run `npm run launch` only after manual confirmation that publish is appropriate.

## Required Screenshots and Assets

- Dashboard with Judge Demo Mode.
- Settings diagnostics and submission readiness summary.
- Fixture preview and seed controls.
- Scoring recompute state.
- Case Card with score factors, cluster summary, and disabled action boundary.
- Audit log and reset controls.
- Browser fallback state if using the Vite shell for UI screenshots.

## Environment Notes

- Default production-safe mode leaves read-only ingestion disabled.
- Private playtest mode requires the explicit ingestion flag and an allowlisted subreddit.
- Local mutation bypass must be used only for tests or local demos.
- Browser fallback mode is useful for UI review but cannot prove live server behavior.

## Unknowns Requiring Manual Verification

- Current Reddit app directory review requirements.
- Required marketplace imagery, icon sizes, copy length limits, and category fields.
- Whether the app needs additional reviewer notes beyond README and docs.
- Whether a specific subreddit install target is required before publish review.
- Whether publish requires additional settings in the Reddit developer dashboard.
