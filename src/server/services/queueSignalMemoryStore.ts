import type { ApiSource } from '../../shared/apiTypes';
import type { IngestionRunSummary, QueueSignal } from '../../shared/types';
import type { QueueSignalStore } from './queueSignalStore';

const cloneSignal = (signal: QueueSignal): QueueSignal => ({
  ...signal,
  tags: signal.tags ? [...signal.tags] : undefined,
});

const cloneSummary = (
  summary: IngestionRunSummary | null,
): IngestionRunSummary | null => {
  return summary ? { ...summary, reasons: [...summary.reasons] } : null;
};

export const createQueueSignalMemoryStore = (
  initialSignals: readonly QueueSignal[] = [],
  source: ApiSource = 'memory',
): QueueSignalStore => {
  const signals = new Map<string, QueueSignal>();
  let lastRun: IngestionRunSummary | null = null;

  for (const signal of initialSignals) {
    signals.set(signal.id, cloneSignal(signal));
  }

  return {
    mode: 'memory',

    async listSignals() {
      return [...signals.values()]
        .map(cloneSignal)
        .sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
    },

    async upsertSignal(signal) {
      const nextSignal = cloneSignal(signal);
      signals.set(nextSignal.id, nextSignal);
      return cloneSignal(nextSignal);
    },

    async upsertSignals(nextSignals) {
      for (const signal of nextSignals) {
        signals.set(signal.id, cloneSignal(signal));
      }

      return [...signals.values()].map(cloneSignal);
    },

    async resetPlaytestSignals() {
      const resetCount = signals.size;
      signals.clear();
      lastRun = null;

      return {
        source,
        signalCount: 0,
        resetCount,
      };
    },

    async getLastRunSummary() {
      return cloneSummary(lastRun);
    },

    async setLastRunSummary(summary) {
      lastRun = cloneSummary(summary);
      return cloneSummary(lastRun);
    },
  };
};
