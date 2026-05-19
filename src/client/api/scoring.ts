import type {
  ScoringPreviewResponse,
  ScoringRecomputeResponse,
} from '../../shared/apiTypes';
import { fetchJson, jsonRequest } from './fetchJson';

export const previewScoring = async () => {
  return await fetchJson<ScoringPreviewResponse>('/api/scoring/preview');
};

export const recomputeDemoScoring = async () => {
  return await fetchJson<ScoringRecomputeResponse>(
    '/api/scoring/recompute-demo',
    jsonRequest({
      method: 'POST',
      body: JSON.stringify({}),
    }),
  );
};
