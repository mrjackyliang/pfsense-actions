import type { DatabaseSync, StatementResultingChanges } from 'node:sqlite';

import type {
  connectionUpdate,
  personalAccessTokenRecord,
  storedAdministrator,
  storedAdministratorTotp,
  storedConnection,
  storedNotificationTarget,
  storedRemovedSecret,
  tokenCreate,
  tokenUpdate,
} from '@/lib/schema.js';
import type { Lib_Auth_EncryptCredential_EncryptedCredential } from '@/types/lib/auth.d.ts';
import type { Lib_Passkeys_VerifyRegistration_Result } from '@/types/lib/passkeys.d.ts';
import type {
  Shared_ActivityEvent_Action,
  Shared_ActivityEvent_ActorId,
  Shared_ActivityEvent_Category,
  Shared_ActivityEvent_Outcome,
  Shared_ActivityEvent_Summary,
  Shared_ActivityEvents,
  Shared_Administrator,
  Shared_AdministratorPasskey,
  Shared_AdministratorPasskey_DeviceType,
  Shared_AdministratorSecurity,
  Shared_BrowserSession,
  Shared_EnvironmentImports,
  Shared_EnvironmentVariables,
  Shared_EnvironmentVariables_PersonalAccessToken,
  Shared_EnvironmentVariables_PersonalAccessTokenScope,
  Shared_NotificationDelivery,
  Shared_NotificationTarget,
  Shared_NotificationTargetInput,
  Shared_NotificationTargets,
  Shared_NotificationTargetUpdate,
  Shared_PersonalAccessTokenSummaries,
  Shared_PersonalAccessTokenSummary,
  Shared_PfsenseConnection,
  Shared_PfsenseConnectionSummary,
  Shared_RemovedSecrets,
  Shared_StoredPersonalAccessToken,
} from '@/types/shared.d.ts';

