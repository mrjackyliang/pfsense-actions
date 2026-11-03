import rateLimit from 'express-rate-limit';

import { Runner as Pfsense } from '../lib/api.js';
import {
  handleAsync,
  sendError,
  sendValidationError,
} from '../lib/http.js';
import { logError } from '../lib/logger.js';
import { ping, wakeOnLan } from '../lib/schema.js';

import type {
  Routes_Actions_Runner_Access,
  Routes_Actions_Runner_CloseSession_Instance,
  Routes_Actions_Runner_CloseSession_Returns,
  Routes_Actions_Runner_Constructor_Access,
  Routes_Actions_Runner_Constructor_Notifier,
  Routes_Actions_Runner_Constructor_State,
  Routes_Actions_Runner_GetConnection_Connection,
  Routes_Actions_Runner_GetConnection_Message,
  Routes_Actions_Runner_GetConnection_Response,
  Routes_Actions_Runner_GetConnection_Returns,
  Routes_Actions_Runner_Notifier,
  Routes_Actions_Runner_PingUntilReachable_Instance,
  Routes_Actions_Runner_PingUntilReachable_IpAddress,
  Routes_Actions_Runner_PingUntilReachable_IsReachable,
  Routes_Actions_Runner_PingUntilReachable_PingResponse,
  Routes_Actions_Runner_PingUntilReachable_Remaining,
  Routes_Actions_Runner_PingUntilReachable_Returns,
  Routes_Actions_Runner_PingUntilReachable_Strict,
  Routes_Actions_Runner_RecordActivity_Action,
  Routes_Actions_Runner_RecordActivity_ActorId,
  Routes_Actions_Runner_RecordActivity_Outcome,
  Routes_Actions_Runner_RecordActivity_Response,
  Routes_Actions_Runner_RecordActivity_Returns,
  Routes_Actions_Runner_RecordActivity_Summary,
  Routes_Actions_Runner_Register_ActionLimiter,
  Routes_Actions_Runner_Register_App,
  Routes_Actions_Runner_Register_Returns,
  Routes_Actions_Runner_RouteConnectivity_Connection,
  Routes_Actions_Runner_RouteConnectivity_Instance,
  Routes_Actions_Runner_RouteConnectivity_LoginResponse,
  Routes_Actions_Runner_RouteConnectivity_Request,
  Routes_Actions_Runner_RouteConnectivity_Response,
  Routes_Actions_Runner_RouteConnectivity_Returns,
  Routes_Actions_Runner_RouteConnectivity_SystemInformationResponse,
  Routes_Actions_Runner_RoutePing_Connection,
  Routes_Actions_Runner_RoutePing_HttpStatus,
  Routes_Actions_Runner_RoutePing_Instance,
  Routes_Actions_Runner_RoutePing_LoginResponse,
  Routes_Actions_Runner_RoutePing_Request,
  Routes_Actions_Runner_RoutePing_RequestBody,
  Routes_Actions_Runner_RoutePing_Response,
  Routes_Actions_Runner_RoutePing_Returns,
  Routes_Actions_Runner_RouteSystem_Connection,
  Routes_Actions_Runner_RouteSystem_Instance,
  Routes_Actions_Runner_RouteSystem_LoginResponse,
  Routes_Actions_Runner_RouteSystem_Request,
  Routes_Actions_Runner_RouteSystem_Response,
  Routes_Actions_Runner_RouteSystem_Returns,
  Routes_Actions_Runner_RouteSystem_SystemInformationResponse,
  Routes_Actions_Runner_RouteWol_Connection,
  Routes_Actions_Runner_RouteWol_Instance,
  Routes_Actions_Runner_RouteWol_LoginResponse,
  Routes_Actions_Runner_RouteWol_Request,
  Routes_Actions_Runner_RouteWol_RequestBody,
  Routes_Actions_Runner_RouteWol_Response,
  Routes_Actions_Runner_RouteWol_Returns,
  Routes_Actions_Runner_RouteWol_WakeOnLanResponse,
  Routes_Actions_Runner_SendUnexpectedError_Error,
  Routes_Actions_Runner_SendUnexpectedError_Response,
  Routes_Actions_Runner_SendUnexpectedError_Returns,
  Routes_Actions_Runner_State,
} from '@/types/routes/actions.d.ts';

