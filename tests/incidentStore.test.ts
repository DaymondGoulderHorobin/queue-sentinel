import { describe, expect, it } from 'vitest';

import { DEMO_INCIDENTS } from '../src/shared/demoData';
import { createIncidentMemoryStore } from '../src/server/services/incidentMemoryStore';

describe('incident memory store', () => {
  it('seeds and lists Sprint 3 demo incidents', async () => {
    const store = createIncidentMemoryStore();
    const result = await store.seedDemoIncidents();
    const incidents = await store.listIncidents();

    expect(result.count).toBe(10);
    expect(incidents).toHaveLength(10);
    expect(incidents[0]?.id).toMatch(/^inc-demo-/);
  });

  it('gets and upserts incidents', async () => {
    const store = createIncidentMemoryStore();
    await store.seedDemoIncidents();

    const incident = await store.getIncident('inc-demo-001');
    expect(incident?.title).toContain('Coordinated repost wave');

    const upserted = await store.upsertIncident({
      ...DEMO_INCIDENTS[0],
      id: 'inc-demo-custom',
      title: 'Custom stored incident',
    });

    expect(upserted.id).toBe('inc-demo-custom');
    expect(await store.getIncident('inc-demo-custom')).toMatchObject({
      title: 'Custom stored incident',
    });
  });

  it('updates internal status without removing incident context', async () => {
    const store = createIncidentMemoryStore();
    await store.seedDemoIncidents();

    const updated = await store.updateIncidentStatus('inc-demo-001', 'resolved');

    expect(updated?.status).toBe('resolved');
    expect(updated?.whySurfaced.length).toBeGreaterThan(0);
    expect(updated?.updatedAt).not.toBe(DEMO_INCIDENTS[0]?.updatedAt);
  });

  it('updates safe metadata fields only through the store contract', async () => {
    const store = createIncidentMemoryStore();
    await store.seedDemoIncidents();

    const updated = await store.updateIncidentMetadata('inc-demo-001', {
      confidenceLabel: 'low',
      recommendedReviewAction: 'Review after higher pressure cases.',
      tags: ['safe-demo-tag'],
    });

    expect(updated?.confidenceLabel).toBe('low');
    expect(updated?.recommendedReviewAction).toBe(
      'Review after higher pressure cases.',
    );
    expect(updated?.tags).toEqual(['safe-demo-tag']);
  });

  it('returns null for missing updates and reset reseeds cleanly', async () => {
    const store = createIncidentMemoryStore();
    await store.seedDemoIncidents();

    expect(await store.updateIncidentStatus('missing', 'reviewing')).toBeNull();
    await store.upsertIncident({
      ...DEMO_INCIDENTS[0],
      id: 'inc-demo-extra',
    });
    expect(await store.listIncidents()).toHaveLength(11);

    const reset = await store.resetDemoIncidents();

    expect(reset.count).toBe(10);
    expect(await store.listIncidents()).toHaveLength(10);
    expect(await store.getIncident('inc-demo-extra')).toBeNull();
  });
});
