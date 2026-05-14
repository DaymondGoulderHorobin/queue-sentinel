import type {
  ApiErrorResponse,
  IncidentStatusUpdateRequest,
  IncidentStatusUpdateResponse,
  IncidentsListResponse,
  SeedDemoResponse,
} from '../../shared/apiTypes';
import type { IncidentStatus } from '../../shared/types';

const readJson = async <T>(response: Response): Promise<T | ApiErrorResponse> => {
  try {
    return (await response.json()) as T | ApiErrorResponse;
  } catch {
    return {
      status: 'error',
      message: `Request failed with HTTP ${response.status}`,
    };
  }
};

const assertOk = <T extends { status: 'ok' }>(
  payload: T | ApiErrorResponse,
): T => {
  if (payload.status === 'ok') {
    return payload;
  }

  throw new Error(payload.message);
};

const fetchJson = async <T extends { status: 'ok' }>(
  input: RequestInfo,
  init?: RequestInit,
) => {
  const response = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  const payload = await readJson<T>(response);

  if (!response.ok) {
    if (payload.status === 'error') {
      throw new Error(payload.message);
    }

    throw new Error(`Request failed with HTTP ${response.status}`);
  }

  return assertOk(payload);
};

export const listIncidents = async () => {
  return await fetchJson<IncidentsListResponse>('/api/incidents');
};

export const seedDemoIncidents = async () => {
  return await fetchJson<SeedDemoResponse>('/api/demo/seed', {
    method: 'POST',
    body: JSON.stringify({}),
  });
};

export const resetDemoIncidents = async () => {
  return await fetchJson<SeedDemoResponse>('/api/demo/reset', {
    method: 'POST',
    body: JSON.stringify({}),
  });
};

export const updateIncidentStatus = async (
  id: string,
  status: IncidentStatus,
) => {
  return await fetchJson<IncidentStatusUpdateResponse>(
    `/api/incidents/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status,
      } satisfies IncidentStatusUpdateRequest),
    },
  );
};
