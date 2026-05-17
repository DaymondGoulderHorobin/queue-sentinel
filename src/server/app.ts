import { Hono } from 'hono';

import { createDemoRoute } from './routes/demo';
import { createHealthRoute } from './routes/health';
import { createIngestionRoute } from './routes/ingestion';
import { createIncidentsRoute } from './routes/incidents';
import { menuRoute } from './routes/menu';
import { createScoringRoute } from './routes/scoring';
import { createReadonlyIngestionConfig } from './services/ingestionConfig';
import type { IncidentStore } from './services/incidentStore';
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
) => {
  const app = new Hono();
  const api = new Hono();
  const internal = new Hono();

  api.route('/health', createHealthRoute(store, ingestionConfig));
  api.route('/incidents', createIncidentsRoute(store));
  api.route('/demo', createDemoRoute(store));
  api.route('/ingestion', createIngestionRoute(signalStore, ingestionConfig));
  api.route('/scoring', createScoringRoute(store, signalStore));
  internal.route('/menu', menuRoute);

  app.route('/api', api);
  app.route('/internal', internal);

  return app;
};
