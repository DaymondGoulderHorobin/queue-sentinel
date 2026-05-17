import type {
  IngestionMode,
  ReadonlyIngestionConfig,
  SignalStoreMode,
} from '../../shared/types';

type EnvLike = Partial<Record<string, string | undefined>>;

const validModes = new Set<IngestionMode>([
  'disabled',
  'demo-only',
  'playtest-readonly',
]);

export const normalizeSubredditName = (value: string) =>
  value
    .trim()
    .replace(/^r\//i, '')
    .toLowerCase();

const splitSubreddits = (value: string | undefined) => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(normalizeSubredditName)
    .filter(Boolean);
};

const normalizeMode = (value: string | undefined): IngestionMode | undefined => {
  if (!value) {
    return undefined;
  }

  const mode = value.trim().toLowerCase() as IngestionMode;
  return validModes.has(mode) ? mode : undefined;
};

const unique = <T>(items: readonly T[]) => [...new Set(items)];

export const createReadonlyIngestionConfig = (
  env: EnvLike = process.env,
  storeMode: SignalStoreMode = 'memory',
): ReadonlyIngestionConfig => {
  const requiredEnvPresent =
    env.QUEUE_SENTINEL_ENABLE_READONLY_INGESTION === 'true';
  const allowedSubredditNames = unique([
    ...splitSubreddits(env.QUEUE_SENTINEL_TEST_SUBREDDIT),
    ...splitSubreddits(env.QUEUE_SENTINEL_ALLOWED_SUBREDDITS),
  ]).sort((a, b) => a.localeCompare(b));
  const allowlistConfigured = allowedSubredditNames.length > 0;
  const requestedMode = normalizeMode(env.QUEUE_SENTINEL_INGESTION_MODE);
  const mode =
    requestedMode ??
    (requiredEnvPresent && allowlistConfigured ? 'playtest-readonly' : 'disabled');

  return {
    mode,
    storeMode,
    allowedSubredditNames,
    enabled:
      mode === 'playtest-readonly' &&
      requiredEnvPresent &&
      allowlistConfigured,
    requiredEnvPresent,
    allowlistConfigured,
  };
};

export const isReadonlyPlaytestEnabled = (
  config: ReadonlyIngestionConfig,
) => {
  return config.mode === 'playtest-readonly' && config.enabled;
};

export const isSubredditAllowlisted = (
  subredditName: string,
  config: ReadonlyIngestionConfig,
) => {
  const normalizedName = normalizeSubredditName(subredditName);
  return config.allowedSubredditNames.includes(normalizedName);
};
