import { z } from 'zod';

import {
  createPasskey,
  getPasskey,
} from '@/web/passkeys.ts';
import { contentDispositionFilenamePattern } from '@/web/regex.js';

import type {
  Web_Api_AccountSecuritySchema,
  Web_Api_ActivityEventSchema,
  Web_Api_AddPasskey_Credential,
  Web_Api_AddPasskey_Name,
  Web_Api_AddPasskey_Password,
  Web_Api_AddPasskey_Returns,
  Web_Api_ApiError_Code,
  Web_Api_ApiError_Constructor_Code,
  Web_Api_ApiError_Constructor_Issues,
  Web_Api_ApiError_Constructor_Message,
  Web_Api_ApiError_Constructor_Status,
  Web_Api_ApiError_Issues,
  Web_Api_ApiError_Status,
  Web_Api_ApplyBackupImport_Grant,
  Web_Api_ApplyBackupImport_Returns,
  Web_Api_AuthenticationResponseSchema,
  Web_Api_BackupGrantSchema,
  Web_Api_BackupImportPreviewSchema,
  Web_Api_BackupImportResultSchema,
  Web_Api_BuildRequest_CsrfToken,
  Web_Api_BuildRequest_Method,
  Web_Api_BuildRequest_Returns,
  Web_Api_ChangePassword_CurrentPassword,
  Web_Api_ChangePassword_NewPassword,
  Web_Api_ChangePassword_Returns,
  Web_Api_ChangeUsername_Password,
  Web_Api_ChangeUsername_Returns,
  Web_Api_ChangeUsername_Username,
  Web_Api_ClaimInput,
  Web_Api_ClaimInstallation_Returns,
  Web_Api_ConfirmBackupOperation_Code,
  Web_Api_ConfirmBackupOperation_Password,
  Web_Api_ConfirmBackupOperation_Returns,
  Web_Api_ConfirmBackupOperationWithPasskey_Credential,
  Web_Api_ConfirmBackupOperationWithPasskey_Returns,
  Web_Api_ConnectionInput,
  Web_Api_ConnectionSchema,
  Web_Api_ConnectionTestSchema,
  Web_Api_CreatedTokenSchema,
  Web_Api_CreateNotification_Returns,
  Web_Api_CreateToken_Returns,
  Web_Api_CreateTokenInput,
  Web_Api_Diagnostics,
  Web_Api_DiagnosticsSchema,
  Web_Api_DisableTotp_Password,
  Web_Api_DisableTotp_Returns,
  Web_Api_DismissRemovedSecrets_Returns,
  Web_Api_DownloadBackupExport_ContentDisposition,
  Web_Api_DownloadBackupExport_Filename,
  Web_Api_DownloadBackupExport_FilenameMatch,
  Web_Api_DownloadBackupExport_Grant,
  Web_Api_DownloadBackupExport_MatchedFilename,
  Web_Api_DownloadBackupExport_ObjectUrl,
  Web_Api_DownloadBackupExport_Returns,
  Web_Api_EnableTotp_Code,
  Web_Api_EnableTotp_Returns,
  Web_Api_ErrorEnvelopeSchema,
  Web_Api_GetAccountSecurity_Returns,
  Web_Api_GetActivity_Response,
  Web_Api_GetActivity_Returns,
  Web_Api_GetConnection_Returns,
  Web_Api_GetCurrentPrincipal_ResponseValue,
  Web_Api_GetCurrentPrincipal_Returns,
  Web_Api_GetDiagnostics_Returns,
  Web_Api_GetNotificationEvents_Response,
  Web_Api_GetNotificationEvents_Returns,
  Web_Api_GetNotifications_Response,
  Web_Api_GetNotifications_Returns,
  Web_Api_GetOverview_Returns,
  Web_Api_GetSetupStatus_Returns,
  Web_Api_GetTokens_Response,
  Web_Api_GetTokens_Returns,
  Web_Api_IssueFor_CaughtError,
  Web_Api_IssueFor_Field,
  Web_Api_IssueFor_Issue,
  Web_Api_IssueFor_Returns,
  Web_Api_Login_Returns,
  Web_Api_LoginInput,
  Web_Api_LoginResultSchema,
  Web_Api_Logout_Returns,
  Web_Api_NotificationTargetSchema,
  Web_Api_NotificationTestSchema,
  Web_Api_OverviewSchema,
  Web_Api_PasskeyCeremony,
  Web_Api_PasskeyCeremonySchema,
  Web_Api_PasskeySchema,
  Web_Api_PreviewBackupImport_Returns,
  Web_Api_PrincipalSchema,
  Web_Api_ReadCookie_MatchingPart,
  Web_Api_ReadCookie_Name,
  Web_Api_ReadCookie_Parts,
  Web_Api_ReadCookie_Prefix,
  Web_Api_ReadCookie_Returns,
  Web_Api_RecoveryCodesSchema,
  Web_Api_RegenerateRecoveryCodes_Password,
  Web_Api_RegenerateRecoveryCodes_Returns,
  Web_Api_RemovedSecretSchema,
  Web_Api_RemoveNotification_NotificationId,
  Web_Api_RemoveNotification_Returns,
  Web_Api_RemovePasskey_PasskeyId,
  Web_Api_RemovePasskey_Password,
  Web_Api_RemovePasskey_Returns,
  Web_Api_Request_Options,
  Web_Api_RequestJson_Path,
  Web_Api_RequestJson_ResponseValue,
  Web_Api_RequestVoid_Path,
  Web_Api_RequestVoid_Returns,
  Web_Api_ResponseError_ParsedError,
  Web_Api_ResponseError_ResponseValue,
  Web_Api_ResponseError_Returns,
  Web_Api_RevokeToken_Returns,
  Web_Api_RevokeToken_TokenId,
  Web_Api_Schema,
  Web_Api_SetupStatusSchema,
  Web_Api_SignInWithPasskey_Credential,
  Web_Api_SignInWithPasskey_Returns,
  Web_Api_StartTotpSetup_Password,
  Web_Api_StartTotpSetup_Returns,
  Web_Api_SubmitSecondFactor_Challenge,
  Web_Api_SubmitSecondFactor_Code,
  Web_Api_SubmitSecondFactor_Returns,
  Web_Api_SummaryFor_CaughtError,
  Web_Api_SummaryFor_Fallback,
  Web_Api_SummaryFor_Returns,
  Web_Api_SummaryFor_ShownFields,
  Web_Api_TestConnection_Returns,
  Web_Api_TestNotification_NotificationId,
  Web_Api_TestNotification_Returns,
  Web_Api_TokenSchema,
  Web_Api_TotpSetupSchema,
  Web_Api_UpdateConnection_Returns,
  Web_Api_UpdateDiagnostics_Returns,
  Web_Api_UpdateNotification_NotificationId,
  Web_Api_UpdateNotification_Returns,
  Web_Api_UpdateToken_Returns,
  Web_Api_UpdateToken_TokenId,
  Web_Api_UpdateTokenInput,
} from '@/types/web/api.d.ts';
import type {
  Web_Backup_Document,
  Web_Backup_ExportSections,
  Web_Backup_Grant,
  Web_Backup_Purpose,
} from '@/types/web/backup.d.ts';
import type {
  Web_Notifications_CreateInput,
  Web_Notifications_UpdateInput,
} from '@/types/web/notifications.d.ts';

