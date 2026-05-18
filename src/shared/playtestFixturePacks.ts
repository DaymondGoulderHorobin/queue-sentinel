import { PLAYTEST_READONLY_INPUTS } from './playtestInputs';
import type {
  PlaytestFixturePack,
  PlaytestFixturePackOption,
  RedditReadonlyInput,
} from './types';

const subredditName = 'queue_sentinel_lab';

const timestamp = (minuteOffset: number) =>
  `2026-05-16T09:${String(minuteOffset).padStart(2, '0')}:00.000Z`;

const receivedTimestamp = (minuteOffset: number) =>
  `2026-05-16T09:${String(minuteOffset + 2).padStart(2, '0')}:00.000Z`;

const input = (
  item: Omit<RedditReadonlyInput, 'subredditName' | 'createdAt' | 'receivedAt'> & {
    minuteOffset: number;
  },
): RedditReadonlyInput => ({
  ...item,
  subredditName,
  createdAt: timestamp(item.minuteOffset),
  receivedAt: receivedTimestamp(item.minuteOffset),
});

export const DEFAULT_PLAYTEST_FIXTURE_PACK_ID = 'default-readonly-mix';

export const PLAYTEST_FIXTURE_PACKS: readonly PlaytestFixturePack[] = [
  {
    id: DEFAULT_PLAYTEST_FIXTURE_PACK_ID,
    label: 'Default read-only mix',
    description: 'The merged read-only metadata fixture covering repost, thread, and privacy-adjacent reports.',
    items: PLAYTEST_READONLY_INPUTS,
  },
  {
    id: 'spam-repost-wave',
    label: 'Spam repost wave',
    description: 'Repeated link and domain metadata that should cluster into one high-pressure incident.',
    items: [
      input({
        itemId: 't3_pack_repost_1',
        itemType: 'post',
        authorKey: 'fixture-author-1',
        domainKey: 'repeat-fixture.invalid',
        suspectedRuleArea: 'Spam and repost policy',
        reportReason: 'duplicate link pattern',
        safeExcerpt: 'Synthetic repost metadata only.',
        tags: ['fixture', 'duplicate-wave'],
        minuteOffset: 4,
      }),
      input({
        itemId: 't3_pack_repost_2',
        itemType: 'post',
        authorKey: 'fixture-author-2',
        domainKey: 'repeat-fixture.invalid',
        suspectedRuleArea: 'Spam and repost policy',
        reportReason: 'matching domain report',
        safeExcerpt: 'Synthetic repost metadata only.',
        tags: ['fixture', 'domain-repeat'],
        minuteOffset: 8,
      }),
      input({
        itemId: 't3_pack_repost_3',
        itemType: 'post',
        authorKey: 'fixture-author-3',
        domainKey: 'repeat-fixture.invalid',
        suspectedRuleArea: 'Spam and repost policy',
        reportReason: 'repeat submission report',
        safeExcerpt: 'Synthetic repost metadata only.',
        tags: ['fixture', 'repeat-submission'],
        minuteOffset: 12,
      }),
    ],
  },
  {
    id: 'heated-thread',
    label: 'Heated thread',
    description: 'Multiple comment reports on one thread branch for civility-focused review.',
    items: [
      input({
        itemId: 't1_pack_thread_1',
        itemType: 'comment',
        authorKey: 'fixture-author-4',
        threadKey: 'fixture-thread-alpha',
        suspectedRuleArea: 'Civility and personal attacks',
        reportReason: 'heated exchange',
        safeExcerpt: 'Synthetic thread metadata only.',
        tags: ['fixture', 'thread-review'],
        minuteOffset: 15,
      }),
      input({
        itemId: 't1_pack_thread_2',
        itemType: 'comment',
        authorKey: 'fixture-author-5',
        threadKey: 'fixture-thread-alpha',
        suspectedRuleArea: 'Civility and personal attacks',
        reportReason: 'same branch report',
        safeExcerpt: 'Synthetic thread metadata only.',
        tags: ['fixture', 'context-needed'],
        minuteOffset: 18,
      }),
      input({
        itemId: 't1_pack_thread_3',
        itemType: 'comment',
        authorKey: 'fixture-author-6',
        threadKey: 'fixture-thread-alpha',
        suspectedRuleArea: 'Civility and personal attacks',
        reportReason: 'follow-up civility report',
        safeExcerpt: 'Synthetic thread metadata only.',
        tags: ['fixture', 'branch-repeat'],
        minuteOffset: 21,
      }),
    ],
  },
  {
    id: 'solicitation-self-promo',
    label: 'Solicitation self-promo',
    description: 'Promotional post and comment metadata linked by domain and author keys.',
    items: [
      input({
        itemId: 't3_pack_promo_1',
        itemType: 'post',
        authorKey: 'fixture-author-promo',
        domainKey: 'promo-fixture.invalid',
        suspectedRuleArea: 'Solicitation and self-promotion',
        reportReason: 'self-promotion pattern',
        safeExcerpt: 'Synthetic promotional metadata only.',
        tags: ['fixture', 'self-promo'],
        minuteOffset: 24,
      }),
      input({
        itemId: 't1_pack_promo_2',
        itemType: 'comment',
        authorKey: 'fixture-author-promo',
        threadKey: 'fixture-thread-promo',
        domainKey: 'promo-fixture.invalid',
        suspectedRuleArea: 'Solicitation and self-promotion',
        reportReason: 'solicitation report',
        safeExcerpt: 'Synthetic promotional metadata only.',
        tags: ['fixture', 'solicitation'],
        minuteOffset: 27,
      }),
      input({
        itemId: 't3_pack_promo_3',
        itemType: 'post',
        authorKey: 'fixture-author-promo',
        domainKey: 'promo-fixture.invalid',
        suspectedRuleArea: 'Solicitation and self-promotion',
        reportReason: 'repeated promo link',
        safeExcerpt: 'Synthetic promotional metadata only.',
        tags: ['fixture', 'repeat-link'],
        minuteOffset: 31,
      }),
    ],
  },
  {
    id: 'privacy-adjacent-isolated',
    label: 'Privacy-adjacent isolated',
    description: 'Separate privacy-adjacent reports that should stay cautious and avoid broad grouping.',
    items: [
      input({
        itemId: 't3_pack_privacy_1',
        itemType: 'post',
        authorKey: 'fixture-author-privacy-1',
        suspectedRuleArea: 'Privacy and safety',
        reportReason: 'careful privacy review',
        safeExcerpt: 'Synthetic privacy-adjacent metadata only.',
        tags: ['fixture', 'privacy-review'],
        minuteOffset: 35,
      }),
      input({
        itemId: 't1_pack_privacy_2',
        itemType: 'comment',
        authorKey: 'fixture-author-privacy-2',
        threadKey: 'fixture-thread-privacy',
        suspectedRuleArea: 'Privacy and safety',
        reportReason: 'personal detail concern',
        safeExcerpt: 'Synthetic privacy-adjacent metadata only.',
        tags: ['fixture', 'isolated-review'],
        minuteOffset: 41,
      }),
    ],
  },
  {
    id: 'formatting-flair-cleanup',
    label: 'Formatting cleanup',
    description: 'Low-pressure formatting and flair metadata that should remain review-only.',
    items: [
      input({
        itemId: 't3_pack_format_1',
        itemType: 'post',
        authorKey: 'fixture-author-format-1',
        suspectedRuleArea: 'Flair and formatting',
        reportReason: 'formatting cleanup',
        safeExcerpt: 'Synthetic formatting metadata only.',
        tags: ['fixture', 'formatting'],
        minuteOffset: 44,
      }),
      input({
        itemId: 't3_pack_format_2',
        itemType: 'post',
        authorKey: 'fixture-author-format-2',
        suspectedRuleArea: 'Flair and formatting',
        reportReason: 'post flair cleanup',
        safeExcerpt: 'Synthetic formatting metadata only.',
        tags: ['fixture', 'label-review'],
        minuteOffset: 49,
      }),
      input({
        itemId: 't1_pack_format_3',
        itemType: 'comment',
        authorKey: 'fixture-author-format-3',
        threadKey: 'fixture-thread-format',
        suspectedRuleArea: 'Flair and formatting',
        reportReason: 'format help request',
        safeExcerpt: 'Synthetic formatting metadata only.',
        tags: ['fixture', 'format-help'],
        minuteOffset: 53,
      }),
    ],
  },
];

export const PLAYTEST_FIXTURE_PACK_OPTIONS: readonly PlaytestFixturePackOption[] =
  PLAYTEST_FIXTURE_PACKS.map((pack) => ({
    id: pack.id,
    label: pack.label,
    description: pack.description,
    itemCount: pack.items.length,
  }));

export const getPlaytestFixturePack = (
  packId: string | undefined,
): PlaytestFixturePack | null => {
  const requestedPackId = packId ?? DEFAULT_PLAYTEST_FIXTURE_PACK_ID;
  return (
    PLAYTEST_FIXTURE_PACKS.find((pack) => pack.id === requestedPackId) ?? null
  );
};
