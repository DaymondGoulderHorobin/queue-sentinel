import { Hono } from 'hono';

import { incidentStore } from '../services/incidentStore';
import type { ErrorResponse, MockIncidentsResponse } from '../../shared/types';

export const mockIncidentsRoute = new Hono();

mockIncidentsRoute.get('/', async (context) => {
  try {
    const incidents = await incidentStore.listIncidents();

    return context.json<MockIncidentsResponse>({
      status: 'ok',
      source: 'demo',
      incidents: [...incidents],
    });
  } catch (error) {
    console.error('Failed to load mock incidents', error);
    return context.json<ErrorResponse>(
      {
        status: 'error',
        message: 'Mock incidents are unavailable.',
      },
      500,
    );
  }
});

mockIncidentsRoute.get('/:id', async (context) => {
  try {
    const incident = await incidentStore.getIncident(context.req.param('id'));

    if (!incident) {
      return context.json<ErrorResponse>(
        {
          status: 'error',
          message: 'Incident not found.',
        },
        404,
      );
    }

    return context.json({
      status: 'ok' as const,
      source: 'demo' as const,
      incident,
    });
  } catch (error) {
    console.error('Failed to load mock incident', error);
    return context.json<ErrorResponse>(
      {
        status: 'error',
        message: 'Mock incident is unavailable.',
      },
      500,
    );
  }
});
