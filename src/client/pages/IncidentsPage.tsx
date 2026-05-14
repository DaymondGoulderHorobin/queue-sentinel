import { useMemo, useState } from 'react';

import { EmptyState } from '../components/EmptyState';
import { IncidentCard } from '../components/IncidentCard';
import { IncidentFilters } from '../components/IncidentFilters';
import { IncidentPreview } from '../components/IncidentPreview';
import type {
  IncidentFilters as IncidentFiltersState,
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
  incidents: QueueIncident[];
  onOpenCaseCard: (incidentId: string) => void;
  onSelectIncident: (incidentId: string) => void;
  selectedIncidentId: string;
}

export const IncidentsPage = ({
  incidents,
  onOpenCaseCard,
  onSelectIncident,
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
          <p className="eyebrow">Incident workbench</p>
          <h2 id="incidents-title">Search, filter, sort, inspect</h2>
        </div>
      </div>

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
              message="No mock incidents match the current filter set. Clear filters to return to the full Sprint 1 demo queue."
              onAction={resetFilters}
              title="No incidents found"
            />
          )}
        </div>

        {selectedIncident ? (
          <IncidentPreview
            incident={selectedIncident}
            onOpenCaseCard={onOpenCaseCard}
          />
        ) : null}
      </div>
    </section>
  );
};
