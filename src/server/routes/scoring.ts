import { Hono } from 'hono';

import { buildDemoScoringPreview } from '../services/incidentMaterializer';
import type { IncidentStore } from '../services/incidentStore';
import type {
  ApiErrorResponse,
  ScoringPreviewResponse,
  ScoringRecomputeResponse,
} from '../../shared/apiTypes';

const errorResponse = (message: string): ApiErrorResponse => ({
  status: 'error',
  message,
});

const readOptionalBody = async (request: Request) => {
  const text = await request.text();

  if (text.trim().length === 0) {
    return {};
  }

  return JSON.parse(text) as Record<string, unknown>;
};

export const createScoringRoute = (store: IncidentStore) => {
  const scoringRoute = new Hono();

  scoringRoute.get('/preview', async (context) => {
    try {
      const existingIncidents = await store.listIncidents();
      const preview = buildDemoScoringPreview(existingIncidents);

      return context.json<ScoringPreviewResponse>({
        status: 'ok',
        source: store.mode,
        ...preview,
      });
    } catch (error) {
      console.error('Failed to preview deterministic scoring', error);
      return context.json(errorResponse('Scoring preview is unavailable.'), 500);
    }
  });

  scoringRoute.post('/recompute-demo', async (context) => {
    try {
      const body = await readOptionalBody(context.req.raw);

      if (Object.keys(body).length > 0) {
        return context.json(
          errorResponse('External scoring inputs are not accepted in Sprint 3.'),
          400,
        );
      }

      const existingIncidents = await store.listIncidents();
      const preview = buildDemoScoringPreview(existingIncidents);

      for (const incident of preview.incidents) {
        await store.upsertIncident(incident);
      }

      const incidents = await store.listIncidents();

      return context.json<ScoringRecomputeResponse>({
        status: 'ok',
        source: store.mode,
        ...preview,
        incidents: [...incidents],
      });
    } catch (error) {
      console.error('Failed to recompute deterministic scoring', error);
      return context.json(errorResponse('Scoring recompute failed.'), 500);
    }
  });

  return scoringRoute;
};
