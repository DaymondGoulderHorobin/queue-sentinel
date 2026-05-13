import { createServer, getServerPort } from '@devvit/web/server';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { healthRoute } from './routes/health';
import { menuRoute } from './routes/menu';
import { mockIncidentsRoute } from './routes/mockIncidents';

const app = new Hono();
const api = new Hono();
const internal = new Hono();

api.route('/health', healthRoute);
api.route('/incidents', mockIncidentsRoute);
internal.route('/menu', menuRoute);

app.route('/api', api);
app.route('/internal', internal);

serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});
