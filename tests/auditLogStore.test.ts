import { describe, expect, it } from 'vitest';

import { createAuditLogMemoryStore } from '../src/server/services/auditLogMemoryStore';

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
});
