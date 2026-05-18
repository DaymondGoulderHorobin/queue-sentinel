import {
  isSubredditAllowlisted,
  normalizeSubredditName,
} from './ingestionConfig';
import type {
  IngestionRunSummary,
  QueueItemType,
  QueueSignal,
  ReadonlyIngestionConfig,
  ReadonlyIngestionRejection,
  RedditReadonlyInput,
} from '../../shared/types';

const itemTypes = new Set<QueueItemType>(['post', 'comment', 'user', 'domain']);

const unsafeFieldNames = new Set([
  'approve',
  'ban',
  'flair',
  'lock',
  'mute',
  'remove',
  'redditaction',
  'moderationaction',
  'enforcementaction',
  'escalation',
  'escalate',
  'webhook',
  'aidecision',
  'body',
  'commentbody',
  'content',
  'rawbody',
  'selftext',
  'text',
]);

export interface NormalizedReadonlyIngestion {
  runSummary: IngestionRunSummary;
  signals: QueueSignal[];
  rejected: ReadonlyIngestionRejection[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const findUnsafeField = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.some(findUnsafeField);
  }

  if (!isRecord(value)) {
    return false;
  }

  return Object.entries(value).some(([key, child]) => {
    return unsafeFieldNames.has(key.toLowerCase()) || findUnsafeField(child);
  });
};

const stringValue = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const stringArrayValue = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

const isValidTime = (value: string) => Number.isFinite(new Date(value).getTime());

const slug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const hashKey = (value: string) => {
  let hash = 2166136261;

  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
};

const safeKey = (value: string, prefix: string) => {
  const normalizedValue = value.trim().toLowerCase();

  return `${prefix}-${hashKey(normalizedValue)}`;
};

const safeExcerpt = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  return value.replace(/\s+/g, ' ').trim().slice(0, 140);
};

const suspectedRuleAreaFromReason = (reason: string) => {
  const lowerReason = reason.toLowerCase();

  if (lowerReason.includes('privacy') || lowerReason.includes('dox')) {
    return 'Privacy and safety';
  }

  if (
    lowerReason.includes('spam') ||
    lowerReason.includes('duplicate') ||
    lowerReason.includes('repost')
  ) {
    return 'Spam and repost policy';
  }

  if (
    lowerReason.includes('harass') ||
    lowerReason.includes('attack') ||
    lowerReason.includes('heated')
  ) {
    return 'Civility and personal attacks';
  }

  if (lowerReason.includes('promo') || lowerReason.includes('solicit')) {
    return 'Solicitation and self-promotion';
  }

  if (lowerReason.includes('topic')) {
    return 'Off-topic discussion';
  }

  if (lowerReason.includes('format')) {
    return 'Flair and formatting';
  }

  return 'Pattern review';
};

const toInput = (
  rawInput: unknown,
): { input?: RedditReadonlyInput; rejection?: ReadonlyIngestionRejection } => {
  if (!isRecord(rawInput)) {
    return { rejection: { reason: 'Input must be a metadata object.' } };
  }

  if (findUnsafeField(rawInput)) {
    return {
      rejection: {
        itemId: stringValue(rawInput.itemId) || undefined,
        subredditName: stringValue(rawInput.subredditName) || undefined,
        reason: 'Unsupported moderation-side field was rejected.',
      },
    };
  }

  const itemId = stringValue(rawInput.itemId);
  const itemType = stringValue(rawInput.itemType) as QueueItemType;
  const subredditName = stringValue(rawInput.subredditName);
  const createdAt = stringValue(rawInput.createdAt);
  const receivedAt = stringValue(rawInput.receivedAt);

  if (!itemId || !itemTypes.has(itemType) || !subredditName) {
    return {
      rejection: {
        itemId: itemId || undefined,
        subredditName: subredditName || undefined,
        reason: 'Missing required read-only metadata.',
      },
    };
  }

  if (!isValidTime(createdAt) || !isValidTime(receivedAt)) {
    return {
      rejection: {
        itemId,
        subredditName,
        reason: 'Invalid timestamp metadata.',
      },
    };
  }

  return {
    input: {
      itemId,
      itemType,
      subredditName,
      authorKey: stringValue(rawInput.authorKey) || undefined,
      threadKey: stringValue(rawInput.threadKey) || undefined,
      domainKey: stringValue(rawInput.domainKey) || undefined,
      suspectedRuleArea: stringValue(rawInput.suspectedRuleArea) || undefined,
      reportReason: stringValue(rawInput.reportReason) || undefined,
      createdAt,
      receivedAt,
      safeExcerpt: stringValue(rawInput.safeExcerpt) || undefined,
      tags: stringArrayValue(rawInput.tags),
    },
  };
};