/**
 * API - Error Envelope Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const errorEnvelopeSchema: Web_Api_ErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    issues: z.array(z.object({
      field: z.string(),
      message: z.string(),
      path: z.array(z.string()),
    })).optional(),
    message: z.string(),
  }),
});

/**
 * API - Setup Status Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const setupStatusSchema: Web_Api_SetupStatusSchema = z.object({
  claimExpiresAt: z.string().optional(),
  claimRequired: z.boolean(),
});

/**
 * API - Removed Secret Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const removedSecretSchema: Web_Api_RemovedSecretSchema = z.object({
  credentialType: z.enum([
    'password',
    'privateKey',
  ]).optional(),
  kind: z.enum([
    'authenticator',
    'notification',
    'pfsense-credential',
  ]),
  name: z.string().optional(),
  notificationId: z.string().optional(),
  removedAt: z.string(),
});

/**
 * API - Notification Target Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const notificationTargetSchema: Web_Api_NotificationTargetSchema = z.object({
  createdAt: z.string(),
  events: z.array(z.string()),
  id: z.string(),
  lastAttemptAt: z.string().nullable(),
  lastError: z.string().nullable(),
  name: z.string(),
  secrets: z.record(z.string(), z.literal(true)),
  secretsMissing: z.array(z.string()),
  service: z.enum([
    'apprise',
    'discord',
    'email',
    'gotify',
    'matrix',
    'ntfy',
    'ntfy-reverse-proxy',
    'pushover',
    'slack',
    'telegram',
    'webhook',
  ]),
  settings: z.record(z.string(), z.string()),
  updatedAt: z.string(),
});

/**
 * API - Notification Targets Response Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const notificationTargetsResponseSchema = z.object({
  items: z.array(notificationTargetSchema),
});

/**
 * API - Notification Events Response Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const notificationEventsResponseSchema = z.object({
  items: z.array(z.object({
    defaultEnabled: z.boolean(),
    description: z.string(),
    key: z.string(),
    label: z.string(),
  })),
});

/**
 * API - Notification Test Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const notificationTestSchema: Web_Api_NotificationTestSchema = z.object({
  delivered: z.boolean(),
  message: z.string().optional(),
});

/**
 * API - Principal Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const principalSchema: Web_Api_PrincipalSchema = z.object({
  administratorId: z.string().optional(),
  authenticationType: z.enum([
    'session',
    'token',
  ]),
  id: z.string(),
  removedSecrets: z.array(removedSecretSchema).optional(),
  scopes: z.array(z.string()).optional(),
  username: z.string().optional(),
});

/**
 * API - Authentication Response Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const authenticationResponseSchema: Web_Api_AuthenticationResponseSchema = z.object({
  administrator: z.object({
    id: z.string(),
    username: z.string(),
  }),
  csrfToken: z.string(),
  expiresAt: z.string(),
  status: z.literal('authenticated'),
});

/**
 * API - Login Result Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const loginResultSchema: Web_Api_LoginResultSchema = z.union([
  authenticationResponseSchema,
  z.object({
    challenge: z.string(),
    expiresAt: z.string(),
    status: z.literal('second_factor_required'),
  }),
]);

/**
 * API - Passkey Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const passkeySchema: Web_Api_PasskeySchema = z.object({
  createdAt: z.string(),
  hostname: z.string().nullable(),
  id: z.string(),
  lastUsedAt: z.string().nullable(),
  name: z.string(),
});

/**
 * API - Account Security Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const accountSecuritySchema: Web_Api_AccountSecuritySchema = z.object({
  hostname: z.string(),
  passkeys: z.array(passkeySchema),
  passkeysAvailable: z.boolean(),
  recoveryCodesRemaining: z.number(),
  totpEnabled: z.boolean(),
  username: z.string(),
});

/**
 * API - Totp Setup Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const totpSetupSchema: Web_Api_TotpSetupSchema = z.object({
  expiresAt: z.string(),
  qrCode: z.string(),
  secret: z.string(),
  uri: z.string(),
});

/**
 * API - Recovery Codes Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const recoveryCodesSchema: Web_Api_RecoveryCodesSchema = z.object({
  recoveryCodes: z.array(z.string()),
});

/**
 * API - Passkey Ceremony Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const passkeyCeremonySchema: Web_Api_PasskeyCeremonySchema = z.object({
  ceremonyId: z.string(),
  options: z.record(z.string(), z.unknown()),
});

/**
 * API - Scope Schema.
 *
 * Encapsulates the related behavior behind one reusable interface.
 * Callers share the same lifecycle and state management.
 *
 * @since 2.0.0
 */