/**
 * Routes - Actions.
 *
 * Registers the token-authenticated pfSense actions and owns their SSH lifecycles.
 * Each action lives under /api/v1, and its original root path stays as an alias.
 *
 * @since 2.0.0
 */
export class Runner {
  /**
   * Routes - Actions - Access.
   *
   * Authenticates the Bearer token and enforces the exact scope of each action.
   * Browser sessions cannot run actions.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #access: Routes_Actions_Runner_Access;

  /**
   * Routes - Actions - Notifier.
   *
   * Reports failed actions and sent wake packets to the destinations that want them.
   * Both events are off by default.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #notifier: Routes_Actions_Runner_Notifier;

  /**
   * Routes - Actions - State.
   *
   * Supplies the saved SSH connection and records each action in the activity log.
   * Console changes become visible without rebuilding the controller.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #state: Routes_Actions_Runner_State;

  /**
   * Routes - Actions - Constructor.
   *
   * Creates one route controller around shared state and access checks.
   * No SSH session or network listener is opened during construction.
   *
   * @param {Routes_Actions_Runner_Constructor_State}    state    - State.
   * @param {Routes_Actions_Runner_Constructor_Access}   access   - Access.
   * @param {Routes_Actions_Runner_Constructor_Notifier} notifier - Notifier.
   *
   * @since 2.0.0
   */
  public constructor(state: Routes_Actions_Runner_Constructor_State, access: Routes_Actions_Runner_Constructor_Access, notifier: Routes_Actions_Runner_Constructor_Notifier) {
    this.#access = access;
    this.#notifier = notifier;
    this.#state = state;

    return;
  }

