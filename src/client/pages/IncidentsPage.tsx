import { useMemo, useState } from 'react';

import { EmptyState } from '../components/EmptyState';
import { IncidentCard } from '../components/IncidentCard';
import { IncidentFilters } from '../components/IncidentFilters';
import { IncidentPreview } from '../components/IncidentPreview';
import { StatusBadge } from '../components/StatusBadge';
import type { ApiSource } from '../../shared/apiTypes';
import type {
  IncidentFilters as IncidentFiltersState,
  IncidentStatus,
  IncidentSortKey,
  QueueIncident,
} from '../../shared/types';
import {
  DEFAULT_FILTERS,
  filterIncidents,
  getRuleAreas,
  sortIncidents,
} from '../../shared/workbench';

interface IncidentsPageProps {
  dataStatus: 'loading' | ApiSource;
  errorMessage: string | null;
  incidents: QueueIncident[];
  isLoading: boolean;
  isMutating: boolean;
  onOpenCaseCard: (incidentId: string) => void;
  onRefresh: () => void;
  onSelectIncident: (incidentId: string) => void;
  onUpdateStatus: (incidentId: string, status: IncidentStatus) => void;
  selectedIncidentId: string;
}

export const IncidentsPage = ({
  dataStatus,
  errorMessage,
  incidents,
  isLoading,
  isMutating,
  onOpenCaseCard,
  onRefresh,
  onSelectIncident,
  onUpdateStatus,
  selectedIncidentId,
}: IncidentsPageProps) => {
  const [filters, setFilters] =
    useState<IncidentFiltersState>(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState<IncidentSortKey>('priority');

  const ruleAreas = useMemo(() => getRuleAreas(incidents), [incidents]);
  const filteredIncidents = useMemo(() => {
    return sortIncidents(filterIncidents(incidents, filters), sortKey);
  }, [filters, incidents, sortKey]);
  const selectedIncident =
    filteredIncidents.find((incident) => incident.id === selectedIncidentId) ??
    incidents.find((incident) => incident.id === selectedIncidentId) ??
    filteredIncidents[0] ??
    incidents[0];

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSortKey('priority');
  };

  return (
    <section className="page-stack" aria-labelledby="incidents-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Scored incident workbench</p>
          <h2 id="incidents-title">Search, filter, sort, inspect scores</h2>
        </div>
        <div className="page-actions">
          <StatusBadge tone={dataStatus === 'fallback' ? 'open' : 'build'}>
            {dataStatus === 'redis'
              ? 'Redis store'
              : dataStatus === 'memory'
                ? 'Memory store'
                : dataStatus === 'fallback'
                  ? 'Fallback data'
                  : 'Loading'}
          </StatusBadge>
          <button
            className="secondary-action"
            disabled={isLoading}
            onClick={onRefresh}
            type="button"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {errorMessage ? <div className="notice-panel">{errorMessage}</div> : null}

      <IncidentFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
        onSortChange={setSortKey}
        resultCount={filteredIncidents.length}
        ruleAreas={ruleAreas}
        sortKey={sortKey}
        totalCount={incidents.length}
      />

      <div className="workbench-layout">
        <div className="incident-list" aria-live="polite">
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => (
              <IncidentCard
                incident={incident}
                isSelected={incident.id === selectedIncident?.id}
                key={incident.id}
                onOpenCaseCard={onOpenCaseCard}
                onSelect={onSelectIncident}
              />
            ))
          ) : (
            <EmptyState
              actionLabel="Reset filters"
              message={
                incidents.length === 0
                  ? 'No incidents are loaded yet. Refresh data, seed demo incidents when authorized, or recompute scoring from the Dashboard or Settings.'
                  : 'No scored incidents match the current filter set. Clear filters to return to the full Sprint 7.1 queue.'
              }
              onAction={resetFilters}
              title="No incidents found"
            />
          )}
        </div>

        {selectedIncident ? (
          <IncidentPreview
            incident={selectedIncident}
            isMutating={isMutating}
            onOpenCaseCard={onOpenCaseCard}
            onUpdateStatus={onUpdateStatus}
          />
        ) : null}
      </div>
    </section>
  );
};