/**
 * Lib - State - Runner - Activity Limit.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_ActivityLimit = number;

/**
 * Lib - State - Runner - Add Activity.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_AddActivity_ActorId = Shared_ActivityEvent_ActorId;

export type Lib_State_Runner_AddActivity_Action = Shared_ActivityEvent_Action;

export type Lib_State_Runner_AddActivity_Category = Shared_ActivityEvent_Category;

export type Lib_State_Runner_AddActivity_Outcome = Shared_ActivityEvent_Outcome;

export type Lib_State_Runner_AddActivity_Summary = Shared_ActivityEvent_Summary;

export type Lib_State_Runner_AddActivity_Returns = void;

export type Lib_State_Runner_AddActivity_CreatedAt = string;

export type Lib_State_Runner_AddActivity_Id = string;

/**
 * Lib - State - Runner - Authenticate Administrator.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_AuthenticateAdministrator_Username = string;

export type Lib_State_Runner_AuthenticateAdministrator_Password = string;

export type Lib_State_Runner_AuthenticateAdministrator_Returns = Shared_Administrator | undefined;

export type Lib_State_Runner_AuthenticateAdministrator_Administrator = Lib_State_Runner_StoredAdministrator | undefined;

export type Lib_State_Runner_AuthenticateAdministrator_PasswordHash = string;

export type Lib_State_Runner_AuthenticateAdministrator_IsValid = boolean;

/**
 * Lib - State - Runner - Authenticate Token.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_AuthenticateToken_PersonalAccessToken = string;

export type Lib_State_Runner_AuthenticateToken_Returns_Id = string;

export type Lib_State_Runner_AuthenticateToken_Returns_Name = string;

export type Lib_State_Runner_AuthenticateToken_Returns_Scopes = Shared_EnvironmentVariables_PersonalAccessTokenScope[];

export type Lib_State_Runner_AuthenticateToken_Returns = {
  id: Lib_State_Runner_AuthenticateToken_Returns_Id;
  name: Lib_State_Runner_AuthenticateToken_Returns_Name;
  scopes: Lib_State_Runner_AuthenticateToken_Returns_Scopes;
} | undefined;

export type Lib_State_Runner_AuthenticateToken_MatchedToken = {
  id: Lib_State_Runner_AuthenticateToken_Returns_Id;
  scopes: Lib_State_Runner_AuthenticateToken_Returns_Scopes;
} | undefined;

export type Lib_State_Runner_AuthenticateToken_Row = {
  name: string;
} | undefined;

/**
 * Lib - State - Runner - Build Connection.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_BuildConnection_Input = ReturnType<typeof connectionUpdate.parse>;

export type Lib_State_Runner_BuildConnection_Returns = Shared_PfsenseConnection | undefined;

export type Lib_State_Runner_BuildConnection_CurrentConnection = Shared_PfsenseConnection | undefined;

export type Lib_State_Runner_BuildConnection_Credential = string | undefined;

/**
 * Lib - State - Runner - Challenge Duration Milliseconds.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_ChallengeDurationMilliseconds = number;

/**
 * Lib - State - Runner - Challenge Failure Limit.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_ChallengeFailureLimit = number;

/**
 * Lib - State - Runner - Change Administrator Password.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_ChangeAdministratorPassword_Id = string;

export type Lib_State_Runner_ChangeAdministratorPassword_NewPassword = string;

export type Lib_State_Runner_ChangeAdministratorPassword_KeepSessionId = string;

export type Lib_State_Runner_ChangeAdministratorPassword_ActorId = string;

export type Lib_State_Runner_ChangeAdministratorPassword_Returns = void;

export type Lib_State_Runner_ChangeAdministratorPassword_PasswordHash = string;

/**
 * Lib - State - Runner - Change Administrator Username.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_ChangeAdministratorUsername_Id = string;

export type Lib_State_Runner_ChangeAdministratorUsername_Username = string;

export type Lib_State_Runner_ChangeAdministratorUsername_Returns = Shared_Administrator | 'conflict' | 'not-found';

export type Lib_State_Runner_ChangeAdministratorUsername_Administrator = Lib_State_Runner_StoredAdministrator | undefined;

export type Lib_State_Runner_ChangeAdministratorUsername_ExistingUsername = Lib_State_Runner_StoredAdministrator | undefined;

export type Lib_State_Runner_ChangeAdministratorUsername_UpdatedAt = string;

/**
 * Lib - State - Runner - Claim Installation.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_ClaimInstallation_Code = string;

export type Lib_State_Runner_ClaimInstallation_Username = string;

export type Lib_State_Runner_ClaimInstallation_Password = string;

export type Lib_State_Runner_ClaimInstallation_Returns = Shared_Administrator | 'invalid';

export type Lib_State_Runner_ClaimInstallation_NormalizedCode = string | undefined;

export type Lib_State_Runner_ClaimInstallation_ClaimRow = Record<string, unknown> | undefined;

export type Lib_State_Runner_ClaimInstallation_PasswordHash = string;

export type Lib_State_Runner_ClaimInstallation_AdministratorId = string;

export type Lib_State_Runner_ClaimInstallation_CreatedAt = string;

/**
 * Lib - State - Runner - Close.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_Close_Returns = void;

/**
 * Lib - State - Runner - Confirm Administrator Password.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_ConfirmAdministratorPassword_Id = string;

export type Lib_State_Runner_ConfirmAdministratorPassword_Password = string;

export type Lib_State_Runner_ConfirmAdministratorPassword_Returns = boolean;

export type Lib_State_Runner_ConfirmAdministratorPassword_Administrator = Lib_State_Runner_StoredAdministrator | undefined;

export type Lib_State_Runner_ConfirmAdministratorPassword_PasswordHash = string;

export type Lib_State_Runner_ConfirmAdministratorPassword_IsValid = boolean;

/**
 * Lib - State - Runner - Constructor.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_Constructor_Environment = Shared_EnvironmentVariables;

export type Lib_State_Runner_Constructor_DirectoryMode = number;

export type Lib_State_Runner_Constructor_FileMode = number;

export type Lib_State_Runner_Constructor_DatabasePath = string;

/**
 * Lib - State - Runner - Consume Recovery Code.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_ConsumeRecoveryCode_AdministratorId = string;

export type Lib_State_Runner_ConsumeRecoveryCode_Code = string;

export type Lib_State_Runner_ConsumeRecoveryCode_Returns = boolean;

export type Lib_State_Runner_ConsumeRecoveryCode_NormalizedCode = string | undefined;

export type Lib_State_Runner_ConsumeRecoveryCode_Result = StatementResultingChanges;

/**
 * Lib - State - Runner - Count Rows.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_CountRows_Table =
  'activity_events'
  | 'administrator_totp'
  | 'administrators'
  | 'api_tokens'
  | 'pfsense_connection'
  | 'totp_enrollments';

export type Lib_State_Runner_CountRows_Returns = number;

export type Lib_State_Runner_CountRows_Row = Record<string, unknown> | undefined;

/**
 * Lib - State - Runner - Create Passkey.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_CreatePasskey_AdministratorId = string;

export type Lib_State_Runner_CreatePasskey_Name = string;

export type Lib_State_Runner_CreatePasskey_RpId = string;

export type Lib_State_Runner_CreatePasskey_Credential = Lib_Passkeys_VerifyRegistration_Result;

export type Lib_State_Runner_CreatePasskey_ActorId = string;

export type Lib_State_Runner_CreatePasskey_Returns = 'conflict' | 'created' | 'not-found';

export type Lib_State_Runner_CreatePasskey_Administrator = Lib_State_Runner_StoredAdministrator | undefined;

export type Lib_State_Runner_CreatePasskey_ExistingPasskey = Record<string, unknown> | undefined;

export type Lib_State_Runner_CreatePasskey_CreatedAt = string;

/**
 * Lib - State - Runner - Create Schema.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_CreateSchema_Returns = void;

/**
 * Lib - State - Runner - Create Session.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_CreateSession_AdministratorId = string;

export type Lib_State_Runner_CreateSession_SessionId = string;

export type Lib_State_Runner_CreateSession_SessionToken = string;

export type Lib_State_Runner_CreateSession_CsrfToken = string;

export type Lib_State_Runner_CreateSession_CreatedAt = string;

export type Lib_State_Runner_CreateSession_ExpiresAt = string;

export type Lib_State_Runner_CreateSession_Returns = {
  csrfToken: Lib_State_Runner_CreateSession_CsrfToken;
  expiresAt: Lib_State_Runner_CreateSession_ExpiresAt;
  sessionId: Lib_State_Runner_CreateSession_SessionId;
  sessionToken: Lib_State_Runner_CreateSession_SessionToken;
};

/**
 * Lib - State - Runner - Create Sign In Challenge.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_CreateSignInChallenge_AdministratorId = string;

export type Lib_State_Runner_CreateSignInChallenge_Challenge = string;

export type Lib_State_Runner_CreateSignInChallenge_CreatedAt = string;

export type Lib_State_Runner_CreateSignInChallenge_ExpiresAt = string;

export type Lib_State_Runner_CreateSignInChallenge_Returns = {
  challenge: Lib_State_Runner_CreateSignInChallenge_Challenge;
  expiresAt: Lib_State_Runner_CreateSignInChallenge_ExpiresAt;
};

/**
 * Lib - State - Runner - Create Token.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_CreateToken_Input = ReturnType<typeof tokenCreate.parse>;

export type Lib_State_Runner_CreateToken_ActorId = string;

export type Lib_State_Runner_CreateToken_Returns_PersonalAccessToken = string;

export type Lib_State_Runner_CreateToken_Returns_Token = Shared_PersonalAccessTokenSummary;

export type Lib_State_Runner_CreateToken_Returns = {
  personalAccessToken: Lib_State_Runner_CreateToken_Returns_PersonalAccessToken;
  token: Lib_State_Runner_CreateToken_Returns_Token;
} | undefined;

export type Lib_State_Runner_CreateToken_ExistingToken = Record<string, unknown> | undefined;

export type Lib_State_Runner_CreateToken_Id = string;

export type Lib_State_Runner_CreateToken_PersonalAccessToken = string;

export type Lib_State_Runner_CreateToken_TokenHash = string;

export type Lib_State_Runner_CreateToken_CreatedAt = string;

export type Lib_State_Runner_CreateToken_Scopes = Shared_EnvironmentVariables_PersonalAccessTokenScope[];

export type Lib_State_Runner_CreateToken_Record = Shared_StoredPersonalAccessToken;

/**
 * Lib - State - Runner - Create Webauthn Ceremony.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_CreateWebauthnCeremony_Ceremony = Lib_State_Runner_WebauthnCeremony & {
  kind: Lib_State_Runner_WebauthnCeremony_Kind;
};

export type Lib_State_Runner_CreateWebauthnCeremony_Returns = string;

export type Lib_State_Runner_CreateWebauthnCeremony_CeremonyId = string;

export type Lib_State_Runner_CreateWebauthnCeremony_CreatedAt = string;

export type Lib_State_Runner_CreateWebauthnCeremony_ExpiresAt = string;

/**
 * Lib - State - Runner - Database.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_Database = DatabaseSync;

/**
 * Lib - State - Runner - Database Path.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_DatabasePath = string;

/**
 * Lib - State - Runner - Delete Session.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_DeleteSession_Id = string;

export type Lib_State_Runner_DeleteSession_Returns = void;

/**
 * Lib - State - Runner - Delete Sign In Challenge.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_DeleteSignInChallenge_Challenge = string;

export type Lib_State_Runner_DeleteSignInChallenge_Returns = void;

/**
 * Lib - State - Runner - Disable Totp.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_DisableTotp_AdministratorId = string;

export type Lib_State_Runner_DisableTotp_ActorId = string;

export type Lib_State_Runner_DisableTotp_Returns = 'disabled' | 'not-found';

/**
 * Lib - State - Runner - Dismiss Removed Secrets.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_DismissRemovedSecrets_AdministratorId = string;

export type Lib_State_Runner_DismissRemovedSecrets_Returns = void;

/**
 * Lib - State - Runner - Dummy Password Hash.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_DummyPasswordHash = string;

/**
 * Lib - State - Runner - Enable Totp.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_EnableTotp_AdministratorId = string;

export type Lib_State_Runner_EnableTotp_Secret = string;

export type Lib_State_Runner_EnableTotp_InitialStep = number;

export type Lib_State_Runner_EnableTotp_ActorId = string;

export type Lib_State_Runner_EnableTotp_Returns = string[] | undefined;

export type Lib_State_Runner_EnableTotp_Administrator = Lib_State_Runner_StoredAdministrator | undefined;

export type Lib_State_Runner_EnableTotp_EncryptedSecret = Lib_Auth_EncryptCredential_EncryptedCredential;

export type Lib_State_Runner_EnableTotp_CreatedAt = string;

export type Lib_State_Runner_EnableTotp_RecoveryCodes = string[];

/**
 * Lib - State - Runner - Encryption Key.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_EncryptionKey = string;

/**
 * Lib - State - Runner - Enrollment Duration Milliseconds.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_EnrollmentDurationMilliseconds = number;

/**
 * Lib - State - Runner - Environment.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_Environment = Shared_EnvironmentVariables;

/**
 * Lib - State - Runner - Environment Imports.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_EnvironmentImports = Shared_EnvironmentImports;

/**
 * Lib - State - Runner - Get Activity.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetActivity_Limit = number;

export type Lib_State_Runner_GetActivity_Returns = Shared_ActivityEvents;

export type Lib_State_Runner_GetActivity_Rows = Record<string, unknown>[];

/**
 * Lib - State - Runner - Get Activity Count.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetActivityCount_Returns = number;

/**
 * Lib - State - Runner - Get Administrator.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetAdministrator_Returns = Shared_Administrator | undefined;

export type Lib_State_Runner_GetAdministrator_Administrator = Lib_State_Runner_StoredAdministrator | undefined;

/**
 * Lib - State - Runner - Get Administrator By ID.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetAdministratorById_Id = string;

export type Lib_State_Runner_GetAdministratorById_Returns = Shared_Administrator | undefined;

export type Lib_State_Runner_GetAdministratorById_Administrator = Lib_State_Runner_StoredAdministrator | undefined;

/**
 * Lib - State - Runner - Get Administrator Security.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetAdministratorSecurity_AdministratorId = string;

export type Lib_State_Runner_GetAdministratorSecurity_Returns = Shared_AdministratorSecurity;

export type Lib_State_Runner_GetAdministratorSecurity_Administrator = Lib_State_Runner_StoredAdministrator | undefined;

export type Lib_State_Runner_GetAdministratorSecurity_Passkeys = Shared_AdministratorPasskey[];

export type Lib_State_Runner_GetAdministratorSecurity_RecoveryCodeRow = Record<string, unknown> | undefined;

/**
 * Lib - State - Runner - Get Connection.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetConnection_Returns = Shared_PfsenseConnectionSummary | undefined;

export type Lib_State_Runner_GetConnection_Row = Record<string, unknown> | undefined;

export type Lib_State_Runner_GetConnection_StoredConnection = ReturnType<typeof storedConnection.parse>;

/**
 * Lib - State - Runner - Get Environment Imports.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetEnvironmentImports_Returns = Shared_EnvironmentImports;

/**
 * Lib - State - Runner - Get Metadata.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetMetadata_Key = string;

export type Lib_State_Runner_GetMetadata_Returns = string | undefined;

export type Lib_State_Runner_GetMetadata_Row_Value = string;

export type Lib_State_Runner_GetMetadata_Row = {
  value: Lib_State_Runner_GetMetadata_Row_Value;
} | undefined;

/**
 * Lib - State - Runner - Get Key Replacement.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetKeyReplacement_Returns = string[];

/**
 * Lib - State - Runner - Get Passkey.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetPasskey_Id = string;

export type Lib_State_Runner_GetPasskey_Returns = Shared_AdministratorPasskey | undefined;

/**
 * Lib - State - Runner - Get Passkeys.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetPasskeys_AdministratorId = string;

export type Lib_State_Runner_GetPasskeys_Returns = Shared_AdministratorPasskey[];

export type Lib_State_Runner_GetPasskeys_Row = {
  administratorId: string;
  backedUp: number;
  counter: number;
  createdAt: string;
  deviceType: string;
  id: string;
  lastUsedAt: string | null;
  name: string;
  publicKey: Uint8Array;
  rpId: string | null;
  transports: string;
};

export type Lib_State_Runner_GetPasskeys_Rows = Lib_State_Runner_GetPasskeys_Row[];

export type Lib_State_Runner_GetPasskeys_Transports = unknown;

/**
 * Lib - State - Runner - Get pfSense Connection.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetPfsenseConnection_Returns = Shared_PfsenseConnection | undefined;

/**
 * Lib - State - Runner - Get Removed Secrets.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetRemovedSecrets_AdministratorId = string;

export type Lib_State_Runner_GetRemovedSecrets_Returns = Shared_RemovedSecrets;

export type Lib_State_Runner_GetRemovedSecrets_Rows = Record<string, unknown>[];

export type Lib_State_Runner_GetRemovedSecrets_RemovedSecret = ReturnType<typeof storedRemovedSecret.parse>;

/**
 * Lib - State - Runner - Get Session.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetSession_SessionToken = string;

export type Lib_State_Runner_GetSession_Returns = Shared_BrowserSession | undefined;

export type Lib_State_Runner_GetSession_Now = string;

export type Lib_State_Runner_GetSession_Row = Shared_BrowserSession | undefined;

/**
 * Lib - State - Runner - Get Setup Status.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetSetupStatus_Returns_ClaimExpiresAt = string;

export type Lib_State_Runner_GetSetupStatus_Returns_ClaimRequired = boolean;

export type Lib_State_Runner_GetSetupStatus_Returns = {
  claimExpiresAt?: Lib_State_Runner_GetSetupStatus_Returns_ClaimExpiresAt;
  claimRequired: Lib_State_Runner_GetSetupStatus_Returns_ClaimRequired;
};

export type Lib_State_Runner_GetSetupStatus_Row_ExpiresAt = string;

export type Lib_State_Runner_GetSetupStatus_Row = {
  expiresAt: Lib_State_Runner_GetSetupStatus_Row_ExpiresAt;
} | undefined;

/**
 * Lib - State - Runner - Get Sign In Challenge.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetSignInChallenge_Challenge = string;

export type Lib_State_Runner_GetSignInChallenge_Returns_AdministratorId = string;

export type Lib_State_Runner_GetSignInChallenge_Returns = {
  administratorId: Lib_State_Runner_GetSignInChallenge_Returns_AdministratorId;
} | undefined;

export type Lib_State_Runner_GetSignInChallenge_Row = {
  administratorId: Lib_State_Runner_GetSignInChallenge_Returns_AdministratorId;
} | undefined;

/**
 * Lib - State - Runner - Get Stored Administrator.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetStoredAdministrator_Id = string;

export type Lib_State_Runner_GetStoredAdministrator_Username = string;

export type Lib_State_Runner_GetStoredAdministrator_Returns = Lib_State_Runner_StoredAdministrator | undefined;

export type Lib_State_Runner_GetStoredAdministrator_Row = Record<string, unknown> | undefined;

/**
 * Lib - State - Runner - Get Stored Connection.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetStoredConnection_Returns = Shared_PfsenseConnection | undefined;

export type Lib_State_Runner_GetStoredConnection_Row = Record<string, unknown> | undefined;

export type Lib_State_Runner_GetStoredConnection_StoredConnection = ReturnType<typeof storedConnection.parse>;

export type Lib_State_Runner_GetStoredConnection_Credential = string;

/**
 * Lib - State - Runner - Get Stored Tokens.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetStoredTokens_Returns = ReturnType<typeof personalAccessTokenRecord.parse>[];

export type Lib_State_Runner_GetStoredTokens_Row = {
  createdAt: string;
  expiresAt: string | null;
  id: string;
  tokenHash: string;
};

export type Lib_State_Runner_GetStoredTokens_Rows = Lib_State_Runner_GetStoredTokens_Row[];

export type Lib_State_Runner_GetStoredTokens_ScopeRow = {
  scope: string;
};

export type Lib_State_Runner_GetStoredTokens_ScopeRows = Lib_State_Runner_GetStoredTokens_ScopeRow[];

export type Lib_State_Runner_GetStoredTokens_Scopes = string[];

/**
 * Lib - State - Runner - Get Tokens.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetTokens_Returns = Shared_PersonalAccessTokenSummaries;

export type Lib_State_Runner_GetTokens_MetadataRow = {
  id: string;
  lastUsedAt: string | null;
  name: string;
};

export type Lib_State_Runner_GetTokens_MetadataRows = Lib_State_Runner_GetTokens_MetadataRow[];

export type Lib_State_Runner_GetTokens_LastUsedTimes = Map<string, string | null>;

export type Lib_State_Runner_GetTokens_Names = Map<string, string>;

/**
 * Lib - State - Runner - Get Totp Enrollment.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetTotpEnrollment_AdministratorId = string;

export type Lib_State_Runner_GetTotpEnrollment_Returns = string | undefined;

export type Lib_State_Runner_GetTotpEnrollment_Row = Lib_Auth_EncryptCredential_EncryptedCredential | undefined;

/**
 * Lib - State - Runner - Get Webauthn Rp Name.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_GetWebauthnRpName_Returns = string;

/**
 * Lib - State - Runner - Has Administrator.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_HasAdministrator_Returns = boolean;

/**
 * Lib - State - Runner - Has Connection.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_HasConnection_Returns = boolean;

/**
 * Lib - State - Runner - Has Encrypted Data.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_HasEncryptedData_Returns = boolean;

/**
 * Lib - State - Runner - Has Totp.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_HasTotp_AdministratorId = string;

export type Lib_State_Runner_HasTotp_Returns = boolean;

export type Lib_State_Runner_HasTotp_Row = Record<string, unknown> | undefined;

/**
 * Lib - State - Runner - Initialize.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_Initialize_Returns = void;

export type Lib_State_Runner_Initialize_InitializedAt = string | undefined;

export type Lib_State_Runner_Initialize_CreatedAt = string;

export type Lib_State_Runner_Initialize_IsEmpty = boolean;

export type Lib_State_Runner_Initialize_ImportedConnection = boolean;

/**
 * Lib - State - Runner - Insert Connection.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_InsertConnection_Connection = Shared_PfsenseConnection;

export type Lib_State_Runner_InsertConnection_Returns = void;

export type Lib_State_Runner_InsertConnection_CredentialType = 'password' | 'privateKey';

export type Lib_State_Runner_InsertConnection_Credential = string | undefined;

export type Lib_State_Runner_InsertConnection_EncryptedCredential = Lib_Auth_EncryptCredential_EncryptedCredential;

/**
 * Lib - State - Runner - Insert Token.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_InsertToken_Record = Shared_StoredPersonalAccessToken;

export type Lib_State_Runner_InsertToken_Returns = void;

export type Lib_State_Runner_InsertToken_CreatedAt = string;

/**
 * Lib - State - Runner - Key Check Value.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_KeyCheckValue = string;

/**
 * Lib - State - Runner - Key Path.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_KeyPath = string;

/**
 * Lib - State - Runner - Key Replacement.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_KeyReplacement = string[];

/**
 * Lib - State - Runner - Key Was Missing.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_KeyWasMissing = boolean;

/**
 * Lib - State - Runner - Prepare Setup Claim.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_PrepareSetupClaim_Code = string;

export type Lib_State_Runner_PrepareSetupClaim_ExpiresAt = string;

export type Lib_State_Runner_PrepareSetupClaim_Returns = {
  code: Lib_State_Runner_PrepareSetupClaim_Code;
  expiresAt: Lib_State_Runner_PrepareSetupClaim_ExpiresAt;
} | undefined;

/**
 * Lib - State - Runner - Prune Expired.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_PruneExpired_Returns = void;

export type Lib_State_Runner_PruneExpired_Now = string;

/**
 * Lib - State - Runner - Record Activity.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_RecordActivity_ActorId = Shared_ActivityEvent_ActorId;

export type Lib_State_Runner_RecordActivity_Action = Shared_ActivityEvent_Action;

export type Lib_State_Runner_RecordActivity_Category = Shared_ActivityEvent_Category;

export type Lib_State_Runner_RecordActivity_Outcome = Shared_ActivityEvent_Outcome;

export type Lib_State_Runner_RecordActivity_Summary = Shared_ActivityEvent_Summary;

export type Lib_State_Runner_RecordActivity_Returns = void;

/**
 * Lib - State - Runner - Record Sign In Challenge Failure.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_RecordSignInChallengeFailure_Challenge = string;

export type Lib_State_Runner_RecordSignInChallengeFailure_Returns = boolean;

export type Lib_State_Runner_RecordSignInChallengeFailure_ChallengeHash = string;

export type Lib_State_Runner_RecordSignInChallengeFailure_Result = StatementResultingChanges;

/**
 * Lib - State - Runner - Remove Locked Secrets.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_RemoveLockedSecrets_Returns = string[];

export type Lib_State_Runner_RemoveLockedSecrets_RemovedAt = string;

export type Lib_State_Runner_RemoveLockedSecrets_RemovedSecrets = string[];

export type Lib_State_Runner_RemoveLockedSecrets_ConnectionRow_CredentialType = 'password' | 'privateKey';

export type Lib_State_Runner_RemoveLockedSecrets_ConnectionRow = {
  credentialType: Lib_State_Runner_RemoveLockedSecrets_ConnectionRow_CredentialType;
} | undefined;

export type Lib_State_Runner_RemoveLockedSecrets_Administrator_Id = string;

export type Lib_State_Runner_RemoveLockedSecrets_Administrator_Username = string;

export type Lib_State_Runner_RemoveLockedSecrets_Administrator = {
  id: Lib_State_Runner_RemoveLockedSecrets_Administrator_Id;
  username: Lib_State_Runner_RemoveLockedSecrets_Administrator_Username;
};

export type Lib_State_Runner_RemoveLockedSecrets_Administrators = Lib_State_Runner_RemoveLockedSecrets_Administrator[];

/**
 * Lib - State - Runner - Remove Passkey.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_RemovePasskey_AdministratorId = string;

export type Lib_State_Runner_RemovePasskey_Id = string;

export type Lib_State_Runner_RemovePasskey_ActorId = string;

export type Lib_State_Runner_RemovePasskey_Returns = 'not-found' | 'removed';

export type Lib_State_Runner_RemovePasskey_Passkey = Shared_AdministratorPasskey | undefined;

/**
 * Lib - State - Runner - Remove Token.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_RemoveToken_Id = string;

export type Lib_State_Runner_RemoveToken_ActorId = string;

export type Lib_State_Runner_RemoveToken_Returns = 'not-found' | 'removed';

export type Lib_State_Runner_RemoveToken_ExistingToken = {
  name: string;
} | undefined;

/**
 * Lib - State - Runner - Replace Recovery Codes.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_ReplaceRecoveryCodes_AdministratorId = string;

export type Lib_State_Runner_ReplaceRecoveryCodes_ActorId = string;

export type Lib_State_Runner_ReplaceRecoveryCodes_Returns = string[] | undefined;

/**
 * Lib - State - Runner - Resolve Encryption Key.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_ResolveEncryptionKey_Returns = string;

export type Lib_State_Runner_ResolveEncryptionKey_StoredKey = string;

/**
 * Lib - State - Runner - Save Encryption Key.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_SaveEncryptionKey_Returns = void;

export type Lib_State_Runner_SaveEncryptionKey_KeyFile = number;

/**
 * Lib - State - Runner - Session Duration Milliseconds.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_SessionDurationMilliseconds = number;

/**
 * Lib - State - Runner - Set Metadata.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_SetMetadata_Key = string;

export type Lib_State_Runner_SetMetadata_Value = string;

export type Lib_State_Runner_SetMetadata_Returns = void;

/**
 * Lib - State - Runner - Setup Claim Duration Milliseconds.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_SetupClaimDurationMilliseconds = number;

/**
 * Lib - State - Runner - Start Totp Enrollment.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_StartTotpEnrollment_AdministratorId = string;

export type Lib_State_Runner_StartTotpEnrollment_Secret = string;

export type Lib_State_Runner_StartTotpEnrollment_Returns = string;

export type Lib_State_Runner_StartTotpEnrollment_EncryptedSecret = Lib_Auth_EncryptCredential_EncryptedCredential;

export type Lib_State_Runner_StartTotpEnrollment_CreatedAt = string;

export type Lib_State_Runner_StartTotpEnrollment_ExpiresAt = string;

/**
 * Lib - State - Runner - Stored Administrator.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_StoredAdministrator = ReturnType<typeof storedAdministrator.parse>;

/**
 * Lib - State - Runner - Take Webauthn Ceremony.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_TakeWebauthnCeremony_CeremonyId = string;

export type Lib_State_Runner_TakeWebauthnCeremony_Kind = Lib_State_Runner_WebauthnCeremony_Kind;

export type Lib_State_Runner_TakeWebauthnCeremony_Returns = Lib_State_Runner_WebauthnCeremony | undefined;

export type Lib_State_Runner_TakeWebauthnCeremony_Row = {
  administratorId: string | null;
  challenge: string;
  expiresAt: string;
  name: string | null;
  origin: string;
  rpId: string;
} | undefined;

/**
 * Lib - State - Runner - Transaction.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_Transaction_Callback = () => void;

export type Lib_State_Runner_Transaction_Returns = void;

/**
 * Lib - State - Runner - Update Connection.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_UpdateConnection_Connection = Shared_PfsenseConnection;

export type Lib_State_Runner_UpdateConnection_ActorId = string;

export type Lib_State_Runner_UpdateConnection_Returns = void;

/**
 * Lib - State - Runner - Update Passkey Usage.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_UpdatePasskeyUsage_Id = string;

export type Lib_State_Runner_UpdatePasskeyUsage_Counter = number;

export type Lib_State_Runner_UpdatePasskeyUsage_DeviceType = Shared_AdministratorPasskey_DeviceType;

export type Lib_State_Runner_UpdatePasskeyUsage_BackedUp = boolean;

export type Lib_State_Runner_UpdatePasskeyUsage_RpId = string;

export type Lib_State_Runner_UpdatePasskeyUsage_Returns = 'conflict' | 'not-found' | 'updated';

export type Lib_State_Runner_UpdatePasskeyUsage_Passkey = Shared_AdministratorPasskey | undefined;

export type Lib_State_Runner_UpdatePasskeyUsage_LastUsedAt = string;

export type Lib_State_Runner_UpdatePasskeyUsage_Result = StatementResultingChanges;

/**
 * Lib - State - Runner - Update Token.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_UpdateToken_Id = string;

export type Lib_State_Runner_UpdateToken_Input = ReturnType<typeof tokenUpdate.parse>;

export type Lib_State_Runner_UpdateToken_ActorId = string;

export type Lib_State_Runner_UpdateToken_Returns = Shared_PersonalAccessTokenSummary | 'name-taken' | 'not-found';

export type Lib_State_Runner_UpdateToken_ExistingToken = Shared_EnvironmentVariables_PersonalAccessToken | undefined;

export type Lib_State_Runner_UpdateToken_ConflictingToken = Record<string, unknown> | undefined;

export type Lib_State_Runner_UpdateToken_ExpiresAt = string | undefined;

export type Lib_State_Runner_UpdateToken_Summary = Shared_PersonalAccessTokenSummary | undefined;

/**
 * Lib - State - Runner - Verify Encryption Key.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_VerifyEncryptionKey_Returns = void;

export type Lib_State_Runner_VerifyEncryptionKey_KeyCheck = string | undefined;

export type Lib_State_Runner_VerifyEncryptionKey_KeyCheckValue = string;

export type Lib_State_Runner_VerifyEncryptionKey_TotpRow = Lib_Auth_EncryptCredential_EncryptedCredential | undefined;

/**
 * Lib - State - Runner - Verify Totp.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_VerifyTotp_AdministratorId = string;

export type Lib_State_Runner_VerifyTotp_Code = string;

export type Lib_State_Runner_VerifyTotp_Now = number;

export type Lib_State_Runner_VerifyTotp_Returns = boolean;

export type Lib_State_Runner_VerifyTotp_Row = Record<string, unknown> | undefined;

export type Lib_State_Runner_VerifyTotp_StoredTotp = ReturnType<typeof storedAdministratorTotp.parse>;

export type Lib_State_Runner_VerifyTotp_Secret = string;

export type Lib_State_Runner_VerifyTotp_MatchedStep = number | undefined;

export type Lib_State_Runner_VerifyTotp_Result = StatementResultingChanges;

/**
 * Lib - State - Runner - Webauthn Ceremony.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_WebauthnCeremony_Kind = 'authentication' | 'registration';

export type Lib_State_Runner_WebauthnCeremony = {
  administratorId?: string | undefined;
  challenge: string;
  name?: string | undefined;
  origin: string;
  rpId: string;
};

/**
 * Lib - State - Runner - Webauthn Ceremony Duration Milliseconds.
 *
 * @since 2.0.0
 */
