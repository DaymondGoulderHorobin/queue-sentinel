# Queue Sentinel Submission Copy

## App Name

Queue Sentinel

## Tagline

Explainable queue triage for human moderation teams.

## One Sentence Summary

Queue Sentinel turns noisy report queues into clustered, scored incident cards so moderators can decide what to inspect first.

## Short Description

Queue Sentinel is a Devvit moderation workbench for private playtests and demos. It groups related metadata-only queue signals, explains priority factors, and keeps every moderation decision human-in-the-loop.

## Long Description

Moderators often face scattered reports that describe the same underlying issue across posts, comments, domains, rules, or time windows. Queue Sentinel helps by collapsing safe queue metadata into incident cards with deterministic clustering, priority scoring, factor explanations, provenance labels, diagnostics, and an audit trail of Queue Sentinel operations.

The current build is designed for review, private playtest, and hackathon submission readiness. It supports synthetic demo data, guarded fixture packs, disabled-by-default read-only playtest ingestion, moderator authorization checks for Queue Sentinel mutations, and browser fallback copy that clearly distinguishes local demo data from live API state.

Queue Sentinel does not make Reddit moderation decisions. It does not approve, remove, lock, ban, mute, enforce flair, escalate to Reddit, call AI decisioning, send webhooks, send notifications, or run automatic enforcement. Scores are triage context only.

## Target Users

- Reddit moderators who need to triage noisy queues quickly.
- Mod teams preparing a safer review workflow for high-volume reports.
- Reviewers or judges evaluating explainable, human-in-the-loop moderation tooling.

## Problem Statement

Queue reports can arrive as separate items even when they describe the same wave of behavior. Without grouping, moderators spend time opening repetitive reports, guessing which clusters matter, and explaining why one incident should be reviewed before another.

## Solution Summary

Queue Sentinel provides a workbench that:

- Builds incident cards from synthetic demo signals or accepted read-only playtest metadata.
- Clusters related signals by item, thread, rule area, author key, domain, and time windows.
- Scores incidents deterministically with visible factor contributions.
- Shows provenance labels and rationale copy so moderators understand the source of each score.
- Keeps internal status updates separate from Reddit moderation actions.
- Records safe Queue Sentinel operation metadata for review.

## Feature List

- Dashboard with Judge Demo Mode and a one-minute review flow.
- Incidents list with filters, sorting, priority labels, provenance, and selected preview.
- Case Card with cluster summary, score factors, rationale draft, timeline, and disabled action boundary.
- Metrics page for scoring and ingestion impact.
- Settings diagnostics with runtime, store, authorization, ingestion, audit, and fixture pack state.
- Metadata-only fixture preview, seed, recompute, audit, and reset flow for private playtests.
- Browser fallback mode that uses synthetic data and states that live API services are unavailable.

## Safety Posture

- Human-in-the-loop only.
- No automatic enforcement.
- No AI decisions.
- No webhooks or external notifications.
- No Reddit approve, remove, lock, ban, mute, flair enforcement, or escalation paths.
- Read-only ingestion is disabled by default and requires explicit flags plus an allowlisted private test subreddit.
- Mutation routes require moderator authorization or an explicit local/test bypass.

## Privacy Posture

Queue Sentinel stores only the metadata needed for demo and private playtest review: incident records, accepted read-only metadata signals, safe diagnostics counts, operation audit metadata, and hashed actor context. It does not store full post/comment bodies, raw usernames in audit entries, external command payloads, webhook payloads, or AI decision records.

## Limitations

- The current build is intended for demos, reviewer evaluation, and private subreddit playtests.
- Production subreddit ingestion outside the allowlisted read-only path is out of scope.
- Marketplace submission details that depend on current Reddit review policy require manual verification.
- Browser-only shell mode is for UI review and cannot prove live authorization, Redis persistence, or audit writes.

## Support and Contact

For review, use the repository README, playtest runbook, privacy and safety document, release checklist, and PR evidence notes. For marketplace submission, confirm current Devvit requirements before publishing.
