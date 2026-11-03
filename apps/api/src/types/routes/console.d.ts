import type express from 'express';

import type { Runner as Access } from '@/lib/access.js';
import type { Runner as Pfsense } from '@/lib/api.js';
import type { connectionUpdate } from '@/lib/schema.js';
import type { Runner as State } from '@/lib/state.js';
import type { Lib_Api_Runner_Login_Returns } from '@/types/lib/api.d.ts';
import type {
  Shared_Administrator,
  Shared_PfsenseConnection,
  Shared_PfsenseConnectionSummary,
} from '@/types/shared.d.ts';

/**
 * Routes - Console - Runner - Access.
 *
 * @since 2.0.0
 */
export type Routes_Console_Runner_Access = Access;

/**
 * Routes - Console - Runner - Constructor.
 *
 * @since 2.0.0
 */
export type Routes_Console_Runner_Constructor_State = State;

export type Routes_Console_Runner_Constructor_Access = Access;

/**
 * Routes - Console - Runner - Get Connection Resource.
 *
 * @since 2.0.0
 */
export type Routes_Console_Runner_GetConnectionResource_Returns_Configured = boolean;

export type Routes_Console_Runner_GetConnectionResource_Returns = {
  configured: Routes_Console_Runner_GetConnectionResource_Returns_Configured;
} & Partial<Shared_PfsenseConnectionSummary>;

export type Routes_Console_Runner_GetConnectionResource_Connection = Shared_PfsenseConnectionSummary | undefined;

/**
 * Routes - Console - Runner - Register.
 *
 * @since 2.0.0
 */
export type Routes_Console_Runner_Register_App = express.Express;

export type Routes_Console_Runner_Register_Returns = void;

/**
 * Routes - Console - Runner - Route Activity.
 *
 * @since 2.0.0
 */
export type Routes_Console_Runner_RouteActivity_Request = express.Request;

export type Routes_Console_Runner_RouteActivity_Response = express.Response;

export type Routes_Console_Runner_RouteActivity_Returns = void;

/**
 * Routes - Console - Runner - Route Connection.
 *
 * @since 2.0.0
 */
export type Routes_Console_Runner_RouteConnection_Request = express.Request;

export type Routes_Console_Runner_RouteConnection_Response = express.Response;

export type Routes_Console_Runner_RouteConnection_Returns = void;

/**
 * Routes - Console - Runner - Route Connection Test.
 *
 * @since 2.0.0
 */
export type Routes_Console_Runner_RouteConnectionTest_Request = express.Request;

export type Routes_Console_Runner_RouteConnectionTest_Response = express.Response;

export type Routes_Console_Runner_RouteConnectionTest_Returns = Promise<void>;

export type Routes_Console_Runner_RouteConnectionTest_Connection = Shared_PfsenseConnection | undefined;

export type Routes_Console_Runner_RouteConnectionTest_Message = string;

export type Routes_Console_Runner_RouteConnectionTest_ActorId = string;

export type Routes_Console_Runner_RouteConnectionTest_IsConnected = boolean;

/**
 * Routes - Console - Runner - Route Connection Update.
 *
 * @since 2.0.0
 */
export type Routes_Console_Runner_RouteConnectionUpdate_Request = express.Request;

export type Routes_Console_Runner_RouteConnectionUpdate_Response = express.Response;

export type Routes_Console_Runner_RouteConnectionUpdate_Returns = Promise<void>;

export type Routes_Console_Runner_RouteConnectionUpdate_RequestBody = ReturnType<typeof connectionUpdate.safeParse>;

export type Routes_Console_Runner_RouteConnectionUpdate_Candidate = Shared_PfsenseConnection | undefined;

export type Routes_Console_Runner_RouteConnectionUpdate_ActorId = string;

export type Routes_Console_Runner_RouteConnectionUpdate_IsConnected = boolean;

/**
 * Routes - Console - Runner - Route Overview.
 *
 * @since 2.0.0
 */
export type Routes_Console_Runner_RouteOverview_Request = express.Request;

export type Routes_Console_Runner_RouteOverview_Response = express.Response;

export type Routes_Console_Runner_RouteOverview_Returns = void;

export type Routes_Console_Runner_RouteOverview_Administrator = Shared_Administrator | undefined;

/**
 * Routes - Console - Runner - State.
 *
 * @since 2.0.0
 */
export type Routes_Console_Runner_State = State;

/**
 * Routes - Console - Runner - Test Connection.
 *
 * @since 2.0.0
 */
export type Routes_Console_Runner_TestConnection_Connection = Shared_PfsenseConnection;

export type Routes_Console_Runner_TestConnection_Returns = Promise<boolean>;

export type Routes_Console_Runner_TestConnection_Instance = Pfsense;

export type Routes_Console_Runner_TestConnection_LoginResponse = Awaited<Lib_Api_Runner_Login_Returns>;
