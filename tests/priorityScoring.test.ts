import { describe, expect, it } from 'vitest';

import { clusterQueueSignals } from '../src/server/services/incidentClustering';
import {
  buildDemoScoringPreview,
  materializeClusteredIncidents,
} from '../src/server/services/incidentMaterializer';
import { scoreIncidentCluster } from '../src/server/services/priorityScoring';
import { DEMO_QUEUE_SIGNALS } from '../src/shared/demoSignals';

describe('deterministic priority scoring', () => {
  it('scores high-density demo clusters as critical when thresholds are met', () => {
    const cluster = clusterQueueSignals(DEMO_QUEUE_SIGNALS).find((candidate) =>
      candidate.clusterId.includes('inc-demo-001'),
    );

    expect(cluster).toBeDefined();

    const score = scoreIncidentCluster(cluster!);

    expect(score.priority).toBe('critical');
    expect(score.score).toBeGreaterThanOrEqual(85);
    expect(score.factors.map((factor) => factor.key)).toContain('report-volume');
  });

  it('lowers resolved incidents without hiding the factor breakdown', () => {
    const cluster = clusterQueueSignals(DEMO_QUEUE_SIGNALS).find((candidate) =>
      candidate.clusterId.includes('inc-demo-008'),
    );

    expect(cluster).toBeDefined();

    const openScore = scoreIncidentCluster(cluster!, 'open');
    const resolvedScore = scoreIncidentCluster(cluster!, 'resolved');

    expect(resolvedScore.score).toBeLessThan(openScore.score);
    expect(resolvedScore.factors).toHaveLength(openScore.factors.length);
  });

  it('materializes clusters into QueueIncident objects with score and summary fields', () => {
    const incidents = materializeClusteredIncidents(
      clusterQueueSignals(DEMO_QUEUE_SIGNALS),
    );

    expect(incidents).toHaveLength(10);
    expect(incidents[0]?.priorityScore?.modelVersion).toBe(
      'sprint-3-deterministic-v1',
    );
    expect(incidents[0]?.clusterSummary?.signalCount).toBeGreaterThan(1);
  });

  it('produces deterministic preview ordering and aggregate metrics', () => {
    const first = buildDemoScoringPreview();
    const second = buildDemoScoringPreview();

    expect(first.incidents.map((incident) => incident.id)).toEqual(
      second.incidents.map((incident) => incident.id),
    );
    expect(first.signalsProcessed).toBe(DEMO_QUEUE_SIGNALS.length);
    expect(first.clustersFormed).toBe(10);
    expect(first.duplicateSignalsCollapsed).toBe(
      first.signalsProcessed - first.clustersFormed,
    );
  });
});
