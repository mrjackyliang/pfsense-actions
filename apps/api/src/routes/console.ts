import { Runner as Pfsense } from '../lib/api.js';
import {
  handleAsync,
  sendError,
  sendValidationError,
} from '../lib/http.js';
import { connectionUpdate } from '../lib/schema.js';
import { getPackageVersion } from '../lib/utility.js';

import type {
  Routes_Console_Runner_Access,
  Routes_Console_Runner_Constructor_Access,
  Routes_Console_Runner_Constructor_State,
  Routes_Console_Runner_GetConnectionResource_Connection,
  Routes_Console_Runner_GetConnectionResource_Returns,
  Routes_Console_Runner_Register_App,
  Routes_Console_Runner_Register_Returns,
  Routes_Console_Runner_RouteActivity_Request,
  Routes_Console_Runner_RouteActivity_Response,
  Routes_Console_Runner_RouteActivity_Returns,
  Routes_Console_Runner_RouteConnection_Request,
  Routes_Console_Runner_RouteConnection_Response,
  Routes_Console_Runner_RouteConnection_Returns,
  Routes_Console_Runner_RouteConnectionTest_ActorId,
  Routes_Console_Runner_RouteConnectionTest_Connection,
  Routes_Console_Runner_RouteConnectionTest_IsConnected,
  Routes_Console_Runner_RouteConnectionTest_Message,
  Routes_Console_Runner_RouteConnectionTest_Request,
  Routes_Console_Runner_RouteConnectionTest_Response,
  Routes_Console_Runner_RouteConnectionTest_Returns,
  Routes_Console_Runner_RouteConnectionUpdate_ActorId,
  Routes_Console_Runner_RouteConnectionUpdate_Candidate,
  Routes_Console_Runner_RouteConnectionUpdate_IsConnected,
  Routes_Console_Runner_RouteConnectionUpdate_Request,
  Routes_Console_Runner_RouteConnectionUpdate_RequestBody,
  Routes_Console_Runner_RouteConnectionUpdate_Response,
  Routes_Console_Runner_RouteConnectionUpdate_Returns,
  Routes_Console_Runner_RouteOverview_Administrator,
  Routes_Console_Runner_RouteOverview_Request,
  Routes_Console_Runner_RouteOverview_Response,
  Routes_Console_Runner_RouteOverview_Returns,
  Routes_Console_Runner_State,
  Routes_Console_Runner_TestConnection_Connection,
  Routes_Console_Runner_TestConnection_Instance,
  Routes_Console_Runner_TestConnection_LoginResponse,
  Routes_Console_Runner_TestConnection_Returns,
} from '@/types/routes/console.d.ts';

/**
 * Routes - Console.
 *
 * Serves the console's overview, activity log, and pfSense SSH connection settings.
 * The console stays limited to controller state and never configures the firewall itself.
 *
 * @since 2.0.0
 */
export class Runner {
  /**
   * Routes - Console - Access.
   *
   * Restricts every console route to a signed-in browser session.
   * Mutations also need the session's CSRF header.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #access: Routes_Console_Runner_Access;

  /**
   * Routes - Console - State.
   *
   * Provides the overview figures, the redacted activity log, and the saved connection.
   * The SSH credential is write-only and never leaves the server.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #state: Routes_Console_Runner_State;

  /**
   * Routes - Console - Constructor.
   *
   * Binds the console routes to shared state and access checks.
   * No route is registered until register is called.
   *
   * @param {Routes_Console_Runner_Constructor_State}  state  - State.
   * @param {Routes_Console_Runner_Constructor_Access} access - Access.
   *
   * @since 2.0.0
   */
  public constructor(state: Routes_Console_Runner_Constructor_State, access: Routes_Console_Runner_Constructor_Access) {
    this.#access = access;
    this.#state = state;

    return;
  }

