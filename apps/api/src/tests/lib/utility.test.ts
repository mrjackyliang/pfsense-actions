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

import {
  getDeprecationWarnings,
  getEnvironmentVariables,
} from '@/lib/utility.js';

import type {
  Tests_Lib_Utility_Directory,
  Tests_Lib_Utility_Environment,
} from '@/types/tests/lib/utility.test.d.ts';

/**
 * Tests - Lib - Utility - Directory.
 *
 * Holds the temporary folder that each test uses as its data directory.
 *
 * @since 2.0.0
 */
let directory: Tests_Lib_Utility_Directory = '';

describe('environment', () => {
  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'pfsense-actions-env-'));

    for (const name of [
      'ADMIN_WEBAUTHN_RP_NAME',
      'PFSENSE_PASSWORD',
      'PFSENSE_PRIVATE_KEY',
      'PFSENSE_SSH_IP',
      'PFSENSE_SSH_PORT',
      'PFSENSE_USERNAME',
      'PORT',
    ]) {
      vi.stubEnv(name, '');
    }

    vi.stubEnv('DATA_DIRECTORY', join(directory, 'data'));

    return;
  });

  afterEach(() => {
    vi.unstubAllEnvs();

    rmSync(directory, {
      force: true,
      recursive: true,
    });

    return;
  });

  it('starts a fresh container with no bootstrap values at all', () => {
    expect(getEnvironmentVariables()).toEqual({
      adminWebauthnRpName: 'pfSense Actions',
      dataDirectory: join(directory, 'data'),
      port: 22603,
    });

    return;
  });

  it('warns about deprecated variables and says whether they were imported', () => {
    const environment: Tests_Lib_Utility_Environment = {
      adminWebauthnRpName: 'pfSense Actions',
      dataDirectory: join(directory, 'data'),
      pfsensePrivateKey: 'fixture-private-key',
      pfsenseSshIp: '192.0.2.1',
      pfsenseUsername: 'fixture-user',
      port: 22603,
    };

    expect(getDeprecationWarnings(environment, {
      connection: true,
    })).toEqual(['Imported the pfSense connection from the PFSENSE_* environment variables. They\'re deprecated: manage the connection on the console\'s Connection page and remove them.']);

    expect(getDeprecationWarnings(environment, {
      connection: false,
    })).toEqual(['The PFSENSE_* environment variables are deprecated and were ignored because a connection is already saved. Remove them and use the console\'s Connection page.']);

    expect(getDeprecationWarnings({
      adminWebauthnRpName: 'pfSense Actions',
      dataDirectory: join(directory, 'data'),
      port: 22603,
    }, {
      connection: false,
    })).toEqual([]);

    return;
  });

  it('rejects partial SSH settings instead of half-applying them', () => {
    vi.stubEnv('PFSENSE_SSH_IP', '192.0.2.1');

    expect(() => getEnvironmentVariables()).toThrow('PFSENSE_USERNAME');

    return;
  });

  return;
});