export type Lib_State_Runner_WebauthnCeremonyDurationMilliseconds = number;

export type Lib_State_Runner_StoredNotificationTarget = Omit<ReturnType<typeof storedNotificationTarget.parse>, 'events' | 'missingSecrets' | 'secretFields' | 'settings'> & {
  events: string[];
  missingSecrets: string[];
  secretFields: string[];
  settings: Record<string, string>;
};

export type Lib_State_Runner_CreateNotificationTarget_Input = Shared_NotificationTargetInput;

export type Lib_State_Runner_CreateNotificationTarget_ActorId = string;

export type Lib_State_Runner_CreateNotificationTarget_Returns = Shared_NotificationTarget | undefined;

export type Lib_State_Runner_CreateNotificationTarget_ExistingTarget = Record<string, unknown> | undefined;

export type Lib_State_Runner_CreateNotificationTarget_Id = string;

export type Lib_State_Runner_CreateNotificationTarget_Now = string;

export type Lib_State_Runner_CreateNotificationTarget_SealedSecrets = Lib_Auth_EncryptCredential_EncryptedCredential | undefined;

export type Lib_State_Runner_GetNotificationDeliveries_Event = string;

export type Lib_State_Runner_GetNotificationDeliveries_Returns = Shared_NotificationDelivery[];

