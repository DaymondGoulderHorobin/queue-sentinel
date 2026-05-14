export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus = 'open' | 'reviewing' | 'resolved' | 'escalated';

export type QueueItemType = 'post' | 'comment' | 'user' | 'domain';

export type SignalStrength = 'low' | 'medium' | 'high';

export type ConfidenceLabel = 'low' | 'medium' | 'high';

export type IncidentSortKey =
  | 'priority'
  | 'queueAge'
  | 'reportCount'
  | 'relatedItems'
  | 'updatedAt';

export interface IncidentTimelineEvent {
  id: string;
  label: string;
  detail: string;
  occurredAt: string;
}

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
  tags?: string[];
  signalStrength?: SignalStrength;
  recommendedReviewAction?: string;
  confidenceLabel?: ConfidenceLabel;
  timeline?: IncidentTimelineEvent[];
}

export interface IncidentFilters {
  search: string;
  priority: IncidentPriority | 'all';
  status: IncidentStatus | 'all';
  itemType: QueueItemType | 'all';
  ruleArea: string;
}

export interface WorkbenchMetrics {
  openIncidents: number;
  highPriorityIncidents: number;
  duplicateReportsCollapsed: number;
  totalRelatedItems: number;
  averageQueueAgeMinutes: number;
  estimatedClicksSaved: number;
  ruleAreasSurfaced: number;
  resolvedThisSession: number;
}

export interface PriorityDistributionItem {
  priority: IncidentPriority;
  count: number;
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

export type {
  ApiErrorResponse,
  HealthResponse,
  IncidentsListResponse,
} from './apiTypes';
