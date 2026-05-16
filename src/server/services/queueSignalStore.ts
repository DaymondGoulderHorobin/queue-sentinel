import { redis } from '@devvit/web/server';

import { createQueueSignalMemoryStore } from './queueSignalMemoryStore';
import { createQueueSignalRedisStore } from './queueSignalRedisStore';
import type { IngestionResetResult } from '../../shared/apiTypes';
import type { IngestionRunSummary, QueueSignal } from '../../shared/types';

export interface QueueSignalStore {
  mode: 'redis' | 'memory';
  listSignals(): Promise<readonly QueueSignal[]>;
  upsertSignal(signal: QueueSignal): Promise<QueueSignal>;
  upsertSignals(signals: readonly QueueSignal[]): Promise<readonly QueueSignal[]>;
  resetPlaytestSignals(): Promise<IngestionResetResult>;
  getLastRunSummary(): Promise<IngestionRunSummary | null>;
  setLastRunSummary(
    summary: IngestionRunSummary,
  ): Promise<IngestionRunSummary | null>;
}

export const createQueueSignalStore = (): QueueSignalStore => {
  if (process.env.QUEUE_SENTINEL_STORE_MODE === 'memory') {
    return createQueueSignalMemoryStore();
  }

  return createQueueSignalRedisStore(redis);
};

export const queueSignalStore = createQueueSignalStore();
