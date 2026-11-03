import { Runner as Pfsense } from './api.js';
import { logError } from './logger.js';
import {
  buildEventNotification,
  buildSecretsRemovedNotification,
  buildSignInLockedNotification,
  buildTestNotification,
  commonNotificationEvents,
  sendNotification,
} from './notifications.js';

import type {
  Lib_Notifier_ActionLabels,
  Lib_Notifier_App,
  Lib_Notifier_NotificationEvents,
  Lib_Notifier_Runner_CheckCommandTimeoutMilliseconds,
  Lib_Notifier_Runner_CheckInProgress,
  Lib_Notifier_Runner_CheckIntervalMilliseconds,
  Lib_Notifier_Runner_CheckPfsense_Connection,
  Lib_Notifier_Runner_CheckPfsense_Instance,
  Lib_Notifier_Runner_CheckPfsense_LoginResponse,
  Lib_Notifier_Runner_CheckPfsense_Reachable,
  Lib_Notifier_Runner_CheckPfsense_Returns,
  Lib_Notifier_Runner_CheckPfsense_SystemInformationResponse,
  Lib_Notifier_Runner_CheckPfsenseOnce_Returns,
  Lib_Notifier_Runner_CheckTimer,
  Lib_Notifier_Runner_Constructor_Dependencies,
  Lib_Notifier_Runner_Constructor_State,
  Lib_Notifier_Runner_Deliver_Deliveries,
  Lib_Notifier_Runner_Deliver_Error,
  Lib_Notifier_Runner_Deliver_Notification,
  Lib_Notifier_Runner_Deliver_Reason,
  Lib_Notifier_Runner_Deliver_Returns,
  Lib_Notifier_Runner_Dependencies,
  Lib_Notifier_Runner_FailedChecks,
  Lib_Notifier_Runner_GetEvents_Returns,
  Lib_Notifier_Runner_LockedAddresses,
  Lib_Notifier_Runner_LockWindowMilliseconds,
  Lib_Notifier_Runner_NotifyActionFailed_Action,
  Lib_Notifier_Runner_NotifyActionFailed_Reason,
  Lib_Notifier_Runner_NotifyActionFailed_Returns,
  Lib_Notifier_Runner_NotifySecretsRemoved_Items,
  Lib_Notifier_Runner_NotifySecretsRemoved_Returns,
  Lib_Notifier_Runner_NotifySignInLimit_Address,
  Lib_Notifier_Runner_NotifySignInLimit_Key,
  Lib_Notifier_Runner_NotifySignInLimit_LockedAt,
  Lib_Notifier_Runner_NotifySignInLimit_Now,
  Lib_Notifier_Runner_NotifySignInLimit_Returns,
  Lib_Notifier_Runner_NotifyWakeOnLanSent_BroadcastAddress,
  Lib_Notifier_Runner_NotifyWakeOnLanSent_MacAddress,
  Lib_Notifier_Runner_NotifyWakeOnLanSent_Returns,
  Lib_Notifier_Runner_PfsenseDown,
  Lib_Notifier_Runner_SendTest_Delivery,
  Lib_Notifier_Runner_SendTest_Id,
  Lib_Notifier_Runner_SendTest_Result,
  Lib_Notifier_Runner_SendTest_Returns,
  Lib_Notifier_Runner_Start_Returns,
  Lib_Notifier_Runner_State,
  Lib_Notifier_Runner_Stop_Returns,
} from '@/types/lib/notifier.d.ts';

/**
 * Lib - Notifier - App.
 *
 * Names pfSense Actions in every notification and payload it sends.
 * The key matches the ntfy-reverse-proxy interpreter for this app.
 *
 * @since 2.0.0
 */
const app: Lib_Notifier_App = {
  key: 'pfsense-actions',
  name: 'pfSense Actions',
};

/**
 * Lib - Notifier - Action Labels.
 *
 * Names each action in plain words for the "Action failed" message.
 * The keys are the activity log's action names.
 *
 * @since 2.0.0
 */
const actionLabels: Lib_Notifier_ActionLabels = {
  'connectivity-check': 'The connectivity check',
  'reachability-check': 'A ping',
  'system-information': 'Reading system information',
  'wake-on-lan': 'Wake-on-LAN',
};

