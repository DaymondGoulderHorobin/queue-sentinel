import { Hono } from 'hono';

import { SCORING_MODEL_VERSION } from '../services/priorityScoring';
import type { IncidentStore } from '../services/incidentStore';
import type { HealthResponse } from '../../shared/apiTypes';

export const createHealthRoute = (store: IncidentStore) => {
  const healthRoute = new Hono();

  healthRoute.get('/', (context) => {
    return context.json<HealthResponse>({
      status: 'ok',
      service: 'queue-sentinel',
      sprint: 'sprint-3',
      storeMode: store.mode,
      scoringModelVersion: SCORING_MODEL_VERSION,
      timestamp: new Date().toISOString(),
    });
  });

  return healthRoute;
};
