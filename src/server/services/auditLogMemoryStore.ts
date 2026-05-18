import type { AuditLogEntryInput, AuditLogStore } from './auditLogStore';
import type { AuditLogEntry } from '../../shared/types';

const AUDIT_LOG_MAX_ENTRIES = 100;

const cloneEntry = (entry: AuditLogEntry): AuditLogEntry => ({
  ...entry,
  actor: entry.actor ? { ...entry.actor } : null,
  counts: { ...entry.counts },
});

export const createAuditLogMemoryStore = (): AuditLogStore => {
  const entries: AuditLogEntry[] = [];

  return {
    mode: 'memory',

    async append(input: AuditLogEntryInput) {
      const timestamp = input.timestamp ?? new Date().toISOString();
      const entry: AuditLogEntry = {
        id: `audit-${Date.parse(timestamp)}-${entries.length + 1}`,
        operation: input.operation,
        outcome: input.outcome,
        timestamp,
        sourceRoute: input.sourceRoute,
        storeMode: input.storeMode,
        actor: input.actor ? { ...input.actor } : null,
        counts: { ...(input.counts ?? {}) },
      };

      entries.unshift(entry);

      if (entries.length > AUDIT_LOG_MAX_ENTRIES) {
        entries.length = AUDIT_LOG_MAX_ENTRIES;
      }

      return cloneEntry(entry);
    },

    async listRecent(limit = 25) {
      return entries.slice(0, limit).map(cloneEntry);
    },

    async count() {
      return entries.length;
    },
  };
};
