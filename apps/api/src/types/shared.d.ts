import type { ErrorObject } from 'serialize-error';

import type {
  Lib_Notifications_Service,
  Lib_Notifications_Target,
} from '@/types/lib/notifications.d.ts';

/**
 * Shared - API Response.
 *
 * Defines the common success and failure envelope returned by pfSense actions.
 *
 * @since 2.0.0
 */
export type Shared_ApiResponse_Action =
  'LOGIN'
  | 'LOGOUT'
  | 'PING'
  | 'SYSTEM_INFORMATION'
  | 'WAKE_ON_LAN';

export type Shared_ApiResponse_Success_Success = true;

export type Shared_ApiResponse_Success_Info = object | null;

export type Shared_ApiResponse_Success<
  Action extends Shared_ApiResponse_Action,
  Info extends Shared_ApiResponse_Success_Info,
> = {
  action: Action;
  success: Shared_ApiResponse_Success_Success;
  info: Info;
};

export type Shared_ApiResponse_Fail_Success = false;

export type Shared_ApiResponse_Fail_Info_Error = ErrorObject;

export type Shared_ApiResponse_Fail_Info_Message = string;

export type Shared_ApiResponse_Fail_Info = {
  error?: Shared_ApiResponse_Fail_Info_Error;
  message?: Shared_ApiResponse_Fail_Info_Message;
};

export type Shared_ApiResponse_Fail<Action extends Shared_ApiResponse_Action> = {
  action: Action;
  success: Shared_ApiResponse_Fail_Success;
  info: Shared_ApiResponse_Fail_Info;
};

export type Shared_ApiResponse<
  Action extends Shared_ApiResponse_Action,
  Info extends Shared_ApiResponse_Success_Info,
> = Shared_ApiResponse_Success<Action, Info> | Shared_ApiResponse_Fail<Action>;

/**
 * Shared - Environment Imports.
 *
 * Records what the deprecated environment variables filled in during one start.
 * The service turns it into deprecation warnings for the log.
 *
 * @since 2.0.0
 */
export type Shared_EnvironmentImports_Connection = boolean;

export type Shared_EnvironmentImports = {
  connection: Shared_EnvironmentImports_Connection;
};

/**
 * Shared - Environment Variables.
 *
 * Captures the validated process configuration used by the API and SSH client.
 * Bootstrap values are optional because the console can supply each one later.
 *
 * @since 2.0.0
 */
export type Shared_EnvironmentVariables_PersonalAccessTokenScope =
  'pfsense:read'
  | 'reachability:read'
  | 'wol:execute';

export type Shared_EnvironmentVariables_PersonalAccessToken_CreatedAt = string;

export type Shared_EnvironmentVariables_PersonalAccessToken_ExpiresAt = string;

export type Shared_EnvironmentVariables_PersonalAccessToken_Id = string;

export type Shared_EnvironmentVariables_PersonalAccessToken_Scopes = Shared_EnvironmentVariables_PersonalAccessTokenScope[];

export type Shared_EnvironmentVariables_PersonalAccessToken_TokenHash = string;

export type Shared_EnvironmentVariables_PersonalAccessToken = {
  createdAt?: Shared_EnvironmentVariables_PersonalAccessToken_CreatedAt | undefined;
  expiresAt?: Shared_EnvironmentVariables_PersonalAccessToken_ExpiresAt | undefined;
  id: Shared_EnvironmentVariables_PersonalAccessToken_Id;
  scopes: Shared_EnvironmentVariables_PersonalAccessToken_Scopes;
  tokenHash: Shared_EnvironmentVariables_PersonalAccessToken_TokenHash;
};

export type Shared_EnvironmentVariables_AdminWebauthnRpName = string;

export type Shared_EnvironmentVariables_DataDirectory = string;

export type Shared_EnvironmentVariables_PfsensePassword = string;

export type Shared_EnvironmentVariables_PfsensePrivateKey = string;

export type Shared_EnvironmentVariables_PfsenseSshIp = string;

export type Shared_EnvironmentVariables_PfsenseSshPort = number;

