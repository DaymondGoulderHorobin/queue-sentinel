import type {
  IngestionPreviewResponse,
  IngestionResetResponse,
  IngestionSeedResponse,
  IngestionStatusResponse,
} from '../../shared/apiTypes';
import { fetchJson, jsonRequest } from './fetchJson';

export const getIngestionStatus = async () => {
  return await fetchJson<IngestionStatusResponse>('/api/ingestion/status');
};

export const previewReadonlyIngestion = async (fixturePackId?: string) => {
  return await fetchJson<IngestionPreviewResponse>(
    '/api/ingestion/preview',
    jsonRequest({
      method: 'POST',
      body: JSON.stringify({ fixturePackId }),
    }),
  );
};

export const seedPlaytestSignals = async (fixturePackId?: string) => {
  return await fetchJson<IngestionSeedResponse>(
    '/api/ingestion/playtest-seed',
    jsonRequest({
      method: 'POST',
      body: JSON.stringify({ fixturePackId }),
    }),
  );
};

export const resetPlaytestSignals = async () => {
  return await fetchJson<IngestionResetResponse>(
    '/api/ingestion/reset',
    jsonRequest({
      method: 'POST',
      body: JSON.stringify({}),
    }),
  );
};