export type Lib_State_Runner_GetNotificationDelivery_Id = string;

export type Lib_State_Runner_GetNotificationDelivery_Returns = Shared_NotificationDelivery | 'not-found' | 'secrets-missing';

export type Lib_State_Runner_GetNotificationDelivery_Target = Lib_State_Runner_StoredNotificationTarget | undefined;

export type Lib_State_Runner_GetNotificationTargets_Returns = Shared_NotificationTargets;

export type Lib_State_Runner_GetStoredNotificationTargets_Returns = Lib_State_Runner_StoredNotificationTarget[];

export type Lib_State_Runner_GetStoredNotificationTargets_Rows = Record<string, unknown>[];

export type Lib_State_Runner_GetStoredNotificationTargets_Target = ReturnType<typeof storedNotificationTarget.parse>;

export type Lib_State_Runner_OpenNotificationSecrets_Target = Lib_State_Runner_StoredNotificationTarget;

export type Lib_State_Runner_OpenNotificationSecrets_Returns = Record<string, string>;

export type Lib_State_Runner_RecordNotificationAttempt_Id = string;

export type Lib_State_Runner_RecordNotificationAttempt_ErrorMessage = string | null;

export type Lib_State_Runner_RecordNotificationAttempt_Returns = void;

export type Lib_State_Runner_RemoveLockedSecrets_NotificationRows = {
  id: string;
  missingSecrets: string;
  name: string;
  secretFields: string;
}[];

