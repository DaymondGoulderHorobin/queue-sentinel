import type { QueueSignal } from './types';

const signal = (
  id: string,
  subjectKey: string,
  itemId: string,
  itemType: QueueSignal['itemType'],
  suspectedRuleArea: string,
  reportReason: string,
  receivedAt: string,
  options: Pick<QueueSignal, 'authorKey' | 'domainKey' | 'threadKey' | 'tags'> = {},
): QueueSignal => ({
  id,
  itemId,
  itemType,
  subjectKey,
  suspectedRuleArea,
  reportReason,
  createdAt: receivedAt,
  receivedAt,
  ...options,
});

export const DEMO_QUEUE_SIGNALS: QueueSignal[] = [
  signal('sig-001-01', 'inc-demo-001', 'post-repost-1', 'post', 'Spam and repost policy', 'duplicate link post', '2026-05-14T08:20:00.000Z', { authorKey: 'author-repost-a', domainKey: 'example-deals.invalid', tags: ['duplicate-wave'] }),
  signal('sig-001-02', 'inc-demo-001', 'post-repost-1', 'post', 'Spam and repost policy', 'same title repost', '2026-05-14T08:24:00.000Z', { authorKey: 'author-repost-b', domainKey: 'example-deals.invalid', tags: ['duplicate-wave'] }),
  signal('sig-001-03', 'inc-demo-001', 'post-repost-2', 'post', 'Spam and repost policy', 'matching domain spam', '2026-05-14T08:28:00.000Z', { authorKey: 'author-repost-c', domainKey: 'example-deals.invalid', tags: ['link-cluster'] }),
  signal('sig-001-04', 'inc-demo-001', 'post-repost-3', 'post', 'Spam and repost policy', 'low context repost', '2026-05-14T08:35:00.000Z', { authorKey: 'author-repost-a', domainKey: 'example-deals.invalid', tags: ['time-sensitive'] }),
  signal('sig-001-05', 'inc-demo-001', 'post-repost-4', 'post', 'Spam and repost policy', 'duplicate destination', '2026-05-14T08:44:00.000Z', { authorKey: 'author-repost-d', domainKey: 'example-deals.invalid', tags: ['link-cluster'] }),
  signal('sig-001-06', 'inc-demo-001', 'post-repost-5', 'post', 'Spam and repost policy', 'new queue flooding', '2026-05-14T08:49:00.000Z', { authorKey: 'author-repost-e', domainKey: 'example-deals.invalid', tags: ['duplicate-wave'] }),
  signal('sig-001-07', 'inc-demo-001', 'post-repost-6', 'post', 'Spam and repost policy', 'same outbound domain', '2026-05-14T09:03:00.000Z', { authorKey: 'author-repost-f', domainKey: 'example-deals.invalid', tags: ['link-cluster'] }),
  signal('sig-001-08', 'inc-demo-001', 'post-repost-6', 'post', 'Spam and repost policy', 'duplicate report on newest post', '2026-05-14T09:18:00.000Z', { authorKey: 'author-repost-f', domainKey: 'example-deals.invalid', tags: ['time-sensitive'] }),

  signal('sig-002-01', 'inc-demo-002', 'comment-civility-1', 'comment', 'Civility and personal attacks', 'personal attack report', '2026-05-14T08:44:00.000Z', { authorKey: 'author-civility-a', threadKey: 'thread-civility-branch', tags: ['thread-branch'] }),
  signal('sig-002-02', 'inc-demo-002', 'comment-civility-2', 'comment', 'Civility and personal attacks', 'heated exchange report', '2026-05-14T08:51:00.000Z', { authorKey: 'author-civility-b', threadKey: 'thread-civility-branch', tags: ['heated-exchange'] }),
  signal('sig-002-03', 'inc-demo-002', 'comment-civility-2', 'comment', 'Civility and personal attacks', 'duplicate thread branch report', '2026-05-14T08:57:00.000Z', { authorKey: 'author-civility-c', threadKey: 'thread-civility-branch', tags: ['context-needed'] }),
  signal('sig-002-04', 'inc-demo-002', 'comment-civility-3', 'comment', 'Civility and personal attacks', 'insult report', '2026-05-14T09:05:00.000Z', { authorKey: 'author-civility-a', threadKey: 'thread-civility-branch', tags: ['thread-branch'] }),
  signal('sig-002-05', 'inc-demo-002', 'comment-civility-4', 'comment', 'Civility and personal attacks', 'same branch civility report', '2026-05-14T09:18:00.000Z', { authorKey: 'author-civility-d', threadKey: 'thread-civility-branch', tags: ['context-needed'] }),

  signal('sig-003-01', 'inc-demo-003', 'reply-wave-1', 'user', 'Community interference', 'coordinated arrival report', '2026-05-14T08:58:00.000Z', { authorKey: 'author-wave-a', threadKey: 'thread-interference-a', tags: ['coordination-signal'] }),
  signal('sig-003-02', 'inc-demo-003', 'reply-wave-2', 'user', 'Community interference', 'sudden reply wave', '2026-05-14T09:02:00.000Z', { authorKey: 'author-wave-a', threadKey: 'thread-interference-a', tags: ['reply-wave'] }),
  signal('sig-003-03', 'inc-demo-003', 'reply-wave-3', 'user', 'Community interference', 'cross thread arrival', '2026-05-14T09:08:00.000Z', { authorKey: 'author-wave-a', threadKey: 'thread-interference-b', tags: ['needs-context'] }),
  signal('sig-003-04', 'inc-demo-003', 'reply-wave-4', 'user', 'Community interference', 'similar reply pattern', '2026-05-14T09:12:00.000Z', { authorKey: 'author-wave-b', threadKey: 'thread-interference-b', tags: ['coordination-signal'] }),
  signal('sig-003-05', 'inc-demo-003', 'reply-wave-5', 'user', 'Community interference', 'reported pattern repeat', '2026-05-14T09:20:00.000Z', { authorKey: 'author-wave-a', threadKey: 'thread-interference-c', tags: ['reply-wave'] }),
  signal('sig-003-06', 'inc-demo-003', 'reply-wave-6', 'user', 'Community interference', 'needs moderator context', '2026-05-14T09:29:00.000Z', { authorKey: 'author-wave-c', threadKey: 'thread-interference-c', tags: ['needs-context'] }),

  signal('sig-004-01', 'inc-demo-004', 'domain-link-1', 'domain', 'Link quality review', 'low quality domain', '2026-05-14T09:01:00.000Z', { domainKey: 'low-quality-links.invalid', tags: ['domain-repeat'] }),
  signal('sig-004-02', 'inc-demo-004', 'domain-link-2', 'domain', 'Link quality review', 'same domain repeat', '2026-05-14T09:08:00.000Z', { domainKey: 'low-quality-links.invalid', tags: ['link-review'] }),
  signal('sig-004-03', 'inc-demo-004', 'domain-link-3', 'domain', 'Link quality review', 'domain pattern report', '2026-05-14T09:16:00.000Z', { domainKey: 'low-quality-links.invalid', tags: ['domain-repeat'] }),
  signal('sig-004-04', 'inc-demo-004', 'domain-link-4', 'domain', 'Link quality review', 'repeat link concern', '2026-05-14T09:28:00.000Z', { domainKey: 'low-quality-links.invalid', tags: ['link-review'] }),

  signal('sig-005-01', 'inc-demo-005', 'mega-offtopic-1', 'comment', 'Off-topic discussion', 'off topic in megathread', '2026-05-14T08:52:00.000Z', { threadKey: 'thread-megathread-a', tags: ['megathread'] }),
  signal('sig-005-02', 'inc-demo-005', 'mega-offtopic-2', 'comment', 'Off-topic discussion', 'same megathread segment', '2026-05-14T09:01:00.000Z', { threadKey: 'thread-megathread-a', tags: ['off-topic'] }),
  signal('sig-005-03', 'inc-demo-005', 'mega-offtopic-3', 'comment', 'Off-topic discussion', 'batch review report', '2026-05-14T09:10:00.000Z', { threadKey: 'thread-megathread-a', tags: ['batch-review'] }),
  signal('sig-005-04', 'inc-demo-005', 'mega-offtopic-4', 'comment', 'Off-topic discussion', 'duplicate megathread report', '2026-05-14T09:21:00.000Z', { threadKey: 'thread-megathread-a', tags: ['batch-review'] }),

  signal('sig-006-01', 'inc-demo-006', 'privacy-post-1', 'post', 'Privacy and safety', 'possible sensitive information', '2026-05-14T08:26:00.000Z', { tags: ['privacy-review'] }),
  signal('sig-006-02', 'inc-demo-006', 'privacy-post-1', 'post', 'Privacy and safety', 'same privacy report', '2026-05-14T08:59:00.000Z', { tags: ['safety-adjacent'] }),
  signal('sig-006-03', 'inc-demo-006', 'privacy-post-1', 'post', 'Privacy and safety', 'careful review requested', '2026-05-14T09:24:00.000Z', { tags: ['careful-review'] }),

  signal('sig-007-01', 'inc-demo-007', 'flair-help-1', 'post', 'Flair and formatting', 'wrong flair report', '2026-05-14T09:07:00.000Z', { tags: ['flair'] }),
  signal('sig-007-02', 'inc-demo-007', 'flair-help-2', 'post', 'Flair and formatting', 'formatting report', '2026-05-14T09:14:00.000Z', { tags: ['formatting'] }),
  signal('sig-007-03', 'inc-demo-007', 'flair-help-3', 'post', 'Flair and formatting', 'quick cleanup report', '2026-05-14T09:26:00.000Z', { tags: ['quick-clear'] }),

  signal('sig-008-01', 'inc-demo-008', 'title-format-1', 'post', 'Title formatting', 'title format duplicate', '2026-05-14T08:38:00.000Z', { tags: ['resolved-demo'] }),
  signal('sig-008-02', 'inc-demo-008', 'title-format-1', 'post', 'Title formatting', 'same title issue', '2026-05-14T09:12:00.000Z', { tags: ['title-formatting'] }),

  signal('sig-009-01', 'inc-demo-009', 'solicitation-comment-1', 'comment', 'Solicitation and self-promotion', 'marketplace solicitation', '2026-05-14T08:05:00.000Z', { authorKey: 'author-market-a', threadKey: 'thread-market-a', tags: ['stale-queue'] }),
  signal('sig-009-02', 'inc-demo-009', 'solicitation-comment-2', 'comment', 'Solicitation and self-promotion', 'self promotion repeat', '2026-05-14T08:34:00.000Z', { authorKey: 'author-market-a', threadKey: 'thread-market-a', tags: ['solicitation'] }),
  signal('sig-009-03', 'inc-demo-009', 'solicitation-comment-3', 'comment', 'Solicitation and self-promotion', 'same offer language', '2026-05-14T08:57:00.000Z', { authorKey: 'author-market-b', threadKey: 'thread-market-a', tags: ['self-promo'] }),
  signal('sig-009-04', 'inc-demo-009', 'solicitation-comment-4', 'comment', 'Solicitation and self-promotion', 'repeat solicitation', '2026-05-14T09:05:00.000Z', { authorKey: 'author-market-a', threadKey: 'thread-market-a', tags: ['solicitation'] }),
  signal('sig-009-05', 'inc-demo-009', 'solicitation-comment-5', 'comment', 'Solicitation and self-promotion', 'stale queue solicitation', '2026-05-14T09:18:00.000Z', { authorKey: 'author-market-c', threadKey: 'thread-market-a', tags: ['stale-queue'] }),

  signal('sig-010-01', 'inc-demo-010', 'profile-touch-1', 'user', 'Pattern review', 'profile appears repeatedly', '2026-05-14T09:04:00.000Z', { authorKey: 'author-pattern-a', tags: ['profile-context'] }),
  signal('sig-010-02', 'inc-demo-010', 'profile-touch-2', 'user', 'Pattern review', 'same user pattern', '2026-05-14T09:11:00.000Z', { authorKey: 'author-pattern-a', tags: ['pattern-review'] }),
  signal('sig-010-03', 'inc-demo-010', 'profile-touch-3', 'user', 'Pattern review', 'repeated queue touch', '2026-05-14T09:18:00.000Z', { authorKey: 'author-pattern-a', tags: ['profile-context'] }),
  signal('sig-010-04', 'inc-demo-010', 'profile-touch-4', 'user', 'Pattern review', 'needs human context', '2026-05-14T09:26:00.000Z', { authorKey: 'author-pattern-a', tags: ['pattern-review'] }),
];
