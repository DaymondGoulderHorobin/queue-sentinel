import { createServer, getServerPort } from '@devvit/web/server';
import { serve } from '@hono/node-server';

import { createServerApp } from './app';
import { incidentStore } from './services/incidentStore';
import { createReadonlyIngestionConfig } from './services/ingestionConfig';
import { queueSignalStore } from './services/queueSignalStore';

const ingestionConfig = createReadonlyIngestionConfig(
  process.env,
  queueSignalStore.mode,
);

serve({
  fetch: createServerApp(incidentStore, queueSignalStore, ingestionConfig).fetch,
  createServer,
  port: getServerPort(),
});
