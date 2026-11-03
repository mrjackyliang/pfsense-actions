import {
  describe,
  expect,
  it,
} from 'vitest';

import { activityCategoryLabel } from '@/web/activity.js';

describe('activity view', () => {
  it('labels notification configuration changes as configuration', () => {
    expect(activityCategoryLabel('configuration')).toBe('Configuration');

    return;
  });

  return;
});
