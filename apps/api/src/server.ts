import { join } from 'node:path';

import express from 'express';
import rateLimit from 'express-rate-limit';

import { Runner as Access } from './lib/access.js';
import { Runner as Attempts } from './lib/attempts.js';
import {
  isTrustedProxyAddress,
  sendError,
} from './lib/http.js';
import {
  logError,
  logInfo,
  logWarn,
} from './lib/logger.js';
import { Runner as Notifier } from './lib/notifier.js';
import { Runner as State } from './lib/state.js';
import {
  getDeprecationWarnings,
  getEnvironmentVariables,
  getPackageVersion,
} from './lib/utility.js';
import { Runner as Actions } from './routes/actions.js';
import { Runner as Auth } from './routes/auth.js';
import { Runner as Console } from './routes/console.js';
import { Runner as Notifications } from './routes/notifications.js';
import { Runner as Security } from './routes/security.js';
import { Runner as Tokens } from './routes/tokens.js';
import { Runner as Web } from './routes/web.js';

import type {
  Server_Runner_AddMiddleware_ConsoleLimiter,
  Server_Runner_AddMiddleware_Returns,
  Server_Runner_App,
  Server_Runner_BaseHeaders_Next,
  Server_Runner_BaseHeaders_Request,
  Server_Runner_BaseHeaders_Response,
  Server_Runner_BaseHeaders_Returns,
  Server_Runner_Constructor_Environment,
  Server_Runner_Constructor_WebRoot,
  Server_Runner_Environment,
  Server_Runner_GetApplication_Returns,
  Server_Runner_GetState_Returns,
  Server_Runner_HandleError_Error,
  Server_Runner_HandleError_Next,
  Server_Runner_HandleError_Request,
  Server_Runner_HandleError_Response,
  Server_Runner_HandleError_Returns,
  Server_Runner_HandleError_Type,
  Server_Runner_HandleNotFound_Request,
  Server_Runner_HandleNotFound_Response,
  Server_Runner_HandleNotFound_Returns,
  Server_Runner_Notifier,
  Server_Runner_RegisterRoutes_Access,
  Server_Runner_RegisterRoutes_Attempts,
  Server_Runner_RegisterRoutes_Returns,
  Server_Runner_Run_Instance,
  Server_Runner_Run_Returns,
  Server_Runner_Start_KeyPath,
  Server_Runner_Start_RemovedSecrets,
  Server_Runner_Start_Returns,
  Server_Runner_Start_SetupClaim,
  Server_Runner_State,
  Server_Runner_WebRoot,
} from '@/types/server.d.ts';

/**
 * Server.
 *
 * Assembles the Express controller from state, middleware, and route modules.
 * Process startup stays separate from route-specific authorization and SSH work.
 *
 * @since 2.0.0
 */
export class Runner {
  /**
   * Server - App.
   *
   * Holds the Express application that serves the console, the API, and the actions.
   * Middleware is attached before any route module registers.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #app: Server_Runner_App;

  /**
   * Server - Environment.
   *
   * Retains the validated process configuration, including the listening port.
   * Bootstrap secrets in it are only read once by the state store.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #environment: Server_Runner_Environment;

  /**
   * Server - Notifier.
   *
   * Sends alerts to notification destinations and runs the scheduled pfSense check.
   * The check starts with the server.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #notifier: Server_Runner_Notifier;

  /**
   * Server - State.
   *
   * Owns the SQLite store shared by every route module.
   * One instance lives for the whole process.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #state: Server_Runner_State;

  /**
   * Server - Web Root.
   *
   * Points to the built console, or to a test folder when one is given.
   * Undefined means the folder next to the compiled service.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #webRoot: Server_Runner_WebRoot;

  /**
   * Server - Constructor.
   *
   * Opens controller state and assembles middleware and routes without listening.
   * Tests can therefore drive the full request pipeline on their own port.
   *
   * @param {Server_Runner_Constructor_Environment} environment - Environment.
   * @param {Server_Runner_Constructor_WebRoot}     [webRoot]   - Web root.
   *
   * @since 2.0.0
   */
  public constructor(environment: Server_Runner_Constructor_Environment, webRoot?: Server_Runner_Constructor_WebRoot) {
    this.#app = express();
    this.#environment = environment;
    this.#state = new State(environment);
    this.#notifier = new Notifier(this.#state);
    this.#webRoot = webRoot;

    this.addMiddleware();

    this.registerRoutes();

    return;
  }

