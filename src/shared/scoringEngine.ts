import { DEMO_INCIDENTS } from './demoData';
import { DEMO_QUEUE_SIGNALS } from './demoSignals';
import type {
  ClusterSummary,
  ConfidenceLabel,
  IngestionProvenance,
  IncidentPriority,
  PriorityScore,
  QueueIncident,
  QueueSignal,
  ScoreFactor,
  ScoringModelVersion,
  SignalSource,
} from './types';

export const SCORING_MODEL_VERSION: ScoringModelVersion =
  'sprint-3-deterministic-v1';

export interface IncidentClusterDraft {
  clusterId: string;
  signals: QueueSignal[];
  suspectedRuleArea: string;
  groupingKeys: string[];
  representativeSignalIds: string[];
  timeWindowMinutes: number;
  uniqueItemCount: number;
}

export interface DemoScoringPreview {
  modelVersion: ScoringModelVersion;
  signalSource: SignalSource;
  runId?: string;
  signalsProcessed: number;
  clustersFormed: number;
  duplicateSignalsCollapsed: number;
  averageScore: number;
  incidents: QueueIncident[];
}

export interface MaterializeClusterOptions {
  signalSource?: SignalSource;
  runId?: string;
  subredditName?: string;
  acceptedAt?: string;
}

interface ClusteringOptions {
  authorMinSignals: number;
  authorMinUniqueItems: number;
  domainWindowMinutes: number;
  ruleAreaMinSignals: number;
  ruleAreaMinUniqueItems: number;
  ruleAreaWindowMinutes: number;
}

const DEFAULT_CLUSTERING_OPTIONS: ClusteringOptions = {
  authorMinSignals: 3,
  authorMinUniqueItems: 2,
  domainWindowMinutes: 120,
  ruleAreaMinSignals: 3,
  ruleAreaMinUniqueItems: 3,
  ruleAreaWindowMinutes: 45,
};

const priorityThresholds: Array<{ priority: IncidentPriority; score: number }> = [
  { priority: 'critical', score: 85 },
  { priority: 'high', score: 65 },
  { priority: 'medium', score: 40 },
  { priority: 'low', score: 0 },
];

const severityWeights: Record<string, number> = {
  'Civility and personal attacks': 18,
  'Community interference': 18,
  'Flair and formatting': 6,
  'Link quality review': 9,
  'Off-topic discussion': 8,
  'Pattern review': 10,
  'Privacy and safety': 22,
  'Solicitation and self-promotion': 14,
  'Spam and repost policy': 18,
  'Title formatting': 5,
};

const safetyAdjacentRules = new Set(['Privacy and safety']);

const toTime = (value: string) => new Date(value).getTime();

const unique = <T>(items: readonly T[]) => [...new Set(items)];

const slug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

const sortSignals = (signals: readonly QueueSignal[]) =>
  [...signals].sort(
    (a, b) =>
      toTime(a.receivedAt) - toTime(b.receivedAt) || a.id.localeCompare(b.id),
  );

const isValidSignal = (signal: QueueSignal) => {
  return (
    signal.id.length > 0 &&
    signal.itemId.length > 0 &&
    signal.subjectKey.length > 0 &&
    signal.suspectedRuleArea.length > 0 &&
    Number.isFinite(toTime(signal.receivedAt))
  );
};

const groupBy = <T>(
  items: readonly T[],
  getKey: (item: T) => string | undefined,
) => {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = getKey(item);

    if (!key) {
      continue;
    }

    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return groups;
};

class SignalUnion {
  private readonly parent = new Map<string, string>();

  constructor(signals: readonly QueueSignal[]) {
    for (const signal of signals) {
      this.parent.set(signal.id, signal.id);
    }
  }

  find(id: string): string {
    const parent = this.parent.get(id) ?? id;

    if (parent === id) {
      return id;
    }

    const root = this.find(parent);
    this.parent.set(id, root);
    return root;
  }

  union(ids: readonly string[]) {
    const [firstId] = ids;

    if (!firstId) {
      return;
    }

    const root = this.find(firstId);

    for (const id of ids.slice(1)) {
      this.parent.set(this.find(id), root);
    }
  }
}

