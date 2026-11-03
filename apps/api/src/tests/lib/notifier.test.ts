import {
  mkdtempSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { Runner as Notifier } from '@/lib/notifier.js';
import { Runner as State } from '@/lib/state.js';

import type {
  Tests_Lib_Notifier_CreatedTarget,
  Tests_Lib_Notifier_DataDirectory,
  Tests_Lib_Notifier_FindTarget_Name,
  Tests_Lib_Notifier_FindTarget_Returns,
  Tests_Lib_Notifier_FindTarget_State,
  Tests_Lib_Notifier_FindTarget_Target,
  Tests_Lib_Notifier_GetDataDirectory_Returns,
  Tests_Lib_Notifier_Login,
  Tests_Lib_Notifier_Logout,
  Tests_Lib_Notifier_OpenState_Returns,
  Tests_Lib_Notifier_Reachable,
  Tests_Lib_Notifier_Send,
  Tests_Lib_Notifier_Session,
  Tests_Lib_Notifier_SessionFactory,
  Tests_Lib_Notifier_State,
  Tests_Lib_Notifier_SystemInformation,
  Tests_Lib_Notifier_SystemInformationResponse,
  Tests_Lib_Notifier_TargetId,
} from '@/types/tests/lib/notifier.test.d.ts';

/**
 * Tests - Lib - Notifier - Data Directory.
 *
 * Points each test at its own operating-system temporary directory.
 * Cleanup never targets a repository or shared application directory.
 *
 * @since 2.0.0
 */
let dataDirectory: Tests_Lib_Notifier_DataDirectory = undefined;

/**
 * Tests - Lib - Notifier - Get Data Directory.
 *
 * Narrows the lifecycle-owned temporary path before a test uses it.
 * A missing setup hook fails loudly instead of falling back to a shared path.
 *
 * @returns {Tests_Lib_Notifier_GetDataDirectory_Returns}
 *
 * @since 2.0.0
 */
function getDataDirectory(): Tests_Lib_Notifier_GetDataDirectory_Returns {
  if (dataDirectory === undefined) {
    throw new Error('The notifier test data directory is not initialized.');
  }

  return dataDirectory;
}

/**
 * Tests - Lib - Notifier - Open State.
 *
 * Opens the state database in the test's directory, as a container start would.
 * Opening it again after the key file is deleted replays a lost key.
 *
 * @returns {Tests_Lib_Notifier_OpenState_Returns}
 *
 * @since 2.0.0
 */
function openState(): Tests_Lib_Notifier_OpenState_Returns {
  return new State({
    adminWebauthnRpName: 'pfSense Actions',
    dataDirectory: getDataDirectory(),
    port: 0,
  });
}

/**
 * Tests - Lib - Notifier - Create Session Factory.
 *
 * Stands in for the SSH adapter, signing in only while the flag says pfSense answers.
 * No test opens a connection to a firewall.
 *
 * @param {Tests_Lib_Notifier_Reachable} reachable - Reachable.
 *
 * @returns {Tests_Lib_Notifier_SessionFactory}
 *
 * @since 2.0.0
 */
function createSessionFactory(reachable: Tests_Lib_Notifier_Reachable): Tests_Lib_Notifier_SessionFactory {
  const session: Tests_Lib_Notifier_Session = {
    login: vi.fn<Tests_Lib_Notifier_Login>(async () => ((reachable['current'] === true) ? {
      action: 'LOGIN',
      info: null,
      success: true,
    } : {
      action: 'LOGIN',
      info: { message: 'Connection refused.' },
      success: false,
    })),
    logout: vi.fn<Tests_Lib_Notifier_Logout>(async () => ({
      action: 'LOGOUT',
      info: null,
      success: true,
    })),
    systemInformation: vi.fn<Tests_Lib_Notifier_SystemInformation>(async () => ({
      action: 'SYSTEM_INFORMATION',
      info: {
        architecture: 'amd64',
        operatingSystem: 'FreeBSD',
        release: '14.0-CURRENT',
      },
      success: true,
    })),
  };

  return vi.fn(() => session);
}

/**
 * Tests - Lib - Notifier - Find Target.
 *
 * Finds a destination by name in the API listing.
 * A missing destination fails the test right away.
 *
 * @param {Tests_Lib_Notifier_FindTarget_State} state - State.
 * @param {Tests_Lib_Notifier_FindTarget_Name}  name  - Name.
 *
 * @returns {Tests_Lib_Notifier_FindTarget_Returns}
 *
 * @since 2.0.0
 */
function findTarget(state: Tests_Lib_Notifier_FindTarget_State, name: Tests_Lib_Notifier_FindTarget_Name): Tests_Lib_Notifier_FindTarget_Returns {
  const target: Tests_Lib_Notifier_FindTarget_Target = state.getNotificationTargets().find((candidate) => candidate['name'] === name);

  if (target === undefined) {
    throw new Error(`The ${name} destination is missing.`);
  }

  return target;
}

describe('notifications', () => {
  beforeEach(() => {
    dataDirectory = mkdtempSync(join(tmpdir(), 'pfsense-actions-notifier-'));

    return;
  });

  afterEach(() => {
    if (dataDirectory !== undefined) {
      rmSync(dataDirectory, {
        force: true,
        recursive: true,
      });
    }

    dataDirectory = undefined;

    return;
  });

  it('sends each event only to the destinations listening for it', async () => {
    const state: Tests_Lib_Notifier_State = openState();
    const send: Tests_Lib_Notifier_Send = vi.fn(async () => ({ delivered: true as const }));
    const notifier: Notifier = new Notifier(state, { send });

    state.createNotificationTarget({
      events: ['action-failed'],
      name: 'Phone',
      secrets: { botToken: '123:abc' },
      service: 'telegram',
      settings: { chatId: '1' },
    }, 'admin');

    state.createNotificationTarget({
      events: ['wol-sent'],
      name: 'Chat',
      secrets: {},
      service: 'ntfy',
      settings: { url: 'https://ntfy.sh/alerts' },
    }, 'admin');

    notifier.notifyActionFailed('wake-on-lan', 'The pfSense command failed.');

    await vi.waitFor(() => {
      expect(findTarget(state, 'Phone')['lastAttemptAt']).not.toBeNull();

      return;
    });

    expect(send).toHaveBeenCalledTimes(1);

    expect(send).toHaveBeenCalledWith({
      key: 'pfsense-actions',
      name: 'pfSense Actions',
    }, {
      secrets: { botToken: '123:abc' },
      service: 'telegram',
      settings: { chatId: '1' },
    }, expect.objectContaining({
      event: 'action-failed',
      message: 'Wake-on-LAN failed: The pfSense command failed.',
      priority: 'default',
    }));

    expect(findTarget(state, 'Chat')['lastAttemptAt']).toBeNull();

    state.close();

    return;
  });

  it('reports pfSense down after two failed checks and up again once', async () => {
    const state: Tests_Lib_Notifier_State = openState();
    const reachable: Tests_Lib_Notifier_Reachable = { current: false };
    const send: Tests_Lib_Notifier_Send = vi.fn(async () => ({ delivered: true as const }));
    const notifier: Notifier = new Notifier(state, {
      createPfsense: createSessionFactory(reachable),
      send,
    });

    state.updateConnection({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    }, 'admin');

    state.createNotificationTarget({
      events: [
        'pfsense-unreachable',
        'pfsense-reachable',
      ],
      name: 'Phone',
      secrets: {},
      service: 'ntfy',
      settings: { url: 'https://ntfy.sh/alerts' },
    }, 'admin');

    await notifier.checkPfsense();

    expect(send).not.toHaveBeenCalled();

    await notifier.checkPfsense();

    await notifier.checkPfsense();

    expect(send).toHaveBeenCalledTimes(1);

    expect(send).toHaveBeenNthCalledWith(1, expect.anything(), expect.anything(), expect.objectContaining({
      event: 'pfsense-unreachable',
      message: 'Couldn\'t sign in to pfSense at 192.0.2.1:22 over SSH in two checks in a row. Actions fail until it answers again.',
    }));

    Reflect.set(reachable, 'current', true);

    await notifier.checkPfsense();

    await notifier.checkPfsense();

    expect(send).toHaveBeenCalledTimes(2);

    expect(send).toHaveBeenNthCalledWith(2, expect.anything(), expect.anything(), expect.objectContaining({
      event: 'pfsense-reachable',
      message: 'pfSense at 192.0.2.1:22 answered the scheduled check again.',
    }));

    state.close();

    return;
  });

  it('skips the scheduled check when no destination listens for it', async () => {
    const state: Tests_Lib_Notifier_State = openState();
    const createPfsense: Tests_Lib_Notifier_SessionFactory = createSessionFactory({ current: false });
    const notifier: Notifier = new Notifier(state, {
      createPfsense,
      send: vi.fn(async () => ({ delivered: true as const })),
    });

    state.updateConnection({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    }, 'admin');

    state.createNotificationTarget({
      events: ['wol-sent'],
      name: 'Phone',
      secrets: {},
      service: 'ntfy',
      settings: { url: 'https://ntfy.sh/alerts' },
    }, 'admin');

    await notifier.checkPfsense();

    expect(createPfsense).not.toHaveBeenCalled();

    state.close();

    return;
  });

  it('does not overlap a scheduled check that is still running', async () => {
    const state: Tests_Lib_Notifier_State = openState();
    const systemInformation: Tests_Lib_Notifier_SystemInformation = vi.fn(() => new Promise<Tests_Lib_Notifier_SystemInformationResponse>(() => {
      return;
    }));
    const session: Tests_Lib_Notifier_Session = {
      login: vi.fn<Tests_Lib_Notifier_Login>(async () => ({
        action: 'LOGIN',
        info: null,
        success: true,
      })),
      logout: vi.fn<Tests_Lib_Notifier_Logout>(async () => ({
        action: 'LOGOUT',
        info: null,
        success: true,
      })),
      systemInformation,
    };
    const createPfsense: Tests_Lib_Notifier_SessionFactory = vi.fn(() => session);
    const notifier: Notifier = new Notifier(state, { createPfsense });

    state.updateConnection({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    }, 'admin');

    state.createNotificationTarget({
      events: ['pfsense-unreachable'],
      name: 'Phone',
      secrets: {},
      service: 'ntfy',
      settings: { url: 'https://ntfy.sh/alerts' },
    }, 'admin');

    void notifier.checkPfsense();
    void notifier.checkPfsense();

    await vi.waitFor(() => {
      expect(systemInformation).toHaveBeenCalledTimes(1);

      return;
    });

    expect(systemInformation).toHaveBeenCalledWith(30_000);

    state.close();

    return;
  });

  it('reports a locked address once per window and ignores setup attempts', async () => {
    const state: Tests_Lib_Notifier_State = openState();
    const send: Tests_Lib_Notifier_Send = vi.fn(async () => ({ delivered: true as const }));
    const notifier: Notifier = new Notifier(state, { send });

    state.createNotificationTarget({
      events: ['sign-in-locked'],
      name: 'Phone',
      secrets: {},
      service: 'ntfy',
      settings: { url: 'https://ntfy.sh/alerts' },
    }, 'admin');

    notifier.notifySignInLimit('sign-in:198.51.100.7');

    notifier.notifySignInLimit('sign-in:198.51.100.7');

    notifier.notifySignInLimit('setup:198.51.100.8');

    await vi.waitFor(() => {
      expect(send).toHaveBeenCalledTimes(1);

      return;
    });

    expect(send).toHaveBeenNthCalledWith(1, expect.anything(), expect.anything(), expect.objectContaining({
      details: { address: '198.51.100.7' },
      event: 'sign-in-locked',
      message: 'Ten failed sign-ins from 198.51.100.7. Sign-in from it is paused for 15 minutes.',
    }));

    state.close();

    return;
  });

  it('pauses destinations whose secrets a lost key removed until they are entered again', () => {
    const state: Tests_Lib_Notifier_State = openState();
    const phone: Tests_Lib_Notifier_CreatedTarget = state.createNotificationTarget({
      events: [
        'secrets-removed',
        'action-failed',
      ],
      name: 'Phone',
      secrets: { botToken: '123:abc' },
      service: 'telegram',
      settings: { chatId: '1' },
    }, 'admin');
    const optionalToken: Tests_Lib_Notifier_CreatedTarget = state.createNotificationTarget({
      events: ['action-failed'],
      name: 'Optional token',
      secrets: { token: 'ntfy-secret' },
      service: 'ntfy',
      settings: { url: 'https://ntfy.sh/optional' },
    }, 'admin');

    state.createNotificationTarget({
      events: ['secrets-removed'],
      name: 'Chat',
      secrets: {},
      service: 'ntfy',
      settings: { url: 'https://ntfy.sh/alerts' },
    }, 'admin');

    state.close();

    rmSync(join(getDataDirectory(), 'keys', 'installation.key'));

    if (phone === undefined || optionalToken === undefined) {
      throw new Error('The notification destinations were not created.');
    }

    const reopenedState: Tests_Lib_Notifier_State = openState();
    const phoneId: Tests_Lib_Notifier_TargetId = phone['id'];
    const optionalTokenId: Tests_Lib_Notifier_TargetId = optionalToken['id'];

    expect(reopenedState.getKeyReplacement()).toEqual([
      'the Optional token notification',
      'the Phone notification',
    ]);

    expect(reopenedState.getNotificationTargets().find((target) => target['id'] === phoneId)).toEqual(expect.objectContaining({
      secrets: {},
      secretsMissing: ['botToken'],
      settings: { chatId: '1' },
    }));

    expect(reopenedState.getRemovedSecrets('nobody')).toEqual([
      {
        kind: 'notification',
        name: 'Optional token',
        notificationId: optionalTokenId,
        removedAt: expect.any(String),
      },
      {
        kind: 'notification',
        name: 'Phone',
        notificationId: phoneId,
        removedAt: expect.any(String),
      },
    ]);

    expect(reopenedState.getNotificationDeliveries('secrets-removed').map((delivery) => delivery['name'])).toEqual(['Chat']);

    expect(reopenedState.getNotificationDelivery(phoneId)).toBe('secrets-missing');

    expect(reopenedState.getNotificationDelivery(optionalTokenId)).toBe('secrets-missing');

    expect(reopenedState.updateNotificationTarget(optionalTokenId, {
      events: ['action-failed'],
      name: 'Optional token',
      clearSecrets: ['token'],
      secrets: {},
      settings: { url: 'https://ntfy.sh/optional' },
    }, 'admin')).toEqual(expect.objectContaining({
      secrets: {},
      secretsMissing: [],
    }));

    expect(reopenedState.getNotificationDelivery(optionalTokenId)).toEqual(expect.objectContaining({
      target: expect.objectContaining({ secrets: {} }),
    }));

    expect(reopenedState.getRemovedSecrets('nobody')).toEqual([expect.objectContaining({
      notificationId: phoneId,
    })]);

    reopenedState.updateNotificationTarget(phoneId, {
      events: [
        'secrets-removed',
        'action-failed',
      ],
      name: 'Phone',
      secrets: { botToken: '456:def' },
      settings: { chatId: '1' },
    }, 'admin');

    expect(reopenedState.getRemovedSecrets('nobody')).toEqual([]);

    expect(reopenedState.getNotificationDelivery(phoneId)).toEqual(expect.objectContaining({
      target: {
        secrets: { botToken: '456:def' },
        service: 'telegram',
        settings: { chatId: '1' },
      },
    }));

    reopenedState.close();

    return;
  });

  return;
});
