export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus = 'open' | 'reviewing' | 'resolved' | 'escalated';

export type QueueItemType = 'post' | 'comment' | 'user' | 'domain';

export interface QueueIncident {
  id: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  title: string;
  itemType: QueueItemType;
  reportCount: number;
  queueAgeMinutes: number;
  suspectedRuleArea: string;
  whySurfaced: string[];
  userContextSummary: string;
  relatedItemCount: number;
  rationaleDraft: string;
  createdAt: string;
  updatedAt: string;
}

export type AppTabId =
  | 'dashboard'
  | 'incidents'
  | 'case-card'
  | 'metrics'
  | 'settings';

export interface AppTab {
  id: AppTabId;
  label: string;
}

export interface HealthResponse {
  status: 'ok';
  service: 'queue-sentinel';
  sprint: 'sprint-0';
  timestamp: string;
}

export interface MockIncidentsResponse {
  status: 'ok';
  source: 'demo';
  incidents: QueueIncident[];
}

export interface ErrorResponse {
  status: 'error';
  message: string;
}