  /**
   * Server - Run.
   *
   * Reads the environment, builds the controller, and starts listening.
   * This is the single process entry point used by the container.
   *
   * @returns {Server_Runner_Run_Returns}
   *
   * @since 2.0.0
   */
  public static run(): Server_Runner_Run_Returns {
    const instance: Server_Runner_Run_Instance = new Runner(getEnvironmentVariables());

    instance.start();

    return;
  }

  /**
   * Server - Get Application.
   *
   * Exposes the assembled Express application for tests and embedding.
   * The application is fully wired when the constructor returns.
   *
   * @returns {Server_Runner_GetApplication_Returns}
   *
   * @since 2.0.0
   */
  public getApplication(): Server_Runner_GetApplication_Returns {
    return this.#app;
  }

  /**
   * Server - Get State.
   *
   * Exposes the shared controller state for tests that inspect stored rows.
   * Production code reaches state only through the route modules.
   *
   * @returns {Server_Runner_GetState_Returns}
   *
   * @since 2.0.0
   */
  public getState(): Server_Runner_GetState_Returns {
    return this.#state;
  }

  /**
   * Server - Start.
   *
   * Prints the one-time setup code when no account exists yet, then begins listening.
   * Startup logs never include configured credentials.
   *
   * @returns {Server_Runner_Start_Returns}
   *
   * @since 2.0.0
   */
  public start(): Server_Runner_Start_Returns {
    const setupClaim: Server_Runner_Start_SetupClaim = this.#state.prepareSetupClaim();
    const removedSecrets: Server_Runner_Start_RemovedSecrets = this.#state.getKeyReplacement();
    const keyPath: Server_Runner_Start_KeyPath = join(this.#environment['dataDirectory'], 'keys', 'installation.key');

    this.#app.listen(this.#environment['port'], () => {
      logInfo(`Running pfSense Actions ${getPackageVersion()}`);
      logInfo(`Listening on port ${this.#environment['port']}`);

      if (setupClaim !== undefined) {
        logWarn('No administrator account exists yet. Open the console at /admin/ to create it.');
        logWarn(`Setup code: ${setupClaim['code']} (valid until ${setupClaim['expiresAt']}; restart the container for a new one)`);
      }

      if (removedSecrets.length > 0) {
        logWarn(`No encryption key was found at ${keyPath}, so pfSense Actions made a new one. These saved secrets were locked with the old key and were removed: ${removedSecrets.join(', ')}. Enter them again in the console.`);
      }

      for (const deprecationWarning of getDeprecationWarnings(this.#environment, this.#state.getEnvironmentImports())) {
        logWarn(deprecationWarning);
      }

      this.#notifier.notifySecretsRemoved(removedSecrets);

      this.#notifier.start();

      return;
    });

    return;
  }

