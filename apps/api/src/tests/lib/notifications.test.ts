import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  buildEventNotification,
  buildNotificationPayload,
  notificationInputSchema,
  notificationSecretKeys,
  sendNotification,
  splitNotificationSettings,
} from '@/lib/notifications.js';

import type {
  Tests_Lib_Notifications_App,
  Tests_Lib_Notifications_Body,
  Tests_Lib_Notifications_Call,
  Tests_Lib_Notifications_Calls,
  Tests_Lib_Notifications_Dependencies,
  Tests_Lib_Notifications_Issues,
  Tests_Lib_Notifications_Mail,
  Tests_Lib_Notifications_Mails,
  Tests_Lib_Notifications_Notification,
  Tests_Lib_Notifications_Parse,
  Tests_Lib_Notifications_Result,
  Tests_Lib_Notifications_SendOnce_Returns,
  Tests_Lib_Notifications_Status,
  Tests_Lib_Notifications_Target,
} from '@/types/tests/lib/notifications.test.d.ts';

const app: Tests_Lib_Notifications_App = {
  key: 'pfsense-actions',
  name: 'pfSense Actions',
};

const notification: Tests_Lib_Notifications_Notification = buildEventNotification({
  defaultEnabled: true,
  description: 'The scheduled check couldn\'t sign in to pfSense over SSH.',
  key: 'pfsense-unreachable',
  label: 'pfSense can\'t be reached',
  priority: 'high',
  tags: ['warning'],
}, 'Couldn\'t reach 192.0.2.1.', { address: '192.0.2.1' }, new Date('2026-10-26T12:00:00.000Z'));

// Records every request instead of sending it, and answers with the given status and body.
const recordRequests = (calls: Tests_Lib_Notifications_Calls, status: Tests_Lib_Notifications_Status = 204, body: Tests_Lib_Notifications_Body = ''): Tests_Lib_Notifications_Dependencies => {
  return {
    fetch: async (url, init) => {
      calls.push({
        body: String(init.body ?? ''),
        headers: Object.fromEntries(new Headers(init.headers).entries()),
        method: String(init.method ?? 'GET'),
        url,
      });

      return new Response((status === 204) ? null : body, { status });
    },
    sendMail: async () => {
      return;
    },
  };
};

// Sends to one target and returns the single request it made.
const sendOnce = async (target: Tests_Lib_Notifications_Target): Tests_Lib_Notifications_SendOnce_Returns => {
  const calls: Tests_Lib_Notifications_Calls = [];
  const result: Tests_Lib_Notifications_Result = await sendNotification(app, target, notification, recordRequests(calls));

  expect(result).toEqual({ delivered: true });

  expect(calls).toHaveLength(1);

  return calls[0]!;
};

