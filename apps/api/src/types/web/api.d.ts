import type {
  ZodSafeParseResult,
  ZodType,
} from 'zod';

import type {
  Web_Backup_Grant,
  Web_Backup_ImportPreview,
  Web_Backup_ImportResult,
} from '@/types/web/backup.d.ts';
import type {
  Web_Notifications_Event,
  Web_Notifications_Target,
  Web_Notifications_TestResult,
} from '@/types/web/notifications.d.ts';

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
  role?: string;
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
 * @since 2.1.0
 */
export type Web_Api_Diagnostics = {
  debugLogging: boolean;
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

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_AccountSecuritySchema = Web_Api_Schema<Web_Api_AccountSecurity>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_ActivityEventSchema = Web_Api_Schema<Web_Api_ActivityEvent>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_AddPasskey_Name = string;
export type Web_Api_AddPasskey_Password = string;
export type Web_Api_AddPasskey_Returns = Promise<Web_Api_Passkey>;
export type Web_Api_AddPasskey_Credential = Record<string, unknown>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_ApiError_Code = string;
export type Web_Api_ApiError_Status = number;
export type Web_Api_ApiError_Issues = Web_Api_ErrorIssue[];

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_ApiError_Constructor_Message = string;
export type Web_Api_ApiError_Constructor_Code = string;
export type Web_Api_ApiError_Constructor_Status = number;
export type Web_Api_ApiError_Constructor_Issues = Web_Api_ErrorIssue[];

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_ApplyBackupImport_Grant = string;
export type Web_Api_ApplyBackupImport_Returns = Promise<Web_Backup_ImportResult>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_AuthenticationResponseSchema = Web_Api_Schema<Web_Api_AuthenticationResponse>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_BackupGrantSchema = Web_Api_Schema<Web_Backup_Grant>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_BackupImportPreviewSchema = Web_Api_Schema<Web_Backup_ImportPreview>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_BackupImportResultSchema = Web_Api_Schema<Web_Backup_ImportResult>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_BuildRequest_Returns = RequestInit;
export type Web_Api_BuildRequest_Method = string;
export type Web_Api_BuildRequest_CsrfToken = string | undefined;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_ChangePassword_CurrentPassword = string;
export type Web_Api_ChangePassword_NewPassword = string;
export type Web_Api_ChangePassword_Returns = Promise<void>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_ChangeUsername_Username = string;
export type Web_Api_ChangeUsername_Password = string;
export type Web_Api_ChangeUsername_Returns = Promise<void>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_ClaimInstallation_Returns = Promise<Web_Api_AuthenticationResponse>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_ConfirmBackupOperation_Password = string;
export type Web_Api_ConfirmBackupOperation_Code = string;
export type Web_Api_ConfirmBackupOperation_Returns = Promise<string>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_ConfirmBackupOperationWithPasskey_Returns = Promise<string>;
export type Web_Api_ConfirmBackupOperationWithPasskey_Credential = Record<string, unknown>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_ConnectionSchema = Web_Api_Schema<Web_Api_Connection>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_ConnectionTestSchema = Web_Api_Schema<Web_Api_ConnectionTest>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_CreatedTokenSchema = Web_Api_Schema<Web_Api_CreatedToken>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_CreateNotification_Returns = Promise<Web_Notifications_Target>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_CreateToken_Returns = Promise<Web_Api_CreatedToken>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_DiagnosticsSchema = Web_Api_Schema<Web_Api_Diagnostics>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_DisableTotp_Password = string;
export type Web_Api_DisableTotp_Returns = Promise<void>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_DismissRemovedSecrets_Returns = Promise<void>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_DownloadBackupExport_Grant = string;
export type Web_Api_DownloadBackupExport_Returns = Promise<void>;
export type Web_Api_DownloadBackupExport_ContentDisposition = string;
export type Web_Api_DownloadBackupExport_FilenameMatch = RegExpMatchArray | null;
export type Web_Api_DownloadBackupExport_MatchedFilename = string | undefined;
export type Web_Api_DownloadBackupExport_Filename = string;
export type Web_Api_DownloadBackupExport_ObjectUrl = string;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_EnableTotp_Code = string;
export type Web_Api_EnableTotp_Returns = Promise<Web_Api_RecoveryCodes>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_ErrorEnvelopeSchema = Web_Api_Schema<Web_Api_ErrorEnvelope>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_GetAccountSecurity_Returns = Promise<Web_Api_AccountSecurity>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_GetActivity_Returns = Promise<Web_Api_ActivityEvent[]>;
export type Web_Api_GetActivity_Response_Items = Web_Api_ActivityEvent[];
export type Web_Api_GetActivity_Response = {
  items: Web_Api_GetActivity_Response_Items;
};

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_GetConnection_Returns = Promise<Web_Api_Connection>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_GetCurrentPrincipal_Returns = Promise<Web_Api_Principal | null>;
export type Web_Api_GetCurrentPrincipal_ResponseValue = unknown;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_GetDiagnostics_Returns = Promise<Web_Api_Diagnostics>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_GetNotificationEvents_Returns = Promise<Web_Notifications_Event[]>;
export type Web_Api_GetNotificationEvents_Response_Items = Web_Notifications_Event[];
export type Web_Api_GetNotificationEvents_Response = {
  items: Web_Api_GetNotificationEvents_Response_Items;
};

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_GetNotifications_Returns = Promise<Web_Notifications_Target[]>;
export type Web_Api_GetNotifications_Response_Items = Web_Notifications_Target[];
export type Web_Api_GetNotifications_Response = {
  items: Web_Api_GetNotifications_Response_Items;
};

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_GetOverview_Returns = Promise<Web_Api_Overview>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_GetSetupStatus_Returns = Promise<Web_Api_SetupStatus>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_GetTokens_Returns = Promise<Web_Api_Token[]>;
export type Web_Api_GetTokens_Response_Items = Web_Api_Token[];
export type Web_Api_GetTokens_Response = {
  items: Web_Api_GetTokens_Response_Items;
};

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_IssueFor_CaughtError = unknown;
export type Web_Api_IssueFor_Field = string;
export type Web_Api_IssueFor_Returns = string;
export type Web_Api_IssueFor_Issue = Web_Api_ErrorIssue | undefined;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_Login_Returns = Promise<Web_Api_LoginResult>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_LoginResultSchema = Web_Api_Schema<Web_Api_LoginResult>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_Logout_Returns = Promise<void>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_NotificationTargetSchema = Web_Api_Schema<Web_Notifications_Target>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_NotificationTestSchema = Web_Api_Schema<Web_Notifications_TestResult>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_OverviewSchema = Web_Api_Schema<Web_Api_Overview>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_PasskeyCeremonySchema = Web_Api_Schema<Web_Api_PasskeyCeremony>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_PasskeySchema = Web_Api_Schema<Web_Api_Passkey>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_PreviewBackupImport_Returns = Promise<Web_Backup_ImportPreview>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_PrincipalSchema = Web_Api_Schema<Web_Api_Principal>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_ReadCookie_Name = string;
export type Web_Api_ReadCookie_Returns = string | undefined;
export type Web_Api_ReadCookie_Prefix = string;
export type Web_Api_ReadCookie_Parts = string[];
export type Web_Api_ReadCookie_MatchingPart = string | undefined;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_RecoveryCodesSchema = Web_Api_Schema<Web_Api_RecoveryCodes>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_RegenerateRecoveryCodes_Password = string;
export type Web_Api_RegenerateRecoveryCodes_Returns = Promise<Web_Api_RecoveryCodes>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_RemovedSecretSchema = Web_Api_Schema<Web_Api_RemovedSecret>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_RemoveNotification_NotificationId = string;
export type Web_Api_RemoveNotification_Returns = Promise<void>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_RemovePasskey_PasskeyId = string;
export type Web_Api_RemovePasskey_Password = string;
export type Web_Api_RemovePasskey_Returns = Promise<void>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_RequestJson_Path = string;
export type Web_Api_RequestJson_ResponseValue = unknown;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_RequestVoid_Path = string;
export type Web_Api_RequestVoid_Returns = Promise<void>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_ResponseError_Returns = Promise<Web_Api_ResponseError_ApiError>;
export type Web_Api_ResponseError_ApiError = Error & {
  readonly code: string;
  readonly issues: Web_Api_ErrorIssue[];
  readonly status: number;
};
export type Web_Api_ResponseError_ResponseValue = unknown;
export type Web_Api_ResponseError_ParsedError = ZodSafeParseResult<Web_Api_ErrorEnvelope>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_RevokeToken_TokenId = string;
export type Web_Api_RevokeToken_Returns = Promise<void>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_SetupStatusSchema = Web_Api_Schema<Web_Api_SetupStatus>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_SignInWithPasskey_Returns = Promise<Web_Api_AuthenticationResponse>;
export type Web_Api_SignInWithPasskey_Credential = Record<string, unknown>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_StartTotpSetup_Password = string;
export type Web_Api_StartTotpSetup_Returns = Promise<Web_Api_TotpSetup>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_SubmitSecondFactor_Challenge = string;
export type Web_Api_SubmitSecondFactor_Code = string;
export type Web_Api_SubmitSecondFactor_Returns = Promise<Web_Api_AuthenticationResponse>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_SummaryFor_CaughtError = unknown;
export type Web_Api_SummaryFor_ShownFields = string[];
export type Web_Api_SummaryFor_Fallback = string;
export type Web_Api_SummaryFor_Returns = string;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_TestConnection_Returns = Promise<Web_Api_ConnectionTest>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_TestNotification_NotificationId = string;
export type Web_Api_TestNotification_Returns = Promise<Web_Notifications_TestResult>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_TokenSchema = Web_Api_Schema<Web_Api_Token>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_TotpSetupSchema = Web_Api_Schema<Web_Api_TotpSetup>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_UpdateConnection_Returns = Promise<Web_Api_Connection>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_UpdateDiagnostics_Returns = Promise<Web_Api_Diagnostics>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_UpdateNotification_NotificationId = string;
export type Web_Api_UpdateNotification_Returns = Promise<Web_Notifications_Target>;

/**
 * API.
 *
 * @since 2.2.1
 */
export type Web_Api_UpdateToken_TokenId = string;
export type Web_Api_UpdateToken_Returns = Promise<Web_Api_Token>;