const unionGroups = (
  union: SignalUnion,
  groups: Iterable<QueueSignal[]>,
  isEligible: (group: QueueSignal[]) => boolean,
) => {
  for (const group of groups) {
    if (isEligible(group)) {
      union.union(group.map((signal) => signal.id));
    }
  }
};

const timeWindowMinutes = (signals: readonly QueueSignal[]) => {
  const times = signals.map((signal) => toTime(signal.receivedAt));
  return Math.max(0, Math.round((Math.max(...times) - Math.min(...times)) / 60000));
};

const subjectKey = (signals: readonly QueueSignal[]) => {
  const counts = new Map<string, number>();

  for (const signal of signals) {
    counts.set(signal.subjectKey, (counts.get(signal.subjectKey) ?? 0) + 1);
  }

  return [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )[0]?.[0];
};

const clusterGroupingKeys = (signals: readonly QueueSignal[]) => {
  const keys: string[] = [];
  const addRepeated = (prefix: string, values: Array<string | undefined>) => {
    const counts = new Map<string, number>();

    for (const value of values) {
      if (value) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
    }

    for (const [value, count] of counts) {
      if (count > 1) {
        keys.push(`${prefix}:${value}`);
      }
    }
  };

  addRepeated('item', signals.map((signal) => signal.itemId));
  addRepeated('thread', signals.map((signal) => signal.threadKey));
  addRepeated('domain', signals.map((signal) => signal.domainKey));
  addRepeated('author', signals.map((signal) => signal.authorKey));

  const rule = signals[0]?.suspectedRuleArea;

  if (rule) {
    keys.push(`rule:${rule}`);
  }

  return unique(keys).sort((a, b) => a.localeCompare(b));
};

export const clusterQueueSignals = (
  rawSignals: readonly QueueSignal[],
  options: Partial<ClusteringOptions> = {},
): IncidentClusterDraft[] => {
  const settings = { ...DEFAULT_CLUSTERING_OPTIONS, ...options };
  const signals = sortSignals(rawSignals.filter(isValidSignal));
  const union = new SignalUnion(signals);

  unionGroups(
    union,
    groupBy(signals, (signal) => signal.itemId).values(),
    (group) => group.length > 1,
  );

  unionGroups(
    union,
    groupBy(signals, (signal) =>
      signal.itemType === 'comment' && signal.threadKey
        ? `${signal.threadKey}|${signal.suspectedRuleArea}`
        : undefined,
    ).values(),
    (group) => group.length > 1,
  );

  unionGroups(
    union,
    groupBy(signals, (signal) =>
      signal.domainKey
        ? `${signal.domainKey}|${signal.suspectedRuleArea}`
        : undefined,
    ).values(),
    (group) =>
      unique(group.map((signal) => signal.itemId)).length > 1 &&
      timeWindowMinutes(group) <= settings.domainWindowMinutes,
  );

  unionGroups(
    union,
    groupBy(signals, (signal) =>
      signal.authorKey
        ? `${signal.authorKey}|${signal.suspectedRuleArea}`
        : undefined,
    ).values(),
    (group) =>
      !safetyAdjacentRules.has(group[0]?.suspectedRuleArea ?? '') &&
      group.length >= settings.authorMinSignals &&
      unique(group.map((signal) => signal.itemId)).length >=
        settings.authorMinUniqueItems,
  );

  unionGroups(
    union,
    groupBy(signals, (signal) => signal.suspectedRuleArea).values(),
    (group) =>
      !safetyAdjacentRules.has(group[0]?.suspectedRuleArea ?? '') &&
      group.length >= settings.ruleAreaMinSignals &&
      unique(group.map((signal) => signal.itemId)).length >=
        settings.ruleAreaMinUniqueItems &&
      timeWindowMinutes(group) <= settings.ruleAreaWindowMinutes,
  );

  const components = new Map<string, QueueSignal[]>();

  for (const signal of signals) {
    const root = union.find(signal.id);
    components.set(root, [...(components.get(root) ?? []), signal]);
  }

  const usedIds = new Set<string>();

  return [...components.values()]
    .map(sortSignals)
    .map((clusterSignals) => {
      const firstClusterSignal = clusterSignals[0];

      if (!firstClusterSignal) {
        throw new Error('Cannot build an empty incident cluster.');
      }

      const primarySubject = subjectKey(clusterSignals) ?? firstClusterSignal.subjectKey;
      const suspectedRuleArea = firstClusterSignal.suspectedRuleArea;
      const groupingKeys = clusterGroupingKeys(clusterSignals);
      const uniqueItemCount = unique(clusterSignals.map((signal) => signal.itemId)).length;
      const baseId = `cluster-${slug(primarySubject)}-${slug(suspectedRuleArea)}`;
      let clusterId = baseId;
      let suffix = 2;

      while (usedIds.has(clusterId)) {
        clusterId = `${baseId}-${suffix}`;
        suffix += 1;
      }

      usedIds.add(clusterId);

      return {
        clusterId,
        signals: clusterSignals,
        suspectedRuleArea,
        groupingKeys,
        representativeSignalIds: clusterSignals
          .slice(0, 4)
          .map((signal) => signal.id),
        timeWindowMinutes: timeWindowMinutes(clusterSignals),
        uniqueItemCount,
      } satisfies IncidentClusterDraft;
    })
    .sort(
      (a, b) =>
        subjectKey(a.signals)?.localeCompare(subjectKey(b.signals) ?? '') ??
        a.clusterId.localeCompare(b.clusterId),
    );
};

