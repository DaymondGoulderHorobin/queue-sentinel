import type {
  ApiErrorResponse,
  ScoringPreviewResponse,
  ScoringRecomputeResponse,
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

export const previewScoring = async () => {
  return await fetchJson<ScoringPreviewResponse>('/api/scoring/preview');
};

export const recomputeDemoScoring = async () => {
  return await fetchJson<ScoringRecomputeResponse>('/api/scoring/recompute-demo', {
    method: 'POST',
    body: JSON.stringify({}),
  });
};