  /**
   * Server - Add Middleware.
   *
   * Trusts forwarded headers only from private proxies, then parses JSON and limits the API.
   * Base response headers keep API answers out of caches and content sniffing.
   *
   * @private
   *
   * @returns {Server_Runner_AddMiddleware_Returns}
   *
   * @since 2.0.0
   */
  private addMiddleware(): Server_Runner_AddMiddleware_Returns {
    const consoleLimiter: Server_Runner_AddMiddleware_ConsoleLimiter = rateLimit({
      handler: (_request, response) => {
        sendError(response, 429, 'rate_limited', 'Too many requests. Wait a minute and try again.');

        return;
      },
      legacyHeaders: false,
      limit: 120,
      standardHeaders: true,
      windowMs: 60 * 1000,
    });

    this.#app.disable('x-powered-by');

    this.#app.set('trust proxy', isTrustedProxyAddress);

    this.#app.use(this['baseHeaders'].bind(this));

    this.#app.use(express.json({
      limit: '64kb',
    }));

    this.#app.use('/api/v1', consoleLimiter);

    return;
  }

  /**
   * Server - Base Headers.
   *
   * Marks every response as uncacheable, unsniffable, and without a referrer.
   * Console assets later replace the cache header with their own long lifetime.
   *
   * @param {Server_Runner_BaseHeaders_Request}  _request - Request.
   * @param {Server_Runner_BaseHeaders_Response} response - Response.
   * @param {Server_Runner_BaseHeaders_Next}     next     - Next.
   *
   * @private
   *
   * @returns {Server_Runner_BaseHeaders_Returns}
   *
   * @since 2.0.0
   */
  private baseHeaders(_request: Server_Runner_BaseHeaders_Request, response: Server_Runner_BaseHeaders_Response, next: Server_Runner_BaseHeaders_Next): Server_Runner_BaseHeaders_Returns {
    response.set({
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
    });

    next();

    return;
  }

  /**
   * Server - Handle Error.
   *
   * Turns body-parser and unexpected failures into the shared error envelope.
   * Unexpected causes are logged and never returned to the client.
   *
   * @param {Server_Runner_HandleError_Error}    error    - Error.
   * @param {Server_Runner_HandleError_Request}  _request - Request.
   * @param {Server_Runner_HandleError_Response} response - Response.
   * @param {Server_Runner_HandleError_Next}     _next    - Next.
   *
   * @private
   *
   * @returns {Server_Runner_HandleError_Returns}
   *
   * @since 2.0.0
   */
  private handleError(error: Server_Runner_HandleError_Error, _request: Server_Runner_HandleError_Request, response: Server_Runner_HandleError_Response, _next: Server_Runner_HandleError_Next): Server_Runner_HandleError_Returns {
    const type: Server_Runner_HandleError_Type = (typeof error === 'object' && error !== null) ? Reflect.get(error, 'type') : undefined;

    if (response.headersSent === true) {
      return;
    }

    if (type === 'entity.parse.failed') {
      sendError(response, 400, 'invalid_json', 'The request body is not valid JSON.');

      return;
    }

    if (type === 'entity.too.large') {
      sendError(response, 413, 'payload_too_large', 'The request body is larger than 64 KB.');

      return;
    }

    if (type === 'charset.unsupported' || type === 'encoding.unsupported') {
      sendError(response, 415, 'unsupported_encoding', 'Send the request body as UTF-8 JSON.');

      return;
    }

    logError((error instanceof Error) ? error.message : String(error));

    sendError(response, 500, 'internal_error', 'Something went wrong. Try again.');

    return;
  }

  /**
   * Server - Handle Not Found.
   *
   * Answers every unmatched path with the shared error envelope.
   * Unknown paths never fall through to a default HTML page.
   *
   * @param {Server_Runner_HandleNotFound_Request}  _request - Request.
   * @param {Server_Runner_HandleNotFound_Response} response - Response.
   *
   * @private
   *
   * @returns {Server_Runner_HandleNotFound_Returns}
   *
   * @since 2.0.0
   */
  private handleNotFound(_request: Server_Runner_HandleNotFound_Request, response: Server_Runner_HandleNotFound_Response): Server_Runner_HandleNotFound_Returns {
    sendError(response, 404, 'not_found', 'No route matches this request.');

    return;
  }

  /**
   * Server - Register Routes.
   *
   * Registers the console, the actions, and the API areas after shared middleware.
   * The web module goes first so the root redirect runs before the connectivity alias.
   *
   * @private
   *
   * @returns {Server_Runner_RegisterRoutes_Returns}
   *
   * @since 2.0.0
   */
  private registerRoutes(): Server_Runner_RegisterRoutes_Returns {
    const access: Server_Runner_RegisterRoutes_Access = new Access(this.#state);
    const attempts: Server_Runner_RegisterRoutes_Attempts = new Attempts((key) => this.#notifier.notifySignInLimit(key));

    new Web(this.#webRoot).register(this.#app);

    new Actions(this.#state, access, this.#notifier).register(this.#app);

    new Auth(this.#state, access, attempts).register(this.#app);

    new Security(this.#state, access, attempts).register(this.#app);

    new Tokens(this.#state, access).register(this.#app);

    new Console(this.#state, access).register(this.#app);

    new Notifications(this.#state, access, this.#notifier).register(this.#app);

    this.#app.use(this['handleNotFound'].bind(this));

    this.#app.use(this['handleError'].bind(this));

    return;
  }
}
