import { redis } from '@devvit/web/server';

import { createAuditLogMemoryStore } from './auditLogMemoryStore';
import { createAuditLogRedisStore } from './auditLogRedisStore';
import type { ApiSource } from '../../shared/apiTypes';
import type { AuditLogEntry } from '../../shared/types';

export interface AuditLogEntryInput {
  operation: AuditLogEntry['operation'];
  outcome: AuditLogEntry['outcome'];
  sourceRoute: string;
  storeMode: AuditLogEntry['storeMode'];
  actor: AuditLogEntry['actor'];
  counts?: Record<string, number>;
  timestamp?: string;
}

export interface AuditLogStore {
  mode: Exclude<ApiSource, 'fallback'>;
  append(entry: AuditLogEntryInput): Promise<AuditLogEntry>;
  listRecent(limit?: number): Promise<readonly AuditLogEntry[]>;
  count(): Promise<number>;
}

export const AUDIT_LOG_RECENT_LIMIT = 25;
export const AUDIT_LOG_MAX_ENTRIES = 100;

export const createAuditLogStore = (): AuditLogStore => {
  if (process.env.QUEUE_SENTINEL_STORE_MODE === 'memory') {
    return createAuditLogMemoryStore();
  }

  return createAuditLogRedisStore(redis);
};

export const auditLogStore = createAuditLogStore();
