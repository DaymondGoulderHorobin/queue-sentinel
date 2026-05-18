import { Hono } from 'hono';

import {
  AUDIT_LOG_RECENT_LIMIT,
  type AuditLogStore,
} from '../services/auditLogStore';
import type { ApiErrorResponse, AuditRecentResponse } from '../../shared/apiTypes';

const errorResponse = (message: string): ApiErrorResponse => ({
  status: 'error',
  message,
});

export const createAuditRoute = (auditStore: AuditLogStore) => {
  const auditRoute = new Hono();

  auditRoute.get('/recent', async (context) => {
    try {
      const entries = await auditStore.listRecent(AUDIT_LOG_RECENT_LIMIT);

      return context.json<AuditRecentResponse>({
        status: 'ok',
        source: auditStore.mode,
        entries: [...entries],
      });
    } catch (error) {
      console.error('Failed to read audit log', error);
      return context.json(errorResponse('Audit log is unavailable.'), 500);
    }
  });

  return auditRoute;
};
