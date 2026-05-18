import { describe, expect, it } from 'vitest';

import { buildDemoFlowSteps } from '../src/shared/demoFlow';
import { PLAYTEST_FIXTURE_PACK_OPTIONS } from '../src/shared/playtestFixturePacks';
import { buildDemoScoringPreview } from '../src/shared/scoringEngine';
import type {
  ApiSource,
  DiagnosticsResponse,
  IngestionStatusResponse,
  ScoringPreviewResponse,
} from '../src/shared/apiTypes';
import type { AuditLogEntry, QueueIncident } from '../src/shared/types';

const scoringPreview = (
  signalSource: ScoringPreviewResponse['signalSource'] = 'synthetic-demo',
): ScoringPreviewResponse => ({
  status: 'ok',
  source: 'memory',
  ...buildDemoScoringPreview(),
  signalSource,
});

const diagnostics = (
  mutationsAllowed: boolean,
  source: ApiSource = 'memory',
): DiagnosticsResponse => ({
  status: 'ok',
  source,
  runtimeMode: 'test',
  stores: {
    incidentStoreMode: source,
    signalStoreMode: source,
    auditStoreMode: source,
  },
  ingestion: {
    mode: source === 'fallback' ? 'disabled' : 'playtest-readonly',
    enabled: source !== 'fallback',
    allowlistConfigured: source !== 'fallback',
    allowedSubredditCount: source === 'fallback' ? 0 : 1,
    signalCount: 0,
    lastRun: null,
    availableFixturePacks: [...PLAYTEST_FIXTURE_PACK_OPTIONS],
  },
  incidents: {
    count: 10,
  },
  scoring: {
    modelVersion: 'sprint-3-deterministic-v1',
    lastRecomputeAt: null,
  },
  authorization: {
    mode: mutationsAllowed ? 'local-bypass' : 'unavailable',
    status: mutationsAllowed ? 'local-bypass' : 'unavailable',
    mutationsAllowed,
    actor: mutationsAllowed ? { source: 'local-bypass', actorKey: 'local-test' } : null,
    message: mutationsAllowed
      ? 'Local mutation bypass is active.'
      : 'Moderator authorization is required for this Queue Sentinel mutation.',
  },
  audit: {
    entryCount: 0,
    recentLimit: 25,
  },
  fallbackWarning:
    source === 'fallback'
      ? 'Browser fallback mode is active. Synthetic demo data is shown locally.'
      : null,
  timestamp: '2026-05-18T00:00:00.000Z',
});

const ingestionStatus = (
  enabled: boolean,
  signalCount = 0,
): IngestionStatusResponse => ({
  status: 'ok',
  source: enabled ? 'memory' : 'fallback',
  config: {
    mode: enabled ? 'playtest-readonly' : 'disabled',
    storeMode: enabled ? 'memory' : 'fallback',
    allowedSubredditNames: enabled ? ['queue_sentinel_lab'] : [],
    enabled,
    requiredEnvPresent: enabled,
    allowlistConfigured: enabled,
  },
  signalCount,
  lastRun: signalCount
    ? {
        runId: 'readonly-test',
        mode: 'playtest-readonly',
        source: 'playtest-readonly',
        storeMode: 'memory',
        acceptedSignals: signalCount,
        rejectedSignals: 0,
        reasons: [],
        startedAt: '2026-05-18T00:00:00.000Z',
        finishedAt: '2026-05-18T00:01:00.000Z',
      }
    : null,
  modelVersion: 'sprint-3-deterministic-v1',
  timestamp: '2026-05-18T00:00:00.000Z',
});

const auditEntry = (
  operation: AuditLogEntry['operation'],
): AuditLogEntry => ({
  id: `audit-${operation}`,
  operation,
  outcome: 'completed',
  timestamp: '2026-05-18T00:02:00.000Z',
  sourceRoute: '/api/demo',
  storeMode: 'memory',
  actor: { source: 'local-bypass', actorKey: 'local-test' },
  counts: { incidents: 1 },
});

describe('judge demo flow helper', () => {
  it('represents browser fallback without claiming live Reddit data', () => {
    const steps = buildDemoFlowSteps({
      auditEntries: [],
      dataStatus: 'fallback',
      diagnostics: diagnostics(false, 'fallback'),
      incidents: buildDemoScoringPreview().incidents,
      ingestionStatus: ingestionStatus(false),
      scoringPreview: scoringPreview('fallback'),
    });

    expect(new Set(steps.map((step) => step.state))).toEqual(
      new Set(['fallback']),
    );
    expect(steps[0]?.description).toContain('synthetic fallback data');
    expect(JSON.stringify(steps)).not.toContain('using live Reddit');
  });

  it('shows blocked, ready, and complete states through the playtest sequence', () => {
    const blocked = buildDemoFlowSteps({
      auditEntries: [],
      dataStatus: 'memory',
      diagnostics: diagnostics(false),
      incidents: buildDemoScoringPreview().incidents,
      ingestionStatus: ingestionStatus(true),
      scoringPreview: scoringPreview(),
    });

    expect(blocked.find((step) => step.id === 'seed-playtest')?.state).toBe(
      'blocked',
    );

    const ready = buildDemoFlowSteps({
      auditEntries: [],
      dataStatus: 'memory',
      diagnostics: diagnostics(true),
      incidents: buildDemoScoringPreview().incidents,
      ingestionStatus: ingestionStatus(true),
      scoringPreview: scoringPreview(),
    });

    expect(ready.find((step) => step.id === 'preview-fixture')?.state).toBe(
      'ready',
    );
    expect(ready.find((step) => step.id === 'seed-playtest')?.state).toBe(
      'ready',
    );

    const seeded = buildDemoFlowSteps({
      auditEntries: [auditEntry('playtest.seed')],
      dataStatus: 'memory',
      diagnostics: diagnostics(true),
      incidents: buildDemoScoringPreview().incidents,
      ingestionStatus: ingestionStatus(true, 3),
      scoringPreview: scoringPreview(),
    });

    expect(seeded.find((step) => step.id === 'seed-playtest')?.state).toBe(
      'complete',
    );
    expect(seeded.find((step) => step.id === 'recompute-scoring')?.state).toBe(
      'ready',
    );

    const playtestIncident: QueueIncident = {
      ...buildDemoScoringPreview().incidents[0]!,
      ingestionProvenance: {
        source: 'playtest-readonly',
        signalIds: ['playtest-1'],
      },
    };
    const complete = buildDemoFlowSteps({
      auditEntries: [auditEntry('playtest.seed'), auditEntry('playtest.reset')],
      dataStatus: 'memory',
      diagnostics: diagnostics(true),
      incidents: [playtestIncident],
      ingestionStatus: ingestionStatus(true, 0),
      scoringPreview: scoringPreview('playtest-readonly'),
    });

    expect(complete.find((step) => step.id === 'recompute-scoring')?.state).toBe(
      'complete',
    );
    expect(complete.find((step) => step.id === 'reset-playtest')?.state).toBe(
      'complete',
    );
  });
});