const scopeSchema = z.enum([
  'pfsense:read',
  'reachability:read',
  'wol:execute',
]);

/**
 * API - Token Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const tokenSchema: Web_Api_TokenSchema = z.object({
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
  id: z.string(),
  lastUsedAt: z.string().nullable(),
  name: z.string(),
  scopes: z.array(scopeSchema),
});

/**
 * API - Tokens Response Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const tokensResponseSchema = z.object({
  items: z.array(tokenSchema),
});

/**
 * API - Created Token Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const createdTokenSchema: Web_Api_CreatedTokenSchema = z.object({
  plaintext: z.string(),
  token: tokenSchema,
});

/**
 * API - Connection Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const connectionSchema: Web_Api_ConnectionSchema = z.object({
  configured: z.boolean(),
  credentialSaved: z.boolean().optional(),
  credentialType: z.enum([
    'password',
    'privateKey',
  ]).optional(),
  pfsenseSshIp: z.string().optional(),
  pfsenseSshPort: z.number().optional(),
  pfsenseUsername: z.string().optional(),
});

/**
 * API - Connection Test Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const connectionTestSchema: Web_Api_ConnectionTestSchema = z.object({
  connected: z.boolean(),
});

/**
 * API - Diagnostics Schema.
 *
 * Reads whether Debug logging is on, for the Connection page's switch.
 * The same shape answers both reading and changing it.
 *
 * @since 2.1.0
 */
const diagnosticsSchema: Web_Api_DiagnosticsSchema = z.object({
  debugLogging: z.boolean(),
});

/**
 * API - Activity Event Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const activityEventSchema: Web_Api_ActivityEventSchema = z.object({
  action: z.string(),
  actorId: z.string(),
  category: z.enum([
    'access',
    'configuration',
    'service',
    'token',
  ]),
  createdAt: z.string(),
  id: z.string(),
  outcome: z.enum([
    'failed',
    'succeeded',
  ]),
  summary: z.string(),
});

/**
 * API - Activity Response Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const activityResponseSchema = z.object({
  items: z.array(activityEventSchema),
});

/**
 * API - Overview Schema.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const overviewSchema: Web_Api_OverviewSchema = z.object({
  activityCount: z.number(),
  administrator: z.object({
    createdAt: z.string(),
    username: z.string(),
  }).nullable(),
  connection: connectionSchema,
  tokenCount: z.number(),
  uptimeSeconds: z.number(),
  version: z.string(),
});

/**
 * API - Backup Grant Schema.
 *
 * Validates the short-lived credential returned after identity confirmation.
 * The raw value stays in the active dialog until its one operation consumes it.
 *
 * @since 2.1.0
 */
const backupGrantSchema: Web_Api_BackupGrantSchema = z.object({
  expiresAt: z.string(),
  grant: z.string(),
}).strict();

/**
 * API - Backup Import Summary Schema.
 *
 * Validates preview and apply summaries before the wizard renders them.
 * Portable file contents use the stricter browser format schema separately.
 *
 * @since 2.1.0
 */
const backupImportSummarySchema = z.object({
  accessTokens: z.object({
    added: z.number().int().nonnegative(),
    skipped: z.number().int().nonnegative(),
  }).strict(),
  connection: z.enum([
    'added',
    'replaced',
    'skipped',
  ]),
  notifications: z.object({
    added: z.number().int().nonnegative(),
    replaced: z.number().int().nonnegative(),
  }).strict(),
}).strict();

/**
 * API - Backup Import Preview Schema.
 *
 * Validates the file-versus-here plan used by the Settings and Review steps.
 * The server remains authoritative about replacement and duplicate behavior.
 *
 * @since 2.1.0
 */
const backupImportPreviewSchema: Web_Api_BackupImportPreviewSchema = z.object({
  appVersion: z.string(),
  exportedAt: z.string(),
  sections: z.array(z.object({
    file: z.string(),
    here: z.string(),
    id: z.enum([
      'connection',
      'notifications',
      'accessTokens',
    ]),
    label: z.string(),
    reason: z.string().optional(),
    willImport: z.boolean(),
  }).strict()),
  summary: backupImportSummarySchema,
}).strict();

