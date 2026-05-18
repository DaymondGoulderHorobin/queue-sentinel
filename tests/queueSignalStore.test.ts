import { describe, expect, it } from 'vitest';

import { createQueueSignalMemoryStore } from '../src/server/services/queueSignalMemoryStore';
import { createQueueSignalRedisStore } from '../src/server/services/queueSignalRedisStore';
import type { IngestionRunSummary, QueueSignal } from '../src/shared/types';

const sampleSignal: QueueSignal = {
  id: 'playtest-signal-1',
  itemId: 't3_signal_1',
  itemType: 'post',
  subjectKey: 't3_signal_1',
  suspectedRuleArea: 'Spam and repost policy',
  reportReason: 'duplicate report',
  createdAt: '2026-05-15T08:00:00.000Z',
  receivedAt: '2026-05-15T08:05:00.000Z',
  source: 'playtest-readonly',
  subredditName: 'queue_sentinel_lab',
};

const sampleSummary: IngestionRunSummary = {
  runId: 'run-1',
  mode: 'playtest-readonly',
  source: 'playtest-readonly',
  storeMode: 'memory',
  acceptedSignals: 1,
  rejectedSignals: 0,
  reasons: [],
  startedAt: '2026-05-15T08:00:00.000Z',
  finishedAt: '2026-05-15T08:01:00.000Z',
};

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

describe('queue signal stores', () => {
  it('upserts, lists, summarizes, and resets memory signals', async () => {
    const store = createQueueSignalMemoryStore();

    await store.upsertSignal(sampleSignal);
    await store.setLastRunSummary(sampleSummary);

    expect(await store.listSignals()).toEqual([sampleSignal]);
    expect(await store.getLastRunSummary()).toEqual(sampleSummary);

    const reset = await store.resetPlaytestSignals();

    expect(reset.resetCount).toBe(1);
    expect(await store.listSignals()).toEqual([]);
    expect(await store.getLastRunSummary()).toBeNull();
  });

  it('keeps Redis-backed playtest signals separate from incidents', async () => {
    const store = createQueueSignalRedisStore(createFakeRedis());

    await store.upsertSignals([sampleSignal]);
    await store.setLastRunSummary({ ...sampleSummary, storeMode: 'redis' });

    expect(await store.listSignals()).toEqual([sampleSignal]);
    expect((await store.getLastRunSummary())?.storeMode).toBe('redis');

    const reset = await store.resetPlaytestSignals();

    expect(reset).toMatchObject({
      source: 'redis',
      resetCount: 1,
      signalCount: 0,
    });
    expect(await store.listSignals()).toHaveLength(0);
  });

  it('batch upserts Redis-backed signals with a single index write', async () => {
    const redis = createFakeRedis();
    const store = createQueueSignalRedisStore(redis);
    const signals = [
      sampleSignal,
      {
        ...sampleSignal,
        id: 'playtest-signal-2',
        itemId: 't3_signal_2',
        receivedAt: '2026-05-15T08:06:00.000Z',
      },
      {
        ...sampleSignal,
        id: 'playtest-signal-3',
        itemId: 't3_signal_3',
        receivedAt: '2026-05-15T08:07:00.000Z',
      },
    ];

    const listedSignals = await store.upsertSignals(signals);

    expect(listedSignals.map((signal) => signal.id)).toEqual([
      'playtest-signal-1',
      'playtest-signal-2',
      'playtest-signal-3',
    ]);
    expect(
      redis.calls.setKeys.filter(
        (key) => key === 'queue-sentinel:playtest-signal-ids',
      ),
    ).toHaveLength(1);
    expect(
      redis.calls.getKeys.filter(
        (key) => key === 'queue-sentinel:playtest-signal-ids',
      ),
    ).toHaveLength(2);
  });
});
