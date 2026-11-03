import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { Runner as Pfsense } from '@/lib/api.js';

import type {
  Tests_Lib_Api_ApiMocks,
  Tests_Lib_Api_CommandFailureCases,
  Tests_Lib_Api_Environment,
  Tests_Lib_Api_ExpectCommandFailure_CommandCase,
  Tests_Lib_Api_ExpectCommandFailure_Pfsense,
  Tests_Lib_Api_ExpectCommandFailure_Response,
  Tests_Lib_Api_ExpectCommandFailure_Returns,
  Tests_Lib_Api_FailedCommandResponse,
  Tests_Lib_Api_RejectsUnsuccessfulAuthentication_Pfsense,
  Tests_Lib_Api_RejectsUnsuccessfulAuthentication_Response,
  Tests_Lib_Api_SuccessfulAuthenticationResponse,
} from '@/types/tests/lib/api.test.d.ts';

/**
 * Tests - Lib - API - Mocks.
 *
 * Replaces the SSH transport with controllable asynchronous operations.
 * Command semantics remain exercised through the real pfSense adapter.
 *
 * @since 2.0.0
 */
const apiMocks: Tests_Lib_Api_ApiMocks = vi.hoisted(() => ({
  connect: vi.fn(),
  dispose: vi.fn(),
  execCommand: vi.fn(),
}));

/**
 * Tests - Lib - API - Environment.
 *
 * Supplies inert connection settings to the adapter constructor.
 * No address is contacted because the SSH client is mocked.
 *
 * @since 2.0.0
 */
const environment: Tests_Lib_Api_Environment = {
  pfsensePassword: 'fixture-password',
  pfsenseSshIp: '192.0.2.1',
  pfsenseSshPort: 22,
  pfsenseUsername: 'fixture-user',
};

/**
 * Tests - Lib - API - Successful Authentication Response.
 *
 * Represents a zero-exit authentication probe from the SSH transport.
 * The adapter may proceed to the requested action after this response.
 *
 * @since 2.0.0
 */
const successfulAuthenticationResponse: Tests_Lib_Api_SuccessfulAuthenticationResponse = {
  code: 0,
  signal: null,
  stderr: '',
  stdout: 'fixture-user',
};

/**
 * Tests - Lib - API - Failed Command Response.
 *
 * Represents a command that reached pfSense but exited unsuccessfully.
 * This must never be exposed as a successful adapter action.
 *
 * @since 2.0.0
 */
const failedCommandResponse: Tests_Lib_Api_FailedCommandResponse = {
  code: 1,
  signal: null,
  stderr: 'Fixture command failure',
  stdout: '',
};

/**
 * Tests - Lib - API - Command Failure Cases.
 *
 * Enumerates every public command and its exact pfSense shell invocation.
 * A single contract assertion is applied consistently across the adapter.
 *
 * @since 2.0.0
 */
const commandFailureCases: Tests_Lib_Api_CommandFailureCases = [
  {
    action: 'PING',
    command: 'ping -c 1 192.0.2.2',
    run: async (pfsense) => pfsense.ping('192.0.2.2', 1),
  },
  {
    action: 'SYSTEM_INFORMATION',
    command: 'uname -mrs',
    run: async (pfsense) => pfsense.systemInformation(),
  },
  {
    action: 'WAKE_ON_LAN',
    command: 'wol -i 192.0.2.255 00:11:22:33:44:55',
    run: async (pfsense) => pfsense.wakeOnLan('192.0.2.255', '00:11:22:33:44:55'),
  },
];

vi.mock('node-ssh', () => ({
  NodeSSH: vi.fn(function nodeSsh() {
    return apiMocks;
  }),
}));

/**
 * Tests - Lib - API - Expect Command Failure.
 *
 * Runs one authenticated action against a nonzero SSH command response.
 * Verifies both the shell command and the adapter's public failure envelope.
 *
 * @param {Tests_Lib_Api_ExpectCommandFailure_CommandCase} commandCase - Command case.
 *
 * @returns {Tests_Lib_Api_ExpectCommandFailure_Returns}
 *
 * @since 2.0.0
 */
