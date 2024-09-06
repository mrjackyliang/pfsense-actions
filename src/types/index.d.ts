import type express from 'express';
import type { NodeSSH, SSHExecCommandResponse } from 'node-ssh';

import type { ApiResponse, EnvironmentVariables } from '@/types/shared.d.ts';

/**
 * Get environment variables.
 *
 * @since 1.0.0
 */
export type GetEnvironmentVariablesReturns = EnvironmentVariables;

/**
 * Is valid api key.
 *
 * @since 1.0.0
 */
export type IsValidApiKeyEnvironment = EnvironmentVariables;

export type IsValidApiKeyRequest = express.Request;

export type IsValidApiKeyReturns = boolean;

/**
 * Pfsense - Constructor.
 *
 * @since 1.0.0
 */
export type PfsenseConstructorEnvironment = EnvironmentVariables;

/**
 * Pfsense - Environment.
 *
 * @since 1.0.0
 */
export type PfsenseEnvironment = EnvironmentVariables;

/**
 * Pfsense - Is authenticated.
 *
 * @since 1.0.0
 */
export type PfsenseIsAuthenticatedReturns = Promise<boolean>;

/**
 * Pfsense - Login.
 *
 * @since 1.0.0
 */
export type PfsenseLoginReturnsInfo = null;

export type PfsenseLoginReturns = Promise<ApiResponse<'LOGIN', PfsenseLoginReturnsInfo>>;

/**
 * Pfsense - Logout.
 *
 * @since 1.0.0
 */
export type PfsenseLogoutReturnsInfo = null;

export type PfsenseLogoutReturns = Promise<ApiResponse<'LOGOUT', PfsenseLogoutReturnsInfo>>;

/**
 * Pfsense - Reload filter.
 *
 * @since 1.0.0
 */
export type PfsenseReloadFilterReturnsInfo = SSHExecCommandResponse;

export type PfsenseReloadFilterReturns = Promise<ApiResponse<'RELOAD_FILTER', PfsenseReloadFilterReturnsInfo>>;

/**
 * Pfsense - Session.
 *
 * @since 1.0.0
 */
export type PfsenseSessionIsAuthenticated = boolean;

export type PfsenseSessionSshClient = NodeSSH;

export type PfsenseSession = {
  isAuthenticated: PfsenseSessionIsAuthenticated;
  sshClient: PfsenseSessionSshClient;
};

/**
 * Pfsense - System information.
 *
 * @since 1.0.0
 */
export type PfsenseSystemInformationReturnsInfo = SSHExecCommandResponse;

export type PfsenseSystemInformationReturns = Promise<ApiResponse<'SYSTEM_INFORMATION', PfsenseSystemInformationReturnsInfo>>;

/**
 * Pfsense - Update dyndns.
 *
 * @since 1.0.0
 */
export type PfsenseUpdateDyndnsReturnsInfo = SSHExecCommandResponse;

export type PfsenseUpdateDyndnsReturns = Promise<ApiResponse<'UPDATE_DYNDNS', PfsenseUpdateDyndnsReturnsInfo>>;

/**
 * Pfsense - Wake on lan.
 *
 * @since 1.0.0
 */
export type PfsenseWakeOnLanBroadcastAddress = string;

export type PfsenseWakeOnLanMacAddress = string;

export type PfsenseWakeOnLanReturnsInfo = SSHExecCommandResponse;

export type PfsenseWakeOnLanReturns = Promise<ApiResponse<'WAKE_ON_LAN', PfsenseWakeOnLanReturnsInfo>>;

/**
 * Server - Add middleware.
 *
 * @since 1.0.0
 */
export type ServerAddMiddlewareReturns = void;

/**
 * Server - App.
 *
 * @since 1.0.0
 */
export type ServerApp = express.Application;

/**
 * Server - Env.
 *
 * @since 1.0.0
 */
export type ServerEnv = EnvironmentVariables;

/**
 * Server - Register routes.
 *
 * @since 1.0.0
 */
export type ServerRegisterRoutesReturns = void;

/**
 * Server - Route catch all.
 *
 * @since 1.0.0
 */
export type ServerRouteCatchAllRequest = express.Request;

export type ServerRouteCatchAllResponse = express.Response;

export type ServerRouteCatchAllNext = express.NextFunction;

export type ServerRouteCatchAllReturns = Promise<void>;

/**
 * Server - Route index.
 *
 * @since 1.0.0
 */
export type ServerRouteIndexRequest = express.Request;

export type ServerRouteIndexResponse = express.Response;

export type ServerRouteIndexReturns = Promise<void>;

/**
 * Server - Route reload filter.
 *
 * @since 1.0.0
 */
export type ServerRouteReloadFilterRequest = express.Request;

export type ServerRouteReloadFilterResponse = express.Response;

export type ServerRouteReloadFilterReturns = Promise<void>;

/**
 * Server - Route update dyndns.
 *
 * @since 1.0.0
 */
export type ServerRouteUpdateDyndnsRequest = express.Request;

export type ServerRouteUpdateDyndnsResponse = express.Response;

export type ServerRouteUpdateDyndnsReturns = Promise<void>;

/**
 * Server - Route wol.
 *
 * @since 1.0.0
 */
export type ServerRouteWolRequest = express.Request;

export type ServerRouteWolResponse = express.Response;

export type ServerRouteWolReturns = Promise<void>;

/**
 * Server - Start server.
 *
 * @since 1.0.0
 */
export type ServerStartServerReturns = void;
