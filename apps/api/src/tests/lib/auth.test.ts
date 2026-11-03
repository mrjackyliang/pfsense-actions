import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  authenticateRawPersonalAccessToken,
  decryptCredential,
  digestsEqual,
  digestValue,
  encryptCredential,
  generatePersonalAccessToken,
  generateRecoveryCodes,
  generateSetupCode,
  getBearerToken,
  hashAdministratorPassword,
  hashPersonalAccessToken,
  hasPersonalAccessTokenScope,
  normalizeRecoveryCode,
  normalizeSetupCode,
  verifyAdministratorPassword,
} from '@/lib/auth.js';
import {
  textPersonalAccessToken,
  textSetupCode,
} from '@/lib/regex.js';

import type {
  Tests_Lib_Auth_AuthenticatedPersonalAccessToken,
  Tests_Lib_Auth_CreateRequest_Authorization,
  Tests_Lib_Auth_CreateRequest_Request,
  Tests_Lib_Auth_CreateRequest_Returns,
  Tests_Lib_Auth_CreateRequest_Unknown,
  Tests_Lib_Auth_EncryptedCredential,
  Tests_Lib_Auth_EncryptionKey,
  Tests_Lib_Auth_PasswordHash,
  Tests_Lib_Auth_PersonalAccessToken,
  Tests_Lib_Auth_PersonalAccessTokens,
  Tests_Lib_Auth_RecoveryCodes,
  Tests_Lib_Auth_SetupCode,
} from '@/types/tests/lib/auth.test.d.ts';

/**
 * Tests - Lib - Auth - Personal Access Token.
 *
 * Uses one deterministic credential to verify hash, expiry, and scope behavior.
 * No raw token is written to a snapshot or application log.
 *
 * @since 2.0.0
 */
const personalAccessToken: Tests_Lib_Auth_PersonalAccessToken = 'pfa_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const personalAccessTokens: Tests_Lib_Auth_PersonalAccessTokens = [{
  id: 'fixture-client',
  scopes: [
    'pfsense:read',
    'reachability:read',
  ],
  tokenHash: hashPersonalAccessToken(personalAccessToken),
}];

/**
 * Tests - Lib - Auth - Create Request.
 *
 * Creates the smallest Express request shape needed to resolve authorization.
 * The fake keeps all authentication tests independent from a network listener.
 *
 * @param {Tests_Lib_Auth_CreateRequest_Authorization} authorization - Authorization.
 *
 * @returns {Tests_Lib_Auth_CreateRequest_Returns}
 *
 * @since 2.0.0
 */
function createRequest(authorization: Tests_Lib_Auth_CreateRequest_Authorization): Tests_Lib_Auth_CreateRequest_Returns {
  return {
    get: () => {
      return authorization;
    },
  } as Tests_Lib_Auth_CreateRequest_Unknown as Tests_Lib_Auth_CreateRequest_Request;
}

describe('personal access token authentication', () => {
  it('extracts a well-formed Bearer token in any scheme case', () => {
    expect(getBearerToken(createRequest(`Bearer ${personalAccessToken}`))).toBe(personalAccessToken);

    expect(getBearerToken(createRequest(`bearer  ${personalAccessToken}`))).toBe(personalAccessToken);

    return;
  });

  it.each([
    undefined,
    '',
    `Basic ${personalAccessToken}`,
    'Bearer pfa_too-short',
  ])('ignores an absent, foreign, or malformed authorization header', (authorization) => {
    expect(getBearerToken(createRequest(authorization))).toBeUndefined();

    return;
  });

  it('authenticates a raw token without returning its hash', () => {
    expect(authenticateRawPersonalAccessToken(personalAccessTokens, personalAccessToken)).toEqual({
      id: 'fixture-client',
      scopes: [
        'pfsense:read',
        'reachability:read',
      ],
    });

    expect(authenticateRawPersonalAccessToken(personalAccessTokens, 'pfa_too-short')).toBeUndefined();

    expect(authenticateRawPersonalAccessToken(personalAccessTokens, 'pfa_BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB')).toBeUndefined();

    return;
  });

  it('rejects an expired credential', () => {
    expect(authenticateRawPersonalAccessToken([{
      expiresAt: '2026-01-01T00:00:00.000Z',
      id: 'fixture-client',
      scopes: [
        'pfsense:read',
        'reachability:read',
      ],
      tokenHash: hashPersonalAccessToken(personalAccessToken),
    }], personalAccessToken, new Date('2026-01-02T00:00:00.000Z'))).toBeUndefined();

    return;
  });

  it('hashes credentials deterministically with SHA-256', () => {
    expect(hashPersonalAccessToken(personalAccessToken)).toBe('61fc970f59c5998f3f5068b66bef86002d8e5b33b112587b772b5bab04fd8f6a');

    expect(digestValue(personalAccessToken)).toBe(hashPersonalAccessToken(personalAccessToken));

    expect(digestsEqual(digestValue('a'), digestValue('a'))).toBe(true);

    expect(digestsEqual(digestValue('a'), digestValue('b'))).toBe(false);

    expect(digestsEqual('short', digestValue('a'))).toBe(false);

    return;
  });

  it('generates unique credentials with the documented shape', () => {
    const firstPersonalAccessToken: Tests_Lib_Auth_PersonalAccessToken = generatePersonalAccessToken();
    const secondPersonalAccessToken: Tests_Lib_Auth_PersonalAccessToken = generatePersonalAccessToken();

    expect(firstPersonalAccessToken).toMatch(textPersonalAccessToken);

    expect(secondPersonalAccessToken).toMatch(textPersonalAccessToken);

    expect(secondPersonalAccessToken).not.toBe(firstPersonalAccessToken);

    return;
  });

  it('requires an exact granted scope', () => {
    const authenticatedPersonalAccessToken: Tests_Lib_Auth_AuthenticatedPersonalAccessToken = authenticateRawPersonalAccessToken(personalAccessTokens, personalAccessToken);

    if (authenticatedPersonalAccessToken === undefined) {
      throw new Error('The fixture token did not authenticate.');
    }

    expect(hasPersonalAccessTokenScope(authenticatedPersonalAccessToken, 'pfsense:read')).toBe(true);

    expect(hasPersonalAccessTokenScope(authenticatedPersonalAccessToken, 'wol:execute')).toBe(false);

    return;
  });

  return;
});

