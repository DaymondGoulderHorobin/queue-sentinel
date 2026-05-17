import { describe, expect, it } from 'vitest';

import { createServerApp } from '../src/server/app';
import { createIncidentMemoryStore } from '../src/server/services/incidentMemoryStore';
import type {
  ApiErrorResponse,
  HealthResponse,
  IncidentDetailResponse,
  IncidentMetadataUpdateResponse,
  IncidentStatusUpdateResponse,
  IncidentsListResponse,
  SeedDemoResponse,
} from '../src/shared/apiTypes';

const createTestApp = async () => {
  const store = createIncidentMemoryStore();
  await store.seedDemoIncidents();

  return createServerApp(store);
};

const readJson = async <T>(response: Response) => {
  return (await response.json()) as T;
};

describe('incident API routes', () => {
  it('reports sprint and store mode on health', async () => {
    const app = await createTestApp();
    const response = await app.request('/api/health');
    const payload = await readJson<HealthResponse>(response);

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      status: 'ok',
      service: 'queue-sentinel',
      sprint: 'sprint-4',
      storeMode: 'memory',
      ingestionMode: 'disabled',
      scoringModelVersion: 'sprint-3-deterministic-v1',
    });
  });

  it('lists and retrieves incidents from the active store', async () => {
    const app = await createTestApp();
    const listResponse = await app.request('/api/incidents');
    const listPayload = await readJson<IncidentsListResponse>(listResponse);

    expect(listResponse.status).toBe(200);
    expect(listPayload.incidents).toHaveLength(10);
    expect(listPayload.incidents[0]?.priorityScore?.modelVersion).toBe(
      'sprint-3-deterministic-v1',
    );

    const detailResponse = await app.request('/api/incidents/inc-demo-001');
    const detailPayload = await readJson<IncidentDetailResponse>(detailResponse);

    expect(detailResponse.status).toBe(200);
    expect(detailPayload.incident.id).toBe('inc-demo-001');
  });

  it('updates internal incident status only', async () => {
    const app = await createTestApp();
    const response = await app.request('/api/incidents/inc-demo-001/status', {
      body: JSON.stringify({ status: 'resolved' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    });
    const payload = await readJson<IncidentMetadataUpdateResponse>(response);

    expect(response.status).toBe(200);
    expect(payload.incident.status).toBe('resolved');
    expect(payload.incident.id).toBe('inc-demo-001');
  });

  it('rejects invalid status and missing incidents', async () => {
    const app = await createTestApp();
    const invalidResponse = await app.request('/api/incidents/inc-demo-001/status', {
      body: JSON.stringify({ status: 'ban' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    });
    const invalidPayload = await readJson<ApiErrorResponse>(invalidResponse);

    expect(invalidResponse.status).toBe(400);
    expect(invalidPayload.status).toBe('error');

    const missingResponse = await app.request('/api/incidents/missing/status', {
      body: JSON.stringify({ status: 'reviewing' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    });

    expect(missingResponse.status).toBe(404);
  });

  it('updates safe metadata and rejects unsafe metadata keys', async () => {
    const app = await createTestApp();
    const response = await app.request('/api/incidents/inc-demo-001/metadata', {
      body: JSON.stringify({
        patch: {
          confidenceLabel: 'low',
          recommendedReviewAction: 'Review later in the safe demo queue.',
        },
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    });
    const payload = await readJson<IncidentStatusUpdateResponse>(response);

    expect(response.status).toBe(200);
    expect(payload.incident.confidenceLabel).toBe('low');

    const invalidResponse = await app.request('/api/incidents/inc-demo-001/metadata', {
      body: JSON.stringify({ patch: { redditAction: 'remove' } }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    });

    expect(invalidResponse.status).toBe(400);
  });

  it('seeds and resets demo incidents', async () => {
    const app = await createTestApp();
    const seedResponse = await app.request('/api/demo/seed', { method: 'POST' });
    const seedPayload = await readJson<SeedDemoResponse>(seedResponse);

    expect(seedResponse.status).toBe(200);
    expect(seedPayload.incidents).toHaveLength(10);

    const resetResponse = await app.request('/api/demo/reset', { method: 'POST' });
    const resetPayload = await readJson<SeedDemoResponse>(resetResponse);

    expect(resetResponse.status).toBe(200);
    expect(resetPayload.result.count).toBe(10);
    expect(resetPayload.incidents).toHaveLength(10);
  });
});
