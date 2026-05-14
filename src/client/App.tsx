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

export const App = () => {
  const [activeTab, setActiveTab] = useState<AppTabId>('dashboard');
  const [incidents, setIncidents] = useState<QueueIncident[]>(DEMO_INCIDENTS);
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
        console.info('Using local Sprint 0 demo incidents.', error);
        setIncidents(DEMO_INCIDENTS);
        setDataStatus('demo');
      }
    };

    void loadIncidents();
  }, []);

  const page = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage incidents={incidents} dataStatus={dataStatus} />;
      case 'incidents':
        return <IncidentsPage incidents={incidents} />;
      case 'case-card':
        return <CaseCardPage incidents={incidents} />;
      case 'metrics':
        return <MetricsPage incidents={incidents} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage incidents={incidents} dataStatus={dataStatus} />;
    }
  }, [activeTab, dataStatus, incidents]);

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {page}
    </AppShell>
  );
};
