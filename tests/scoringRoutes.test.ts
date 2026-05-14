import { describe, expect, it } from 'vitest';

import { createServerApp } from '../src/server/app';
import { createIncidentMemoryStore } from '../src/server/services/incidentMemoryStore';
import { DEMO_INCIDENTS } from '../src/shared/demoData';
import type {
  ApiErrorResponse,
  IncidentsListResponse,
  ScoringPreviewResponse,
} from '../src/shared/apiTypes';

const readJson = async <T>(response: Response) => {
  return (await response.json()) as T;
};

describe('scoring API routes', () => {
  it('previews deterministic scoring without mutating the store', async () => {
    const store = createIncidentMemoryStore(DEMO_INCIDENTS);
    const app = createServerApp(store);

    const response = await app.request('/api/scoring/preview');
    const payload = await readJson<ScoringPreviewResponse>(response);
    const storedIncidents = await store.listIncidents();

    expect(response.status).toBe(200);
    expect(payload.modelVersion).toBe('sprint-3-deterministic-v1');
    expect(payload.signalsProcessed).toBeGreaterThan(payload.clustersFormed);
    expect(payload.incidents[0]?.priorityScore).toBeDefined();
    expect(storedIncidents.some((incident) => incident.priorityScore)).toBe(false);
  });

  it('recomputes demo scoring and persists scored incidents only', async () => {
    const store = createIncidentMemoryStore(DEMO_INCIDENTS);
    const app = createServerApp(store);

    const response = await app.request('/api/scoring/recompute-demo', {
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const payload = await readJson<ScoringPreviewResponse>(response);
    const listResponse = await app.request('/api/incidents');
    const listPayload = await readJson<IncidentsListResponse>(listResponse);

    expect(response.status).toBe(200);
    expect(payload.incidents).toHaveLength(10);
    expect(listPayload.incidents.every((incident) => incident.priorityScore)).toBe(
      true,
    );
  });

  it('rejects external scoring inputs', async () => {
    const store = createIncidentMemoryStore();
    const app = createServerApp(store);

    const response = await app.request('/api/scoring/recompute-demo', {
      body: JSON.stringify({ signals: [] }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const payload = await readJson<ApiErrorResponse>(response);

    expect(response.status).toBe(400);
    expect(payload.message).toContain('External scoring inputs');
  });

  it('keeps scoring responses free of moderation action commands', async () => {
    const store = createIncidentMemoryStore();
    await store.seedDemoIncidents();
    const app = createServerApp(store);

    const response = await app.request('/api/scoring/preview');
    const payloadText = await response.text();

    expect(payloadText).not.toContain('redditAction');
    expect(payloadText).not.toContain('webhook');
    expect(payloadText).not.toContain('aiDecision');
  });
});
