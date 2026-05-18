import { describe, expect, it } from 'vitest';

import { createModeratorAuth } from '../src/server/services/moderatorAuth';

describe('moderator authorization guard', () => {
  it('allows only the explicit test or local mutation bypass without Devvit context', async () => {
    const testAuth = createModeratorAuth({ NODE_ENV: 'test' });
    const localAuth = createModeratorAuth({
      NODE_ENV: 'development',
      QUEUE_SENTINEL_ALLOW_LOCAL_MUTATIONS: 'true',
    });

    await expect(testAuth.guardMutation()).resolves.toMatchObject({
      allowed: true,
      status: 'local-bypass',
    });
    await expect(localAuth.guardMutation()).resolves.toMatchObject({
      allowed: true,
      status: 'local-bypass',
    });
  });

  it('denies production mutations when moderator context is unavailable', async () => {
    const auth = createModeratorAuth(
      { NODE_ENV: 'production' },
      async () => null,
    );
    const result = await auth.guardMutation();

    expect(result.allowed).toBe(false);
    expect(result.status).toBe('unavailable');
    expect(result.message).toBe(
      'Moderator authorization is required for this Queue Sentinel mutation.',
    );
    expect(JSON.stringify(result)).not.toContain('queue_sentinel_lab');
    expect(JSON.stringify(result)).not.toContain('username');
  });

  it('allows production mutations only when the actor is a moderator', async () => {
    const auth = createModeratorAuth(
      { NODE_ENV: 'production' },
      async () => ({
        actor: {
          source: 'devvit-context',
          actorKey: 'user-safe-hash',
          subredditKey: 'subreddit-safe-hash',
        },
        isModerator: true,
      }),
    );
    const result = await auth.guardMutation();

    expect(result.allowed).toBe(true);
    expect(result.status).toBe('allowed');
    expect(result.actor?.actorKey).toBe('user-safe-hash');
  });
});