export type Shared_EnvironmentVariables_PfsenseUsername = string;

export type Shared_EnvironmentVariables_Port = number;

export type Shared_EnvironmentVariables = {
  adminWebauthnRpName: Shared_EnvironmentVariables_AdminWebauthnRpName;
  dataDirectory: Shared_EnvironmentVariables_DataDirectory;
  pfsensePassword?: Shared_EnvironmentVariables_PfsensePassword | undefined;
  pfsensePrivateKey?: Shared_EnvironmentVariables_PfsensePrivateKey | undefined;
  pfsenseSshIp?: Shared_EnvironmentVariables_PfsenseSshIp | undefined;
  pfsenseSshPort?: Shared_EnvironmentVariables_PfsenseSshPort | undefined;
  pfsenseUsername?: Shared_EnvironmentVariables_PfsenseUsername | undefined;
  port: Shared_EnvironmentVariables_Port;
};

/**
 * Shared - WebAuthn Configuration.
 *
 * Defines the relying-party values derived from one request's own address.
 * Every passkey ceremony is bound to the hostname it started on.
 *
 * @since 2.0.0
 */
export type Shared_WebauthnConfiguration_Origin = string;

export type Shared_WebauthnConfiguration_RpId = string;

export type Shared_WebauthnConfiguration_RpName = string;

export type Shared_WebauthnConfiguration = {
  origin: Shared_WebauthnConfiguration_Origin;
  rpId: Shared_WebauthnConfiguration_RpId;
  rpName: Shared_WebauthnConfiguration_RpName;
};

/**
 * Shared - Activity Event.
 *
 * Defines the redacted operational record exposed to authenticated administrators.
 * The event deliberately excludes request bodies, command output, and secret values.
 *
 * @since 2.0.0
 */
export type Shared_ActivityEvent_Action = string;

export type Shared_ActivityEvent_ActorId = string;

export type Shared_ActivityEvent_Category = 'access' | 'configuration' | 'service' | 'token';

export type Shared_ActivityEvent_CreatedAt = string;

export type Shared_ActivityEvent_Id = string;

export type Shared_ActivityEvent_Outcome = 'failed' | 'succeeded';

export type Shared_ActivityEvent_Summary = string;

export type Shared_ActivityEvent = {
  action: Shared_ActivityEvent_Action;
  actorId: Shared_ActivityEvent_ActorId;
  category: Shared_ActivityEvent_Category;
  createdAt: Shared_ActivityEvent_CreatedAt;
  id: Shared_ActivityEvent_Id;
  outcome: Shared_ActivityEvent_Outcome;
  summary: Shared_ActivityEvent_Summary;
};

export type Shared_ActivityEvents = Shared_ActivityEvent[];

/**
 * Shared - Administrator.
 *
 * Defines the safe local account metadata used by browser sessions and settings.
 * Password hashes and bootstrap credentials never cross the administrative boundary.
 *
 * @since 2.0.0
 */
export type Shared_Administrator_CreatedAt = string;

export type Shared_Administrator_Id = string;

export type Shared_Administrator_UpdatedAt = string;

export type Shared_Administrator_Username = string;

export type Shared_Administrator = {
  createdAt: Shared_Administrator_CreatedAt;
  id: Shared_Administrator_Id;
  updatedAt: Shared_Administrator_UpdatedAt;
  username: Shared_Administrator_Username;
};

/**
 * Shared - Administrator Passkey.
 *
 * Defines one verified credential as retained by the state and WebAuthn layers.
 * Public summaries deliberately exclude the verification key and signature counter.
 *
 * @since 2.0.0
 */
export type Shared_AdministratorPasskey_DeviceType = 'multiDevice' | 'singleDevice';

export type Shared_AdministratorPasskey = {
  administratorId: string;
  backedUp: boolean;
  counter: number;
  createdAt: string;
  deviceType: Shared_AdministratorPasskey_DeviceType;
  id: string;
  lastUsedAt?: string | undefined;
  name: string;
  publicKey: Uint8Array<ArrayBuffer>;
  rpId?: string | undefined;
  transports: string[];
};

