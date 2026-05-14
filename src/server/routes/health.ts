import { Hono } from 'hono';

import type { HealthResponse } from '../../shared/types';

export const healthRoute = new Hono();

healthRoute.get('/', (context) => {
  return context.json<HealthResponse>({
    status: 'ok',
    service: 'queue-sentinel',
    sprint: 'sprint-1',
    timestamp: new Date().toISOString(),
  });
});
