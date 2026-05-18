# Queue Sentinel Demo Video Script

## 60 Second Script

| Time | Screen | Action | Narration | Proof Point |
| --- | --- | --- | --- | --- |
| 0:00-0:08 | Dashboard | Show Queue Sentinel and Judge Demo Mode. | "Queue Sentinel turns noisy report queues into explainable incident cards for human moderator triage." | Product purpose and human-in-the-loop framing. |
| 0:08-0:16 | Settings diagnostics | Refresh diagnostics. | "The app shows runtime, store, ingestion, authorization, and audit state before any playtest action." | Readiness and authorization visibility. |
| 0:16-0:26 | Settings ingestion | Preview a fixture pack, then seed when authorized. | "Read-only ingestion is disabled by default and only accepts allowlisted metadata in a private playtest." | Metadata-only, guarded playtest flow. |
| 0:26-0:34 | Dashboard or Settings | Recompute scoring. | "Scoring is deterministic triage context. It does not call AI or make moderation decisions." | Explainable scoring boundary. |
| 0:34-0:45 | Case Card | Open the highest-priority incident. | "The Case Card shows provenance, score factors, cluster summary, and rationale for review." | Inspectable explanation. |
| 0:45-0:54 | Settings audit | Show recent audit entries. | "Audit entries record Queue Sentinel operations and safe counts only." | Metadata-only audit. |
| 0:54-1:00 | Settings reset and Case Card actions | Reset signals and show disabled action boundary. | "There are no approve, remove, ban, webhook, AI, notification, or automatic enforcement paths." | Safety proof. |

## Optional 2 Minute Extended Script

| Screen | Action | Narration | Proof Point |
| --- | --- | --- | --- |
| Dashboard | Open with Judge Demo Mode visible. | "The first view is the actual workbench, not a landing page. The guided sequence helps a judge or moderator understand the demo in order." | Submission-ready flow. |
| Dashboard metrics | Point out model, provenance, signals, clusters, and top incident. | "Every score has provenance and model context. These numbers help decide what to inspect first." | Triage context only. |
| Settings readiness | Show demo, private playtest, production-safe, fallback, and authorization states. | "Sprint 7 packages the product for review by making operating modes explicit." | Production-safe defaults. |
| Settings diagnostics | Refresh diagnostics. | "Mutation routes are unavailable unless a moderator context or explicit local bypass is present." | Authorization guard. |
| Settings fixture pack | Preview fixture metadata. | "Preview runs the normalizer without writing to the signal store." | Non-mutating preview. |
| Settings fixture pack | Seed playtest signals when authorized. | "Seed writes accepted metadata-only signals to Queue Sentinel's signal store." | No Reddit moderation state mutation. |
| Dashboard or Settings | Recompute scoring. | "When playtest signals exist, scoring uses them; otherwise it falls back to synthetic demo signals." | Predictable scoring source. |
| Incidents | Open the top scored incident. | "The list groups related reports and preserves search, filters, sorting, and provenance labels." | Usable queue workflow. |
| Case Card | Show factors, cluster summary, rationale, timeline, and disabled actions. | "Moderators see why the card is prioritized while all Reddit-facing actions remain disabled." | Explainability and safety. |
| Settings audit | Show recent safe operations. | "Audit logs are internal Queue Sentinel operation logs, not Reddit moderation logs." | Privacy posture. |
| Settings reset | Reset playtest signals. | "The playtest can be reset cleanly for the next reviewer." | Repeatable demo. |

## Safety Proof Lines

- "Scores are triage context, not allegations or enforcement recommendations."
- "Read-only ingestion is disabled by default."
- "Audit entries store safe operation metadata, not raw usernames or full content."
- "No AI decisions, webhooks, notifications, or automatic enforcement are active."
- "Mutation routes remain guarded by moderator authorization or an explicit local/test bypass."
