import type { AuditLogEntryInput, AuditLogStore } from './auditLogStore';
import type { AuditLogEntry } from '../../shared/types';

interface RedisLike {
  del(...keys: string[]): Promise<void>;
  get(key: string): Promise<string | undefined>;
  mGet(keys: string[]): Promise<Array<string | null>>;
  set(key: string, value: string): Promise<string>;
}

const AUDIT_LOG_MAX_ENTRIES = 100;
const INDEX_KEY = 'queue-sentinel:audit-entry-ids';
const entryKey = (id: string) => `queue-sentinel:audit-entry:${id}`;

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
  await redis.set(INDEX_KEY, JSON.stringify([...ids]));
};

export const createAuditLogRedisStore = (redis: RedisLike): AuditLogStore => {
  return {
    mode: 'redis',

    async append(input: AuditLogEntryInput) {
      const timestamp = input.timestamp ?? new Date().toISOString();
      const ids = await readIds(redis);
      const entry: AuditLogEntry = {
        id: `audit-${Date.parse(timestamp)}-${ids.length + 1}`,
        operation: input.operation,
        outcome: input.outcome,
        timestamp,
        sourceRoute: input.sourceRoute,
        storeMode: input.storeMode,
        actor: input.actor ? { ...input.actor } : null,
        counts: { ...(input.counts ?? {}) },
      };
      const nextIds = [entry.id, ...ids.filter((id) => id !== entry.id)];
      const retainedIds = nextIds.slice(0, AUDIT_LOG_MAX_ENTRIES);
      const droppedIds = nextIds.slice(AUDIT_LOG_MAX_ENTRIES);

      await redis.set(entryKey(entry.id), JSON.stringify(entry));
      await writeIds(redis, retainedIds);

      if (droppedIds.length > 0) {
        await redis.del(...droppedIds.map(entryKey));
      }

      return entry;
    },

    async listRecent(limit = 25) {
      const ids = (await readIds(redis)).slice(0, limit);

      if (ids.length === 0) {
        return [];
      }

      const values = await redis.mGet(ids.map(entryKey));
      return values
        .map((value) => parseJson<AuditLogEntry>(value))
        .filter((entry): entry is AuditLogEntry => Boolean(entry));
    },

    async count() {
      return (await readIds(redis)).length;
    },
  };
};
