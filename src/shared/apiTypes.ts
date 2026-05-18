import type {
  AuditLogEntry,
  AuthorizationDiagnostics,
  ConfidenceLabel,
  IngestionRunSummary,
  IncidentStatus,
  IncidentTimelineEvent,
  PlaytestFixturePackOption,
  QueueIncident,
  QueueSignal,
  ReadonlyIngestionConfig,
  ReadonlyIngestionRejection,
  RedditReadonlyInput,
  ScoringModelVersion,
  SignalSource,
} from './types';

export type ApiSource = 'redis' | 'memory' | 'fallback';

export interface ApiOkResponse {
  status: 'ok';
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
}

export interface IncidentsListResponse extends ApiOkResponse {
  source: ApiSource;
  incidents: QueueIncident[];
}

export interface IncidentDetailResponse extends ApiOkResponse {
  source: ApiSource;
  incident: QueueIncident;
}

export interface IncidentStatusUpdateRequest {
  status: IncidentStatus;
}

export interface IncidentStatusUpdateResponse extends ApiOkResponse {
  source: ApiSource;
  incident: QueueIncident;
}

export interface IncidentMetadataPatch {
  tags?: string[];
  timeline?: IncidentTimelineEvent[];
  rationaleDraft?: string;
  confidenceLabel?: ConfidenceLabel;
  recommendedReviewAction?: string;
}

export interface IncidentMetadataUpdateRequest {
  patch: IncidentMetadataPatch;
}

export interface IncidentMetadataUpdateResponse extends ApiOkResponse {
  source: ApiSource;
  incident: QueueIncident;
}

export interface SeedDemoResult {
  source: ApiSource;
  count: number;
  overwritten: number;
}

export interface SeedDemoResponse extends ApiOkResponse {
  result: SeedDemoResult;
  incidents: QueueIncident[];
}

export interface HealthResponse extends ApiOkResponse {
  service: 'queue-sentinel';
  sprint: 'sprint-7';
  storeMode: ApiSource;
  ingestionMode: ReadonlyIngestionConfig['mode'];
  scoringModelVersion: ScoringModelVersion;
  timestamp: string;
}

export interface ScoringPreviewResponse extends ApiOkResponse {
  source: ApiSource;
  signalSource: SignalSource;
  runId?: string;
  modelVersion: ScoringModelVersion;
  signalsProcessed: number;
  clustersFormed: number;
  duplicateSignalsCollapsed: number;
  averageScore: number;
  incidents: QueueIncident[];
}

export type ScoringRecomputeResponse = ScoringPreviewResponse;

export interface IngestionStatusResponse extends ApiOkResponse {
  source: ApiSource;
  config: ReadonlyIngestionConfig;
  signalCount: number;
  lastRun: IngestionRunSummary | null;
  modelVersion: ScoringModelVersion;
  timestamp: string;
}

export interface IngestionPreviewRequest {
  items?: RedditReadonlyInput[];
  fixturePackId?: string;
}

export interface IngestionPreviewResponse extends ApiOkResponse {
  source: ApiSource;
  config: ReadonlyIngestionConfig;
  fixturePackId?: string;
  fixturePackLabel?: string;
  runSummary: IngestionRunSummary;
  signals: QueueSignal[];
  rejected: ReadonlyIngestionRejection[];
}

export type IngestionSeedResponse = IngestionPreviewResponse & {
  signalCount: number;
};

export interface IngestionResetResult {
  source: ApiSource;
  signalCount: number;
  resetCount: number;
}

export interface DiagnosticsResponse extends ApiOkResponse {
  source: ApiSource;
  runtimeMode: string;
  stores: {
    incidentStoreMode: ApiSource;
    signalStoreMode: ApiSource;
    auditStoreMode: ApiSource;
  };
  ingestion: {
    mode: ReadonlyIngestionConfig['mode'];
    enabled: boolean;
    allowlistConfigured: boolean;
    allowedSubredditCount: number;
    signalCount: number;
    lastRun: IngestionRunSummary | null;
    availableFixturePacks: PlaytestFixturePackOption[];
  };
  incidents: {
    count: number;
  };
  scoring: {
    modelVersion: ScoringModelVersion;
    lastRecomputeAt: string | null;
  };
  authorization: AuthorizationDiagnostics;
  audit: {
    entryCount: number;
    recentLimit: number;
  };
  fallbackWarning: string | null;
  timestamp: string;
}

export interface AuditRecentResponse extends ApiOkResponse {
  source: ApiSource;
  entries: AuditLogEntry[];
}

export interface IngestionResetResponse extends ApiOkResponse {
  source: ApiSource;
  config: ReadonlyIngestionConfig;
  signalCount: number;
  resetCount: number;
}