export type Lib_State_Runner_RemoveLockedSecrets_MissingSecrets = string[];

export type Lib_State_Runner_RemoveNotificationTarget_Id = string;

export type Lib_State_Runner_RemoveNotificationTarget_ActorId = string;

export type Lib_State_Runner_RemoveNotificationTarget_Returns = 'not-found' | 'removed';

export type Lib_State_Runner_RemoveNotificationTarget_ExistingTarget = {
  name: string;
} | undefined;

export type Lib_State_Runner_SealNotificationSecrets_Secrets = Record<string, string>;

export type Lib_State_Runner_SealNotificationSecrets_Returns = Lib_Auth_EncryptCredential_EncryptedCredential | undefined;

export type Lib_State_Runner_UpdateNotificationTarget_Id = string;

export type Lib_State_Runner_UpdateNotificationTarget_Input = Shared_NotificationTargetUpdate;

export type Lib_State_Runner_UpdateNotificationTarget_ActorId = string;

export type Lib_State_Runner_UpdateNotificationTarget_Returns = Shared_NotificationTarget | 'name-taken' | 'not-found';

export type Lib_State_Runner_UpdateNotificationTarget_ExistingTarget = Lib_State_Runner_StoredNotificationTarget | undefined;

export type Lib_State_Runner_UpdateNotificationTarget_ConflictingTarget = Record<string, unknown> | undefined;

export type Lib_State_Runner_UpdateNotificationTarget_Secrets = Record<string, string>;

export type Lib_State_Runner_UpdateNotificationTarget_ClearSecrets = string[];

export type Lib_State_Runner_UpdateNotificationTarget_MissingSecrets = string[];

export type Lib_State_Runner_UpdateNotificationTarget_SealedSecrets = Lib_Auth_EncryptCredential_EncryptedCredential | undefined;

export type Lib_State_Runner_WantsNotification_Events = string[];

export type Lib_State_Runner_WantsNotification_Returns = boolean;
