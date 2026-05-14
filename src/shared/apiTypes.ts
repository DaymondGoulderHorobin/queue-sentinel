import type {
  ConfidenceLabel,
  IncidentStatus,
  IncidentTimelineEvent,
  QueueIncident,
  ScoringModelVersion,
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
  sprint: 'sprint-3';
  storeMode: ApiSource;
  scoringModelVersion: ScoringModelVersion;
  timestamp: string;
}

export interface ScoringPreviewResponse extends ApiOkResponse {
  source: ApiSource;
  modelVersion: ScoringModelVersion;
  signalsProcessed: number;
  clustersFormed: number;
  duplicateSignalsCollapsed: number;
  averageScore: number;
  incidents: QueueIncident[];
}

export type ScoringRecomputeResponse = ScoringPreviewResponse;
