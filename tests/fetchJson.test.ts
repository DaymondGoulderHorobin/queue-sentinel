import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchJson } from '../src/client/api/fetchJson';

const originalFetch = globalThis.fetch;

describe('client fetchJson helper', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns successful JSON payloads', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ status: 'ok', value: 1 }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    ) as typeof fetch;

    await expect(fetchJson<{ status: 'ok'; value: number }>('/api/test')).resolves.toEqual({
      status: 'ok',
      value: 1,
    });
  });

  it('surfaces API error messages for non-OK responses', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          status: 'error',
          message: 'Moderator authorization is required.',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 403,
        },
      ),
    ) as typeof fetch;

    await expect(fetchJson('/api/test')).rejects.toThrow(
      'Moderator authorization is required.',
    );
  });

  it('uses a safe fallback message for empty error payloads', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response('', {
        status: 502,
      }),
    ) as typeof fetch;

    await expect(fetchJson('/api/test')).rejects.toThrow(
      'Request failed with status 502.',
    );
  });
});
