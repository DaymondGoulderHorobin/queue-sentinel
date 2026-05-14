import { Hono } from 'hono';

import type { IncidentStore } from '../services/incidentStore';
import type {
  ApiErrorResponse,
  IncidentDetailResponse,
  IncidentMetadataPatch,
  IncidentMetadataUpdateRequest,
  IncidentMetadataUpdateResponse,
  IncidentStatusUpdateRequest,
  IncidentStatusUpdateResponse,
  IncidentsListResponse,
} from '../../shared/apiTypes';
import type { IncidentStatus } from '../../shared/types';

const incidentStatuses = new Set<IncidentStatus>([
  'open',
  'reviewing',
  'resolved',
  'escalated',
]);

const errorResponse = (message: string): ApiErrorResponse => ({
  status: 'error',
  message,
});

const isIncidentStatus = (value: unknown): value is IncidentStatus => {
  return typeof value === 'string' && incidentStatuses.has(value as IncidentStatus);
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

const isSafeMetadataPatch = (value: unknown): value is IncidentMetadataPatch => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const patch = value as Record<string, unknown>;
  const allowedKeys = new Set([
    'tags',
    'timeline',
    'rationaleDraft',
    'confidenceLabel',
    'recommendedReviewAction',
  ]);

  if (Object.keys(patch).some((key) => !allowedKeys.has(key))) {
    return false;
  }

  if ('tags' in patch && !isStringArray(patch.tags)) {
    return false;
  }

  if ('timeline' in patch && !Array.isArray(patch.timeline)) {
    return false;
  }

  if (
    'rationaleDraft' in patch &&
    typeof patch.rationaleDraft !== 'string'
  ) {
    return false;
  }

  if (
    'recommendedReviewAction' in patch &&
    typeof patch.recommendedReviewAction !== 'string'
  ) {
    return false;
  }

  if (
    'confidenceLabel' in patch &&
    !['low', 'medium', 'high'].includes(String(patch.confidenceLabel))
  ) {
    return false;
  }

  return true;
};

export const createIncidentsRoute = (store: IncidentStore) => {
  const incidentsRoute = new Hono();

  incidentsRoute.get('/', async (context) => {
    try {
      const incidents = await store.listIncidents();

      return context.json<IncidentsListResponse>({
        status: 'ok',
        source: store.mode,
        incidents: [...incidents],
      });
    } catch (error) {
      console.error('Failed to list incidents', error);
      return context.json(errorResponse('Incidents are unavailable.'), 500);
    }
  });

  incidentsRoute.get('/:id', async (context) => {
    try {
      const incident = await store.getIncident(context.req.param('id'));

      if (!incident) {
        return context.json(errorResponse('Incident not found.'), 404);
      }

      return context.json<IncidentDetailResponse>({
        status: 'ok',
        source: store.mode,
        incident,
      });
    } catch (error) {
      console.error('Failed to load incident', error);
      return context.json(errorResponse('Incident is unavailable.'), 500);
    }
  });

  incidentsRoute.patch('/:id/status', async (context) => {
    let body: IncidentStatusUpdateRequest;

    try {
      body = await context.req.json<IncidentStatusUpdateRequest>();
    } catch {
      return context.json(errorResponse('Invalid JSON body.'), 400);
    }

    if (!isIncidentStatus(body.status)) {
      return context.json(errorResponse('Invalid incident status.'), 400);
    }

    const incident = await store.updateIncidentStatus(
      context.req.param('id'),
      body.status,
    );

    if (!incident) {
      return context.json(errorResponse('Incident not found.'), 404);
    }

    return context.json<IncidentStatusUpdateResponse>({
      status: 'ok',
      source: store.mode,
      incident,
    });
  });

  incidentsRoute.patch('/:id/metadata', async (context) => {
    let body: IncidentMetadataUpdateRequest;

    try {
      body = await context.req.json<IncidentMetadataUpdateRequest>();
    } catch {
      return context.json(errorResponse('Invalid JSON body.'), 400);
    }

    if (!isSafeMetadataPatch(body.patch)) {
      return context.json(errorResponse('Invalid metadata patch.'), 400);
    }

    const incident = await store.updateIncidentMetadata(
      context.req.param('id'),
      body.patch,
    );

    if (!incident) {
      return context.json(errorResponse('Incident not found.'), 404);
    }

    return context.json<IncidentMetadataUpdateResponse>({
      status: 'ok',
      source: store.mode,
      incident,
    });
  });

  return incidentsRoute;
};
