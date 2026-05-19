# Queue Sentinel Release Checklist

Use this checklist before a hackathon submission, reviewer handoff, or Devvit marketplace review request.

## Dependency and Build Preflight

- Confirm Node.js satisfies `>=22.2.0`.
- Install dependencies:

```bash
npm install
```

- Run all quality gates:

```bash
npm run check
```

- Build the Devvit bundle:

```bash
npm run build
```

- Start a Devvit playtest when authenticated:

```bash
npm run dev
```

- Start the browser-only shell for UI review:

```bash
npm run dev:shell
```

## Submission Assets

- Capture Dashboard with Judge Demo Mode.
- Capture Settings diagnostics, readiness summary, fixture preview, seed, recompute, audit, and reset controls.
- Capture Incidents, Case Card, Metrics, and disabled action boundary.
- Record the 60 second video using `docs/demo-video-script.md`.
- Fill out `docs/demo-evidence.md`.
- Confirm `docs/submission-copy.md` is current.
- Confirm `docs/privacy-and-safety.md` is current.
- Confirm known limitations are included in README and submission copy.

## Environment Matrix

| Mode | Required settings | Expected behavior | Evidence |
| --- | --- | --- | --- |
| Browser fallback | `npm run dev:shell` without Devvit API | Synthetic demo data only; no Redis, authorization, audit writes, or playtest mutations. | Dashboard and Settings fallback copy. |
| Local memory mode | Optional `QUEUE_SENTINEL_STORE_MODE=memory` | Devvit server uses memory adapters; data resets on restart. | Diagnostics store modes. |
| Private playtest mode | `QUEUE_SENTINEL_ENABLE_READONLY_INGESTION=true`, `QUEUE_SENTINEL_INGESTION_MODE=playtest-readonly`, allowlisted private subreddit, moderator context or local/test bypass | Metadata preview, authorized seed/reset, scoring recompute, and safe audit entries. | Settings diagnostics and audit entries. |
| Production-safe default mode | No ingestion flag and no local mutation bypass | Ingestion disabled; mutations require moderator authorization; no enforcement actions. | Diagnostics, denied mutation route, disabled controls. |

## Devvit and App Config

- Confirm `devvit.json` app name is `queue-sentinel`.
- Confirm post entrypoint is `dist/client/app.html`.
- Confirm server entrypoint is `dist/server/index.cjs`.
- Confirm menu item is moderator-only and points to `/internal/menu/post-create`.
- Confirm package scripts include `login`, `dev`, `dev:shell`, `build`, `check`, `deploy`, and `launch`.
- Run `npm run login` before Devvit playtest or publish work.

## Documentation Checks

- README links to the runbook, evidence template, privacy and safety doc, submission copy, demo script, release checklist, and Devvit publish readiness checklist.
- `docs/playtest-runbook.md` still matches the current private playtest flow.
- `docs/pr-review-checklist.md` mentions the current sprint, branch/base, safety, CI, and browser review evidence.
- `docs/sprint-7-1-hardening-notes.md` summarizes Redis batching, scoring JSON handling, audit ID, author-key hashing, and stale preview behavior.
- `docs/sprint-7-2-notes.md` summarizes the final polish fixes, 100 item ingestion cap, shared helpers, and unchanged safety boundaries.
- Known limitations are visible and do not overstate production ingestion or enforcement.

## Do Not Submit Unless

- `npm run check` passes.
- `npm run build` passes.
- CI passes on the pull request.
- Read-only ingestion remains disabled by default.
- Mutation routes remain guarded.
- No approve, remove, lock, ban, mute, flair enforcement, Reddit escalation, webhook, AI decisioning, notification, or automatic enforcement path is present.
- No full post/comment bodies or raw usernames are stored in audit entries.
- Accepted author keys are hashed and not stored in readable form.
- Browser fallback copy does not imply live Reddit data.
- Submission screenshots or notes cover Dashboard, Judge Demo Mode, Settings diagnostics, Case Card, audit log, and reset.
