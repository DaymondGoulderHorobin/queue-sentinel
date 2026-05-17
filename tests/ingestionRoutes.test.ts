import { describe, expect, it } from 'vitest';

import { createServerApp } from '../src/server/app';
import { createReadonlyIngestionConfig } from '../src/server/services/ingestionConfig';
import { createIncidentMemoryStore } from '../src/server/services/incidentMemoryStore';
import { createQueueSignalMemoryStore } from '../src/server/services/queueSignalMemoryStore';
import { PLAYTEST_READONLY_INPUTS } from '../src/shared/playtestInputs';
import type {
  ApiErrorResponse,
  IngestionPreviewResponse,
  IngestionResetResponse,
  IngestionSeedResponse,
  IngestionStatusResponse,
  ScoringRecomputeResponse,
} from '../src/shared/apiTypes';

const readJson = async <T>(response: Response) => {
  return (await response.json()) as T;
};

const createEnabledConfig = () =>
  createReadonlyIngestionConfig(
    {
      QUEUE_SENTINEL_ENABLE_READONLY_INGESTION: 'true',
      QUEUE_SENTINEL_TEST_SUBREDDIT: 'queue_sentinel_lab',
    },
    'memory',
  );

const createDisabledConfig = () =>
  createReadonlyIngestionConfig({}, 'memory');

const createTestApp = (enabled = true) => {
  const incidentStore = createIncidentMemoryStore();
  const signalStore = createQueueSignalMemoryStore();
  const app = createServerApp(
    incidentStore,
    signalStore,
    enabled ? createEnabledConfig() : createDisabledConfig(),
  );

  return { app, signalStore };
};

describe('read-only ingestion API routes', () => {
  it('reports disabled status by default', async () => {
    const { app } = createTestApp(false);
    const response = await app.request('/api/ingestion/status');
    const payload = await readJson<IngestionStatusResponse>(response);

    expect(response.status).toBe(200);
    expect(payload.config).toMatchObject({
      mode: 'disabled',
      enabled: false,
      allowlistConfigured: false,
    });
    expect(payload.signalCount).toBe(0);
  });

  it('previews allowlisted fixture input without mutating the signal store', async () => {
    const { app, signalStore } = createTestApp();
    const response = await app.request('/api/ingestion/preview', {
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const payload = await readJson<IngestionPreviewResponse>(response);

    expect(response.status).toBe(200);
    expect(payload.signals.length).toBeGreaterThan(0);
    expect(payload.rejected).toHaveLength(0);
    expect(await signalStore.listSignals()).toHaveLength(0);
  });

  it('seeds and resets playtest signals only when explicitly enabled', async () => {
    const { app } = createTestApp();
    const seedResponse = await app.request('/api/ingestion/playtest-seed', {
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const seedPayload = await readJson<IngestionSeedResponse>(seedResponse);

    expect(seedResponse.status).toBe(200);
    expect(seedPayload.signalCount).toBe(PLAYTEST_READONLY_INPUTS.length);

    const resetResponse = await app.request('/api/ingestion/reset', {
      method: 'POST',
    });
    const resetPayload = await readJson<IngestionResetResponse>(resetResponse);

    expect(resetResponse.status).toBe(200);
    expect(resetPayload.resetCount).toBe(PLAYTEST_READONLY_INPUTS.length);
    expect(resetPayload.signalCount).toBe(0);
  });

  it('rejects seed when read-only ingestion is disabled', async () => {
    const { app } = createTestApp(false);
    const response = await app.request('/api/ingestion/playtest-seed', {
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const payload = await readJson<ApiErrorResponse>(response);

    expect(response.status).toBe(403);
    expect(payload.status).toBe('error');
    expect(payload.message).toContain('disabled');
  });

  it('rejects non-allowlisted and unsafe input without echoing action fields', async () => {
    const { app } = createTestApp();
    const response = await app.request('/api/ingestion/preview', {
      body: JSON.stringify({
        items: [
          {
            ...PLAYTEST_READONLY_INPUTS[0],
            subredditName: 'not_the_lab',
          },
          {
            ...PLAYTEST_READONLY_INPUTS[1],
            redditAction: 'remove',
          },
        ],
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const payloadText = await response.text();
    const payload = JSON.parse(payloadText) as IngestionPreviewResponse;

    expect(response.status).toBe(200);
    expect(payload.signals).toHaveLength(0);
    expect(payload.rejected).toHaveLength(2);
    expect(payloadText).not.toContain('redditAction');
    expect(payloadText).not.toContain('remove');
  });

  it('returns a bad request for malformed preview bodies', async () => {
    const { app } = createTestApp();
    const response = await app.request('/api/ingestion/preview', {
      body: '{',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    expect(response.status).toBe(400);
  });

  it('feeds accepted playtest signals into scoring recompute', async () => {
    const { app } = createTestApp();

    await app.request('/api/ingestion/playtest-seed', {
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    const response = await app.request('/api/scoring/recompute-demo', {
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const payload = await readJson<ScoringRecomputeResponse>(response);

    expect(response.status).toBe(200);
    expect(payload.signalSource).toBe('playtest-readonly');
    expect(payload.incidents.length).toBeGreaterThan(0);
    expect(
      payload.incidents.every(
        (incident) =>
          incident.ingestionProvenance?.source === 'playtest-readonly',
      ),
    ).toBe(true);
  });
});
