import type { ApiErrorResponse, DiagnosticsResponse } from '../../shared/apiTypes';

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

const fetchJson = async <T extends { status: 'ok' }>(input: RequestInfo) => {
  const response = await fetch(input);
  const payload = await readJson<T>(response);

  if (payload.status === 'ok' && response.ok) {
    return payload;
  }

  if (payload.status === 'error') {
    throw new Error(payload.message);
  }

  throw new Error(`Request failed with HTTP ${response.status}`);
};

export const getDiagnostics = async () => {
  return await fetchJson<DiagnosticsResponse>('/api/diagnostics');
};
