import { createServer, getServerPort } from '@devvit/web/server';
import { serve } from '@hono/node-server';

import { createServerApp } from './app';
import { incidentStore } from './services/incidentStore';

serve({
  fetch: createServerApp(incidentStore).fetch,
  createServer,
  port: getServerPort(),
});
