import type { BlockList } from 'node:net';

import type express from 'express';
import type { ZodError } from 'zod';

import type {
  Shared_ErrorIssue,
  Shared_ErrorIssues,
  Shared_WebauthnConfiguration,
} from '@/types/shared.d.ts';

/**
 * Lib - HTTP - Build Cookie.
 *
 * @since 2.0.0
 */
export type Lib_Http_BuildCookie_Name = string;

export type Lib_Http_BuildCookie_Value = string;

export type Lib_Http_BuildCookie_Options_HttpOnly = boolean;

export type Lib_Http_BuildCookie_Options_MaxAge = number;

export type Lib_Http_BuildCookie_Options_Secure = boolean;

export type Lib_Http_BuildCookie_Options = {
  httpOnly: Lib_Http_BuildCookie_Options_HttpOnly;
  maxAge: Lib_Http_BuildCookie_Options_MaxAge;
  secure: Lib_Http_BuildCookie_Options_Secure;
};

export type Lib_Http_BuildCookie_Returns = string;

/**
 * Lib - HTTP - Create Trusted Proxy Ranges.
 *
 * @since 2.0.0
 */
export type Lib_Http_CreateTrustedProxyRanges_Returns = BlockList;

export type Lib_Http_CreateTrustedProxyRanges_Ranges = BlockList;

/**
 * Lib - HTTP - Get Client Address.
 *
 * @since 2.0.0
 */
export type Lib_Http_GetClientAddress_Request = express.Request;

export type Lib_Http_GetClientAddress_Returns = string;

export type Lib_Http_GetClientAddress_Address = string | undefined;

/**
 * Lib - HTTP - Get Request Host.
 *
 * @since 2.0.0
 */
export type Lib_Http_GetRequestHost_Request = express.Request;

export type Lib_Http_GetRequestHost_Returns = string;

export type Lib_Http_GetRequestHost_ForwardedHost = string | undefined;

export type Lib_Http_GetRequestHost_Host = string;

/**
 * Lib - HTTP - Get Request Hostname.
 *
 * @since 2.0.0
 */
export type Lib_Http_GetRequestHostname_Request = express.Request;

export type Lib_Http_GetRequestHostname_Returns = string;

export type Lib_Http_GetRequestHostname_Host = string;

export type Lib_Http_GetRequestHostname_PortIndex = number;

/**
 * Lib - HTTP - Get Request Origin.
 *
 * @since 2.0.0
 */
export type Lib_Http_GetRequestOrigin_Request = express.Request;

export type Lib_Http_GetRequestOrigin_Returns = string;

/**
 * Lib - HTTP - Get Request Scheme.
 *
 * @since 2.0.0
 */
export type Lib_Http_GetRequestScheme_Request = express.Request;

export type Lib_Http_GetRequestScheme_Returns = 'http' | 'https';

/**
 * Lib - HTTP - Get Validation Issues.
 *
 * @since 2.0.0
 */
export type Lib_Http_GetValidationIssues_Error = ZodError;

export type Lib_Http_GetValidationIssues_Returns = Shared_ErrorIssues;

export type Lib_Http_GetValidationIssues_Path = string[];

/**
 * Lib - HTTP - Get Webauthn Configuration.
 *
 * @since 2.0.0
 */
export type Lib_Http_GetWebauthnConfiguration_Request = express.Request;

export type Lib_Http_GetWebauthnConfiguration_RpName = string;

export type Lib_Http_GetWebauthnConfiguration_Returns = Shared_WebauthnConfiguration;

/**
 * Lib - HTTP - Handle Async.
 *
 * @since 2.0.0
 */
export type Lib_Http_HandleAsync_Request = express.Request;

export type Lib_Http_HandleAsync_Response = express.Response;

export type Lib_Http_HandleAsync_Next = express.NextFunction;

export type Lib_Http_HandleAsync_Handler = (request: Lib_Http_HandleAsync_Request, response: Lib_Http_HandleAsync_Response, next: Lib_Http_HandleAsync_Next) => Promise<void>;

export type Lib_Http_HandleAsync_Returns = express.RequestHandler;

export type Lib_Http_HandleAsync_CallbackReturns = void;

/**
 * Lib - HTTP - Is Passkey Available.
 *
 * @since 2.0.0
 */
export type Lib_Http_IsPasskeyAvailable_Request = express.Request;

export type Lib_Http_IsPasskeyAvailable_Returns = boolean;

export type Lib_Http_IsPasskeyAvailable_Hostname = string;

export type Lib_Http_IsPasskeyAvailable_UnbracketedHostname = string;

/**
 * Lib - HTTP - Is Trusted Proxy Address.
 *
 * @since 2.0.0
 */
export type Lib_Http_IsTrustedProxyAddress_Address = string | undefined;

export type Lib_Http_IsTrustedProxyAddress_Returns = boolean;

export type Lib_Http_IsTrustedProxyAddress_NormalizedAddress = string;

/**
 * Lib - HTTP - Normalize Address.
 *
 * @since 2.0.0
 */
export type Lib_Http_NormalizeAddress_Address = string;

export type Lib_Http_NormalizeAddress_Returns = string;

export type Lib_Http_NormalizeAddress_Unmapped = string;

/**
 * Lib - HTTP - Read Cookie.
 *
 * @since 2.0.0
 */
export type Lib_Http_ReadCookie_Request = express.Request;

export type Lib_Http_ReadCookie_Name = string;

export type Lib_Http_ReadCookie_Returns = string | undefined;

export type Lib_Http_ReadCookie_CookieHeader = string | undefined;

export type Lib_Http_ReadCookie_CookiePrefix = string;

export type Lib_Http_ReadCookie_Match = string | undefined;

/**
 * Lib - HTTP - Send Error.
 *
 * @since 2.0.0
 */
export type Lib_Http_SendError_Response = express.Response;

export type Lib_Http_SendError_Status = number;

export type Lib_Http_SendError_Code = string;

export type Lib_Http_SendError_Message = string;

export type Lib_Http_SendError_Issues = Shared_ErrorIssues;

export type Lib_Http_SendError_Returns = void;

/**
 * Lib - HTTP - Send Validation Error.
 *
 * @since 2.0.0
 */
export type Lib_Http_SendValidationError_Response = express.Response;

export type Lib_Http_SendValidationError_Status = number;

export type Lib_Http_SendValidationError_Error = ZodError;

export type Lib_Http_SendValidationError_Message = string;

export type Lib_Http_SendValidationError_Returns = void;

export type Lib_Http_SendValidationError_Issues = Shared_ErrorIssues;

export type Lib_Http_SendValidationError_FirstIssue = Shared_ErrorIssue | undefined;

/**
 * Lib - HTTP - Trusted Proxy Ranges.
 *
 * @since 2.0.0
 */
export type Lib_Http_TrustedProxyRanges = BlockList;
