import { describe, expect, it } from 'vitest';

import { Runner as TelegramNotifier } from '../../../lib/notifiers/telegram.js';
import { createPayload } from './fixtures.js';

/**
 * Tests - Lib - Notifiers - Telegram - Telegram Adapter.
 *
 * Locks Telegram authentication, endpoint, and sendMessage request fields.
 * Changes here would alter a stored destination's delivery behavior.
 *
 * @since 2.2.1
 */
describe('Telegram adapter', () => {
  it('builds the exact request', () => {
    expect(new TelegramNotifier({
      secrets: { botToken: '123:token' },
      service: 'telegram',
      settings: { chatId: '-1001234567890' },
    }).buildRequest(createPayload())).toEqual({
      body: JSON.stringify({
        chat_id: '-1001234567890',
        disable_web_page_preview: true,
        text: [
          'pfSense Actions: Alert',
          '',
          'Message <&>.',
        ].join('\n'),
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      url: 'https://api.telegram.org/bot123:token/sendMessage',
    });

    return;
  });

  it('keeps token and chat validation as free-form text', () => {
    expect(TelegramNotifier.validate('botToken', '123:token')).toBe(true);

    expect(TelegramNotifier.validate('chatId', '-1001234567890')).toBe(true);

    return;
  });

  return;
});
