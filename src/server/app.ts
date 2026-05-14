import { Hono } from 'hono';

import { createDemoRoute } from './routes/demo';
import { createHealthRoute } from './routes/health';
import { createIncidentsRoute } from './routes/incidents';
import { menuRoute } from './routes/menu';
import { createScoringRoute } from './routes/scoring';
import type { IncidentStore } from './services/incidentStore';

export const createServerApp = (store: IncidentStore) => {
  const app = new Hono();
  const api = new Hono();
  const internal = new Hono();

  api.route('/health', createHealthRoute(store));
  api.route('/incidents', createIncidentsRoute(store));
  api.route('/demo', createDemoRoute(store));
  api.route('/scoring', createScoringRoute(store));
  internal.route('/menu', menuRoute);

  app.route('/api', api);
  app.route('/internal', internal);

  return app;
};