export type Shared_AdministratorPasskeySummary = {
  createdAt: string;
  hostname: string | null;
  id: string;
  lastUsedAt: string | null;
  name: string;
};

export type Shared_AdministratorPasskeySummaries = Shared_AdministratorPasskeySummary[];

/**
 * Shared - Administrator Security.
 *
 * Summarizes enrolled sign-in methods for the signed-in account page.
 * Secrets, counters, and verification keys never appear in this summary.
 *
 * @since 2.0.0
 */
export type Shared_AdministratorSecurity = {
  passkeys: Shared_AdministratorPasskeySummaries;
  recoveryCodesRemaining: number;
  totpEnabled: boolean;
  username: string;
};

/**
 * Shared - Browser Session.
 *
 * Describes one stored browser session after its opaque token was verified.
 * Only digests of the session and CSRF values are retained in SQLite.
 *
 * @since 2.0.0
 */
export type Shared_BrowserSession = {
  administratorId: string;
  csrfHash: string;
  expiresAt: string;
  id: string;
  username: string;
};

/**
 * Shared - Error Issue.
 *
 * Points one validation failure at the request field that caused it.
 * The interface uses the field name to show the message next to the input.
 *
 * @since 2.0.0
 */
export type Shared_ErrorIssue_Field = string;

export type Shared_ErrorIssue_Message = string;

export type Shared_ErrorIssue_Path = string[];

export type Shared_ErrorIssue = {
  field: Shared_ErrorIssue_Field;
  message: Shared_ErrorIssue_Message;
  path: Shared_ErrorIssue_Path;
};

export type Shared_ErrorIssues = Shared_ErrorIssue[];

/**
 * Shared - pfSense Connection.
 *
 * Captures the mutable SSH settings stored by the operations console.
 * Exactly one supported credential is present after schema validation.
 *
 * @since 2.0.0
 */
export type Shared_PfsenseConnection_PfsensePassword = Shared_EnvironmentVariables_PfsensePassword;

export type Shared_PfsenseConnection_PfsensePrivateKey = Shared_EnvironmentVariables_PfsensePrivateKey;

export type Shared_PfsenseConnection_PfsenseSshIp = Shared_EnvironmentVariables_PfsenseSshIp;

export type Shared_PfsenseConnection_PfsenseSshPort = Shared_EnvironmentVariables_PfsenseSshPort;

export type Shared_PfsenseConnection_PfsenseUsername = Shared_EnvironmentVariables_PfsenseUsername;

export type Shared_PfsenseConnection = {
  pfsensePassword?: Shared_PfsenseConnection_PfsensePassword | undefined;
  pfsensePrivateKey?: Shared_PfsenseConnection_PfsensePrivateKey | undefined;
  pfsenseSshIp: Shared_PfsenseConnection_PfsenseSshIp;
  pfsenseSshPort: Shared_PfsenseConnection_PfsenseSshPort;
  pfsenseUsername: Shared_PfsenseConnection_PfsenseUsername;
};

/**
 * Shared - pfSense Connection Summary.
 *
 * Describes the saved SSH target without its write-only credential.
 * A lost encryption key can leave it without a saved credential.
 *
 * @since 2.0.0
 */
export type Shared_PfsenseConnectionSummary_CredentialSaved = boolean;

export type Shared_PfsenseConnectionSummary_CredentialType = 'password' | 'privateKey';

export type Shared_PfsenseConnectionSummary = {
  credentialSaved: Shared_PfsenseConnectionSummary_CredentialSaved;
  credentialType: Shared_PfsenseConnectionSummary_CredentialType;
  pfsenseSshIp: Shared_PfsenseConnection_PfsenseSshIp;
  pfsenseSshPort: Shared_PfsenseConnection_PfsenseSshPort;
  pfsenseUsername: Shared_PfsenseConnection_PfsenseUsername;
};

/**
 * Shared - Personal Access Token Summary.
 *
 * Defines token metadata that can safely cross the administrative HTTP boundary.
 * The stored SHA-256 hash is intentionally absent from this representation.
 *
 * @since 2.0.0
 */
