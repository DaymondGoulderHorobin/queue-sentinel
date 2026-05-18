import { describe, expect, it } from 'vitest';

import { createServerApp } from '../src/server/app';
import { createAuditLogMemoryStore } from '../src/server/services/auditLogMemoryStore';
import { createReadonlyIngestionConfig } from '../src/server/services/ingestionConfig';
import { createIncidentMemoryStore } from '../src/server/services/incidentMemoryStore';
import { createModeratorAuth } from '../src/server/services/moderatorAuth';
import { createQueueSignalMemoryStore } from '../src/server/services/queueSignalMemoryStore';
import type {
  ApiErrorResponse,
  AuditRecentResponse,
  DiagnosticsResponse,
  IngestionPreviewResponse,
  IngestionSeedResponse,
} from '../src/shared/apiTypes';

const readJson = async <T>(response: Response) => {
  return (await response.json()) as T;
};

const enabledConfig = () =>
  createReadonlyIngestionConfig(
    {
      QUEUE_SENTINEL_ENABLE_READONLY_INGESTION: 'true',
      QUEUE_SENTINEL_TEST_SUBREDDIT: 'queue_sentinel_lab',
    },
    'memory',
  );

describe('authorization routes', () => {
  it('keeps read-only routes open while denying production mutations without moderator context', async () => {
    const incidentStore = createIncidentMemoryStore();
    await incidentStore.seedDemoIncidents();
    const signalStore = createQueueSignalMemoryStore();
    const auditStore = createAuditLogMemoryStore();
    const app = createServerApp(
      incidentStore,
      signalStore,
      enabledConfig(),
      createModeratorAuth({ NODE_ENV: 'production' }, async () => null),
      auditStore,
    );

    const listResponse = await app.request('/api/incidents');
    const statusResponse = await app.request('/api/ingestion/status');
    const previewResponse = await app.request('/api/ingestion/preview', {
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const previewPayload = await readJson<IngestionPreviewResponse>(
      previewResponse,
    );

    expect(listResponse.status).toBe(200);
    expect(statusResponse.status).toBe(200);
    expect(previewResponse.status).toBe(200);
    expect(previewPayload.signals.length).toBeGreaterThan(0);

    const mutationResponses = await Promise.all([
      app.request('/api/demo/seed', { method: 'POST' }),
      app.request('/api/ingestion/playtest-seed', {
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }),
      app.request('/api/ingestion/reset', { method: 'POST' }),
      app.request('/api/scoring/recompute-demo', {
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }),
      app.request('/api/incidents/inc-demo-001/status', {
        body: JSON.stringify({ status: 'resolved' }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      }),
      app.request('/api/incidents/inc-demo-001/metadata', {
        body: JSON.stringify({ patch: { confidenceLabel: 'low' } }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      }),
    ]);

    for (const response of mutationResponses) {
      const payload = await readJson<ApiErrorResponse>(response);

      expect(response.status).toBe(403);
      expect(payload.message).toBe(
        'Moderator authorization is required for this Queue Sentinel mutation.',
      );
      expect(JSON.stringify(payload)).not.toContain('queue_sentinel_lab');
    }

    const auditResponse = await app.request('/api/audit/recent');
    const auditPayload = await readJson<AuditRecentResponse>(auditResponse);

    expect(auditResponse.status).toBe(200);
    expect(auditPayload.entries.every((entry) => entry.outcome === 'denied')).toBe(
      true,
    );
    expect(JSON.stringify(auditPayload.entries)).not.toContain('redditAction');
  });

  it('reports diagnostics and recent audit entries after authorized playtest operations', async () => {
    const incidentStore = createIncidentMemoryStore();
    const signalStore = createQueueSignalMemoryStore();
    const auditStore = createAuditLogMemoryStore();
    const app = createServerApp(
      incidentStore,
      signalStore,
      enabledConfig(),
      createModeratorAuth({ NODE_ENV: 'test' }),
      auditStore,
    );

    const seedResponse = await app.request('/api/ingestion/playtest-seed', {
      body: JSON.stringify({ fixturePackId: 'heated-thread' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const seedPayload = await readJson<IngestionSeedResponse>(seedResponse);
    const recomputeResponse = await app.request('/api/scoring/recompute-demo', {
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const diagnosticsResponse = await app.request('/api/diagnostics');
    const diagnosticsPayload = await readJson<DiagnosticsResponse>(
      diagnosticsResponse,
    );
    const auditResponse = await app.request('/api/audit/recent');
    const auditPayload = await readJson<AuditRecentResponse>(auditResponse);

    expect(seedResponse.status).toBe(200);
    expect(seedPayload.fixturePackId).toBe('heated-thread');
    expect(seedPayload.signalCount).toBe(3);
    expect(recomputeResponse.status).toBe(200);
    expect(diagnosticsResponse.status).toBe(200);
    expect(diagnosticsPayload.authorization.mutationsAllowed).toBe(true);
    expect(diagnosticsPayload.ingestion.signalCount).toBe(3);
    expect(diagnosticsPayload.ingestion.allowedSubredditCount).toBe(1);
    expect(diagnosticsPayload.scoring.lastRecomputeAt).toBeTruthy();
    expect(diagnosticsPayload.ingestion.availableFixturePacks.length).toBe(6);
    expect(auditPayload.entries.map((entry) => entry.operation)).toContain(
      'scoring.recompute',
    );
    expect(auditPayload.entries.map((entry) => entry.operation)).toContain(
      'playtest.seed',
    );
  });
});
