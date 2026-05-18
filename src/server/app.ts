import { Hono } from 'hono';

import { createAuditRoute } from './routes/audit';
import { createDemoRoute } from './routes/demo';
import { createDiagnosticsRoute } from './routes/diagnostics';
import { createHealthRoute } from './routes/health';
import { createIngestionRoute } from './routes/ingestion';
import { createIncidentsRoute } from './routes/incidents';
import { menuRoute } from './routes/menu';
import { createScoringRoute } from './routes/scoring';
import { createAuditLogMemoryStore } from './services/auditLogMemoryStore';
import type { AuditLogStore } from './services/auditLogStore';
import { createReadonlyIngestionConfig } from './services/ingestionConfig';
import type { IncidentStore } from './services/incidentStore';
import {
  createModeratorAuth,
  type ModeratorAuthService,
} from './services/moderatorAuth';
import { createQueueSignalMemoryStore } from './services/queueSignalMemoryStore';
import type { QueueSignalStore } from './services/queueSignalStore';
import type { ReadonlyIngestionConfig } from '../shared/types';

export const createServerApp = (
  store: IncidentStore,
  signalStore: QueueSignalStore = createQueueSignalMemoryStore(),
  ingestionConfig: ReadonlyIngestionConfig = createReadonlyIngestionConfig(
    process.env,
    signalStore.mode,
  ),
  moderatorAuth: ModeratorAuthService = createModeratorAuth(),
  auditLogStore: AuditLogStore = createAuditLogMemoryStore(),
) => {
  const app = new Hono();
  const api = new Hono();
  const internal = new Hono();

  api.route('/health', createHealthRoute(store, ingestionConfig));
  api.route('/audit', createAuditRoute(auditLogStore));
  api.route('/diagnostics', createDiagnosticsRoute(
    store,
    signalStore,
    ingestionConfig,
    moderatorAuth,
    auditLogStore,
  ));
  api.route('/incidents', createIncidentsRoute(store, moderatorAuth, auditLogStore));
  api.route('/demo', createDemoRoute(store, moderatorAuth, auditLogStore));
  api.route(
    '/ingestion',
    createIngestionRoute(
      signalStore,
      ingestionConfig,
      moderatorAuth,
      auditLogStore,
    ),
  );
  api.route('/scoring', createScoringRoute(store, signalStore, moderatorAuth, auditLogStore));
  internal.route('/menu', menuRoute);

  app.route('/api', api);
  app.route('/internal', internal);

  return app;
};
