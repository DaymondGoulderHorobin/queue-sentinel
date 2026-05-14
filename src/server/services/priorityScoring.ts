import type { IncidentPriority, QueueIncident } from '../types/incident';

export interface PriorityScoreDraft {
  priority: IncidentPriority;
  reasons: string[];
  scoringModel: 'demo-placeholder';
}

export const getPlaceholderPriorityScore = (
  incident: QueueIncident,
): PriorityScoreDraft => {
  // The demo intentionally mirrors fixture priority. Future persisted scoring
  // should replace this boundary without changing client page contracts.
  return {
    priority: incident.priority,
    reasons: incident.whySurfaced,
    scoringModel: 'demo-placeholder',
  };
};
