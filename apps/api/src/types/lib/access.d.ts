import type express from 'express';

import type { Runner as State } from '@/lib/state.js';
import type {
  Lib_State_Runner_AuthenticateToken_Returns,
  Lib_State_Runner_CreateSession_Returns,
} from '@/types/lib/state.d.ts';
import type {
  Shared_Administrator,
  Shared_BrowserSession,
  Shared_EnvironmentVariables_PersonalAccessTokenScope,
} from '@/types/shared.d.ts';

/**
 * Lib - Access - Runner - Clear Session.
 *
 * @since 2.0.0
 */
export type Lib_Access_Runner_ClearSession_Request = express.Request;

export type Lib_Access_Runner_ClearSession_Response = express.Response;

export type Lib_Access_Runner_ClearSession_Returns = void;

export type Lib_Access_Runner_ClearSession_Secure = boolean;

/**
 * Lib - Access - Runner - Constructor.
 *
 * @since 2.0.0
 */
export type Lib_Access_Runner_Constructor_State = State;

/**
 * Lib - Access - Runner - Csrf Cookie Name.
 *
 * @since 2.0.0
 */
export type Lib_Access_Runner_CsrfCookieName = string;

/**
 * Lib - Access - Runner - Has Valid Csrf.
 *
 * @since 2.0.0
 */
export type Lib_Access_Runner_HasValidCsrf_Request = express.Request;

export type Lib_Access_Runner_HasValidCsrf_Session = Shared_BrowserSession;

export type Lib_Access_Runner_HasValidCsrf_Returns = boolean;

export type Lib_Access_Runner_HasValidCsrf_HeaderToken = string | undefined;

export type Lib_Access_Runner_HasValidCsrf_CookieToken = string | undefined;

/**
 * Lib - Access - Runner - Issue Session.
 *
 * @since 2.0.0
 */
export type Lib_Access_Runner_IssueSession_Request = express.Request;

export type Lib_Access_Runner_IssueSession_Response = express.Response;

export type Lib_Access_Runner_IssueSession_Administrator = Shared_Administrator;

export type Lib_Access_Runner_IssueSession_Status = number;

export type Lib_Access_Runner_IssueSession_Returns = void;

export type Lib_Access_Runner_IssueSession_CreatedSession = Lib_State_Runner_CreateSession_Returns;

export type Lib_Access_Runner_IssueSession_MaxAge = number;

export type Lib_Access_Runner_IssueSession_Secure = boolean;

/**
 * Lib - Access - Runner - Require Authentication.
 *
 * @since 2.0.0
 */
export type Lib_Access_Runner_RequireAuthentication_Mutation = boolean;

export type Lib_Access_Runner_RequireAuthentication_Returns = express.RequestHandler;

export type Lib_Access_Runner_RequireAuthentication_Request = express.Request;

export type Lib_Access_Runner_RequireAuthentication_Response = express.Response;

export type Lib_Access_Runner_RequireAuthentication_Next = express.NextFunction;

export type Lib_Access_Runner_RequireAuthentication_CallbackReturns = void;

export type Lib_Access_Runner_RequireAuthentication_RawToken = string | undefined;

export type Lib_Access_Runner_RequireAuthentication_PersonalAccessToken = Lib_State_Runner_AuthenticateToken_Returns;

/**
 * Lib - Access - Runner - Require Session.
 *
 * @since 2.0.0
 */
export type Lib_Access_Runner_RequireSession_Mutation = boolean;

export type Lib_Access_Runner_RequireSession_Returns = express.RequestHandler;

export type Lib_Access_Runner_RequireSession_Request = express.Request;

export type Lib_Access_Runner_RequireSession_Response = express.Response;

export type Lib_Access_Runner_RequireSession_Next = express.NextFunction;

export type Lib_Access_Runner_RequireSession_CallbackReturns = void;

export type Lib_Access_Runner_RequireSession_Session = Shared_BrowserSession | undefined;

/**
 * Lib - Access - Runner - Require Token.
 *
 * @since 2.0.0
 */
export type Lib_Access_Runner_RequireToken_Scope = Shared_EnvironmentVariables_PersonalAccessTokenScope;

export type Lib_Access_Runner_RequireToken_Returns = express.RequestHandler;

export type Lib_Access_Runner_RequireToken_Request = express.Request;

export type Lib_Access_Runner_RequireToken_Response = express.Response;

export type Lib_Access_Runner_RequireToken_Next = express.NextFunction;

export type Lib_Access_Runner_RequireToken_CallbackReturns = void;

export type Lib_Access_Runner_RequireToken_RawToken = string | undefined;

export type Lib_Access_Runner_RequireToken_PersonalAccessToken = Lib_State_Runner_AuthenticateToken_Returns;

/**
 * Lib - Access - Runner - Resolve Session.
 *
 * @since 2.0.0
 */
export type Lib_Access_Runner_ResolveSession_Request = express.Request;

export type Lib_Access_Runner_ResolveSession_Returns = Shared_BrowserSession | undefined;

export type Lib_Access_Runner_ResolveSession_SessionToken = string | undefined;

/**
 * Lib - Access - Runner - Session Cookie Name.
 *
 * @since 2.0.0
 */
export type Lib_Access_Runner_SessionCookieName = string;

/**
 * Lib - Access - Runner - State.
 *
 * @since 2.0.0
 */
export type Lib_Access_Runner_State = State;
