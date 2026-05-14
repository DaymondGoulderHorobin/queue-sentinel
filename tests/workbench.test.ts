import { describe, expect, it } from 'vitest';

import { DEMO_INCIDENTS } from '../src/shared/demoData';
import {
  DEFAULT_FILTERS,
  filterIncidents,
  getPriorityDistribution,
  getRecommendedReviewFocus,
  getRuleAreas,
  getTopPriorityIncident,
  getWorkbenchMetrics,
  sortIncidents,
} from '../src/shared/workbench';

describe('workbench helpers', () => {
  it('searches title, rule area, tags, and rationale fields', () => {
    const results = filterIncidents(DEMO_INCIDENTS, {
      ...DEFAULT_FILTERS,
      search: 'privacy-review',
    });

    expect(results.map((incident) => incident.id)).toEqual(['inc-demo-006']);
  });

  it('filters by priority, status, item type, and rule area', () => {
    const results = filterIncidents(DEMO_INCIDENTS, {
      ...DEFAULT_FILTERS,
      itemType: 'comment',
      priority: 'high',
      ruleArea: 'Civility and personal attacks',
      status: 'open',
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('inc-demo-002');
  });

  it('sorts incidents by priority pressure first', () => {
    const [first] = sortIncidents(DEMO_INCIDENTS, 'priority');

    expect(first?.id).toBe('inc-demo-001');
  });

  it('sorts incidents by stale queue age', () => {
    const [first] = sortIncidents(DEMO_INCIDENTS, 'queueAge');

    expect(first?.id).toBe('inc-demo-009');
  });

  it('aggregates demo workbench metrics', () => {
    const metrics = getWorkbenchMetrics(DEMO_INCIDENTS);

    expect(metrics.openIncidents).toBe(8);
    expect(metrics.highPriorityIncidents).toBe(4);
    expect(metrics.ruleAreasSurfaced).toBeGreaterThanOrEqual(8);
    expect(metrics.estimatedClicksSaved).toBe(
      metrics.duplicateReportsCollapsed * 2,
    );
  });

  it('builds priority distribution and review focus', () => {
    expect(getPriorityDistribution(DEMO_INCIDENTS)).toEqual([
      { priority: 'critical', count: 1 },
      { priority: 'high', count: 3 },
      { priority: 'medium', count: 4 },
      { priority: 'low', count: 2 },
    ]);
    expect(getTopPriorityIncident(DEMO_INCIDENTS)?.id).toBe('inc-demo-001');
    expect(getRecommendedReviewFocus(DEMO_INCIDENTS)).toContain(
      'Coordinated repost wave',
    );
  });

  it('returns sorted rule areas for filter controls', () => {
    const ruleAreas = getRuleAreas(DEMO_INCIDENTS);

    expect(ruleAreas).toContain('Spam and repost policy');
    expect(ruleAreas).toEqual([...ruleAreas].sort((a, b) => a.localeCompare(b)));
  });
});