/**
 * Lib - Notifier - Notification Events.
 *
 * Lists the events a destination can listen to, starting with the ones every app sends.
 * Action failures and Wake-on-LAN packets are off by default because they can be frequent.
 *
 * @since 2.0.0
 */
export const notificationEvents: Lib_Notifier_NotificationEvents = [
  ...commonNotificationEvents,
  {
    defaultEnabled: true,
    description: 'The scheduled check couldn\'t sign in to pfSense over SSH.',
    key: 'pfsense-unreachable',
    label: 'pfSense can\'t be reached',
    priority: 'high',
    tags: ['warning'],
  },
  {
    defaultEnabled: true,
    description: 'The scheduled check reached pfSense after it was down.',
    key: 'pfsense-reachable',
    label: 'pfSense reachable again',
    priority: 'default',
    tags: ['white_check_mark'],
  },
  {
    defaultEnabled: false,
    description: 'A ping, Wake-on-LAN, or system request failed.',
    key: 'action-failed',
    label: 'Action failed',
    priority: 'default',
    tags: ['x'],
  },
  {
    defaultEnabled: false,
    description: 'A wake packet went out.',
    key: 'wol-sent',
    label: 'Wake-on-LAN sent',
    priority: 'low',
    tags: ['zap'],
  },
];

/**
 * Lib - Notifier.
 *
 * Sends pfSense Actions events to every destination that listens to them.
 * It also checks pfSense on a schedule so a firewall that stops answering is reported.
 *
 * @since 2.0.0
 */
export class Runner {
  /**
   * Lib - Notifier - Check Command Timeout Milliseconds.
   *
   * Stops either SSH probe in a scheduled check after 30 seconds.
   * The next five-minute interval can then try a fresh session.
   *
   * @private
   *
   * @since 2.0.0
   */
  static readonly #checkCommandTimeoutMilliseconds: Lib_Notifier_Runner_CheckCommandTimeoutMilliseconds = 30 * 1000;

  /**
   * Lib - Notifier - Check Interval Milliseconds.
   *
   * Checks pfSense every five minutes while a destination listens for it.
   * Two failed checks in a row count as unreachable.
   *
   * @private
   *
   * @since 2.0.0
   */
  static readonly #checkIntervalMilliseconds: Lib_Notifier_Runner_CheckIntervalMilliseconds = 5 * 60 * 1000;

  /**
   * Lib - Notifier - Lock Window Milliseconds.
   *
   * Reports each locked address once per 15-minute sign-in window.
   * More failures inside the window don't send another alert.
   *
   * @private
   *
   * @since 2.0.0
   */
  static readonly #lockWindowMilliseconds: Lib_Notifier_Runner_LockWindowMilliseconds = 15 * 60 * 1000;

  /**
   * Lib - Notifier - Check Timer.
   *
   * Holds the scheduled pfSense check while the server runs.
   * It never keeps the process alive on its own.
   *
   * @private
   *
   * @since 2.0.0
   */
  #checkTimer: Lib_Notifier_Runner_CheckTimer = undefined;

  /**
   * Lib - Notifier - Check In Progress.
   *
   * Prevents an interval from opening another SSH session while one check is running.
   * The flag is released after success, failure, or an unexpected exception.
   *
   * @private
   *
   * @since 2.0.0
   */
  #checkInProgress: Lib_Notifier_Runner_CheckInProgress = false;

  /**
   * Lib - Notifier - Dependencies.
   *
   * Sends notifications and opens pfSense sessions.
   * Tests replace both so nothing leaves the machine.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #dependencies: Lib_Notifier_Runner_Dependencies;

  /**
   * Lib - Notifier - Failed Checks.
   *
   * Counts scheduled checks that failed in a row.
   * A successful check resets it.
   *
   * @private
   *
   * @since 2.0.0
   */
  #failedChecks: Lib_Notifier_Runner_FailedChecks = 0;

