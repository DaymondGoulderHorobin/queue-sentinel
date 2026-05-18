import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { createReadonlyIngestionConfig } from '../src/server/services/ingestionConfig';
import { createModeratorAuth } from '../src/server/services/moderatorAuth';

const readDoc = (path: string) => readFileSync(path, 'utf8');
const lower = (value: string) => value.toLowerCase();

describe('Sprint 7 marketplace readiness package', () => {
  it('includes every required submission document', () => {
    const requiredDocs = [
      'docs/submission-copy.md',
      'docs/demo-video-script.md',
      'docs/release-checklist.md',
      'docs/privacy-and-safety.md',
      'docs/devvit-publish-readiness.md',
    ];

    for (const path of requiredDocs) {
      expect(existsSync(path), `${path} should exist`).toBe(true);
    }
  });

  it('documents the major privacy and safety claims', () => {
    const document = lower(readDoc('docs/privacy-and-safety.md'));

    expect(document).toContain('no automatic enforcement');
    expect(document).toContain('full post or comment bodies');
    expect(document).toContain('ai decision');
    expect(document).toContain('webhook');
    expect(document).toContain('read-only ingestion is disabled by default');
    expect(document).toContain('raw usernames in audit entries');
  });

  it('keeps release checklist commands and environment modes visible', () => {
    const checklist = readDoc('docs/release-checklist.md');

    expect(checklist).toContain('npm install');
    expect(checklist).toContain('npm run check');
    expect(checklist).toContain('npm run build');
    expect(checklist).toContain('npm run dev');
    expect(checklist).toContain('npm run dev:shell');
    expect(checklist).toContain('Browser fallback');
    expect(checklist).toContain('Production-safe default mode');
  });

  it('keeps submission copy from claiming live enforcement or automatic moderation', () => {
    const copy = lower(readDoc('docs/submission-copy.md'));

    expect(copy).toContain('triage context');
    expect(copy).toContain('human-in-the-loop');
    expect(copy).not.toMatch(/automatically (approve|remove|ban|lock|mute|moderate|enforce)/);
    expect(copy).not.toContain('live enforcement enabled');
    expect(copy).not.toContain('ai-powered moderation decisions');
  });

  it('links the README to the Sprint 7 submission docs', () => {
    const readme = readDoc('README.md');

    expect(readme).toContain('docs/playtest-runbook.md');
    expect(readme).toContain('docs/demo-evidence.md');
    expect(readme).toContain('docs/privacy-and-safety.md');
    expect(readme).toContain('docs/submission-copy.md');
    expect(readme).toContain('docs/demo-video-script.md');
    expect(readme).toContain('docs/release-checklist.md');
    expect(readme).toContain('docs/devvit-publish-readiness.md');
  });

  it('documents publish readiness from local app config without guessing marketplace policy', () => {
    const readiness = readDoc('docs/devvit-publish-readiness.md');
    const devvitConfig = JSON.parse(readDoc('devvit.json')) as {
      menu: { items: Array<{ endpoint: string; forUserType: string }> };
      name: string;
      post: { entrypoints: { default: { entry: string } } };
      server: { entry: string };
    };

    expect(readiness).toContain('manual verification required');
    expect(readiness).toContain('devvit upload');
    expect(readiness).toContain('devvit publish');
    expect(devvitConfig.name).toBe('queue-sentinel');
    expect(devvitConfig.post.entrypoints.default.entry).toBe('app.html');
    expect(devvitConfig.server.entry).toBe('index.cjs');
    expect(devvitConfig.menu.items[0]).toMatchObject({
      endpoint: '/internal/menu/post-create',
      forUserType: 'moderator',
    });
  });
});

describe('Sprint 7 production-safe defaults', () => {
  it('keeps ingestion disabled and mutations denied by default', async () => {
    const config = createReadonlyIngestionConfig({}, 'memory');
    const auth = createModeratorAuth({ NODE_ENV: 'production' }, async () => null);
    const authorization = await auth.guardMutation();

    expect(config.mode).toBe('disabled');
    expect(config.enabled).toBe(false);
    expect(config.allowlistConfigured).toBe(false);
    expect(authorization.allowed).toBe(false);
    expect(authorization.message).toBe(
      'Moderator authorization is required for this Queue Sentinel mutation.',
    );
  });

  it('keeps Settings mode copy visible for reviewer workflows', () => {
    const settingsSource = readDoc('src/client/pages/SettingsPage.tsx');

    expect(settingsSource).toContain('Demo Mode');
    expect(settingsSource).toContain('Private Playtest Mode');
    expect(settingsSource).toContain('Production-Safe Default Mode');
    expect(settingsSource).toContain('Browser Fallback');
    expect(settingsSource).toContain('Authorization');
  });
});
