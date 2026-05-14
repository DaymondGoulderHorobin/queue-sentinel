import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  listIncidents,
  resetDemoIncidents,
  seedDemoIncidents,
  updateIncidentStatus,
} from '../api/incidents';
import { DEMO_INCIDENTS } from '../../shared/demoData';
import type { ApiSource } from '../../shared/apiTypes';
import type { IncidentStatus, QueueIncident } from '../../shared/types';
import { getTopPriorityIncident } from '../../shared/workbench';

type WorkbenchDataStatus = 'loading' | ApiSource;

const fallbackIncidents = () => DEMO_INCIDENTS.map((incident) => ({ ...incident }));

const getInitialSelectedIncidentId = () =>
  getTopPriorityIncident(DEMO_INCIDENTS)?.id ?? DEMO_INCIDENTS[0]?.id ?? '';

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
      const payload = await listIncidents();
      preserveSelection(payload.incidents);
      setDataStatus(payload.source);
      setErrorMessage(null);
    } catch (error) {
      console.info('Using local Sprint 2 fallback incidents.', error);
      preserveSelection(fallbackIncidents());
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
      setDataStatus(payload.result.source);
      setErrorMessage(null);
    } catch (error) {
      console.info('Using local Sprint 2 seed fallback.', error);
      preserveSelection(fallbackIncidents());
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
      setDataStatus(payload.result.source);
      setErrorMessage(null);
    } catch (error) {
      console.info('Using local Sprint 2 reset fallback.', error);
      preserveSelection(fallbackIncidents());
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
        console.info('Using local Sprint 2 status fallback.', error);
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

  return {
    dataStatus,
    errorMessage,
    incidents,
    isLoading,
    isMutating,
    refreshIncidents,
    resetDemoQueue,
    seedDemoQueue,
    selectedIncident,
    selectedIncidentId: selectedIncident?.id ?? selectedIncidentId,
    selectIncident: setSelectedIncidentId,
    updateStatus,
  } as const;
};
