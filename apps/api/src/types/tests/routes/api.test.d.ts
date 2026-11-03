import type {
  JsonWebKey,
  KeyPairKeyObjectResult,
} from 'node:crypto';
import type { Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import type { Mock } from 'vitest';

import type { Runner as State } from '@/lib/state.js';
import type { Runner as Server } from '@/server.js';
import type {
  Lib_State_Runner_CreateToken_Returns,
  Lib_State_Runner_GetAdministrator_Returns,
  Lib_State_Runner_PrepareSetupClaim_Returns,
} from '@/types/lib/state.d.ts';
import type { Shared_EnvironmentVariables } from '@/types/shared.d.ts';

/**
 * Tests - Routes - API - Administrator.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_Administrator = Lib_State_Runner_GetAdministrator_Returns;

/**
 * Tests - Routes - API - Authenticator.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_Authenticator = {
  credentialId: Buffer;
  keyPair: KeyPairKeyObjectResult;
  signCount: number;
  userHandle?: unknown;
};

/**
 * Tests - Routes - API - Authenticator Data.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_AuthenticatorData_RpId = string;

export type Tests_Routes_Api_AuthenticatorData_Flags = number;

export type Tests_Routes_Api_AuthenticatorData_SignCount = number;

export type Tests_Routes_Api_AuthenticatorData_Attested = Buffer;

export type Tests_Routes_Api_AuthenticatorData_Returns = Buffer;

export type Tests_Routes_Api_AuthenticatorData_Counter = Buffer;

/**
 * Tests - Routes - API - Body.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_Body = string;

/**
 * Tests - Routes - API - Cbor Head.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_CborHead_MajorType = number;

export type Tests_Routes_Api_CborHead_Length = number;

export type Tests_Routes_Api_CborHead_Returns = Buffer;

export type Tests_Routes_Api_CborHead_Head = Buffer;

/**
 * Tests - Routes - API - Cbor Value.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_CborValue = number | string | Uint8Array | Map<Tests_Routes_Api_CborValue, Tests_Routes_Api_CborValue>;

/**
 * Tests - Routes - API - Claim.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_Claim_Returns = Promise<Tests_Routes_Api_Response>;

/**
 * Tests - Routes - API - Client.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_Client = {
  cookies: Map<string, string>;
  request: (method: Tests_Routes_Api_Request_Method, path: Tests_Routes_Api_Request_Path, body?: Tests_Routes_Api_Request_Body, headers?: Tests_Routes_Api_Request_Headers) => Tests_Routes_Api_Request_Returns;
};

/**
 * Tests - Routes - API - Create Assertion.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_CreateAssertion_Authenticator = Tests_Routes_Api_Authenticator;

export type Tests_Routes_Api_CreateAssertion_Options = Tests_Routes_Api_Options;

export type Tests_Routes_Api_CreateAssertion_Origin = string;

export type Tests_Routes_Api_CreateAssertion_RpId = string;

export type Tests_Routes_Api_CreateAssertion_Returns = Record<string, unknown>;

export type Tests_Routes_Api_CreateAssertion_AuthenticatorData = Buffer;

export type Tests_Routes_Api_CreateAssertion_ClientData = Buffer;

export type Tests_Routes_Api_CreateAssertion_Signature = Buffer;

/**
 * Tests - Routes - API - Create Authenticator.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_CreateAuthenticator_Returns = Tests_Routes_Api_Authenticator;

export type Tests_Routes_Api_CreateAuthenticator_KeyPair = KeyPairKeyObjectResult;

/**
 * Tests - Routes - API - Create Client.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_CreateClient_BaseUrl = string;

export type Tests_Routes_Api_CreateClient_DefaultHeaders = Tests_Routes_Api_Headers;

export type Tests_Routes_Api_CreateClient_Returns = Tests_Routes_Api_Client;

export type Tests_Routes_Api_CreateClient_Cookies = Map<string, string>;

/**
 * Tests - Routes - API - Create Registration.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_CreateRegistration_Authenticator = Tests_Routes_Api_Authenticator;

export type Tests_Routes_Api_CreateRegistration_Options = Tests_Routes_Api_Options;

export type Tests_Routes_Api_CreateRegistration_Origin = string;

export type Tests_Routes_Api_CreateRegistration_Returns = Record<string, unknown>;

export type Tests_Routes_Api_CreateRegistration_PublicKey = JsonWebKey;

export type Tests_Routes_Api_CreateRegistration_CredentialIdLength = Buffer;

export type Tests_Routes_Api_CreateRegistration_Attested = Buffer;

export type Tests_Routes_Api_CreateRegistration_AuthenticatorData = Buffer;

export type Tests_Routes_Api_CreateRegistration_AttestationObject = Buffer;

export type Tests_Routes_Api_CreateRegistration_ClientData = Buffer;

/**
 * Tests - Routes - API - Created Token.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_CreatedToken = Lib_State_Runner_CreateToken_Returns;

/**
 * Tests - Routes - API - Encode Cbor.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_EncodeCbor_Value = Tests_Routes_Api_CborValue;

export type Tests_Routes_Api_EncodeCbor_Returns = Buffer;

export type Tests_Routes_Api_EncodeCbor_Bytes = Buffer;

export type Tests_Routes_Api_EncodeCbor_Entries = [Tests_Routes_Api_CborValue, Tests_Routes_Api_CborValue][];

/**
 * Tests - Routes - API - Environment.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_Environment = Shared_EnvironmentVariables;

/**
 * Tests - Routes - API - Harness.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_RunningHarness = {
  baseUrl: string;
  httpServer: HttpServer;
  server: Server;
};

export type Tests_Routes_Api_Harness = Tests_Routes_Api_RunningHarness | undefined;

/**
 * Tests - Routes - API - Headers.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_Headers = Record<string, string>;

/**
 * Tests - Routes - API - Http Server.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_HttpServer = HttpServer;

/**
 * Tests - Routes - API - Mocks.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_Mocks = {
  login: Mock;
  logout: Mock;
  ping: Mock;
  systemInformation: Mock;
  wakeOnLan: Mock;
};

/**
 * Tests - Routes - API - Options.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_Options = Record<string, unknown>;

/**
 * Tests - Routes - API - Recovery Codes.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_RecoveryCodes = string[];

/**
 * Tests - Routes - API - Request.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_Request_Method = 'DELETE' | 'GET' | 'POST' | 'PUT';

export type Tests_Routes_Api_Request_Path = string;

export type Tests_Routes_Api_Request_Body = string | Record<string, unknown>;

export type Tests_Routes_Api_Request_Headers = Tests_Routes_Api_Headers;

export type Tests_Routes_Api_Request_Returns = Promise<Tests_Routes_Api_Response>;

export type Tests_Routes_Api_Request_RequestHeaders = Headers;

export type Tests_Routes_Api_Request_Response = Response;

export type Tests_Routes_Api_Request_Text = string;

/**
 * Tests - Routes - API - Response.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_Response = {
  body: unknown;
  headers: Headers;
  status: number;
};

export type Tests_Routes_Api_Responses = Tests_Routes_Api_Response[];

/**
 * Tests - Routes - API - Setup Claim.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_SetupClaim = Lib_State_Runner_PrepareSetupClaim_Returns;

/**
 * Tests - Routes - API - Start Harness.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_StartHarness_Returns = Promise<Tests_Routes_Api_RunningHarness>;

export type Tests_Routes_Api_StartHarness_Server = Server;

export type Tests_Routes_Api_StartHarness_HttpServer = HttpServer;

export type Tests_Routes_Api_StartHarness_Address = AddressInfo | string | null;

/**
 * Tests - Routes - API - State.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_State = State;

/**
 * Tests - Routes - API - Stop Harness.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_StopHarness_Harness = Tests_Routes_Api_RunningHarness;

export type Tests_Routes_Api_StopHarness_Returns = Promise<void>;

/**
 * Tests - Routes - API - Token ID.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_TokenId = string;

/**
 * Tests - Routes - API - Totp Secret.
 *
 * @since 2.0.0
 */
export type Tests_Routes_Api_TotpSecret = string;

export type Tests_Routes_Api_NotificationId = string;

export type Tests_Routes_Api_NotificationMocks = {
  send: Mock;
};

export type Tests_Routes_Api_NotificationsModule = typeof import('@/lib/notifications.js');
