import type { NodeSSH, SSHExecCommandResponse } from 'node-ssh';

import type { systemInformationOutput } from '@/lib/schema.js';
import type {
  Shared_ApiResponse,
  Shared_PfsenseConnection,
  Shared_SystemInformation,
} from '@/types/shared.d.ts';

/**
 * Lib - API - Runner - Constructor.
 *
 * @since 2.0.0
 */
export type Lib_Api_Runner_Constructor_Environment = Shared_PfsenseConnection;

/**
 * Lib - API - Runner - Environment.
 *
 * @since 2.0.0
 */
export type Lib_Api_Runner_Environment = Shared_PfsenseConnection;

/**
 * Lib - API - Runner - Exec Command.
 *
 * @since 2.0.0
 */
export type Lib_Api_Runner_ExecCommand_Command = string;

export type Lib_Api_Runner_ExecCommand_TimeoutMilliseconds = number | undefined;

export type Lib_Api_Runner_ExecCommand_Returns = Promise<SSHExecCommandResponse>;

export type Lib_Api_Runner_ExecCommand_Timer = NodeJS.Timeout | undefined;

/**
 * Lib - API - Runner - Is Authenticated.
 *
 * @since 2.0.0
 */
export type Lib_Api_Runner_IsAuthenticated_Returns = Promise<boolean>;

export type Lib_Api_Runner_IsAuthenticated_TimeoutMilliseconds = number | undefined;

export type Lib_Api_Runner_IsAuthenticated_Response = SSHExecCommandResponse;

/**
 * Lib - API - Runner - Is Successful Command.
 *
 * @since 2.0.0
 */
export type Lib_Api_Runner_IsSuccessfulCommand_Response = SSHExecCommandResponse;

export type Lib_Api_Runner_IsSuccessfulCommand_Returns = boolean;

/**
 * Lib - API - Runner - Login.
 *
 * @since 2.0.0
 */
export type Lib_Api_Runner_Login_Returns_Info = null;

export type Lib_Api_Runner_Login_Returns = Promise<
  Shared_ApiResponse<'LOGIN', Lib_Api_Runner_Login_Returns_Info>
>;

/**
 * Lib - API - Runner - Logout.
 *
 * @since 2.0.0
 */
export type Lib_Api_Runner_Logout_Returns_Info = null;

export type Lib_Api_Runner_Logout_Returns = Promise<
  Shared_ApiResponse<'LOGOUT', Lib_Api_Runner_Logout_Returns_Info>
>;

/**
 * Lib - API - Runner - Ping.
 *
 * @since 2.0.0
 */
export type Lib_Api_Runner_Ping_IpAddress = string;

export type Lib_Api_Runner_Ping_Count = number;

export type Lib_Api_Runner_Ping_Returns_Info = SSHExecCommandResponse;

export type Lib_Api_Runner_Ping_Returns = Promise<
  Shared_ApiResponse<'PING', Lib_Api_Runner_Ping_Returns_Info>
>;

export type Lib_Api_Runner_Ping_Response = SSHExecCommandResponse;

/**
 * Lib - API - Runner - Session.
 *
 * @since 2.0.0
 */
export type Lib_Api_Runner_Session_IsAuthenticated = boolean;

export type Lib_Api_Runner_Session_SshClient = NodeSSH;

export type Lib_Api_Runner_Session = {
  isAuthenticated: Lib_Api_Runner_Session_IsAuthenticated;
  sshClient: Lib_Api_Runner_Session_SshClient;
};

/**
 * Lib - API - Runner - System Information.
 *
 * @since 2.0.0
 */
export type Lib_Api_Runner_SystemInformation_Returns_Info = Shared_SystemInformation;

export type Lib_Api_Runner_SystemInformation_TimeoutMilliseconds = number | undefined;

export type Lib_Api_Runner_SystemInformation_Returns = Promise<
  Shared_ApiResponse<'SYSTEM_INFORMATION', Lib_Api_Runner_SystemInformation_Returns_Info>
>;

export type Lib_Api_Runner_SystemInformation_Response = SSHExecCommandResponse;

export type Lib_Api_Runner_SystemInformation_OutputParts = string[];

export type Lib_Api_Runner_SystemInformation_ResponseBody = ReturnType<typeof systemInformationOutput.safeParse>;

/**
 * Lib - API - Runner - Wake On LAN.
 *
 * @since 2.0.0
 */
export type Lib_Api_Runner_WakeOnLan_BroadcastAddress = string;

export type Lib_Api_Runner_WakeOnLan_MacAddress = string;

export type Lib_Api_Runner_WakeOnLan_Returns_Info = SSHExecCommandResponse;

export type Lib_Api_Runner_WakeOnLan_Returns = Promise<
  Shared_ApiResponse<'WAKE_ON_LAN', Lib_Api_Runner_WakeOnLan_Returns_Info>
>;

export type Lib_Api_Runner_WakeOnLan_Response = SSHExecCommandResponse;
