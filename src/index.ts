import express from 'express';

import { Pfsense } from '@/lib/api.js';
import { wakeOnLan, wakeOnLanCheck } from '@/lib/schema.js';
import { getEnvironmentVariables, isValidApiKey } from '@/lib/utility.js';
import type {
  ServerAddMiddlewareReturns,
  ServerApp,
  ServerEnv,
  ServerRegisterRoutesReturns,
  ServerRouteCatchAllNext,
  ServerRouteCatchAllRequest,
  ServerRouteCatchAllResponse,
  ServerRouteCatchAllReturns,
  ServerRouteIndexRequest,
  ServerRouteIndexResponse,
  ServerRouteIndexReturns,
  ServerRouteReloadFilterRequest,
  ServerRouteReloadFilterResponse,
  ServerRouteReloadFilterReturns,
  ServerRouteUpdateDyndnsRequest,
  ServerRouteUpdateDyndnsResponse,
  ServerRouteUpdateDyndnsReturns,
  ServerRouteWolCheckRequest,
  ServerRouteWolCheckResponse,
  ServerRouteWolCheckReturns,
  ServerRouteWolRequest,
  ServerRouteWolResponse,
  ServerRouteWolReturns,
  ServerStartServerReturns,
} from '@/types/index.d.ts';

/**
 * Server.
 *
 * @since 1.0.0
 */
class Server {
  /**
   * Server - App.
   *
   * @private
   *
   * @since 1.0.0
   */
  #app: ServerApp;

  /**
   * Server - Env.
   *
   * @private
   *
   * @since 1.0.0
   */
  readonly #env: ServerEnv;

  /**
   * Server - Constructor.
   *
   * @since 1.0.0
   */
  constructor() {
    this.#app = express();

    // Initialize environment.
    this.#env = getEnvironmentVariables();

    // Initialize server.
    this.addMiddleware();
    this.registerRoutes();
    this.startServer();
  }

  /**
   * Server - Add middleware.
   *
   * @private
   *
   * @returns {ServerAddMiddlewareReturns}
   *
   * @since 1.0.0
   */
  private addMiddleware(): ServerAddMiddlewareReturns {
    this.#app.use(express.json());
  }

  /**
   * Server - Register routes.
   *
   * @private
   *
   * @returns {ServerRegisterRoutesReturns}
   *
   * @since 1.0.0
   */
  private registerRoutes(): ServerRegisterRoutesReturns {
    // Authorize first, then allow access to everything else.
    this.#app.all('*', this.routeCatchAll.bind(this));

    // Authorization-only routes.
    this.#app.get('/', this.routeIndex.bind(this));
    this.#app.get('/reload-filter', this.routeReloadFilter.bind(this));
    this.#app.get('/update-dyndns', this.routeUpdateDyndns.bind(this));
    this.#app.post('/wol', this.routeWol.bind(this));
    this.#app.post('/wol-check', this.routeWolCheck.bind(this));
  }

