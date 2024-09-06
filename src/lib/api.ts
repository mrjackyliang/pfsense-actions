import { NodeSSH } from 'node-ssh';
import { serializeError } from 'serialize-error';

import type {
  PfsenseConstructorEnvironment,
  PfsenseEnvironment,
  PfsenseIsAuthenticatedReturns,
  PfsenseLoginReturns,
  PfsenseLogoutReturns,
  PfsenseReloadFilterReturns,
  PfsenseSession,
  PfsenseSystemInformationReturns,
  PfsenseUpdateDyndnsReturns,
  PfsenseWakeOnLanBroadcastAddress,
  PfsenseWakeOnLanMacAddress,
  PfsenseWakeOnLanReturns,
} from '@/types/index.d.ts';

/**
 * Pfsense.
 *
 * @since 1.0.0
 */
export class Pfsense {
  /**
   * Pfsense - Environment.
   *
   * @private
   *
   * @since 1.0.0
   */
  #environment: PfsenseEnvironment;

  /**
   * Pfsense - Session.
   *
   * @private
   *
   * @since 1.0.0
   */
  #session: PfsenseSession;

  /**
   * Pfsense - Constructor.
   *
   * @param {PfsenseConstructorEnvironment} environment - Environment.
   *
   * @since 1.0.0
   */
  constructor(environment: PfsenseConstructorEnvironment) {
    // Set environment options.
    this.#environment = environment;

    // Set session options.
    this.#session = {
      isAuthenticated: false,
      sshClient: new NodeSSH(),
    };
  }

  /**
   * Pfsense - Login.
   *
   * @returns {PfsenseLoginReturns}
   *
   * @since 1.0.0
   */
  public async login(): PfsenseLoginReturns {
    let errorObject;

    try {
      // Check if this session is still authenticated.
      if (await this.isAuthenticated()) {
        return {
          action: 'LOGIN',
          success: true,
          info: null,
        };
      }

      // Login to pfSense via SSH.
      await this.#session.sshClient.connect({
        host: this.#environment.pfsenseSshIp,
        port: this.#environment.pfsenseSshPort,
        username: this.#environment.pfsenseUsername,
        password: this.#environment.pfsensePassword,
        privateKey: this.#environment.pfsensePrivateKey,
      });

      // Mark that this session is "authenticated".
      this.#session.isAuthenticated = true;

      return {
        action: 'LOGIN',
        success: true,
        info: null,
      };
    } catch (error) {
      errorObject = serializeError(error);
    }

    return {
      action: 'LOGIN',
      success: false,
      info: {
        error: errorObject,
      },
    };
  }

  /**
   * Pfsense - Logout.
   *
   * @returns {PfsenseLogoutReturns}
   *
   * @since 1.0.0
   */
  public async logout(): PfsenseLogoutReturns {
    let errorObject;

    try {
      // Check if this session is not authenticated.
      if (!await this.isAuthenticated()) {
        return {
          action: 'LOGOUT',
          success: true,
          info: null,
        };
      }

      // Dispose of the SSH session.
      this.#session.sshClient.dispose();

      // Mark that this session is not "authenticated".
      this.#session.isAuthenticated = false;

      return {
        action: 'LOGOUT',
        success: true,
        info: null,
      };
    } catch (error) {
      errorObject = serializeError(error);
    }

    return {
      action: 'LOGOUT',
      success: false,
      info: {
        error: errorObject,
      },
    };
  }

  /**
   * Pfsense - Reload filter.
   *
   * @returns {PfsenseReloadFilterReturns}
   *
   * @since 1.0.0
   */
  public async reloadFilter(): PfsenseReloadFilterReturns {
    let errorObject;

    try {
      // Check if this session is not authenticated.
      if (!await this.isAuthenticated()) {
        return {
          action: 'RELOAD_FILTER',
          success: false,
          info: {
            message: 'Failed to authenticate to pfSense via SSH',
          },
        };
      }

      const response = await this.#session.sshClient.execCommand('/etc/rc.filter_configure');

      return {
        action: 'RELOAD_FILTER',
        success: true,
        info: response,
      };
    } catch (error) {
      errorObject = serializeError(error);
    }

    return {
      action: 'RELOAD_FILTER',
      success: false,
      info: {
        error: errorObject,
      },
    };
  }

  /**
   * Pfsense - System information.
   *
   * @returns {PfsenseSystemInformationReturns}
   *
   * @since 1.0.0
   */
  public async systemInformation(): PfsenseSystemInformationReturns {
    let errorObject;

    try {
      // Check if this session is not authenticated.
      if (!await this.isAuthenticated()) {
        return {
          action: 'SYSTEM_INFORMATION',
          success: false,
          info: {
            message: 'Failed to authenticate to pfSense via SSH',
          },
        };
      }

      const response = await this.#session.sshClient.execCommand('uname -a');

      return {
        action: 'SYSTEM_INFORMATION',
        success: true,
        info: response,
      };
    } catch (error) {
      errorObject = serializeError(error);
    }

    return {
      action: 'SYSTEM_INFORMATION',
      success: false,
      info: {
        error: errorObject,
      },
    };
  }

  /**
   * Pfsense - Update dyndns.
   *
   * @returns {PfsenseUpdateDyndnsReturns}
   *
   * @since 1.0.0
   */
  public async updateDyndns(): PfsenseUpdateDyndnsReturns {
    let errorObject;

    try {
      // Check if this session is not authenticated.
      if (!await this.isAuthenticated()) {
        return {
          action: 'UPDATE_DYNDNS',
          success: false,
          info: {
            message: 'Failed to authenticate to pfSense via SSH',
          },
        };
      }

      const response = await this.#session.sshClient.execCommand('/etc/rc.dyndns.update');

      return {
        action: 'UPDATE_DYNDNS',
        success: true,
        info: response,
      };
    } catch (error) {
      errorObject = serializeError(error);
    }

    return {
      action: 'UPDATE_DYNDNS',
      success: false,
      info: {
        error: errorObject,
      },
    };
  }

  /**
   * Pfsense - Wake on lan.
   *
   * @param {PfsenseWakeOnLanBroadcastAddress} broadcastAddress - Broadcast address.
   * @param {PfsenseWakeOnLanMacAddress}       macAddress       - Mac address.
   *
   * @returns {PfsenseWakeOnLanReturns}
   *
   * @since 1.0.0
   */
  public async wakeOnLan(broadcastAddress: PfsenseWakeOnLanBroadcastAddress, macAddress: PfsenseWakeOnLanMacAddress): PfsenseWakeOnLanReturns {
    let errorObject;

    try {
      // Check if this session is not authenticated.
      if (!await this.isAuthenticated()) {
        return {
          action: 'WAKE_ON_LAN',
          success: false,
          info: {
            message: 'Failed to authenticate to pfSense via SSH',
          },
        };
      }

      const response = await this.#session.sshClient.execCommand(`wol -i ${broadcastAddress} ${macAddress}`);

      return {
        action: 'WAKE_ON_LAN',
        success: true,
        info: response,
      };
    } catch (error) {
      errorObject = serializeError(error);
    }

    return {
      action: 'WAKE_ON_LAN',
      success: false,
      info: {
        error: errorObject,
      },
    };
  }

  /**
   * Pfsense - Is authenticated.
   *
   * @private
   *
   * @returns {PfsenseIsAuthenticatedReturns}
   *
   * @since 1.0.0
   */
  private async isAuthenticated(): PfsenseIsAuthenticatedReturns {
    try {
      await this.#session.sshClient.execCommand('whoami');

      // Mark that this session is "authenticated".
      this.#session.isAuthenticated = true;

      return true;
    } catch {
      // Mark that this session is not "authenticated".
      this.#session.isAuthenticated = false;

      return false;
    }
  }
}