/**
 * API - Backup Import Result Schema.
 *
 * Adds the committed section list to the preview summary.
 * Progress presentation uses this response only after the transaction succeeds.
 *
 * @since 2.1.0
 */
const backupImportResultSchema: Web_Api_BackupImportResultSchema = backupImportSummarySchema.extend({
  importedSections: z.array(z.enum([
    'connection',
    'notifications',
    'accessTokens',
  ])),
}).strict();

/**
 * API.
 *
 * Keeps the machine-readable code and field issues from the shared error envelope so
 * screens can react to specific failures and show each message next to its field.
 *
 * @since 2.0.0
 */
export class ApiError extends Error {
  /**
   * API - Code.
   *
   * Stores this module-level value in one named location.
   * Related code reuses it instead of duplicating the definition.
   *
   * @since 2.0.0
   */
  public readonly code: Web_Api_ApiError_Code;

  /**
   * API - Status.
   *
   * Stores this module-level value in one named location.
   * Related code reuses it instead of duplicating the definition.
   *
   * @since 2.0.0
   */
  public readonly status: Web_Api_ApiError_Status;

  /**
   * API - Issues.
   *
   * Stores this module-level value in one named location.
   * Related code reuses it instead of duplicating the definition.
   *
   * @since 2.0.0
   */
  public readonly issues: Web_Api_ApiError_Issues;

  /**
   * API - Constructor.
   *
   * Stores this module-level value in one named location.
   * Related code reuses it instead of duplicating the definition.
   *
   * @since 2.0.0
   */
  public constructor(message: Web_Api_ApiError_Constructor_Message, code: Web_Api_ApiError_Constructor_Code, status: Web_Api_ApiError_Constructor_Status, issues: Web_Api_ApiError_Constructor_Issues) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.issues = issues;

    return;
  }
}

// issueFor returns the message the API attached to one form field, if any.

/**
 * API - Issue For.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_IssueFor_Returns}
 *
 * @since 2.0.0
 */
export const issueFor = (caughtError: Web_Api_IssueFor_CaughtError, field: Web_Api_IssueFor_Field): Web_Api_IssueFor_Returns => {
  if (!(caughtError instanceof ApiError)) {
    return '';
  }

  const issue: Web_Api_IssueFor_Issue = caughtError.issues.find(
    (candidate) => candidate['field'] === field,
  );

  return (issue === undefined) ? '' : issue['message'];
};

// summaryFor returns the banner text for an error, or nothing when a shown field already carries it.

/**
 * API - Summary For.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_SummaryFor_Returns}
 *
 * @since 2.0.0
 */
export const summaryFor = (caughtError: Web_Api_SummaryFor_CaughtError, shownFields: Web_Api_SummaryFor_ShownFields, fallback: Web_Api_SummaryFor_Fallback): Web_Api_SummaryFor_Returns => {
  if (caughtError === null || caughtError === undefined) {
    return '';
  }

  if (
    caughtError instanceof ApiError
    && caughtError.issues.some(
      (issue) => shownFields.includes(issue['field']),
    ) === true
  ) {
    return '';
  }

  if (caughtError instanceof DOMException && caughtError.name === 'NotAllowedError') {
    return 'The passkey prompt was closed before it finished.';
  }

  if (caughtError instanceof DOMException && caughtError.name === 'InvalidStateError') {
    return 'This device already has a passkey for this account.';
  }

  return (caughtError instanceof Error) ? caughtError.message : fallback;
};

// responseError converts the stable API error envelope into an ApiError.

/**
 * API - Response Error.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_ResponseError_Returns}
 *
 * @since 2.0.0
 */
const responseError = async (response: Response): Web_Api_ResponseError_Returns => {
  const responseValue: Web_Api_ResponseError_ResponseValue = await response.json().catch(() => undefined);
  const parsedError: Web_Api_ResponseError_ParsedError = errorEnvelopeSchema.safeParse(responseValue);
  if (parsedError.success === true) {
    return new ApiError(
      parsedError.data['error']['message'],
      parsedError.data['error']['code'],
      response.status,
      parsedError.data['error']['issues'] ?? [],
    );
  }

  return new ApiError(`Request failed with status ${response.status}.`, 'request_failed', response.status, []);
};

// readCookie returns one non-HTTP-only same-origin cookie.

/**
 * API - Read Cookie.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_ReadCookie_Returns}
 *
 * @since 2.0.0
 */
const readCookie = (name: Web_Api_ReadCookie_Name): Web_Api_ReadCookie_Returns => {
  const prefix: Web_Api_ReadCookie_Prefix = `${name}=`;
  const parts: Web_Api_ReadCookie_Parts = document.cookie.split(';');
  const matchingPart: Web_Api_ReadCookie_MatchingPart = parts
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return (matchingPart === undefined) ? undefined : decodeURIComponent(matchingPart.slice(prefix.length));
};

// buildRequest adds the JSON body, the CSRF header for mutations, and same-origin cookies.

/**
 * API - Build Request.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_BuildRequest_Returns}
 *
 * @since 2.0.0
 */