const factor = (
  key: string,
  label: string,
  value: number,
  weight: number,
  contribution: number,
  explanation: string,
): ScoreFactor => ({
  key,
  label,
  value,
  weight,
  contribution: Math.round(contribution),
  explanation,
});

const priorityFromScore = (score: number): IncidentPriority => {
  return priorityThresholds.find((threshold) => score >= threshold.score)?.priority ?? 'low';
};

const confidenceFromCluster = (
  cluster: IncidentClusterDraft,
  score: number,
): ConfidenceLabel => {
  if (cluster.signals.length >= 5 && cluster.groupingKeys.length >= 3 && score >= 65) {
    return 'high';
  }

  if (cluster.signals.length >= 3 && score >= 40) {
    return 'medium';
  }

  return 'low';
};

export const scoreIncidentCluster = (
  cluster: IncidentClusterDraft,
  status: QueueIncident['status'] = 'open',
): PriorityScore => {
  const reportVolume = Math.min(cluster.signals.length * 4.5, 26);
  const queueAge = Math.min(cluster.timeWindowMinutes / 3, 20);
  const relatedItems = Math.min(Math.max(cluster.uniqueItemCount - 1, 0) * 5, 20);
  const density =
    cluster.timeWindowMinutes <= 30
      ? Math.min(cluster.signals.length * 3, 18)
      : Math.min(cluster.signals.length * 2, 14);
  const severity = severityWeights[cluster.suspectedRuleArea] ?? 8;
  const statusContribution =
    status === 'resolved'
      ? -24
      : status === 'escalated'
        ? 2
        : status === 'reviewing'
          ? 4
          : 6;

  const preliminaryScore =
    reportVolume + queueAge + relatedItems + density + severity + statusContribution;
  const score = clampScore(preliminaryScore);
  const confidenceLabel = confidenceFromCluster(cluster, score);
  const confidenceContribution =
    confidenceLabel === 'high' ? 8 : confidenceLabel === 'medium' ? 5 : 2;
  const finalScore = clampScore(score + confidenceContribution);
  const hasPlaytestSignal = cluster.signals.some(
    (signal) => signal.source === 'playtest-readonly',
  );
  const signalLabel = hasPlaytestSignal
    ? 'read-only playtest signals'
    : 'safe demo signals';

  const factors = [
    factor(
      'report-volume',
      'Report volume',
      cluster.signals.length,
      4.5,
      reportVolume,
      `${cluster.signals.length} ${signalLabel} landed in this cluster.`,
    ),
    factor(
      'queue-age',
      'Queue age',
      cluster.timeWindowMinutes,
      0.33,
      queueAge,
      `The cluster spans ${cluster.timeWindowMinutes} minutes of queue activity.`,
    ),
    factor(
      'related-items',
      'Related items',
      cluster.uniqueItemCount,
      5,
      relatedItems,
      `${cluster.uniqueItemCount} unique queue items can be reviewed together.`,
    ),
    factor(
      'cluster-density',
      'Cluster density',
      cluster.signals.length,
      cluster.timeWindowMinutes <= 30 ? 3 : 2,
      density,
      'Signals arrived close enough together to suggest a reviewable pattern.',
    ),
    factor(
      'rule-area-severity',
      'Rule-area severity',
      severity,
      1,
      severity,
      `${cluster.suspectedRuleArea} receives a deterministic triage weight.`,
    ),
    factor(
      'status-modifier',
      'Status modifier',
      statusContribution,
      1,
      statusContribution,
      status === 'resolved'
        ? 'Resolved Queue Sentinel incidents are intentionally scored lower.'
        : 'Open or reviewing incidents remain visible for moderator triage.',
    ),
    factor(
      'confidence-modifier',
      'Confidence modifier',
      confidenceContribution,
      1,
      confidenceContribution,
      `Confidence is ${confidenceLabel} based on deterministic signal strength, not certainty of wrongdoing.`,
    ),
  ];

  const sortedFactors = [...factors].sort(
    (a, b) => b.contribution - a.contribution || a.key.localeCompare(b.key),
  );
  const reasons = sortedFactors.slice(0, 3).map((scoreFactor) => scoreFactor.explanation);

  return {
    score: finalScore,
    priority: priorityFromScore(finalScore),
    confidenceLabel,
    factors,
    reasons,
    modelVersion: SCORING_MODEL_VERSION,
  };
};

