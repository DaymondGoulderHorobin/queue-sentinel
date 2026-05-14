import { describe, expect, it } from 'vitest';

import { clusterQueueSignals } from '../src/server/services/incidentClustering';
import { DEMO_QUEUE_SIGNALS } from '../src/shared/demoSignals';
import type { QueueSignal } from '../src/shared/types';

const makeSignal = (
  id: string,
  overrides: Partial<QueueSignal> = {},
): QueueSignal => ({
  id,
  itemId: `item-${id}`,
  itemType: 'post',
  subjectKey: `subject-${id}`,
  suspectedRuleArea: 'Spam and repost policy',
  reportReason: 'synthetic report',
  createdAt: '2026-05-14T09:00:00.000Z',
  receivedAt: '2026-05-14T09:00:00.000Z',
  ...overrides,
});

describe('deterministic incident clustering', () => {
  it('groups signals with the same item id', () => {
    const clusters = clusterQueueSignals([
      makeSignal('a', { itemId: 'shared-item' }),
      makeSignal('b', { itemId: 'shared-item' }),
    ]);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.uniqueItemCount).toBe(1);
  });

  it('groups comment signals by thread and rule area', () => {
    const clusters = clusterQueueSignals([
      makeSignal('a', {
        itemType: 'comment',
        suspectedRuleArea: 'Civility and personal attacks',
        threadKey: 'thread-a',
      }),
      makeSignal('b', {
        itemType: 'comment',
        suspectedRuleArea: 'Civility and personal attacks',
        threadKey: 'thread-a',
      }),
    ]);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.groupingKeys).toContain('thread:thread-a');
  });

  it('groups domain signals by rule area inside the time window', () => {
    const clusters = clusterQueueSignals([
      makeSignal('a', { domainKey: 'same-domain.invalid' }),
      makeSignal('b', {
        domainKey: 'same-domain.invalid',
        receivedAt: '2026-05-14T09:40:00.000Z',
      }),
    ]);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.groupingKeys).toContain('domain:same-domain.invalid');
  });

  it('groups enough rule-area signals inside a short time window', () => {
    const clusters = clusterQueueSignals([
      makeSignal('a', { suspectedRuleArea: 'Flair and formatting' }),
      makeSignal('b', {
        suspectedRuleArea: 'Flair and formatting',
        receivedAt: '2026-05-14T09:10:00.000Z',
      }),
      makeSignal('c', {
        suspectedRuleArea: 'Flair and formatting',
        receivedAt: '2026-05-14T09:20:00.000Z',
      }),
    ]);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.groupingKeys).toContain('rule:Flair and formatting');
  });

  it('isolates safety-adjacent signals without strong item/thread/domain evidence', () => {
    const clusters = clusterQueueSignals([
      makeSignal('a', { suspectedRuleArea: 'Privacy and safety' }),
      makeSignal('b', {
        suspectedRuleArea: 'Privacy and safety',
        receivedAt: '2026-05-14T09:05:00.000Z',
      }),
      makeSignal('c', {
        suspectedRuleArea: 'Privacy and safety',
        receivedAt: '2026-05-14T09:10:00.000Z',
      }),
    ]);

    expect(clusters).toHaveLength(3);
  });

  it('clusters the demo signal set into stable Sprint 3 incidents', () => {
    const clusters = clusterQueueSignals(DEMO_QUEUE_SIGNALS);

    expect(clusters).toHaveLength(10);
    expect(clusters.map((cluster) => cluster.clusterId)).toEqual(
      [...clusters.map((cluster) => cluster.clusterId)].sort(),
    );
  });
});
