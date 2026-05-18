# Queue Sentinel Demo Evidence

Use this template to collect judge-demo assets and private playtest proof.

## Screenshot List

- Dashboard with Judge Demo Mode visible.
- Dashboard top scored incident and priority metrics.
- Incidents list with selected incident preview.
- Case Card score factors, cluster summary, provenance, rationale draft, and disabled action panel.
- Metrics page showing signals processed, clusters formed, average score, and collapsed signals.
- Settings diagnostics with runtime, store modes, authorization state, and signal count.
- Settings fixture selector and read-only ingestion controls.
- Settings recent audit log.

## 60 Second Video Shot List

1. Dashboard: show the product promise and Judge Demo Mode.
2. Settings: refresh diagnostics and confirm read-only playtest readiness.
3. Settings: preview and seed a fixture pack when authorized.
4. Dashboard or Settings: recompute scoring.
5. Dashboard: open the highest-priority incident.
6. Case Card: show score factors, cluster summary, provenance, rationale draft, and disabled actions.
7. Settings: show recent audit entries.
8. Settings: reset playtest signals.

## Safety Proof Points

- Moderation actions are disabled in the visible UI.
- Mutation routes require moderator authorization or the explicit local/test bypass.
- Audit entries include safe operation metadata and counts only.
- Read-only ingestion rejects body/content fields and unsafe command fields.
- No AI decisioning is active; deterministic scoring is triage context.
- No webhook, notification, external messaging, or automatic enforcement path is active.

## Impact Proof Points

- Duplicate signals collapsed.
- Clusters formed from related metadata.
- Top scored incident surfaced with clear reasons.
- Priority distribution makes queue pressure scannable.
- Recommended review focus gives moderators a first place to inspect.
- Provenance labels distinguish synthetic demo and playtest read-only signals.

## Known Limitations

- Private playtest metadata only.
- No production subreddit ingestion outside the allowlisted read-only playtest path.
- No live enforcement.
- No webhooks.
- No notifications.
- No external analytics.
- No full post or comment body persistence.
