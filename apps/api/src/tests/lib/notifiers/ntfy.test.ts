import { describe, expect, it } from 'vitest';

import { Runner as NtfyNotifier } from '../../../lib/notifiers/ntfy.js';
import { createPayload } from './fixtures.js';

/**
 * Tests - Lib - Notifiers - Ntfy - Ntfy Adapter.
 *
 * Locks ntfy topic parsing, bearer authentication, and JSON request fields.
 * Changes here would alter a stored destination's delivery behavior.
 *
 * @since 2.2.1
 */
describe('Ntfy adapter', () => {
  it('builds the exact request', () => {
    expect(new NtfyNotifier({
      secrets: { token: 'ntfy-token' },
      service: 'ntfy',
      settings: { url: 'https://ntfy.example.com/operations' },
    }).buildRequest(createPayload())).toEqual({
      body: JSON.stringify({
        message: 'Message <&>.',
        priority: 4,
        tags: ['warning'],
        title: 'pfSense Actions: Alert',
        topic: 'operations',
      }),
      headers: {
        'Authorization': 'Bearer ntfy-token',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      url: 'https://ntfy.example.com/',
    });

    return;
  });

  it('validates full topic URLs', () => {
    expect(NtfyNotifier.validate('url', 'https://ntfy.example.com/operations')).toBe(true);

    expect(NtfyNotifier.validate('url', 'https://ntfy.example.com/')).toBe(false);

    return;
  });

  return;
});
