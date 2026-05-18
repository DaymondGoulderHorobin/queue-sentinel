import { Hono } from 'hono';

import {
  AUDIT_LOG_RECENT_LIMIT,
  type AuditLogStore,
} from '../services/auditLogStore';
import type { IncidentStore } from '../services/incidentStore';
import type { ModeratorAuthService } from '../services/moderatorAuth';
import type { QueueSignalStore } from '../services/queueSignalStore';
import { SCORING_MODEL_VERSION } from '../../shared/scoringEngine';
import { PLAYTEST_FIXTURE_PACK_OPTIONS } from '../../shared/playtestFixturePacks';
import type { ApiErrorResponse, DiagnosticsResponse } from '../../shared/apiTypes';
import type { ReadonlyIngestionConfig } from '../../shared/types';

const errorResponse = (message: string): ApiErrorResponse => ({
  status: 'error',
  message,
});

export const createDiagnosticsRoute = (
  incidentStore: IncidentStore,
  signalStore: QueueSignalStore,
  ingestionConfig: ReadonlyIngestionConfig,
  moderatorAuth: ModeratorAuthService,
  auditStore: AuditLogStore,
) => {
  const diagnosticsRoute = new Hono();
  const routeConfig: ReadonlyIngestionConfig = {
    ...ingestionConfig,
    storeMode: signalStore.mode,
  };

  diagnosticsRoute.get('/', async (context) => {
    try {
      const [
        incidents,
        signals,
        lastRun,
        authorization,
        auditEntries,
        auditCount,
      ] = await Promise.all([
        incidentStore.listIncidents(),
        signalStore.listSignals(),
        signalStore.getLastRunSummary(),
        moderatorAuth.getDiagnostics(),
        auditStore.listRecent(AUDIT_LOG_RECENT_LIMIT),
        auditStore.count(),
      ]);
      const lastRecompute = auditEntries.find(
        (entry) =>
          entry.operation === 'scoring.recompute' &&
          entry.outcome === 'completed',
      );

      return context.json<DiagnosticsResponse>({
        status: 'ok',
        source: incidentStore.mode,
        runtimeMode: process.env.NODE_ENV ?? 'unknown',
        stores: {
          incidentStoreMode: incidentStore.mode,
          signalStoreMode: signalStore.mode,
          auditStoreMode: auditStore.mode,
        },
        ingestion: {
          mode: routeConfig.mode,
          enabled: routeConfig.enabled,
          allowlistConfigured: routeConfig.allowlistConfigured,
          allowedSubredditCount: routeConfig.allowedSubredditNames.length,
          signalCount: signals.length,
          lastRun,
          availableFixturePacks: [...PLAYTEST_FIXTURE_PACK_OPTIONS],
        },
        incidents: {
          count: incidents.length,
        },
        scoring: {
          modelVersion: SCORING_MODEL_VERSION,
          lastRecomputeAt: lastRecompute?.timestamp ?? null,
        },
        authorization,
        audit: {
          entryCount: auditCount,
          recentLimit: AUDIT_LOG_RECENT_LIMIT,
        },
        fallbackWarning: null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to read diagnostics', error);
      return context.json(errorResponse('Diagnostics are unavailable.'), 500);
    }
  });

  return diagnosticsRoute;
};
