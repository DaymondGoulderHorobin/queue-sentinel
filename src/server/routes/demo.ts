import { Hono } from 'hono';

import { resetDemoQueue, seedDemoQueue } from '../services/demoSeed';
import type { IncidentStore } from '../services/incidentStore';
import type { ApiErrorResponse, SeedDemoResponse } from '../../shared/apiTypes';

const errorResponse = (message: string): ApiErrorResponse => ({
  status: 'error',
  message,
});

export const createDemoRoute = (store: IncidentStore) => {
  const demoRoute = new Hono();

  demoRoute.post('/seed', async (context) => {
    try {
      const { result, incidents } = await seedDemoQueue(store);

      return context.json<SeedDemoResponse>({
        status: 'ok',
        result,
        incidents,
      });
    } catch (error) {
      console.error('Failed to seed demo queue', error);
      return context.json(errorResponse('Demo seed failed.'), 500);
    }
  });

  demoRoute.post('/reset', async (context) => {
    try {
      const { result, incidents } = await resetDemoQueue(store);

      return context.json<SeedDemoResponse>({
        status: 'ok',
        result,
        incidents,
      });
    } catch (error) {
      console.error('Failed to reset demo queue', error);
      return context.json(errorResponse('Demo reset failed.'), 500);
    }
  });

  return demoRoute;
};
