import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readDoc = (path: string) => readFileSync(path, 'utf8');

describe('Sprint 6 documentation package', () => {
  it('includes the private playtest runbook with key operator sections', () => {
    const runbook = readDoc('docs/playtest-runbook.md');

    expect(runbook).toContain('# Queue Sentinel Private Playtest Runbook');
    expect(runbook).toContain('Devvit Login and Local Startup');
    expect(runbook).toContain('Private Subreddit Setup');
    expect(runbook).toContain('Fixture Preview, Seed, Recompute, Inspect, Audit, Reset');
    expect(runbook).toContain('Failure Recovery');
    expect(runbook).toContain('QUEUE_SENTINEL_ENABLE_READONLY_INGESTION=true');
    expect(runbook).toContain('QUEUE_SENTINEL_ALLOW_LOCAL_MUTATIONS=true');
  });

  it('includes the demo evidence template with screenshot, video, impact, and safety sections', () => {
    const evidence = readDoc('docs/demo-evidence.md');

    expect(evidence).toContain('# Queue Sentinel Demo Evidence');
    expect(evidence).toContain('Screenshot List');
    expect(evidence).toContain('60 Second Video Shot List');
    expect(evidence).toContain('Safety Proof Points');
    expect(evidence).toContain('Impact Proof Points');
    expect(evidence).toContain('Known Limitations');
  });
});
