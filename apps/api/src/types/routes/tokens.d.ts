import type express from 'express';

import type { Runner as Access } from '@/lib/access.js';
import type {
  tokenCreate,
  tokenUpdate,
} from '@/lib/schema.js';
import type { Runner as State } from '@/lib/state.js';
import type {
  Lib_State_Runner_CreateToken_Returns,
  Lib_State_Runner_RemoveToken_Returns,
  Lib_State_Runner_UpdateToken_Returns,
} from '@/types/lib/state.d.ts';

/**
 * Routes - Tokens - Runner - Access.
 *
 * @since 2.0.0
 */
export type Routes_Tokens_Runner_Access = Access;

/**
 * Routes - Tokens - Runner - Constructor.
 *
 * @since 2.0.0
 */
export type Routes_Tokens_Runner_Constructor_State = State;

export type Routes_Tokens_Runner_Constructor_Access = Access;

/**
 * Routes - Tokens - Runner - Get Token ID.
 *
 * @since 2.0.0
 */
export type Routes_Tokens_Runner_GetTokenId_Request = express.Request;

export type Routes_Tokens_Runner_GetTokenId_Returns = string | undefined;

export type Routes_Tokens_Runner_GetTokenId_TokenId = string | undefined;

/**
 * Routes - Tokens - Runner - Register.
 *
 * @since 2.0.0
 */
export type Routes_Tokens_Runner_Register_App = express.Express;

export type Routes_Tokens_Runner_Register_Returns = void;

/**
 * Routes - Tokens - Runner - Route Create.
 *
 * @since 2.0.0
 */
export type Routes_Tokens_Runner_RouteCreate_Request = express.Request;

export type Routes_Tokens_Runner_RouteCreate_Response = express.Response;

export type Routes_Tokens_Runner_RouteCreate_Returns = void;

export type Routes_Tokens_Runner_RouteCreate_RequestBody = ReturnType<typeof tokenCreate.safeParse>;

export type Routes_Tokens_Runner_RouteCreate_ActorId = string;

export type Routes_Tokens_Runner_RouteCreate_CreatedToken = Lib_State_Runner_CreateToken_Returns;

/**
 * Routes - Tokens - Runner - Route Delete.
 *
 * @since 2.0.0
 */
export type Routes_Tokens_Runner_RouteDelete_Request = express.Request;

export type Routes_Tokens_Runner_RouteDelete_Response = express.Response;

export type Routes_Tokens_Runner_RouteDelete_Returns = void;

export type Routes_Tokens_Runner_RouteDelete_TokenId = string | undefined;

export type Routes_Tokens_Runner_RouteDelete_ActorId = string;

export type Routes_Tokens_Runner_RouteDelete_Result = Lib_State_Runner_RemoveToken_Returns;

/**
 * Routes - Tokens - Runner - Route List.
 *
 * @since 2.0.0
 */
export type Routes_Tokens_Runner_RouteList_Request = express.Request;

export type Routes_Tokens_Runner_RouteList_Response = express.Response;

export type Routes_Tokens_Runner_RouteList_Returns = void;

/**
 * Routes - Tokens - Runner - Route Update.
 *
 * @since 2.0.0
 */
export type Routes_Tokens_Runner_RouteUpdate_Request = express.Request;

export type Routes_Tokens_Runner_RouteUpdate_Response = express.Response;

export type Routes_Tokens_Runner_RouteUpdate_Returns = void;

export type Routes_Tokens_Runner_RouteUpdate_TokenId = string | undefined;

export type Routes_Tokens_Runner_RouteUpdate_RequestBody = ReturnType<typeof tokenUpdate.safeParse>;

export type Routes_Tokens_Runner_RouteUpdate_ActorId = string;

export type Routes_Tokens_Runner_RouteUpdate_Result = Lib_State_Runner_UpdateToken_Returns;

/**
 * Routes - Tokens - Runner - State.
 *
 * @since 2.0.0
 */
export type Routes_Tokens_Runner_State = State;
