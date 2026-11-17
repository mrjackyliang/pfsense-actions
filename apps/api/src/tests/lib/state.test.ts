import {
  existsSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmdirSync,
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

import {
  generatePersonalAccessToken,
  hashPersonalAccessToken,
} from '@/lib/auth.js';
import { textEncryptionKey } from '@/lib/regex.js';
import { Runner as State } from '@/lib/state.js';
import { generateTotpSecret } from '@/lib/totp.js';

import type {
  Tests_Lib_State_Administrator,
  Tests_Lib_State_BackupDocument,
  Tests_Lib_State_BackupImportResult,
  Tests_Lib_State_Challenge,
  Tests_Lib_State_ClaimResult,
  Tests_Lib_State_CreateClaimedState_Returns,
  Tests_Lib_State_CreatedToken,
  Tests_Lib_State_CreateEnvironment_Overrides,
  Tests_Lib_State_CreateEnvironment_Returns,
  Tests_Lib_State_CreateEnvironment_StateDirectory,
  Tests_Lib_State_Database,
  Tests_Lib_State_DatabaseDirectory,
  Tests_Lib_State_DatabasePath,
  Tests_Lib_State_DataDirectory,
  Tests_Lib_State_GetDataDirectory_Returns,
  Tests_Lib_State_KeyFile,
  Tests_Lib_State_KeyPath,
  Tests_Lib_State_LegacyDatabasePath,
  Tests_Lib_State_Mode,
  Tests_Lib_State_NotificationTarget,
  Tests_Lib_State_OldKey,
  Tests_Lib_State_OriginalKey,
  Tests_Lib_State_PersonalAccessToken,
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
  const stateDirectory: Tests_Lib_State_CreateEnvironment_StateDirectory = getDataDirectory();

  return {
    adminWebauthnRpName: 'pfSense Actions',
    dataDirectory: stateDirectory,
    databaseDirectory: join(stateDirectory, 'database'),
    installationKeyFile: join(stateDirectory, 'keys', 'installation.key'),
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

  it('starts without an account and creates the contract state layout', () => {
    const state: Tests_Lib_State_State = new State(createEnvironment());
    const keyPath: Tests_Lib_State_KeyPath = join(getDataDirectory(), 'keys', 'installation.key');
    const keyFile: Tests_Lib_State_KeyFile = readFileSync(keyPath, 'utf8');
    const keyMode: Tests_Lib_State_Mode = (statSync(keyPath).mode % 512).toString(8);
    const databaseMode: Tests_Lib_State_Mode = (statSync(join(getDataDirectory(), 'database', 'pfsense-actions.sqlite3')).mode % 512).toString(8);

    expect(state.hasAdministrator()).toBe(false);

    expect(state.hasConnection()).toBe(false);

    expect(state.getConnection()).toBeUndefined();

    expect(state.getSetupStatus()).toEqual({
      claimRequired: true,
    });

    expect(keyFile.trim()).toMatch(textEncryptionKey);

    expect(keyFile).toBe(`${keyFile.trim().toLowerCase()}\n`);

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

  it('moves the old flat database without changing encrypted state', () => {
    const state: Tests_Lib_State_State = new State(createEnvironment());

    state.updateConnection({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    }, 'admin');

    state.close();

    const databaseDirectory: Tests_Lib_State_DatabaseDirectory = join(getDataDirectory(), 'database');
    const databasePath: Tests_Lib_State_DatabasePath = join(databaseDirectory, 'pfsense-actions.sqlite3');
    const legacyDatabasePath: Tests_Lib_State_LegacyDatabasePath = join(getDataDirectory(), 'pfsense-actions.sqlite3');

    renameSync(databasePath, legacyDatabasePath);

    rmdirSync(databaseDirectory);

    const reopenedState: Tests_Lib_State_State = new State(createEnvironment());

    expect(existsSync(legacyDatabasePath)).toBe(false);

    expect(existsSync(databasePath)).toBe(true);

    expect(reopenedState.getPfsenseConnection()).toEqual({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    });

    reopenedState.close();

    return;
  });

  it('refuses to overwrite a contract database with an old flat database', () => {
    const state: Tests_Lib_State_State = new State(createEnvironment());

    state.close();

    const databasePath: Tests_Lib_State_DatabasePath = join(getDataDirectory(), 'database', 'pfsense-actions.sqlite3');
    const legacyDatabasePath: Tests_Lib_State_LegacyDatabasePath = join(getDataDirectory(), 'pfsense-actions.sqlite3');

    writeFileSync(legacyDatabasePath, 'legacy database');

    expect(() => new State(createEnvironment())).toThrow('will not overwrite either layout');

    expect(readFileSync(legacyDatabasePath, 'utf8')).toBe('legacy database');

    expect(existsSync(databasePath)).toBe(true);

    return;
  });

  it('normalizes a legacy textual key without changing its bytes', () => {
    const state: Tests_Lib_State_State = new State(createEnvironment());
    const keyPath: Tests_Lib_State_KeyPath = join(getDataDirectory(), 'keys', 'installation.key');

    state.updateConnection({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    }, 'admin');

    state.close();

    const originalKey: Tests_Lib_State_OriginalKey = readFileSync(keyPath, 'utf8').trim();

    writeFileSync(keyPath, originalKey.toUpperCase());

    const reopenedState: Tests_Lib_State_State = new State(createEnvironment());

    expect(readFileSync(keyPath, 'utf8')).toBe(`${originalKey}\n`);

    expect(reopenedState.getPfsenseConnection()).toEqual(expect.objectContaining({
      pfsensePassword: 'fixture-password',
    }));

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

  it('keeps debug logging across restarts and records each change', () => {
    const state: Tests_Lib_State_State = new State(createEnvironment());

    expect(state.getDebugLogging()).toBe(false);

    state.setDebugLogging(true, 'admin');

    state.close();

    const reopenedState: Tests_Lib_State_State = new State(createEnvironment());

    expect(reopenedState.getDebugLogging()).toBe(true);

    expect(reopenedState.getActivity(5)).toEqual(expect.arrayContaining([expect.objectContaining({
      action: 'debug-logging-updated',
      category: 'configuration',
      outcome: 'succeeded',
      summary: 'Turned debug logging on',
    })]));

    reopenedState.setDebugLogging(false, 'admin');

    expect(reopenedState.getDebugLogging()).toBe(false);

    reopenedState.close();

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

    expect(readFileSync(join(getDataDirectory(), 'database', 'pfsense-actions.sqlite3')).includes(createdToken['personalAccessToken'])).toBe(false);

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

    const database: Tests_Lib_State_Database = new DatabaseSync(join(getDataDirectory(), 'database', 'pfsense-actions.sqlite3'));

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

  it('exports selected configuration with secrets and excludes account data', () => {
    const state: Tests_Lib_State_State = createClaimedState();
    const administrator: Tests_Lib_State_Administrator = state.getAdministrator();

    if (administrator === undefined) {
      throw new Error('The setup code did not create the administrator.');
    }

    state.updateConnection({
      pfsensePassword: 'portable-pfsense-password',
      pfsenseSshIp: '192.0.2.40',
      pfsenseSshPort: 2222,
      pfsenseUsername: 'portable-operator',
    }, 'admin');

    state.createNotificationTarget({
      events: ['action-failed'],
      name: 'Portable Discord',
      secrets: { webhookUrl: 'https://discord.com/api/webhooks/123/portable-secret' },
      service: 'discord',
      settings: {},
    }, 'admin');

    const createdToken: Tests_Lib_State_CreatedToken = state.createToken({
      expiresAt: '2099-01-01T00:00:00.000Z',
      name: 'Portable token',
      scopes: [
        'pfsense:read',
        'wol:execute',
      ],
    }, 'admin');

    if (createdToken === undefined) {
      throw new Error('The portable token was not created.');
    }

    const totpSecret: Tests_Lib_State_Secret = generateTotpSecret();
    const recoveryCodes: Tests_Lib_State_RecoveryCodes = state.enableTotp(administrator['id'], totpSecret, 1, 'admin');
    const session: Tests_Lib_State_Session = state.createSession(administrator['id']);

    if (recoveryCodes === undefined) {
      throw new Error('The authenticator fixture was not enabled.');
    }

    state.recordActivity('admin', 'backup-export-sentinel', 'access', 'succeeded', 'Account-only export sentinel');

    const document: Tests_Lib_State_BackupDocument = state.createBackupDocument({
      accessTokens: true,
      connection: true,
      notifications: true,
    }, '2.0.0-test');
    const serialized: Tests_Lib_State_Secret = JSON.stringify(document);

    expect(document).toEqual(expect.objectContaining({
      accessTokens: [expect.objectContaining({
        name: 'Portable token',
        tokenHash: hashPersonalAccessToken(createdToken['personalAccessToken']),
      })],
      appVersion: '2.0.0-test',
      connection: expect.objectContaining({
        credential: 'portable-pfsense-password',
        credentialType: 'password',
      }),
      format: 'pfsense-actions-export',
      notifications: [expect.objectContaining({
        secrets: {
          webhookUrl: 'https://discord.com/api/webhooks/123/portable-secret',
        },
      })],
      version: 1,
    }));

    expect(serialized).not.toContain('fixture-admin-password');

    expect(serialized).not.toContain(totpSecret);

    expect(serialized).not.toContain(recoveryCodes[0] ?? 'missing-recovery-code');

    expect(serialized).not.toContain(session['sessionToken']);

    expect(serialized).not.toContain(session['csrfToken']);

    expect(serialized).not.toContain(createdToken['personalAccessToken']);

    expect(serialized).not.toContain('Account-only export sentinel');

    expect(Reflect.has(document, 'administrator')).toBe(false);

    expect(Reflect.has(document, 'sessions')).toBe(false);

    expect(Reflect.has(document, 'activity')).toBe(false);

    state.close();

    return;
  });

  it('replaces notification names, skips duplicate tokens, and applies the connection immediately', () => {
    const state: Tests_Lib_State_State = createClaimedState();

    state.updateConnection({
      pfsensePassword: 'old-pfsense-password',
      pfsenseSshIp: '192.0.2.10',
      pfsenseSshPort: 22,
      pfsenseUsername: 'old-operator',
    }, 'admin');

    const existingTarget: Tests_Lib_State_NotificationTarget = state.createNotificationTarget({
      events: ['wol-sent'],
      name: 'Operations',
      secrets: {},
      service: 'ntfy',
      settings: { url: 'https://ntfy.sh/old-operations' },
    }, 'admin');
    const existingToken: Tests_Lib_State_CreatedToken = state.createToken({
      name: 'Existing automation',
      scopes: ['pfsense:read'],
    }, 'admin');

    if (existingTarget === undefined || existingToken === undefined) {
      throw new Error('The duplicate fixtures were not created.');
    }

    const importedPersonalAccessToken: Tests_Lib_State_PersonalAccessToken = generatePersonalAccessToken();
    const otherPersonalAccessToken: Tests_Lib_State_PersonalAccessToken = generatePersonalAccessToken();
    const existingHash: Tests_Lib_State_Secret = hashPersonalAccessToken(existingToken['personalAccessToken']);
    const document: Tests_Lib_State_BackupDocument = {
      accessTokens: [
        {
          createdAt: '2026-11-08T12:00:00.000Z',
          expiresAt: null,
          id: existingToken['token']['id'],
          lastUsedAt: null,
          name: 'Duplicate identifier',
          scopes: ['wol:execute'],
          tokenHash: hashPersonalAccessToken(generatePersonalAccessToken()),
        },
        {
          createdAt: '2026-11-08T12:00:00.000Z',
          expiresAt: null,
          id: 'duplicate-name',
          lastUsedAt: null,
          name: 'EXISTING AUTOMATION',
          scopes: ['wol:execute'],
          tokenHash: hashPersonalAccessToken(otherPersonalAccessToken),
        },
        {
          createdAt: '2026-11-08T12:00:00.000Z',
          expiresAt: null,
          id: 'duplicate-hash',
          lastUsedAt: null,
          name: 'Duplicate hash',
          scopes: ['wol:execute'],
          tokenHash: existingHash,
        },
        {
          createdAt: '2026-11-08T12:00:00.000Z',
          expiresAt: '2099-01-01T00:00:00.000Z',
          id: 'imported-automation',
          lastUsedAt: '2026-11-08T12:30:00.000Z',
          name: 'Imported automation',
          scopes: [
            'pfsense:read',
            'wol:execute',
          ],
          tokenHash: hashPersonalAccessToken(importedPersonalAccessToken),
        },
      ],
      appVersion: '2.0.0-source',
      connection: {
        credential: 'new-private-key',
        credentialType: 'privateKey',
        pfsenseSshIp: '198.51.100.40',
        pfsenseSshPort: 2200,
        pfsenseUsername: 'new-operator',
      },
      exportedAt: '2026-11-08T12:00:00.000Z',
      format: 'pfsense-actions-export',
      notifications: [
        {
          events: ['action-failed'],
          id: 'ntf-1111111111111111',
          name: 'operations',
          secrets: {},
          service: 'ntfy',
          settings: { url: 'https://ntfy.sh/new-operations' },
        },
        {
          events: ['pfsense-unreachable'],
          id: 'ntf-2222222222222222',
          name: 'Secondary',
          secrets: { webhookUrl: 'https://discord.com/api/webhooks/456/imported-secret' },
          service: 'discord',
          settings: {},
        },
      ],
      version: 1,
    };

    expect(state.previewBackupImport(document)['summary']).toEqual({
      accessTokens: {
        added: 1,
        skipped: 3,
      },
      connection: 'replaced',
      notifications: {
        added: 1,
        replaced: 1,
      },
    });

    const result: Tests_Lib_State_BackupImportResult = state.applyBackupImport(document, 'admin');

    expect(result).toEqual({
      accessTokens: {
        added: 1,
        skipped: 3,
      },
      connection: 'replaced',
      importedSections: [
        'connection',
        'notifications',
        'accessTokens',
      ],
      notifications: {
        added: 1,
        replaced: 1,
      },
    });

    expect(state.getPfsenseConnection()).toEqual({
      pfsensePrivateKey: 'new-private-key',
      pfsenseSshIp: '198.51.100.40',
      pfsenseSshPort: 2200,
      pfsenseUsername: 'new-operator',
    });

    expect(state.getNotificationTargets()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: existingTarget['id'],
        name: 'operations',
      }),
      expect.objectContaining({
        name: 'Secondary',
      }),
    ]));

    expect(state.getTokens().map((token) => token['name'])).toEqual(expect.arrayContaining([
      'Existing automation',
      'Imported automation',
    ]));

    expect(state.getTokens()).toHaveLength(2);

    expect(state.authenticateToken(importedPersonalAccessToken)).toEqual(expect.objectContaining({
      id: 'imported-automation',
    }));

    expect(state.createBackupDocument({
      accessTokens: false,
      connection: false,
      notifications: true,
    }, '2.0.0')['notifications']).toEqual(expect.arrayContaining([expect.objectContaining({
      name: 'Secondary',
      secrets: {
        webhookUrl: 'https://discord.com/api/webhooks/456/imported-secret',
      },
    })]));

    expect(state.getActivity(10)).toEqual(expect.arrayContaining([expect.objectContaining({
      action: 'backup-imported',
      category: 'configuration',
      outcome: 'succeeded',
      summary: 'Imported backup configuration: connection, notifications, access tokens',
    })]));

    state.close();

    return;
  });

  it('rolls every imported section back when a later database write fails', () => {
    const state: Tests_Lib_State_State = createClaimedState();

    state.updateConnection({
      pfsensePassword: 'original-password',
      pfsenseSshIp: '192.0.2.60',
      pfsenseSshPort: 22,
      pfsenseUsername: 'original-operator',
    }, 'admin');

    const database: Tests_Lib_State_Database = new DatabaseSync(join(getDataDirectory(), 'database', 'pfsense-actions.sqlite3'));

    database.exec('CREATE TRIGGER fail_backup_token BEFORE INSERT ON api_tokens WHEN NEW.name = \'Fail imported token\' BEGIN SELECT RAISE(ABORT, \'fixture import failure\'); END;');

    database.close();

    const document: Tests_Lib_State_BackupDocument = {
      accessTokens: [{
        createdAt: '2026-11-08T12:00:00.000Z',
        expiresAt: null,
        id: 'fail-imported-token',
        lastUsedAt: null,
        name: 'Fail imported token',
        scopes: ['pfsense:read'],
        tokenHash: hashPersonalAccessToken(generatePersonalAccessToken()),
      }],
      appVersion: '2.0.0-source',
      connection: {
        credential: 'rolled-back-password',
        credentialType: 'password',
        pfsenseSshIp: '198.51.100.60',
        pfsenseSshPort: 2222,
        pfsenseUsername: 'rolled-back-operator',
      },
      exportedAt: '2026-11-08T12:00:00.000Z',
      format: 'pfsense-actions-export',
      version: 1,
    };

    expect(() => state.applyBackupImport(document, 'admin')).toThrow('fixture import failure');

    expect(state.getPfsenseConnection()).toEqual({
      pfsensePassword: 'original-password',
      pfsenseSshIp: '192.0.2.60',
      pfsenseSshPort: 22,
      pfsenseUsername: 'original-operator',
    });

    expect(state.getTokens()).toEqual([]);

    expect(state.getActivity(20).some((event) => event['action'] === 'backup-imported')).toBe(false);

    state.close();

    return;
  });

  return;
});
