import type { QueueIncident } from './types';

export const PRIMARY_DEMO_INCIDENT: QueueIncident = {
  id: 'inc-demo-001',
  priority: 'high',
  status: 'reviewing',
  title: 'Coordinated repost wave in new queue items',
  itemType: 'post',
  reportCount: 14,
  queueAgeMinutes: 38,
  suspectedRuleArea: 'Spam and repost policy',
  whySurfaced: [
    'Multiple reports share the same suspected rule area',
    'Related posts arrived within a short queue window',
    'Queue age is increasing while duplicates continue to arrive',
  ],
  userContextSummary:
    'Demo account group with repeated low-context posts in the current queue window.',
  relatedItemCount: 9,
  rationaleDraft:
    'Likely repost wave. Review related items together before taking any action.',
  createdAt: '2026-05-13T09:10:00.000Z',
  updatedAt: '2026-05-13T09:48:00.000Z',
};

export const DEMO_INCIDENTS: QueueIncident[] = [
  PRIMARY_DEMO_INCIDENT,
  {
    id: 'inc-demo-002',
    priority: 'medium',
    status: 'open',
    title: 'Comment thread receiving duplicate civility reports',
    itemType: 'comment',
    reportCount: 7,
    queueAgeMinutes: 24,
    suspectedRuleArea: 'Civility and personal attacks',
    whySurfaced: [
      'Several reports point to the same thread branch',
      'Reports are clustered around a single exchange',
      'Moderator review can resolve several queue items together',
    ],
    userContextSummary:
      'Demo users in a heated thread branch with no real account data included.',
    relatedItemCount: 5,
    rationaleDraft:
      'Review the branch context before deciding whether reminders or removals are needed.',
    createdAt: '2026-05-13T09:22:00.000Z',
    updatedAt: '2026-05-13T09:46:00.000Z',
  },
  {
    id: 'inc-demo-003',
    priority: 'low',
    status: 'open',
    title: 'Domain watch placeholder for repeated link reports',
    itemType: 'domain',
    reportCount: 3,
    queueAgeMinutes: 11,
    suspectedRuleArea: 'Link quality review',
    whySurfaced: [
      'Domain appears in multiple queue items',
      'Report volume is low but repeated enough to track',
      'No automatic enforcement is enabled',
    ],
    userContextSummary:
      'Demo domain summary only. Future sprints can add richer source context.',
    relatedItemCount: 3,
    rationaleDraft:
      'Keep visible for moderator review while avoiding any automatic action.',
    createdAt: '2026-05-13T09:35:00.000Z',
    updatedAt: '2026-05-13T09:46:00.000Z',
  },
];