export type Shared_PersonalAccessTokenSummary_CreatedAt = string;

export type Shared_PersonalAccessTokenSummary_ExpiresAt = string | null;

export type Shared_PersonalAccessTokenSummary_Id = string;

export type Shared_PersonalAccessTokenSummary_LastUsedAt = string | null;

export type Shared_PersonalAccessTokenSummary_Name = string;

export type Shared_PersonalAccessTokenSummary_Scopes = Shared_EnvironmentVariables_PersonalAccessTokenScope[];

export type Shared_PersonalAccessTokenSummary = {
  createdAt: Shared_PersonalAccessTokenSummary_CreatedAt;
  expiresAt: Shared_PersonalAccessTokenSummary_ExpiresAt;
  id: Shared_PersonalAccessTokenSummary_Id;
  lastUsedAt: Shared_PersonalAccessTokenSummary_LastUsedAt;
  name: Shared_PersonalAccessTokenSummary_Name;
  scopes: Shared_PersonalAccessTokenSummary_Scopes;
};

export type Shared_PersonalAccessTokenSummaries = Shared_PersonalAccessTokenSummary[];

/**
 * Shared - Removed Secret.
 *
 * Names one saved secret that a lost encryption key took, and when.
 * The console lists these until they are entered again or dismissed.
 *
 * @since 2.0.0
 */
export type Shared_RemovedSecret_CredentialType = Shared_PfsenseConnectionSummary_CredentialType;

export type Shared_RemovedSecret_Kind = 'authenticator' | 'notification' | 'pfsense-credential';

export type Shared_RemovedSecret_RemovedAt = string;

export type Shared_RemovedSecret = {
  credentialType?: Shared_RemovedSecret_CredentialType;
  kind: Shared_RemovedSecret_Kind;
  name?: string;
  notificationId?: string;
  removedAt: Shared_RemovedSecret_RemovedAt;
};

export type Shared_RemovedSecrets = Shared_RemovedSecret[];

/**
 * Shared - Notification Target.
 *
 * Defines a notification destination as the API returns it, without any secret value.
 * Saved secret fields are listed by name, and fields a lost key removed are listed apart.
 *
 * @since 2.0.0
 */
export type Shared_NotificationTarget = {
  createdAt: string;
  events: string[];
  id: string;
  lastAttemptAt: string | null;
  lastError: string | null;
  name: string;
  secrets: Record<string, true>;
  secretsMissing: string[];
  service: Lib_Notifications_Service;
  settings: Record<string, string>;
  updatedAt: string;
};

export type Shared_NotificationTargets = Shared_NotificationTarget[];

export type Shared_NotificationTargetInput = {
  events: string[];
  name: string;
  secrets: Record<string, string>;
  service: Lib_Notifications_Service;
  settings: Record<string, string>;
};

export type Shared_NotificationTargetUpdate = Omit<Shared_NotificationTargetInput, 'service'> & {
  clearSecrets?: string[] | undefined;
};

export type Shared_NotificationDelivery = {
  id: string;
  name: string;
  target: Lib_Notifications_Target;
};

/**
 * Shared - Stored Personal Access Token.
 *
 * Defines one token as the database keeps it, with its friendly name beside the hash.
 * Tokens saved before the name column existed use their identifier as the name.
 *
 * @since 2.0.0
 */
export type Shared_StoredPersonalAccessToken_Name = string;

export type Shared_StoredPersonalAccessToken = Shared_EnvironmentVariables_PersonalAccessToken & {
  name: Shared_StoredPersonalAccessToken_Name;
};

/**
 * Shared - System Information.
 *
 * Defines the reviewed operating-system fields safe for public API clients.
 *
 * @since 2.0.0
 */
export type Shared_SystemInformation_Architecture = string;

export type Shared_SystemInformation_OperatingSystem = string;

export type Shared_SystemInformation_Release = string;

export type Shared_SystemInformation = {
  architecture: Shared_SystemInformation_Architecture;
  operatingSystem: Shared_SystemInformation_OperatingSystem;
  release: Shared_SystemInformation_Release;
};