async function expectCommandFailure(commandCase: Tests_Lib_Api_ExpectCommandFailure_CommandCase): Tests_Lib_Api_ExpectCommandFailure_Returns {
  apiMocks['execCommand']
    .mockResolvedValueOnce(successfulAuthenticationResponse)
    .mockResolvedValueOnce(failedCommandResponse);

  const pfsense: Tests_Lib_Api_ExpectCommandFailure_Pfsense = new Pfsense(environment);
  const response: Tests_Lib_Api_ExpectCommandFailure_Response = await commandCase.run(pfsense);

  expect(apiMocks['execCommand']).toHaveBeenNthCalledWith(1, 'whoami');

  expect(apiMocks['execCommand']).toHaveBeenNthCalledWith(2, commandCase['command']);

  expect(response).toStrictEqual({
    action: commandCase['action'],
    info: {
      message: 'The pfSense command exited unsuccessfully',
    },
    success: false,
  });

  return;
}

/**
 * Tests - Lib - API - Command Exit Codes.
 *
 * Verifies nonzero exit codes fail authentication and every pfSense action.
 * Transport-level completion alone is not considered command success.
 *
 * @since 2.0.0
 */
describe('command exit codes', () => {
  beforeEach(() => {
    apiMocks['connect'].mockReset();

    apiMocks['dispose'].mockReset();

    apiMocks['execCommand'].mockReset();

    return;
  });

  it.each(commandFailureCases)('returns a failure response for $action', async (commandCase) => {
    await expectCommandFailure(commandCase);

    return;
  });

  it('preserves a successful FreeBSD ping with no replies as a reachability result', async () => {
    apiMocks['execCommand']
      .mockResolvedValueOnce(successfulAuthenticationResponse)
      .mockResolvedValueOnce({
        code: 2,
        signal: null,
        stderr: '',
        stdout: '1 packets transmitted, 0 packets received, 100.0% packet loss',
      });

    await expect(new Pfsense(environment).ping('192.0.2.2', 1)).resolves.toStrictEqual({
      action: 'PING',
      info: {
        code: 2,
        signal: null,
        stderr: '',
        stdout: '1 packets transmitted, 0 packets received, 100.0% packet loss',
      },
      success: true,
    });

    return;
  });

  it('rejects an unsuccessful authentication probe before running an action', async () => {
    apiMocks['execCommand'].mockResolvedValueOnce(failedCommandResponse);

    const pfsense: Tests_Lib_Api_RejectsUnsuccessfulAuthentication_Pfsense = new Pfsense(environment);
    const response: Tests_Lib_Api_RejectsUnsuccessfulAuthentication_Response = await pfsense.ping('192.0.2.2', 1);

    expect(apiMocks['execCommand']).toHaveBeenCalledTimes(1);

    expect(apiMocks['execCommand']).toHaveBeenCalledWith('whoami');

    expect(response).toStrictEqual({
      action: 'PING',
      info: {
        message: 'Failed to authenticate to pfSense via SSH',
      },
      success: false,
    });

    return;
  });

  return;
});

/**
 * Tests - Lib - API - System Information.
 *
 * Verifies documented uname output is parsed into a minimized response contract.
 * Unexpected shapes fail closed without returning raw SSH transport fields.
 *
 * @since 2.0.0
 */
describe('system information', () => {
  beforeEach(() => {
    apiMocks['connect'].mockReset();

    apiMocks['dispose'].mockReset();

    apiMocks['execCommand'].mockReset();

    return;
  });

  it('returns only reviewed fields from documented output', async () => {
    apiMocks['execCommand']
      .mockResolvedValueOnce(successfulAuthenticationResponse)
      .mockResolvedValueOnce({
        code: 0,
        signal: null,
        stderr: '',
        stdout: 'FreeBSD   14.0-CURRENT amd64',
      });

    await expect(new Pfsense(environment).systemInformation(30_000)).resolves.toStrictEqual({
      action: 'SYSTEM_INFORMATION',
      info: {
        architecture: 'amd64',
        operatingSystem: 'FreeBSD',
        release: '14.0-CURRENT',
      },
      success: true,
    });

    expect(apiMocks['execCommand']).toHaveBeenNthCalledWith(2, 'uname -mrs', {
      onChannel: expect.any(Function),
    });

    return;
  });

  it('rejects unexpected command output', async () => {
    apiMocks['execCommand']
      .mockResolvedValueOnce(successfulAuthenticationResponse)
      .mockResolvedValueOnce({
        code: 0,
        signal: null,
        stderr: '',
        stdout: 'FreeBSD 14.0-CURRENT amd64 unexpected',
      });

    await expect(new Pfsense(environment).systemInformation()).resolves.toStrictEqual({
      action: 'SYSTEM_INFORMATION',
      info: {
        message: 'The pfSense command returned unexpected system information',
      },
      success: false,
    });

    return;
  });

  return;
});
