import { Hono } from 'hono';

import { buildDemoScoringPreview } from '../services/incidentMaterializer';
import type { AuditLogStore } from '../services/auditLogStore';
import type { IncidentStore } from '../services/incidentStore';
import type { ModeratorAuthService } from '../services/moderatorAuth';
import type { QueueSignalStore } from '../services/queueSignalStore';
import type {
  ApiErrorResponse,
  ScoringPreviewResponse,
  ScoringRecomputeResponse,
} from '../../shared/apiTypes';
import { DEMO_QUEUE_SIGNALS } from '../../shared/demoSignals';
import type { QueueIncident } from '../../shared/types';

const errorResponse = (message: string): ApiErrorResponse => ({
  status: 'error',
  message,
});

class BadJsonRequestError extends Error {}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const readOptionalBody = async (request: Request) => {
  const text = await request.text();

  if (text.trim().length === 0) {
    return {};
  }

  try {
    const body = JSON.parse(text) as unknown;

    if (!isRecord(body)) {
      throw new BadJsonRequestError(
        'Scoring recompute request body must be a JSON object.',
      );
    }

    return body;
  } catch (error) {
    if (error instanceof BadJsonRequestError) {
      throw error;
    }

    throw new BadJsonRequestError(
      'Malformed scoring recompute request body.',
    );
  }
};

const buildScoringPreview = async (
  store: IncidentStore,
  signalStore: QueueSignalStore,
) => {
  const [existingIncidents, playtestSignals, lastRun] = await Promise.all([
    store.listIncidents(),
    signalStore.listSignals(),
    signalStore.getLastRunSummary(),
  ]);
  const hasPlaytestSignals = playtestSignals.length > 0;
  const signals = hasPlaytestSignals ? playtestSignals : DEMO_QUEUE_SIGNALS;
  const firstSubreddit = playtestSignals.find((signal) => signal.subredditName)
    ?.subredditName;

  return buildDemoScoringPreview(
    existingIncidents as readonly QueueIncident[],
    signals,
    {
      signalSource: hasPlaytestSignals ? 'playtest-readonly' : 'synthetic-demo',
      runId: hasPlaytestSignals ? lastRun?.runId : undefined,
      subredditName: firstSubreddit,
      acceptedAt: hasPlaytestSignals ? lastRun?.finishedAt : undefined,
    },
  );
};

export const createScoringRoute = (
  store: IncidentStore,
  signalStore: QueueSignalStore,
  moderatorAuth: ModeratorAuthService,
  auditStore: AuditLogStore,
) => {
  const scoringRoute = new Hono();

  scoringRoute.get('/preview', async (context) => {
    try {
      const preview = await buildScoringPreview(store, signalStore);

      return context.json<ScoringPreviewResponse>({
        status: 'ok',
        source: store.mode,
        ...preview,
      });
    } catch (error) {
      console.error('Failed to preview deterministic scoring', error);
      return context.json(errorResponse('Scoring preview is unavailable.'), 500);
    }
  });

  scoringRoute.post('/recompute-demo', async (context) => {
    try {
      let body: Record<string, unknown>;

      try {
        body = await readOptionalBody(context.req.raw);
      } catch (error) {
        if (error instanceof BadJsonRequestError) {
          return context.json(errorResponse(error.message), 400);
        }

        throw error;
      }

      if (Object.keys(body).length > 0) {
        return context.json(
          errorResponse('External scoring inputs are not accepted in Sprint 7.1.'),
          400,
        );
      }

      const authorization = await moderatorAuth.guardMutation();

      if (!authorization.allowed) {
        await auditStore.append({
          operation: 'scoring.recompute',
          outcome: 'denied',
          sourceRoute: '/api/scoring/recompute-demo',
          storeMode: store.mode,
          actor: authorization.actor,
        });

        return context.json(errorResponse(authorization.message), 403);
      }

      const preview = await buildScoringPreview(store, signalStore);

      await store.upsertIncidents(preview.incidents);

      await auditStore.append({
        operation: 'scoring.recompute',
        outcome: 'completed',
        sourceRoute: '/api/scoring/recompute-demo',
        storeMode: store.mode,
        actor: authorization.actor,
        counts: {
          incidents: preview.incidents.length,
          signalsProcessed: preview.signalsProcessed,
          clustersFormed: preview.clustersFormed,
        },
      });

      return context.json<ScoringRecomputeResponse>({
        status: 'ok',
        source: store.mode,
        ...preview,
      });
    } catch (error) {
      console.error('Failed to recompute deterministic scoring', error);
      return context.json(errorResponse('Scoring recompute failed.'), 500);
    }
  });

  return scoringRoute;
};
