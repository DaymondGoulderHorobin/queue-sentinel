import { useEffect, useMemo, useState } from 'react';

import { AppShell } from './components/AppShell';
import { CaseCardPage } from './pages/CaseCardPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { MetricsPage } from './pages/MetricsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DEMO_INCIDENTS } from '../shared/demoData';
import type {
  AppTabId,
  ErrorResponse,
  MockIncidentsResponse,
  QueueIncident,
} from '../shared/types';
import { getTopPriorityIncident } from '../shared/workbench';

export const App = () => {
  const [activeTab, setActiveTab] = useState<AppTabId>('dashboard');
  const [incidents, setIncidents] = useState<QueueIncident[]>(DEMO_INCIDENTS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    () => getTopPriorityIncident(DEMO_INCIDENTS)?.id ?? DEMO_INCIDENTS[0]?.id ?? '',
  );
  const [dataStatus, setDataStatus] = useState<'loading' | 'demo' | 'api'>(
    'loading',
  );

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const response = await fetch('/api/incidents');

        if (!response.ok) {
          throw new Error(`Mock incidents request failed: ${response.status}`);
        }

        const payload = (await response.json()) as
          | MockIncidentsResponse
          | ErrorResponse;

        if (payload.status === 'ok') {
          setIncidents(payload.incidents);
          setDataStatus('api');
          return;
        }

        throw new Error(payload.message);
      } catch (error) {
        console.info('Using local Sprint 1 demo incidents.', error);
        setIncidents(DEMO_INCIDENTS);
        setDataStatus('demo');
      }
    };

    void loadIncidents();
  }, []);

  useEffect(() => {
    if (incidents.length === 0) {
      return;
    }

    const hasSelectedIncident = incidents.some(
      (incident) => incident.id === selectedIncidentId,
    );

    if (!hasSelectedIncident) {
      setSelectedIncidentId(
        getTopPriorityIncident(incidents)?.id ?? incidents[0]?.id ?? '',
      );
    }
  }, [incidents, selectedIncidentId]);

  const selectedIncident = useMemo(() => {
    return (
      incidents.find((incident) => incident.id === selectedIncidentId) ??
      getTopPriorityIncident(incidents) ??
      incidents[0]
    );
  }, [incidents, selectedIncidentId]);

  const selectIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
  };

  const openCaseCard = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setActiveTab('case-card');
  };

  const page = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            dataStatus={dataStatus}
            incidents={incidents}
            onInspectIncident={openCaseCard}
          />
        );
      case 'incidents':
        return (
          <IncidentsPage
            incidents={incidents}
            onOpenCaseCard={openCaseCard}
            onSelectIncident={selectIncident}
            selectedIncidentId={selectedIncident?.id ?? ''}
          />
        );
      case 'case-card':
        return <CaseCardPage incident={selectedIncident} />;
      case 'metrics':
        return <MetricsPage incidents={incidents} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <DashboardPage
            dataStatus={dataStatus}
            incidents={incidents}
            onInspectIncident={openCaseCard}
          />
        );
    }
  }, [activeTab, dataStatus, incidents, selectedIncident]);

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {page}
    </AppShell>
  );
};