  /**
   * Lib - Notifier - Locked Addresses.
   *
   * Remembers when each address was last reported as locked.
   * Old entries are dropped when the next lock is reported.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #lockedAddresses: Lib_Notifier_Runner_LockedAddresses = new Map();

  /**
   * Lib - Notifier - Pfsense Down.
   *
   * Remembers that "pfSense can't be reached" was sent.
   * The next successful check then sends "pfSense reachable again".
   *
   * @private
   *
   * @since 2.0.0
   */
  #pfsenseDown: Lib_Notifier_Runner_PfsenseDown = false;

  /**
   * Lib - Notifier - State.
   *
   * Reads destinations and their secrets, and records each delivery attempt.
   * Destinations waiting for a removed secret are never sent to.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #state: Lib_Notifier_Runner_State;

  /**
   * Lib - Notifier - Constructor.
   *
   * Binds the notifier to shared state.
   * The scheduled check waits until start is called.
   *
   * @param {Lib_Notifier_Runner_Constructor_State}        state        - State.
   * @param {Lib_Notifier_Runner_Constructor_Dependencies} dependencies - Dependencies.
   *
   * @since 2.0.0
   */
  public constructor(state: Lib_Notifier_Runner_Constructor_State, dependencies: Lib_Notifier_Runner_Constructor_Dependencies = {}) {
    this.#state = state;
    this.#dependencies = {
      createPfsense: dependencies['createPfsense'] ?? ((connection) => new Pfsense(connection)),
      send: dependencies['send'] ?? sendNotification,
    };

