import type { IngestionResetResult } from '../../shared/apiTypes';
import type { IngestionRunSummary, QueueSignal } from '../../shared/types';
import type { QueueSignalStore } from './queueSignalStore';

interface RedisLike {
  del(...keys: string[]): Promise<void>;
  get(key: string): Promise<string | undefined>;
  mGet(keys: string[]): Promise<Array<string | null>>;
  set(key: string, value: string): Promise<string>;
}

const INDEX_KEY = 'queue-sentinel:playtest-signal-ids';
const LAST_RUN_KEY = 'queue-sentinel:playtest-signal-last-run';
const signalKey = (id: string) => `queue-sentinel:playtest-signal:${id}`;

const parseJson = <T>(value: string | null | undefined): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const readIds = async (redis: RedisLike) => {
  return parseJson<string[]>(await redis.get(INDEX_KEY)) ?? [];
};

const writeIds = async (redis: RedisLike, ids: readonly string[]) => {
  await redis.set(INDEX_KEY, JSON.stringify([...new Set(ids)].sort()));
};

const writeSignal = async (redis: RedisLike, signal: QueueSignal) => {
  await redis.set(signalKey(signal.id), JSON.stringify(signal));
  const ids = await readIds(redis);
  await writeIds(redis, [...ids, signal.id]);
  return signal;
};

export const createQueueSignalRedisStore = (
  redis: RedisLike,
): QueueSignalStore => {
  const store: QueueSignalStore = {
    mode: 'redis',

    async listSignals() {
      const ids = await readIds(redis);

      if (ids.length === 0) {
        return [];
      }

      const values = await redis.mGet(ids.map(signalKey));
      return values
        .map((value) => parseJson<QueueSignal>(value))
        .filter((signal): signal is QueueSignal => Boolean(signal))
        .sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
    },

    async upsertSignal(signal) {
      return await writeSignal(redis, signal);
    },

    async upsertSignals(signals) {
      for (const signal of signals) {
        await writeSignal(redis, signal);
      }

      return await store.listSignals();
    },

    async resetPlaytestSignals() {
      const ids = await readIds(redis);
      const keys = [INDEX_KEY, LAST_RUN_KEY, ...ids.map(signalKey)];

      if (keys.length > 0) {
        await redis.del(...keys);
      }

      return {
        source: 'redis',
        signalCount: 0,
        resetCount: ids.length,
      } satisfies IngestionResetResult;
    },

    async getLastRunSummary() {
      return parseJson<IngestionRunSummary>(await redis.get(LAST_RUN_KEY));
    },

    async setLastRunSummary(summary) {
      await redis.set(LAST_RUN_KEY, JSON.stringify(summary));
      return summary;
    },
  };

  return store;
};
