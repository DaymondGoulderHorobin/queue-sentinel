import type {
  IncidentStatusUpdateRequest,
  IncidentStatusUpdateResponse,
  IncidentsListResponse,
  SeedDemoResponse,
} from '../../shared/apiTypes';
import type { IncidentStatus } from '../../shared/types';
import { fetchJson, jsonRequest } from './fetchJson';

export const listIncidents = async () => {
  return await fetchJson<IncidentsListResponse>('/api/incidents');
};

export const seedDemoIncidents = async () => {
  return await fetchJson<SeedDemoResponse>(
    '/api/demo/seed',
    jsonRequest({
      method: 'POST',
      body: JSON.stringify({}),
    }),
  );
};

export const resetDemoIncidents = async () => {
  return await fetchJson<SeedDemoResponse>(
    '/api/demo/reset',
    jsonRequest({
      method: 'POST',
      body: JSON.stringify({}),
    }),
  );
};

export const updateIncidentStatus = async (
  id: string,
  status: IncidentStatus,
) => {
  return await fetchJson<IncidentStatusUpdateResponse>(
    `/api/incidents/${encodeURIComponent(id)}/status`,
    jsonRequest({
      method: 'PATCH',
      body: JSON.stringify({
        status,
      } satisfies IncidentStatusUpdateRequest),
    }),
  );
};
