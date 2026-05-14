export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus = 'open' | 'reviewing' | 'resolved' | 'escalated';

export type QueueItemType = 'post' | 'comment' | 'user' | 'domain';

export type SignalStrength = 'low' | 'medium' | 'high';

export type ConfidenceLabel = 'low' | 'medium' | 'high';

export type ScoringModelVersion = 'sprint-3-deterministic-v1';

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

export interface QueueSignal {
  id: string;
  itemId: string;
  itemType: QueueItemType;
  subjectKey: string;
  authorKey?: string;
  domainKey?: string;
  threadKey?: string;
  suspectedRuleArea: string;
  reportReason: string;
  createdAt: string;
  receivedAt: string;
  tags?: string[];
}

export interface ScoreFactor {
  key: string;
  label: string;
  value: number;
  weight: number;
  contribution: number;
  explanation: string;
}

export interface PriorityScore {
  score: number;
  priority: IncidentPriority;
  confidenceLabel: ConfidenceLabel;
  factors: ScoreFactor[];
  reasons: string[];
  modelVersion: ScoringModelVersion;
}

export interface ClusterSummary {
  clusterId: string;
  signalCount: number;
  uniqueItemCount: number;
  timeWindowMinutes: number;
  groupingKeys: string[];
  representativeSignalIds: string[];
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
  clusterSummary?: ClusterSummary;
  priorityScore?: PriorityScore;
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

export interface ScoringWorkbenchMetrics {
  signalsProcessed: number;
  clustersFormed: number;
  averageScore: number;
  duplicateSignalsCollapsed: number;
  highPriorityShare: number;
  modelVersion: ScoringModelVersion;
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
