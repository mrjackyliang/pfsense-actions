import type { ZodType } from 'zod';

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_Schema<Value> = ZodType<Value, unknown>;

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_Request_Options = {
  body?: unknown;
  headers?: HeadersInit;
  method?: 'DELETE' | 'GET' | 'POST' | 'PUT';
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_ErrorIssue = {
  field: string;
  message: string;
  path: string[];
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_ErrorEnvelope = {
  error: {
    code: string;
    issues?: Web_Api_ErrorIssue[] | undefined;
    message: string;
  };
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_SetupStatus = {
  claimExpiresAt?: string | undefined;
  claimRequired: boolean;
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_RemovedSecret = {
  credentialType?: Web_Api_CredentialType | undefined;
  kind: 'authenticator' | 'notification' | 'pfsense-credential';
  name?: string | undefined;
  notificationId?: string | undefined;
  removedAt: string;
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_Principal = {
  administratorId?: string | undefined;
  authenticationType: 'session' | 'token';
  id: string;
  removedSecrets?: Web_Api_RemovedSecret[] | undefined;
  scopes?: string[] | undefined;
  username?: string | undefined;
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_AuthenticationResponse = {
  administrator: {
    id: string;
    username: string;
  };
  csrfToken: string;
  expiresAt: string;
  status: 'authenticated';
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_SecondFactorRequired = {
  challenge: string;
  expiresAt: string;
  status: 'second_factor_required';
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_LoginResult = Web_Api_AuthenticationResponse | Web_Api_SecondFactorRequired;

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_ClaimInput = {
  claimCode: string;
  password: string;
  username: string;
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_LoginInput = {
  password: string;
  username: string;
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_Passkey = {
  createdAt: string;
  hostname: string | null;
  id: string;
  lastUsedAt: string | null;
  name: string;
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_AccountSecurity = {
  hostname: string;
  passkeys: Web_Api_Passkey[];
  passkeysAvailable: boolean;
  recoveryCodesRemaining: number;
  totpEnabled: boolean;
  username: string;
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_TotpSetup = {
  expiresAt: string;
  qrCode: string;
  secret: string;
  uri: string;
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_RecoveryCodes = {
  recoveryCodes: string[];
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_PasskeyCeremony = {
  ceremonyId: string;
  options: Record<string, unknown>;
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_Scope = 'pfsense:read' | 'reachability:read' | 'wol:execute';

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_Token = {
  createdAt: string;
  expiresAt: string | null;
  id: string;
  lastUsedAt: string | null;
  name: string;
  scopes: Web_Api_Scope[];
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_CreatedToken = {
  plaintext: string;
  token: Web_Api_Token;
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_CreateTokenInput = {
  expiresAt?: string | undefined;
  name: string;
  scopes: Web_Api_Scope[];
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_UpdateTokenInput = {
  expiresAt?: string | null | undefined;
  name: string;
  scopes: Web_Api_Scope[];
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_CredentialType = 'password' | 'privateKey';

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_Connection = {
  configured: boolean;
  credentialSaved?: boolean | undefined;
  credentialType?: Web_Api_CredentialType | undefined;
  pfsenseSshIp?: string | undefined;
  pfsenseSshPort?: number | undefined;
  pfsenseUsername?: string | undefined;
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_ConnectionInput = {
  credential?: string | undefined;
  credentialType: Web_Api_CredentialType;
  pfsenseSshIp: string;
  pfsenseSshPort: number;
  pfsenseUsername: string;
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_ConnectionTest = {
  connected: boolean;
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_ActivityCategory = 'access' | 'configuration' | 'service' | 'token';

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_ActivityEvent = {
  action: string;
  actorId: string;
  category: Web_Api_ActivityCategory;
  createdAt: string;
  id: string;
  outcome: 'failed' | 'succeeded';
  summary: string;
};

/**
 * API.
 *
 * @since 2.0.0
 */
export type Web_Api_Overview = {
  activityCount: number;
  administrator: {
    createdAt: string;
    username: string;
  } | null;
  connection: Web_Api_Connection;
  tokenCount: number;
  uptimeSeconds: number;
  version: string;
};
