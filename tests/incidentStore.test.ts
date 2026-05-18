import { describe, expect, it } from 'vitest';

import { DEMO_INCIDENTS } from '../src/shared/demoData';
import { createIncidentMemoryStore } from '../src/server/services/incidentMemoryStore';
import { createIncidentRedisStore } from '../src/server/services/incidentRedisStore';

const createFakeRedis = () => {
  const values = new Map<string, string>();
  const calls = {
    getKeys: [] as string[],
    setKeys: [] as string[],
  };

  return {
    calls,
    async del(...keys: string[]) {
      for (const key of keys) {
        values.delete(key);
      }
    },
    async get(key: string) {
      calls.getKeys.push(key);
      return values.get(key);
    },
    async mGet(keys: string[]) {
      return keys.map((key) => values.get(key) ?? null);
    },
    async set(key: string, value: string) {
      calls.setKeys.push(key);
      values.set(key, value);
      return 'OK';
    },
  };
};

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

  it('batch seeds Redis demo incidents with one index write', async () => {
    const redis = createFakeRedis();
    const store = createIncidentRedisStore(redis);

    const seedResult = await store.seedDemoIncidents();

    expect(seedResult.count).toBe(10);
    expect(seedResult.overwritten).toBe(0);
    expect(
      redis.calls.setKeys.filter((key) => key === 'queue-sentinel:incident-ids'),
    ).toHaveLength(1);
    expect(
      redis.calls.getKeys.filter((key) => key === 'queue-sentinel:incident-ids'),
    ).toHaveLength(1);

    const secondSeedResult = await store.seedDemoIncidents();

    expect(secondSeedResult.overwritten).toBe(10);
    expect(
      redis.calls.setKeys.filter((key) => key === 'queue-sentinel:incident-ids'),
    ).toHaveLength(1);
  });

  it('batch upserts Redis recompute incidents with one index write', async () => {
    const redis = createFakeRedis();
    const store = createIncidentRedisStore(redis);

    await store.upsertIncidents(DEMO_INCIDENTS.slice(0, 3));

    expect(
      redis.calls.setKeys.filter((key) => key === 'queue-sentinel:incident-ids'),
    ).toHaveLength(1);
    expect(await store.listIncidents()).toHaveLength(3);
  });
});
