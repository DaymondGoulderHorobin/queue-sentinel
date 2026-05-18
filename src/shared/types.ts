export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus = 'open' | 'reviewing' | 'resolved' | 'escalated';

export type QueueItemType = 'post' | 'comment' | 'user' | 'domain';

export type SignalStrength = 'low' | 'medium' | 'high';

export type ConfidenceLabel = 'low' | 'medium' | 'high';

export type ScoringModelVersion = 'sprint-3-deterministic-v1';

export type SignalSource = 'synthetic-demo' | 'playtest-readonly' | 'fallback';

export type IngestionMode = 'disabled' | 'demo-only' | 'playtest-readonly';

export type AuthorizationMode =
  | 'moderator-required'
  | 'local-bypass'
  | 'unavailable';

export type AuthorizationStatus =
  | 'allowed'
  | 'denied'
  | 'local-bypass'
  | 'unavailable';

export interface SafeActorContext {
  source: 'devvit-context' | 'local-bypass' | 'unavailable';
  actorKey?: string;
  subredditKey?: string;
}

export interface AuthorizationDiagnostics {
  mode: AuthorizationMode;
  status: AuthorizationStatus;
  mutationsAllowed: boolean;
  actor: SafeActorContext | null;
  message: string;
}

export type AuditOperationType =
  | 'demo.seed'
  | 'demo.reset'
  | 'playtest.seed'
  | 'playtest.reset'
  | 'scoring.recompute'
  | 'incident.status.update'
  | 'incident.metadata.update';

export type AuditOutcome = 'allowed' | 'denied' | 'completed';

export interface AuditLogEntry {
  id: string;
  operation: AuditOperationType;
  outcome: AuditOutcome;
  timestamp: string;
  sourceRoute: string;
  storeMode: SignalStoreMode;
  actor: SafeActorContext | null;
  counts: Record<string, number>;
}

export interface PlaytestFixturePack {
  id: string;
  label: string;
  description: string;
  items: readonly RedditReadonlyInput[];
}

export interface PlaytestFixturePackOption {
  id: string;
  label: string;
  description: string;
  itemCount: number;
}

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
  source?: SignalSource;
  subredditName?: string;
  safeExcerpt?: string;
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

export type SignalStoreMode = 'redis' | 'memory' | 'fallback';

export interface IngestionProvenance {
  source: SignalSource;
  runId?: string;
  subredditName?: string;
  acceptedAt?: string;
  signalIds: string[];
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
  ingestionProvenance?: IngestionProvenance;
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

export interface ReadonlyIngestionConfig {
  mode: IngestionMode;
  storeMode: SignalStoreMode;
  allowedSubredditNames: string[];
  enabled: boolean;
  requiredEnvPresent: boolean;
  allowlistConfigured: boolean;
}

export interface IngestionRunSummary {
  runId: string;
  mode: IngestionMode;
  source: SignalSource;
  storeMode: SignalStoreMode;
  acceptedSignals: number;
  rejectedSignals: number;
  reasons: string[];
  startedAt: string;
  finishedAt: string;
}

export interface ReadonlyIngestionRejection {
  itemId?: string;
  subredditName?: string;
  reason: string;
}

export interface RedditReadonlyInput {
  itemId: string;
  itemType: QueueItemType;
  subredditName: string;
  authorKey?: string;
  threadKey?: string;
  domainKey?: string;
  suspectedRuleArea?: string;
  reportReason?: string;
  createdAt: string;
  receivedAt: string;
  safeExcerpt?: string;
  tags?: string[];
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
