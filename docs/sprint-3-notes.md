# Sprint 3 Notes: Clustering and Priority Scoring

Sprint 3 introduces Queue Sentinel's first deterministic intelligence layer. It clusters safe synthetic queue signals, scores the resulting incidents, and surfaces explainable triage context throughout the workbench.

## Added

- `QueueSignal`, `ClusterSummary`, `ScoreFactor`, and `PriorityScore` contracts.
- Safe synthetic signal dataset in `src/shared/demoSignals.ts`.
- Deterministic clustering for exact item, thread/rule, domain/rule, author/rule, and rule-area time-window signals.
- Safety-adjacent isolation for privacy/safety signals unless stronger grouping evidence exists.
- Deterministic scoring model `sprint-3-deterministic-v1` with report volume, queue age, related items, cluster density, rule severity, status, and confidence factors.
- Materialization from clusters into scored `QueueIncident` objects.
- Scoring preview and recompute demo API routes.
- API-first client recompute flow with deterministic local fallback.
- Dashboard, Incidents, Case Card, Metrics, and Settings score/cluster UI.
- Clustering, scoring, materialization, route, and safety tests.

## Safety Boundaries

- Scoring uses synthetic demo signals only.
- Preview does not mutate the store.
- Recompute upserts Queue Sentinel demo incidents only.
- External scoring inputs are rejected.
- No Reddit ingestion, approve, remove, lock, ban, escalation, webhook, AI, notification, or external integration path is active.
- Score and confidence labels are triage aids, not claims of wrongdoing.

## Branch Note

Sprint 3 was started from `sprint-2-persistence-api-demo-seeding` because Sprint 2 was not merged into `main` locally when this work began. Rebase onto `main` after Sprint 2 lands if needed.

## Sprint 4 Handoff

The best next step is a read-only Reddit event ingestion adapter and demo playtest hardening. Keep enforcement disabled while adding controlled ingestion, moderator authorization checks, and stronger runtime review.
