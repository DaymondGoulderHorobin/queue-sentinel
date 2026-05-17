import { Hono } from 'hono';

import { isReadonlyPlaytestEnabled } from '../services/ingestionConfig';
import { normalizeReadonlyIngestion } from '../services/redditSignalNormalizer';
import type { QueueSignalStore } from '../services/queueSignalStore';
import { PLAYTEST_READONLY_INPUTS } from '../../shared/playtestInputs';
import {
  SCORING_MODEL_VERSION,
} from '../../shared/scoringEngine';
import type {
  ApiErrorResponse,
  IngestionPreviewRequest,
  IngestionPreviewResponse,
  IngestionResetResponse,
  IngestionSeedResponse,
  IngestionStatusResponse,
} from '../../shared/apiTypes';
import type { ReadonlyIngestionConfig } from '../../shared/types';

const errorResponse = (message: string): ApiErrorResponse => ({
  status: 'error',
  message,
});

class BadJsonRequestError extends Error {}

const readOptionalJson = async (request: Request) => {
  const text = await request.text();

  if (text.trim().length === 0) {
    return {};
  }

  const parsed = JSON.parse(text) as unknown;

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new BadJsonRequestError('Request body must be a JSON object.');
  }

  return parsed as Record<string, unknown>;
};

const disabledMessage =
  'Read-only ingestion is disabled. Enable the explicit playtest flag and configure an allowed test subreddit before seeding metadata.';

const itemsFromBody = (
  body: Record<string, unknown>,
): { items?: readonly unknown[]; error?: string } => {
  const maybeItems = (body as IngestionPreviewRequest).items;

  if (maybeItems === undefined) {
    return { items: PLAYTEST_READONLY_INPUTS };
  }

  if (!Array.isArray(maybeItems)) {
    return { error: 'Preview items must be an array of read-only metadata.' };
  }

  return { items: maybeItems };
};

export const createIngestionRoute = (
  signalStore: QueueSignalStore,
  config: ReadonlyIngestionConfig,
) => {
  const ingestionRoute = new Hono();
  const routeConfig: ReadonlyIngestionConfig = {
    ...config,
    storeMode: signalStore.mode,
  };

  ingestionRoute.get('/status', async (context) => {
    try {
      const [signals, lastRun] = await Promise.all([
        signalStore.listSignals(),
        signalStore.getLastRunSummary(),
      ]);

      return context.json<IngestionStatusResponse>({
        status: 'ok',
        source: signalStore.mode,
        config: routeConfig,
        signalCount: signals.length,
        lastRun,
        modelVersion: SCORING_MODEL_VERSION,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to read ingestion status', error);
      return context.json(errorResponse('Ingestion status is unavailable.'), 500);
    }
  });

  ingestionRoute.post('/preview', async (context) => {
    try {
      if (!isReadonlyPlaytestEnabled(routeConfig)) {
        return context.json(errorResponse(disabledMessage), 403);
      }

      const body = await readOptionalJson(context.req.raw);
      const { items, error } = itemsFromBody(body);

      if (error || !items) {
        return context.json(errorResponse(error ?? 'Invalid ingestion preview.'), 400);
      }

      const result = normalizeReadonlyIngestion(items, routeConfig);

      return context.json<IngestionPreviewResponse>({
        status: 'ok',
        source: signalStore.mode,
        config: routeConfig,
        ...result,
      });
    } catch (error) {
      if (error instanceof BadJsonRequestError || error instanceof SyntaxError) {
        return context.json(errorResponse('Malformed ingestion request body.'), 400);
      }

      console.error('Failed to preview read-only ingestion', error);
      return context.json(errorResponse('Ingestion preview failed.'), 500);
    }
  });

  ingestionRoute.post('/playtest-seed', async (context) => {
    try {
      if (!isReadonlyPlaytestEnabled(routeConfig)) {
        return context.json(errorResponse(disabledMessage), 403);
      }

      const body = await readOptionalJson(context.req.raw);
      const { items, error } = itemsFromBody(body);

      if (error || !items) {
        return context.json(errorResponse(error ?? 'Invalid ingestion seed.'), 400);
      }

      const result = normalizeReadonlyIngestion(items, routeConfig);
      await signalStore.upsertSignals(result.signals);
      await signalStore.setLastRunSummary(result.runSummary);
      const signals = await signalStore.listSignals();

      return context.json<IngestionSeedResponse>({
        status: 'ok',
        source: signalStore.mode,
        config: routeConfig,
        ...result,
        signalCount: signals.length,
      });
    } catch (error) {
      if (error instanceof BadJsonRequestError || error instanceof SyntaxError) {
        return context.json(errorResponse('Malformed ingestion request body.'), 400);
      }

      console.error('Failed to seed read-only playtest signals', error);
      return context.json(errorResponse('Playtest seeding failed.'), 500);
    }
  });

  ingestionRoute.post('/reset', async (context) => {
    try {
      if (!isReadonlyPlaytestEnabled(routeConfig)) {
        return context.json(errorResponse(disabledMessage), 403);
      }

      const result = await signalStore.resetPlaytestSignals();

      return context.json<IngestionResetResponse>({
        status: 'ok',
        source: signalStore.mode,
        config: routeConfig,
        signalCount: result.signalCount,
        resetCount: result.resetCount,
      });
    } catch (error) {
      console.error('Failed to reset playtest signals', error);
      return context.json(errorResponse('Playtest signal reset failed.'), 500);
    }
  });

  return ingestionRoute;
};
