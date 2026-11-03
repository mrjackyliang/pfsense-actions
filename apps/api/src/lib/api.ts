import { NodeSSH } from 'node-ssh';
import { isErrorLike, serializeError } from 'serialize-error';

import { textWhitespace } from './regex.js';
import { systemInformationOutput } from './schema.js';

import type {
  Lib_Api_Runner_Constructor_Environment,
  Lib_Api_Runner_Environment,
  Lib_Api_Runner_ExecCommand_Command,
  Lib_Api_Runner_ExecCommand_Returns,
  Lib_Api_Runner_ExecCommand_TimeoutMilliseconds,
  Lib_Api_Runner_ExecCommand_Timer,
  Lib_Api_Runner_IsAuthenticated_Response,
  Lib_Api_Runner_IsAuthenticated_Returns,
  Lib_Api_Runner_IsAuthenticated_TimeoutMilliseconds,
  Lib_Api_Runner_IsSuccessfulCommand_Response,
  Lib_Api_Runner_IsSuccessfulCommand_Returns,
  Lib_Api_Runner_Login_Returns,
  Lib_Api_Runner_Logout_Returns,
  Lib_Api_Runner_Ping_Count,
  Lib_Api_Runner_Ping_IpAddress,
  Lib_Api_Runner_Ping_Response,
  Lib_Api_Runner_Ping_Returns,
  Lib_Api_Runner_Session,
  Lib_Api_Runner_SystemInformation_OutputParts,
  Lib_Api_Runner_SystemInformation_Response,
  Lib_Api_Runner_SystemInformation_ResponseBody,
  Lib_Api_Runner_SystemInformation_Returns,
  Lib_Api_Runner_SystemInformation_TimeoutMilliseconds,
  Lib_Api_Runner_WakeOnLan_BroadcastAddress,
  Lib_Api_Runner_WakeOnLan_MacAddress,
  Lib_Api_Runner_WakeOnLan_Response,
  Lib_Api_Runner_WakeOnLan_Returns,
} from '@/types/lib/api.d.ts';

/**
 * Lib - API.
 *
 * Maintains one authenticated SSH session and exposes the supported pfSense actions.
 * Every command verifies authentication before reaching the remote shell.
 *
 * @since 2.0.0
 */
export class Runner {
  /**
   * Lib - API - Environment.
   *
   * Stores validated connection settings for every SSH operation.
   * Credentials stay private to the session that consumes them.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #environment: Lib_Api_Runner_Environment;

  /**
   * Lib - API - Session.
   *
   * Tracks the SSH client and the most recently verified authentication state.
   * The state is refreshed by a remote probe before privileged commands run.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #session: Lib_Api_Runner_Session;

  /**
   * Lib - API - Constructor.
   *
   * Creates an isolated SSH session for one API request lifecycle.
   * No network connection is opened until the caller explicitly logs in.
   *
   * @param {Lib_Api_Runner_Constructor_Environment} environment - Environment.
   *
   * @since 2.0.0
   */
  public constructor(environment: Lib_Api_Runner_Constructor_Environment) {
    this.#environment = environment;

    this.#session = {
      isAuthenticated: false,
      sshClient: new NodeSSH(),
    };

