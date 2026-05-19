import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  listIncidents,
  resetDemoIncidents,
  seedDemoIncidents,
  updateIncidentStatus,
} from '../api/incidents';
import { getRecentAuditEntries } from '../api/audit';
import { getDiagnostics } from '../api/diagnostics';
import {
  getIngestionStatus,
  previewReadonlyIngestion,
  resetPlaytestSignals,
  seedPlaytestSignals,
} from '../api/ingestion';
import { previewScoring, recomputeDemoScoring } from '../api/scoring';
import type {
  ApiSource,
  DiagnosticsResponse,
  IngestionStatusResponse,
  ScoringPreviewResponse,
} from '../../shared/apiTypes';
import { PLAYTEST_FIXTURE_PACK_OPTIONS } from '../../shared/playtestFixturePacks';
import { buildDemoScoringPreview } from '../../shared/scoringEngine';
import type {
  AuditLogEntry,
  IncidentStatus,
  QueueIncident,
} from '../../shared/types';
import { getTopPriorityIncident } from '../../shared/workbench';

type WorkbenchDataStatus = 'loading' | ApiSource;

const isAuthorizationError = (error: unknown): error is Error =>
  error instanceof Error && error.message.includes('Moderator authorization');

const fallbackScoringPreview = (): ScoringPreviewResponse => ({
  status: 'ok',
  source: 'fallback',
  ...buildDemoScoringPreview(),
});

const fallbackIngestionStatus = (): IngestionStatusResponse => ({
  status: 'ok',
  source: 'fallback',
  config: {
    mode: 'disabled',
    storeMode: 'fallback',
    allowedSubredditNames: [],
    enabled: false,
    requiredEnvPresent: false,
    allowlistConfigured: false,
  },
  signalCount: 0,
  lastRun: null,
  modelVersion: fallbackScoringPreview().modelVersion,
  timestamp: new Date().toISOString(),
});

const fallbackDiagnostics = (): DiagnosticsResponse => ({
  status: 'ok',
  source: 'fallback',
  runtimeMode: 'browser-preview',
  stores: {
    incidentStoreMode: 'fallback',
    signalStoreMode: 'fallback',
    auditStoreMode: 'fallback',
  },
  ingestion: {
    mode: 'disabled',
    enabled: false,
    allowlistConfigured: false,
    allowedSubredditCount: 0,
    signalCount: 0,
    lastRun: null,
    availableFixturePacks: [...PLAYTEST_FIXTURE_PACK_OPTIONS],
  },
  incidents: {
    count: fallbackScoringPreview().incidents.length,
  },
  scoring: {
    modelVersion: fallbackScoringPreview().modelVersion,
    lastRecomputeAt: null,
  },
  authorization: {
    mode: 'unavailable',
    status: 'unavailable',
    mutationsAllowed: false,
    actor: null,
    message: 'Server authorization diagnostics are unavailable.',
  },
  audit: {
    entryCount: 0,
    recentLimit: 25,
  },
  fallbackWarning:
    'Browser fallback mode is active. Synthetic demo data is shown locally; Redis, authorization, audit writes, and playtest mutations are disabled.',
  timestamp: new Date().toISOString(),
});

const getInitialSelectedIncidentId = () =>
  getTopPriorityIncident(fallbackScoringPreview().incidents)?.id ??
  fallbackScoringPreview().incidents[0]?.id ??
  '';

const fallbackIncidents = () => fallbackScoringPreview().incidents;

export const preferScoredIncidents = (
  incidents: QueueIncident[],
  scoringPreview: ScoringPreviewResponse,
) => {
  const hasPlaytestIncidents = incidents.some(
    (incident) => incident.ingestionProvenance?.source === 'playtest-readonly',
  );

  if (scoringPreview.signalSource === 'synthetic-demo' && hasPlaytestIncidents) {
    // After playtest reset, Redis can still hold stale scored incidents from the
    // prior playtest recompute. A synthetic preview means there are no active
    // playtest signals, so the synthetic preview is the honest current source.
    return scoringPreview.incidents;
  }

  return incidents.some((incident) => incident.priorityScore)
    ? incidents
    : scoringPreview.incidents;
};

