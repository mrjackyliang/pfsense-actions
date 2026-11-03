import type express from 'express';
import type { RateLimitRequestHandler } from 'express-rate-limit';

import type { Runner as Access } from '@/lib/access.js';
import type { Runner as Pfsense } from '@/lib/api.js';
import type { Runner as Notifier } from '@/lib/notifier.js';
import type { ping, wakeOnLan } from '@/lib/schema.js';
import type { Runner as State } from '@/lib/state.js';
import type {
  Lib_Api_Runner_Login_Returns,
  Lib_Api_Runner_Ping_Returns,
  Lib_Api_Runner_SystemInformation_Returns,
  Lib_Api_Runner_WakeOnLan_Returns,
} from '@/types/lib/api.d.ts';
import type {
  Shared_ActivityEvent_Outcome,
  Shared_PfsenseConnection,
} from '@/types/shared.d.ts';

/**
 * Routes - Actions - Runner - Access.
 *
 * @since 2.0.0
 */
export type Routes_Actions_Runner_Access = Access;

/**
 * Routes - Actions - Runner - Close Session.
 *
 * @since 2.0.0
 */
export type Routes_Actions_Runner_CloseSession_Instance = Pfsense | undefined;

export type Routes_Actions_Runner_CloseSession_Returns = Promise<void>;

/**
 * Routes - Actions - Runner - Constructor.
 *
 * @since 2.0.0
 */
export type Routes_Actions_Runner_Constructor_State = State;

export type Routes_Actions_Runner_Constructor_Access = Access;

/**
 * Routes - Actions - Runner - Get Connection.
 *
 * @since 2.0.0
 */
export type Routes_Actions_Runner_GetConnection_Response = express.Response;

export type Routes_Actions_Runner_GetConnection_Returns = Shared_PfsenseConnection | undefined;

export type Routes_Actions_Runner_GetConnection_Connection = Shared_PfsenseConnection | undefined;

export type Routes_Actions_Runner_GetConnection_Message = string;

/**
 * Routes - Actions - Runner - Ping Until Reachable.
 *
 * @since 2.0.0
 */
export type Routes_Actions_Runner_PingUntilReachable_Instance = Pfsense;

export type Routes_Actions_Runner_PingUntilReachable_IpAddress = string;

export type Routes_Actions_Runner_PingUntilReachable_Strict = boolean;

export type Routes_Actions_Runner_PingUntilReachable_Remaining = number;

export type Routes_Actions_Runner_PingUntilReachable_Returns = Promise<200 | 502 | 503>;

export type Routes_Actions_Runner_PingUntilReachable_PingResponse = Awaited<Lib_Api_Runner_Ping_Returns>;

export type Routes_Actions_Runner_PingUntilReachable_IsReachable = boolean;

/**
 * Routes - Actions - Runner - Record Activity.
 *
 * @since 2.0.0
 */
export type Routes_Actions_Runner_RecordActivity_Response = express.Response;

export type Routes_Actions_Runner_RecordActivity_Action = string;

export type Routes_Actions_Runner_RecordActivity_Outcome = Shared_ActivityEvent_Outcome;

export type Routes_Actions_Runner_RecordActivity_Summary = string;

export type Routes_Actions_Runner_RecordActivity_Returns = void;

export type Routes_Actions_Runner_RecordActivity_ActorId = string;

/**
 * Routes - Actions - Runner - Register.
 *
 * @since 2.0.0
 */
export type Routes_Actions_Runner_Register_App = express.Express;

export type Routes_Actions_Runner_Register_Returns = void;

export type Routes_Actions_Runner_Register_ActionLimiter = RateLimitRequestHandler;

/**
 * Routes - Actions - Runner - Route Connectivity.
 *
 * @since 2.0.0
 */
export type Routes_Actions_Runner_RouteConnectivity_Request = express.Request;

export type Routes_Actions_Runner_RouteConnectivity_Response = express.Response;

