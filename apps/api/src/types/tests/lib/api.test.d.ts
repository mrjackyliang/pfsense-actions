import type { NodeSSH, SSHExecCommandResponse } from 'node-ssh';
import type { Mock } from 'vitest';

import type { Runner as Pfsense } from '@/lib/api.js';
import type { Shared_PfsenseConnection } from '@/types/shared.d.ts';

/**
 * Tests - Lib - API - API Mocks.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Api_ApiMocks_Connect = Mock<NodeSSH['connect']>;

export type Tests_Lib_Api_ApiMocks_Dispose = Mock<NodeSSH['dispose']>;

export type Tests_Lib_Api_ApiMocks_ExecCommand = Mock<NodeSSH['execCommand']>;

export type Tests_Lib_Api_ApiMocks = {
  connect: Tests_Lib_Api_ApiMocks_Connect;
  dispose: Tests_Lib_Api_ApiMocks_Dispose;
  execCommand: Tests_Lib_Api_ApiMocks_ExecCommand;
};

/**
 * Tests - Lib - API - Command Failure Cases.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Api_CommandFailureCases_Action =
  'PING'
  | 'SYSTEM_INFORMATION'
  | 'WAKE_ON_LAN';

export type Tests_Lib_Api_CommandFailureCases_Command = string;

export type Tests_Lib_Api_CommandFailureCases_Run_Returns =
  ReturnType<Pfsense['ping']>
  | ReturnType<Pfsense['systemInformation']>
  | ReturnType<Pfsense['wakeOnLan']>;

export type Tests_Lib_Api_CommandFailureCases_Run = (pfsense: Pfsense) => Tests_Lib_Api_CommandFailureCases_Run_Returns;

export type Tests_Lib_Api_CommandFailureCases_Case = {
  action: Tests_Lib_Api_CommandFailureCases_Action;
  command: Tests_Lib_Api_CommandFailureCases_Command;
  run: Tests_Lib_Api_CommandFailureCases_Run;
};

export type Tests_Lib_Api_CommandFailureCases = Tests_Lib_Api_CommandFailureCases_Case[];

/**
 * Tests - Lib - API - Environment.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Api_Environment = Shared_PfsenseConnection;

/**
 * Tests - Lib - API - Expect Command Failure.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Api_ExpectCommandFailure_CommandCase = Tests_Lib_Api_CommandFailureCases_Case;

export type Tests_Lib_Api_ExpectCommandFailure_Returns = Promise<void>;

export type Tests_Lib_Api_ExpectCommandFailure_Pfsense = Pfsense;

export type Tests_Lib_Api_ExpectCommandFailure_Response = Awaited<Tests_Lib_Api_CommandFailureCases_Run_Returns>;

/**
 * Tests - Lib - API - Failed Command Response.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Api_FailedCommandResponse = SSHExecCommandResponse;

/**
 * Tests - Lib - API - Rejects Unsuccessful Authentication.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Api_RejectsUnsuccessfulAuthentication_Pfsense = Pfsense;

export type Tests_Lib_Api_RejectsUnsuccessfulAuthentication_Response = Awaited<ReturnType<Pfsense['ping']>>;

/**
 * Tests - Lib - API - Successful Authentication Response.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Api_SuccessfulAuthenticationResponse = SSHExecCommandResponse;