  /**
   * Server - Start server.
   *
   * @private
   *
   * @returns {ServerStartServerReturns}
   *
   * @since 1.0.0
   */
  private startServer(): ServerStartServerReturns {
    this.#app.listen(this.#env.port, () => {
      console.log(`Listening on port ${this.#env.port}`);
      console.log(`Your API key is ${this.#env.apiKey}`);
    });
  }

  /**
   * Server - Route catch all.
   *
   * @param {ServerRouteCatchAllRequest}  request  - Request.
   * @param {ServerRouteCatchAllResponse} response - Response.
   * @param {ServerRouteCatchAllNext}     next     - Next.
   *
   * @private
   *
   * @returns {ServerRouteCatchAllReturns}
   *
   * @since 1.0.0
   */
  private async routeCatchAll(request: ServerRouteCatchAllRequest, response: ServerRouteCatchAllResponse, next: ServerRouteCatchAllNext): ServerRouteCatchAllReturns {
    if (!isValidApiKey(this.#env, request)) {
      response.sendStatus(401);

      return;
    }

    next();
  }

  /**
   * Server - Route index.
   *
   * @param {ServerRouteIndexRequest}  _request - Request.
   * @param {ServerRouteIndexResponse} response - Response.
   *
   * @private
   *
   * @returns {ServerRouteIndexReturns}
   *
   * @since 1.0.0
   */
  private async routeIndex(_request: ServerRouteIndexRequest, response: ServerRouteIndexResponse): ServerRouteIndexReturns {
    try {
      const instance = new Pfsense(this.#env);

      await instance.login();
      console.log(JSON.stringify(await instance.systemInformation()));
      await instance.logout();

      response.sendStatus(200);
    } catch (error) {
      console.error(error);

      response.sendStatus(500);
    }
  }

  /**
   * Server - Route reload filter.
   *
   * @param {ServerRouteReloadFilterRequest}  _request - Request.
   * @param {ServerRouteReloadFilterResponse} response - Response.
   *
   * @private
   *
   * @returns {ServerRouteReloadFilterReturns}
   *
   * @since 1.0.0
   */
  private async routeReloadFilter(_request: ServerRouteReloadFilterRequest, response: ServerRouteReloadFilterResponse): ServerRouteReloadFilterReturns {
    try {
      const instance = new Pfsense(this.#env);

      await instance.login();
      console.log(JSON.stringify(await instance.reloadFilter()));
      await instance.logout();

      response.sendStatus(200);
    } catch (error) {
      console.error(error);

      response.sendStatus(500);
    }
  }

  /**
   * Server - Route update dyndns.
   *
   * @param {ServerRouteUpdateDyndnsRequest}  _request - Request.
   * @param {ServerRouteUpdateDyndnsResponse} response - Response.
   *
   * @private
   *
   * @returns {ServerRouteUpdateDyndnsReturns}
   *
   * @since 1.0.0
   */
  private async routeUpdateDyndns(_request: ServerRouteUpdateDyndnsRequest, response: ServerRouteUpdateDyndnsResponse): ServerRouteUpdateDyndnsReturns {
    try {
      const instance = new Pfsense(this.#env);

      await instance.login();
      console.log(JSON.stringify(await instance.updateDyndns()));
      await instance.logout();

      response.sendStatus(200);
    } catch (error) {
      console.error(error);

      response.sendStatus(500);
    }
  }

  /**
   * Server - Route wol.
   *
   * @param {ServerRouteWolRequest}  request  - Request.
   * @param {ServerRouteWolResponse} response - Response.
   *
   * @private
   *
   * @returns {ServerRouteWolReturns}
   *
   * @since 1.0.0
   */
  private async routeWol(request: ServerRouteWolRequest, response: ServerRouteWolResponse): ServerRouteWolReturns {
    try {
      const instance = new Pfsense(this.#env);
      const responseBody = wakeOnLan.safeParse(request.body);

      if (!responseBody.success) {
        response.sendStatus(400);

        return;
      }

      const { broadcastAddress, macAddress } = responseBody.data;

      await instance.login();
      console.log(JSON.stringify(await instance.wakeOnLan(broadcastAddress, macAddress)));
      await instance.logout();

      response.sendStatus(200);
    } catch (error) {
      console.error(error);

      response.sendStatus(500);
    }
  }

  /**
   * Server - Route wol check.
   *
   * @param {ServerRouteWolCheckRequest}  request  - Request.
   * @param {ServerRouteWolCheckResponse} response - Response.
   *
   * @private
   *
   * @returns {ServerRouteWolCheckReturns}
   *
   * @since 1.0.0
   */
  private async routeWolCheck(request: ServerRouteWolCheckRequest, response: ServerRouteWolCheckResponse): ServerRouteWolCheckReturns {
    try {
      const instance = new Pfsense(this.#env);
      const responseBody = wakeOnLanCheck.safeParse(request.body);

      if (!responseBody.success) {
        response.sendStatus(400);

        return;
      }

      const { ipAddress } = responseBody.data;

      await instance.login();

      // Pings the device 10 times (2 tries each) until it gives up.
      for (let i = 1; i <= 10; i += 1) {
        const pingResponse = await instance.ping(ipAddress, 2);

        console.log(JSON.stringify(pingResponse));

        // If command does not respond with "100.0% packet loss", it means the device is now online.
        if (pingResponse.success && !pingResponse.info.stdout.includes('100.0% packet loss')) {
          await instance.logout();

          response.sendStatus(200);

          return;
        }
      }

      await instance.logout();

      response.sendStatus(503);
    } catch (error) {
      console.error(error);

      response.sendStatus(500);
    }
  }
}

new Server();
