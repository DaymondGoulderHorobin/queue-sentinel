import { fetchJson } from './fetchJson';
import type { AuditRecentResponse } from '../../shared/apiTypes';

export const getRecentAuditEntries = async () => {
  return await fetchJson<AuditRecentResponse>('/api/audit/recent');
};