const clusterSummary = (cluster: IncidentClusterDraft): ClusterSummary => ({
  clusterId: cluster.clusterId,
  signalCount: cluster.signals.length,
  uniqueItemCount: cluster.uniqueItemCount,
  timeWindowMinutes: cluster.timeWindowMinutes,
  groupingKeys: cluster.groupingKeys,
  representativeSignalIds: cluster.representativeSignalIds,
});

const baseIncidentForCluster = (
  cluster: IncidentClusterDraft,
  baseIncidents: readonly QueueIncident[],
): QueueIncident | undefined => {
  const primarySubject = subjectKey(cluster.signals);

  return (
    baseIncidents.find((incident) => incident.id === primarySubject) ??
    DEMO_INCIDENTS.find((incident) => incident.id === primarySubject)
  );
};

const signalSourceForCluster = (
  cluster: IncidentClusterDraft,
  options: MaterializeClusterOptions,
): SignalSource => {
  return (
    options.signalSource ??
    cluster.signals.find((signal) => signal.source)?.source ??
    'synthetic-demo'
  );
};

const sourceLabel = (signalSource: SignalSource) => {
  if (signalSource === 'playtest-readonly') {
    return 'read-only playtest signals';
  }

  if (signalSource === 'fallback') {
    return 'fallback signals';
  }

  return 'safe demo signals';
};

const provenanceForCluster = (
  cluster: IncidentClusterDraft,
  options: MaterializeClusterOptions,
): IngestionProvenance => {
  const firstSubreddit = cluster.signals.find((signal) => signal.subredditName)
    ?.subredditName;
  const provenance: IngestionProvenance = {
    source: signalSourceForCluster(cluster, options),
    signalIds: cluster.signals.map((signal) => signal.id),
  };

  if (options.runId) {
    provenance.runId = options.runId;
  }

  const subredditName = options.subredditName ?? firstSubreddit;

  if (subredditName) {
    provenance.subredditName = subredditName;
  }

  if (options.acceptedAt) {
    provenance.acceptedAt = options.acceptedAt;
  }

  return provenance;
};

const generatedIncidentForCluster = (
  cluster: IncidentClusterDraft,
  firstSignal: QueueSignal,
  lastSignal: QueueSignal,
  options: MaterializeClusterOptions,
): QueueIncident => {
  const provenance = provenanceForCluster(cluster, options);
  const subredditLabel = provenance.subredditName
    ? `r/${provenance.subredditName}`
    : 'the configured playtest subreddit';
  const userContextSummary =
    firstSignal.safeExcerpt ??
    `Read-only metadata from ${subredditLabel} was normalized without storing post or comment body text.`;

  return {
    id: `inc-${cluster.clusterId}`,
    priority: 'low',
    status: 'open',
    title: `${cluster.suspectedRuleArea} pattern from read-only signals`,
    itemType: firstSignal.itemType,
    reportCount: cluster.signals.length,
    queueAgeMinutes: cluster.timeWindowMinutes,
    suspectedRuleArea: cluster.suspectedRuleArea,
    whySurfaced: [],
    userContextSummary,
    relatedItemCount: cluster.uniqueItemCount,
    rationaleDraft:
      'Read-only playtest metadata was grouped for moderator review context only.',
    createdAt: firstSignal.createdAt,
    updatedAt: lastSignal.receivedAt,
    tags: unique([
      'playtest-readonly',
      `signals-${cluster.signals.length}`,
      slug(cluster.suspectedRuleArea),
    ]),
    ingestionProvenance: provenance,
  };
};

