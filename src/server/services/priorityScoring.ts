import type { IncidentPriority, QueueIncident } from '../types/incident';

export interface PriorityScoreDraft {
  priority: IncidentPriority;
  reasons: string[];
  scoringModel: 'sprint-0-placeholder';
}

export const getPlaceholderPriorityScore = (
  incident: QueueIncident,
): PriorityScoreDraft => {
  // Sprint 0 intentionally mirrors mock priority. Future Redis-backed scoring
  // should replace this boundary without changing client page contracts.
  return {
    priority: incident.priority,
    reasons: incident.whySurfaced,
    scoringModel: 'sprint-0-placeholder',
  };
};
