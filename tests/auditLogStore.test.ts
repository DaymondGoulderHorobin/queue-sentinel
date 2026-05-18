import { describe, expect, it } from 'vitest';

import { createAuditLogMemoryStore } from '../src/server/services/auditLogMemoryStore';
import { createAuditLogRedisStore } from '../src/server/services/auditLogRedisStore';

const createFakeRedis = () => {
  const values = new Map<string, string>();

  return {
    async del(...keys: string[]) {
      for (const key of keys) {
        values.delete(key);
      }
    },
    async get(key: string) {
      return values.get(key);
    },
    async mGet(keys: string[]) {
      return keys.map((key) => values.get(key) ?? null);
    },
    async set(key: string, value: string) {
      values.set(key, value);
      return 'OK';
    },
  };
};

describe('audit log memory store', () => {
  it('records safe mutation metadata and caps recent reads', async () => {
    const store = createAuditLogMemoryStore();

    for (let index = 0; index < 30; index += 1) {
      await store.append({
        operation: 'playtest.seed',
        outcome: 'completed',
        sourceRoute: '/api/ingestion/playtest-seed',
        storeMode: 'memory',
        actor: {
          source: 'local-bypass',
          actorKey: 'local-test',
        },
        counts: {
          acceptedSignals: index,
          rejectedSignals: 0,
        },
        timestamp: new Date(Date.UTC(2026, 4, 16, 10, index)).toISOString(),
      });
    }

    const entries = await store.listRecent(25);
    const serialized = JSON.stringify(entries);

    expect(entries).toHaveLength(25);
    expect(await store.count()).toBe(30);
    expect(entries[0]?.operation).toBe('playtest.seed');
    expect(serialized).not.toContain('redditAction');
    expect(serialized).not.toContain('rawAuthor');
    expect(serialized).not.toContain('body');
  });

  it('uses unique memory IDs for repeated timestamps', async () => {
    const store = createAuditLogMemoryStore();
    const timestamp = '2026-05-16T10:00:00.000Z';

    const first = await store.append({
      operation: 'playtest.seed',
      outcome: 'completed',
      sourceRoute: '/api/ingestion/playtest-seed',
      storeMode: 'memory',
      actor: null,
      timestamp,
    });
    const second = await store.append({
      operation: 'playtest.seed',
      outcome: 'completed',
      sourceRoute: '/api/ingestion/playtest-seed',
      storeMode: 'memory',
      actor: null,
      timestamp,
    });

    expect(first.id).not.toBe(second.id);
  });

  it('uses unique Redis IDs for repeated timestamps', async () => {
    const store = createAuditLogRedisStore(createFakeRedis());
    const timestamp = '2026-05-16T10:00:00.000Z';

    const first = await store.append({
      operation: 'scoring.recompute',
      outcome: 'completed',
      sourceRoute: '/api/scoring/recompute-demo',
      storeMode: 'redis',
      actor: null,
      timestamp,
    });
    const second = await store.append({
      operation: 'scoring.recompute',
      outcome: 'completed',
      sourceRoute: '/api/scoring/recompute-demo',
      storeMode: 'redis',
      actor: null,
      timestamp,
    });

    expect(first.id).not.toBe(second.id);
    expect(await store.count()).toBe(2);
  });
});
