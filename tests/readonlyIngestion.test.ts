import { describe, expect, it } from 'vitest';

import { createReadonlyIngestionConfig } from '../src/server/services/ingestionConfig';
import { normalizeReadonlyIngestion } from '../src/server/services/redditSignalNormalizer';
import { PLAYTEST_READONLY_INPUTS } from '../src/shared/playtestInputs';

const enabledConfig = createReadonlyIngestionConfig(
  {
    QUEUE_SENTINEL_ENABLE_READONLY_INGESTION: 'true',
    QUEUE_SENTINEL_TEST_SUBREDDIT: 'queue_sentinel_lab',
  },
  'memory',
);

describe('read-only Reddit signal normalizer', () => {
  it('normalizes allowlisted metadata into QueueSignal records', () => {
    const result = normalizeReadonlyIngestion(
      PLAYTEST_READONLY_INPUTS,
      enabledConfig,
    );

    expect(result.signals).toHaveLength(5);
    expect(result.rejected).toHaveLength(0);
    expect(result.signals[0]).toMatchObject({
      source: 'playtest-readonly',
      subredditName: 'queue_sentinel_lab',
    });
    expect(result.signals.every((signal) => !('body' in signal))).toBe(true);
  });

  it('rejects non-allowlisted subreddit metadata', () => {
    const result = normalizeReadonlyIngestion(
      [
        {
          ...PLAYTEST_READONLY_INPUTS[0],
          subredditName: 'not_the_lab',
        },
      ],
      enabledConfig,
    );

    expect(result.signals).toHaveLength(0);
    expect(result.rejected[0]?.reason).toContain('not allowlisted');
  });

  it('rejects moderation-side fields without echoing unsafe keys', () => {
    const result = normalizeReadonlyIngestion(
      [
        {
          ...PLAYTEST_READONLY_INPUTS[0],
          redditAction: 'remove',
        },
      ],
      enabledConfig,
    );

    expect(result.signals).toHaveLength(0);
    expect(JSON.stringify(result.rejected)).not.toContain('redditAction');
    expect(JSON.stringify(result.rejected)).not.toContain('remove');
  });

  it('rejects malformed and invalid timestamp metadata', () => {
    const result = normalizeReadonlyIngestion(
      [
        { itemType: 'post', subredditName: 'queue_sentinel_lab' },
        {
          ...PLAYTEST_READONLY_INPUTS[0],
          receivedAt: 'not-a-date',
        },
      ],
      enabledConfig,
    );

    expect(result.signals).toHaveLength(0);
    expect(result.rejected.map((item) => item.reason)).toEqual([
      'Missing required read-only metadata.',
      'Invalid timestamp metadata.',
    ]);
  });

  it('maps report reasons into suspected rule areas when needed', () => {
    const result = normalizeReadonlyIngestion(
      [
        {
          itemId: 't3_reason_only',
          itemType: 'post',
          subredditName: 'queue_sentinel_lab',
          reportReason: 'duplicate repost wave',
          createdAt: '2026-05-15T09:00:00.000Z',
          receivedAt: '2026-05-15T09:02:00.000Z',
        },
      ],
      enabledConfig,
    );

    expect(result.signals[0]?.suspectedRuleArea).toBe('Spam and repost policy');
  });
});