export type Routes_Actions_Runner_RouteConnectivity_Returns = Promise<void>;

export type Routes_Actions_Runner_RouteConnectivity_Connection = Shared_PfsenseConnection | undefined;

export type Routes_Actions_Runner_RouteConnectivity_Instance = Pfsense | undefined;

export type Routes_Actions_Runner_RouteConnectivity_LoginResponse = Awaited<Lib_Api_Runner_Login_Returns>;

export type Routes_Actions_Runner_RouteConnectivity_SystemInformationResponse = Awaited<Lib_Api_Runner_SystemInformation_Returns>;

/**
 * Routes - Actions - Runner - Route Ping.
 *
 * @since 2.0.0
 */
export type Routes_Actions_Runner_RoutePing_Request = express.Request;

export type Routes_Actions_Runner_RoutePing_Response = express.Response;

export type Routes_Actions_Runner_RoutePing_Returns = Promise<void>;

export type Routes_Actions_Runner_RoutePing_RequestBody = ReturnType<typeof ping.safeParse>;

export type Routes_Actions_Runner_RoutePing_Connection = Shared_PfsenseConnection | undefined;

export type Routes_Actions_Runner_RoutePing_Instance = Pfsense | undefined;

export type Routes_Actions_Runner_RoutePing_LoginResponse = Awaited<Lib_Api_Runner_Login_Returns>;

export type Routes_Actions_Runner_RoutePing_HttpStatus = 200 | 502 | 503;

/**
 * Routes - Actions - Runner - Route System.
 *
 * @since 2.0.0
 */
export type Routes_Actions_Runner_RouteSystem_Request = express.Request;

export type Routes_Actions_Runner_RouteSystem_Response = express.Response;

export type Routes_Actions_Runner_RouteSystem_Returns = Promise<void>;

export type Routes_Actions_Runner_RouteSystem_Connection = Shared_PfsenseConnection | undefined;

export type Routes_Actions_Runner_RouteSystem_Instance = Pfsense | undefined;

export type Routes_Actions_Runner_RouteSystem_LoginResponse = Awaited<Lib_Api_Runner_Login_Returns>;

export type Routes_Actions_Runner_RouteSystem_SystemInformationResponse = Awaited<Lib_Api_Runner_SystemInformation_Returns>;

/**
 * Routes - Actions - Runner - Route Wol.
 *
 * @since 2.0.0
 */
export type Routes_Actions_Runner_RouteWol_Request = express.Request;

export type Routes_Actions_Runner_RouteWol_Response = express.Response;

export type Routes_Actions_Runner_RouteWol_Returns = Promise<void>;

export type Routes_Actions_Runner_RouteWol_RequestBody = ReturnType<typeof wakeOnLan.safeParse>;

export type Routes_Actions_Runner_RouteWol_Connection = Shared_PfsenseConnection | undefined;

export type Routes_Actions_Runner_RouteWol_Instance = Pfsense | undefined;

export type Routes_Actions_Runner_RouteWol_LoginResponse = Awaited<Lib_Api_Runner_Login_Returns>;

export type Routes_Actions_Runner_RouteWol_WakeOnLanResponse = Awaited<Lib_Api_Runner_WakeOnLan_Returns>;

/**
 * Routes - Actions - Runner - Send Unexpected Error.
 *
 * @since 2.0.0
 */
export type Routes_Actions_Runner_SendUnexpectedError_Response = express.Response;

export type Routes_Actions_Runner_SendUnexpectedError_Error = unknown;

export type Routes_Actions_Runner_SendUnexpectedError_Returns = void;

/**
 * Routes - Actions - Runner - State.
 *
 * @since 2.0.0
 */
export type Routes_Actions_Runner_State = State;

export type Routes_Actions_Runner_Notifier = Notifier;

export type Routes_Actions_Runner_Constructor_Notifier = Notifier;
