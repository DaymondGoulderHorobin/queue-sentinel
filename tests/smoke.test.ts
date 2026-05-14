import { describe, expect, it } from 'vitest';

import { DEMO_INCIDENTS, PRIMARY_DEMO_INCIDENT } from '../src/shared/demoData';
import { getPlaceholderPriorityScore } from '../src/server/services/priorityScoring';

describe('Queue Sentinel scaffold', () => {
  it('ships enough safe demo incidents for the Sprint 1 workbench', () => {
    expect(DEMO_INCIDENTS.length).toBeGreaterThanOrEqual(8);
    expect(
      DEMO_INCIDENTS.every((incident) => incident.id.startsWith('inc-demo-')),
    ).toBe(true);
  });

  it('keeps priority scoring as an explicit placeholder', () => {
    const score = getPlaceholderPriorityScore(PRIMARY_DEMO_INCIDENT);

    expect(score.scoringModel).toBe('sprint-0-placeholder');
    expect(score.priority).toBe(PRIMARY_DEMO_INCIDENT.priority);
  });
});
