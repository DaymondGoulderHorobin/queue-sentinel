import { DEMO_INCIDENTS } from '../../shared/demoData';
import type {
  IncidentMetadataPatch,
  SeedDemoResult,
} from '../../shared/apiTypes';
import type { IncidentStatus, QueueIncident } from '../types/incident';
import type { IncidentStore } from './incidentStore';

interface RedisLike {
  del(...keys: string[]): Promise<void>;
  get(key: string): Promise<string | undefined>;
  mGet(keys: string[]): Promise<Array<string | null>>;
  set(key: string, value: string): Promise<string>;
}

const INDEX_KEY = 'queue-sentinel:incident-ids';
const incidentKey = (id: string) => `queue-sentinel:incident:${id}`;

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

const readIncident = async (redis: RedisLike, id: string) => {
  return parseJson<QueueIncident>(await redis.get(incidentKey(id)));
};

const writeIncident = async (redis: RedisLike, incident: QueueIncident) => {
  await redis.set(incidentKey(incident.id), JSON.stringify(incident));
  const ids = await readIds(redis);
  await writeIds(redis, [...ids, incident.id]);
  return incident;
};

const applyMetadataPatch = (
  incident: QueueIncident,
  patch: IncidentMetadataPatch,
): QueueIncident => ({
  ...incident,
  ...patch,
  tags: patch.tags ? [...patch.tags] : incident.tags,
  timeline: patch.timeline
    ? patch.timeline.map((event) => ({ ...event }))
    : incident.timeline,
  updatedAt: new Date().toISOString(),
});

export const createIncidentRedisStore = (redis: RedisLike): IncidentStore => {
  const seedDemoIncidents = async (options?: { overwrite?: boolean }) => {
    const existingIds = await readIds(redis);
    let overwritten = 0;

    for (const incident of DEMO_INCIDENTS) {
      const exists = existingIds.includes(incident.id);

      if (exists) {
        overwritten += 1;
      }

      if (!exists || options?.overwrite) {
        await writeIncident(redis, incident);
      }
    }

    return {
      source: 'redis',
      count: DEMO_INCIDENTS.length,
      overwritten,
    } satisfies SeedDemoResult;
  };

  return {
    mode: 'redis',

    async listIncidents() {
      const ids = await readIds(redis);

      if (ids.length === 0) {
        await seedDemoIncidents();
        return DEMO_INCIDENTS;
      }

      const values = await redis.mGet(ids.map(incidentKey));
      return values
        .map((value) => parseJson<QueueIncident>(value))
        .filter((incident): incident is QueueIncident => Boolean(incident));
    },

    async getIncident(id) {
      return await readIncident(redis, id);
    },

    async upsertIncident(incident) {
      return await writeIncident(redis, incident);
    },

    async updateIncidentStatus(id, status: IncidentStatus) {
      const incident = await readIncident(redis, id);

      if (!incident) {
        return null;
      }

      const updatedIncident = {
        ...incident,
        status,
        updatedAt: new Date().toISOString(),
      };

      return await writeIncident(redis, updatedIncident);
    },

    async updateIncidentMetadata(id, patch) {
      const incident = await readIncident(redis, id);

      if (!incident) {
        return null;
      }

      return await writeIncident(redis, applyMetadataPatch(incident, patch));
    },

    seedDemoIncidents,

    async resetDemoIncidents() {
      const ids = await readIds(redis);
      const keys = [INDEX_KEY, ...ids.map(incidentKey)];

      if (keys.length > 0) {
        await redis.del(...keys);
      }

      return await seedDemoIncidents({ overwrite: true });
    },
  };
};
