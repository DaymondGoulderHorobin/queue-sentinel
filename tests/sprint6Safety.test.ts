import { describe, expect, it } from 'vitest';

import { createServerApp } from '../src/server/app';
import { createAuditLogMemoryStore } from '../src/server/services/auditLogMemoryStore';
import { createReadonlyIngestionConfig } from '../src/server/services/ingestionConfig';
import { createIncidentMemoryStore } from '../src/server/services/incidentMemoryStore';
import { createModeratorAuth } from '../src/server/services/moderatorAuth';
import { createQueueSignalMemoryStore } from '../src/server/services/queueSignalMemoryStore';
import type {
  AuditRecentResponse,
  DiagnosticsResponse,
  IngestionPreviewResponse,
  IngestionSeedResponse,
  IngestionStatusResponse,
  ScoringRecomputeResponse,
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

const unsafePayloadText = (value: unknown) => JSON.stringify(value);

describe('Sprint 6 demo hardening safety', () => {
  it('keeps diagnostics safe when authorization context is unavailable', async () => {
    const app = createServerApp(
      createIncidentMemoryStore(),
      createQueueSignalMemoryStore(),
      enabledConfig(),
      createModeratorAuth({ NODE_ENV: 'production' }, async () => null),
      createAuditLogMemoryStore(),
    );
    const response = await app.request('/api/diagnostics');
    const payload = await readJson<DiagnosticsResponse>(response);
    const serialized = unsafePayloadText(payload);

    expect(response.status).toBe(200);
    expect(payload.authorization.mutationsAllowed).toBe(false);
    expect(payload.ingestion.allowedSubredditCount).toBe(1);
    expect(serialized).not.toContain('queue_sentinel_lab');
    expect(serialized).not.toContain('username');
    expect(serialized).not.toContain('rawAuthor');
    expect(serialized).not.toContain('body');
  });

  it('keeps audit responses capped and free of unsafe moderation fields', async () => {
    const app = createServerApp(
      createIncidentMemoryStore(),
      createQueueSignalMemoryStore(),
      enabledConfig(),
      createModeratorAuth({ NODE_ENV: 'test' }),
      createAuditLogMemoryStore(),
    );

    await app.request('/api/ingestion/playtest-seed', {
      body: JSON.stringify({ fixturePackId: 'spam-repost-wave' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    await app.request('/api/scoring/recompute-demo', {
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    const response = await app.request('/api/audit/recent');
    const payload = await readJson<AuditRecentResponse>(response);
    const serialized = unsafePayloadText(payload);

    expect(response.status).toBe(200);
    expect(payload.entries.length).toBeLessThanOrEqual(25);
    expect(serialized).not.toContain('rawAuthor');
    expect(serialized).not.toContain('redditAction');
    expect(serialized).not.toContain('webhook');
    expect(serialized).not.toContain('aiDecision');
    expect(serialized).not.toContain('comment body');
    expect(serialized).not.toContain('external command');
  });

  it('runs the fixture preview, seed, recompute, and reset flow safely', async () => {
    const signalStore = createQueueSignalMemoryStore();
    const app = createServerApp(
      createIncidentMemoryStore(),
      signalStore,
      enabledConfig(),
      createModeratorAuth({ NODE_ENV: 'test' }),
      createAuditLogMemoryStore(),
    );

    const previewResponse = await app.request('/api/ingestion/preview', {
      body: JSON.stringify({ fixturePackId: 'heated-thread' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const previewPayload = await readJson<IngestionPreviewResponse>(
      previewResponse,
    );

    expect(previewResponse.status).toBe(200);
    expect(previewPayload.signals).toHaveLength(3);
    expect(await signalStore.listSignals()).toHaveLength(0);

    const seedResponse = await app.request('/api/ingestion/playtest-seed', {
      body: JSON.stringify({ fixturePackId: 'heated-thread' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const seedPayload = await readJson<IngestionSeedResponse>(seedResponse);

    expect(seedResponse.status).toBe(200);
    expect(seedPayload.signalCount).toBe(3);

    const recomputeResponse = await app.request('/api/scoring/recompute-demo', {
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const recomputePayload = await readJson<ScoringRecomputeResponse>(
      recomputeResponse,
    );

    expect(recomputeResponse.status).toBe(200);
    expect(recomputePayload.signalSource).toBe('playtest-readonly');

    const resetResponse = await app.request('/api/ingestion/reset', {
      method: 'POST',
    });
    const statusResponse = await app.request('/api/ingestion/status');
    const statusPayload = await readJson<IngestionStatusResponse>(statusResponse);

    expect(resetResponse.status).toBe(200);
    expect(statusPayload.signalCount).toBe(0);
  });
});
