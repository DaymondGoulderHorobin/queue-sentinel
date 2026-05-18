import { redis } from '@devvit/web/server';

import { createIncidentMemoryStore } from './incidentMemoryStore';
import { createIncidentRedisStore } from './incidentRedisStore';
import type {
  IncidentMetadataPatch,
  SeedDemoResult,
} from '../../shared/apiTypes';
import type { IncidentStatus, QueueIncident } from '../types/incident';

export interface IncidentStore {
  mode: 'redis' | 'memory';
  listIncidents(): Promise<readonly QueueIncident[]>;
  getIncident(id: string): Promise<QueueIncident | null>;
  upsertIncident(incident: QueueIncident): Promise<QueueIncident>;
  upsertIncidents(incidents: readonly QueueIncident[]): Promise<readonly QueueIncident[]>;
  updateIncidentStatus(
    id: string,
    status: IncidentStatus,
  ): Promise<QueueIncident | null>;
  updateIncidentMetadata(
    id: string,
    patch: IncidentMetadataPatch,
  ): Promise<QueueIncident | null>;
  seedDemoIncidents(options?: { overwrite?: boolean }): Promise<SeedDemoResult>;
  resetDemoIncidents(): Promise<SeedDemoResult>;
}

export const createIncidentStore = (): IncidentStore => {
  if (process.env.QUEUE_SENTINEL_STORE_MODE === 'memory') {
    return createIncidentMemoryStore();
  }

  return createIncidentRedisStore(redis);
};

export const incidentStore = createIncidentStore();
