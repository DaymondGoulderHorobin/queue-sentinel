import { useState } from 'react';

import { AppShell } from './components/AppShell';
import { CaseCardPage } from './pages/CaseCardPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { MetricsPage } from './pages/MetricsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useIncidentWorkbench } from './hooks/useIncidentWorkbench';
import type { AppTabId } from '../shared/types';

export const App = () => {
  const [activeTab, setActiveTab] = useState<AppTabId>('dashboard');
  const workbench = useIncidentWorkbench();

  const openCaseCard = (incidentId: string) => {
    workbench.selectIncident(incidentId);
    setActiveTab('case-card');
  };

  const page = (() => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            dataStatus={workbench.dataStatus}
            errorMessage={workbench.errorMessage}
            incidents={workbench.incidents}
            isLoading={workbench.isLoading}
            isMutating={workbench.isMutating}
            onInspectIncident={openCaseCard}
            onRecomputeScoring={workbench.recomputeScoring}
            onRefresh={workbench.refreshIncidents}
            scoringPreview={workbench.scoringPreview}
          />
        );
      case 'incidents':
        return (
          <IncidentsPage
            dataStatus={workbench.dataStatus}
            errorMessage={workbench.errorMessage}
            incidents={workbench.incidents}
            isLoading={workbench.isLoading}
            isMutating={workbench.isMutating}
            onOpenCaseCard={openCaseCard}
            onRefresh={workbench.refreshIncidents}
            onSelectIncident={workbench.selectIncident}
            onUpdateStatus={workbench.updateStatus}
            selectedIncidentId={workbench.selectedIncidentId}
          />
        );
      case 'case-card':
        return (
          <CaseCardPage
            incident={workbench.selectedIncident}
            isMutating={workbench.isMutating}
            onUpdateStatus={workbench.updateStatus}
          />
        );
      case 'metrics':
        return <MetricsPage incidents={workbench.incidents} />;
      case 'settings':
        return (
          <SettingsPage
            dataStatus={workbench.dataStatus}
            errorMessage={workbench.errorMessage}
            incidentCount={workbench.incidents.length}
            isMutating={workbench.isMutating}
            onRefresh={workbench.refreshIncidents}
            onRecomputeScoring={workbench.recomputeScoring}
            onResetDemo={workbench.resetDemoQueue}
            onSeedDemo={workbench.seedDemoQueue}
            scoringPreview={workbench.scoringPreview}
          />
        );
      default:
        return (
          <DashboardPage
            dataStatus={workbench.dataStatus}
            errorMessage={workbench.errorMessage}
            incidents={workbench.incidents}
            isLoading={workbench.isLoading}
            isMutating={workbench.isMutating}
            onInspectIncident={openCaseCard}
            onRecomputeScoring={workbench.recomputeScoring}
            onRefresh={workbench.refreshIncidents}
            scoringPreview={workbench.scoringPreview}
          />
        );
    }
  })();

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {page}
    </AppShell>
  );
};
