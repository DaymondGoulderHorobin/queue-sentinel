import { describe, expect, it } from 'vitest';

import { createReadonlyIngestionConfig } from '../src/server/services/ingestionConfig';
import { normalizeReadonlyIngestion } from '../src/server/services/redditSignalNormalizer';
import {
  DEFAULT_PLAYTEST_FIXTURE_PACK_ID,
  getPlaytestFixturePack,
  PLAYTEST_FIXTURE_PACKS,
  PLAYTEST_FIXTURE_PACK_OPTIONS,
} from '../src/shared/playtestFixturePacks';

const enabledConfig = createReadonlyIngestionConfig(
  {
    QUEUE_SENTINEL_ENABLE_READONLY_INGESTION: 'true',
    QUEUE_SENTINEL_TEST_SUBREDDIT: 'queue_sentinel_lab',
  },
  'memory',
);

describe('playtest fixture packs', () => {
  it('returns the default pack when no fixture is selected', () => {
    const fixturePack = getPlaytestFixturePack(undefined);

    expect(fixturePack?.id).toBe(DEFAULT_PLAYTEST_FIXTURE_PACK_ID);
    expect(fixturePack?.items.length).toBeGreaterThan(0);
  });

  it('defines the metadata-only playtest packs', () => {
    expect(PLAYTEST_FIXTURE_PACKS.map((pack) => pack.id)).toEqual([
      'default-readonly-mix',
      'spam-repost-wave',
      'heated-thread',
      'solicitation-self-promo',
      'privacy-adjacent-isolated',
      'formatting-flair-cleanup',
    ]);
    expect(PLAYTEST_FIXTURE_PACK_OPTIONS).toHaveLength(
      PLAYTEST_FIXTURE_PACKS.length,
    );
  });

  it('normalizes every fixture pack without body or raw author persistence', () => {
    for (const fixturePack of PLAYTEST_FIXTURE_PACKS) {
      const result = normalizeReadonlyIngestion(fixturePack.items, enabledConfig);
      const serialized = JSON.stringify(result.signals);

      expect(result.signals.length).toBe(fixturePack.items.length);
      expect(result.rejected).toHaveLength(0);
      expect(serialized).not.toContain('body');
      expect(serialized).not.toContain('fixture-author');
    }
  });
});
