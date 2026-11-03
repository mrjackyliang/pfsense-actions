import {
  describe,
  expect,
  it,
} from 'vitest';

import { Runner as Attempts } from '@/lib/attempts.js';

import type {
  Tests_Lib_Attempts_Attempts,
  Tests_Lib_Attempts_Start,
} from '@/types/tests/lib/attempts.test.d.ts';

describe('sign-in attempts', () => {
  it('refuses the eleventh attempt within fifteen minutes', () => {
    const attempts: Tests_Lib_Attempts_Attempts = new Attempts();
    const start: Tests_Lib_Attempts_Start = Date.parse('2026-10-24T12:00:00.000Z');

    for (let failure = 0; failure < 10; failure += 1) {
      expect(attempts.isAllowed('sign-in:203.0.113.10', start + failure)).toBe(true);

      attempts.recordFailure('sign-in:203.0.113.10', start + failure);
    }

    expect(attempts.isAllowed('sign-in:203.0.113.10', start + 10)).toBe(false);

    expect(attempts.getRetryAfterSeconds('sign-in:203.0.113.10', start + 10)).toBe(900);

    expect(attempts.isAllowed('sign-in:203.0.113.11', start + 10)).toBe(true);

    expect(attempts.isAllowed('sign-in:203.0.113.10', start + (15 * 60 * 1000) + 1)).toBe(true);

    return;
  });

  it('clears the count after a successful sign-in', () => {
    const attempts: Tests_Lib_Attempts_Attempts = new Attempts();
    const start: Tests_Lib_Attempts_Start = Date.parse('2026-10-24T12:00:00.000Z');

    for (let failure = 0; failure < 10; failure += 1) {
      attempts.recordFailure('sign-in:203.0.113.10', start);
    }

    attempts.reset('sign-in:203.0.113.10');

    expect(attempts.isAllowed('sign-in:203.0.113.10', start)).toBe(true);

    expect(attempts.getRetryAfterSeconds('sign-in:203.0.113.10', start)).toBe(0);

    return;
  });

  return;
});
