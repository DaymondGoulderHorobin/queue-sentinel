import type {
  IncidentFilters,
  IncidentPriority,
  IncidentSortKey,
  PriorityDistributionItem,
  QueueIncident,
  WorkbenchMetrics,
} from './types';

export const PRIORITY_ORDER: Record<IncidentPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const PRIORITY_SEQUENCE: IncidentPriority[] = [
  'critical',
  'high',
  'medium',
  'low',
];

export const DEFAULT_FILTERS: IncidentFilters = {
  search: '',
  priority: 'all',
  status: 'all',
  itemType: 'all',
  ruleArea: 'all',
};

const normalise = (value: string) => value.trim().toLowerCase();

export const getIncidentSearchText = (incident: QueueIncident) => {
  return [
    incident.title,
    incident.suspectedRuleArea,
    incident.rationaleDraft,
    incident.userContextSummary,
    ...incident.whySurfaced,
    ...(incident.tags ?? []),
  ]
    .join(' ')
    .toLowerCase();
};

export const filterIncidents = (
  incidents: readonly QueueIncident[],
  filters: IncidentFilters,
) => {
  const query = normalise(filters.search);

  return incidents.filter((incident) => {
    const matchesSearch =
      query.length === 0 || getIncidentSearchText(incident).includes(query);
    const matchesPriority =
      filters.priority === 'all' || incident.priority === filters.priority;
    const matchesStatus =
      filters.status === 'all' || incident.status === filters.status;
    const matchesItemType =
      filters.itemType === 'all' || incident.itemType === filters.itemType;
    const matchesRuleArea =
      filters.ruleArea === 'all' ||
      incident.suspectedRuleArea === filters.ruleArea ||
      (incident.tags ?? []).includes(filters.ruleArea);

    return (
      matchesSearch &&
      matchesPriority &&
      matchesStatus &&
      matchesItemType &&
      matchesRuleArea
    );
  });
};

const updatedTime = (incident: QueueIncident) =>
  new Date(incident.updatedAt).getTime();

export const sortIncidents = (
  incidents: readonly QueueIncident[],
  sortKey: IncidentSortKey,
) => {
  return [...incidents].sort((a, b) => {
    switch (sortKey) {
      case 'priority':
        return (
          PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority] ||
          b.queueAgeMinutes - a.queueAgeMinutes ||
          updatedTime(b) - updatedTime(a)
        );
      case 'queueAge':
        return (
          b.queueAgeMinutes - a.queueAgeMinutes ||
          PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
        );
      case 'reportCount':
        return (
          b.reportCount - a.reportCount ||
          PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
        );
      case 'relatedItems':
        return (
          b.relatedItemCount - a.relatedItemCount ||
          PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
        );
      case 'updatedAt':
        return (
          updatedTime(b) - updatedTime(a) ||
          PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
        );
      default:
        return 0;
    }
  });
};

export const getRuleAreas = (incidents: readonly QueueIncident[]) => {
  return [...new Set(incidents.map((incident) => incident.suspectedRuleArea))]
    .sort((a, b) => a.localeCompare(b));
};

export const getWorkbenchMetrics = (
  incidents: readonly QueueIncident[],
): WorkbenchMetrics => {
  const openIncidents = incidents.filter(
    (incident) =>
      incident.status === 'open' || incident.status === 'reviewing',
  ).length;
  const highPriorityIncidents = incidents.filter(
    (incident) => incident.priority === 'critical' || incident.priority === 'high',
  ).length;
  const duplicateReportsCollapsed = incidents.reduce(
    (total, incident) => total + Math.max(incident.reportCount - 1, 0),
    0,
  );
  const totalRelatedItems = incidents.reduce(
    (total, incident) => total + incident.relatedItemCount,
    0,
  );
  const averageQueueAgeMinutes =
    incidents.length === 0
      ? 0
      : Math.round(
          incidents.reduce(
            (total, incident) => total + incident.queueAgeMinutes,
            0,
          ) / incidents.length,
        );
  const ruleAreasSurfaced = new Set(
    incidents.map((incident) => incident.suspectedRuleArea),
  ).size;
  const resolvedThisSession = incidents.filter(
    (incident) => incident.status === 'resolved',
  ).length;

  return {
    openIncidents,
    highPriorityIncidents,
    duplicateReportsCollapsed,
    totalRelatedItems,
    averageQueueAgeMinutes,
    estimatedClicksSaved: duplicateReportsCollapsed * 2,
    ruleAreasSurfaced,
    resolvedThisSession,
  };
};

export const getPriorityDistribution = (
  incidents: readonly QueueIncident[],
): PriorityDistributionItem[] => {
  return PRIORITY_SEQUENCE.map((priority) => ({
    priority,
    count: incidents.filter((incident) => incident.priority === priority).length,
  }));
};

export const getTopPriorityIncident = (
  incidents: readonly QueueIncident[],
) => {
  return sortIncidents(
    incidents.filter((incident) => incident.status !== 'resolved'),
    'priority',
  )[0];
};

export const getRecommendedReviewFocus = (
  incidents: readonly QueueIncident[],
) => {
  const topIncident = getTopPriorityIncident(incidents);

  if (!topIncident) {
    return 'No open mock incidents are currently waiting for review.';
  }

  if (topIncident.priority === 'critical') {
    return `Start with ${topIncident.title}; it has ${topIncident.reportCount} reports and ${topIncident.relatedItemCount} related queue items.`;
  }

  const staleIncident = sortIncidents(incidents, 'queueAge')[0];

  if (staleIncident && staleIncident.queueAgeMinutes > topIncident.queueAgeMinutes) {
    return `After the top priority case, review ${staleIncident.title} because it is ${staleIncident.queueAgeMinutes} minutes old.`;
  }

  return `Start with ${topIncident.title}; it is the strongest current demo signal.`;
};
