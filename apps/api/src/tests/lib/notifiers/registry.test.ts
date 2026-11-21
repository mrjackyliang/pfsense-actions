import { describe, expect, it } from 'vitest';

import { Runner as EmailNotifier } from '../../../lib/notifiers/email.js';
import { Runner as NotifierRegistry } from '../../../lib/notifiers/registry.js';
import { Runner as WebhookNotifier } from '../../../lib/notifiers/webhook.js';

/**
 * Tests - Lib - Notifiers - Registry - Notifier Registry.
 *
 * Locks adapter selection, definitions, and validation routing by service key.
 * Callers depend on this as the only third-party notification entry point.
 *
 * @since 2.2.1
 */
describe('Notifier registry', () => {
  it('selects email and HTTP adapters', () => {
    expect(NotifierRegistry.create({
      secrets: {},
      service: 'email',
      settings: {},
    })).toBeInstanceOf(EmailNotifier);

    expect(NotifierRegistry.createHttp({
      secrets: { url: 'https://hooks.example.com' },
      service: 'webhook',
      settings: {},
    })).toBeInstanceOf(WebhookNotifier);

    return;
  });

  it('collects definitions and routes validation', () => {
    expect(NotifierRegistry.getDefinitions()['telegram']['label']).toBe('Telegram');

    expect(NotifierRegistry.validate('slack', 'webhookUrl', 'https://hooks.slack.com/services/T/B/token')).toBe(true);

    expect(NotifierRegistry.validate('slack', 'webhookUrl', 'https://example.com/hook')).toBe(false);

    expect(NotifierRegistry.validateSettings('email', { username: '' }, ['password'])).toEqual([{
      message: 'Enter an SMTP username when a password is set.',
      path: ['username'],
    }]);

    return;
  });

  return;
});