const buildRequest = (options: Web_Api_Request_Options): Web_Api_BuildRequest_Returns => {
  const headers: Headers = new Headers(options['headers']);
  const method: Web_Api_BuildRequest_Method = options['method'] ?? 'GET';

  if (options['body'] !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (method !== 'GET') {
    const csrfToken: Web_Api_BuildRequest_CsrfToken = readCookie('pfa_csrf');
    if (csrfToken !== undefined) {
      headers.set('X-CSRF-Token', csrfToken);
    }
  }

  return {
    ...((options['body'] === undefined) ? {} : { body: JSON.stringify(options['body']) }),
    credentials: 'same-origin',
    headers,
    method,
  };
};

// requestJSON performs one same-origin request and validates its response contract.

/**
 * API - Request JSON.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @returns {Promise<ResponseValue>}
 *
 * @since 2.0.0
 */
const requestJSON = async <ResponseValue>(
  path: Web_Api_RequestJson_Path,
  schema: Web_Api_Schema<ResponseValue>,
  options: Web_Api_Request_Options = {},
): Promise<ResponseValue> => {
  const response: Response = await fetch(path, buildRequest(options));
  if (response.ok === false) {
    throw await responseError(response);
  }

  const responseValue: Web_Api_RequestJson_ResponseValue = await response.json();

  return schema.parse(responseValue);
};

// requestVoid performs one mutation whose successful response has no body.

/**
 * API - Request Void.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @returns {Web_Api_RequestVoid_Returns}
 *
 * @since 2.0.0
 */
const requestVoid = async (
  path: Web_Api_RequestVoid_Path,
  options: Web_Api_Request_Options,
): Web_Api_RequestVoid_Returns => {
  const response: Response = await fetch(path, buildRequest(options));
  if (response.ok === false) {
    throw await responseError(response);
  }

  return;
};

/**
 * API - Get Setup Status.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_GetSetupStatus_Returns}
 *
 * @since 2.0.0
 */
export const getSetupStatus = async (): Web_Api_GetSetupStatus_Returns => requestJSON(
  '/api/v1/setup/status',
  setupStatusSchema,
);

/**
 * API - Get Current Principal.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_GetCurrentPrincipal_Returns}
 *
 * @since 2.0.0
 */
export const getCurrentPrincipal = async (): Web_Api_GetCurrentPrincipal_Returns => {
  const response: Response = await fetch('/api/v1/auth/me', {
    credentials: 'same-origin',
  });
  if (response.status === 401) {
    return null;
  }
  if (response.ok === false) {
    throw await responseError(response);
  }

  const responseValue: Web_Api_GetCurrentPrincipal_ResponseValue = await response.json();

  return principalSchema.parse(responseValue);
};

/**
 * API - Claim Installation.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @returns {Web_Api_ClaimInstallation_Returns}
 *
 * @since 2.0.0
 */
export const claimInstallation = async (
  input: Web_Api_ClaimInput,
): Web_Api_ClaimInstallation_Returns => requestJSON(
  '/api/v1/setup/claim',
  authenticationResponseSchema,
  {
    body: {
      claimCode: input['claimCode'].trim(),
      password: input['password'],
      username: input['username'].trim(),
    },
    method: 'POST',
  },
);

/**
 * API - Login.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @returns {Web_Api_Login_Returns}
 *
 * @since 2.0.0
 */
export const login = async (
  input: Web_Api_LoginInput,
): Web_Api_Login_Returns => requestJSON(
  '/api/v1/auth/login',
  loginResultSchema,
  {
    body: {
      password: input['password'],
      username: input['username'].trim(),
    },
    method: 'POST',
  },
);

/**
 * API - Submit Second Factor.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @returns {Web_Api_SubmitSecondFactor_Returns}
 *
 * @since 2.0.0
 */
export const submitSecondFactor = async (
  challenge: Web_Api_SubmitSecondFactor_Challenge,
  code: Web_Api_SubmitSecondFactor_Code,
): Web_Api_SubmitSecondFactor_Returns => requestJSON(
  '/api/v1/auth/login/second-factor',
  authenticationResponseSchema,
  {
    body: {
      challenge,
      code: code.trim(),
    },
    method: 'POST',
  },
);

/**
 * API - Sign In With Passkey.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_SignInWithPasskey_Returns}
 *
 * @since 2.0.0
 */
export const signInWithPasskey = async (): Web_Api_SignInWithPasskey_Returns => {
  const ceremony: Web_Api_PasskeyCeremony = await requestJSON(
    '/api/v1/auth/passkeys/login/options',
    passkeyCeremonySchema,
    { method: 'POST' },
  );
  const credential: Web_Api_SignInWithPasskey_Credential = await getPasskey(ceremony['options']);

  return requestJSON(
    '/api/v1/auth/passkeys/login/verify',
    authenticationResponseSchema,
    {
      body: {
        ceremonyId: ceremony['ceremonyId'],
        credential,
      },
      method: 'POST',
    },
  );
};

/**
 * API - Logout.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_Logout_Returns}
 *
 * @since 2.0.0
 */
export const logout = async (): Web_Api_Logout_Returns => requestVoid(
  '/api/v1/auth/logout',
  { method: 'POST' },
);

/**
 * API - Dismiss Removed Secrets.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_DismissRemovedSecrets_Returns}
 *
 * @since 2.0.0
 */
export const dismissRemovedSecrets = async (): Web_Api_DismissRemovedSecrets_Returns => requestVoid(
  '/api/v1/auth/removed-secrets',
  { method: 'DELETE' },
);

/**
 * API - Get Account Security.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_GetAccountSecurity_Returns}
 *
 * @since 2.0.0
 */
export const getAccountSecurity = async (): Web_Api_GetAccountSecurity_Returns => requestJSON(
  '/api/v1/auth/security',
  accountSecuritySchema,
);

/**
 * API - Change Password.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @returns {Web_Api_ChangePassword_Returns}
 *
 * @since 2.0.0
 */
export const changePassword = async (
  currentPassword: Web_Api_ChangePassword_CurrentPassword,
  newPassword: Web_Api_ChangePassword_NewPassword,
): Web_Api_ChangePassword_Returns => requestVoid(
  '/api/v1/auth/password',
  {
    body: {
      currentPassword,
      newPassword,
    },
    method: 'POST',
  },
);

/**
 * API - Change Username.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @returns {Web_Api_ChangeUsername_Returns}
 *
 * @since 2.0.0
 */
export const changeUsername = async (
  username: Web_Api_ChangeUsername_Username,
  password: Web_Api_ChangeUsername_Password,
): Web_Api_ChangeUsername_Returns => {
  await requestJSON(
    '/api/v1/auth/username',
    z.object({
      administrator: z.object({
        id: z.string(),
        username: z.string(),
      }),
    }),
    {
      body: {
        password,
        username: username.trim(),
      },
      method: 'POST',
    },
  );

  return;
};

/**
 * API - Start Totp Setup.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_StartTotpSetup_Returns}
 *
 * @since 2.0.0
 */
export const startTotpSetup = async (password: Web_Api_StartTotpSetup_Password): Web_Api_StartTotpSetup_Returns => requestJSON(
  '/api/v1/auth/totp/setup',
  totpSetupSchema,
  {
    body: { password },
    method: 'POST',
  },
);

/**
 * API - Enable Totp.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_EnableTotp_Returns}
 *
 * @since 2.0.0
 */
export const enableTotp = async (code: Web_Api_EnableTotp_Code): Web_Api_EnableTotp_Returns => requestJSON(
  '/api/v1/auth/totp/enable',
  recoveryCodesSchema,
  {
    body: { code: code.trim() },
    method: 'POST',
  },
);

/**
 * API - Disable Totp.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_DisableTotp_Returns}
 *
 * @since 2.0.0
 */
export const disableTotp = async (password: Web_Api_DisableTotp_Password): Web_Api_DisableTotp_Returns => requestVoid(
  '/api/v1/auth/totp/disable',
  {
    body: { password },
    method: 'POST',
  },
);

/**
 * API - Regenerate Recovery Codes.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_RegenerateRecoveryCodes_Returns}
 *
 * @since 2.0.0
 */
export const regenerateRecoveryCodes = async (password: Web_Api_RegenerateRecoveryCodes_Password): Web_Api_RegenerateRecoveryCodes_Returns => requestJSON(
  '/api/v1/auth/recovery-codes',
  recoveryCodesSchema,
  {
    body: { password },
    method: 'POST',
  },
);

/**
 * API - Add Passkey.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_AddPasskey_Returns}
 *
 * @since 2.0.0
 */
export const addPasskey = async (name: Web_Api_AddPasskey_Name, password: Web_Api_AddPasskey_Password): Web_Api_AddPasskey_Returns => {
  const ceremony: Web_Api_PasskeyCeremony = await requestJSON(
    '/api/v1/auth/passkeys/register/options',
    passkeyCeremonySchema,
    {
      body: {
        name: name.trim(),
        password,
      },
      method: 'POST',
    },
  );
  const credential: Web_Api_AddPasskey_Credential = await createPasskey(ceremony['options']);

  return requestJSON(
    '/api/v1/auth/passkeys/register/verify',
    passkeySchema,
    {
      body: {
        ceremonyId: ceremony['ceremonyId'],
        credential,
      },
      method: 'POST',
    },
  );
};

/**
 * API - Remove Passkey.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_RemovePasskey_Returns}
 *
 * @since 2.0.0
 */
export const removePasskey = async (passkeyId: Web_Api_RemovePasskey_PasskeyId, password: Web_Api_RemovePasskey_Password): Web_Api_RemovePasskey_Returns => requestVoid(
  `/api/v1/auth/passkeys/${encodeURIComponent(passkeyId)}`,
  {
    body: { password },
    method: 'DELETE',
  },
);

/**
 * API - Get Overview.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_GetOverview_Returns}
 *
 * @since 2.0.0
 */
export const getOverview = async (): Web_Api_GetOverview_Returns => requestJSON(
  '/api/v1/overview',
  overviewSchema,
);

/**
 * API - Get Activity.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_GetActivity_Returns}
 *
 * @since 2.0.0
 */
export const getActivity = async (): Web_Api_GetActivity_Returns => {
  const response: Web_Api_GetActivity_Response = await requestJSON('/api/v1/activity', activityResponseSchema);

  return response['items'];
};

/**
 * API - Get Connection.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_GetConnection_Returns}
 *
 * @since 2.0.0
 */
export const getConnection = async (): Web_Api_GetConnection_Returns => requestJSON(
  '/api/v1/connection',
  connectionSchema,
);

/**
 * API - Update Connection.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @returns {Web_Api_UpdateConnection_Returns}
 *
 * @since 2.0.0
 */
export const updateConnection = async (
  input: Web_Api_ConnectionInput,
): Web_Api_UpdateConnection_Returns => requestJSON(
  '/api/v1/connection',
  connectionSchema,
  {
    body: input,
    method: 'PUT',
  },
);

/**
 * API - Test Connection.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_TestConnection_Returns}
 *
 * @since 2.0.0
 */
export const testConnection = async (): Web_Api_TestConnection_Returns => requestJSON(
  '/api/v1/connection/test',
  connectionTestSchema,
  { method: 'POST' },
);

/**
 * API - Get Diagnostics.
 *
 * Reads whether Debug logging is on.
 * The Connection page shows it on its switch.
 *
 * @returns {Web_Api_GetDiagnostics_Returns}
 *
 * @since 2.1.0
 */
export const getDiagnostics = async (): Web_Api_GetDiagnostics_Returns => requestJSON(
  '/api/v1/diagnostics',
  diagnosticsSchema,
);

/**
 * API - Update Diagnostics.
 *
 * Turns Debug logging on or off and answers with the saved setting.
 * The change takes effect at once, without a restart.
 *
 * @returns {Web_Api_UpdateDiagnostics_Returns}
 *
 * @since 2.1.0
 */
export const updateDiagnostics = async (
  input: Web_Api_Diagnostics,
): Web_Api_UpdateDiagnostics_Returns => requestJSON(
  '/api/v1/diagnostics',
  diagnosticsSchema,
  {
    body: input,
    method: 'PUT',
  },
);

/**
 * API - Get Tokens.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_GetTokens_Returns}
 *
 * @since 2.0.0
 */
export const getTokens = async (): Web_Api_GetTokens_Returns => {
  const response: Web_Api_GetTokens_Response = await requestJSON('/api/v1/auth/tokens', tokensResponseSchema);

  return response['items'];
};

/**
 * API - Create Token.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @returns {Web_Api_CreateToken_Returns}
 *
 * @since 2.0.0
 */
export const createToken = async (
  input: Web_Api_CreateTokenInput,
): Web_Api_CreateToken_Returns => requestJSON(
  '/api/v1/auth/tokens',
  createdTokenSchema,
  {
    body: {
      ...((input['expiresAt'] === undefined) ? {} : { expiresAt: input['expiresAt'] }),
      name: input['name'].trim(),
      scopes: input['scopes'],
    },
    method: 'POST',
  },
);

/**
 * API - Update Token.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @returns {Web_Api_UpdateToken_Returns}
 *
 * @since 2.0.0
 */
export const updateToken = async (
  tokenId: Web_Api_UpdateToken_TokenId,
  input: Web_Api_UpdateTokenInput,
): Web_Api_UpdateToken_Returns => requestJSON(
  `/api/v1/auth/tokens/${encodeURIComponent(tokenId)}`,
  tokenSchema,
  {
    body: {
      ...((input['expiresAt'] === undefined) ? {} : { expiresAt: input['expiresAt'] }),
      name: input['name'].trim(),
      scopes: input['scopes'],
    },
    method: 'PUT',
  },
);

/**
 * API - Revoke Token.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_RevokeToken_Returns}
 *
 * @since 2.0.0
 */
export const revokeToken = async (tokenId: Web_Api_RevokeToken_TokenId): Web_Api_RevokeToken_Returns => requestVoid(
  `/api/v1/auth/tokens/${encodeURIComponent(tokenId)}`,
  { method: 'DELETE' },
);

/**
 * API - Get Notifications.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_GetNotifications_Returns}
 *
 * @since 2.0.0
 */
export const getNotifications = async (): Web_Api_GetNotifications_Returns => {
  const response: Web_Api_GetNotifications_Response = await requestJSON('/api/v1/notifications', notificationTargetsResponseSchema);

  return response['items'];
};

/**
 * API - Get Notification Events.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_GetNotificationEvents_Returns}
 *
 * @since 2.0.0
 */
export const getNotificationEvents = async (): Web_Api_GetNotificationEvents_Returns => {
  const response: Web_Api_GetNotificationEvents_Response = await requestJSON('/api/v1/notifications/events', notificationEventsResponseSchema);

  return response['items'];
};

/**
 * API - Create Notification.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @returns {Web_Api_CreateNotification_Returns}
 *
 * @since 2.0.0
 */
export const createNotification = async (
  input: Web_Notifications_CreateInput,
): Web_Api_CreateNotification_Returns => requestJSON(
  '/api/v1/notifications',
  notificationTargetSchema,
  {
    body: {
      events: input['events'],
      name: input['name'].trim(),
      service: input['service'],
      settings: input['settings'],
    },
    method: 'POST',
  },
);

/**
 * API - Update Notification.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @returns {Web_Api_UpdateNotification_Returns}
 *
 * @since 2.0.0
 */
export const updateNotification = async (
  notificationId: Web_Api_UpdateNotification_NotificationId,
  input: Web_Notifications_UpdateInput,
): Web_Api_UpdateNotification_Returns => requestJSON(
  `/api/v1/notifications/${encodeURIComponent(notificationId)}`,
  notificationTargetSchema,
  {
    body: {
      clearSecrets: input['clearSecrets'],
      events: input['events'],
      name: input['name'].trim(),
      settings: input['settings'],
    },
    method: 'PUT',
  },
);

/**
 * API - Remove Notification.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_RemoveNotification_Returns}
 *
 * @since 2.0.0
 */
export const removeNotification = async (notificationId: Web_Api_RemoveNotification_NotificationId): Web_Api_RemoveNotification_Returns => requestVoid(
  `/api/v1/notifications/${encodeURIComponent(notificationId)}`,
  { method: 'DELETE' },
);

/**
 * API - Test Notification.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_Api_TestNotification_Returns}
 *
 * @since 2.0.0
 */
export const testNotification = async (notificationId: Web_Api_TestNotification_NotificationId): Web_Api_TestNotification_Returns => requestJSON(
  `/api/v1/notifications/${encodeURIComponent(notificationId)}/test`,
  notificationTestSchema,
  { method: 'POST' },
);

/**
 * API - Confirm Backup Operation.
 *
 * Exchanges fresh password and authenticator proof for one scoped, single-use grant.
 * The caller submits it only to the selected export or import operation.
 *
 * @returns {Web_Api_ConfirmBackupOperation_Returns}
 *
 * @since 2.1.0
 */
export const confirmBackupOperation = async (purpose: Web_Backup_Purpose, password: Web_Api_ConfirmBackupOperation_Password, code: Web_Api_ConfirmBackupOperation_Code): Web_Api_ConfirmBackupOperation_Returns => {
  const result: Web_Backup_Grant = await requestJSON(
    '/api/v1/backup/confirmation',
    backupGrantSchema,
    {
      body: {
        ...((code === '') ? {} : { code }),
        password,
        purpose,
      },
      method: 'POST',
    },
  );

  return result['grant'];
};

/**
 * API - Confirm Backup Operation With Passkey.
 *
 * Runs a session- and purpose-bound WebAuthn ceremony for a one-use grant.
 * This provides the passwordless alternative offered by the shared confirmation step.
 *
 * @returns {Web_Api_ConfirmBackupOperationWithPasskey_Returns}
 *
 * @since 2.1.0
 */
export const confirmBackupOperationWithPasskey = async (purpose: Web_Backup_Purpose): Web_Api_ConfirmBackupOperationWithPasskey_Returns => {
  const ceremony: Web_Api_PasskeyCeremony = await requestJSON(
    '/api/v1/backup/confirmation/passkey/options',
    passkeyCeremonySchema,
    {
      body: { purpose },
      method: 'POST',
    },
  );
  const credential: Web_Api_ConfirmBackupOperationWithPasskey_Credential = await getPasskey(ceremony['options']);
  const result: Web_Backup_Grant = await requestJSON(
    '/api/v1/backup/confirmation/passkey/verify',
    backupGrantSchema,
    {
      body: {
        ceremonyId: ceremony['ceremonyId'],
        credential,
        purpose,
      },
      method: 'POST',
    },
  );

  return result['grant'];
};

/**
 * API - Download Backup Export.
 *
 * Streams the secret-bearing response directly into a temporary browser download.
 * No response document is retained in application state or browser storage.
 *
 * @returns {Web_Api_DownloadBackupExport_Returns}
 *
 * @since 2.1.0
 */
export const downloadBackupExport = async (sections: Web_Backup_ExportSections, grant: Web_Api_DownloadBackupExport_Grant): Web_Api_DownloadBackupExport_Returns => {
  const response: Response = await fetch('/api/v1/backup/export', {
    ...buildRequest({
      body: {
        grant,
        sections,
      },
      method: 'POST',
    }),
    cache: 'no-store',
  });

  if (response.ok === false) {
    throw await responseError(response);
  }

  const contentDisposition: Web_Api_DownloadBackupExport_ContentDisposition = response.headers.get('Content-Disposition') ?? '';
  const filenameMatch: Web_Api_DownloadBackupExport_FilenameMatch = contentDisposition.match(new RegExp(contentDispositionFilenamePattern, 'u'));
  const matchedFilename: Web_Api_DownloadBackupExport_MatchedFilename = (filenameMatch !== null) ? filenameMatch[1] : undefined;
  const filename: Web_Api_DownloadBackupExport_Filename = matchedFilename ?? `pfsense-actions-export-${new Date().toISOString().slice(0, 10)}.json`;
  const objectUrl: Web_Api_DownloadBackupExport_ObjectUrl = URL.createObjectURL(await response.blob());
  const link: HTMLAnchorElement = document.createElement('a');

  try {
    link.href = objectUrl;
    link.download = filename;
    link.click();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return;
};

/**
 * API - Preview Backup Import.
 *
 * Sends a strictly parsed document for a read-only comparison with current state.
 * The response explains each section before the user confirms the import.
 *
 * @returns {Web_Api_PreviewBackupImport_Returns}
 *
 * @since 2.1.0
 */
export const previewBackupImport = async (document: Web_Backup_Document): Web_Api_PreviewBackupImport_Returns => requestJSON(
  '/api/v1/backup/imports/preview',
  backupImportPreviewSchema,
  {
    body: { document },
    method: 'POST',
  },
);

/**
 * API - Apply Backup Import.
 *
 * Submits the reviewed document with a freshly confirmed import grant.
 * The server consumes the grant before applying the transactional change.
 *
 * @returns {Web_Api_ApplyBackupImport_Returns}
 *
 * @since 2.1.0
 */
export const applyBackupImport = async (document: Web_Backup_Document, grant: Web_Api_ApplyBackupImport_Grant): Web_Api_ApplyBackupImport_Returns => requestJSON(
  '/api/v1/backup/imports',
  backupImportResultSchema,
  {
    body: {
      document,
      grant,
    },
    method: 'POST',
  },
);
