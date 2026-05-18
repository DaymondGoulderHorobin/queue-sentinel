import { Hono } from 'hono';

import { resetDemoQueue, seedDemoQueue } from '../services/demoSeed';
import type { AuditLogStore } from '../services/auditLogStore';
import type { IncidentStore } from '../services/incidentStore';
import type { ModeratorAuthService } from '../services/moderatorAuth';
import type { ApiErrorResponse, SeedDemoResponse } from '../../shared/apiTypes';

const errorResponse = (message: string): ApiErrorResponse => ({
  status: 'error',
  message,
});

export const createDemoRoute = (
  store: IncidentStore,
  moderatorAuth: ModeratorAuthService,
  auditStore: AuditLogStore,
) => {
  const demoRoute = new Hono();

  demoRoute.post('/seed', async (context) => {
    try {
      const authorization = await moderatorAuth.guardMutation();

      if (!authorization.allowed) {
        await auditStore.append({
          operation: 'demo.seed',
          outcome: 'denied',
          sourceRoute: '/api/demo/seed',
          storeMode: store.mode,
          actor: authorization.actor,
        });

        return context.json(errorResponse(authorization.message), 403);
      }

      const { result, incidents } = await seedDemoQueue(store);

      await auditStore.append({
        operation: 'demo.seed',
        outcome: 'completed',
        sourceRoute: '/api/demo/seed',
        storeMode: store.mode,
        actor: authorization.actor,
        counts: {
          incidents: incidents.length,
          overwritten: result.overwritten,
        },
      });

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
      const authorization = await moderatorAuth.guardMutation();

      if (!authorization.allowed) {
        await auditStore.append({
          operation: 'demo.reset',
          outcome: 'denied',
          sourceRoute: '/api/demo/reset',
          storeMode: store.mode,
          actor: authorization.actor,
        });

        return context.json(errorResponse(authorization.message), 403);
      }

      const { result, incidents } = await resetDemoQueue(store);

      await auditStore.append({
        operation: 'demo.reset',
        outcome: 'completed',
        sourceRoute: '/api/demo/reset',
        storeMode: store.mode,
        actor: authorization.actor,
        counts: {
          incidents: incidents.length,
          overwritten: result.overwritten,
        },
      });

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
