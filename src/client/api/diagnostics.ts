import { fetchJson } from './fetchJson';
import type { DiagnosticsResponse } from '../../shared/apiTypes';

export const getDiagnostics = async () => {
  return await fetchJson<DiagnosticsResponse>('/api/diagnostics');
};
