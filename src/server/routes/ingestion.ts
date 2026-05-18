import { Hono } from 'hono';

import type { AuditLogStore } from '../services/auditLogStore';
import { isReadonlyPlaytestEnabled } from '../services/ingestionConfig';
import type { ModeratorAuthService } from '../services/moderatorAuth';
import { normalizeReadonlyIngestion } from '../services/redditSignalNormalizer';
import type { QueueSignalStore } from '../services/queueSignalStore';
import {
  SCORING_MODEL_VERSION,
} from '../../shared/scoringEngine';
import { getPlaytestFixturePack } from '../../shared/playtestFixturePacks';
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
): {
  items?: readonly unknown[];
  fixturePackId?: string;
  fixturePackLabel?: string;
  error?: string;
} => {
  const maybeItems = (body as IngestionPreviewRequest).items;
  const maybeFixturePackId = (body as IngestionPreviewRequest).fixturePackId;

  if (
    maybeFixturePackId !== undefined &&
    typeof maybeFixturePackId !== 'string'
  ) {
    return { error: 'Fixture pack id must be a string.' };
  }

  if (maybeItems === undefined) {
    const fixturePack = getPlaytestFixturePack(maybeFixturePackId);

    if (!fixturePack) {
      return { error: 'Unknown playtest fixture pack.' };
    }

    return {
      items: fixturePack.items,
      fixturePackId: fixturePack.id,
      fixturePackLabel: fixturePack.label,
    };
  }

  if (!Array.isArray(maybeItems)) {
    return { error: 'Preview items must be an array of read-only metadata.' };
  }

  return { items: maybeItems };
};

export const createIngestionRoute = (
  signalStore: QueueSignalStore,
  config: ReadonlyIngestionConfig,
  moderatorAuth: ModeratorAuthService,
  auditStore: AuditLogStore,
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
      const { items, error, fixturePackId, fixturePackLabel } = itemsFromBody(body);

      if (error || !items) {
        return context.json(errorResponse(error ?? 'Invalid ingestion preview.'), 400);
      }

      const result = normalizeReadonlyIngestion(items, routeConfig);

      return context.json<IngestionPreviewResponse>({
        status: 'ok',
        source: signalStore.mode,
        config: routeConfig,
        fixturePackId,
        fixturePackLabel,
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

      const authorization = await moderatorAuth.guardMutation();

      if (!authorization.allowed) {
        await auditStore.append({
          operation: 'playtest.seed',
          outcome: 'denied',
          sourceRoute: '/api/ingestion/playtest-seed',
          storeMode: signalStore.mode,
          actor: authorization.actor,
        });

        return context.json(errorResponse(authorization.message), 403);
      }

      const body = await readOptionalJson(context.req.raw);
      const { items, error, fixturePackId, fixturePackLabel } = itemsFromBody(body);

      if (error || !items) {
        return context.json(errorResponse(error ?? 'Invalid ingestion seed.'), 400);
      }

      const result = normalizeReadonlyIngestion(items, routeConfig);
      await signalStore.upsertSignals(result.signals);
      await signalStore.setLastRunSummary(result.runSummary);
      const signals = await signalStore.listSignals();

      await auditStore.append({
        operation: 'playtest.seed',
        outcome: 'completed',
        sourceRoute: '/api/ingestion/playtest-seed',
        storeMode: signalStore.mode,
        actor: authorization.actor,
        counts: {
          acceptedSignals: result.signals.length,
          rejectedSignals: result.rejected.length,
          signalCount: signals.length,
        },
      });

      return context.json<IngestionSeedResponse>({
        status: 'ok',
        source: signalStore.mode,
        config: routeConfig,
        fixturePackId,
        fixturePackLabel,
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

      const authorization = await moderatorAuth.guardMutation();

      if (!authorization.allowed) {
        await auditStore.append({
          operation: 'playtest.reset',
          outcome: 'denied',
          sourceRoute: '/api/ingestion/reset',
          storeMode: signalStore.mode,
          actor: authorization.actor,
        });

        return context.json(errorResponse(authorization.message), 403);
      }

      const result = await signalStore.resetPlaytestSignals();

      await auditStore.append({
        operation: 'playtest.reset',
        outcome: 'completed',
        sourceRoute: '/api/ingestion/reset',
        storeMode: signalStore.mode,
        actor: authorization.actor,
        counts: {
          resetCount: result.resetCount,
          signalCount: result.signalCount,
        },
      });

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
