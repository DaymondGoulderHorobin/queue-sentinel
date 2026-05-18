import type {
  ApiErrorResponse,
  IngestionPreviewResponse,
  IngestionResetResponse,
  IngestionSeedResponse,
  IngestionStatusResponse,
} from '../../shared/apiTypes';

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

  if (payload.status === 'ok' && response.ok) {
    return payload;
  }

  if (payload.status === 'error') {
    throw new Error(payload.message);
  }

  throw new Error(`Request failed with HTTP ${response.status}`);
};

export const getIngestionStatus = async () => {
  return await fetchJson<IngestionStatusResponse>('/api/ingestion/status');
};

export const previewReadonlyIngestion = async (fixturePackId?: string) => {
  return await fetchJson<IngestionPreviewResponse>('/api/ingestion/preview', {
    method: 'POST',
    body: JSON.stringify({ fixturePackId }),
  });
};

export const seedPlaytestSignals = async (fixturePackId?: string) => {
  return await fetchJson<IngestionSeedResponse>('/api/ingestion/playtest-seed', {
    method: 'POST',
    body: JSON.stringify({ fixturePackId }),
  });
};

export const resetPlaytestSignals = async () => {
  return await fetchJson<IngestionResetResponse>('/api/ingestion/reset', {
    method: 'POST',
    body: JSON.stringify({}),
  });
};