  /**
   * Routes - Console - Register.
   *
   * Installs the console routes behind the session check.
   * Lists use the shared items envelope.
   *
   * @param {Routes_Console_Runner_Register_App} app - App.
   *
   * @returns {Routes_Console_Runner_Register_Returns}
   *
   * @since 2.0.0
   */
  public register(app: Routes_Console_Runner_Register_App): Routes_Console_Runner_Register_Returns {
    app.get('/api/v1/overview', this.#access.requireSession(false), this['routeOverview'].bind(this));

    app.get('/api/v1/activity', this.#access.requireSession(false), this['routeActivity'].bind(this));

    app.get('/api/v1/connection', this.#access.requireSession(false), this['routeConnection'].bind(this));

    app.put('/api/v1/connection', this.#access.requireSession(true), handleAsync(this['routeConnectionUpdate'].bind(this)));

    app.post('/api/v1/connection/test', this.#access.requireSession(true), handleAsync(this['routeConnectionTest'].bind(this)));

    return;
  }

  /**
   * Routes - Console - Get Connection Resource.
   *
   * Describes the saved connection, or reports that none is configured yet.
   * The credential itself is never part of the resource.
   *
   * @private
   *
   * @returns {Routes_Console_Runner_GetConnectionResource_Returns}
   *
   * @since 2.0.0
   */
  private getConnectionResource(): Routes_Console_Runner_GetConnectionResource_Returns {
    const connection: Routes_Console_Runner_GetConnectionResource_Connection = this.#state.getConnection();

    if (connection === undefined) {
      return {
        configured: false,
      };
    }

    return {
      configured: true,
      ...connection,
    };
  }

  /**
   * Routes - Console - Route Activity.
   *
   * Returns the newest-first redacted activity log.
   * The stored history is bounded, so the list never grows without limit.
   *
   * @param {Routes_Console_Runner_RouteActivity_Request}  _request - Request.
   * @param {Routes_Console_Runner_RouteActivity_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Console_Runner_RouteActivity_Returns}
   *
   * @since 2.0.0
   */
  private routeActivity(_request: Routes_Console_Runner_RouteActivity_Request, response: Routes_Console_Runner_RouteActivity_Response): Routes_Console_Runner_RouteActivity_Returns {
    response.json({
      items: this.#state.getActivity(250),
    });

    return;
  }

  /**
   * Routes - Console - Route Connection.
   *
   * Returns the saved pfSense SSH settings without their credential.
   * Before setup, the resource only says that no connection exists.
   *
   * @param {Routes_Console_Runner_RouteConnection_Request}  _request - Request.
   * @param {Routes_Console_Runner_RouteConnection_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Console_Runner_RouteConnection_Returns}
   *
   * @since 2.0.0
   */
  private routeConnection(_request: Routes_Console_Runner_RouteConnection_Request, response: Routes_Console_Runner_RouteConnection_Response): Routes_Console_Runner_RouteConnection_Returns {
    response.json(this.getConnectionResource());

    return;
  }

  /**
   * Routes - Console - Route Connection Test.
   *
   * Signs in to pfSense over SSH with the saved settings and reports whether it worked.
   * Command output and error details never leave the server.
   *
   * @param {Routes_Console_Runner_RouteConnectionTest_Request}  _request - Request.
   * @param {Routes_Console_Runner_RouteConnectionTest_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Console_Runner_RouteConnectionTest_Returns}
   *
   * @since 2.0.0
   */
  private async routeConnectionTest(_request: Routes_Console_Runner_RouteConnectionTest_Request, response: Routes_Console_Runner_RouteConnectionTest_Response): Routes_Console_Runner_RouteConnectionTest_Returns {
    const connection: Routes_Console_Runner_RouteConnectionTest_Connection = this.#state.getPfsenseConnection();

    if (connection === undefined) {
      const message: Routes_Console_Runner_RouteConnectionTest_Message = (this.#state.hasConnection() === true) ? 'Enter the password or private key again, then save the connection.' : 'Save the pfSense connection first.';

      sendError(response, 409, 'connection_not_configured', message);

      return;
    }

    const actorId: Routes_Console_Runner_RouteConnectionTest_ActorId = response.locals['actorId'];
    const isConnected: Routes_Console_Runner_RouteConnectionTest_IsConnected = await this.testConnection(connection);

    this.#state.recordActivity(
      actorId,
      'connection-tested',
      'configuration',
      (isConnected === true) ? 'succeeded' : 'failed',
      (isConnected === true) ? 'Verified the saved pfSense SSH connection' : 'Could not verify the saved pfSense SSH connection',
    );

    response.json({
      connected: isConnected,
    });

    return;
  }

  /**
   * Routes - Console - Route Connection Update.
   *
   * Tests new SSH settings and saves them only when the test sign-in works.
   * A failed test leaves the working connection untouched.
   *
   * @param {Routes_Console_Runner_RouteConnectionUpdate_Request}  request  - Request.
   * @param {Routes_Console_Runner_RouteConnectionUpdate_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Console_Runner_RouteConnectionUpdate_Returns}
   *
   * @since 2.0.0
   */
  private async routeConnectionUpdate(request: Routes_Console_Runner_RouteConnectionUpdate_Request, response: Routes_Console_Runner_RouteConnectionUpdate_Response): Routes_Console_Runner_RouteConnectionUpdate_Returns {
    const requestBody: Routes_Console_Runner_RouteConnectionUpdate_RequestBody = connectionUpdate.safeParse(request.body);

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Check the highlighted fields.');

      return;
    }

    const candidate: Routes_Console_Runner_RouteConnectionUpdate_Candidate = this.#state.buildConnection(requestBody.data);

    if (candidate === undefined) {
      sendError(response, 422, 'credential_required', 'Enter the password or private key.', [{
        field: 'credential',
        message: (requestBody.data['credentialType'] === 'password') ? 'Enter the SSH password.' : 'Paste the SSH private key.',
        path: ['credential'],
      }]);

      return;
    }

    const actorId: Routes_Console_Runner_RouteConnectionUpdate_ActorId = response.locals['actorId'];
    const isConnected: Routes_Console_Runner_RouteConnectionUpdate_IsConnected = await this.testConnection(candidate);

    if (isConnected === false) {
      this.#state.recordActivity(actorId, 'connection-update', 'configuration', 'failed', 'Rejected pfSense SSH settings that could not sign in');

      sendError(response, 502, 'connection_failed', 'pfSense Actions couldn\'t sign in over SSH with these settings. Nothing was saved.');

      return;
    }

    this.#state.updateConnection(candidate, actorId);

    response.json(this.getConnectionResource());

    return;
  }

  /**
   * Routes - Console - Route Overview.
   *
   * Summarizes the version, uptime, account, connection, and token and activity counts.
   * It never opens an SSH session just to render the page.
   *
   * @param {Routes_Console_Runner_RouteOverview_Request}  _request - Request.
   * @param {Routes_Console_Runner_RouteOverview_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Console_Runner_RouteOverview_Returns}
   *
   * @since 2.0.0
   */
  private routeOverview(_request: Routes_Console_Runner_RouteOverview_Request, response: Routes_Console_Runner_RouteOverview_Response): Routes_Console_Runner_RouteOverview_Returns {
    const administrator: Routes_Console_Runner_RouteOverview_Administrator = this.#state.getAdministrator();

    response.json({
      activityCount: this.#state.getActivityCount(),
      administrator: (administrator === undefined) ? null : {
        createdAt: administrator['createdAt'],
        username: administrator['username'],
      },
      connection: this.getConnectionResource(),
      tokenCount: this.#state.getTokens().length,
      uptimeSeconds: Math.floor(process.uptime()),
      version: getPackageVersion(),
    });

    return;
  }

  /**
   * Routes - Console - Test Connection.
   *
   * Opens and closes an isolated SSH session for one set of connection settings.
   * Only a yes-or-no result crosses this boundary.
   *
   * @param {Routes_Console_Runner_TestConnection_Connection} connection - Connection.
   *
   * @private
   *
   * @returns {Routes_Console_Runner_TestConnection_Returns}
   *
   * @since 2.0.0
   */
  private async testConnection(connection: Routes_Console_Runner_TestConnection_Connection): Routes_Console_Runner_TestConnection_Returns {
    const instance: Routes_Console_Runner_TestConnection_Instance = new Pfsense(connection);

    try {
      const loginResponse: Routes_Console_Runner_TestConnection_LoginResponse = await instance.login();

      return loginResponse['success'];
    } finally {
      await instance.logout();
    }
  }
}