const replaceIncident = (
  incidents: readonly QueueIncident[],
  updatedIncident: QueueIncident,
) => {
  return incidents.map((incident) =>
    incident.id === updatedIncident.id ? updatedIncident : incident,
  );
};

export const useIncidentWorkbench = () => {
  const [incidents, setIncidents] = useState<QueueIncident[]>(fallbackIncidents);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    getInitialSelectedIncidentId,
  );
  const [dataStatus, setDataStatus] =
    useState<WorkbenchDataStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scoringPreview, setScoringPreview] =
    useState<ScoringPreviewResponse>(fallbackScoringPreview);
  const [ingestionStatus, setIngestionStatus] =
    useState<IngestionStatusResponse>(fallbackIngestionStatus);
  const [diagnostics, setDiagnostics] =
    useState<DiagnosticsResponse>(fallbackDiagnostics);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const selectedIncident = useMemo(() => {
    return (
      incidents.find((incident) => incident.id === selectedIncidentId) ??
      getTopPriorityIncident(incidents) ??
      incidents[0]
    );
  }, [incidents, selectedIncidentId]);

  const preserveSelection = useCallback((nextIncidents: QueueIncident[]) => {
    setIncidents(nextIncidents);
    setSelectedIncidentId((currentIncidentId) => {
      if (nextIncidents.length === 0) {
        return '';
      }

      const hasSelectedIncident = nextIncidents.some(
        (incident) => incident.id === currentIncidentId,
      );

      return hasSelectedIncident
        ? currentIncidentId
        : getTopPriorityIncident(nextIncidents)?.id ?? nextIncidents[0]?.id ?? '';
    });
  }, []);

  const refreshDiagnosticsData = useCallback(async () => {
    try {
      const [diagnosticsPayload, auditPayload] = await Promise.all([
        getDiagnostics(),
        getRecentAuditEntries(),
      ]);
      setDiagnostics(diagnosticsPayload);
      setAuditEntries(auditPayload.entries);
    } catch (error) {
      console.info('Using local Sprint 7.2 diagnostics fallback.', error);
      setDiagnostics(fallbackDiagnostics());
      setAuditEntries([]);
    }
  }, []);

  const refreshIncidents = useCallback(async () => {
    setIsLoading(true);

    try {
      const [payload, previewPayload, ingestionPayload] = await Promise.all([
        listIncidents(),
        previewScoring(),
        getIngestionStatus(),
      ]);
      preserveSelection(preferScoredIncidents(payload.incidents, previewPayload));
      setScoringPreview(previewPayload);
      setIngestionStatus(ingestionPayload);
      setDataStatus(payload.source);
      setErrorMessage(null);
      await refreshDiagnosticsData();
    } catch (error) {
      console.info('Using local Sprint 7.2 fallback incidents.', error);
      const fallbackPreview = fallbackScoringPreview();
      preserveSelection(fallbackPreview.incidents);
      setScoringPreview(fallbackPreview);
      setIngestionStatus(fallbackIngestionStatus());
      setDiagnostics(fallbackDiagnostics());
      setAuditEntries([]);
      setDataStatus('fallback');
      setErrorMessage(
        'API unavailable. Browser fallback mode is showing synthetic demo data only; playtest mutations, authorization, and audit writes are disabled.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [preserveSelection, refreshDiagnosticsData]);

  useEffect(() => {
    void refreshIncidents();
  }, [refreshIncidents]);

  const seedDemoQueue = useCallback(async () => {
    setIsMutating(true);

    try {
      const payload = await seedDemoIncidents();
      preserveSelection(payload.incidents);
      setScoringPreview({
        status: 'ok',
        source: payload.result.source,
        ...buildDemoScoringPreview(payload.incidents),
      });
      setIngestionStatus(await getIngestionStatus());
      await refreshDiagnosticsData();
      setDataStatus(payload.result.source);
      setErrorMessage(null);
    } catch (error) {
      console.info('Using local Sprint 7.2 seed fallback.', error);

      if (isAuthorizationError(error)) {
        await refreshDiagnosticsData();
        setErrorMessage(`${error.message} No Queue Sentinel data changed.`);
        return;
      }

      const fallbackPreview = fallbackScoringPreview();
      preserveSelection(fallbackPreview.incidents);
      setScoringPreview(fallbackPreview);
      setIngestionStatus(fallbackIngestionStatus());
      setDiagnostics(fallbackDiagnostics());
      setAuditEntries([]);
      setDataStatus('fallback');
      setErrorMessage(
        'Demo seed could not reach the API, so browser fallback data remains synthetic and local.',
      );
    } finally {
      setIsMutating(false);
    }
  }, [preserveSelection, refreshDiagnosticsData]);

  const resetDemoQueue = useCallback(async () => {
    setIsMutating(true);

    try {
      const payload = await resetDemoIncidents();
      preserveSelection(payload.incidents);
      setScoringPreview({
        status: 'ok',
        source: payload.result.source,
        ...buildDemoScoringPreview(payload.incidents),
      });
      setIngestionStatus(await getIngestionStatus());
      await refreshDiagnosticsData();
      setDataStatus(payload.result.source);
      setErrorMessage(null);
    } catch (error) {
      console.info('Using local Sprint 7.2 reset fallback.', error);

      if (isAuthorizationError(error)) {
        await refreshDiagnosticsData();
        setErrorMessage(`${error.message} No Queue Sentinel data changed.`);
        return;
      }

      const fallbackPreview = fallbackScoringPreview();
      preserveSelection(fallbackPreview.incidents);
      setScoringPreview(fallbackPreview);
      setIngestionStatus(fallbackIngestionStatus());
      setDiagnostics(fallbackDiagnostics());
      setAuditEntries([]);
      setDataStatus('fallback');
      setErrorMessage(
        'Demo reset could not reach the API, so browser fallback data remains synthetic and local.',
      );
    } finally {
      setIsMutating(false);
    }
  }, [preserveSelection, refreshDiagnosticsData]);

  const updateStatus = useCallback(
    async (id: string, status: IncidentStatus) => {
      setIsMutating(true);

      try {
        const payload = await updateIncidentStatus(id, status);
        preserveSelection(replaceIncident(incidents, payload.incident));
        await refreshDiagnosticsData();
        setDataStatus(payload.source);
        setErrorMessage(null);
      } catch (error) {
        console.info('Using local Sprint 7.2 status fallback.', error);

        if (isAuthorizationError(error)) {
          await refreshDiagnosticsData();
          setErrorMessage(`${error.message} Internal status was not changed.`);
          return;
        }

        const updatedIncident = incidents.find((incident) => incident.id === id);

        if (updatedIncident) {
          preserveSelection(
            replaceIncident(incidents, {
              ...updatedIncident,
              status,
              updatedAt: new Date().toISOString(),
            }),
          );
        }

        setDiagnostics(fallbackDiagnostics());
        setAuditEntries([]);
        setDataStatus('fallback');
        setErrorMessage(
          'Status update could not reach the API. Browser fallback changed local preview state only, not Reddit moderation state.',
        );
      } finally {
        setIsMutating(false);
      }
    },
    [incidents, preserveSelection, refreshDiagnosticsData],
  );

  const recomputeScoring = useCallback(async () => {
    setIsMutating(true);

    try {
      const payload = await recomputeDemoScoring();
      preserveSelection(payload.incidents);
      setScoringPreview(payload);
      setIngestionStatus(await getIngestionStatus());
      await refreshDiagnosticsData();
      setDataStatus(payload.source);
      setErrorMessage(null);
    } catch (error) {
      console.info('Using local Sprint 7.2 recompute fallback.', error);

      if (isAuthorizationError(error)) {
        await refreshDiagnosticsData();
        setErrorMessage(`${error.message} Scored incidents were not changed.`);
        return;
      }

      const fallbackPreview = fallbackScoringPreview();
      preserveSelection(fallbackPreview.incidents);
      setScoringPreview(fallbackPreview);
      setIngestionStatus(fallbackIngestionStatus());
      setDiagnostics(fallbackDiagnostics());
      setAuditEntries([]);
      setDataStatus('fallback');
      setErrorMessage(
        'Scoring recompute could not reach the API. Browser fallback is showing deterministic synthetic demo scoring only.',
      );
    } finally {
      setIsMutating(false);
    }
  }, [preserveSelection, refreshDiagnosticsData]);

  const refreshIngestionStatus = useCallback(async () => {
    try {
      setIngestionStatus(await getIngestionStatus());
      await refreshDiagnosticsData();
      setErrorMessage(null);
    } catch (error) {
      console.info('Using local Sprint 7.2 ingestion status fallback.', error);
      setIngestionStatus(fallbackIngestionStatus());
      setDiagnostics(fallbackDiagnostics());
      setAuditEntries([]);
      setErrorMessage(
        'Ingestion status could not reach the API. Read-only playtest controls stay disabled in browser fallback mode.',
      );
    }
  }, [refreshDiagnosticsData]);

  const previewIngestion = useCallback(async (fixturePackId?: string) => {
    setIsMutating(true);

    try {
      await previewReadonlyIngestion(fixturePackId);
      setIngestionStatus(await getIngestionStatus());
      await refreshDiagnosticsData();
      setErrorMessage(null);
    } catch (error) {
      console.info('Read-only ingestion preview unavailable.', error);
      await refreshDiagnosticsData();
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Read-only ingestion preview failed.',
      );
    } finally {
      setIsMutating(false);
    }
  }, [refreshDiagnosticsData]);

  const seedPlaytestQueue = useCallback(async (fixturePackId?: string) => {
    setIsMutating(true);

    try {
      await seedPlaytestSignals(fixturePackId);
      const [previewPayload, ingestionPayload] = await Promise.all([
        recomputeDemoScoring(),
        getIngestionStatus(),
      ]);
      preserveSelection(previewPayload.incidents);
      setScoringPreview(previewPayload);
      setIngestionStatus(ingestionPayload);
      await refreshDiagnosticsData();
      setDataStatus(previewPayload.source);
      setErrorMessage(null);
    } catch (error) {
      console.info('Read-only playtest seed unavailable.', error);
      await refreshDiagnosticsData();
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Read-only playtest seed failed.',
      );
    } finally {
      setIsMutating(false);
    }
  }, [preserveSelection, refreshDiagnosticsData]);

  const resetPlaytestQueue = useCallback(async () => {
    setIsMutating(true);

    try {
      await resetPlaytestSignals();
      const [previewPayload, ingestionPayload] = await Promise.all([
        recomputeDemoScoring(),
        getIngestionStatus(),
      ]);
      preserveSelection(previewPayload.incidents);
      setScoringPreview(previewPayload);
      setIngestionStatus(ingestionPayload);
      await refreshDiagnosticsData();
      setDataStatus(previewPayload.source);
      setErrorMessage(null);
    } catch (error) {
      console.info('Read-only playtest reset unavailable.', error);
      await refreshDiagnosticsData();
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Read-only playtest reset failed.',
      );
    } finally {
      setIsMutating(false);
    }
  }, [preserveSelection, refreshDiagnosticsData]);

  return {
    auditEntries,
    dataStatus,
    diagnostics,
    errorMessage,
    ingestionStatus,
    incidents,
    isLoading,
    isMutating,
    previewIngestion,
    refreshDiagnostics: refreshDiagnosticsData,
    refreshIncidents,
    refreshIngestionStatus,
    recomputeScoring,
    resetDemoQueue,
    resetPlaytestQueue,
    scoringPreview,
    seedPlaytestQueue,
    seedDemoQueue,
    selectedIncident,
    selectedIncidentId: selectedIncident?.id ?? selectedIncidentId,
    selectIncident: setSelectedIncidentId,
    updateStatus,
  } as const;
};
