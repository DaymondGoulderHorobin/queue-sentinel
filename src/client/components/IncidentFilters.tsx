import type {
  IncidentFilters as IncidentFiltersState,
  IncidentPriority,
  IncidentSortKey,
  IncidentStatus,
  QueueItemType,
} from '../../shared/types';

interface IncidentFiltersProps {
  filters: IncidentFiltersState;
  onFiltersChange: (filters: IncidentFiltersState) => void;
  onReset: () => void;
  onSortChange: (sortKey: IncidentSortKey) => void;
  resultCount: number;
  ruleAreas: string[];
  sortKey: IncidentSortKey;
  totalCount: number;
}

const priorityOptions: Array<IncidentPriority | 'all'> = [
  'all',
  'critical',
  'high',
  'medium',
  'low',
];

const statusOptions: Array<IncidentStatus | 'all'> = [
  'all',
  'open',
  'reviewing',
  'resolved',
  'escalated',
];

const itemTypeOptions: Array<QueueItemType | 'all'> = [
  'all',
  'post',
  'comment',
  'user',
  'domain',
];

const sortOptions: Array<{ label: string; value: IncidentSortKey }> = [
  { label: 'Priority', value: 'priority' },
  { label: 'Queue age', value: 'queueAge' },
  { label: 'Report count', value: 'reportCount' },
  { label: 'Related items', value: 'relatedItems' },
  { label: 'Recently updated', value: 'updatedAt' },
];

const toLabel = (value: string) => {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const IncidentFilters = ({
  filters,
  onFiltersChange,
  onReset,
  onSortChange,
  resultCount,
  ruleAreas,
  sortKey,
  totalCount,
}: IncidentFiltersProps) => {
  return (
    <form className="filters-panel" aria-label="Incident workbench filters">
      <div className="filter-search">
        <label htmlFor="incident-search">Search incidents</label>
        <input
          id="incident-search"
          onChange={(event) =>
            onFiltersChange({ ...filters, search: event.target.value })
          }
          placeholder="Title, rule area, tag, rationale"
          type="search"
          value={filters.search}
        />
      </div>

      <div className="filter-grid">
        <label htmlFor="priority-filter">
          Priority
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                priority: event.target.value as IncidentFiltersState['priority'],
              })
            }
          >
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {toLabel(priority)}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="status-filter">
          Status
          <select
            id="status-filter"
            value={filters.status}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                status: event.target.value as IncidentFiltersState['status'],
              })
            }
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {toLabel(status)}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="item-type-filter">
          Item type
          <select
            id="item-type-filter"
            value={filters.itemType}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                itemType: event.target.value as IncidentFiltersState['itemType'],
              })
            }
          >
            {itemTypeOptions.map((itemType) => (
              <option key={itemType} value={itemType}>
                {toLabel(itemType)}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="rule-area-filter">
          Rule area
          <select
            id="rule-area-filter"
            value={filters.ruleArea}
            onChange={(event) =>
              onFiltersChange({ ...filters, ruleArea: event.target.value })
            }
          >
            <option value="all">All</option>
            {ruleAreas.map((ruleArea) => (
              <option key={ruleArea} value={ruleArea}>
                {ruleArea}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="incident-sort">
          Sort
          <select
            id="incident-sort"
            value={sortKey}
            onChange={(event) =>
              onSortChange(event.target.value as IncidentSortKey)
            }
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-footer">
        <span>
          Showing <strong>{resultCount}</strong> of <strong>{totalCount}</strong>
        </span>
        <button type="button" onClick={onReset}>
          Reset filters
        </button>
      </div>
    </form>
  );
};
