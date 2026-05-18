import { describe, expect, it } from 'vitest';

import { preferScoredIncidents } from '../src/client/hooks/useIncidentWorkbench';
import { DEMO_INCIDENTS } from '../src/shared/demoData';
import { buildDemoScoringPreview } from '../src/shared/scoringEngine';
import type { ScoringPreviewResponse } from '../src/shared/apiTypes';
import type { QueueIncident } from '../src/shared/types';

const syntheticPreview = (): ScoringPreviewResponse => ({
  status: 'ok',
  source: 'memory',
  ...buildDemoScoringPreview(),
});

const playtestIncident = (incident: QueueIncident): QueueIncident => ({
  ...incident,
  ingestionProvenance: {
    source: 'playtest-readonly',
    runId: 'run-stale',
    signalIds: ['playtest-signal-1'],
  },
});

describe('preferScoredIncidents', () => {
  it('uses synthetic preview when stored playtest incidents are stale after reset', () => {
    const preview = syntheticPreview();
    const storedIncidents = preview.incidents.map(playtestIncident);

    expect(preferScoredIncidents(storedIncidents, preview)).toBe(
      preview.incidents,
    );
  });

  it('preserves stored playtest incidents when preview is still playtest sourced', () => {
    const preview = {
      ...syntheticPreview(),
      signalSource: 'playtest-readonly' as const,
    };
    const storedIncidents = preview.incidents.map(playtestIncident);

    expect(preferScoredIncidents(storedIncidents, preview)).toBe(storedIncidents);
  });

  it('falls back to preview incidents when stored incidents are unscored', () => {
    const preview = syntheticPreview();

    expect(preferScoredIncidents([...DEMO_INCIDENTS], preview)).toBe(
      preview.incidents,
    );
  });
});
