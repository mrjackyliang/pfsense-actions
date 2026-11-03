import type express from 'express';
import type { RateLimitRequestHandler } from 'express-rate-limit';

import type { Runner as Access } from '@/lib/access.js';
import type { Runner as Attempts } from '@/lib/attempts.js';
import type { Runner as Notifier } from '@/lib/notifier.js';
import type { Runner as State } from '@/lib/state.js';
import type { Runner } from '@/server.js';
import type {
  Lib_State_Runner_GetKeyReplacement_Returns,
  Lib_State_Runner_PrepareSetupClaim_Returns,
} from '@/types/lib/state.d.ts';
import type { Shared_EnvironmentVariables } from '@/types/shared.d.ts';

/**
 * Server - Runner - Add Middleware.
 *
 * @since 2.0.0
 */
export type Server_Runner_AddMiddleware_Returns = void;

export type Server_Runner_AddMiddleware_ConsoleLimiter = RateLimitRequestHandler;

/**
 * Server - Runner - App.
 *
 * @since 2.0.0
 */
export type Server_Runner_App = express.Express;

/**
 * Server - Runner - Base Headers.
 *
 * @since 2.0.0
 */
export type Server_Runner_BaseHeaders_Request = express.Request;

export type Server_Runner_BaseHeaders_Response = express.Response;

export type Server_Runner_BaseHeaders_Next = express.NextFunction;

export type Server_Runner_BaseHeaders_Returns = void;

/**
 * Server - Runner - Constructor.
 *
 * @since 2.0.0
 */
export type Server_Runner_Constructor_Environment = Shared_EnvironmentVariables;

export type Server_Runner_Constructor_WebRoot = string | undefined;

/**
 * Server - Runner - Environment.
 *
 * @since 2.0.0
 */
export type Server_Runner_Environment = Shared_EnvironmentVariables;

/**
 * Server - Runner - Get Application.
 *
 * @since 2.0.0
 */
export type Server_Runner_GetApplication_Returns = express.Express;

/**
 * Server - Runner - Get State.
 *
 * @since 2.0.0
 */
export type Server_Runner_GetState_Returns = State;

/**
 * Server - Runner - Handle Error.
 *
 * @since 2.0.0
 */
export type Server_Runner_HandleError_Error = unknown;

export type Server_Runner_HandleError_Request = express.Request;

export type Server_Runner_HandleError_Response = express.Response;

export type Server_Runner_HandleError_Next = express.NextFunction;

export type Server_Runner_HandleError_Returns = void;

export type Server_Runner_HandleError_Type = unknown;

/**
 * Server - Runner - Handle Not Found.
 *
 * @since 2.0.0
 */
export type Server_Runner_HandleNotFound_Request = express.Request;

export type Server_Runner_HandleNotFound_Response = express.Response;

export type Server_Runner_HandleNotFound_Returns = void;

/**
 * Server - Runner - Register Routes.
 *
 * @since 2.0.0
 */
export type Server_Runner_RegisterRoutes_Returns = void;

export type Server_Runner_RegisterRoutes_Access = Access;

export type Server_Runner_RegisterRoutes_Attempts = Attempts;

/**
 * Server - Runner - Run.
 *
 * @since 2.0.0
 */
export type Server_Runner_Run_Returns = void;

export type Server_Runner_Run_Instance = Runner;

/**
 * Server - Runner - Start.
 *
 * @since 2.0.0
 */
export type Server_Runner_Start_Returns = void;

export type Server_Runner_Start_SetupClaim = Lib_State_Runner_PrepareSetupClaim_Returns;

export type Server_Runner_Start_RemovedSecrets = Lib_State_Runner_GetKeyReplacement_Returns;

export type Server_Runner_Start_KeyPath = string;

/**
 * Server - Runner - State.
 *
 * @since 2.0.0
 */
export type Server_Runner_State = State;

/**
 * Server - Runner - Web Root.
 *
 * @since 2.0.0
 */
export type Server_Runner_WebRoot = string | undefined;

export type Server_Runner_Notifier = Notifier;