  /**
   * Routes - Actions - Register.
   *
   * Places the per-address rate limit and token check ahead of every action.
   * Old root paths share the same handlers, so existing clients keep working.
   *
   * @param {Routes_Actions_Runner_Register_App} app - App.
   *
   * @returns {Routes_Actions_Runner_Register_Returns}
   *
   * @since 2.0.0
   */
  public register(app: Routes_Actions_Runner_Register_App): Routes_Actions_Runner_Register_Returns {
    const actionLimiter: Routes_Actions_Runner_Register_ActionLimiter = rateLimit({
      handler: (_request, response) => {
        sendError(response, 429, 'rate_limited', 'Too many requests. Wait a few seconds and try again.');

        return;
      },
      legacyHeaders: false,
      limit: 3,
      standardHeaders: true,
      windowMs: 10 * 1000,
    });

    app.get([
      '/api/v1/connectivity',
      '/',
    ], actionLimiter, this.#access.requireToken('pfsense:read'), handleAsync(this['routeConnectivity'].bind(this)));

    app.get([
      '/api/v1/system',
      '/system',
    ], actionLimiter, this.#access.requireToken('pfsense:read'), handleAsync(this['routeSystem'].bind(this)));

    app.post([
      '/api/v1/ping',
      '/ping',
    ], actionLimiter, this.#access.requireToken('reachability:read'), handleAsync(this['routePing'].bind(this)));

    app.post([
      '/api/v1/wol',
      '/wol',
    ], actionLimiter, this.#access.requireToken('wol:execute'), handleAsync(this['routeWol'].bind(this)));

    return;
  }

  /**
   * Routes - Actions - Close Session.
   *
   * Attempts SSH cleanup after every route, including failure paths.
   * Routes that fail before constructing a client safely skip the cleanup call.
   *
   * @param {Routes_Actions_Runner_CloseSession_Instance} instance - Instance.
   *
   * @private
   *
   * @returns {Routes_Actions_Runner_CloseSession_Returns}
   *
   * @since 2.0.0
   */
  private async closeSession(instance: Routes_Actions_Runner_CloseSession_Instance): Routes_Actions_Runner_CloseSession_Returns {
    if (instance !== undefined) {
      await instance.logout();
    }

    return;
  }

  /**
   * Routes - Actions - Get Connection.
   *
   * Returns the saved SSH connection, or answers 503 when none is configured yet.
   * Actions never guess a connection from the environment at request time.
   *
   * @param {Routes_Actions_Runner_GetConnection_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Actions_Runner_GetConnection_Returns}
   *
   * @since 2.0.0
   */
  private getConnection(response: Routes_Actions_Runner_GetConnection_Response): Routes_Actions_Runner_GetConnection_Returns {
    const connection: Routes_Actions_Runner_GetConnection_Connection = this.#state.getPfsenseConnection();

    if (connection === undefined) {
      const message: Routes_Actions_Runner_GetConnection_Message = (this.#state.hasConnection() === true) ? 'Enter the pfSense password or private key again in the console.' : 'Set up the pfSense connection in the console first.';

      sendError(response, 503, 'connection_not_configured', message);

      return undefined;
    }

    return connection;
  }

  /**
   * Routes - Actions - Ping Until Reachable.
   *
   * Preserves sequential polling without awaiting inside a loop.
   * Recursion stops after success or after the requested count is exhausted.
   *
   * @param {Routes_Actions_Runner_PingUntilReachable_Instance}  instance  - Instance.
   * @param {Routes_Actions_Runner_PingUntilReachable_IpAddress} ipAddress - Ip address.
   * @param {Routes_Actions_Runner_PingUntilReachable_Strict}    strict    - Strict.
   * @param {Routes_Actions_Runner_PingUntilReachable_Remaining} remaining - Remaining.
   *
   * @private
   *
   * @returns {Routes_Actions_Runner_PingUntilReachable_Returns}
   *
   * @since 2.0.0
   */
  private async pingUntilReachable(instance: Routes_Actions_Runner_PingUntilReachable_Instance, ipAddress: Routes_Actions_Runner_PingUntilReachable_IpAddress, strict: Routes_Actions_Runner_PingUntilReachable_Strict, remaining: Routes_Actions_Runner_PingUntilReachable_Remaining): Routes_Actions_Runner_PingUntilReachable_Returns {
    if (remaining <= 0) {
      return 503;
    }

    const pingResponse: Routes_Actions_Runner_PingUntilReachable_PingResponse = await instance.ping(ipAddress, 5);

    if (pingResponse['success'] === false) {
      return 502;
    }

    const isReachable: Routes_Actions_Runner_PingUntilReachable_IsReachable = (
      strict === false
      && pingResponse['info'].stdout.includes(', 100.0% packet loss') === false
    )
    || (
      strict === true
      && pingResponse['info'].stdout.includes(', 0.0% packet loss') === true
    );

    if (isReachable === true) {
      return 200;
    }

    return this.pingUntilReachable(instance, ipAddress, strict, remaining - 1);
  }

  /**
   * Routes - Actions - Record Activity.
   *
   * Adds a curated action result attributed to the token that ran it.
   * Request bodies, network targets, SSH output, and credentials never enter the record.
   *
   * @param {Routes_Actions_Runner_RecordActivity_Response} response - Response.
   * @param {Routes_Actions_Runner_RecordActivity_Action}   action   - Action.
   * @param {Routes_Actions_Runner_RecordActivity_Outcome}  outcome  - Outcome.
   * @param {Routes_Actions_Runner_RecordActivity_Summary}  summary  - Summary.
   *
   * @private
   *
   * @returns {Routes_Actions_Runner_RecordActivity_Returns}
   *
   * @since 2.0.0
   */
  private recordActivity(response: Routes_Actions_Runner_RecordActivity_Response, action: Routes_Actions_Runner_RecordActivity_Action, outcome: Routes_Actions_Runner_RecordActivity_Outcome, summary: Routes_Actions_Runner_RecordActivity_Summary): Routes_Actions_Runner_RecordActivity_Returns {
    const actorId: Routes_Actions_Runner_RecordActivity_ActorId = response.locals['actorId'];

    this.#state.recordActivity(actorId, action, 'access', outcome, summary);

    return;
  }

  /**
   * Routes - Actions - Route Connectivity.
   *
   * Confirms the whole path from token to firewall by reading pfSense system information.
   * The SSH session is closed whether the check succeeds or fails.
   *
   * @param {Routes_Actions_Runner_RouteConnectivity_Request}  _request - Request.
   * @param {Routes_Actions_Runner_RouteConnectivity_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Actions_Runner_RouteConnectivity_Returns}
   *
   * @since 2.0.0
   */
  private async routeConnectivity(_request: Routes_Actions_Runner_RouteConnectivity_Request, response: Routes_Actions_Runner_RouteConnectivity_Response): Routes_Actions_Runner_RouteConnectivity_Returns {
    const connection: Routes_Actions_Runner_RouteConnectivity_Connection = this.getConnection(response);

    if (connection === undefined) {
      return;
    }

    let instance: Routes_Actions_Runner_RouteConnectivity_Instance = undefined;

    try {
      instance = new Pfsense(connection);

      const loginResponse: Routes_Actions_Runner_RouteConnectivity_LoginResponse = await instance.login();

      if (loginResponse['success'] === false) {
        sendError(response, 502, 'pfsense_unavailable', 'pfSense Actions couldn\'t sign in to pfSense over SSH.');

        this.#notifier.notifyActionFailed('connectivity-check', 'pfSense Actions couldn\'t sign in to pfSense over SSH.');

        this.recordActivity(response, 'connectivity-check', 'failed', 'pfSense connectivity check failed');

        return;
      }

      const systemInformationResponse: Routes_Actions_Runner_RouteConnectivity_SystemInformationResponse = await instance.systemInformation();

      if (systemInformationResponse['success'] === false) {
        sendError(response, 502, 'command_failed', 'The pfSense command failed.');

        this.#notifier.notifyActionFailed('connectivity-check', 'The pfSense command failed.');

        this.recordActivity(response, 'connectivity-check', 'failed', 'pfSense connectivity check failed');

        return;
      }

      response.json({
        connected: true,
      });

      this.recordActivity(response, 'connectivity-check', 'succeeded', 'Completed pfSense connectivity check');
    } catch (error) {
      this.sendUnexpectedError(response, error);

      this.#notifier.notifyActionFailed('connectivity-check', 'Something unexpected went wrong.');

      this.recordActivity(response, 'connectivity-check', 'failed', 'pfSense connectivity check failed unexpectedly');
    } finally {
      await this.closeSession(instance);
    }

    return;
  }

  /**
   * Routes - Actions - Route Ping.
   *
   * Pings sequentially until the requested success condition or count is exhausted.
   * Strict mode requires zero packet loss while normal mode accepts partial success.
   *
   * @param {Routes_Actions_Runner_RoutePing_Request}  request  - Request.
   * @param {Routes_Actions_Runner_RoutePing_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Actions_Runner_RoutePing_Returns}
   *
   * @since 2.0.0
   */
  private async routePing(request: Routes_Actions_Runner_RoutePing_Request, response: Routes_Actions_Runner_RoutePing_Response): Routes_Actions_Runner_RoutePing_Returns {
    const requestBody: Routes_Actions_Runner_RoutePing_RequestBody = ping.safeParse(request.body);

    if (requestBody.success === false) {
      sendValidationError(response, 400, requestBody.error, 'The reachability request is invalid.');

      this.recordActivity(response, 'reachability-check', 'failed', 'Rejected invalid reachability request');

      return;
    }

    const connection: Routes_Actions_Runner_RoutePing_Connection = this.getConnection(response);

    if (connection === undefined) {
      return;
    }

    let instance: Routes_Actions_Runner_RoutePing_Instance = undefined;

    try {
      instance = new Pfsense(connection);

      const loginResponse: Routes_Actions_Runner_RoutePing_LoginResponse = await instance.login();

      if (loginResponse['success'] === false) {
        sendError(response, 502, 'pfsense_unavailable', 'pfSense Actions couldn\'t sign in to pfSense over SSH.');

        this.#notifier.notifyActionFailed('reachability-check', 'pfSense Actions couldn\'t sign in to pfSense over SSH.');

        this.recordActivity(response, 'reachability-check', 'failed', 'pfSense reachability check could not authenticate');

        return;
      }

      const httpStatus: Routes_Actions_Runner_RoutePing_HttpStatus = await this.pingUntilReachable(instance, requestBody.data['ipAddress'], requestBody.data['strict'], requestBody.data['count']);

      if (httpStatus === 502) {
        sendError(response, 502, 'command_failed', 'The pfSense command failed.');

        this.#notifier.notifyActionFailed('reachability-check', 'The pfSense command failed.');
      } else if (httpStatus === 503) {
        sendError(response, 503, 'target_unreachable', 'The device didn\'t meet the reachability condition.');
      } else {
        response.json({
          reachable: true,
        });
      }

      this.recordActivity(response, 'reachability-check', (httpStatus === 200) ? 'succeeded' : 'failed', 'Completed bounded reachability check');
    } catch (error) {
      this.sendUnexpectedError(response, error);

      this.#notifier.notifyActionFailed('reachability-check', 'Something unexpected went wrong.');

      this.recordActivity(response, 'reachability-check', 'failed', 'pfSense reachability check failed unexpectedly');
    } finally {
      await this.closeSession(instance);
    }

    return;
  }

  /**
   * Routes - Actions - Route System.
   *
   * Returns the reviewed operating-system fields from the pfSense SSH adapter.
   * Raw command output and host-specific identifiers never cross the HTTP boundary.
   *
   * @param {Routes_Actions_Runner_RouteSystem_Request}  _request - Request.
   * @param {Routes_Actions_Runner_RouteSystem_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Actions_Runner_RouteSystem_Returns}
   *
   * @since 2.0.0
   */
  private async routeSystem(_request: Routes_Actions_Runner_RouteSystem_Request, response: Routes_Actions_Runner_RouteSystem_Response): Routes_Actions_Runner_RouteSystem_Returns {
    const connection: Routes_Actions_Runner_RouteSystem_Connection = this.getConnection(response);

    if (connection === undefined) {
      return;
    }

    let instance: Routes_Actions_Runner_RouteSystem_Instance = undefined;

    try {
      instance = new Pfsense(connection);

      const loginResponse: Routes_Actions_Runner_RouteSystem_LoginResponse = await instance.login();

      if (loginResponse['success'] === false) {
        sendError(response, 502, 'pfsense_unavailable', 'pfSense Actions couldn\'t sign in to pfSense over SSH.');

        this.#notifier.notifyActionFailed('system-information', 'pfSense Actions couldn\'t sign in to pfSense over SSH.');

        this.recordActivity(response, 'system-information', 'failed', 'pfSense system information could not authenticate');

        return;
      }

      const systemInformationResponse: Routes_Actions_Runner_RouteSystem_SystemInformationResponse = await instance.systemInformation();

      if (systemInformationResponse['success'] === false) {
        sendError(response, 502, 'command_failed', 'The pfSense command failed or returned unexpected output.');

        this.#notifier.notifyActionFailed('system-information', 'The pfSense command failed or returned unexpected output.');

        this.recordActivity(response, 'system-information', 'failed', 'pfSense system information request failed');

        return;
      }

      response.json(systemInformationResponse['info']);

      this.recordActivity(response, 'system-information', 'succeeded', 'Read reviewed pfSense system information');
    } catch (error) {
      this.sendUnexpectedError(response, error);

      this.#notifier.notifyActionFailed('system-information', 'Something unexpected went wrong.');

      this.recordActivity(response, 'system-information', 'failed', 'pfSense system information failed unexpectedly');
    } finally {
      await this.closeSession(instance);
    }

    return;
  }

  /**
   * Routes - Actions - Route Wol.
   *
   * Validates and sends a Wake-on-LAN request through pfSense.
   * Invalid network or hardware addresses are rejected before opening SSH.
   *
   * @param {Routes_Actions_Runner_RouteWol_Request}  request  - Request.
   * @param {Routes_Actions_Runner_RouteWol_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Actions_Runner_RouteWol_Returns}
   *
   * @since 2.0.0
   */
  private async routeWol(request: Routes_Actions_Runner_RouteWol_Request, response: Routes_Actions_Runner_RouteWol_Response): Routes_Actions_Runner_RouteWol_Returns {
    const requestBody: Routes_Actions_Runner_RouteWol_RequestBody = wakeOnLan.safeParse(request.body);

    if (requestBody.success === false) {
      sendValidationError(response, 400, requestBody.error, 'The Wake-on-LAN request is invalid.');

      this.recordActivity(response, 'wake-on-lan', 'failed', 'Rejected invalid Wake-on-LAN request');

      return;
    }

    const connection: Routes_Actions_Runner_RouteWol_Connection = this.getConnection(response);

    if (connection === undefined) {
      return;
    }

    let instance: Routes_Actions_Runner_RouteWol_Instance = undefined;

    try {
      instance = new Pfsense(connection);

      const loginResponse: Routes_Actions_Runner_RouteWol_LoginResponse = await instance.login();

      if (loginResponse['success'] === false) {
        sendError(response, 502, 'pfsense_unavailable', 'pfSense Actions couldn\'t sign in to pfSense over SSH.');

        this.#notifier.notifyActionFailed('wake-on-lan', 'pfSense Actions couldn\'t sign in to pfSense over SSH.');

        this.recordActivity(response, 'wake-on-lan', 'failed', 'Wake-on-LAN request could not authenticate to pfSense');

        return;
      }

      const wakeOnLanResponse: Routes_Actions_Runner_RouteWol_WakeOnLanResponse = await instance.wakeOnLan(requestBody.data['broadcastAddress'], requestBody.data['macAddress']);

      if (wakeOnLanResponse['success'] === false) {
        sendError(response, 502, 'command_failed', 'The pfSense command failed.');

        this.#notifier.notifyActionFailed('wake-on-lan', 'The pfSense command failed.');

        this.recordActivity(response, 'wake-on-lan', 'failed', 'pfSense could not send the Wake-on-LAN packet');

        return;
      }

      response.json({
        sent: true,
      });

      this.recordActivity(response, 'wake-on-lan', 'succeeded', 'Completed Wake-on-LAN request');

      this.#notifier.notifyWakeOnLanSent(requestBody.data['macAddress'], requestBody.data['broadcastAddress']);
    } catch (error) {
      this.sendUnexpectedError(response, error);

      this.#notifier.notifyActionFailed('wake-on-lan', 'Something unexpected went wrong.');

      this.recordActivity(response, 'wake-on-lan', 'failed', 'Wake-on-LAN request failed unexpectedly');
    } finally {
      await this.closeSession(instance);
    }

    return;
  }

  /**
   * Routes - Actions - Send Unexpected Error.
   *
   * Logs an unexpected failure and answers with the generic error envelope.
   * The cause stays in the protected container log.
   *
   * @param {Routes_Actions_Runner_SendUnexpectedError_Response} response - Response.
   * @param {Routes_Actions_Runner_SendUnexpectedError_Error}    error    - Error.
   *
   * @private
   *
   * @returns {Routes_Actions_Runner_SendUnexpectedError_Returns}
   *
   * @since 2.0.0
   */
  private sendUnexpectedError(response: Routes_Actions_Runner_SendUnexpectedError_Response, error: Routes_Actions_Runner_SendUnexpectedError_Error): Routes_Actions_Runner_SendUnexpectedError_Returns {
    logError((error instanceof Error) ? error.message : String(error));

    if (response.headersSent === false) {
      sendError(response, 500, 'internal_error', 'Something went wrong. Try again.');
    }

    return;
  }
}