const subjectKeyForInput = (input: RedditReadonlyInput) => {
  if (input.itemType === 'domain') {
    return input.domainKey
      ? `domain:${input.domainKey.toLowerCase()}`
      : `domain:${input.itemId.toLowerCase()}`;
  }

  if (input.itemType === 'user') {
    return input.authorKey
      ? safeKey(input.authorKey, 'author')
      : `user:${input.itemId.toLowerCase()}`;
  }

  if (input.domainKey) {
    return `domain:${input.domainKey.toLowerCase()}`;
  }

  if (input.threadKey) {
    return `thread:${input.threadKey.toLowerCase()}`;
  }

  return input.itemId.toLowerCase();
};

const toSignal = (
  input: RedditReadonlyInput,
  index: number,
): QueueSignal => {
  const reportReason = input.reportReason || 'read-only playtest report';
  const subredditName = normalizeSubredditName(input.subredditName);
  const signalTags = [
    'playtest-readonly',
    ...(input.tags ?? []).map((tag) => tag.toLowerCase()),
  ];

  return {
    id: `playtest-${subredditName}-${slug(input.itemId)}-${index + 1}`,
    itemId: input.itemId,
    itemType: input.itemType,
    subjectKey: subjectKeyForInput(input),
    authorKey: input.authorKey ? safeKey(input.authorKey, 'author') : undefined,
    domainKey: input.domainKey?.toLowerCase(),
    threadKey: input.threadKey?.toLowerCase(),
    suspectedRuleArea:
      input.suspectedRuleArea || suspectedRuleAreaFromReason(reportReason),
    reportReason,
    createdAt: input.createdAt,
    receivedAt: input.receivedAt,
    tags: [...new Set(signalTags)],
    source: 'playtest-readonly',
    subredditName,
    safeExcerpt: safeExcerpt(input.safeExcerpt),
  };
};

const buildSummary = (
  config: ReadonlyIngestionConfig,
  acceptedSignals: number,
  rejectedSignals: number,
  rejected: readonly ReadonlyIngestionRejection[],
  startedAt: string,
): IngestionRunSummary => {
  const finishedAt = new Date().toISOString();

  return {
    runId: `readonly-${Date.parse(startedAt)}-${acceptedSignals}-${rejectedSignals}`,
    mode: config.mode,
    source: 'playtest-readonly',
    storeMode: config.storeMode,
    acceptedSignals,
    rejectedSignals,
    reasons: [...new Set(rejected.map((item) => item.reason))].sort(),
    startedAt,
    finishedAt,
  };
};

export const normalizeReadonlyIngestion = (
  rawInputs: readonly unknown[],
  config: ReadonlyIngestionConfig,
): NormalizedReadonlyIngestion => {
  const startedAt = new Date().toISOString();
  const signals: QueueSignal[] = [];
  const rejected: ReadonlyIngestionRejection[] = [];

  rawInputs.forEach((rawInput, index) => {
    const { input, rejection } = toInput(rawInput);

    if (!input) {
      rejected.push(rejection ?? { reason: 'Invalid input metadata.' });
      return;
    }

    const subredditName = normalizeSubredditName(input.subredditName);

    if (!isSubredditAllowlisted(subredditName, config)) {
      rejected.push({
        itemId: input.itemId,
        subredditName,
        reason: 'Subreddit is not allowlisted for read-only playtest ingestion.',
      });
      return;
    }

    signals.push(toSignal({ ...input, subredditName }, index));
  });

  return {
    runSummary: buildSummary(
      config,
      signals.length,
      rejected.length,
      rejected,
      startedAt,
    ),
    signals,
    rejected,
  };
};