    return;
  }

  /**
   * Lib - API - Login.
   *
   * Reuses a verified session or connects with the configured SSH credential.
   * Connection failures are serialized into the API response envelope.
   *
   * @returns {Lib_Api_Runner_Login_Returns}
   *
   * @since 2.0.0
   */
  public async login(): Lib_Api_Runner_Login_Returns {
    try {
      if ((await this.isAuthenticated()) === true) {
        return {
          action: 'LOGIN',
          success: true,
          info: null,
        };
      }

      await this.#session['sshClient'].connect({
        host: this.#environment['pfsenseSshIp'],
        port: this.#environment['pfsenseSshPort'],
        username: this.#environment['pfsenseUsername'],
        ...((this.#environment['pfsensePassword'] === undefined) ? {} : { password: this.#environment['pfsensePassword'] }),
        ...((this.#environment['pfsensePrivateKey'] === undefined) ? {} : { privateKey: this.#environment['pfsensePrivateKey'] }),
      });

      this.#session.isAuthenticated = true;

      return {
        action: 'LOGIN',
        success: true,
        info: null,
      };
    } catch (error) {
      return {
        action: 'LOGIN',
        success: false,
        info: {
          error: serializeError((isErrorLike(error) === true) ? error : new Error('Unknown error')),
        },
      };
    }
  }

  /**
   * Lib - API - Logout.
   *
   * Disposes the SSH client and clears the tracked authentication state.
   * Calling logout on an inactive session remains safe and idempotent.
   *
   * @returns {Lib_Api_Runner_Logout_Returns}
   *
   * @since 2.0.0
   */
  public async logout(): Lib_Api_Runner_Logout_Returns {
    try {
      if ((await this.isAuthenticated()) === false) {
        return {
          action: 'LOGOUT',
          success: true,
          info: null,
        };
      }

      this.#session['sshClient'].dispose();

      this.#session.isAuthenticated = false;

      return {
        action: 'LOGOUT',
        success: true,
        info: null,
      };
    } catch (error) {
      return {
        action: 'LOGOUT',
        success: false,
        info: {
          error: serializeError((isErrorLike(error) === true) ? error : new Error('Unknown error')),
        },
      };
    }
  }

  /**
   * Lib - API - Ping.
   *
   * Executes pfSense's ping command after verifying the SSH session.
   * The caller validates the address and count before invoking this boundary.
   *
   * @param {Lib_Api_Runner_Ping_IpAddress} ipAddress - Ip address.
   * @param {Lib_Api_Runner_Ping_Count}     count     - Count.
   *
   * @returns {Lib_Api_Runner_Ping_Returns}
   *
   * @since 2.0.0
   */
  public async ping(ipAddress: Lib_Api_Runner_Ping_IpAddress, count: Lib_Api_Runner_Ping_Count): Lib_Api_Runner_Ping_Returns {
    try {
      if ((await this.isAuthenticated()) === false) {
        return {
          action: 'PING',
          success: false,
          info: {
            message: 'Failed to authenticate to pfSense via SSH',
          },
        };
      }

      const response: Lib_Api_Runner_Ping_Response = await this.#session['sshClient'].execCommand(`ping -c ${count} ${ipAddress}`);

      if (
        this.isSuccessfulCommand(response) === false
        && response['code'] !== 2
      ) {
        return {
          action: 'PING',
          success: false,
          info: {
            message: 'The pfSense command exited unsuccessfully',
          },
        };
      }

      return {
        action: 'PING',
        success: true,
        info: response,
      };
    } catch (error) {
      return {
        action: 'PING',
        success: false,
        info: {
          error: serializeError((isErrorLike(error) === true) ? error : new Error('Unknown error')),
        },
      };
    }
  }

  /**
   * Lib - API - System Information.
   *
   * Reads the pfSense host's operating-system information over SSH.
   * Authentication failures return a structured response without running the command.
   *
   * @returns {Lib_Api_Runner_SystemInformation_Returns}
   *
   * @since 2.0.0
   */
  public async systemInformation(timeoutMilliseconds: Lib_Api_Runner_SystemInformation_TimeoutMilliseconds = undefined): Lib_Api_Runner_SystemInformation_Returns {
    try {
      if ((await this.isAuthenticated(timeoutMilliseconds)) === false) {
        return {
          action: 'SYSTEM_INFORMATION',
          success: false,
          info: {
            message: 'Failed to authenticate to pfSense via SSH',
          },
        };
      }

      const response: Lib_Api_Runner_SystemInformation_Response = await this.execCommand('uname -mrs', timeoutMilliseconds);

      if (this.isSuccessfulCommand(response) === false) {
        return {
          action: 'SYSTEM_INFORMATION',
          success: false,
          info: {
            message: 'The pfSense command exited unsuccessfully',
          },
        };
      }

      const outputParts: Lib_Api_Runner_SystemInformation_OutputParts = response.stdout.trim().split(textWhitespace);
      const responseBody: Lib_Api_Runner_SystemInformation_ResponseBody = systemInformationOutput.safeParse({
        architecture: outputParts[2],
        operatingSystem: outputParts[0],
        release: outputParts[1],
      });

      if (outputParts.length !== 3 || responseBody.success === false) {
        return {
          action: 'SYSTEM_INFORMATION',
          success: false,
          info: {
            message: 'The pfSense command returned unexpected system information',
          },
        };
      }

      return {
        action: 'SYSTEM_INFORMATION',
        success: true,
        info: responseBody.data,
      };
    } catch (error) {
      return {
        action: 'SYSTEM_INFORMATION',
        success: false,
        info: {
          error: serializeError((isErrorLike(error) === true) ? error : new Error('Unknown error')),
        },
      };
    }
  }

  /**
   * Lib - API - Exec Command.
   *
   * Runs an SSH command and optionally closes its channel after a deadline.
   * Closing the channel settles node-ssh's command promise without dropping the session.
   *
   * @param {Lib_Api_Runner_ExecCommand_Command}             command             - Command.
   * @param {Lib_Api_Runner_ExecCommand_TimeoutMilliseconds} timeoutMilliseconds - Timeout milliseconds.
   *
   * @private
   *
   * @returns {Lib_Api_Runner_ExecCommand_Returns}
   *
   * @since 2.0.0
   */
  private async execCommand(command: Lib_Api_Runner_ExecCommand_Command, timeoutMilliseconds: Lib_Api_Runner_ExecCommand_TimeoutMilliseconds = undefined): Lib_Api_Runner_ExecCommand_Returns {
    if (timeoutMilliseconds === undefined) {
      return this.#session['sshClient'].execCommand(command);
    }

    let timer: Lib_Api_Runner_ExecCommand_Timer = undefined;

    try {
      return await this.#session['sshClient'].execCommand(command, {
        onChannel: (channel) => {
          timer = setTimeout(() => {
            channel.close();

            return;
          }, timeoutMilliseconds);
          timer.unref();

          return;
        },
      });
    } finally {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    }
  }

  /**
   * Lib - API - Wake On Lan.
   *
   * Sends a Wake-on-LAN packet from pfSense to the requested device.
   * The caller validates both network addresses before invoking this boundary.
   *
   * @param {Lib_Api_Runner_WakeOnLan_BroadcastAddress} broadcastAddress - Broadcast address.
   * @param {Lib_Api_Runner_WakeOnLan_MacAddress}       macAddress       - Mac address.
   *
   * @returns {Lib_Api_Runner_WakeOnLan_Returns}
   *
   * @since 2.0.0
   */
  public async wakeOnLan(broadcastAddress: Lib_Api_Runner_WakeOnLan_BroadcastAddress, macAddress: Lib_Api_Runner_WakeOnLan_MacAddress): Lib_Api_Runner_WakeOnLan_Returns {
    try {
      if ((await this.isAuthenticated()) === false) {
        return {
          action: 'WAKE_ON_LAN',
          success: false,
          info: {
            message: 'Failed to authenticate to pfSense via SSH',
          },
        };
      }

      const response: Lib_Api_Runner_WakeOnLan_Response = await this.#session['sshClient'].execCommand(`wol -i ${broadcastAddress} ${macAddress}`);

      if (this.isSuccessfulCommand(response) === false) {
        return {
          action: 'WAKE_ON_LAN',
          success: false,
          info: {
            message: 'The pfSense command exited unsuccessfully',
          },
        };
      }

      return {
        action: 'WAKE_ON_LAN',
        success: true,
        info: response,
      };
    } catch (error) {
      return {
        action: 'WAKE_ON_LAN',
        success: false,
        info: {
          error: serializeError((isErrorLike(error) === true) ? error : new Error('Unknown error')),
        },
      };
    }
  }

  /**
   * Lib - API - Is Authenticated.
   *
   * Probes the SSH session before every privileged pfSense action.
   * Failed probes clear the cached authentication state for subsequent calls.
   *
   * @private
   *
   * @returns {Lib_Api_Runner_IsAuthenticated_Returns}
   *
   * @since 2.0.0
   */
  private async isAuthenticated(timeoutMilliseconds: Lib_Api_Runner_IsAuthenticated_TimeoutMilliseconds = undefined): Lib_Api_Runner_IsAuthenticated_Returns {
    try {
      const response: Lib_Api_Runner_IsAuthenticated_Response = await this.execCommand('whoami', timeoutMilliseconds);

      this.#session.isAuthenticated = this.isSuccessfulCommand(response);
    } catch {
      this.#session.isAuthenticated = false;
    }

    return this.#session['isAuthenticated'];
  }

  /**
   * Lib - API - Is Successful Command.
   *
   * Accepts only a zero SSH exit code as a successfully completed command.
   * Transport success alone cannot make a rejected pfSense operation succeed.
   *
   * @param {Lib_Api_Runner_IsSuccessfulCommand_Response} response - Response.
   *
   * @private
   *
   * @returns {Lib_Api_Runner_IsSuccessfulCommand_Returns}
   *
   * @since 2.0.0
   */
  private isSuccessfulCommand(response: Lib_Api_Runner_IsSuccessfulCommand_Response): Lib_Api_Runner_IsSuccessfulCommand_Returns {
    return response['code'] === 0;
  }
}
