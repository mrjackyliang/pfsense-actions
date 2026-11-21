import { describe, expect, it } from 'vitest';

import { Runner as AppriseNotifier } from '../../../lib/notifiers/apprise.js';
import { createPayload } from './fixtures.js';

/**
 * Tests - Lib - Notifiers - Apprise - Apprise Adapter.
 *
 * Locks Apprise validation and request construction behind its adapter.
 * Changes here would alter a stored destination's delivery behavior.
 *
 * @since 2.2.1
 */
describe('Apprise adapter', () => {
  it('builds the exact request', () => {
    expect(new AppriseNotifier({
      secrets: {
        url: 'https://apprise.example.com/notify',
        urls: 'discord://look-alike',
      },
      service: 'apprise',
      settings: {},
    }).buildRequest(createPayload())).toEqual({
      body: JSON.stringify({
        body: 'Message <&>.',
        title: 'pfSense Actions: Alert',
        type: 'warning',
        urls: 'discord://look-alike',
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      url: 'https://apprise.example.com/notify',
    });

    return;
  });

  it('validates the service URL', () => {
    expect(AppriseNotifier.validate('url', 'https://apprise.example.com')).toBe(true);

    expect(AppriseNotifier.validate('url', 'ftp://apprise.example.com')).toBe(false);

    return;
  });

  return;
});
