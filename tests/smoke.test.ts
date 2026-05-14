import { describe, expect, it } from 'vitest';

import { DEMO_INCIDENTS, PRIMARY_DEMO_INCIDENT } from '../src/shared/demoData';
import { buildDemoScoringPreview } from '../src/server/services/incidentMaterializer';

describe('Queue Sentinel scaffold', () => {
  it('ships enough safe demo incidents for the Sprint 3 workbench', () => {
    expect(DEMO_INCIDENTS.length).toBeGreaterThanOrEqual(8);
    expect(
      DEMO_INCIDENTS.every((incident) => incident.id.startsWith('inc-demo-')),
    ).toBe(true);
  });

  it('ships deterministic scored demo incidents', () => {
    const preview = buildDemoScoringPreview([PRIMARY_DEMO_INCIDENT]);
    const primaryScore = preview.incidents.find(
      (incident) => incident.id === PRIMARY_DEMO_INCIDENT.id,
    )?.priorityScore;

    expect(preview.modelVersion).toBe('sprint-3-deterministic-v1');
    expect(primaryScore?.modelVersion).toBe('sprint-3-deterministic-v1');
    expect(primaryScore?.score).toBeGreaterThan(0);
  });
});