    return;
  }

  /**
   * Lib - Notifier - Check pfSense.
   *
   * Signs in to pfSense over SSH and reads its system information, like the console test.
   * Only state changes are reported: down after two failures, then back up once.
   *
   * @returns {Lib_Notifier_Runner_CheckPfsense_Returns}
   *
   * @since 2.0.0
   */
  public async checkPfsense(): Lib_Notifier_Runner_CheckPfsense_Returns {
    if (this.#checkInProgress === true) {
      return;
    }

    this.#checkInProgress = true;

    try {
      await this.checkPfsenseOnce();
    } finally {
      this.#checkInProgress = false;
    }

    return;
  }

  /**
   * Lib - Notifier - Check pfSense Once.
   *
   * Runs one scheduled SSH check after the overlap guard has claimed it.
   * The system probes receive the scheduled check's command deadline.
   *
   * @private
   *
   * @returns {Lib_Notifier_Runner_CheckPfsenseOnce_Returns}
   *
   * @since 2.0.0
   */
  private async checkPfsenseOnce(): Lib_Notifier_Runner_CheckPfsenseOnce_Returns {
    const connection: Lib_Notifier_Runner_CheckPfsense_Connection = this.#state.getPfsenseConnection();

    if (connection === undefined || this.#state.wantsNotification([
      'pfsense-reachable',
      'pfsense-unreachable',
    ]) === false) {
      return;
    }

    let instance: Lib_Notifier_Runner_CheckPfsense_Instance = undefined;
    let reachable: Lib_Notifier_Runner_CheckPfsense_Reachable = false;

    try {
      instance = this.#dependencies.createPfsense(connection);

      const loginResponse: Lib_Notifier_Runner_CheckPfsense_LoginResponse = await instance.login();

      if (loginResponse['success'] === true) {
        const systemInformationResponse: Lib_Notifier_Runner_CheckPfsense_SystemInformationResponse = await instance.systemInformation(Runner.#checkCommandTimeoutMilliseconds);

        reachable = systemInformationResponse['success'];
      }
    } catch {
      reachable = false;
    } finally {
      if (instance !== undefined) {
        try {
          await instance.logout();
        } catch {
          // A session that failed to open has nothing to close.
        }
      }
    }

    if (reachable === true) {
      this.#failedChecks = 0;

      if (this.#pfsenseDown === true) {
        this.#pfsenseDown = false;
        this.deliver(buildEventNotification(notificationEvents[3]!, `pfSense at ${connection['pfsenseSshIp']}:${String(connection['pfsenseSshPort'])} answered the scheduled check again.`, {
          address: connection['pfsenseSshIp'],
          port: connection['pfsenseSshPort'],
        }));
      }

      return;
    }

    this.#failedChecks += 1;

    if (this.#failedChecks >= 2 && this.#pfsenseDown === false) {
      this.#pfsenseDown = true;
      this.deliver(buildEventNotification(notificationEvents[2]!, `Couldn't sign in to pfSense at ${connection['pfsenseSshIp']}:${String(connection['pfsenseSshPort'])} over SSH in two checks in a row. Actions fail until it answers again.`, {
        address: connection['pfsenseSshIp'],
        port: connection['pfsenseSshPort'],
      }));
    }

    return;
  }

  /**
   * Lib - Notifier - Get Events.
   *
   * Lists the events the Notifications page offers.
   * The order is the order shown in the dialog.
   *
   * @returns {Lib_Notifier_Runner_GetEvents_Returns}
   *
   * @since 2.0.0
   */
  public getEvents(): Lib_Notifier_Runner_GetEvents_Returns {
    return notificationEvents;
  }

  /**
   * Lib - Notifier - Notify Action Failed.
   *
   * Reports a failed action from the API or console.
   * Destinations only get it when they turned the event on.
   *
   * @param {Lib_Notifier_Runner_NotifyActionFailed_Action} action - Action.
   * @param {Lib_Notifier_Runner_NotifyActionFailed_Reason} reason - Reason.
   *
   * @returns {Lib_Notifier_Runner_NotifyActionFailed_Returns}
   *
   * @since 2.0.0
   */
  public notifyActionFailed(action: Lib_Notifier_Runner_NotifyActionFailed_Action, reason: Lib_Notifier_Runner_NotifyActionFailed_Reason): Lib_Notifier_Runner_NotifyActionFailed_Returns {
    this.deliver(buildEventNotification(notificationEvents[4]!, `${actionLabels[action] ?? 'An action'} failed: ${reason}`, {
      action,
      reason,
    }));

    return;
  }

  /**
   * Lib - Notifier - Notify Secrets Removed.
   *
   * Reports the secrets a lost encryption key removed at startup.
   * It reaches only destinations that didn't need one of those secrets.
   *
   * @param {Lib_Notifier_Runner_NotifySecretsRemoved_Items} items - Items.
   *
   * @returns {Lib_Notifier_Runner_NotifySecretsRemoved_Returns}
   *
   * @since 2.0.0
   */
  public notifySecretsRemoved(items: Lib_Notifier_Runner_NotifySecretsRemoved_Items): Lib_Notifier_Runner_NotifySecretsRemoved_Returns {
    if (items.length === 0) {
      return;
    }

    this.deliver(buildSecretsRemovedNotification(app, 'encryption key', items));

    return;
  }

  /**
   * Lib - Notifier - Notify Sign In Limit.
   *
   * Reports an address that reached the failed sign-in limit, once per window.
   * Only sign-in attempts count; setup-code attempts are left out.
   *
   * @param {Lib_Notifier_Runner_NotifySignInLimit_Key} key - Key.
   *
   * @returns {Lib_Notifier_Runner_NotifySignInLimit_Returns}
   *
   * @since 2.0.0
   */
  public notifySignInLimit(key: Lib_Notifier_Runner_NotifySignInLimit_Key): Lib_Notifier_Runner_NotifySignInLimit_Returns {
    if (key.startsWith('sign-in:') === false) {
      return;
    }

    const address: Lib_Notifier_Runner_NotifySignInLimit_Address = key.slice('sign-in:'.length);
    const now: Lib_Notifier_Runner_NotifySignInLimit_Now = Date.now();
    const lockedAt: Lib_Notifier_Runner_NotifySignInLimit_LockedAt = this.#lockedAddresses.get(address);

    for (const lockedAddress of [...this.#lockedAddresses.keys()]) {
      if ((this.#lockedAddresses.get(lockedAddress) ?? 0) <= now - Runner.#lockWindowMilliseconds) {
        this.#lockedAddresses.delete(lockedAddress);
      }
    }

    if (lockedAt !== undefined && lockedAt > now - Runner.#lockWindowMilliseconds) {
      return;
    }

    this.#lockedAddresses.set(address, now);

    this.deliver(buildSignInLockedNotification(address));

    return;
  }

  /**
   * Lib - Notifier - Notify Wake On Lan Sent.
   *
   * Reports a wake packet that pfSense sent.
   * Destinations only get it when they turned the event on.
   *
   * @param {Lib_Notifier_Runner_NotifyWakeOnLanSent_MacAddress}       macAddress       - Mac address.
   * @param {Lib_Notifier_Runner_NotifyWakeOnLanSent_BroadcastAddress} broadcastAddress - Broadcast address.
   *
   * @returns {Lib_Notifier_Runner_NotifyWakeOnLanSent_Returns}
   *
   * @since 2.0.0
   */
  public notifyWakeOnLanSent(macAddress: Lib_Notifier_Runner_NotifyWakeOnLanSent_MacAddress, broadcastAddress: Lib_Notifier_Runner_NotifyWakeOnLanSent_BroadcastAddress): Lib_Notifier_Runner_NotifyWakeOnLanSent_Returns {
    this.deliver(buildEventNotification(notificationEvents[5]!, `Sent a wake packet to ${macAddress} on ${broadcastAddress}.`, {
      broadcastAddress,
      macAddress,
    }));

    return;
  }

  /**
   * Lib - Notifier - Send Test.
   *
   * Sends the test message to one destination and waits for the answer.
   * The result is recorded on the destination like any other attempt.
   *
   * @param {Lib_Notifier_Runner_SendTest_Id} id - Id.
   *
   * @returns {Lib_Notifier_Runner_SendTest_Returns}
   *
   * @since 2.0.0
   */
  public async sendTest(id: Lib_Notifier_Runner_SendTest_Id): Lib_Notifier_Runner_SendTest_Returns {
    const delivery: Lib_Notifier_Runner_SendTest_Delivery = this.#state.getNotificationDelivery(id);

    if (typeof delivery === 'string') {
      return delivery;
    }

    const result: Lib_Notifier_Runner_SendTest_Result = await this.#dependencies.send(app, delivery['target'], buildTestNotification(app));

    this.#state.recordNotificationAttempt(id, (result['delivered'] === true) ? null : result['message']);

    return result;
  }

  /**
   * Lib - Notifier - Start.
   *
   * Starts the scheduled pfSense check.
   * The first check runs five minutes after startup.
   *
   * @returns {Lib_Notifier_Runner_Start_Returns}
   *
   * @since 2.0.0
   */
  public start(): Lib_Notifier_Runner_Start_Returns {
    if (this.#checkTimer !== undefined) {
      return;
    }

    this.#checkTimer = setInterval(() => {
      void this.checkPfsense();

      return;
    }, Runner.#checkIntervalMilliseconds);
    this.#checkTimer.unref();

    return;
  }

  /**
   * Lib - Notifier - Stop.
   *
   * Stops the scheduled pfSense check.
   * Sends already in flight still finish.
   *
   * @returns {Lib_Notifier_Runner_Stop_Returns}
   *
   * @since 2.0.0
   */
  public stop(): Lib_Notifier_Runner_Stop_Returns {
    if (this.#checkTimer !== undefined) {
      clearInterval(this.#checkTimer);
      this.#checkTimer = undefined;
    }

    return;
  }

  /**
   * Lib - Notifier - Deliver.
   *
   * Sends one notification to every destination listening to its event, without waiting.
   * Each result is recorded on its destination, and a failure never reaches the caller.
   *
   * @param {Lib_Notifier_Runner_Deliver_Notification} notification - Notification.
   *
   * @private
   *
   * @returns {Lib_Notifier_Runner_Deliver_Returns}
   *
   * @since 2.0.0
   */
  private deliver(notification: Lib_Notifier_Runner_Deliver_Notification): Lib_Notifier_Runner_Deliver_Returns {
    const deliveries: Lib_Notifier_Runner_Deliver_Deliveries = this.#state.getNotificationDeliveries(notification['event']);

    for (const delivery of deliveries) {
      void this.#dependencies.send(app, delivery['target'], notification).then((result) => {
        this.#state.recordNotificationAttempt(delivery['id'], (result['delivered'] === true) ? null : result['message']);

        return;
      }).catch((error: Lib_Notifier_Runner_Deliver_Error) => {
        const reason: Lib_Notifier_Runner_Deliver_Reason = (error instanceof Error) ? error.message : String(error);

        logError(`A notification to ${delivery['name']} failed: ${reason}`);

        return;
      });
    }

    return;
  }
}
