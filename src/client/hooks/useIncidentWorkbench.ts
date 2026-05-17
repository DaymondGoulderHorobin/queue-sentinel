import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  listIncidents,
  resetDemoIncidents,
  seedDemoIncidents,
  updateIncidentStatus,
} from '../api/incidents';
import {
  getIngestionStatus,
  previewReadonlyIngestion,
  resetPlaytestSignals,
  seedPlaytestSignals,
} from '../api/ingestion';
import { previewScoring, recomputeDemoScoring } from '../api/scoring';
import type {
  ApiSource,
  IngestionStatusResponse,
  ScoringPreviewResponse,
} from '../../shared/apiTypes';
import { buildDemoScoringPreview } from '../../shared/scoringEngine';
import type { IncidentStatus, QueueIncident } from '../../shared/types';
import { getTopPriorityIncident } from '../../shared/workbench';

type WorkbenchDataStatus = 'loading' | ApiSource;

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

const getInitialSelectedIncidentId = () =>
  getTopPriorityIncident(fallbackScoringPreview().incidents)?.id ??
  fallbackScoringPreview().incidents[0]?.id ??
  '';

const fallbackIncidents = () => fallbackScoringPreview().incidents;

const preferScoredIncidents = (
  incidents: QueueIncident[],
  scoringPreview: ScoringPreviewResponse,
) => {
  const hasPlaytestIncidents = incidents.some(
    (incident) => incident.ingestionProvenance?.source === 'playtest-readonly',
  );

  if (scoringPreview.signalSource === 'synthetic-demo' && hasPlaytestIncidents) {
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
    } catch (error) {
      console.info('Using local Sprint 4 fallback incidents.', error);
      const fallbackPreview = fallbackScoringPreview();
      preserveSelection(fallbackPreview.incidents);
      setScoringPreview(fallbackPreview);
      setIngestionStatus(fallbackIngestionStatus());
      setDataStatus('fallback');
      setErrorMessage(
        'API unavailable in this preview. Showing safe local fallback data.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [preserveSelection]);

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
      setDataStatus(payload.result.source);
      setErrorMessage(null);
    } catch (error) {
      console.info('Using local Sprint 4 seed fallback.', error);
      const fallbackPreview = fallbackScoringPreview();
      preserveSelection(fallbackPreview.incidents);
      setScoringPreview(fallbackPreview);
      setIngestionStatus(fallbackIngestionStatus());
      setDataStatus('fallback');
      setErrorMessage('Demo seed used local fallback data in this preview.');
    } finally {
      setIsMutating(false);
    }
  }, [preserveSelection]);

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
      setDataStatus(payload.result.source);
      setErrorMessage(null);
    } catch (error) {
      console.info('Using local Sprint 4 reset fallback.', error);
      const fallbackPreview = fallbackScoringPreview();
      preserveSelection(fallbackPreview.incidents);
      setScoringPreview(fallbackPreview);
      setIngestionStatus(fallbackIngestionStatus());
      setDataStatus('fallback');
      setErrorMessage('Demo reset used local fallback data in this preview.');
    } finally {
      setIsMutating(false);
    }
  }, [preserveSelection]);

  const updateStatus = useCallback(
    async (id: string, status: IncidentStatus) => {
      setIsMutating(true);

      try {
        const payload = await updateIncidentStatus(id, status);
        preserveSelection(replaceIncident(incidents, payload.incident));
        setDataStatus(payload.source);
        setErrorMessage(null);
      } catch (error) {
        console.info('Using local Sprint 4 status fallback.', error);
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

      setDataStatus('fallback');
      setErrorMessage(
          'Internal status update used local fallback state in this preview.',
        );
      } finally {
        setIsMutating(false);
      }
    },
    [incidents, preserveSelection],
  );

  const recomputeScoring = useCallback(async () => {
    setIsMutating(true);

    try {
      const payload = await recomputeDemoScoring();
      preserveSelection(payload.incidents);
      setScoringPreview(payload);
      setIngestionStatus(await getIngestionStatus());
      setDataStatus(payload.source);
      setErrorMessage(null);
    } catch (error) {
      console.info('Using local Sprint 4 recompute fallback.', error);
      const fallbackPreview = fallbackScoringPreview();
      preserveSelection(fallbackPreview.incidents);
      setScoringPreview(fallbackPreview);
      setIngestionStatus(fallbackIngestionStatus());
      setDataStatus('fallback');
      setErrorMessage(
        'Scoring recompute used deterministic local fallback data in this preview.',
      );
    } finally {
      setIsMutating(false);
    }
  }, [preserveSelection]);

  const refreshIngestionStatus = useCallback(async () => {
    try {
      setIngestionStatus(await getIngestionStatus());
      setErrorMessage(null);
    } catch (error) {
      console.info('Using local Sprint 4 ingestion status fallback.', error);
      setIngestionStatus(fallbackIngestionStatus());
      setErrorMessage('Ingestion status used local fallback data in this preview.');
    }
  }, []);

  const previewIngestion = useCallback(async () => {
    setIsMutating(true);

    try {
      await previewReadonlyIngestion();
      setIngestionStatus(await getIngestionStatus());
      setErrorMessage(null);
    } catch (error) {
      console.info('Read-only ingestion preview unavailable.', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Read-only ingestion preview failed.',
      );
    } finally {
      setIsMutating(false);
    }
  }, []);

  const seedPlaytestQueue = useCallback(async () => {
    setIsMutating(true);

    try {
      await seedPlaytestSignals();
      const [previewPayload, ingestionPayload] = await Promise.all([
        recomputeDemoScoring(),
        getIngestionStatus(),
      ]);
      preserveSelection(previewPayload.incidents);
      setScoringPreview(previewPayload);
      setIngestionStatus(ingestionPayload);
      setDataStatus(previewPayload.source);
      setErrorMessage(null);
    } catch (error) {
      console.info('Read-only playtest seed unavailable.', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Read-only playtest seed failed.',
      );
    } finally {
      setIsMutating(false);
    }
  }, [preserveSelection]);

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
      setDataStatus(previewPayload.source);
      setErrorMessage(null);
    } catch (error) {
      console.info('Read-only playtest reset unavailable.', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Read-only playtest reset failed.',
      );
    } finally {
      setIsMutating(false);
    }
  }, [preserveSelection]);

  return {
    dataStatus,
    errorMessage,
    ingestionStatus,
    incidents,
    isLoading,
    isMutating,
    previewIngestion,
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
