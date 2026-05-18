import type {
  ApiSource,
  DiagnosticsResponse,
  IngestionStatusResponse,
  ScoringPreviewResponse,
} from './apiTypes';
import type { AuditLogEntry, QueueIncident } from './types';

export type DemoFlowStepState = 'blocked' | 'ready' | 'complete' | 'fallback';

export type DemoFlowStepId =
  | 'refresh-diagnostics'
  | 'confirm-readiness'
  | 'preview-fixture'
  | 'seed-playtest'
  | 'recompute-scoring'
  | 'inspect-incident'
  | 'review-audit'
  | 'reset-playtest';

export interface DemoFlowStep {
  id: DemoFlowStepId;
  title: string;
  description: string;
  state: DemoFlowStepState;
  actionLabel?: string | undefined;
}

interface DemoFlowInput {
  auditEntries: readonly AuditLogEntry[];
  dataStatus: 'loading' | ApiSource;
  diagnostics: DiagnosticsResponse;
  incidents: readonly QueueIncident[];
  ingestionStatus: IngestionStatusResponse;
  scoringPreview: ScoringPreviewResponse;
}

const isPlaytestReady = (ingestionStatus: IngestionStatusResponse) =>
  ingestionStatus.config.enabled &&
  ingestionStatus.config.mode === 'playtest-readonly' &&
  ingestionStatus.config.allowlistConfigured;

const hasPlaytestIncident = (incidents: readonly QueueIncident[]) =>
  incidents.some(
    (incident) => incident.ingestionProvenance?.source === 'playtest-readonly',
  );

const completedOperation = (
  auditEntries: readonly AuditLogEntry[],
  operation: AuditLogEntry['operation'],
) =>
  auditEntries.some(
    (entry) => entry.operation === operation && entry.outcome === 'completed',
  );

