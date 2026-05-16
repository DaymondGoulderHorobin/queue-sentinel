import type {
  ConfidenceLabel,
  IngestionRunSummary,
  IncidentStatus,
  IncidentTimelineEvent,
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
  sprint: 'sprint-4';
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
}

export interface IngestionPreviewResponse extends ApiOkResponse {
  source: ApiSource;
  config: ReadonlyIngestionConfig;
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

export interface IngestionResetResponse extends ApiOkResponse {
  source: ApiSource;
  config: ReadonlyIngestionConfig;
  signalCount: number;
  resetCount: number;
}
