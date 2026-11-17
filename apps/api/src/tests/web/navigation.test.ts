import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  appNavigationItems,
  appNavigationPaths,
  appRouteForView,
  resolveAppNavigationPath,
} from '@/web/app-navigation.js';
import {
  closeNavSheetStack,
  createMoreNavSheetLevel,
  createNavSheetLevel,
  firstNavigationView,
  navigationItemHasSheet,
  navigationItemHoldsView,
  openNavSheetStack,
  PHONE_TABS,
  phoneNavigationLabel,
  phoneTabs,
  popNavSheetStack,
  pushNavSheetStack,
  visibleNavigationItems,
} from '@/web/navigation.js';

import type {
  Tests_Web_Navigation_CanOpen,
  Tests_Web_Navigation_Item,
  Tests_Web_Navigation_Items,
  Tests_Web_Navigation_OptionalItem,
  Tests_Web_Navigation_OptionalSheetGroup,
  Tests_Web_Navigation_SheetLevel,
  Tests_Web_Navigation_SheetStack,
  Tests_Web_Navigation_Tabs,
} from '@/types/tests/web/navigation.test.d.ts';

describe('navigation', () => {
  const groupedItem: Tests_Web_Navigation_Item = {
    groups: [{
      id: 'settings',
      label: 'Settings',
      pages: [
        {
          id: 'connection',
          label: 'Connection',
          permission: 'connection:write',
        },
        {
          id: 'notifications',
          label: 'Notifications',
          permission: 'notifications:write',
        },
      ],
    }],
    icon: 'settings',
    id: 'settings',
    isGroup: true,
    label: 'Settings',
  };

  it('keeps at most four phone targets and puts every remaining item in More', () => {
    const tabs: Tests_Web_Navigation_Tabs = phoneTabs(appNavigationItems);

    expect(PHONE_TABS).toBe(4);

    expect(tabs['tabs'].map((item) => item['id'])).toEqual([
      'overview',
      'activity',
      'access',
    ]);

    expect(tabs['more'].map((item) => item['id'])).toEqual([
      'connection',
      'notifications',
    ]);

    expect(tabs['tabs'].length + 1).toBeLessThanOrEqual(PHONE_TABS);

    const moreLevel: Tests_Web_Navigation_SheetLevel = createMoreNavSheetLevel(tabs['more']);
    const moreGroup: Tests_Web_Navigation_OptionalSheetGroup = moreLevel['groups'].at(0);

    if (moreGroup === undefined) {
      throw new Error('The More sheet needs a row group.');
    }

    expect(moreGroup['rows']).toMatchObject([
      {
        description: 'The pfSense SSH connection',
        label: 'Connection',
      },
      {
        description: 'Where alerts are sent',
        label: 'Notifications',
      },
    ]);

    return;
  });

  it('opens a group at the first page the current role can use', () => {
    const canOpen: Tests_Web_Navigation_CanOpen = (permission) => permission === 'notifications:write';
    const visibleItems: Tests_Web_Navigation_Items = visibleNavigationItems(
      [groupedItem],
      canOpen,
    );
    const visibleGroup: Tests_Web_Navigation_OptionalItem = visibleItems.at(0);

    if (visibleGroup === undefined) {
      throw new Error('The Settings group needs one visible page.');
    }

    const visibleLevel: Tests_Web_Navigation_SheetLevel = createNavSheetLevel(visibleGroup);
    const visibleSheetGroup: Tests_Web_Navigation_OptionalSheetGroup = visibleLevel['groups'].at(0);

    if (visibleSheetGroup === undefined) {
      throw new Error('The Settings sheet needs a row group.');
    }

    expect(firstNavigationView(visibleGroup)).toBe('notifications');

    expect(navigationItemHasSheet(visibleGroup)).toBe(true);

    expect(visibleSheetGroup['rows'].map((row) => row['label'])).toEqual(['Notifications']);

    return;
  });

  it('marks a parent current for its page and every declared child view', () => {
    const featuresItem: Tests_Web_Navigation_Item = {
      groups: [{
        id: 'features',
        label: 'Features',
        pages: [{
          activeViews: ['security'],
          id: 'overview',
          label: 'Features',
        }],
      }],
      icon: 'features',
      id: 'features',
      label: 'Features',
    };

    expect(navigationItemHoldsView(featuresItem, 'overview')).toBe(true);

    expect(navigationItemHoldsView(featuresItem, 'security')).toBe(true);

    expect(navigationItemHoldsView(featuresItem, 'activity')).toBe(false);

    return;
  });

  it('uses short labels only in the phone bar', () => {
    expect(appNavigationItems.map((item) => item['label'])).toEqual([
      'Overview',
      'Activity',
      'Access tokens',
      'Connection',
      'Notifications',
    ]);

    expect(appNavigationItems.map(phoneNavigationLabel)).toEqual([
      'Overview',
      'Activity',
      'Tokens',
      'Connection',
      'Notifications',
    ]);

    return;
  });

  it('maps every full console page through the app path table', () => {
    expect(appNavigationPaths).toEqual({
      account: '/account',
      accessTokens: '/access-tokens',
      activity: '/activity',
      connection: '/connection',
      notifications: '/notifications',
      overview: '/overview',
      root: '/',
    });

    expect(resolveAppNavigationPath('/')['route']).toMatchObject({
      path: '/',
      view: 'overview',
    });

    expect(resolveAppNavigationPath('/overview')['route']).toEqual(appRouteForView('overview'));

    expect(resolveAppNavigationPath('/activity')['route']).toEqual(appRouteForView('activity'));

    expect(resolveAppNavigationPath('/access-tokens')['route']).toEqual(appRouteForView('access'));

    expect(resolveAppNavigationPath('/connection')['route']).toEqual(appRouteForView('connection'));

    expect(resolveAppNavigationPath('/notifications')['route']).toEqual(appRouteForView('notifications'));

    expect(resolveAppNavigationPath('/account')['route']).toEqual(appRouteForView('security'));

    expect(resolveAppNavigationPath('/missing')).toEqual({
      path: '/overview',
      replace: true,
      route: appRouteForView('overview'),
    });

    return;
  });

  it('opens, pushes, pops, and closes the sheet stack without mutation', () => {
    const moreLevel: Tests_Web_Navigation_SheetLevel = createMoreNavSheetLevel([groupedItem]);
    const childLevel: Tests_Web_Navigation_SheetLevel = createNavSheetLevel(groupedItem, 'More');
    const rootStack: Tests_Web_Navigation_SheetStack = openNavSheetStack(moreLevel);
    const pushedStack: Tests_Web_Navigation_SheetStack = pushNavSheetStack(rootStack, childLevel);

    expect(rootStack).toEqual([moreLevel]);

    expect(pushedStack).toEqual([
      moreLevel,
      childLevel,
    ]);

    expect(popNavSheetStack(pushedStack)).toEqual([moreLevel]);

    expect(popNavSheetStack(rootStack)).toBe(rootStack);

    expect(closeNavSheetStack()).toEqual([]);

    return;
  });

  return;
});