export const buildDemoFlowSteps = ({
  auditEntries,
  dataStatus,
  diagnostics,
  incidents,
  ingestionStatus,
  scoringPreview,
}: DemoFlowInput): DemoFlowStep[] => {
  const fallbackMode =
    dataStatus === 'fallback' || diagnostics.source === 'fallback';
  const playtestReady = isPlaytestReady(ingestionStatus);
  const mutationsAllowed = diagnostics.authorization.mutationsAllowed;
  const signalCount = ingestionStatus.signalCount;
  const hasSignals = signalCount > 0;
  const hasPlaytestScoring =
    scoringPreview.signalSource === 'playtest-readonly' ||
    hasPlaytestIncident(incidents);
  const hasAuditEntries = auditEntries.length > 0;
  const resetCompleted =
    signalCount === 0 && completedOperation(auditEntries, 'playtest.reset');

  if (fallbackMode) {
    return [
      {
        id: 'refresh-diagnostics',
        title: 'Refresh diagnostics',
        description:
          'The browser shell is using synthetic fallback data; live API, Redis, authorization, and audit writes are unavailable.',
        state: 'fallback',
        actionLabel: 'Retry diagnostics',
      },
      {
        id: 'confirm-readiness',
        title: 'Confirm playtest readiness',
        description:
          'Run the Devvit server with playtest flags to verify ingestion and authorization against the private subreddit.',
        state: 'fallback',
      },
      {
        id: 'preview-fixture',
        title: 'Preview fixture metadata',
        description:
          'Fixture preview is disabled in browser fallback because no server normalizer is reachable.',
        state: 'fallback',
      },
      {
        id: 'seed-playtest',
        title: 'Seed playtest metadata',
        description:
          'Mutation controls are intentionally disabled until the server confirms authorization.',
        state: 'fallback',
      },
      {
        id: 'recompute-scoring',
        title: 'Recompute scoring',
        description:
          'Fallback scoring is deterministic demo data only and does not claim live Reddit state.',
        state: 'fallback',
      },
      {
        id: 'inspect-incident',
        title: 'Inspect top incident',
        description:
          'Fallback incidents can still demonstrate score factors, clusters, provenance, and rationale copy.',
        state: 'fallback',
        actionLabel: incidents.length > 0 ? 'Inspect case card' : undefined,
      },
      {
        id: 'review-audit',
        title: 'Review audit trail',
        description:
          'No audit writes occur in browser fallback; use Devvit playtest for operation evidence.',
        state: 'fallback',
      },
      {
        id: 'reset-playtest',
        title: 'Reset playtest signals',
        description:
          'Reset is blocked in fallback mode because no signal store is connected.',
        state: 'fallback',
      },
    ];
  }

  return [
    {
      id: 'refresh-diagnostics',
      title: 'Refresh diagnostics',
      description:
        'Confirm runtime, store modes, authorization, ingestion state, and recent audit visibility.',
      state: 'complete',
      actionLabel: 'Refresh diagnostics',
    },
    {
      id: 'confirm-readiness',
      title: 'Confirm playtest readiness',
      description: playtestReady
        ? mutationsAllowed
          ? 'Read-only ingestion is enabled and mutation routes are authorized for this operator.'
          : 'Read-only ingestion is enabled, but moderator authorization or the explicit local bypass is still required.'
        : 'Read-only ingestion needs the explicit enable flag and an allowlisted test subreddit.',
      state: playtestReady && mutationsAllowed ? 'complete' : 'blocked',
    },
    {
      id: 'preview-fixture',
      title: 'Preview fixture metadata',
      description: playtestReady
        ? 'Normalize the selected metadata-only fixture without writing to the signal store.'
        : 'Enable read-only ingestion and the allowlist before previewing fixture metadata.',
      state: playtestReady ? 'ready' : 'blocked',
      actionLabel: playtestReady ? 'Preview fixture' : undefined,
    },
    {
      id: 'seed-playtest',
      title: 'Seed playtest metadata',
      description: hasSignals
        ? `${signalCount} accepted playtest signals are available for scoring.`
        : mutationsAllowed && playtestReady
          ? 'Persist accepted read-only fixture metadata to the signal store.'
          : 'Seeding is blocked until ingestion is enabled and mutations are authorized.',
      state: hasSignals
        ? 'complete'
        : mutationsAllowed && playtestReady
          ? 'ready'
          : 'blocked',
      actionLabel:
        !hasSignals && mutationsAllowed && playtestReady
          ? 'Seed playtest signals'
          : undefined,
    },
    {
      id: 'recompute-scoring',
      title: 'Recompute scoring',
      description: hasPlaytestScoring
        ? 'Scored incidents now use accepted playtest signals with read-only provenance.'
        : hasSignals && mutationsAllowed
          ? 'Recompute incidents from accepted playtest signals through deterministic scoring.'
          : 'Seed playtest metadata before recomputing the playtest scoring story.',
      state: hasPlaytestScoring
        ? 'complete'
        : hasSignals && mutationsAllowed
          ? 'ready'
          : 'blocked',
      actionLabel:
        !hasPlaytestScoring && hasSignals && mutationsAllowed
          ? 'Recompute scoring'
          : undefined,
    },
    {
      id: 'inspect-incident',
      title: 'Inspect top incident',
      description:
        'Open the highest-priority case card and review score factors, cluster summary, provenance, and rationale draft.',
      state: incidents.length > 0 ? 'ready' : 'blocked',
      actionLabel: incidents.length > 0 ? 'Inspect case card' : undefined,
    },
    {
      id: 'review-audit',
      title: 'Review audit trail',
      description: hasAuditEntries
        ? 'Recent operation entries are visible and capped for the private playtest.'
        : 'Run an authorized mutation to create a safe Queue Sentinel audit entry.',
      state: hasAuditEntries ? 'complete' : mutationsAllowed ? 'ready' : 'blocked',
    },
    {
      id: 'reset-playtest',
      title: 'Reset playtest signals',
      description: resetCompleted
        ? 'Playtest signals have been cleared and the reset operation is audited.'
        : hasSignals && mutationsAllowed
          ? 'Clear accepted playtest metadata after the demo so the next run starts clean.'
          : 'Reset becomes available after playtest signals exist and mutations are authorized.',
      state: resetCompleted
        ? 'complete'
        : hasSignals && mutationsAllowed
          ? 'ready'
          : 'blocked',
      actionLabel:
        !resetCompleted && hasSignals && mutationsAllowed
          ? 'Reset playtest signals'
          : undefined,
    },
  ];
};
