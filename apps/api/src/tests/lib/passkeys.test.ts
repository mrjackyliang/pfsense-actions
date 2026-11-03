import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createPasskeyAuthenticationOptions,
  createPasskeyRegistrationOptions,
  getPasskeyUserHandle,
} from '@/lib/passkeys.js';

import type {
  Tests_Lib_Passkeys_Administrator,
  Tests_Lib_Passkeys_AuthenticationOptions,
  Tests_Lib_Passkeys_Configuration,
  Tests_Lib_Passkeys_RegistrationOptions,
  Tests_Lib_Passkeys_UserHandle,
} from '@/types/tests/lib/passkeys.test.d.ts';

describe('administrator passkeys', () => {
  it('creates discoverable registration options with required user verification', async () => {
    const configuration: Tests_Lib_Passkeys_Configuration = {
      origin: 'https://actions.example.net',
      rpId: 'actions.example.net',
      rpName: 'pfSense Actions',
    };
    const administrator: Tests_Lib_Passkeys_Administrator = {
      createdAt: '2026-10-23T00:00:00.000Z',
      id: '9cdb2684-2053-48ab-891d-105cfde1e1b6',
      updatedAt: '2026-10-23T00:00:00.000Z',
      username: 'admin',
    };
    const options: Tests_Lib_Passkeys_RegistrationOptions = await createPasskeyRegistrationOptions(configuration, administrator, []);
    const userHandle: Tests_Lib_Passkeys_UserHandle = getPasskeyUserHandle(administrator['id']);

    expect(options['rp']['id']).toBe(configuration['rpId']);

    expect(options['attestation']).toBe('none');

    expect(options['authenticatorSelection']).toEqual(expect.objectContaining({
      residentKey: 'required',
      userVerification: 'required',
    }));

    expect(options['user']['id']).toBe(userHandle);

    expect(Buffer.from(userHandle, 'base64url').toString('utf8')).toBe(administrator['id']);

    return;
  });

  it('creates anonymous authentication options without a credential allow-list', async () => {
    const configuration: Tests_Lib_Passkeys_Configuration = {
      origin: 'https://actions.example.net',
      rpId: 'actions.example.net',
      rpName: 'pfSense Actions',
    };
    const options: Tests_Lib_Passkeys_AuthenticationOptions = await createPasskeyAuthenticationOptions(configuration);

    expect(options['rpId']).toBe(configuration['rpId']);

    expect(options['userVerification']).toBe('required');

    expect(options['allowCredentials']).toBeUndefined();

    return;
  });

  return;
});