describe('administrator passwords', () => {
  it('hashes passwords with Argon2id and independent salts', () => {
    const firstPasswordHash: Tests_Lib_Auth_PasswordHash = hashAdministratorPassword('fixture-admin-password');
    const secondPasswordHash: Tests_Lib_Auth_PasswordHash = hashAdministratorPassword('fixture-admin-password');

    expect(firstPasswordHash.startsWith('$argon2id$v=19$m=65536,t=3,p=2$')).toBe(true);

    expect(firstPasswordHash).not.toBe(secondPasswordHash);

    expect(verifyAdministratorPassword('fixture-admin-password', firstPasswordHash)).toBe(true);

    expect(verifyAdministratorPassword('wrong-password', firstPasswordHash)).toBe(false);

    return;
  });

  it.each([
    'malformed',
    '$argon2id$v=18$m=65536,t=3,p=2$c2FsdHNhbHRzYWx0c2FsdA$aGFzaGhhc2hoYXNoaGFzaA',
    '$argon2id$v=19$m=1,t=3,p=2$c2FsdHNhbHRzYWx0c2FsdA$aGFzaGhhc2hoYXNoaGFzaA',
  ])('rejects a malformed or out-of-bounds stored hash', (passwordHash) => {
    expect(verifyAdministratorPassword('fixture-admin-password', passwordHash)).toBe(false);

    return;
  });

  return;
});

describe('setup and recovery codes', () => {
  it('generates readable setup codes and accepts them typed loosely', () => {
    const setupCode: Tests_Lib_Auth_SetupCode = generateSetupCode();

    expect(setupCode).toMatch(textSetupCode);

    expect(normalizeSetupCode(setupCode.toLowerCase())).toBe(setupCode);

    expect(normalizeSetupCode(setupCode.replaceAll('-', ''))).toBe(setupCode);

    expect(normalizeSetupCode(` ${setupCode.replaceAll('-', ' ')} `)).toBe(setupCode);

    expect(normalizeSetupCode('ABCDE-FGHIJ-KLMNO')).toBeUndefined();

    expect(normalizeSetupCode('ABCDE')).toBeUndefined();

    return;
  });

  it('generates ten unique recovery codes that survive spaces and dashes', () => {
    const recoveryCodes: Tests_Lib_Auth_RecoveryCodes = generateRecoveryCodes();

    expect(recoveryCodes).toHaveLength(10);

    expect(new Set(recoveryCodes).size).toBe(10);

    for (const recoveryCode of recoveryCodes) {
      expect(normalizeRecoveryCode(recoveryCode.toLowerCase())).toBe(recoveryCode.replace('-', ''));
    }

    expect(normalizeRecoveryCode('123456')).toBeUndefined();

    return;
  });

  return;
});

describe('credential encryption', () => {
  it('encrypts stored credentials with authenticated random nonces', () => {
    const encryptionKey: Tests_Lib_Auth_EncryptionKey = 'd'.repeat(64);
    const firstEncryptedCredential: Tests_Lib_Auth_EncryptedCredential = encryptCredential('fixture-pfsense-password', encryptionKey);
    const secondEncryptedCredential: Tests_Lib_Auth_EncryptedCredential = encryptCredential('fixture-pfsense-password', encryptionKey);

    expect(firstEncryptedCredential['ciphertext']).not.toContain('fixture-pfsense-password');

    expect(firstEncryptedCredential).not.toEqual(secondEncryptedCredential);

    expect(decryptCredential(firstEncryptedCredential, encryptionKey)).toBe('fixture-pfsense-password');

    expect(() => decryptCredential(firstEncryptedCredential, 'e'.repeat(64))).toThrow();

    return;
  });

  return;
});
