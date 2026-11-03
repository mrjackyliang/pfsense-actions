import {
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { textEncryptionKey } from '@/lib/regex.js';
import { Runner as State } from '@/lib/state.js';
import { generateTotpSecret } from '@/lib/totp.js';

import type {
  Tests_Lib_State_Administrator,
  Tests_Lib_State_Challenge,
  Tests_Lib_State_ClaimResult,
  Tests_Lib_State_CreateClaimedState_Returns,
  Tests_Lib_State_CreatedToken,
  Tests_Lib_State_CreateEnvironment_Overrides,
  Tests_Lib_State_CreateEnvironment_Returns,
  Tests_Lib_State_Database,
  Tests_Lib_State_DataDirectory,
  Tests_Lib_State_GetDataDirectory_Returns,
  Tests_Lib_State_KeyPath,
  Tests_Lib_State_Mode,
  Tests_Lib_State_OldKey,
  Tests_Lib_State_RecoveryCodes,
  Tests_Lib_State_Secret,
  Tests_Lib_State_Session,
  Tests_Lib_State_SetupClaim,
  Tests_Lib_State_State,
  Tests_Lib_State_Token,
  Tests_Lib_State_TokenId,
} from '@/types/tests/lib/state.test.d.ts';

/**
 * Tests - Lib - State - Data Directory.
 *
 * Points each test at an isolated operating-system temporary directory.
 * Cleanup never targets a repository or shared application directory.
 *
 * @since 2.0.0
 */
let dataDirectory: Tests_Lib_State_DataDirectory = undefined;

/**
 * Tests - Lib - State - Get Data Directory.
 *
 * Narrows the lifecycle-owned temporary path before a fixture can use it.
 * A missing setup hook fails loudly instead of falling back to a broad path.
 *
 * @returns {Tests_Lib_State_GetDataDirectory_Returns}
 *
 * @since 2.0.0
 */
function getDataDirectory(): Tests_Lib_State_GetDataDirectory_Returns {
  if (dataDirectory === undefined) {
    throw new Error('The state test data directory is not initialized.');
  }

  return dataDirectory;
}

/**
 * Tests - Lib - State - Create Environment.
 *
 * Builds a fresh-container environment with no bootstrap values by default.
 * Overrides add SSH, token, or key values for focused cases.
 *
 * @param {Tests_Lib_State_CreateEnvironment_Overrides} overrides - Overrides.
 *
 * @returns {Tests_Lib_State_CreateEnvironment_Returns}
 *
 * @since 2.0.0
 */
function createEnvironment(overrides: Tests_Lib_State_CreateEnvironment_Overrides = {}): Tests_Lib_State_CreateEnvironment_Returns {
  return {
    adminWebauthnRpName: 'pfSense Actions',
    dataDirectory: getDataDirectory(),
    port: 22603,
    ...overrides,
  };
}

/**
 * Tests - Lib - State - Create Claimed State.
 *
 * Opens a fresh database and creates the administrator with the printed setup code.
 * Sign-in tests start from the same account the console's setup screen creates.
 *
 * @returns {Tests_Lib_State_CreateClaimedState_Returns}
 *
 * @since 2.0.0
 */
function createClaimedState(): Tests_Lib_State_CreateClaimedState_Returns {
  const state: Tests_Lib_State_State = new State(createEnvironment());
  const setupClaim: Tests_Lib_State_SetupClaim = state.prepareSetupClaim();

  if (setupClaim === undefined) {
    throw new Error('A fresh installation did not issue a setup code.');
  }

  state.claimInstallation(setupClaim['code'], 'admin', 'fixture-admin-password');

  return state;
}

describe('first-run setup', () => {
  beforeEach(() => {
    dataDirectory = mkdtempSync(join(tmpdir(), 'pfsense-actions-state-'));

    return;
  });

  afterEach(() => {
    rmSync(getDataDirectory(), {
      force: true,
      recursive: true,
    });

    dataDirectory = undefined;

    return;
  });

  it('starts without an account and keeps a generated key beside the data', () => {
    const state: Tests_Lib_State_State = new State(createEnvironment());
    const keyPath: Tests_Lib_State_KeyPath = join(getDataDirectory(), 'keys', 'installation.key');
    const keyMode: Tests_Lib_State_Mode = (statSync(keyPath).mode % 512).toString(8);
    const databaseMode: Tests_Lib_State_Mode = (statSync(join(getDataDirectory(), 'pfsense-actions.sqlite3')).mode % 512).toString(8);

    expect(state.hasAdministrator()).toBe(false);

    expect(state.hasConnection()).toBe(false);

    expect(state.getConnection()).toBeUndefined();

    expect(state.getSetupStatus()).toEqual({
      claimRequired: true,
    });

    expect(readFileSync(keyPath, 'utf8').trim()).toMatch(textEncryptionKey);

    expect(keyMode).toBe('600');

    expect(databaseMode).toBe('600');

    state.updateConnection({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    }, 'admin');

    state.close();

    const reopenedState: Tests_Lib_State_State = new State(createEnvironment());

    expect(reopenedState.getPfsenseConnection()).toEqual({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    });

    reopenedState.close();

    return;
  });

  it('claims the installation once with the printed setup code', () => {
    const state: Tests_Lib_State_State = new State(createEnvironment());
    const setupClaim: Tests_Lib_State_SetupClaim = state.prepareSetupClaim();

    if (setupClaim === undefined) {
      throw new Error('A fresh installation did not issue a setup code.');
    }

    expect(state.getSetupStatus()).toEqual({
      claimExpiresAt: setupClaim['expiresAt'],
      claimRequired: true,
    });

    expect(state.claimInstallation('AAAAA-BBBBB-CCCCC', 'admin', 'fixture-admin-password')).toBe('invalid');

    const result: Tests_Lib_State_ClaimResult = state.claimInstallation(setupClaim['code'].toLowerCase().replaceAll('-', ''), 'admin', 'fixture-admin-password');

    expect(result).toEqual(expect.objectContaining({
      username: 'admin',
    }));

    expect(state.claimInstallation(setupClaim['code'], 'intruder', 'fixture-admin-password')).toBe('invalid');

    expect(state.getSetupStatus()).toEqual({
      claimRequired: false,
    });

    expect(state.prepareSetupClaim()).toBeUndefined();

    expect(state.authenticateAdministrator('ADMIN', 'fixture-admin-password')).toEqual(expect.objectContaining({
      username: 'admin',
    }));

    state.close();

    return;
  });

  it('creates the connection from optional environment values once', () => {
    const state: Tests_Lib_State_State = new State(createEnvironment({
      pfsensePrivateKey: 'fixture-private-key',
      pfsenseSshIp: '192.0.2.1',
      pfsenseUsername: 'fixture-user',
    }));

    expect(state.hasAdministrator()).toBe(false);

    expect(state.getEnvironmentImports()).toEqual({
      connection: true,
    });

    expect(state.prepareSetupClaim()).toBeDefined();

    expect(state.getConnection()).toEqual({
      credentialSaved: true,
      credentialType: 'privateKey',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    });

    state.close();

    const reopenedState: Tests_Lib_State_State = new State(createEnvironment({
      pfsensePassword: 'changed-password',
      pfsenseSshIp: '192.0.2.9',
      pfsenseUsername: 'changed-user',
    }));

    expect(reopenedState.getEnvironmentImports()).toEqual({
      connection: false,
    });

    expect(reopenedState.getConnection()).toEqual(expect.objectContaining({
      pfsenseSshIp: '192.0.2.1',
    }));

    reopenedState.close();

    return;
  });

  it('makes a new key and removes what the old one locked when the key file is missing', () => {
    const state: Tests_Lib_State_State = createClaimedState();
    const administrator: Tests_Lib_State_Administrator = state.getAdministrator();
    const keyPath: Tests_Lib_State_KeyPath = join(getDataDirectory(), 'keys', 'installation.key');
    const oldKey: Tests_Lib_State_OldKey = readFileSync(keyPath, 'utf8');

    if (administrator === undefined) {
      throw new Error('The setup code did not create the administrator.');
    }

    state.enableTotp(administrator['id'], generateTotpSecret(), 1, 'admin');

    state.updateConnection({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    }, 'admin');

    state.close();

    rmSync(keyPath);

    const reopenedState: Tests_Lib_State_State = new State(createEnvironment());

    expect(readFileSync(keyPath, 'utf8').trim()).toMatch(textEncryptionKey);

    expect(readFileSync(keyPath, 'utf8')).not.toBe(oldKey);

    expect(reopenedState.getKeyReplacement()).toEqual([
      'the pfSense password',
      'the authenticator app for admin',
    ]);

    expect(reopenedState.getConnection()).toEqual({
      credentialSaved: false,
      credentialType: 'password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    });

    expect(reopenedState.getPfsenseConnection()).toBeUndefined();

    expect(reopenedState.buildConnection({
      credentialType: 'password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    })).toBeUndefined();

    expect(reopenedState.getAdministratorSecurity(administrator['id'])).toEqual(expect.objectContaining({
      recoveryCodesRemaining: 0,
      totpEnabled: false,
    }));

    expect(reopenedState.getRemovedSecrets(administrator['id'])).toEqual([
      {
        kind: 'authenticator',
        removedAt: expect.any(String),
      },
      {
        credentialType: 'password',
        kind: 'pfsense-credential',
        removedAt: expect.any(String),
      },
    ]);

    expect(reopenedState.getActivity(10)).toEqual(expect.arrayContaining([expect.objectContaining({
      action: 'encryption-key-replaced',
    })]));

    expect(reopenedState.authenticateAdministrator('admin', 'fixture-admin-password')).toEqual(expect.objectContaining({
      username: 'admin',
    }));

    reopenedState.updateConnection({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    }, 'admin');

    expect(reopenedState.getRemovedSecrets(administrator['id'])).toEqual([expect.objectContaining({
      kind: 'authenticator',
    })]);

    reopenedState.enableTotp(administrator['id'], generateTotpSecret(), 1, 'admin');

    expect(reopenedState.getRemovedSecrets(administrator['id'])).toEqual([]);

    reopenedState.close();

    const restartedState: Tests_Lib_State_State = new State(createEnvironment());

    expect(restartedState.getKeyReplacement()).toEqual([]);

    expect(restartedState.getPfsenseConnection()).toEqual(expect.objectContaining({
      pfsensePassword: 'fixture-password',
    }));

    restartedState.close();

    return;
  });

  it('keeps the notice until it is dismissed', () => {
    const state: Tests_Lib_State_State = createClaimedState();
    const administrator: Tests_Lib_State_Administrator = state.getAdministrator();

    if (administrator === undefined) {
      throw new Error('The setup code did not create the administrator.');
    }

    state.enableTotp(administrator['id'], generateTotpSecret(), 1, 'admin');

    state.close();

    rmSync(join(getDataDirectory(), 'keys', 'installation.key'));

    new State(createEnvironment()).close();

    const reopenedState: Tests_Lib_State_State = new State(createEnvironment());

    expect(reopenedState.getRemovedSecrets(administrator['id'])).toHaveLength(1);

    reopenedState.dismissRemovedSecrets(administrator['id']);

    expect(reopenedState.getRemovedSecrets(administrator['id'])).toEqual([]);

    reopenedState.close();

    return;
  });

  it('refills a removed credential from the deprecated SSH variables', () => {
    const state: Tests_Lib_State_State = new State(createEnvironment({
      pfsensePrivateKey: 'fixture-private-key',
      pfsenseSshIp: '192.0.2.1',
      pfsenseUsername: 'fixture-user',
    }));
    const keyPath: Tests_Lib_State_KeyPath = join(getDataDirectory(), 'keys', 'installation.key');

    state.close();

    rmSync(keyPath);

    const reopenedState: Tests_Lib_State_State = new State(createEnvironment({
      pfsensePrivateKey: 'fixture-private-key',
      pfsenseSshIp: '192.0.2.1',
      pfsenseUsername: 'fixture-user',
    }));

    expect(reopenedState.getPfsenseConnection()).toEqual(expect.objectContaining({
      pfsensePrivateKey: 'fixture-private-key',
    }));

    expect(reopenedState.getEnvironmentImports()).toEqual(expect.objectContaining({
      connection: true,
    }));

    reopenedState.close();

    return;
  });

  it('stops on a key file from another database or a damaged one', () => {
    const state: Tests_Lib_State_State = new State(createEnvironment());
    const keyPath: Tests_Lib_State_KeyPath = join(getDataDirectory(), 'keys', 'installation.key');

    state.updateConnection({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    }, 'admin');

    state.close();

    writeFileSync(keyPath, `${'b'.repeat(64)}\n`);

    expect(() => new State(createEnvironment())).toThrow('doesn\'t belong to this database');

    writeFileSync(keyPath, 'not a key\n');

    expect(() => new State(createEnvironment())).toThrow('is not 64 hexadecimal characters');

    return;
  });

  return;
});

describe('sign-in state', () => {
  beforeEach(() => {
    dataDirectory = mkdtempSync(join(tmpdir(), 'pfsense-actions-state-'));

    return;
  });

  afterEach(() => {
    rmSync(getDataDirectory(), {
      force: true,
      recursive: true,
    });

    dataDirectory = undefined;

    return;
  });

  it('keeps browser sessions across restarts until they are signed out', () => {
    const state: Tests_Lib_State_State = createClaimedState();
    const administrator: Tests_Lib_State_Administrator = state.getAdministrator();

    if (administrator === undefined) {
      throw new Error('The setup code did not create the administrator.');
    }

    const firstSession: Tests_Lib_State_Session = state.createSession(administrator['id']);
    const secondSession: Tests_Lib_State_Session = state.createSession(administrator['id']);

    state.close();

    const reopenedState: Tests_Lib_State_State = new State(createEnvironment());

    expect(reopenedState.getSession(firstSession['sessionToken'])).toEqual(expect.objectContaining({
      administratorId: administrator['id'],
      id: firstSession['sessionId'],
      username: 'admin',
    }));

    expect(reopenedState.getSession('pfs_unknown')).toBeUndefined();

    reopenedState.changeAdministratorPassword(administrator['id'], 'a new fixture password', firstSession['sessionId'], 'admin');

    expect(reopenedState.getSession(firstSession['sessionToken'])).toBeDefined();

    expect(reopenedState.getSession(secondSession['sessionToken'])).toBeUndefined();

    expect(reopenedState.authenticateAdministrator('admin', 'fixture-admin-password')).toBeUndefined();

    expect(reopenedState.authenticateAdministrator('admin', 'a new fixture password')).toBeDefined();

    reopenedState.deleteSession(firstSession['sessionId']);

    expect(reopenedState.getSession(firstSession['sessionToken'])).toBeUndefined();

    reopenedState.close();

    return;
  });

  it('turns the authenticator on with single-use recovery codes and rejects replay', () => {
    const state: Tests_Lib_State_State = createClaimedState();
    const administrator: Tests_Lib_State_Administrator = state.getAdministrator();
    const secret: Tests_Lib_State_Secret = generateTotpSecret();

    if (administrator === undefined) {
      throw new Error('The setup code did not create the administrator.');
    }

    state.startTotpEnrollment(administrator['id'], secret);

    expect(state.getTotpEnrollment(administrator['id'])).toBe(secret);

    const recoveryCodes: Tests_Lib_State_RecoveryCodes = state.enableTotp(administrator['id'], secret, 100, 'admin');

    if (recoveryCodes === undefined) {
      throw new Error('Turning on the authenticator returned no recovery codes.');
    }

    expect(recoveryCodes).toHaveLength(10);

    expect(state.getTotpEnrollment(administrator['id'])).toBeUndefined();

    expect(state.getAdministratorSecurity(administrator['id'])).toEqual(expect.objectContaining({
      recoveryCodesRemaining: 10,
      totpEnabled: true,
    }));

    expect(state.consumeRecoveryCode(administrator['id'], ` ${(recoveryCodes[0] ?? '').toLowerCase()} `)).toBe(true);

    expect(state.consumeRecoveryCode(administrator['id'], recoveryCodes[0] ?? '')).toBe(false);

    expect(state.getAdministratorSecurity(administrator['id'])['recoveryCodesRemaining']).toBe(9);

    expect(state.verifyTotp(administrator['id'], '000000', 100 * 30_000)).toBe(false);

    expect(state.replaceRecoveryCodes(administrator['id'], 'admin')).toHaveLength(10);

    expect(state.consumeRecoveryCode(administrator['id'], recoveryCodes[1] ?? '')).toBe(false);

    expect(state.disableTotp(administrator['id'], 'admin')).toBe('disabled');

    expect(state.getAdministratorSecurity(administrator['id'])).toEqual(expect.objectContaining({
      recoveryCodesRemaining: 0,
      totpEnabled: false,
    }));

    state.close();

    return;
  });

  it('discards a second-factor challenge after five wrong codes', () => {
    const state: Tests_Lib_State_State = createClaimedState();
    const administrator: Tests_Lib_State_Administrator = state.getAdministrator();

    if (administrator === undefined) {
      throw new Error('The setup code did not create the administrator.');
    }

    const challenge: Tests_Lib_State_Challenge = state.createSignInChallenge(administrator['id']);

    expect(state.getSignInChallenge(challenge['challenge'])).toEqual({
      administratorId: administrator['id'],
    });

    for (let failure = 0; failure < 5; failure += 1) {
      state.recordSignInChallengeFailure(challenge['challenge']);
    }

    expect(state.getSignInChallenge(challenge['challenge'])).toBeUndefined();

    state.close();

    return;
  });

  it('stores passkeys with their hostname and uses each ceremony once', () => {
    const state: Tests_Lib_State_State = createClaimedState();
    const administrator: Tests_Lib_State_Administrator = state.getAdministrator();

    if (administrator === undefined) {
      throw new Error('The setup code did not create the administrator.');
    }

    expect(state.createPasskey(administrator['id'], 'MacBook', 'actions.example.net', {
      backedUp: true,
      counter: 0,
      deviceType: 'multiDevice',
      id: 'credential-one',
      publicKey: new Uint8Array([
        1,
        2,
        3,
      ]),
      transports: ['internal'],
    }, 'admin')).toBe('created');

    expect(state.getAdministratorSecurity(administrator['id'])['passkeys']).toEqual([expect.objectContaining({
      hostname: 'actions.example.net',
      id: 'credential-one',
      lastUsedAt: null,
      name: 'MacBook',
    })]);

    expect(state.updatePasskeyUsage('credential-one', 1, 'multiDevice', true, 'actions.example.net')).toBe('updated');

    expect(state.updatePasskeyUsage('credential-one', 1, 'multiDevice', true, 'actions.example.net')).toBe('updated');

    expect(state.getPasskey('credential-one')).toEqual(expect.objectContaining({
      counter: 1,
      rpId: 'actions.example.net',
    }));

    const ceremonyId: Tests_Lib_State_Token = state.createWebauthnCeremony({
      challenge: 'fixture-challenge',
      kind: 'authentication',
      origin: 'https://actions.example.net',
      rpId: 'actions.example.net',
    });

    expect(state.takeWebauthnCeremony(ceremonyId, 'registration')).toBeUndefined();

    expect(state.takeWebauthnCeremony(ceremonyId, 'authentication')).toEqual({
      challenge: 'fixture-challenge',
      origin: 'https://actions.example.net',
      rpId: 'actions.example.net',
    });

    expect(state.takeWebauthnCeremony(ceremonyId, 'authentication')).toBeUndefined();

    expect(state.removePasskey(administrator['id'], 'credential-one', 'admin')).toBe('removed');

    expect(state.removePasskey(administrator['id'], 'credential-one', 'admin')).toBe('not-found');

    state.close();

    return;
  });

  it('reads passkeys at the accepted 80-character name limit', () => {
    const state: Tests_Lib_State_State = createClaimedState();
    const administrator: Tests_Lib_State_Administrator = state.getAdministrator();

    if (administrator === undefined) {
      throw new Error('The setup code did not create the administrator.');
    }

    expect(state.createPasskey(administrator['id'], 'P'.repeat(80), 'actions.example.net', {
      backedUp: true,
      counter: 0,
      deviceType: 'multiDevice',
      id: 'credential-long-name',
      publicKey: new Uint8Array([
        1,
        2,
        3,
      ]),
      transports: ['internal'],
    }, 'admin')).toBe('created');

    expect(state.getAdministratorSecurity(administrator['id'])['passkeys']).toEqual([expect.objectContaining({
      name: 'P'.repeat(80),
    })]);

    state.close();

    return;
  });

  return;
});

describe('console state', () => {
  beforeEach(() => {
    dataDirectory = mkdtempSync(join(tmpdir(), 'pfsense-actions-state-'));

    return;
  });

  afterEach(() => {
    rmSync(getDataDirectory(), {
      force: true,
      recursive: true,
    });

    dataDirectory = undefined;

    return;
  });

  it('applies token lifecycle changes immediately and records last use', () => {
    const state: Tests_Lib_State_State = new State(createEnvironment());
    const createdToken: Tests_Lib_State_CreatedToken = state.createToken({
      name: 'Home Assistant',
      scopes: [
        'wol:execute',
        'pfsense:read',
      ],
    }, 'admin');

    if (createdToken === undefined) {
      throw new Error('The token was not created.');
    }

    const tokenId: Tests_Lib_State_TokenId = createdToken['token']['id'];

    expect(tokenId.startsWith('tok-')).toBe(true);

    expect(tokenId).toHaveLength(20);

    expect(createdToken['token']).toEqual({
      createdAt: expect.any(String),
      expiresAt: null,
      id: tokenId,
      lastUsedAt: null,
      name: 'Home Assistant',
      scopes: [
        'pfsense:read',
        'wol:execute',
      ],
    });

    expect(state.createToken({
      name: 'home assistant',
      scopes: ['wol:execute'],
    }, 'admin')).toBeUndefined();

    expect(readFileSync(join(getDataDirectory(), 'pfsense-actions.sqlite3')).includes(createdToken['personalAccessToken'])).toBe(false);

    expect(state.authenticateToken(createdToken['personalAccessToken'])).toEqual({
      id: tokenId,
      name: 'Home Assistant',
      scopes: [
        'pfsense:read',
        'wol:execute',
      ],
    });

    expect(state.getTokens()).toEqual([expect.objectContaining({
      id: tokenId,
      lastUsedAt: expect.any(String),
    })]);

    const otherToken: Tests_Lib_State_CreatedToken = state.createToken({
      name: 'Backup script',
      scopes: ['wol:execute'],
    }, 'admin');

    if (otherToken === undefined) {
      throw new Error('The second token was not created.');
    }

    const database: Tests_Lib_State_Database = new DatabaseSync(join(getDataDirectory(), 'pfsense-actions.sqlite3'));

    database.prepare('UPDATE api_tokens SET created_at = ? WHERE id = ?').run('2026-01-01T00:00:00.000Z', tokenId);

    database.close();

    expect(state.getTokens().map((token) => token['name'])).toEqual([
      'Backup script',
      'Home Assistant',
    ]);

    expect(state.updateToken(tokenId, {
      name: 'BACKUP SCRIPT',
      scopes: ['pfsense:read'],
    }, 'admin')).toBe('name-taken');

    expect(state.updateToken(tokenId, {
      expiresAt: '2099-01-01T00:00:00.000Z',
      name: 'home assistant',
      scopes: ['pfsense:read'],
    }, 'admin')).toEqual(expect.objectContaining({
      expiresAt: '2099-01-01T00:00:00.000Z',
      id: tokenId,
      name: 'home assistant',
      scopes: ['pfsense:read'],
    }));

    expect(state.updateToken(tokenId, {
      name: 'Home Assistant',
      scopes: ['pfsense:read'],
    }, 'admin')).toEqual(expect.objectContaining({
      expiresAt: '2099-01-01T00:00:00.000Z',
      name: 'Home Assistant',
    }));

    expect(state.updateToken(tokenId, {
      expiresAt: null,
      name: 'Home Assistant',
      scopes: ['pfsense:read'],
    }, 'admin')).toEqual(expect.objectContaining({
      expiresAt: null,
    }));

    expect(state.authenticateToken(createdToken['personalAccessToken'])).toEqual(expect.objectContaining({
      name: 'Home Assistant',
      scopes: ['pfsense:read'],
    }));

    expect(state.removeToken(tokenId, 'admin')).toBe('removed');

    expect(state.authenticateToken(createdToken['personalAccessToken'])).toBeUndefined();

    expect(state.removeToken(tokenId, 'admin')).toBe('not-found');

    expect(state.getActivity(20).map((event) => event['summary'])).toEqual(expect.arrayContaining([
      'Created personal access token Home Assistant',
      'Updated personal access token home assistant',
      'Revoked personal access token Home Assistant',
    ]));

    state.close();

    return;
  });

  it('keeps a saved credential unless the method changes or none exists yet', () => {
    const state: Tests_Lib_State_State = new State(createEnvironment());

    expect(state.buildConnection({
      credentialType: 'password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    })).toBeUndefined();

    state.updateConnection({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    }, 'admin');

    expect(state.buildConnection({
      credentialType: 'password',
      pfsenseSshIp: '192.0.2.3',
      pfsenseSshPort: 2222,
      pfsenseUsername: 'other-user',
    })).toEqual({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.3',
      pfsenseSshPort: 2222,
      pfsenseUsername: 'other-user',
    });

    expect(state.buildConnection({
      credentialType: 'privateKey',
      pfsenseSshIp: '192.0.2.3',
      pfsenseSshPort: 2222,
      pfsenseUsername: 'other-user',
    })).toBeUndefined();

    state.close();

    return;
  });

  return;
});
