import {
  describe,
  expect,
  it,
} from 'vitest';

import { notificationServiceIssue } from '@/web/notification-services.js';

describe('notification service form', () => {
  it('requires a service when the placeholder is submitted', () => {
    expect(notificationServiceIssue('', false)).toBe('');

    expect(notificationServiceIssue('', true)).toBe('Choose a service.');

    expect(notificationServiceIssue('ntfy', true)).toBe('');

    return;
  });

  return;
});
