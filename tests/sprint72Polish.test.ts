import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Sprint 7.2 defensive polish', () => {
  it('keeps every internal incident status available on the Case Card', () => {
    const source = readFileSync('src/client/pages/CaseCardPage.tsx', 'utf8');

    for (const status of ['open', 'reviewing', 'resolved', 'escalated']) {
      expect(source).toContain(`<option value="${status}">`);
    }
  });
});