export const materializeClusteredIncidents = (
  clusters: readonly IncidentClusterDraft[],
  baseIncidents: readonly QueueIncident[] = DEMO_INCIDENTS,
  options: MaterializeClusterOptions = {},
): QueueIncident[] => {
  return clusters
    .map((cluster) => {
      const firstSignal = cluster.signals[0];
      const lastSignal = cluster.signals[cluster.signals.length - 1];

      if (!firstSignal || !lastSignal) {
        throw new Error('Cannot materialize an empty incident cluster.');
      }

      const baseIncident =
        baseIncidentForCluster(cluster, baseIncidents) ??
        generatedIncidentForCluster(cluster, firstSignal, lastSignal, options);
      const score = scoreIncidentCluster(cluster, baseIncident.status);
      const signalSource = signalSourceForCluster(cluster, options);
      const provenance = provenanceForCluster(cluster, options);
      const signalCountLabel = `${cluster.signals.length} ${sourceLabel(
        signalSource,
      )}`;

      return {
        ...baseIncident,
        priority: score.priority,
        reportCount: Math.max(baseIncident.reportCount, cluster.signals.length),
        queueAgeMinutes: Math.max(baseIncident.queueAgeMinutes, cluster.timeWindowMinutes),
        relatedItemCount: Math.max(baseIncident.relatedItemCount, cluster.uniqueItemCount),
        whySurfaced: score.reasons,
        createdAt: firstSignal?.createdAt ?? baseIncident.createdAt,
        updatedAt: lastSignal?.receivedAt ?? baseIncident.updatedAt,
        signalStrength:
          score.confidenceLabel === 'high'
            ? 'high'
            : score.confidenceLabel === 'medium'
              ? 'medium'
              : 'low',
        recommendedReviewAction: `Review this cluster first if its score of ${score.score} is the highest active triage signal.`,
        confidenceLabel: score.confidenceLabel,
        rationaleDraft:
          `Deterministic Sprint 6 scoring ranked this as ${score.priority} from ${signalCountLabel}. Use the factors as review context only; Queue Sentinel is not making an enforcement decision.`,
        clusterSummary: clusterSummary(cluster),
        priorityScore: score,
        ingestionProvenance: provenance,
        tags: unique([
          ...(baseIncident.tags ?? []),
          'sprint-6-scored',
          signalSource,
          `signals-${cluster.signals.length}`,
        ]),
      } satisfies QueueIncident;
    })
    .sort(
      (a, b) =>
        (b.priorityScore?.score ?? 0) - (a.priorityScore?.score ?? 0) ||
        a.id.localeCompare(b.id),
    );
};

export const buildDemoScoringPreview = (
  baseIncidents: readonly QueueIncident[] = DEMO_INCIDENTS,
  signals: readonly QueueSignal[] = DEMO_QUEUE_SIGNALS,
  options: MaterializeClusterOptions = {},
): DemoScoringPreview => {
  const clusters = clusterQueueSignals(signals);
  const signalSource = options.signalSource ?? 'synthetic-demo';
  const incidents = materializeClusteredIncidents(clusters, baseIncidents, {
    ...options,
    signalSource,
  });
  const totalScore = incidents.reduce(
    (total, incident) => total + (incident.priorityScore?.score ?? 0),
    0,
  );
  const signalsProcessed = signals.filter(isValidSignal).length;

  const preview: DemoScoringPreview = {
    modelVersion: SCORING_MODEL_VERSION,
    signalSource,
    signalsProcessed,
    clustersFormed: clusters.length,
    duplicateSignalsCollapsed: Math.max(signalsProcessed - clusters.length, 0),
    averageScore:
      incidents.length === 0 ? 0 : Math.round(totalScore / incidents.length),
    incidents,
  };

  if (options.runId) {
    preview.runId = options.runId;
  }

  return preview;
};

export const SCORED_DEMO_INCIDENTS = buildDemoScoringPreview().incidents;