describe('notification services', () => {
  it('formats each service the way it expects', async () => {
    const ntfy: Tests_Lib_Notifications_Call = await sendOnce({
      secrets: { token: 'tk_fixture' },
      service: 'ntfy',
      settings: { url: 'https://ntfy.example.com/alerts' },
    });

    expect(ntfy['url']).toBe('https://ntfy.example.com/');

    expect(ntfy['headers']['authorization']).toBe('Bearer tk_fixture');

    expect(JSON.parse(ntfy['body'])).toEqual({
      message: 'Couldn\'t reach 192.0.2.1.',
      priority: 4,
      tags: ['warning'],
      title: 'pfSense Actions: pfSense can\'t be reached',
      topic: 'alerts',
    });

    const proxy: Tests_Lib_Notifications_Call = await sendOnce({
      secrets: { token: 'context-token' },
      service: 'ntfy-reverse-proxy',
      settings: { url: 'https://alerts.ntfy.example.com' },
    });

    expect(proxy['url']).toBe('https://alerts.ntfy.example.com');

    expect(proxy['headers']['authorization']).toBe('Bearer context-token');

    expect(JSON.parse(proxy['body'])).toEqual({
      app: 'pfsense-actions',
      details: { address: '192.0.2.1' },
      event: 'pfsense-unreachable',
      message: 'Couldn\'t reach 192.0.2.1.',
      occurredAt: '2026-10-26T12:00:00.000Z',
      priority: 4,
      tags: ['warning'],
      title: 'pfSense can\'t be reached',
      version: 1,
    });

    const webhook: Tests_Lib_Notifications_Call = await sendOnce({
      secrets: { url: 'https://hooks.example.com/alert?key=secret' },
      service: 'webhook',
      settings: {},
    });

    expect(webhook['url']).toBe('https://hooks.example.com/alert?key=secret');

    expect(webhook['headers']['authorization']).toBeUndefined();

    expect(JSON.parse(webhook['body'])).toEqual(expect.objectContaining({
      app: 'pfsense-actions',
      event: 'pfsense-unreachable',
      version: 1,
    }));

    const telegram: Tests_Lib_Notifications_Call = await sendOnce({
      secrets: { botToken: '123:abc' },
      service: 'telegram',
      settings: { chatId: '-1001234567890' },
    });

    expect(telegram['url']).toBe('https://api.telegram.org/bot123:abc/sendMessage');

    expect(JSON.parse(telegram['body'])).toEqual({
      chat_id: '-1001234567890',
      disable_web_page_preview: true,
      text: [
        'pfSense Actions: pfSense can\'t be reached',
        '',
        'Couldn\'t reach 192.0.2.1.',
      ].join('\n'),
    });

    const discord: Tests_Lib_Notifications_Call = await sendOnce({
      secrets: { webhookUrl: 'https://discord.com/api/webhooks/1/abc' },
      service: 'discord',
      settings: {},
    });

    expect(JSON.parse(discord['body'])).toEqual({
      embeds: [{
        color: parseInt('d04437', 16),
        description: 'Couldn\'t reach 192.0.2.1.',
        timestamp: '2026-10-26T12:00:00.000Z',
        title: 'pfSense Actions: pfSense can\'t be reached',
      }],
    });

    const slack: Tests_Lib_Notifications_Call = await sendOnce({
      secrets: { webhookUrl: 'https://hooks.slack.com/services/T/B/C' },
      service: 'slack',
      settings: {},
    });

    expect(JSON.parse(slack['body'])).toEqual({
      text: [
        '*pfSense Actions: pfSense can\'t be reached*',
        'Couldn\'t reach 192.0.2.1.',
      ].join('\n'),
    });

    const gotify: Tests_Lib_Notifications_Call = await sendOnce({
      secrets: { token: 'gotify-token' },
      service: 'gotify',
      settings: { url: 'https://gotify.example.com/' },
    });

    expect(gotify['url']).toBe('https://gotify.example.com/message');

    expect(gotify['headers']['x-gotify-key']).toBe('gotify-token');

    expect(JSON.parse(gotify['body'])).toEqual(expect.objectContaining({ priority: 8 }));

    const pushover: Tests_Lib_Notifications_Call = await sendOnce({
      secrets: {
        appToken: 'app-token',
        userKey: 'user-key',
      },
      service: 'pushover',
      settings: {},
    });

    expect(pushover['url']).toBe('https://api.pushover.net/1/messages.json');

    expect(JSON.parse(pushover['body'])).toEqual(expect.objectContaining({
      priority: 1,
      token: 'app-token',
      user: 'user-key',
    }));

    const matrix: Tests_Lib_Notifications_Call = await sendOnce({
      secrets: { accessToken: 'matrix-token' },
      service: 'matrix',
      settings: {
        homeserverUrl: 'https://matrix.example.com',
        roomId: '!room:example.com',
      },
    });

    expect(matrix['method']).toBe('PUT');

    expect(matrix['url'].startsWith('https://matrix.example.com/_matrix/client/v3/rooms/!room%3Aexample.com/send/m.room.message/')).toBe(true);

    expect(matrix['url'].split('/').at(-1)).toHaveLength(36);

    expect(matrix['headers']['authorization']).toBe('Bearer matrix-token');

    const apprise: Tests_Lib_Notifications_Call = await sendOnce({
      secrets: {
        url: 'http://apprise:8000/notify/alerts',
        urls: 'tgram://token/chat',
      },
      service: 'apprise',
      settings: {},
    });

    expect(JSON.parse(apprise['body'])).toEqual({
      body: 'Couldn\'t reach 192.0.2.1.',
      title: 'pfSense Actions: pfSense can\'t be reached',
      type: 'warning',
      urls: 'tgram://token/chat',
    });

    return;
  });

  it('sends email through SMTP with the subject and every recipient', async () => {
    const mails: Tests_Lib_Notifications_Mails = [];
    const result: Tests_Lib_Notifications_Result = await sendNotification(app, {
      secrets: { password: 'smtp-password' },
      service: 'email',
      settings: {
        from: 'alerts@example.com',
        host: 'smtp.example.com',
        port: '465',
        security: 'tls',
        to: 'one@example.com, two@example.com',
        username: 'alerts',
      },
    }, notification, {
      fetch: async () => new Response(null, { status: 500 }),
      sendMail: async (mail: Tests_Lib_Notifications_Mail) => {
        mails.push(mail);

        return;
      },
    });

    expect(result).toEqual({ delivered: true });

    expect(mails).toEqual([{
      from: 'alerts@example.com',
      host: 'smtp.example.com',
      password: 'smtp-password',
      port: 465,
      security: 'tls',
      subject: 'pfSense Actions: pfSense can\'t be reached',
      text: 'Couldn\'t reach 192.0.2.1.',
      to: [
        'one@example.com',
        'two@example.com',
      ],
      username: 'alerts',
    }]);

    expect(await sendNotification(app, {
      secrets: { password: 'unused-password' },
      service: 'email',
      settings: {
        from: 'alerts@example.com',
        host: 'smtp.example.com',
        port: '465',
        security: 'tls',
        to: 'one@example.com',
        username: '',
      },
    }, notification, {
      fetch: async () => new Response(null, { status: 500 }),
      sendMail: async (mail: Tests_Lib_Notifications_Mail) => {
        mails.push(mail);

        return;
      },
    })).toEqual({
      delivered: false,
      message: 'Enter an SMTP username when a password is set.',
    });

    expect(mails).toHaveLength(1);

    return;
  });

  it('reports a refused or silent send in plain words', async () => {
    const target: Tests_Lib_Notifications_Target = {
      secrets: { botToken: '123:abc' },
      service: 'telegram',
      settings: { chatId: '1' },
    };
    const longReason: Tests_Lib_Notifications_Body = 'The receiving context rejected this notification because its configured application and payload contract did not match the submitted event. Review the context interpreter and try again.';

    expect(await sendNotification(app, target, notification, recordRequests([], 400, '{"ok":false,"description":"Bad Request: chat not found"}'))).toEqual({
      delivered: false,
      message: 'HTTP 400: Bad Request: chat not found',
    });

    expect(await sendNotification(app, target, notification, recordRequests([], 502, [
      'Bad gateway',
      'more lines',
    ].join('\n')))).toEqual({
      delivered: false,
      message: 'HTTP 502: Bad gateway',
    });

    expect(await sendNotification(app, target, notification, recordRequests([], 422, JSON.stringify({ message: longReason })))).toEqual({
      delivered: false,
      message: `HTTP 422: ${longReason}`,
    });

    expect(await sendNotification(app, target, notification, {
      fetch: async () => Promise.reject(new DOMException('The operation timed out.', 'TimeoutError')),
      sendMail: async () => {
        return;
      },
    })).toEqual({
      delivered: false,
      message: 'No answer within 10 seconds.',
    });

    return;
  });

  it('checks each service\'s fields with the shared messages', () => {
    const missing: Tests_Lib_Notifications_Parse = notificationInputSchema('telegram', ['pfsense-unreachable'], [], []).safeParse({
      events: [],
      name: ' ',
      settings: {},
    });
    const missingIssues: Tests_Lib_Notifications_Issues = (missing.success === true) ? [] : missing.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);

    expect(missingIssues).toEqual([
      'events: Choose at least one event.',
      'name: Name this notification.',
      'settings.botToken: Enter the bot token.',
      'settings.chatId: Enter the chat ID.',
    ]);

    const invalid: Tests_Lib_Notifications_Parse = notificationInputSchema('discord', ['pfsense-unreachable'], [], []).safeParse({
      events: [
        'pfsense-unreachable',
        'not-an-event',
      ],
      name: 'Alerts',
      settings: {
        extra: 'value',
        webhookUrl: 'https://example.com/hook',
      },
    });
    const invalidIssues: Tests_Lib_Notifications_Issues = (invalid.success === true) ? [] : invalid.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.code}`);

    expect(invalidIssues).toEqual([
      'events.1: custom',
      'settings.webhookUrl: custom',
      'settings: unrecognized_keys',
    ]);

    expect(notificationInputSchema('telegram', ['pfsense-unreachable'], ['botToken'], []).safeParse({
      events: ['pfsense-unreachable'],
      name: 'Phone',
      settings: {
        botToken: '',
        chatId: '1',
      },
    }).success).toBe(true);

    expect(notificationInputSchema('ntfy', ['pfsense-unreachable'], ['token'], []).safeParse({
      events: ['pfsense-unreachable'],
      name: 'Phone',
      clearSecrets: ['token'],
      settings: {
        token: '',
        url: 'https://ntfy.sh/alerts',
      },
    }).success).toBe(true);

    expect(notificationInputSchema('telegram', ['pfsense-unreachable'], ['botToken'], []).safeParse({
      events: ['pfsense-unreachable'],
      name: 'Phone',
      clearSecrets: ['botToken'],
      settings: {
        botToken: '',
        chatId: '1',
      },
    }).success).toBe(false);

    expect(notificationInputSchema('ntfy', ['pfsense-unreachable'], ['token'], []).safeParse({
      events: ['pfsense-unreachable'],
      name: 'Phone',
      clearSecrets: ['url'],
      settings: {
        token: '',
        url: 'https://ntfy.sh/alerts',
      },
    }).success).toBe(false);

    expect(notificationInputSchema('ntfy', ['pfsense-unreachable'], ['token'], []).safeParse({
      events: ['pfsense-unreachable'],
      name: 'Phone',
      clearSecrets: [
        'token',
        'token',
      ],
      settings: {
        token: '',
        url: 'https://ntfy.sh/alerts',
      },
    }).success).toBe(false);

    // A secret can't be cleared and replaced at once.
    expect(notificationInputSchema('ntfy', ['pfsense-unreachable'], ['token'], []).safeParse({
      clearSecrets: ['token'],
      events: ['pfsense-unreachable'],
      name: 'Phone',
      settings: {
        token: 'new-secret',
        url: 'https://ntfy.sh/alerts',
      },
    }).success).toBe(false);

    // One lost with the encryption key can be cleared, but one that was never saved can't.
    expect(notificationInputSchema('ntfy', ['pfsense-unreachable'], [], ['token']).safeParse({
      clearSecrets: ['token'],
      events: ['pfsense-unreachable'],
      name: 'Phone',
      settings: {
        token: '',
        url: 'https://ntfy.sh/alerts',
      },
    }).success).toBe(true);

    expect(notificationInputSchema('ntfy', ['pfsense-unreachable'], [], []).safeParse({
      clearSecrets: ['token'],
      events: ['pfsense-unreachable'],
      name: 'Phone',
      settings: {
        token: '',
        url: 'https://ntfy.sh/alerts',
      },
    }).success).toBe(false);

    const mail: Tests_Lib_Notifications_Parse = notificationInputSchema('email', ['pfsense-unreachable'], [], []).safeParse({
      events: ['pfsense-unreachable'],
      name: 'Mail',
      settings: {
        from: 'alerts@example.com',
        host: 'smtp.example.com',
        port: '70000',
        security: 'starttls',
        to: 'one@example.com, not-an-address',
      },
    });

    expect((mail.success === true) ? [] : mail.error.issues.map((issue) => issue.message)).toEqual([
      'Use a port from 1 to 65535.',
      'Use email addresses separated by commas.',
    ]);

    expect(notificationInputSchema('email', ['pfsense-unreachable'], [], []).safeParse({
      events: ['pfsense-unreachable'],
      name: 'Mail',
      settings: {
        from: 'alerts@example.com',
        host: 'smtp.example.com',
        port: '0587',
        security: 'starttls',
        to: 'one@example.com',
      },
    }).success).toBe(false);

    const room: Tests_Lib_Notifications_Parse = notificationInputSchema('matrix', ['pfsense-unreachable'], [], []).safeParse({
      events: ['pfsense-unreachable'],
      name: 'Room',
      settings: {
        accessToken: 'matrix-token',
        homeserverUrl: 'https://matrix.example.com',
        roomId: 'room:example.com',
      },
    });

    expect((room.success === true) ? [] : room.error.issues.map((issue) => issue.message)).toEqual(['Use a room ID like !room:example.com.']);

    expect(notificationInputSchema('matrix', ['pfsense-unreachable'], [], []).safeParse({
      events: ['pfsense-unreachable'],
      name: 'Room',
      settings: {
        accessToken: 'matrix-token',
        homeserverUrl: 'https://matrix.example.com',
        roomId: '!room:example.com:8448',
      },
    }).success).toBe(true);

    expect(notificationInputSchema('matrix', ['pfsense-unreachable'], [], []).safeParse({
      events: ['pfsense-unreachable'],
      name: 'Room alias',
      settings: {
        accessToken: 'matrix-token',
        homeserverUrl: 'https://matrix.example.com',
        roomId: '#room:example.com',
      },
    }).success).toBe(false);

    const passwordWithoutUsername: Tests_Lib_Notifications_Parse = notificationInputSchema('email', ['pfsense-unreachable'], [], []).safeParse({
      events: ['pfsense-unreachable'],
      name: 'Mail',
      settings: {
        from: 'alerts@example.com',
        host: 'smtp.example.com',
        password: 'smtp-password',
        port: '587',
        security: 'starttls',
        to: 'one@example.com',
        username: '',
      },
    });

    expect((passwordWithoutUsername.success === true) ? [] : passwordWithoutUsername.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)).toEqual(['settings.username: Enter an SMTP username when a password is set.']);

    return;
  });

  it('splits plain settings from secrets and builds the shared payload', () => {
    expect(splitNotificationSettings('ntfy', {
      token: '',
      url: 'https://ntfy.sh/alerts',
    })).toEqual({
      secrets: {},
      settings: { url: 'https://ntfy.sh/alerts' },
    });

    expect(splitNotificationSettings('telegram', {
      botToken: '123:abc',
      chatId: '1',
    })).toEqual({
      secrets: { botToken: '123:abc' },
      settings: { chatId: '1' },
    });

    expect(notificationSecretKeys('email')).toEqual(['password']);

    expect(buildNotificationPayload(app, notification)).toEqual(expect.objectContaining({
      priority: 4,
      version: 1,
    }));

    return;
  });

  return;
});
