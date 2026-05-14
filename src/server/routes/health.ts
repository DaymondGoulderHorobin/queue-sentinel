import { Hono } from 'hono';

import type { IncidentStore } from '../services/incidentStore';
import type { HealthResponse } from '../../shared/apiTypes';

export const createHealthRoute = (store: IncidentStore) => {
  const healthRoute = new Hono();

  healthRoute.get('/', (context) => {
    return context.json<HealthResponse>({
      status: 'ok',
      service: 'queue-sentinel',
      sprint: 'sprint-2',
      storeMode: store.mode,
      timestamp: new Date().toISOString(),
    });
  });

  return healthRoute;
};
