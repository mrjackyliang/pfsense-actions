import { randomBytes, randomUUID } from 'node:crypto';
import {
  chmodSync,
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import {
  authenticateRawPersonalAccessToken,
  decryptCredential,
  digestValue,
  encryptCredential,
  generateEncryptionKey,
  generateOpaqueToken,
  generatePersonalAccessToken,
  generateRecoveryCodes,
  generateSetupCode,
  hashAdministratorPassword,
  hashPersonalAccessToken,
  normalizeRecoveryCode,
  normalizeSetupCode,
  verifyAdministratorPassword,
} from './auth.js';
import { textEncryptionKey } from './regex.js';
import {
  activityEvent,
  personalAccessTokenRecord,
  personalAccessTokenScope,
  storedAdministrator,
  storedAdministratorPasskey,
  storedAdministratorTotp,
  storedConnection,
  storedNotificationKeys,
  storedNotificationTarget,
  storedNotificationValues,
  storedRemovedSecret,
} from './schema.js';
import { verifyTotpCode } from './totp.js';

import type {
  Lib_State_Runner_ActivityLimit,
  Lib_State_Runner_AddActivity_Action,
  Lib_State_Runner_AddActivity_ActorId,
  Lib_State_Runner_AddActivity_Category,
  Lib_State_Runner_AddActivity_CreatedAt,
  Lib_State_Runner_AddActivity_Id,
  Lib_State_Runner_AddActivity_Outcome,
  Lib_State_Runner_AddActivity_Returns,
  Lib_State_Runner_AddActivity_Summary,
  Lib_State_Runner_AuthenticateAdministrator_Administrator,
  Lib_State_Runner_AuthenticateAdministrator_IsValid,
  Lib_State_Runner_AuthenticateAdministrator_Password,
  Lib_State_Runner_AuthenticateAdministrator_PasswordHash,
  Lib_State_Runner_AuthenticateAdministrator_Returns,
  Lib_State_Runner_AuthenticateAdministrator_Username,
  Lib_State_Runner_AuthenticateToken_MatchedToken,
  Lib_State_Runner_AuthenticateToken_PersonalAccessToken,
  Lib_State_Runner_AuthenticateToken_Returns,
  Lib_State_Runner_AuthenticateToken_Row,
  Lib_State_Runner_BuildConnection_Credential,
  Lib_State_Runner_BuildConnection_CurrentConnection,
  Lib_State_Runner_BuildConnection_Input,
  Lib_State_Runner_BuildConnection_Returns,
  Lib_State_Runner_ChallengeDurationMilliseconds,
  Lib_State_Runner_ChallengeFailureLimit,
  Lib_State_Runner_ChangeAdministratorPassword_ActorId,
  Lib_State_Runner_ChangeAdministratorPassword_Id,
  Lib_State_Runner_ChangeAdministratorPassword_KeepSessionId,
  Lib_State_Runner_ChangeAdministratorPassword_NewPassword,
  Lib_State_Runner_ChangeAdministratorPassword_PasswordHash,
  Lib_State_Runner_ChangeAdministratorPassword_Returns,
  Lib_State_Runner_ChangeAdministratorUsername_Administrator,
  Lib_State_Runner_ChangeAdministratorUsername_ExistingUsername,
  Lib_State_Runner_ChangeAdministratorUsername_Id,
  Lib_State_Runner_ChangeAdministratorUsername_Returns,
  Lib_State_Runner_ChangeAdministratorUsername_UpdatedAt,
  Lib_State_Runner_ChangeAdministratorUsername_Username,
  Lib_State_Runner_ClaimInstallation_AdministratorId,
  Lib_State_Runner_ClaimInstallation_ClaimRow,
  Lib_State_Runner_ClaimInstallation_Code,
  Lib_State_Runner_ClaimInstallation_CreatedAt,
  Lib_State_Runner_ClaimInstallation_NormalizedCode,
  Lib_State_Runner_ClaimInstallation_Password,
  Lib_State_Runner_ClaimInstallation_PasswordHash,
  Lib_State_Runner_ClaimInstallation_Returns,
  Lib_State_Runner_ClaimInstallation_Username,
  Lib_State_Runner_Close_Returns,
  Lib_State_Runner_ConfirmAdministratorPassword_Administrator,
  Lib_State_Runner_ConfirmAdministratorPassword_Id,
  Lib_State_Runner_ConfirmAdministratorPassword_IsValid,
  Lib_State_Runner_ConfirmAdministratorPassword_Password,
  Lib_State_Runner_ConfirmAdministratorPassword_PasswordHash,
  Lib_State_Runner_ConfirmAdministratorPassword_Returns,
  Lib_State_Runner_Constructor_DatabasePath,
  Lib_State_Runner_Constructor_DirectoryMode,
  Lib_State_Runner_Constructor_Environment,
  Lib_State_Runner_Constructor_FileMode,
  Lib_State_Runner_ConsumeRecoveryCode_AdministratorId,
  Lib_State_Runner_ConsumeRecoveryCode_Code,
  Lib_State_Runner_ConsumeRecoveryCode_NormalizedCode,
  Lib_State_Runner_ConsumeRecoveryCode_Result,
  Lib_State_Runner_ConsumeRecoveryCode_Returns,
  Lib_State_Runner_CountRows_Returns,
  Lib_State_Runner_CountRows_Row,
  Lib_State_Runner_CountRows_Table,
  Lib_State_Runner_CreateNotificationTarget_ActorId,
  Lib_State_Runner_CreateNotificationTarget_ExistingTarget,
  Lib_State_Runner_CreateNotificationTarget_Id,
  Lib_State_Runner_CreateNotificationTarget_Input,
  Lib_State_Runner_CreateNotificationTarget_Now,
  Lib_State_Runner_CreateNotificationTarget_Returns,
  Lib_State_Runner_CreateNotificationTarget_SealedSecrets,
  Lib_State_Runner_CreatePasskey_ActorId,
  Lib_State_Runner_CreatePasskey_Administrator,
  Lib_State_Runner_CreatePasskey_AdministratorId,
  Lib_State_Runner_CreatePasskey_CreatedAt,
  Lib_State_Runner_CreatePasskey_Credential,
  Lib_State_Runner_CreatePasskey_ExistingPasskey,
  Lib_State_Runner_CreatePasskey_Name,
  Lib_State_Runner_CreatePasskey_Returns,
  Lib_State_Runner_CreatePasskey_RpId,
  Lib_State_Runner_CreateSchema_Returns,
  Lib_State_Runner_CreateSession_AdministratorId,
  Lib_State_Runner_CreateSession_CreatedAt,
  Lib_State_Runner_CreateSession_CsrfToken,
  Lib_State_Runner_CreateSession_ExpiresAt,
  Lib_State_Runner_CreateSession_Returns,
  Lib_State_Runner_CreateSession_SessionId,
  Lib_State_Runner_CreateSession_SessionToken,
  Lib_State_Runner_CreateSignInChallenge_AdministratorId,
  Lib_State_Runner_CreateSignInChallenge_Challenge,
  Lib_State_Runner_CreateSignInChallenge_CreatedAt,
  Lib_State_Runner_CreateSignInChallenge_ExpiresAt,
  Lib_State_Runner_CreateSignInChallenge_Returns,
  Lib_State_Runner_CreateToken_ActorId,
  Lib_State_Runner_CreateToken_CreatedAt,
  Lib_State_Runner_CreateToken_ExistingToken,
  Lib_State_Runner_CreateToken_Id,
  Lib_State_Runner_CreateToken_Input,
  Lib_State_Runner_CreateToken_PersonalAccessToken,
  Lib_State_Runner_CreateToken_Record,
  Lib_State_Runner_CreateToken_Returns,
  Lib_State_Runner_CreateToken_Scopes,
  Lib_State_Runner_CreateToken_TokenHash,
  Lib_State_Runner_CreateWebauthnCeremony_Ceremony,
  Lib_State_Runner_CreateWebauthnCeremony_CeremonyId,
  Lib_State_Runner_CreateWebauthnCeremony_CreatedAt,
  Lib_State_Runner_CreateWebauthnCeremony_ExpiresAt,
  Lib_State_Runner_CreateWebauthnCeremony_Returns,
  Lib_State_Runner_Database,
  Lib_State_Runner_DatabasePath,
  Lib_State_Runner_DeleteSession_Id,
  Lib_State_Runner_DeleteSession_Returns,
  Lib_State_Runner_DeleteSignInChallenge_Challenge,
  Lib_State_Runner_DeleteSignInChallenge_Returns,
  Lib_State_Runner_DisableTotp_ActorId,
  Lib_State_Runner_DisableTotp_AdministratorId,
  Lib_State_Runner_DisableTotp_Returns,
  Lib_State_Runner_DismissRemovedSecrets_AdministratorId,
  Lib_State_Runner_DismissRemovedSecrets_Returns,
  Lib_State_Runner_DummyPasswordHash,
  Lib_State_Runner_EnableTotp_ActorId,
  Lib_State_Runner_EnableTotp_Administrator,
  Lib_State_Runner_EnableTotp_AdministratorId,
  Lib_State_Runner_EnableTotp_CreatedAt,
  Lib_State_Runner_EnableTotp_EncryptedSecret,
  Lib_State_Runner_EnableTotp_InitialStep,
  Lib_State_Runner_EnableTotp_RecoveryCodes,
  Lib_State_Runner_EnableTotp_Returns,
  Lib_State_Runner_EnableTotp_Secret,
  Lib_State_Runner_EncryptionKey,
  Lib_State_Runner_EnrollmentDurationMilliseconds,
  Lib_State_Runner_Environment,
  Lib_State_Runner_EnvironmentImports,
  Lib_State_Runner_GetActivity_Limit,
  Lib_State_Runner_GetActivity_Returns,
  Lib_State_Runner_GetActivity_Rows,
  Lib_State_Runner_GetActivityCount_Returns,
  Lib_State_Runner_GetAdministrator_Administrator,
  Lib_State_Runner_GetAdministrator_Returns,
  Lib_State_Runner_GetAdministratorById_Administrator,
  Lib_State_Runner_GetAdministratorById_Id,
  Lib_State_Runner_GetAdministratorById_Returns,
  Lib_State_Runner_GetAdministratorSecurity_Administrator,
  Lib_State_Runner_GetAdministratorSecurity_AdministratorId,
  Lib_State_Runner_GetAdministratorSecurity_Passkeys,
  Lib_State_Runner_GetAdministratorSecurity_RecoveryCodeRow,
  Lib_State_Runner_GetAdministratorSecurity_Returns,
  Lib_State_Runner_GetConnection_Returns,
  Lib_State_Runner_GetConnection_Row,
  Lib_State_Runner_GetConnection_StoredConnection,
  Lib_State_Runner_GetEnvironmentImports_Returns,
  Lib_State_Runner_GetKeyReplacement_Returns,
  Lib_State_Runner_GetMetadata_Key,
  Lib_State_Runner_GetMetadata_Returns,
  Lib_State_Runner_GetMetadata_Row,
  Lib_State_Runner_GetNotificationDeliveries_Event,
  Lib_State_Runner_GetNotificationDeliveries_Returns,
  Lib_State_Runner_GetNotificationDelivery_Id,
  Lib_State_Runner_GetNotificationDelivery_Returns,
  Lib_State_Runner_GetNotificationDelivery_Target,
  Lib_State_Runner_GetNotificationTargets_Returns,
  Lib_State_Runner_GetPasskey_Id,
  Lib_State_Runner_GetPasskey_Returns,
  Lib_State_Runner_GetPasskeys_AdministratorId,
  Lib_State_Runner_GetPasskeys_Returns,
  Lib_State_Runner_GetPasskeys_Rows,
  Lib_State_Runner_GetPasskeys_Transports,
  Lib_State_Runner_GetPfsenseConnection_Returns,
  Lib_State_Runner_GetRemovedSecrets_AdministratorId,
  Lib_State_Runner_GetRemovedSecrets_RemovedSecret,
  Lib_State_Runner_GetRemovedSecrets_Returns,
  Lib_State_Runner_GetRemovedSecrets_Rows,
  Lib_State_Runner_GetSession_Now,
  Lib_State_Runner_GetSession_Returns,
  Lib_State_Runner_GetSession_Row,
  Lib_State_Runner_GetSession_SessionToken,
  Lib_State_Runner_GetSetupStatus_Returns,
  Lib_State_Runner_GetSetupStatus_Row,
  Lib_State_Runner_GetSignInChallenge_Challenge,
  Lib_State_Runner_GetSignInChallenge_Returns,
  Lib_State_Runner_GetSignInChallenge_Row,
  Lib_State_Runner_GetStoredAdministrator_Id,
  Lib_State_Runner_GetStoredAdministrator_Returns,
  Lib_State_Runner_GetStoredAdministrator_Row,
  Lib_State_Runner_GetStoredAdministrator_Username,
  Lib_State_Runner_GetStoredConnection_Credential,
  Lib_State_Runner_GetStoredConnection_Returns,
  Lib_State_Runner_GetStoredConnection_Row,
  Lib_State_Runner_GetStoredConnection_StoredConnection,
  Lib_State_Runner_GetStoredNotificationTargets_Returns,
  Lib_State_Runner_GetStoredNotificationTargets_Rows,
  Lib_State_Runner_GetStoredNotificationTargets_Target,
  Lib_State_Runner_GetStoredTokens_Returns,
  Lib_State_Runner_GetStoredTokens_Rows,
  Lib_State_Runner_GetStoredTokens_ScopeRows,
  Lib_State_Runner_GetStoredTokens_Scopes,
  Lib_State_Runner_GetTokens_LastUsedTimes,
  Lib_State_Runner_GetTokens_MetadataRows,
  Lib_State_Runner_GetTokens_Names,
  Lib_State_Runner_GetTokens_Returns,
  Lib_State_Runner_GetTotpEnrollment_AdministratorId,
  Lib_State_Runner_GetTotpEnrollment_Returns,
  Lib_State_Runner_GetTotpEnrollment_Row,
  Lib_State_Runner_GetWebauthnRpName_Returns,
  Lib_State_Runner_HasAdministrator_Returns,
  Lib_State_Runner_HasConnection_Returns,
  Lib_State_Runner_HasEncryptedData_Returns,
  Lib_State_Runner_HasTotp_AdministratorId,
  Lib_State_Runner_HasTotp_Returns,
  Lib_State_Runner_HasTotp_Row,
  Lib_State_Runner_Initialize_CreatedAt,
  Lib_State_Runner_Initialize_ImportedConnection,
  Lib_State_Runner_Initialize_InitializedAt,
  Lib_State_Runner_Initialize_IsEmpty,
  Lib_State_Runner_Initialize_Returns,
  Lib_State_Runner_InsertConnection_Connection,
  Lib_State_Runner_InsertConnection_Credential,
  Lib_State_Runner_InsertConnection_CredentialType,
  Lib_State_Runner_InsertConnection_EncryptedCredential,
  Lib_State_Runner_InsertConnection_Returns,
  Lib_State_Runner_InsertToken_CreatedAt,
  Lib_State_Runner_InsertToken_Record,
  Lib_State_Runner_InsertToken_Returns,
  Lib_State_Runner_KeyCheckValue,
  Lib_State_Runner_KeyPath,
  Lib_State_Runner_KeyReplacement,
  Lib_State_Runner_KeyWasMissing,
  Lib_State_Runner_OpenNotificationSecrets_Returns,
  Lib_State_Runner_OpenNotificationSecrets_Target,
  Lib_State_Runner_PrepareSetupClaim_Code,
  Lib_State_Runner_PrepareSetupClaim_ExpiresAt,
  Lib_State_Runner_PrepareSetupClaim_Returns,
  Lib_State_Runner_PruneExpired_Now,
  Lib_State_Runner_PruneExpired_Returns,
  Lib_State_Runner_RecordActivity_Action,
  Lib_State_Runner_RecordActivity_ActorId,
  Lib_State_Runner_RecordActivity_Category,
  Lib_State_Runner_RecordActivity_Outcome,
  Lib_State_Runner_RecordActivity_Returns,
  Lib_State_Runner_RecordActivity_Summary,
  Lib_State_Runner_RecordNotificationAttempt_ErrorMessage,
  Lib_State_Runner_RecordNotificationAttempt_Id,
  Lib_State_Runner_RecordNotificationAttempt_Returns,
  Lib_State_Runner_RecordSignInChallengeFailure_Challenge,
  Lib_State_Runner_RecordSignInChallengeFailure_ChallengeHash,
  Lib_State_Runner_RecordSignInChallengeFailure_Result,
  Lib_State_Runner_RecordSignInChallengeFailure_Returns,
  Lib_State_Runner_RemoveLockedSecrets_Administrators,
  Lib_State_Runner_RemoveLockedSecrets_ConnectionRow,
  Lib_State_Runner_RemoveLockedSecrets_MissingSecrets,
  Lib_State_Runner_RemoveLockedSecrets_NotificationRows,
  Lib_State_Runner_RemoveLockedSecrets_RemovedAt,
  Lib_State_Runner_RemoveLockedSecrets_RemovedSecrets,
  Lib_State_Runner_RemoveLockedSecrets_Returns,
  Lib_State_Runner_RemoveNotificationTarget_ActorId,
  Lib_State_Runner_RemoveNotificationTarget_ExistingTarget,
  Lib_State_Runner_RemoveNotificationTarget_Id,
  Lib_State_Runner_RemoveNotificationTarget_Returns,
  Lib_State_Runner_RemovePasskey_ActorId,
  Lib_State_Runner_RemovePasskey_AdministratorId,
  Lib_State_Runner_RemovePasskey_Id,
  Lib_State_Runner_RemovePasskey_Passkey,
  Lib_State_Runner_RemovePasskey_Returns,
  Lib_State_Runner_RemoveToken_ActorId,
  Lib_State_Runner_RemoveToken_ExistingToken,
  Lib_State_Runner_RemoveToken_Id,
  Lib_State_Runner_RemoveToken_Returns,
  Lib_State_Runner_ReplaceRecoveryCodes_ActorId,
  Lib_State_Runner_ReplaceRecoveryCodes_AdministratorId,
  Lib_State_Runner_ReplaceRecoveryCodes_Returns,
  Lib_State_Runner_ResolveEncryptionKey_Returns,
  Lib_State_Runner_ResolveEncryptionKey_StoredKey,
  Lib_State_Runner_SaveEncryptionKey_KeyFile,
  Lib_State_Runner_SaveEncryptionKey_Returns,
  Lib_State_Runner_SealNotificationSecrets_Returns,
  Lib_State_Runner_SealNotificationSecrets_Secrets,
  Lib_State_Runner_SessionDurationMilliseconds,
  Lib_State_Runner_SetMetadata_Key,
  Lib_State_Runner_SetMetadata_Returns,
  Lib_State_Runner_SetMetadata_Value,
  Lib_State_Runner_SetupClaimDurationMilliseconds,
  Lib_State_Runner_StartTotpEnrollment_AdministratorId,
  Lib_State_Runner_StartTotpEnrollment_CreatedAt,
  Lib_State_Runner_StartTotpEnrollment_EncryptedSecret,
  Lib_State_Runner_StartTotpEnrollment_ExpiresAt,
  Lib_State_Runner_StartTotpEnrollment_Returns,
  Lib_State_Runner_StartTotpEnrollment_Secret,
  Lib_State_Runner_TakeWebauthnCeremony_CeremonyId,
  Lib_State_Runner_TakeWebauthnCeremony_Kind,
  Lib_State_Runner_TakeWebauthnCeremony_Returns,
  Lib_State_Runner_TakeWebauthnCeremony_Row,
  Lib_State_Runner_Transaction_Callback,
  Lib_State_Runner_Transaction_Returns,
  Lib_State_Runner_UpdateConnection_ActorId,
  Lib_State_Runner_UpdateConnection_Connection,
  Lib_State_Runner_UpdateConnection_Returns,
  Lib_State_Runner_UpdateNotificationTarget_ActorId,
  Lib_State_Runner_UpdateNotificationTarget_ClearSecrets,
  Lib_State_Runner_UpdateNotificationTarget_ConflictingTarget,
  Lib_State_Runner_UpdateNotificationTarget_ExistingTarget,
  Lib_State_Runner_UpdateNotificationTarget_Id,
  Lib_State_Runner_UpdateNotificationTarget_Input,
  Lib_State_Runner_UpdateNotificationTarget_MissingSecrets,
  Lib_State_Runner_UpdateNotificationTarget_Returns,
  Lib_State_Runner_UpdateNotificationTarget_SealedSecrets,
  Lib_State_Runner_UpdateNotificationTarget_Secrets,
  Lib_State_Runner_UpdatePasskeyUsage_BackedUp,
  Lib_State_Runner_UpdatePasskeyUsage_Counter,
  Lib_State_Runner_UpdatePasskeyUsage_DeviceType,
  Lib_State_Runner_UpdatePasskeyUsage_Id,
  Lib_State_Runner_UpdatePasskeyUsage_LastUsedAt,
  Lib_State_Runner_UpdatePasskeyUsage_Passkey,
  Lib_State_Runner_UpdatePasskeyUsage_Result,
  Lib_State_Runner_UpdatePasskeyUsage_Returns,
  Lib_State_Runner_UpdatePasskeyUsage_RpId,
  Lib_State_Runner_UpdateToken_ActorId,
  Lib_State_Runner_UpdateToken_ConflictingToken,
  Lib_State_Runner_UpdateToken_ExistingToken,
  Lib_State_Runner_UpdateToken_ExpiresAt,
  Lib_State_Runner_UpdateToken_Id,
  Lib_State_Runner_UpdateToken_Input,
  Lib_State_Runner_UpdateToken_Returns,
  Lib_State_Runner_UpdateToken_Summary,
  Lib_State_Runner_VerifyEncryptionKey_KeyCheck,
  Lib_State_Runner_VerifyEncryptionKey_KeyCheckValue,
  Lib_State_Runner_VerifyEncryptionKey_Returns,
  Lib_State_Runner_VerifyEncryptionKey_TotpRow,
  Lib_State_Runner_VerifyTotp_AdministratorId,
  Lib_State_Runner_VerifyTotp_Code,
  Lib_State_Runner_VerifyTotp_MatchedStep,
  Lib_State_Runner_VerifyTotp_Now,
  Lib_State_Runner_VerifyTotp_Result,
  Lib_State_Runner_VerifyTotp_Returns,
  Lib_State_Runner_VerifyTotp_Row,
  Lib_State_Runner_VerifyTotp_Secret,
  Lib_State_Runner_VerifyTotp_StoredTotp,
  Lib_State_Runner_WantsNotification_Events,
  Lib_State_Runner_WantsNotification_Returns,
  Lib_State_Runner_WebauthnCeremonyDurationMilliseconds,
} from '@/types/lib/state.d.ts';

/**
 * Lib - State.
 *
 * Owns the embedded SQLite store, schema migration, and encrypted controller secrets.
 * Browser sessions, sign-in ceremonies, and API client tokens all persist across restarts.
 *
 * @since 2.0.0
 */
export class Runner {
  /**
   * Lib - State - Activity Limit.
   *
   * Bounds the stored redacted activity history.
   * The oldest rows are removed within each write transaction.
   *
   * @private
   *
   * @since 2.0.0
   */
  static readonly #activityLimit: Lib_State_Runner_ActivityLimit = 250;

  /**
   * Lib - State - Challenge Duration Milliseconds.
   *
   * Gives a password-verified sign-in five minutes to finish its second factor.
   * Expired challenges cannot be exchanged for a browser session.
   *
   * @private
   *
   * @since 2.0.0
   */
  static readonly #challengeDurationMilliseconds: Lib_State_Runner_ChallengeDurationMilliseconds = 5 * 60 * 1000;

  /**
   * Lib - State - Challenge Failure Limit.
   *
   * Discards a second-factor challenge after five wrong codes.
   * The visitor then starts again from the password step.
   *
   * @private
   *
   * @since 2.0.0
   */
  static readonly #challengeFailureLimit: Lib_State_Runner_ChallengeFailureLimit = 5;

  /**
   * Lib - State - Enrollment Duration Milliseconds.
   *
   * Keeps a pending authenticator secret for ten minutes while it is scanned and confirmed.
   * The pending secret is encrypted like an enrolled one.
   *
   * @private
   *
   * @since 2.0.0
   */
  static readonly #enrollmentDurationMilliseconds: Lib_State_Runner_EnrollmentDurationMilliseconds = 10 * 60 * 1000;

  /**
   * Lib - State - Key Check Value.
   *
   * Plaintext sealed with the encryption key so a wrong key is caught at startup.
   * A mismatch stops the service before any secret is read or written.
   *
   * @private
   *
   * @since 2.0.0
   */
  static readonly #keyCheckValue: Lib_State_Runner_KeyCheckValue = 'pfsense-actions-encryption-key-check';

  /**
   * Lib - State - Session Duration Milliseconds.
   *
   * Signs a browser out twenty-four hours after it signed in.
   * Sessions live in SQLite, so a restart keeps everyone signed in.
   *
   * @private
   *
   * @since 2.0.0
   */
  static readonly #sessionDurationMilliseconds: Lib_State_Runner_SessionDurationMilliseconds = 24 * 60 * 60 * 1000;

  /**
   * Lib - State - Setup Claim Duration Milliseconds.
   *
   * Lets the setup code printed at startup work for thirty minutes.
   * A restart prints a fresh code until the first account exists.
   *
   * @private
   *
   * @since 2.0.0
   */
  static readonly #setupClaimDurationMilliseconds: Lib_State_Runner_SetupClaimDurationMilliseconds = 30 * 60 * 1000;

  /**
   * Lib - State - Webauthn Ceremony Duration Milliseconds.
   *
   * Bounds every passkey prompt to five minutes.
   * Each stored ceremony can be used once.
   *
   * @private
   *
   * @since 2.0.0
   */
  static readonly #webauthnCeremonyDurationMilliseconds: Lib_State_Runner_WebauthnCeremonyDurationMilliseconds = 5 * 60 * 1000;

  /**
   * Lib - State - Database.
   *
   * Owns the synchronous SQLite connection for the process lifetime.
   * Route handlers share this serialized state boundary.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #database: Lib_State_Runner_Database;

  /**
   * Lib - State - Database Path.
   *
   * Points to the protected database within the persistent data directory.
   * File permissions are tightened immediately after opening it.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #databasePath: Lib_State_Runner_DatabasePath;

  /**
   * Lib - State - Dummy Password Hash.
   *
   * Equalizes hashing work when a submitted administrator name does not exist.
   * The value has no account and cannot authenticate a browser.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #dummyPasswordHash: Lib_State_Runner_DummyPasswordHash;

  /**
   * Lib - State - Encryption Key.
   *
   * Holds the key that seals the SSH credential and authenticator secrets.
   * It comes from the key file in the data directory, or is made new when it's missing.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #encryptionKey: Lib_State_Runner_EncryptionKey;

  /**
   * Lib - State - Environment.
   *
   * Retains bootstrap values, paths, and the port read at startup.
   * Mutable tokens and connection settings live only in SQLite after initialization.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #environment: Lib_State_Runner_Environment;

  /**
   * Lib - State - Environment Imports.
   *
   * Records what the deprecated environment variables filled in during this start.
   * The service reads it once to log the matching deprecation warning.
   *
   * @private
   *
   * @since 2.0.0
   */
  #environmentImports: Lib_State_Runner_EnvironmentImports = {
    connection: false,
  };

  /**
   * Lib - State - Key Path.
   *
   * Points to the encryption key file in the data directory.
   * A missing file is replaced with a new key on start.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #keyPath: Lib_State_Runner_KeyPath;

  /**
   * Lib - State - Key Replacement.
   *
   * Lists what this start removed because the encryption key file was missing.
   * The service reads it once to log what has to be entered again.
   *
   * @private
   *
   * @since 2.0.0
   */
  #keyReplacement: Lib_State_Runner_KeyReplacement = [];

  /**
   * Lib - State - Key Was Missing.
   *
   * Records that this start made a new encryption key because the file was gone.
   * The key check then removes what the old key sealed.
   *
   * @private
   *
   * @since 2.0.0
   */
  #keyWasMissing: Lib_State_Runner_KeyWasMissing = false;

  /**
   * Lib - State - Constructor.
   *
   * Opens the protected database, applies the schema, and resolves the encryption key.
   * Optional bootstrap values from the environment are then applied once.
   *
   * @param {Lib_State_Runner_Constructor_Environment} environment - Environment.
   *
   * @since 2.0.0
   */
  public constructor(environment: Lib_State_Runner_Constructor_Environment) {
    this.#environment = environment;

    const directoryMode: Lib_State_Runner_Constructor_DirectoryMode = parseInt('700', 8);
    const fileMode: Lib_State_Runner_Constructor_FileMode = parseInt('600', 8);
    const databasePath: Lib_State_Runner_Constructor_DatabasePath = join(environment['dataDirectory'], 'pfsense-actions.sqlite3');

    mkdirSync(environment['dataDirectory'], {
      mode: directoryMode,
      recursive: true,
    });

    chmodSync(environment['dataDirectory'], directoryMode);

    process.umask(parseInt('077', 8));

    this.#databasePath = databasePath;
    this.#keyPath = join(environment['dataDirectory'], 'keys', 'installation.key');
    this.#database = new DatabaseSync(databasePath);
    this.#dummyPasswordHash = hashAdministratorPassword('pfsense-actions-invalid-administrator');

    this.#database.exec('PRAGMA foreign_keys = ON;');

    this.#database.exec('PRAGMA busy_timeout = 5000;');

    this.#database.exec('PRAGMA journal_mode = WAL;');

    this.#database.exec('PRAGMA synchronous = NORMAL;');

    this.#database.exec('PRAGMA trusted_schema = OFF;');

    this.createSchema();

    chmodSync(this.#databasePath, fileMode);

    this.#encryptionKey = this.resolveEncryptionKey();

    this.verifyEncryptionKey();

    this.initialize();

    return;
  }

  /**
   * Lib - State - Authenticate Administrator.
   *
   * Verifies a local username and slow password hash without consulting API tokens.
   * Unknown usernames perform equivalent hashing work to reduce timing disclosure.
   *
   * @param {Lib_State_Runner_AuthenticateAdministrator_Username} username - Username.
   * @param {Lib_State_Runner_AuthenticateAdministrator_Password} password - Password.
   *
   * @returns {Lib_State_Runner_AuthenticateAdministrator_Returns}
   *
   * @since 2.0.0
   */
  public authenticateAdministrator(username: Lib_State_Runner_AuthenticateAdministrator_Username, password: Lib_State_Runner_AuthenticateAdministrator_Password): Lib_State_Runner_AuthenticateAdministrator_Returns {
    const administrator: Lib_State_Runner_AuthenticateAdministrator_Administrator = this.getStoredAdministrator(undefined, username);
    const passwordHash: Lib_State_Runner_AuthenticateAdministrator_PasswordHash = (administrator === undefined) ? this.#dummyPasswordHash : administrator['passwordHash'];
    const isValid: Lib_State_Runner_AuthenticateAdministrator_IsValid = verifyAdministratorPassword(password, passwordHash);

    if (administrator === undefined || isValid === false) {
      return undefined;
    }

    return {
      createdAt: administrator['createdAt'],
      id: administrator['id'],
      updatedAt: administrator['updatedAt'],
      username: administrator['username'],
    };
  }

  /**
   * Lib - State - Authenticate Token.
   *
   * Resolves a third-party client credential against current SQLite token rows.
   * A match records its last-used time and returns the token's name for the activity log.
   *
   * @param {Lib_State_Runner_AuthenticateToken_PersonalAccessToken} personalAccessToken - Personal access token.
   *
   * @returns {Lib_State_Runner_AuthenticateToken_Returns}
   *
   * @since 2.0.0
   */
  public authenticateToken(personalAccessToken: Lib_State_Runner_AuthenticateToken_PersonalAccessToken): Lib_State_Runner_AuthenticateToken_Returns {
    const matchedToken: Lib_State_Runner_AuthenticateToken_MatchedToken = authenticateRawPersonalAccessToken(this.getStoredTokens(), personalAccessToken);

    if (matchedToken === undefined) {
      return undefined;
    }

    const row: Lib_State_Runner_AuthenticateToken_Row = this.#database.prepare('UPDATE api_tokens SET last_used_at = ? WHERE id = ? RETURNING name').get(new Date().toISOString(), matchedToken['id']) as Lib_State_Runner_AuthenticateToken_Row;

    if (row === undefined) {
      return undefined;
    }

    return {
      id: matchedToken['id'],
      name: row['name'],
      scopes: matchedToken['scopes'],
    };
  }

  /**
   * Lib - State - Build Connection.
   *
   * Combines proposed public fields with either a new or retained decrypted credential.
   * Changing the credential method, or saving the first connection, needs a credential.
   *
   * @param {Lib_State_Runner_BuildConnection_Input} input - Input.
   *
   * @returns {Lib_State_Runner_BuildConnection_Returns}
   *
   * @since 2.0.0
   */
  public buildConnection(input: Lib_State_Runner_BuildConnection_Input): Lib_State_Runner_BuildConnection_Returns {
    const currentConnection: Lib_State_Runner_BuildConnection_CurrentConnection = this.getStoredConnection();

    let credential: Lib_State_Runner_BuildConnection_Credential = input['credential'];

    if (
      credential === undefined
      && currentConnection !== undefined
      && input['credentialType'] === 'password'
    ) {
      credential = currentConnection['pfsensePassword'];
    }

    if (
      credential === undefined
      && currentConnection !== undefined
      && input['credentialType'] === 'privateKey'
    ) {
      credential = currentConnection['pfsensePrivateKey'];
    }

    if (credential === undefined) {
      return undefined;
    }

    return {
      pfsenseSshIp: input['pfsenseSshIp'],
      pfsenseSshPort: input['pfsenseSshPort'],
      pfsenseUsername: input['pfsenseUsername'],
      ...((input['credentialType'] === 'password') ? { pfsensePassword: credential } : { pfsensePrivateKey: credential }),
    };
  }

  /**
   * Lib - State - Change Administrator Password.
   *
   * Stores a new password hash and signs out every other browser session.
   * The session that made the change stays signed in.
   *
   * @param {Lib_State_Runner_ChangeAdministratorPassword_Id}            id            - Id.
   * @param {Lib_State_Runner_ChangeAdministratorPassword_NewPassword}   newPassword   - New password.
   * @param {Lib_State_Runner_ChangeAdministratorPassword_KeepSessionId} keepSessionId - Keep session id.
   * @param {Lib_State_Runner_ChangeAdministratorPassword_ActorId}       actorId       - Actor id.
   *
   * @returns {Lib_State_Runner_ChangeAdministratorPassword_Returns}
   *
   * @since 2.0.0
   */
  public changeAdministratorPassword(id: Lib_State_Runner_ChangeAdministratorPassword_Id, newPassword: Lib_State_Runner_ChangeAdministratorPassword_NewPassword, keepSessionId: Lib_State_Runner_ChangeAdministratorPassword_KeepSessionId, actorId: Lib_State_Runner_ChangeAdministratorPassword_ActorId): Lib_State_Runner_ChangeAdministratorPassword_Returns {
    const passwordHash: Lib_State_Runner_ChangeAdministratorPassword_PasswordHash = hashAdministratorPassword(newPassword);

    this.transaction(() => {
      this.#database.prepare('UPDATE administrators SET password_hash = ?, updated_at = ? WHERE id = ?').run(passwordHash, new Date().toISOString(), id);

      this.#database.prepare('DELETE FROM browser_sessions WHERE administrator_id = ? AND id != ?').run(id, keepSessionId);

      this.addActivity(actorId, 'password-changed', 'access', 'succeeded', 'Changed the administrator password and signed out other browsers');

      return;
    });

    return;
  }

  /**
   * Lib - State - Change Administrator Username.
   *
   * Renames the local account after the route confirmed its password.
   * Existing sessions stay signed in and show the new name on their next request.
   *
   * @param {Lib_State_Runner_ChangeAdministratorUsername_Id}       id       - Id.
   * @param {Lib_State_Runner_ChangeAdministratorUsername_Username} username - Username.
   *
   * @returns {Lib_State_Runner_ChangeAdministratorUsername_Returns}
   *
   * @since 2.0.0
   */
  public changeAdministratorUsername(id: Lib_State_Runner_ChangeAdministratorUsername_Id, username: Lib_State_Runner_ChangeAdministratorUsername_Username): Lib_State_Runner_ChangeAdministratorUsername_Returns {
    const administrator: Lib_State_Runner_ChangeAdministratorUsername_Administrator = this.getStoredAdministrator(id);

    if (administrator === undefined) {
      return 'not-found';
    }

    const existingUsername: Lib_State_Runner_ChangeAdministratorUsername_ExistingUsername = this.getStoredAdministrator(undefined, username);

    if (existingUsername !== undefined && existingUsername['id'] !== id) {
      return 'conflict';
    }

    const updatedAt: Lib_State_Runner_ChangeAdministratorUsername_UpdatedAt = new Date().toISOString();

    this.transaction(() => {
      this.#database.prepare('UPDATE administrators SET username = ?, updated_at = ? WHERE id = ?').run(username, updatedAt, id);

      this.addActivity(username, 'username-changed', 'access', 'succeeded', 'Changed the administrator username');

      return;
    });

    return {
      createdAt: administrator['createdAt'],
      id,
      updatedAt,
      username,
    };
  }

  /**
   * Lib - State - Claim Installation.
   *
   * Consumes the setup code and creates the first administrator in one transaction.
   * Wrong, expired, or already used codes leave the installation unchanged.
   *
   * @param {Lib_State_Runner_ClaimInstallation_Code}     code     - Code.
   * @param {Lib_State_Runner_ClaimInstallation_Username} username - Username.
   * @param {Lib_State_Runner_ClaimInstallation_Password} password - Password.
   *
   * @returns {Lib_State_Runner_ClaimInstallation_Returns}
   *
   * @since 2.0.0
   */
  public claimInstallation(code: Lib_State_Runner_ClaimInstallation_Code, username: Lib_State_Runner_ClaimInstallation_Username, password: Lib_State_Runner_ClaimInstallation_Password): Lib_State_Runner_ClaimInstallation_Returns {
    const normalizedCode: Lib_State_Runner_ClaimInstallation_NormalizedCode = normalizeSetupCode(code);

    if (normalizedCode === undefined || this.hasAdministrator() === true) {
      return 'invalid';
    }

    const claimRow: Lib_State_Runner_ClaimInstallation_ClaimRow = this.#database.prepare('SELECT code_hash AS codeHash FROM setup_claims WHERE id = 1 AND code_hash = ? AND expires_at > ?').get(digestValue(normalizedCode), new Date().toISOString());

    if (claimRow === undefined) {
      return 'invalid';
    }

    const passwordHash: Lib_State_Runner_ClaimInstallation_PasswordHash = hashAdministratorPassword(password);
    const administratorId: Lib_State_Runner_ClaimInstallation_AdministratorId = randomUUID();
    const createdAt: Lib_State_Runner_ClaimInstallation_CreatedAt = new Date().toISOString();

    this.transaction(() => {
      this.#database.prepare('INSERT INTO administrators (id, username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(administratorId, username, passwordHash, createdAt, createdAt);

      this.#database.prepare('DELETE FROM setup_claims').run();

      this.addActivity(username, 'installation-claimed', 'access', 'succeeded', 'Created the administrator account with the setup code');

      return;
    });

    return {
      createdAt,
      id: administratorId,
      updatedAt: createdAt,
      username,
    };
  }

  /**
   * Lib - State - Close.
   *
   * Closes the synchronous SQLite handle for deterministic tests and graceful shutdowns.
   * Production processes normally release the handle when s6 terminates the service.
   *
   * @returns {Lib_State_Runner_Close_Returns}
   *
   * @since 2.0.0
   */
  public close(): Lib_State_Runner_Close_Returns {
    this.#database.close();

    return;
  }

  /**
   * Lib - State - Confirm Administrator Password.
   *
   * Rechecks the account password before a sensitive sign-in change.
   * Unknown administrator identifiers still perform the dummy hashing work.
   *
   * @param {Lib_State_Runner_ConfirmAdministratorPassword_Id}       id       - Id.
   * @param {Lib_State_Runner_ConfirmAdministratorPassword_Password} password - Password.
   *
   * @returns {Lib_State_Runner_ConfirmAdministratorPassword_Returns}
   *
   * @since 2.0.0
   */
  public confirmAdministratorPassword(id: Lib_State_Runner_ConfirmAdministratorPassword_Id, password: Lib_State_Runner_ConfirmAdministratorPassword_Password): Lib_State_Runner_ConfirmAdministratorPassword_Returns {
    const administrator: Lib_State_Runner_ConfirmAdministratorPassword_Administrator = this.getStoredAdministrator(id);
    const passwordHash: Lib_State_Runner_ConfirmAdministratorPassword_PasswordHash = (administrator === undefined) ? this.#dummyPasswordHash : administrator['passwordHash'];
    const isValid: Lib_State_Runner_ConfirmAdministratorPassword_IsValid = verifyAdministratorPassword(password, passwordHash);

    if (administrator === undefined || isValid === false) {
      return false;
    }

    return true;
  }

  /**
   * Lib - State - Consume Recovery Code.
   *
   * Deletes one matching recovery code so it can never be used again.
   * Codes are compared by digest after removing spaces and dashes.
   *
   * @param {Lib_State_Runner_ConsumeRecoveryCode_AdministratorId} administratorId - Administrator id.
   * @param {Lib_State_Runner_ConsumeRecoveryCode_Code}            code            - Code.
   *
   * @returns {Lib_State_Runner_ConsumeRecoveryCode_Returns}
   *
   * @since 2.0.0
   */
  public consumeRecoveryCode(administratorId: Lib_State_Runner_ConsumeRecoveryCode_AdministratorId, code: Lib_State_Runner_ConsumeRecoveryCode_Code): Lib_State_Runner_ConsumeRecoveryCode_Returns {
    const normalizedCode: Lib_State_Runner_ConsumeRecoveryCode_NormalizedCode = normalizeRecoveryCode(code);

    if (normalizedCode === undefined) {
      return false;
    }

    const result: Lib_State_Runner_ConsumeRecoveryCode_Result = this.#database.prepare('DELETE FROM recovery_codes WHERE administrator_id = ? AND code_hash = ?').run(administratorId, digestValue(normalizedCode));

    return Number(result['changes']) === 1;
  }

  /**
   * Lib - State - Create Notification Target.
   *
   * Adds a destination with its plain settings and its secrets sealed together.
   * A name another destination uses fails without changing anything.
   *
   * @param {Lib_State_Runner_CreateNotificationTarget_Input}   input   - Input.
   * @param {Lib_State_Runner_CreateNotificationTarget_ActorId} actorId - Actor id.
   *
   * @returns {Lib_State_Runner_CreateNotificationTarget_Returns}
   *
   * @since 2.0.0
   */
  public createNotificationTarget(input: Lib_State_Runner_CreateNotificationTarget_Input, actorId: Lib_State_Runner_CreateNotificationTarget_ActorId): Lib_State_Runner_CreateNotificationTarget_Returns {
    const existingTarget: Lib_State_Runner_CreateNotificationTarget_ExistingTarget = this.#database.prepare('SELECT id FROM notification_targets WHERE name = ? COLLATE NOCASE').get(input['name']);

    if (existingTarget !== undefined) {
      return undefined;
    }

    const id: Lib_State_Runner_CreateNotificationTarget_Id = `ntf-${randomBytes(8).toString('hex')}`;
    const now: Lib_State_Runner_CreateNotificationTarget_Now = new Date().toISOString();
    const sealedSecrets: Lib_State_Runner_CreateNotificationTarget_SealedSecrets = this.sealNotificationSecrets(input['secrets']);

    this.transaction(() => {
      this.#database.prepare('INSERT INTO notification_targets (id, name, service, events, settings, secret_fields, missing_secrets, secrets_ciphertext, secrets_iv, secrets_auth_tag, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, \'[]\', ?, ?, ?, ?, ?)').run(id, input['name'], input['service'], JSON.stringify(input['events']), JSON.stringify(input['settings']), JSON.stringify(Object.keys(input['secrets']).sort()), (sealedSecrets === undefined) ? null : sealedSecrets['ciphertext'], (sealedSecrets === undefined) ? null : sealedSecrets['iv'], (sealedSecrets === undefined) ? null : sealedSecrets['authTag'], now, now);

      this.addActivity(actorId, 'notification-created', 'configuration', 'succeeded', `Added notification ${input['name']}`);

      return;
    });

    return this.getNotificationTargets().find((target) => target['id'] === id);
  }

  /**
   * Lib - State - Create Passkey.
   *
   * Persists one cryptographically verified WebAuthn credential for an administrator.
   * The RP ID records the hostname the passkey belongs to.
   *
   * @param {Lib_State_Runner_CreatePasskey_AdministratorId} administratorId - Administrator id.
   * @param {Lib_State_Runner_CreatePasskey_Name}            name            - Name.
   * @param {Lib_State_Runner_CreatePasskey_RpId}            rpId            - Rp id.
   * @param {Lib_State_Runner_CreatePasskey_Credential}      credential      - Credential.
   * @param {Lib_State_Runner_CreatePasskey_ActorId}         actorId         - Actor id.
   *
   * @returns {Lib_State_Runner_CreatePasskey_Returns}
   *
   * @since 2.0.0
   */
  public createPasskey(administratorId: Lib_State_Runner_CreatePasskey_AdministratorId, name: Lib_State_Runner_CreatePasskey_Name, rpId: Lib_State_Runner_CreatePasskey_RpId, credential: Lib_State_Runner_CreatePasskey_Credential, actorId: Lib_State_Runner_CreatePasskey_ActorId): Lib_State_Runner_CreatePasskey_Returns {
    const administrator: Lib_State_Runner_CreatePasskey_Administrator = this.getStoredAdministrator(administratorId);
    const existingPasskey: Lib_State_Runner_CreatePasskey_ExistingPasskey = this.#database.prepare('SELECT id FROM administrator_passkeys WHERE id = ?').get(credential['id']);

    if (administrator === undefined) {
      return 'not-found';
    }

    if (existingPasskey !== undefined) {
      return 'conflict';
    }

    const createdAt: Lib_State_Runner_CreatePasskey_CreatedAt = new Date().toISOString();

    this.transaction(() => {
      this.#database.prepare('INSERT INTO administrator_passkeys (id, administrator_id, name, public_key, counter, transports, device_type, backed_up, created_at, last_used_at, rp_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)').run(
        credential['id'],
        administratorId,
        name,
        Buffer.from(credential['publicKey']),
        credential['counter'],
        JSON.stringify(credential['transports']),
        credential['deviceType'],
        (credential['backedUp'] === true) ? 1 : 0,
        createdAt,
        rpId,
      );

      this.addActivity(actorId, 'passkey-created', 'access', 'succeeded', `Added passkey ${name}`);

      return;
    });

    return 'created';
  }

  /**
   * Lib - State - Create Session.
   *
   * Starts a browser session and returns its cookie and CSRF values once.
   * Only their digests are stored, so a database copy cannot be replayed.
   *
   * @param {Lib_State_Runner_CreateSession_AdministratorId} administratorId - Administrator id.
   *
   * @returns {Lib_State_Runner_CreateSession_Returns}
   *
   * @since 2.0.0
   */
  public createSession(administratorId: Lib_State_Runner_CreateSession_AdministratorId): Lib_State_Runner_CreateSession_Returns {
    const sessionId: Lib_State_Runner_CreateSession_SessionId = randomUUID();
    const sessionToken: Lib_State_Runner_CreateSession_SessionToken = generateOpaqueToken('pfs_', 32);
    const csrfToken: Lib_State_Runner_CreateSession_CsrfToken = generateOpaqueToken('pfc_', 24);
    const createdAt: Lib_State_Runner_CreateSession_CreatedAt = new Date().toISOString();
    const expiresAt: Lib_State_Runner_CreateSession_ExpiresAt = new Date(Date.now() + Runner.#sessionDurationMilliseconds).toISOString();

    this.pruneExpired();

    this.#database.prepare('INSERT INTO browser_sessions (id, administrator_id, token_hash, csrf_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      sessionId,
      administratorId,
      digestValue(sessionToken),
      digestValue(csrfToken),
      createdAt,
      expiresAt,
    );

    return {
      csrfToken,
      expiresAt,
      sessionId,
      sessionToken,
    };
  }

  /**
   * Lib - State - Create Sign In Challenge.
   *
   * Records a password-verified sign-in that still needs its second factor.
   * The returned challenge is random and only its digest is stored.
   *
   * @param {Lib_State_Runner_CreateSignInChallenge_AdministratorId} administratorId - Administrator id.
   *
   * @returns {Lib_State_Runner_CreateSignInChallenge_Returns}
   *
   * @since 2.0.0
   */
  public createSignInChallenge(administratorId: Lib_State_Runner_CreateSignInChallenge_AdministratorId): Lib_State_Runner_CreateSignInChallenge_Returns {
    const challenge: Lib_State_Runner_CreateSignInChallenge_Challenge = randomBytes(32).toString('base64url');
    const createdAt: Lib_State_Runner_CreateSignInChallenge_CreatedAt = new Date().toISOString();
    const expiresAt: Lib_State_Runner_CreateSignInChallenge_ExpiresAt = new Date(Date.now() + Runner.#challengeDurationMilliseconds).toISOString();

    this.pruneExpired();

    this.#database.prepare('INSERT INTO sign_in_challenges (challenge_hash, administrator_id, failures, created_at, expires_at) VALUES (?, ?, 0, ?, ?)').run(digestValue(challenge), administratorId, createdAt, expiresAt);

    return {
      challenge,
      expiresAt,
    };
  }

  /**
   * Lib - State - Create Token.
   *
   * Generates a client credential under a new identifier and stores only its hash.
   * The raw value is returned once, and a name already in use returns undefined.
   *
   * @param {Lib_State_Runner_CreateToken_Input}   input   - Input.
   * @param {Lib_State_Runner_CreateToken_ActorId} actorId - Actor id.
   *
   * @returns {Lib_State_Runner_CreateToken_Returns}
   *
   * @since 2.0.0
   */
  public createToken(input: Lib_State_Runner_CreateToken_Input, actorId: Lib_State_Runner_CreateToken_ActorId): Lib_State_Runner_CreateToken_Returns {
    const existingToken: Lib_State_Runner_CreateToken_ExistingToken = this.#database.prepare('SELECT id FROM api_tokens WHERE name = ? COLLATE NOCASE').get(input['name']);

    if (existingToken !== undefined) {
      return undefined;
    }

    const id: Lib_State_Runner_CreateToken_Id = `tok-${randomBytes(8).toString('hex')}`;
    const personalAccessToken: Lib_State_Runner_CreateToken_PersonalAccessToken = generatePersonalAccessToken();
    const tokenHash: Lib_State_Runner_CreateToken_TokenHash = hashPersonalAccessToken(personalAccessToken);
    const createdAt: Lib_State_Runner_CreateToken_CreatedAt = new Date().toISOString();
    const scopes: Lib_State_Runner_CreateToken_Scopes = personalAccessTokenScope.options.filter((scope) => input['scopes'].includes(scope));
    const record: Lib_State_Runner_CreateToken_Record = {
      createdAt,
      ...((input['expiresAt'] === undefined || input['expiresAt'] === null) ? {} : { expiresAt: input['expiresAt'] }),
      id,
      name: input['name'],
      scopes,
      tokenHash,
    };

    this.transaction(() => {
      this.insertToken(record);

      this.addActivity(actorId, 'token-created', 'token', 'succeeded', `Created personal access token ${input['name']}`);

      return;
    });

    return {
      personalAccessToken,
      token: {
        createdAt,
        expiresAt: input['expiresAt'] ?? null,
        id,
        lastUsedAt: null,
        name: input['name'],
        scopes,
      },
    };
  }

  /**
   * Lib - State - Create Webauthn Ceremony.
   *
   * Stores one passkey challenge with the hostname and origin it was issued for.
   * The returned identifier lets the browser finish the ceremony exactly once.
   *
   * @param {Lib_State_Runner_CreateWebauthnCeremony_Ceremony} ceremony - Ceremony.
   *
   * @returns {Lib_State_Runner_CreateWebauthnCeremony_Returns}
   *
   * @since 2.0.0
   */
  public createWebauthnCeremony(ceremony: Lib_State_Runner_CreateWebauthnCeremony_Ceremony): Lib_State_Runner_CreateWebauthnCeremony_Returns {
    const ceremonyId: Lib_State_Runner_CreateWebauthnCeremony_CeremonyId = randomBytes(32).toString('base64url');
    const createdAt: Lib_State_Runner_CreateWebauthnCeremony_CreatedAt = new Date().toISOString();
    const expiresAt: Lib_State_Runner_CreateWebauthnCeremony_ExpiresAt = new Date(Date.now() + Runner.#webauthnCeremonyDurationMilliseconds).toISOString();

    this.pruneExpired();

    this.#database.prepare('INSERT INTO webauthn_ceremonies (id, kind, administrator_id, challenge, name, rp_id, origin, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      ceremonyId,
      ceremony['kind'],
      ceremony['administratorId'] ?? null,
      ceremony['challenge'],
      ceremony['name'] ?? null,
      ceremony['rpId'],
      ceremony['origin'],
      createdAt,
      expiresAt,
    );

    return ceremonyId;
  }

  /**
   * Lib - State - Delete Session.
   *
   * Signs one browser session out.
   * Deleting an unknown session is harmless.
   *
   * @param {Lib_State_Runner_DeleteSession_Id} id - Id.
   *
   * @returns {Lib_State_Runner_DeleteSession_Returns}
   *
   * @since 2.0.0
   */
  public deleteSession(id: Lib_State_Runner_DeleteSession_Id): Lib_State_Runner_DeleteSession_Returns {
    this.#database.prepare('DELETE FROM browser_sessions WHERE id = ?').run(id);

    return;
  }

  /**
   * Lib - State - Delete Sign In Challenge.
   *
   * Removes a second-factor challenge after it was used or abandoned.
   * Each challenge can therefore finish at most one sign-in.
   *
   * @param {Lib_State_Runner_DeleteSignInChallenge_Challenge} challenge - Challenge.
   *
   * @returns {Lib_State_Runner_DeleteSignInChallenge_Returns}
   *
   * @since 2.0.0
   */
  public deleteSignInChallenge(challenge: Lib_State_Runner_DeleteSignInChallenge_Challenge): Lib_State_Runner_DeleteSignInChallenge_Returns {
    this.#database.prepare('DELETE FROM sign_in_challenges WHERE challenge_hash = ?').run(digestValue(challenge));

    return;
  }

  /**
   * Lib - State - Disable Totp.
   *
   * Deletes the authenticator secret and every recovery code after password confirmation.
   * Sign-in then needs only the password or a passkey.
   *
   * @param {Lib_State_Runner_DisableTotp_AdministratorId} administratorId - Administrator id.
   * @param {Lib_State_Runner_DisableTotp_ActorId}         actorId         - Actor id.
   *
   * @returns {Lib_State_Runner_DisableTotp_Returns}
   *
   * @since 2.0.0
   */
  public disableTotp(administratorId: Lib_State_Runner_DisableTotp_AdministratorId, actorId: Lib_State_Runner_DisableTotp_ActorId): Lib_State_Runner_DisableTotp_Returns {
    if (this.hasTotp(administratorId) === false) {
      return 'not-found';
    }

    this.transaction(() => {
      this.#database.prepare('DELETE FROM administrator_totp WHERE administrator_id = ?').run(administratorId);

      this.#database.prepare('DELETE FROM recovery_codes WHERE administrator_id = ?').run(administratorId);

      this.addActivity(actorId, 'totp-disabled', 'access', 'succeeded', 'Turned off the authenticator app');

      return;
    });

    return 'disabled';
  }

  /**
   * Lib - State - Dismiss Removed Secrets.
   *
   * Clears the console notice about secrets removed with a lost encryption key.
   * Anything not entered again stays removed.
   *
   * @param {Lib_State_Runner_DismissRemovedSecrets_AdministratorId} administratorId - Administrator id.
   *
   * @returns {Lib_State_Runner_DismissRemovedSecrets_Returns}
   *
   * @since 2.0.0
   */
  public dismissRemovedSecrets(administratorId: Lib_State_Runner_DismissRemovedSecrets_AdministratorId): Lib_State_Runner_DismissRemovedSecrets_Returns {
    this.#database.prepare('DELETE FROM removed_secrets WHERE administrator_id = ? OR administrator_id IS NULL').run(administratorId);

    return;
  }

  /**
   * Lib - State - Enable Totp.
   *
   * Encrypts a confirmed authenticator secret and issues a fresh set of recovery codes.
   * The pending enrollment is removed in the same transaction.
   *
   * @param {Lib_State_Runner_EnableTotp_AdministratorId} administratorId - Administrator id.
   * @param {Lib_State_Runner_EnableTotp_Secret}          secret          - Secret.
   * @param {Lib_State_Runner_EnableTotp_InitialStep}     initialStep     - Initial step.
   * @param {Lib_State_Runner_EnableTotp_ActorId}         actorId         - Actor id.
   *
   * @returns {Lib_State_Runner_EnableTotp_Returns}
   *
   * @since 2.0.0
   */
  public enableTotp(administratorId: Lib_State_Runner_EnableTotp_AdministratorId, secret: Lib_State_Runner_EnableTotp_Secret, initialStep: Lib_State_Runner_EnableTotp_InitialStep, actorId: Lib_State_Runner_EnableTotp_ActorId): Lib_State_Runner_EnableTotp_Returns {
    const administrator: Lib_State_Runner_EnableTotp_Administrator = this.getStoredAdministrator(administratorId);

    if (administrator === undefined) {
      return undefined;
    }

    const encryptedSecret: Lib_State_Runner_EnableTotp_EncryptedSecret = encryptCredential(secret, this.#encryptionKey);
    const createdAt: Lib_State_Runner_EnableTotp_CreatedAt = new Date().toISOString();
    const recoveryCodes: Lib_State_Runner_EnableTotp_RecoveryCodes = generateRecoveryCodes();

    this.transaction(() => {
      this.#database.prepare('INSERT INTO administrator_totp (administrator_id, secret_ciphertext, secret_iv, secret_auth_tag, last_used_step, created_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(administrator_id) DO UPDATE SET secret_ciphertext = excluded.secret_ciphertext, secret_iv = excluded.secret_iv, secret_auth_tag = excluded.secret_auth_tag, last_used_step = excluded.last_used_step, created_at = excluded.created_at').run(
        administratorId,
        encryptedSecret['ciphertext'],
        encryptedSecret['iv'],
        encryptedSecret['authTag'],
        initialStep,
        createdAt,
      );

      this.#database.prepare('DELETE FROM totp_enrollments WHERE administrator_id = ?').run(administratorId);

      this.#database.prepare('DELETE FROM removed_secrets WHERE kind = \'authenticator\' AND administrator_id = ?').run(administratorId);

      this.#database.prepare('DELETE FROM recovery_codes WHERE administrator_id = ?').run(administratorId);

      for (const recoveryCode of recoveryCodes) {
        this.#database.prepare('INSERT INTO recovery_codes (administrator_id, code_hash, created_at) VALUES (?, ?, ?)').run(administratorId, digestValue(normalizeRecoveryCode(recoveryCode) ?? recoveryCode), createdAt);
      }

      this.addActivity(actorId, 'totp-enabled', 'access', 'succeeded', 'Turned on the authenticator app');

      return;
    });

    return recoveryCodes;
  }

  /**
   * Lib - State - Get Activity.
   *
   * Returns newest-first validated events without exposing database row internals.
   * The caller chooses a bounded limit for its console view.
   *
   * @param {Lib_State_Runner_GetActivity_Limit} limit - Limit.
   *
   * @returns {Lib_State_Runner_GetActivity_Returns}
   *
   * @since 2.0.0
   */
  public getActivity(limit: Lib_State_Runner_GetActivity_Limit): Lib_State_Runner_GetActivity_Returns {
    const rows: Lib_State_Runner_GetActivity_Rows = this.#database.prepare('SELECT action, actor_id AS actorId, category, created_at AS createdAt, id, outcome, summary FROM activity_events ORDER BY sequence DESC LIMIT ?').all(limit);

    return rows.map((row) => activityEvent.parse(row));
  }

  /**
   * Lib - State - Get Activity Count.
   *
   * Counts the stored activity events for the overview.
   * The history is bounded, so the count never exceeds its limit.
   *
   * @returns {Lib_State_Runner_GetActivityCount_Returns}
   *
   * @since 2.0.0
   */
  public getActivityCount(): Lib_State_Runner_GetActivityCount_Returns {
    return this.countRows('activity_events');
  }

  /**
   * Lib - State - Get Administrator.
   *
   * Returns safe account metadata for the overview, or undefined before setup.
   * Password hashes remain private to authentication methods.
   *
   * @returns {Lib_State_Runner_GetAdministrator_Returns}
   *
   * @since 2.0.0
   */
  public getAdministrator(): Lib_State_Runner_GetAdministrator_Returns {
    const administrator: Lib_State_Runner_GetAdministrator_Administrator = this.getStoredAdministrator();

    if (administrator === undefined) {
      return undefined;
    }

    return {
      createdAt: administrator['createdAt'],
      id: administrator['id'],
      updatedAt: administrator['updatedAt'],
      username: administrator['username'],
    };
  }

  /**
   * Lib - State - Get Administrator By ID.
   *
   * Returns safe account metadata for one administrator identifier.
   * Unknown identifiers return undefined.
   *
   * @param {Lib_State_Runner_GetAdministratorById_Id} id - Id.
   *
   * @returns {Lib_State_Runner_GetAdministratorById_Returns}
   *
   * @since 2.0.0
   */
  public getAdministratorById(id: Lib_State_Runner_GetAdministratorById_Id): Lib_State_Runner_GetAdministratorById_Returns {
    const administrator: Lib_State_Runner_GetAdministratorById_Administrator = this.getStoredAdministrator(id);

    if (administrator === undefined) {
      return undefined;
    }

    return {
      createdAt: administrator['createdAt'],
      id: administrator['id'],
      updatedAt: administrator['updatedAt'],
      username: administrator['username'],
    };
  }

  /**
   * Lib - State - Get Administrator Security.
   *
   * Returns safe enrollment metadata for the signed-in account page.
   * Verification keys, counters, encrypted secrets, and code digests remain internal.
   *
   * @param {Lib_State_Runner_GetAdministratorSecurity_AdministratorId} administratorId - Administrator id.
   *
   * @returns {Lib_State_Runner_GetAdministratorSecurity_Returns}
   *
   * @since 2.0.0
   */
  public getAdministratorSecurity(administratorId: Lib_State_Runner_GetAdministratorSecurity_AdministratorId): Lib_State_Runner_GetAdministratorSecurity_Returns {
    const administrator: Lib_State_Runner_GetAdministratorSecurity_Administrator = this.getStoredAdministrator(administratorId);
    const passkeys: Lib_State_Runner_GetAdministratorSecurity_Passkeys = this.getPasskeys(administratorId);
    const recoveryCodeRow: Lib_State_Runner_GetAdministratorSecurity_RecoveryCodeRow = this.#database.prepare('SELECT COUNT(*) AS count FROM recovery_codes WHERE administrator_id = ?').get(administratorId);

    return {
      passkeys: passkeys.map((passkey) => ({
        createdAt: passkey['createdAt'],
        hostname: passkey['rpId'] ?? null,
        id: passkey['id'],
        lastUsedAt: passkey['lastUsedAt'] ?? null,
        name: passkey['name'],
      })),
      recoveryCodesRemaining: Number((recoveryCodeRow === undefined) ? 0 : recoveryCodeRow['count']),
      totpEnabled: this.hasTotp(administratorId),
      username: (administrator === undefined) ? '' : administrator['username'],
    };
  }

  /**
   * Lib - State - Get Connection.
   *
   * Returns connection metadata and its authentication method without the credential.
   * It also says whether a credential is saved, since a lost encryption key removes it.
   *
   * @returns {Lib_State_Runner_GetConnection_Returns}
   *
   * @since 2.0.0
   */
  public getConnection(): Lib_State_Runner_GetConnection_Returns {
    const row: Lib_State_Runner_GetConnection_Row = this.#database.prepare('SELECT credential_auth_tag AS credentialAuthTag, credential_ciphertext AS credentialCiphertext, credential_iv AS credentialIv, credential_type AS credentialType, pfsense_ssh_ip AS pfsenseSshIp, pfsense_ssh_port AS pfsenseSshPort, pfsense_username AS pfsenseUsername FROM pfsense_connection WHERE id = 1').get();

    if (row === undefined) {
      return undefined;
    }

    const storedConnectionValue: Lib_State_Runner_GetConnection_StoredConnection = storedConnection.parse(row);

    return {
      credentialSaved: storedConnectionValue['credentialCiphertext'] !== null,
      credentialType: storedConnectionValue['credentialType'],
      pfsenseSshIp: storedConnectionValue['pfsenseSshIp'],
      pfsenseSshPort: storedConnectionValue['pfsenseSshPort'],
      pfsenseUsername: storedConnectionValue['pfsenseUsername'],
    };
  }

  /**
   * Lib - State - Get Environment Imports.
   *
   * Reports what the deprecated environment variables filled in during this start.
   * The connection flag stays false when nothing was imported.
   *
   * @returns {Lib_State_Runner_GetEnvironmentImports_Returns}
   *
   * @since 2.0.0
   */
  public getEnvironmentImports(): Lib_State_Runner_GetEnvironmentImports_Returns {
    return {
      connection: this.#environmentImports['connection'],
    };
  }

  /**
   * Lib - State - Get Key Replacement.
   *
   * Names what this start removed because the encryption key file was missing.
   * The list is empty when the key was there or nothing depended on it.
   *
   * @returns {Lib_State_Runner_GetKeyReplacement_Returns}
   *
   * @since 2.0.0
   */
  public getKeyReplacement(): Lib_State_Runner_GetKeyReplacement_Returns {
    return [...this.#keyReplacement];
  }

  /**
   * Lib - State - Get Notification Deliveries.
   *
   * Lists the destinations that listen to an event, with their secrets opened for sending.
   * Destinations waiting for a secret removed with a lost key are left out.
   *
   * @param {Lib_State_Runner_GetNotificationDeliveries_Event} event - Event.
   *
   * @returns {Lib_State_Runner_GetNotificationDeliveries_Returns}
   *
   * @since 2.0.0
   */
  public getNotificationDeliveries(event: Lib_State_Runner_GetNotificationDeliveries_Event): Lib_State_Runner_GetNotificationDeliveries_Returns {
    return this.getStoredNotificationTargets()
      .filter((target) => target['events'].includes(event) && target['missingSecrets'].length === 0)
      .map((target) => ({
        id: target['id'],
        name: target['name'],
        target: {
          secrets: this.openNotificationSecrets(target),
          service: target['service'],
          settings: target['settings'],
        },
      }));
  }

  /**
   * Lib - State - Get Notification Delivery.
   *
   * Opens one destination for the Send test button.
   * A destination waiting for a removed secret reports that instead of sending.
   *
   * @param {Lib_State_Runner_GetNotificationDelivery_Id} id - Id.
   *
   * @returns {Lib_State_Runner_GetNotificationDelivery_Returns}
   *
   * @since 2.0.0
   */
  public getNotificationDelivery(id: Lib_State_Runner_GetNotificationDelivery_Id): Lib_State_Runner_GetNotificationDelivery_Returns {
    const target: Lib_State_Runner_GetNotificationDelivery_Target = this.getStoredNotificationTargets().find((storedTarget) => storedTarget['id'] === id);

    if (target === undefined) {
      return 'not-found';
    }

    if (target['missingSecrets'].length > 0) {
      return 'secrets-missing';
    }

    return {
      id: target['id'],
      name: target['name'],
      target: {
        secrets: this.openNotificationSecrets(target),
        service: target['service'],
        settings: target['settings'],
      },
    };
  }

  /**
   * Lib - State - Get Notification Targets.
   *
   * Lists every destination, newest first, without any secret value.
   * Saved secret fields are named so the dialog can offer to keep them.
   *
   * @returns {Lib_State_Runner_GetNotificationTargets_Returns}
   *
   * @since 2.0.0
   */
  public getNotificationTargets(): Lib_State_Runner_GetNotificationTargets_Returns {
    return this.getStoredNotificationTargets().map((target) => ({
      createdAt: target['createdAt'],
      events: target['events'],
      id: target['id'],
      lastAttemptAt: target['lastAttemptAt'],
      lastError: target['lastError'],
      name: target['name'],
      secrets: Object.fromEntries(target['secretFields'].map((field) => [
        field,
        true as const,
      ])),
      secretsMissing: target['missingSecrets'],
      service: target['service'],
      settings: target['settings'],
      updatedAt: target['updatedAt'],
    }));
  }

  /**
   * Lib - State - Get Passkey.
   *
   * Resolves one full public credential for WebAuthn assertion verification.
   * Missing identifiers return undefined without disclosing account existence.
   *
   * @param {Lib_State_Runner_GetPasskey_Id} id - Id.
   *
   * @returns {Lib_State_Runner_GetPasskey_Returns}
   *
   * @since 2.0.0
   */
  public getPasskey(id: Lib_State_Runner_GetPasskey_Id): Lib_State_Runner_GetPasskey_Returns {
    return this.getPasskeys().find((passkey) => passkey['id'] === id);
  }

  /**
   * Lib - State - Get Passkeys.
   *
   * Reconstructs verified WebAuthn credentials from their normalized SQLite rows.
   * An optional administrator identifier narrows the list to one account.
   *
   * @param {Lib_State_Runner_GetPasskeys_AdministratorId} [administratorId] - Administrator id.
   *
   * @returns {Lib_State_Runner_GetPasskeys_Returns}
   *
   * @since 2.0.0
   */
  public getPasskeys(administratorId?: Lib_State_Runner_GetPasskeys_AdministratorId): Lib_State_Runner_GetPasskeys_Returns {
    const rows: Lib_State_Runner_GetPasskeys_Rows = (administratorId === undefined) ? this.#database.prepare('SELECT administrator_id AS administratorId, backed_up AS backedUp, counter, created_at AS createdAt, device_type AS deviceType, id, last_used_at AS lastUsedAt, name, public_key AS publicKey, rp_id AS rpId, transports FROM administrator_passkeys ORDER BY created_at, id').all() as Lib_State_Runner_GetPasskeys_Rows : this.#database.prepare('SELECT administrator_id AS administratorId, backed_up AS backedUp, counter, created_at AS createdAt, device_type AS deviceType, id, last_used_at AS lastUsedAt, name, public_key AS publicKey, rp_id AS rpId, transports FROM administrator_passkeys WHERE administrator_id = ? ORDER BY created_at, id').all(administratorId) as Lib_State_Runner_GetPasskeys_Rows;

    return rows.map((row) => {
      let transports: Lib_State_Runner_GetPasskeys_Transports = undefined;

      try {
        transports = JSON.parse(row['transports']);
      } catch {
        throw new Error('A stored administrator passkey is invalid.');
      }

      return storedAdministratorPasskey.parse({
        administratorId: row['administratorId'],
        backedUp: row['backedUp'] === 1,
        counter: row['counter'],
        createdAt: row['createdAt'],
        deviceType: row['deviceType'],
        id: row['id'],
        lastUsedAt: row['lastUsedAt'],
        name: row['name'],
        publicKey: new Uint8Array(row['publicKey']),
        rpId: row['rpId'],
        transports,
      });
    }).map((passkey) => ({
      administratorId: passkey['administratorId'],
      backedUp: passkey['backedUp'],
      counter: passkey['counter'],
      createdAt: passkey['createdAt'],
      deviceType: passkey['deviceType'],
      id: passkey['id'],
      ...((passkey['lastUsedAt'] === null) ? {} : { lastUsedAt: passkey['lastUsedAt'] }),
      name: passkey['name'],
      publicKey: new Uint8Array(passkey['publicKey']),
      ...((passkey['rpId'] === null) ? {} : { rpId: passkey['rpId'] }),
      transports: [...passkey['transports']],
    }));
  }

  /**
   * Lib - State - Get pfSense Connection.
   *
   * Returns the decrypted SSH settings for the adapter, or undefined while any is missing.
   * Credentials stay in process memory only for the duration of one action.
   *
   * @returns {Lib_State_Runner_GetPfsenseConnection_Returns}
   *
   * @since 2.0.0
   */
  public getPfsenseConnection(): Lib_State_Runner_GetPfsenseConnection_Returns {
    return this.getStoredConnection();
  }

  /**
   * Lib - State - Get Removed Secrets.
   *
   * Lists what a lost encryption key took that this account can enter again, oldest first.
   * Each entry stays until it is entered again or the notice is dismissed.
   *
   * @param {Lib_State_Runner_GetRemovedSecrets_AdministratorId} administratorId - Administrator id.
   *
   * @returns {Lib_State_Runner_GetRemovedSecrets_Returns}
   *
   * @since 2.0.0
   */
  public getRemovedSecrets(administratorId: Lib_State_Runner_GetRemovedSecrets_AdministratorId): Lib_State_Runner_GetRemovedSecrets_Returns {
    const rows: Lib_State_Runner_GetRemovedSecrets_Rows = this.#database.prepare('SELECT removed_secrets.credential_type AS credentialType, removed_secrets.kind AS kind, notification_targets.name AS name, removed_secrets.notification_id AS notificationId, removed_secrets.removed_at AS removedAt FROM removed_secrets LEFT JOIN notification_targets ON notification_targets.id = removed_secrets.notification_id WHERE removed_secrets.administrator_id = ? OR removed_secrets.administrator_id IS NULL ORDER BY removed_secrets.removed_at, removed_secrets.kind, notification_targets.name').all(administratorId);

    return rows.map((row) => {
      const removedSecret: Lib_State_Runner_GetRemovedSecrets_RemovedSecret = storedRemovedSecret.parse(row);

      return {
        ...((removedSecret['credentialType'] === null) ? {} : { credentialType: removedSecret['credentialType'] }),
        kind: removedSecret['kind'],
        ...((removedSecret['name'] === null || removedSecret['notificationId'] === null) ? {} : {
          name: removedSecret['name'],
          notificationId: removedSecret['notificationId'],
        }),
        removedAt: removedSecret['removedAt'],
      };
    });
  }

  /**
   * Lib - State - Get Session.
   *
   * Resolves an opaque session cookie to its stored, unexpired browser session.
   * Expired sessions are deleted when they are presented.
   *
   * @param {Lib_State_Runner_GetSession_SessionToken} sessionToken - Session token.
   *
   * @returns {Lib_State_Runner_GetSession_Returns}
   *
   * @since 2.0.0
   */
  public getSession(sessionToken: Lib_State_Runner_GetSession_SessionToken): Lib_State_Runner_GetSession_Returns {
    const now: Lib_State_Runner_GetSession_Now = new Date().toISOString();
    const row: Lib_State_Runner_GetSession_Row = this.#database.prepare('SELECT browser_sessions.administrator_id AS administratorId, browser_sessions.csrf_hash AS csrfHash, browser_sessions.expires_at AS expiresAt, browser_sessions.id AS id, administrators.username AS username FROM browser_sessions JOIN administrators ON administrators.id = browser_sessions.administrator_id WHERE browser_sessions.token_hash = ?').get(digestValue(sessionToken)) as Lib_State_Runner_GetSession_Row;

    if (row === undefined) {
      return undefined;
    }

    if (row['expiresAt'] <= now) {
      this.deleteSession(row['id']);

      return undefined;
    }

    return {
      administratorId: row['administratorId'],
      csrfHash: row['csrfHash'],
      expiresAt: row['expiresAt'],
      id: row['id'],
      username: row['username'],
    };
  }

  /**
   * Lib - State - Get Setup Status.
   *
   * Reports whether the installation still needs its first account.
   * The response carries the code's expiry but never the code itself.
   *
   * @returns {Lib_State_Runner_GetSetupStatus_Returns}
   *
   * @since 2.0.0
   */
  public getSetupStatus(): Lib_State_Runner_GetSetupStatus_Returns {
    if (this.hasAdministrator() === true) {
      return {
        claimRequired: false,
      };
    }

    const row: Lib_State_Runner_GetSetupStatus_Row = this.#database.prepare('SELECT expires_at AS expiresAt FROM setup_claims WHERE id = 1').get() as Lib_State_Runner_GetSetupStatus_Row;

    return {
      claimRequired: true,
      ...((row === undefined) ? {} : { claimExpiresAt: row['expiresAt'] }),
    };
  }

  /**
   * Lib - State - Get Sign In Challenge.
   *
   * Resolves an unexpired second-factor challenge to its administrator.
   * Unknown and expired challenges both return undefined.
   *
   * @param {Lib_State_Runner_GetSignInChallenge_Challenge} challenge - Challenge.
   *
   * @returns {Lib_State_Runner_GetSignInChallenge_Returns}
   *
   * @since 2.0.0
   */
  public getSignInChallenge(challenge: Lib_State_Runner_GetSignInChallenge_Challenge): Lib_State_Runner_GetSignInChallenge_Returns {
    const row: Lib_State_Runner_GetSignInChallenge_Row = this.#database.prepare('SELECT administrator_id AS administratorId FROM sign_in_challenges WHERE challenge_hash = ? AND expires_at > ? AND failures < ?').get(digestValue(challenge), new Date().toISOString(), Runner.#challengeFailureLimit) as Lib_State_Runner_GetSignInChallenge_Row;

    if (row === undefined) {
      return undefined;
    }

    return {
      administratorId: row['administratorId'],
    };
  }

  /**
   * Lib - State - Get Tokens.
   *
   * Projects database records into safe client metadata without token hashes, newest first.
   * Each token includes its name and when it was last used, or null when it never was.
   *
   * @returns {Lib_State_Runner_GetTokens_Returns}
   *
   * @since 2.0.0
   */
  public getTokens(): Lib_State_Runner_GetTokens_Returns {
    const metadataRows: Lib_State_Runner_GetTokens_MetadataRows = this.#database.prepare('SELECT id, last_used_at AS lastUsedAt, name FROM api_tokens').all() as Lib_State_Runner_GetTokens_MetadataRows;
    const lastUsedTimes: Lib_State_Runner_GetTokens_LastUsedTimes = new Map(metadataRows.map((row) => [
      row['id'],
      row['lastUsedAt'],
    ]));
    const names: Lib_State_Runner_GetTokens_Names = new Map(metadataRows.map((row) => [
      row['id'],
      row['name'],
    ]));

    return this.getStoredTokens().map((personalAccessToken) => ({
      createdAt: personalAccessToken['createdAt'] ?? new Date(0).toISOString(),
      expiresAt: personalAccessToken['expiresAt'] ?? null,
      id: personalAccessToken['id'],
      lastUsedAt: lastUsedTimes.get(personalAccessToken['id']) ?? null,
      name: names.get(personalAccessToken['id']) ?? personalAccessToken['id'],
      scopes: [...personalAccessToken['scopes']],
    }));
  }

  /**
   * Lib - State - Get Totp Enrollment.
   *
   * Returns the decrypted pending authenticator secret while setup is in progress.
   * Expired enrollments return undefined.
   *
   * @param {Lib_State_Runner_GetTotpEnrollment_AdministratorId} administratorId - Administrator id.
   *
   * @returns {Lib_State_Runner_GetTotpEnrollment_Returns}
   *
   * @since 2.0.0
   */
  public getTotpEnrollment(administratorId: Lib_State_Runner_GetTotpEnrollment_AdministratorId): Lib_State_Runner_GetTotpEnrollment_Returns {
    const row: Lib_State_Runner_GetTotpEnrollment_Row = this.#database.prepare('SELECT secret_auth_tag AS authTag, secret_ciphertext AS ciphertext, secret_iv AS iv FROM totp_enrollments WHERE administrator_id = ? AND expires_at > ?').get(administratorId, new Date().toISOString()) as Lib_State_Runner_GetTotpEnrollment_Row;

    if (row === undefined) {
      return undefined;
    }

    return decryptCredential(row, this.#encryptionKey);
  }

  /**
   * Lib - State - Get Webauthn Rp Name.
   *
   * Returns the display name shown in passkey prompts.
   * It defaults to pfSense Actions and never affects which hostname a passkey uses.
   *
   * @returns {Lib_State_Runner_GetWebauthnRpName_Returns}
   *
   * @since 2.0.0
   */
  public getWebauthnRpName(): Lib_State_Runner_GetWebauthnRpName_Returns {
    return this.#environment['adminWebauthnRpName'];
  }

  /**
   * Lib - State - Has Administrator.
   *
   * Reports whether first-run setup already created the local account.
   * Until it has, the console shows the setup screen.
   *
   * @returns {Lib_State_Runner_HasAdministrator_Returns}
   *
   * @since 2.0.0
   */
  public hasAdministrator(): Lib_State_Runner_HasAdministrator_Returns {
    return this.countRows('administrators') > 0;
  }

  /**
   * Lib - State - Has Connection.
   *
   * Reports whether a pfSense SSH connection has been saved.
   * Actions answer with a clear error until one exists.
   *
   * @returns {Lib_State_Runner_HasConnection_Returns}
   *
   * @since 2.0.0
   */
  public hasConnection(): Lib_State_Runner_HasConnection_Returns {
    return this.countRows('pfsense_connection') > 0;
  }

  /**
   * Lib - State - Has Totp.
   *
   * Checks whether an administrator has a completed encrypted authenticator enrollment.
   * Pending enrollments never count as turned on.
   *
   * @param {Lib_State_Runner_HasTotp_AdministratorId} administratorId - Administrator id.
   *
   * @returns {Lib_State_Runner_HasTotp_Returns}
   *
   * @since 2.0.0
   */
  public hasTotp(administratorId: Lib_State_Runner_HasTotp_AdministratorId): Lib_State_Runner_HasTotp_Returns {
    const row: Lib_State_Runner_HasTotp_Row = this.#database.prepare('SELECT administrator_id FROM administrator_totp WHERE administrator_id = ?').get(administratorId);

    return row !== undefined;
  }

  /**
   * Lib - State - Prepare Setup Claim.
   *
   * Issues a fresh setup code while no account exists, or clears old codes once one does.
   * The caller prints the returned code to the container log.
   *
   * @returns {Lib_State_Runner_PrepareSetupClaim_Returns}
   *
   * @since 2.0.0
   */
  public prepareSetupClaim(): Lib_State_Runner_PrepareSetupClaim_Returns {
    if (this.hasAdministrator() === true) {
      this.#database.prepare('DELETE FROM setup_claims').run();

      return undefined;
    }

    const code: Lib_State_Runner_PrepareSetupClaim_Code = generateSetupCode();
    const expiresAt: Lib_State_Runner_PrepareSetupClaim_ExpiresAt = new Date(Date.now() + Runner.#setupClaimDurationMilliseconds).toISOString();

    this.#database.prepare('INSERT INTO setup_claims (id, code_hash, expires_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET code_hash = excluded.code_hash, expires_at = excluded.expires_at').run(digestValue(code), expiresAt);

    return {
      code,
      expiresAt,
    };
  }

  /**
   * Lib - State - Record Activity.
   *
   * Persists one curated event and prunes older rows in the same transaction.
   * Callers provide summaries that exclude targets, payloads, and secret material.
   *
   * @param {Lib_State_Runner_RecordActivity_ActorId}  actorId  - Actor id.
   * @param {Lib_State_Runner_RecordActivity_Action}   action   - Action.
   * @param {Lib_State_Runner_RecordActivity_Category} category - Category.
   * @param {Lib_State_Runner_RecordActivity_Outcome}  outcome  - Outcome.
   * @param {Lib_State_Runner_RecordActivity_Summary}  summary  - Summary.
   *
   * @returns {Lib_State_Runner_RecordActivity_Returns}
   *
   * @since 2.0.0
   */
  public recordActivity(actorId: Lib_State_Runner_RecordActivity_ActorId, action: Lib_State_Runner_RecordActivity_Action, category: Lib_State_Runner_RecordActivity_Category, outcome: Lib_State_Runner_RecordActivity_Outcome, summary: Lib_State_Runner_RecordActivity_Summary): Lib_State_Runner_RecordActivity_Returns {
    this.transaction(() => {
      this.addActivity(actorId, action, category, outcome, summary);

      return;
    });

    return;
  }

  /**
   * Lib - State - Record Notification Attempt.
   *
   * Stores when a destination was last sent to and why it failed, if it did.
   * A successful send clears the previous error.
   *
   * @param {Lib_State_Runner_RecordNotificationAttempt_Id}           id           - Id.
   * @param {Lib_State_Runner_RecordNotificationAttempt_ErrorMessage} errorMessage - Error message.
   *
   * @returns {Lib_State_Runner_RecordNotificationAttempt_Returns}
   *
   * @since 2.0.0
   */
  public recordNotificationAttempt(id: Lib_State_Runner_RecordNotificationAttempt_Id, errorMessage: Lib_State_Runner_RecordNotificationAttempt_ErrorMessage): Lib_State_Runner_RecordNotificationAttempt_Returns {
    this.#database.prepare('UPDATE notification_targets SET last_attempt_at = ?, last_error = ? WHERE id = ?').run(new Date().toISOString(), errorMessage, id);

    return;
  }

  /**
   * Lib - State - Record Sign In Challenge Failure.
   *
   * Counts one wrong second-factor code against its challenge.
   * Returns true when this failure was the fifth and the challenge stopped working.
   *
   * @param {Lib_State_Runner_RecordSignInChallengeFailure_Challenge} challenge - Challenge.
   *
   * @returns {Lib_State_Runner_RecordSignInChallengeFailure_Returns}
   *
   * @since 2.0.0
   */
  public recordSignInChallengeFailure(challenge: Lib_State_Runner_RecordSignInChallengeFailure_Challenge): Lib_State_Runner_RecordSignInChallengeFailure_Returns {
    const challengeHash: Lib_State_Runner_RecordSignInChallengeFailure_ChallengeHash = digestValue(challenge);

    this.#database.prepare('UPDATE sign_in_challenges SET failures = failures + 1 WHERE challenge_hash = ?').run(challengeHash);

    const result: Lib_State_Runner_RecordSignInChallengeFailure_Result = this.#database.prepare('DELETE FROM sign_in_challenges WHERE challenge_hash = ? AND failures >= ?').run(challengeHash, Runner.#challengeFailureLimit);

    return Number(result['changes']) === 1;
  }

  /**
   * Lib - State - Remove Notification Target.
   *
   * Deletes one destination so its alerts stop right away.
   * A lost-key notice item for it goes with it.
   *
   * @param {Lib_State_Runner_RemoveNotificationTarget_Id}      id      - Id.
   * @param {Lib_State_Runner_RemoveNotificationTarget_ActorId} actorId - Actor id.
   *
   * @returns {Lib_State_Runner_RemoveNotificationTarget_Returns}
   *
   * @since 2.0.0
   */
  public removeNotificationTarget(id: Lib_State_Runner_RemoveNotificationTarget_Id, actorId: Lib_State_Runner_RemoveNotificationTarget_ActorId): Lib_State_Runner_RemoveNotificationTarget_Returns {
    const existingTarget: Lib_State_Runner_RemoveNotificationTarget_ExistingTarget = this.#database.prepare('SELECT name FROM notification_targets WHERE id = ?').get(id) as Lib_State_Runner_RemoveNotificationTarget_ExistingTarget;

    if (existingTarget === undefined) {
      return 'not-found';
    }

    this.transaction(() => {
      this.#database.prepare('DELETE FROM removed_secrets WHERE kind = \'notification\' AND notification_id = ?').run(id);

      this.#database.prepare('DELETE FROM notification_targets WHERE id = ?').run(id);

      this.addActivity(actorId, 'notification-removed', 'configuration', 'succeeded', `Removed notification ${existingTarget['name']}`);

      return;
    });

    return 'removed';
  }

  /**
   * Lib - State - Remove Passkey.
   *
   * Deletes one administrator-owned credential after the route confirmed the password.
   * A credential cannot be removed through an account it does not belong to.
   *
   * @param {Lib_State_Runner_RemovePasskey_AdministratorId} administratorId - Administrator id.
   * @param {Lib_State_Runner_RemovePasskey_Id}              id              - Id.
   * @param {Lib_State_Runner_RemovePasskey_ActorId}         actorId         - Actor id.
   *
   * @returns {Lib_State_Runner_RemovePasskey_Returns}
   *
   * @since 2.0.0
   */
  public removePasskey(administratorId: Lib_State_Runner_RemovePasskey_AdministratorId, id: Lib_State_Runner_RemovePasskey_Id, actorId: Lib_State_Runner_RemovePasskey_ActorId): Lib_State_Runner_RemovePasskey_Returns {
    const passkey: Lib_State_Runner_RemovePasskey_Passkey = this.getPasskey(id);

    if (passkey === undefined || passkey['administratorId'] !== administratorId) {
      return 'not-found';
    }

    this.transaction(() => {
      this.#database.prepare('DELETE FROM administrator_passkeys WHERE id = ? AND administrator_id = ?').run(id, administratorId);

      this.addActivity(actorId, 'passkey-removed', 'access', 'succeeded', `Removed passkey ${passkey['name']}`);

      return;
    });

    return 'removed';
  }

  /**
   * Lib - State - Remove Token.
   *
   * Revokes one API client credential without affecting browser administrators.
   * Foreign-key cleanup removes the associated scope rows atomically.
   *
   * @param {Lib_State_Runner_RemoveToken_Id}      id      - Id.
   * @param {Lib_State_Runner_RemoveToken_ActorId} actorId - Actor id.
   *
   * @returns {Lib_State_Runner_RemoveToken_Returns}
   *
   * @since 2.0.0
   */
  public removeToken(id: Lib_State_Runner_RemoveToken_Id, actorId: Lib_State_Runner_RemoveToken_ActorId): Lib_State_Runner_RemoveToken_Returns {
    const existingToken: Lib_State_Runner_RemoveToken_ExistingToken = this.#database.prepare('SELECT name FROM api_tokens WHERE id = ?').get(id) as Lib_State_Runner_RemoveToken_ExistingToken;

    if (existingToken === undefined) {
      return 'not-found';
    }

    this.transaction(() => {
      this.#database.prepare('DELETE FROM api_tokens WHERE id = ?').run(id);

      this.addActivity(actorId, 'token-revoked', 'token', 'succeeded', `Revoked personal access token ${existingToken['name']}`);

      return;
    });

    return 'removed';
  }

  /**
   * Lib - State - Replace Recovery Codes.
   *
   * Issues ten new recovery codes and makes every older code stop working.
   * The new codes are returned once and stored only as digests.
   *
   * @param {Lib_State_Runner_ReplaceRecoveryCodes_AdministratorId} administratorId - Administrator id.
   * @param {Lib_State_Runner_ReplaceRecoveryCodes_ActorId}         actorId         - Actor id.
   *
   * @returns {Lib_State_Runner_ReplaceRecoveryCodes_Returns}
   *
   * @since 2.0.0
   */
  public replaceRecoveryCodes(administratorId: Lib_State_Runner_ReplaceRecoveryCodes_AdministratorId, actorId: Lib_State_Runner_ReplaceRecoveryCodes_ActorId): Lib_State_Runner_ReplaceRecoveryCodes_Returns {
    if (this.hasTotp(administratorId) === false) {
      return undefined;
    }

    const recoveryCodes: Lib_State_Runner_EnableTotp_RecoveryCodes = generateRecoveryCodes();
    const createdAt: Lib_State_Runner_EnableTotp_CreatedAt = new Date().toISOString();

    this.transaction(() => {
      this.#database.prepare('DELETE FROM recovery_codes WHERE administrator_id = ?').run(administratorId);

      for (const recoveryCode of recoveryCodes) {
        this.#database.prepare('INSERT INTO recovery_codes (administrator_id, code_hash, created_at) VALUES (?, ?, ?)').run(administratorId, digestValue(normalizeRecoveryCode(recoveryCode) ?? recoveryCode), createdAt);
      }

      this.addActivity(actorId, 'recovery-codes-replaced', 'access', 'succeeded', 'Made new recovery codes');

      return;
    });

    return recoveryCodes;
  }

  /**
   * Lib - State - Start Totp Enrollment.
   *
   * Stores a new authenticator secret, encrypted, until its first code confirms it.
   * Starting again replaces any unfinished enrollment.
   *
   * @param {Lib_State_Runner_StartTotpEnrollment_AdministratorId} administratorId - Administrator id.
   * @param {Lib_State_Runner_StartTotpEnrollment_Secret}          secret          - Secret.
   *
   * @returns {Lib_State_Runner_StartTotpEnrollment_Returns}
   *
   * @since 2.0.0
   */
  public startTotpEnrollment(administratorId: Lib_State_Runner_StartTotpEnrollment_AdministratorId, secret: Lib_State_Runner_StartTotpEnrollment_Secret): Lib_State_Runner_StartTotpEnrollment_Returns {
    const encryptedSecret: Lib_State_Runner_StartTotpEnrollment_EncryptedSecret = encryptCredential(secret, this.#encryptionKey);
    const createdAt: Lib_State_Runner_StartTotpEnrollment_CreatedAt = new Date().toISOString();
    const expiresAt: Lib_State_Runner_StartTotpEnrollment_ExpiresAt = new Date(Date.now() + Runner.#enrollmentDurationMilliseconds).toISOString();

    this.pruneExpired();

    this.#database.prepare('INSERT INTO totp_enrollments (administrator_id, secret_ciphertext, secret_iv, secret_auth_tag, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(administrator_id) DO UPDATE SET secret_ciphertext = excluded.secret_ciphertext, secret_iv = excluded.secret_iv, secret_auth_tag = excluded.secret_auth_tag, created_at = excluded.created_at, expires_at = excluded.expires_at').run(
      administratorId,
      encryptedSecret['ciphertext'],
      encryptedSecret['iv'],
      encryptedSecret['authTag'],
      createdAt,
      expiresAt,
    );

    return expiresAt;
  }

  /**
   * Lib - State - Take Webauthn Ceremony.
   *
   * Removes and returns one unexpired passkey ceremony of the expected kind.
   * Deleting while reading guarantees each challenge is answered at most once.
   *
   * @param {Lib_State_Runner_TakeWebauthnCeremony_CeremonyId} ceremonyId - Ceremony id.
   * @param {Lib_State_Runner_TakeWebauthnCeremony_Kind}       kind       - Kind.
   *
   * @returns {Lib_State_Runner_TakeWebauthnCeremony_Returns}
   *
   * @since 2.0.0
   */
  public takeWebauthnCeremony(ceremonyId: Lib_State_Runner_TakeWebauthnCeremony_CeremonyId, kind: Lib_State_Runner_TakeWebauthnCeremony_Kind): Lib_State_Runner_TakeWebauthnCeremony_Returns {
    const row: Lib_State_Runner_TakeWebauthnCeremony_Row = this.#database.prepare('DELETE FROM webauthn_ceremonies WHERE id = ? AND kind = ? RETURNING administrator_id AS administratorId, challenge, expires_at AS expiresAt, name, origin, rp_id AS rpId').get(ceremonyId, kind) as Lib_State_Runner_TakeWebauthnCeremony_Row;

    if (row === undefined || row['expiresAt'] <= new Date().toISOString()) {
      return undefined;
    }

    return {
      ...((row['administratorId'] === null) ? {} : { administratorId: row['administratorId'] }),
      challenge: row['challenge'],
      ...((row['name'] === null) ? {} : { name: row['name'] }),
      origin: row['origin'],
      rpId: row['rpId'],
    };
  }

  /**
   * Lib - State - Update Connection.
   *
   * Encrypts and commits a connection that already passed a live SSH test.
   * Only sealed credential fields are written to SQLite.
   *
   * @param {Lib_State_Runner_UpdateConnection_Connection} connection - Connection.
   * @param {Lib_State_Runner_UpdateConnection_ActorId}    actorId    - Actor id.
   *
   * @returns {Lib_State_Runner_UpdateConnection_Returns}
   *
   * @since 2.0.0
   */
  public updateConnection(connection: Lib_State_Runner_UpdateConnection_Connection, actorId: Lib_State_Runner_UpdateConnection_ActorId): Lib_State_Runner_UpdateConnection_Returns {
    this.transaction(() => {
      this.insertConnection(connection);

      this.#database.prepare('DELETE FROM removed_secrets WHERE kind = \'pfsense-credential\'').run();

      this.addActivity(actorId, 'connection-updated', 'configuration', 'succeeded', 'Updated the pfSense SSH connection');

      return;
    });

    return;
  }

  /**
   * Lib - State - Update Notification Target.
   *
   * Changes a destination's name, events, and settings, keeping saved secrets left blank.
   * Explicitly removed secrets are dropped, including optional ones a lost key removed.
   *
   * @param {Lib_State_Runner_UpdateNotificationTarget_Id}      id      - Id.
   * @param {Lib_State_Runner_UpdateNotificationTarget_Input}   input   - Input.
   * @param {Lib_State_Runner_UpdateNotificationTarget_ActorId} actorId - Actor id.
   *
   * @returns {Lib_State_Runner_UpdateNotificationTarget_Returns}
   *
   * @since 2.0.0
   */
  public updateNotificationTarget(id: Lib_State_Runner_UpdateNotificationTarget_Id, input: Lib_State_Runner_UpdateNotificationTarget_Input, actorId: Lib_State_Runner_UpdateNotificationTarget_ActorId): Lib_State_Runner_UpdateNotificationTarget_Returns {
    const existingTarget: Lib_State_Runner_UpdateNotificationTarget_ExistingTarget = this.getStoredNotificationTargets().find((target) => target['id'] === id);

    if (existingTarget === undefined) {
      return 'not-found';
    }

    const conflictingTarget: Lib_State_Runner_UpdateNotificationTarget_ConflictingTarget = this.#database.prepare('SELECT id FROM notification_targets WHERE name = ? COLLATE NOCASE AND id != ?').get(input['name'], id);

    if (conflictingTarget !== undefined) {
      return 'name-taken';
    }

    const secrets: Lib_State_Runner_UpdateNotificationTarget_Secrets = {
      ...this.openNotificationSecrets(existingTarget),
      ...input['secrets'],
    };
    const clearSecrets: Lib_State_Runner_UpdateNotificationTarget_ClearSecrets = input['clearSecrets'] ?? [];

    for (const clearSecret of clearSecrets) {
      Reflect.deleteProperty(secrets, clearSecret);
    }

    const missingSecrets: Lib_State_Runner_UpdateNotificationTarget_MissingSecrets = existingTarget['missingSecrets'].filter((field) => input['secrets'][field] === undefined && clearSecrets.includes(field) === false);
    const sealedSecrets: Lib_State_Runner_UpdateNotificationTarget_SealedSecrets = this.sealNotificationSecrets(secrets);

    this.transaction(() => {
      this.#database.prepare('UPDATE notification_targets SET name = ?, events = ?, settings = ?, secret_fields = ?, missing_secrets = ?, secrets_ciphertext = ?, secrets_iv = ?, secrets_auth_tag = ?, updated_at = ? WHERE id = ?').run(input['name'], JSON.stringify(input['events']), JSON.stringify(input['settings']), JSON.stringify(Object.keys(secrets).sort()), JSON.stringify(missingSecrets), (sealedSecrets === undefined) ? null : sealedSecrets['ciphertext'], (sealedSecrets === undefined) ? null : sealedSecrets['iv'], (sealedSecrets === undefined) ? null : sealedSecrets['authTag'], new Date().toISOString(), id);

      if (missingSecrets.length === 0) {
        this.#database.prepare('DELETE FROM removed_secrets WHERE kind = \'notification\' AND notification_id = ?').run(id);
      }

      this.addActivity(actorId, 'notification-updated', 'configuration', 'succeeded', `Updated notification ${input['name']}`);

      return;
    });

    return this.getNotificationTargets().find((target) => target['id'] === id) ?? 'not-found';
  }

  /**
   * Lib - State - Update Passkey Usage.
   *
   * Persists a verified assertion counter, backup metadata, and the hostname it ran on.
   * The conditional counter update prevents an older assertion from winning a race.
   *
   * @param {Lib_State_Runner_UpdatePasskeyUsage_Id}         id         - Id.
   * @param {Lib_State_Runner_UpdatePasskeyUsage_Counter}    counter    - Counter.
   * @param {Lib_State_Runner_UpdatePasskeyUsage_DeviceType} deviceType - Device type.
   * @param {Lib_State_Runner_UpdatePasskeyUsage_BackedUp}   backedUp   - Backed up.
   * @param {Lib_State_Runner_UpdatePasskeyUsage_RpId}       rpId       - Rp id.
   *
   * @returns {Lib_State_Runner_UpdatePasskeyUsage_Returns}
   *
   * @since 2.0.0
   */
  public updatePasskeyUsage(id: Lib_State_Runner_UpdatePasskeyUsage_Id, counter: Lib_State_Runner_UpdatePasskeyUsage_Counter, deviceType: Lib_State_Runner_UpdatePasskeyUsage_DeviceType, backedUp: Lib_State_Runner_UpdatePasskeyUsage_BackedUp, rpId: Lib_State_Runner_UpdatePasskeyUsage_RpId): Lib_State_Runner_UpdatePasskeyUsage_Returns {
    const passkey: Lib_State_Runner_UpdatePasskeyUsage_Passkey = this.getPasskey(id);

    if (passkey === undefined) {
      return 'not-found';
    }

    const lastUsedAt: Lib_State_Runner_UpdatePasskeyUsage_LastUsedAt = new Date().toISOString();
    const result: Lib_State_Runner_UpdatePasskeyUsage_Result = this.#database.prepare('UPDATE administrator_passkeys SET counter = ?, device_type = ?, backed_up = ?, last_used_at = ?, rp_id = ? WHERE id = ? AND counter = ?').run(counter, deviceType, (backedUp === true) ? 1 : 0, lastUsedAt, rpId, id, passkey['counter']);

    return (Number(result['changes']) === 1) ? 'updated' : 'conflict';
  }

  /**
   * Lib - State - Update Token.
   *
   * Replaces a token's name, scopes, and expiry without changing its secret hash.
   * A name used by another token is rejected, and scope rows are replaced in one transaction.
   *
   * @param {Lib_State_Runner_UpdateToken_Id}      id      - Id.
   * @param {Lib_State_Runner_UpdateToken_Input}   input   - Input.
   * @param {Lib_State_Runner_UpdateToken_ActorId} actorId - Actor id.
   *
   * @returns {Lib_State_Runner_UpdateToken_Returns}
   *
   * @since 2.0.0
   */
  public updateToken(id: Lib_State_Runner_UpdateToken_Id, input: Lib_State_Runner_UpdateToken_Input, actorId: Lib_State_Runner_UpdateToken_ActorId): Lib_State_Runner_UpdateToken_Returns {
    const existingToken: Lib_State_Runner_UpdateToken_ExistingToken = this.getStoredTokens().find((token) => token['id'] === id);

    if (existingToken === undefined) {
      return 'not-found';
    }

    const conflictingToken: Lib_State_Runner_UpdateToken_ConflictingToken = this.#database.prepare('SELECT id FROM api_tokens WHERE name = ? COLLATE NOCASE AND id != ?').get(input['name'], id);

    if (conflictingToken !== undefined) {
      return 'name-taken';
    }

    let expiresAt: Lib_State_Runner_UpdateToken_ExpiresAt = existingToken['expiresAt'];

    if (input['expiresAt'] === null) {
      expiresAt = undefined;
    } else if (input['expiresAt'] !== undefined) {
      expiresAt = input['expiresAt'];
    }

    this.transaction(() => {
      this.#database.prepare('UPDATE api_tokens SET expires_at = ?, name = ? WHERE id = ?').run(expiresAt ?? null, input['name'], id);

      this.#database.prepare('DELETE FROM api_token_scopes WHERE token_id = ?').run(id);

      for (const scope of input['scopes']) {
        this.#database.prepare('INSERT INTO api_token_scopes (token_id, scope) VALUES (?, ?)').run(id, scope);
      }

      this.addActivity(actorId, 'token-updated', 'token', 'succeeded', `Updated personal access token ${input['name']}`);

      return;
    });

    const summary: Lib_State_Runner_UpdateToken_Summary = this.getTokens().find((token) => token['id'] === id);

    return summary ?? 'not-found';
  }

  /**
   * Lib - State - Verify Totp.
   *
   * Decrypts the enrolled secret, validates the bounded clock window, and rejects replay.
   * The matching time step is committed conditionally before authentication succeeds.
   *
   * @param {Lib_State_Runner_VerifyTotp_AdministratorId} administratorId - Administrator id.
   * @param {Lib_State_Runner_VerifyTotp_Code}            code            - Code.
   * @param {Lib_State_Runner_VerifyTotp_Now}             now             - Now.
   *
   * @returns {Lib_State_Runner_VerifyTotp_Returns}
   *
   * @since 2.0.0
   */
  public verifyTotp(administratorId: Lib_State_Runner_VerifyTotp_AdministratorId, code: Lib_State_Runner_VerifyTotp_Code, now: Lib_State_Runner_VerifyTotp_Now = Date.now()): Lib_State_Runner_VerifyTotp_Returns {
    const row: Lib_State_Runner_VerifyTotp_Row = this.#database.prepare('SELECT administrator_id AS administratorId, created_at AS createdAt, last_used_step AS lastUsedStep, secret_auth_tag AS secretAuthTag, secret_ciphertext AS secretCiphertext, secret_iv AS secretIv FROM administrator_totp WHERE administrator_id = ?').get(administratorId);

    if (row === undefined) {
      return false;
    }

    const storedTotp: Lib_State_Runner_VerifyTotp_StoredTotp = storedAdministratorTotp.parse(row);
    const secret: Lib_State_Runner_VerifyTotp_Secret = decryptCredential({
      authTag: storedTotp['secretAuthTag'],
      ciphertext: storedTotp['secretCiphertext'],
      iv: storedTotp['secretIv'],
    }, this.#encryptionKey);
    const matchedStep: Lib_State_Runner_VerifyTotp_MatchedStep = verifyTotpCode(secret, code, now);

    if (matchedStep === undefined) {
      return false;
    }

    if (storedTotp['lastUsedStep'] !== null && matchedStep <= storedTotp['lastUsedStep']) {
      return false;
    }

    const result: Lib_State_Runner_VerifyTotp_Result = this.#database.prepare('UPDATE administrator_totp SET last_used_step = ? WHERE administrator_id = ? AND (last_used_step IS NULL OR last_used_step < ?)').run(matchedStep, administratorId, matchedStep);

    return Number(result['changes']) === 1;
  }

  /**
   * Lib - State - Wants Notification.
   *
   * Reports whether any destination that can be sent to listens to one of the events.
   * The scheduled pfSense check runs only when the answer is yes.
   *
   * @param {Lib_State_Runner_WantsNotification_Events} events - Events.
   *
   * @returns {Lib_State_Runner_WantsNotification_Returns}
   *
   * @since 2.0.0
   */
  public wantsNotification(events: Lib_State_Runner_WantsNotification_Events): Lib_State_Runner_WantsNotification_Returns {
    return this.getStoredNotificationTargets().some((target) => target['missingSecrets'].length === 0 && target['events'].some((event) => events.includes(event)));
  }

  /**
   * Lib - State - Add Activity.
   *
   * Inserts one validated event and keeps only the newest bounded history.
   * Validation happens before any row reaches the audit table.
   *
   * @param {Lib_State_Runner_AddActivity_ActorId}  actorId  - Actor id.
   * @param {Lib_State_Runner_AddActivity_Action}   action   - Action.
   * @param {Lib_State_Runner_AddActivity_Category} category - Category.
   * @param {Lib_State_Runner_AddActivity_Outcome}  outcome  - Outcome.
   * @param {Lib_State_Runner_AddActivity_Summary}  summary  - Summary.
   *
   * @private
   *
   * @returns {Lib_State_Runner_AddActivity_Returns}
   *
   * @since 2.0.0
   */
  private addActivity(actorId: Lib_State_Runner_AddActivity_ActorId, action: Lib_State_Runner_AddActivity_Action, category: Lib_State_Runner_AddActivity_Category, outcome: Lib_State_Runner_AddActivity_Outcome, summary: Lib_State_Runner_AddActivity_Summary): Lib_State_Runner_AddActivity_Returns {
    const createdAt: Lib_State_Runner_AddActivity_CreatedAt = new Date().toISOString();
    const id: Lib_State_Runner_AddActivity_Id = randomUUID();

    activityEvent.parse({
      action,
      actorId,
      category,
      createdAt,
      id,
      outcome,
      summary,
    });

    this.#database.prepare('INSERT INTO activity_events (id, actor_id, action, category, outcome, summary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, actorId, action, category, outcome, summary, createdAt);

    this.#database.prepare('DELETE FROM activity_events WHERE sequence IN (SELECT sequence FROM activity_events ORDER BY sequence DESC LIMIT -1 OFFSET ?)').run(Runner.#activityLimit);

    return;
  }

  /**
   * Lib - State - Count Rows.
   *
   * Counts the rows of one fixed internal table.
   * Table names come only from this class, never from a request.
   *
   * @param {Lib_State_Runner_CountRows_Table} table - Table.
   *
   * @private
   *
   * @returns {Lib_State_Runner_CountRows_Returns}
   *
   * @since 2.0.0
   */
  private countRows(table: Lib_State_Runner_CountRows_Table): Lib_State_Runner_CountRows_Returns {
    const row: Lib_State_Runner_CountRows_Row = this.#database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();

    return Number((row === undefined) ? 0 : row['count']);
  }

  /**
   * Lib - State - Create Schema.
   *
   * Creates every table and index the controller uses, all at schema version one.
   * Later releases record each of their changes as the next version.
   *
   * @private
   *
   * @returns {Lib_State_Runner_CreateSchema_Returns}
   *
   * @since 2.0.0
   */
  private createSchema(): Lib_State_Runner_CreateSchema_Returns {
    this.#database.exec([
      'CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL) STRICT;',
      'CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL) STRICT;',
      'CREATE TABLE IF NOT EXISTS administrators (id TEXT PRIMARY KEY, username TEXT NOT NULL COLLATE NOCASE UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL) STRICT;',
      'CREATE TABLE IF NOT EXISTS administrator_totp (administrator_id TEXT PRIMARY KEY REFERENCES administrators(id) ON DELETE CASCADE, secret_ciphertext TEXT NOT NULL, secret_iv TEXT NOT NULL, secret_auth_tag TEXT NOT NULL, last_used_step INTEGER, created_at TEXT NOT NULL) STRICT;',
      'CREATE TABLE IF NOT EXISTS administrator_passkeys (id TEXT PRIMARY KEY, administrator_id TEXT NOT NULL REFERENCES administrators(id) ON DELETE CASCADE, name TEXT NOT NULL, public_key BLOB NOT NULL, counter INTEGER NOT NULL CHECK (counter >= 0), transports TEXT NOT NULL, device_type TEXT NOT NULL CHECK (device_type IN (\'singleDevice\', \'multiDevice\')), backed_up INTEGER NOT NULL CHECK (backed_up IN (0, 1)), created_at TEXT NOT NULL, last_used_at TEXT, rp_id TEXT) STRICT;',
      'CREATE TABLE IF NOT EXISTS recovery_codes (administrator_id TEXT NOT NULL REFERENCES administrators(id) ON DELETE CASCADE, code_hash TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (administrator_id, code_hash)) STRICT;',
      'CREATE TABLE IF NOT EXISTS totp_enrollments (administrator_id TEXT PRIMARY KEY REFERENCES administrators(id) ON DELETE CASCADE, secret_ciphertext TEXT NOT NULL, secret_iv TEXT NOT NULL, secret_auth_tag TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL) STRICT;',
      'CREATE TABLE IF NOT EXISTS setup_claims (id INTEGER PRIMARY KEY CHECK (id = 1), code_hash TEXT NOT NULL, expires_at TEXT NOT NULL) STRICT;',
      'CREATE TABLE IF NOT EXISTS browser_sessions (id TEXT PRIMARY KEY, administrator_id TEXT NOT NULL REFERENCES administrators(id) ON DELETE CASCADE, token_hash TEXT NOT NULL UNIQUE, csrf_hash TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL) STRICT;',
      'CREATE TABLE IF NOT EXISTS sign_in_challenges (challenge_hash TEXT PRIMARY KEY, administrator_id TEXT NOT NULL REFERENCES administrators(id) ON DELETE CASCADE, failures INTEGER NOT NULL CHECK (failures >= 0), created_at TEXT NOT NULL, expires_at TEXT NOT NULL) STRICT;',
      'CREATE TABLE IF NOT EXISTS webauthn_ceremonies (id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK (kind IN (\'authentication\', \'registration\')), administrator_id TEXT REFERENCES administrators(id) ON DELETE CASCADE, challenge TEXT NOT NULL, name TEXT, rp_id TEXT NOT NULL, origin TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL) STRICT;',
      'CREATE TABLE IF NOT EXISTS api_tokens (id TEXT PRIMARY KEY, name TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL, expires_at TEXT, last_used_at TEXT) STRICT;',
      'CREATE TABLE IF NOT EXISTS api_token_scopes (token_id TEXT NOT NULL REFERENCES api_tokens(id) ON DELETE CASCADE, scope TEXT NOT NULL CHECK (scope IN (\'pfsense:read\', \'reachability:read\', \'wol:execute\')), PRIMARY KEY (token_id, scope)) STRICT;',
      'CREATE TABLE IF NOT EXISTS activity_events (sequence INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, actor_id TEXT NOT NULL, action TEXT NOT NULL, category TEXT NOT NULL CHECK (category IN (\'access\', \'configuration\', \'service\', \'token\')), outcome TEXT NOT NULL CHECK (outcome IN (\'failed\', \'succeeded\')), summary TEXT NOT NULL, created_at TEXT NOT NULL) STRICT;',
      'CREATE TABLE IF NOT EXISTS pfsense_connection (id INTEGER PRIMARY KEY CHECK (id = 1), pfsense_ssh_ip TEXT NOT NULL, pfsense_ssh_port INTEGER NOT NULL CHECK (pfsense_ssh_port BETWEEN 1 AND 65535), pfsense_username TEXT NOT NULL, credential_type TEXT NOT NULL CHECK (credential_type IN (\'password\', \'privateKey\')), credential_ciphertext TEXT, credential_iv TEXT, credential_auth_tag TEXT, CHECK ((credential_ciphertext IS NULL) = (credential_iv IS NULL) AND (credential_iv IS NULL) = (credential_auth_tag IS NULL))) STRICT;',
      'CREATE TABLE IF NOT EXISTS notification_targets (id TEXT PRIMARY KEY, name TEXT NOT NULL, service TEXT NOT NULL CHECK (service IN (\'apprise\', \'discord\', \'email\', \'gotify\', \'matrix\', \'ntfy\', \'ntfy-reverse-proxy\', \'pushover\', \'slack\', \'telegram\', \'webhook\')), events TEXT NOT NULL, settings TEXT NOT NULL, secret_fields TEXT NOT NULL, missing_secrets TEXT NOT NULL, secrets_ciphertext TEXT, secrets_iv TEXT, secrets_auth_tag TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, last_attempt_at TEXT, last_error TEXT, CHECK ((secrets_ciphertext IS NULL) = (secrets_iv IS NULL) AND (secrets_iv IS NULL) = (secrets_auth_tag IS NULL))) STRICT;',
      'CREATE TABLE IF NOT EXISTS removed_secrets (kind TEXT NOT NULL CHECK (kind IN (\'authenticator\', \'notification\', \'pfsense-credential\')), administrator_id TEXT REFERENCES administrators(id) ON DELETE CASCADE, credential_type TEXT CHECK (credential_type IN (\'password\', \'privateKey\')), notification_id TEXT REFERENCES notification_targets(id) ON DELETE CASCADE, removed_at TEXT NOT NULL) STRICT;',
      'CREATE INDEX IF NOT EXISTS activity_events_created_at ON activity_events (sequence DESC);',
      'CREATE INDEX IF NOT EXISTS administrator_passkeys_administrator_id ON administrator_passkeys (administrator_id, created_at);',
      'CREATE INDEX IF NOT EXISTS browser_sessions_expires_at ON browser_sessions (expires_at);',
      'CREATE UNIQUE INDEX IF NOT EXISTS api_tokens_name ON api_tokens (name COLLATE NOCASE);',
      'CREATE UNIQUE INDEX IF NOT EXISTS notification_targets_name ON notification_targets (name COLLATE NOCASE);',
      'CREATE UNIQUE INDEX IF NOT EXISTS removed_secrets_kind_owner ON removed_secrets (kind, COALESCE(administrator_id, \'\'), COALESCE(notification_id, \'\'));',
      'INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (1, datetime(\'now\'));',
    ].join('\n'));

    return;
  }

  /**
   * Lib - State - Get Metadata.
   *
   * Reads one internal setting such as the first-initialization time.
   * Missing keys return undefined.
   *
   * @param {Lib_State_Runner_GetMetadata_Key} key - Key.
   *
   * @private
   *
   * @returns {Lib_State_Runner_GetMetadata_Returns}
   *
   * @since 2.0.0
   */
  private getMetadata(key: Lib_State_Runner_GetMetadata_Key): Lib_State_Runner_GetMetadata_Returns {
    const row: Lib_State_Runner_GetMetadata_Row = this.#database.prepare('SELECT value FROM metadata WHERE key = ?').get(key) as Lib_State_Runner_GetMetadata_Row;

    return (row === undefined) ? undefined : row['value'];
  }

  /**
   * Lib - State - Get Stored Administrator.
   *
   * Reads one validated account by id, username, or first-row fallback.
   * Case-insensitive username lookup matches the table uniqueness rule.
   *
   * @param {Lib_State_Runner_GetStoredAdministrator_Id}       [id]       - Id.
   * @param {Lib_State_Runner_GetStoredAdministrator_Username} [username] - Username.
   *
   * @private
   *
   * @returns {Lib_State_Runner_GetStoredAdministrator_Returns}
   *
   * @since 2.0.0
   */
  private getStoredAdministrator(id?: Lib_State_Runner_GetStoredAdministrator_Id, username?: Lib_State_Runner_GetStoredAdministrator_Username): Lib_State_Runner_GetStoredAdministrator_Returns {
    let row: Lib_State_Runner_GetStoredAdministrator_Row = undefined;

    if (id !== undefined) {
      row = this.#database.prepare('SELECT created_at AS createdAt, id, password_hash AS passwordHash, updated_at AS updatedAt, username FROM administrators WHERE id = ?').get(id);
    } else if (username !== undefined) {
      row = this.#database.prepare('SELECT created_at AS createdAt, id, password_hash AS passwordHash, updated_at AS updatedAt, username FROM administrators WHERE username = ? COLLATE NOCASE').get(username);
    } else {
      row = this.#database.prepare('SELECT created_at AS createdAt, id, password_hash AS passwordHash, updated_at AS updatedAt, username FROM administrators ORDER BY created_at LIMIT 1').get();
    }

    if (row === undefined) {
      return undefined;
    }

    return storedAdministrator.parse(row);
  }

  /**
   * Lib - State - Get Stored Connection.
   *
   * Validates and decrypts the singleton pfSense connection row when it has a credential.
   * Authenticated decryption fails closed when the key or ciphertext is incorrect.
   *
   * @private
   *
   * @returns {Lib_State_Runner_GetStoredConnection_Returns}
   *
   * @since 2.0.0
   */
  private getStoredConnection(): Lib_State_Runner_GetStoredConnection_Returns {
    const row: Lib_State_Runner_GetStoredConnection_Row = this.#database.prepare('SELECT credential_auth_tag AS credentialAuthTag, credential_ciphertext AS credentialCiphertext, credential_iv AS credentialIv, credential_type AS credentialType, pfsense_ssh_ip AS pfsenseSshIp, pfsense_ssh_port AS pfsenseSshPort, pfsense_username AS pfsenseUsername FROM pfsense_connection WHERE id = 1').get();

    if (row === undefined) {
      return undefined;
    }

    const storedConnectionValue: Lib_State_Runner_GetStoredConnection_StoredConnection = storedConnection.parse(row);

    if (
      storedConnectionValue['credentialAuthTag'] === null
      || storedConnectionValue['credentialCiphertext'] === null
      || storedConnectionValue['credentialIv'] === null
    ) {
      return undefined;
    }

    const credential: Lib_State_Runner_GetStoredConnection_Credential = decryptCredential({
      authTag: storedConnectionValue['credentialAuthTag'],
      ciphertext: storedConnectionValue['credentialCiphertext'],
      iv: storedConnectionValue['credentialIv'],
    }, this.#encryptionKey);

    return {
      ...((storedConnectionValue['credentialType'] === 'password') ? { pfsensePassword: credential } : { pfsensePrivateKey: credential }),
      pfsenseSshIp: storedConnectionValue['pfsenseSshIp'],
      pfsenseSshPort: storedConnectionValue['pfsenseSshPort'],
      pfsenseUsername: storedConnectionValue['pfsenseUsername'],
    };
  }

  /**
   * Lib - State - Get Stored Notification Targets.
   *
   * Reads every destination row and parses its JSON lists and settings.
   * Secrets stay sealed until a send needs them.
   *
   * @private
   *
   * @returns {Lib_State_Runner_GetStoredNotificationTargets_Returns}
   *
   * @since 2.0.0
   */
  private getStoredNotificationTargets(): Lib_State_Runner_GetStoredNotificationTargets_Returns {
    const rows: Lib_State_Runner_GetStoredNotificationTargets_Rows = this.#database.prepare('SELECT created_at AS createdAt, events, id, last_attempt_at AS lastAttemptAt, last_error AS lastError, missing_secrets AS missingSecrets, name, secret_fields AS secretFields, secrets_auth_tag AS secretsAuthTag, secrets_ciphertext AS secretsCiphertext, secrets_iv AS secretsIv, service, settings, updated_at AS updatedAt FROM notification_targets ORDER BY created_at DESC, name').all();

    return rows.map((row) => {
      const target: Lib_State_Runner_GetStoredNotificationTargets_Target = storedNotificationTarget.parse(row);

      return {
        ...target,
        events: storedNotificationKeys.parse(JSON.parse(target['events'])),
        missingSecrets: storedNotificationKeys.parse(JSON.parse(target['missingSecrets'])),
        secretFields: storedNotificationKeys.parse(JSON.parse(target['secretFields'])),
        settings: storedNotificationValues.parse(JSON.parse(target['settings'])),
      };
    });
  }

  /**
   * Lib - State - Get Stored Tokens.
   *
   * Reassembles normalized token and scope rows into the authorization contract.
   * Each reconstructed record passes the public token schema.
   *
   * @private
   *
   * @returns {Lib_State_Runner_GetStoredTokens_Returns}
   *
   * @since 2.0.0
   */
  private getStoredTokens(): Lib_State_Runner_GetStoredTokens_Returns {
    const rows: Lib_State_Runner_GetStoredTokens_Rows = this.#database.prepare('SELECT created_at AS createdAt, expires_at AS expiresAt, id, token_hash AS tokenHash FROM api_tokens ORDER BY created_at DESC, id').all() as Lib_State_Runner_GetStoredTokens_Rows;

    return rows.map((row) => {
      const scopeRows: Lib_State_Runner_GetStoredTokens_ScopeRows = this.#database.prepare('SELECT scope FROM api_token_scopes WHERE token_id = ? ORDER BY scope').all(row['id']) as Lib_State_Runner_GetStoredTokens_ScopeRows;
      const scopes: Lib_State_Runner_GetStoredTokens_Scopes = scopeRows.map((scopeRow) => scopeRow['scope']);

      return personalAccessTokenRecord.parse({
        createdAt: row['createdAt'],
        ...((row['expiresAt'] === null) ? {} : { expiresAt: row['expiresAt'] }),
        id: row['id'],
        scopes,
        tokenHash: row['tokenHash'],
      });
    });
  }

  /**
   * Lib - State - Has Encrypted Data.
   *
   * Reports whether any stored value depends on the current encryption key.
   * A new key on such a database means those values have to be removed.
   *
   * @private
   *
   * @returns {Lib_State_Runner_HasEncryptedData_Returns}
   *
   * @since 2.0.0
   */
  private hasEncryptedData(): Lib_State_Runner_HasEncryptedData_Returns {
    return (
      this.getMetadata('encryption_key_check') !== undefined
      || this.#database.prepare('SELECT id FROM pfsense_connection WHERE credential_ciphertext IS NOT NULL').get() !== undefined
      || this.countRows('administrator_totp') > 0
      || this.countRows('totp_enrollments') > 0
      || this.#database.prepare('SELECT id FROM notification_targets WHERE secrets_ciphertext IS NOT NULL').get() !== undefined
    );
  }

  /**
   * Lib - State - Initialize.
   *
   * Records the first start of a fresh database once.
   * Deprecated SSH variables fill in the connection while it or its credential is missing.
   *
   * @private
   *
   * @returns {Lib_State_Runner_Initialize_Returns}
   *
   * @since 2.0.0
   */
  private initialize(): Lib_State_Runner_Initialize_Returns {
    const initializedAt: Lib_State_Runner_Initialize_InitializedAt = this.getMetadata('initialized_at');
    const createdAt: Lib_State_Runner_Initialize_CreatedAt = new Date().toISOString();
    let importedConnection: Lib_State_Runner_Initialize_ImportedConnection = false;

    if (initializedAt === undefined) {
      const isEmpty: Lib_State_Runner_Initialize_IsEmpty = (
        this.countRows('administrators') === 0
        && this.countRows('pfsense_connection') === 0
        && this.countRows('api_tokens') === 0
      );

      if (isEmpty === true) {
        this.transaction(() => {
          this.addActivity('system', 'state-initialized', 'service', 'succeeded', 'Initialized the SQLite controller database');

          return;
        });
      }

      this.setMetadata('initialized_at', createdAt);
    }

    if (
      this.getStoredConnection() === undefined
      && this.#environment['pfsenseSshIp'] !== undefined
      && this.#environment['pfsenseUsername'] !== undefined
    ) {
      this.updateConnection({
        ...((this.#environment['pfsensePassword'] === undefined) ? {} : { pfsensePassword: this.#environment['pfsensePassword'] }),
        ...((this.#environment['pfsensePrivateKey'] === undefined) ? {} : { pfsensePrivateKey: this.#environment['pfsensePrivateKey'] }),
        pfsenseSshIp: this.#environment['pfsenseSshIp'],
        pfsenseSshPort: this.#environment['pfsenseSshPort'] ?? 22,
        pfsenseUsername: this.#environment['pfsenseUsername'],
      }, 'system');

      importedConnection = true;
    }

    this.#environmentImports = {
      connection: importedConnection,
    };

    return;
  }

  /**
   * Lib - State - Insert Connection.
   *
   * Encrypts and upserts the singleton pfSense connection row.
   * A fresh authenticated nonce is generated for every save.
   *
   * @param {Lib_State_Runner_InsertConnection_Connection} connection - Connection.
   *
   * @private
   *
   * @returns {Lib_State_Runner_InsertConnection_Returns}
   *
   * @since 2.0.0
   */
  private insertConnection(connection: Lib_State_Runner_InsertConnection_Connection): Lib_State_Runner_InsertConnection_Returns {
    const credentialType: Lib_State_Runner_InsertConnection_CredentialType = (connection['pfsensePassword'] === undefined) ? 'privateKey' : 'password';
    const credential: Lib_State_Runner_InsertConnection_Credential = connection['pfsensePassword'] ?? connection['pfsensePrivateKey'];

    if (credential === undefined) {
      throw new Error('Exactly one pfSense credential is required.');
    }

    const encryptedCredential: Lib_State_Runner_InsertConnection_EncryptedCredential = encryptCredential(credential, this.#encryptionKey);

    this.#database.prepare('INSERT INTO pfsense_connection (id, pfsense_ssh_ip, pfsense_ssh_port, pfsense_username, credential_type, credential_ciphertext, credential_iv, credential_auth_tag) VALUES (1, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET pfsense_ssh_ip = excluded.pfsense_ssh_ip, pfsense_ssh_port = excluded.pfsense_ssh_port, pfsense_username = excluded.pfsense_username, credential_type = excluded.credential_type, credential_ciphertext = excluded.credential_ciphertext, credential_iv = excluded.credential_iv, credential_auth_tag = excluded.credential_auth_tag').run(
      connection['pfsenseSshIp'],
      connection['pfsenseSshPort'],
      connection['pfsenseUsername'],
      credentialType,
      encryptedCredential['ciphertext'],
      encryptedCredential['iv'],
      encryptedCredential['authTag'],
    );

    return;
  }

  /**
   * Lib - State - Insert Token.
   *
   * Normalizes one API client token, its name, and its closed scopes into SQLite.
   * Token hashes remain immutable after insertion.
   *
   * @param {Lib_State_Runner_InsertToken_Record} record - Record.
   *
   * @private
   *
   * @returns {Lib_State_Runner_InsertToken_Returns}
   *
   * @since 2.0.0
   */
  private insertToken(record: Lib_State_Runner_InsertToken_Record): Lib_State_Runner_InsertToken_Returns {
    const createdAt: Lib_State_Runner_InsertToken_CreatedAt = record['createdAt'] ?? new Date().toISOString();

    this.#database.prepare('INSERT INTO api_tokens (id, name, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?)').run(record['id'], record['name'], record['tokenHash'], createdAt, record['expiresAt'] ?? null);

    for (const scope of record['scopes']) {
      this.#database.prepare('INSERT INTO api_token_scopes (token_id, scope) VALUES (?, ?)').run(record['id'], scope);
    }

    return;
  }

  /**
   * Lib - State - Open Notification Secrets.
   *
   * Opens the sealed secrets of one destination.
   * A destination without secrets opens to an empty set.
   *
   * @param {Lib_State_Runner_OpenNotificationSecrets_Target} target - Target.
   *
   * @private
   *
   * @returns {Lib_State_Runner_OpenNotificationSecrets_Returns}
   *
   * @since 2.0.0
   */
  private openNotificationSecrets(target: Lib_State_Runner_OpenNotificationSecrets_Target): Lib_State_Runner_OpenNotificationSecrets_Returns {
    if (
      target['secretsAuthTag'] === null
      || target['secretsCiphertext'] === null
      || target['secretsIv'] === null
    ) {
      return {};
    }

    return storedNotificationValues.parse(JSON.parse(decryptCredential({
      authTag: target['secretsAuthTag'],
      ciphertext: target['secretsCiphertext'],
      iv: target['secretsIv'],
    }, this.#encryptionKey)));
  }

  /**
   * Lib - State - Prune Expired.
   *
   * Deletes expired sessions, challenges, enrollments, and passkey ceremonies.
   * It runs whenever a new one is created, which keeps the tables small.
   *
   * @private
   *
   * @returns {Lib_State_Runner_PruneExpired_Returns}
   *
   * @since 2.0.0
   */
  private pruneExpired(): Lib_State_Runner_PruneExpired_Returns {
    const now: Lib_State_Runner_PruneExpired_Now = new Date().toISOString();

    this.#database.prepare('DELETE FROM browser_sessions WHERE expires_at <= ?').run(now);

    this.#database.prepare('DELETE FROM sign_in_challenges WHERE expires_at <= ?').run(now);

    this.#database.prepare('DELETE FROM totp_enrollments WHERE expires_at <= ?').run(now);

    this.#database.prepare('DELETE FROM webauthn_ceremonies WHERE expires_at <= ?').run(now);

    return;
  }

  /**
   * Lib - State - Remove Locked Secrets.
   *
   * Removes the SSH credential and turns off each authenticator app sealed with a lost key.
   * Each removal is recorded so the console can ask for it again.
   *
   * @private
   *
   * @returns {Lib_State_Runner_RemoveLockedSecrets_Returns}
   *
   * @since 2.0.0
   */
  private removeLockedSecrets(): Lib_State_Runner_RemoveLockedSecrets_Returns {
    const removedAt: Lib_State_Runner_RemoveLockedSecrets_RemovedAt = new Date().toISOString();
    const removedSecrets: Lib_State_Runner_RemoveLockedSecrets_RemovedSecrets = [];
    const connectionRow: Lib_State_Runner_RemoveLockedSecrets_ConnectionRow = this.#database.prepare('SELECT credential_type AS credentialType FROM pfsense_connection WHERE credential_ciphertext IS NOT NULL').get() as Lib_State_Runner_RemoveLockedSecrets_ConnectionRow;
    const administrators: Lib_State_Runner_RemoveLockedSecrets_Administrators = this.#database.prepare('SELECT administrators.id AS id, administrators.username AS username FROM administrator_totp JOIN administrators ON administrators.id = administrator_totp.administrator_id ORDER BY administrators.username').all() as Lib_State_Runner_RemoveLockedSecrets_Administrators;

    if (connectionRow !== undefined) {
      this.#database.prepare('UPDATE pfsense_connection SET credential_auth_tag = NULL, credential_ciphertext = NULL, credential_iv = NULL').run();

      this.#database.prepare('DELETE FROM removed_secrets WHERE kind = \'pfsense-credential\'').run();

      this.#database.prepare('INSERT INTO removed_secrets (kind, administrator_id, credential_type, removed_at) VALUES (\'pfsense-credential\', NULL, ?, ?)').run(connectionRow['credentialType'], removedAt);

      removedSecrets.push((connectionRow['credentialType'] === 'password') ? 'the pfSense password' : 'the pfSense private key');
    }

    this.#database.prepare('DELETE FROM administrator_totp').run();

    this.#database.prepare('DELETE FROM totp_enrollments').run();

    for (const administrator of administrators) {
      this.#database.prepare('DELETE FROM recovery_codes WHERE administrator_id = ?').run(administrator['id']);

      this.#database.prepare('DELETE FROM removed_secrets WHERE kind = \'authenticator\' AND administrator_id = ?').run(administrator['id']);

      this.#database.prepare('INSERT INTO removed_secrets (kind, administrator_id, credential_type, removed_at) VALUES (\'authenticator\', ?, NULL, ?)').run(administrator['id'], removedAt);

      removedSecrets.push(`the authenticator app for ${administrator['username']}`);
    }

    const notificationRows: Lib_State_Runner_RemoveLockedSecrets_NotificationRows = this.#database.prepare('SELECT id, name, secret_fields AS secretFields, missing_secrets AS missingSecrets FROM notification_targets WHERE secrets_ciphertext IS NOT NULL ORDER BY name').all() as Lib_State_Runner_RemoveLockedSecrets_NotificationRows;

    for (const notificationRow of notificationRows) {
      const missingSecrets: Lib_State_Runner_RemoveLockedSecrets_MissingSecrets = [...new Set([
        ...storedNotificationKeys.parse(JSON.parse(notificationRow['missingSecrets'])),
        ...storedNotificationKeys.parse(JSON.parse(notificationRow['secretFields'])),
      ])].sort();

      this.#database.prepare('UPDATE notification_targets SET secrets_ciphertext = NULL, secrets_iv = NULL, secrets_auth_tag = NULL, secret_fields = \'[]\', missing_secrets = ? WHERE id = ?').run(JSON.stringify(missingSecrets), notificationRow['id']);

      this.#database.prepare('DELETE FROM removed_secrets WHERE kind = \'notification\' AND notification_id = ?').run(notificationRow['id']);

      this.#database.prepare('INSERT INTO removed_secrets (kind, administrator_id, credential_type, notification_id, removed_at) VALUES (\'notification\', NULL, NULL, ?, ?)').run(notificationRow['id'], removedAt);

      removedSecrets.push(`the ${notificationRow['name']} notification`);
    }

    if (removedSecrets.length > 0) {
      this.addActivity('system', 'encryption-key-replaced', 'service', 'succeeded', 'Made a new encryption key and removed the secrets locked with the old one');
    }

    return removedSecrets;
  }

  /**
   * Lib - State - Resolve Encryption Key.
   *
   * Reads the key file in the data directory, or makes a new key when the file is missing.
   * The key check saves a new key to disk only after the database is ready for it.
   *
   * @private
   *
   * @returns {Lib_State_Runner_ResolveEncryptionKey_Returns}
   *
   * @since 2.0.0
   */
  private resolveEncryptionKey(): Lib_State_Runner_ResolveEncryptionKey_Returns {
    if (existsSync(this.#keyPath) === true) {
      const storedKey: Lib_State_Runner_ResolveEncryptionKey_StoredKey = readFileSync(this.#keyPath, 'utf8').trim();

      if (textEncryptionKey.test(storedKey) === false) {
        throw new Error(`The encryption key file at ${this.#keyPath} is not 64 hexadecimal characters.`);
      }

      return storedKey.toLowerCase();
    }

    this.#keyWasMissing = true;

    return generateEncryptionKey();
  }

  /**
   * Lib - State - Save Encryption Key.
   *
   * Writes a newly made key to the data directory with owner-only permissions.
   * It runs once the database is ready for the new key, so a failed start can be retried.
   *
   * @private
   *
   * @returns {Lib_State_Runner_SaveEncryptionKey_Returns}
   *
   * @since 2.0.0
   */
  private saveEncryptionKey(): Lib_State_Runner_SaveEncryptionKey_Returns {
    mkdirSync(dirname(this.#keyPath), {
      mode: parseInt('700', 8),
      recursive: true,
    });

    const keyFile: Lib_State_Runner_SaveEncryptionKey_KeyFile = openSync(this.#keyPath, 'wx', parseInt('600', 8));

    try {
      writeSync(keyFile, `${this.#encryptionKey}\n`);
    } finally {
      closeSync(keyFile);
    }

    return;
  }

  /**
   * Lib - State - Seal Notification Secrets.
   *
   * Seals a destination's secret fields together with the encryption key.
   * Nothing is sealed when the destination has no secrets.
   *
   * @param {Lib_State_Runner_SealNotificationSecrets_Secrets} secrets - Secrets.
   *
   * @private
   *
   * @returns {Lib_State_Runner_SealNotificationSecrets_Returns}
   *
   * @since 2.0.0
   */
  private sealNotificationSecrets(secrets: Lib_State_Runner_SealNotificationSecrets_Secrets): Lib_State_Runner_SealNotificationSecrets_Returns {
    if (Object.keys(secrets).length === 0) {
      return undefined;
    }

    return encryptCredential(JSON.stringify(secrets), this.#encryptionKey);
  }

  /**
   * Lib - State - Set Metadata.
   *
   * Writes one internal setting, replacing any earlier value.
   * Settings are internal and never come from a request.
   *
   * @param {Lib_State_Runner_SetMetadata_Key}   key   - Key.
   * @param {Lib_State_Runner_SetMetadata_Value} value - Value.
   *
   * @private
   *
   * @returns {Lib_State_Runner_SetMetadata_Returns}
   *
   * @since 2.0.0
   */
  private setMetadata(key: Lib_State_Runner_SetMetadata_Key, value: Lib_State_Runner_SetMetadata_Value): Lib_State_Runner_SetMetadata_Returns {
    this.#database.prepare('INSERT INTO metadata (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);

    return;
  }

  /**
   * Lib - State - Transaction.
   *
   * Commits a synchronous SQLite unit or rolls it back before propagating failure.
   * Nested transactions are intentionally avoided by the state API.
   *
   * @param {Lib_State_Runner_Transaction_Callback} callback - Callback.
   *
   * @private
   *
   * @returns {Lib_State_Runner_Transaction_Returns}
   *
   * @since 2.0.0
   */
  private transaction(callback: Lib_State_Runner_Transaction_Callback): Lib_State_Runner_Transaction_Returns {
    this.#database.exec('BEGIN IMMEDIATE;');

    try {
      callback();

      this.#database.exec('COMMIT;');
    } catch (error) {
      this.#database.exec('ROLLBACK;');

      throw error;
    }

    return;
  }

  /**
   * Lib - State - Verify Encryption Key.
   *
   * Confirms the key opens what this database already holds, then records a check value.
   * A new key replaces a missing one, and a key from another database stops startup.
   *
   * @private
   *
   * @returns {Lib_State_Runner_VerifyEncryptionKey_Returns}
   *
   * @since 2.0.0
   */
  private verifyEncryptionKey(): Lib_State_Runner_VerifyEncryptionKey_Returns {
    if (this.#keyWasMissing === true) {
      this.transaction(() => {
        if (this.hasEncryptedData() === true) {
          this.#keyReplacement = this.removeLockedSecrets();
        }

        this.setMetadata('encryption_key_check', JSON.stringify(encryptCredential(Runner.#keyCheckValue, this.#encryptionKey)));

        return;
      });

      this.saveEncryptionKey();

      return;
    }

    const keyCheck: Lib_State_Runner_VerifyEncryptionKey_KeyCheck = this.getMetadata('encryption_key_check');

    try {
      if (keyCheck !== undefined) {
        const keyCheckValue: Lib_State_Runner_VerifyEncryptionKey_KeyCheckValue = decryptCredential(JSON.parse(keyCheck), this.#encryptionKey);

        if (keyCheckValue !== Runner.#keyCheckValue) {
          throw new Error('The encryption key check value does not match.');
        }

        return;
      }

      this.getStoredConnection();

      const totpRow: Lib_State_Runner_VerifyEncryptionKey_TotpRow = this.#database.prepare('SELECT secret_auth_tag AS authTag, secret_ciphertext AS ciphertext, secret_iv AS iv FROM administrator_totp LIMIT 1').get() as Lib_State_Runner_VerifyEncryptionKey_TotpRow;

      if (totpRow !== undefined) {
        decryptCredential(totpRow, this.#encryptionKey);
      }
    } catch {
      throw new Error(`The encryption key at ${this.#keyPath} doesn't belong to this database. Put back the key file this database was created with, or delete ${this.#keyPath} and restart to make a new key, then enter the saved secrets again.`);
    }

    this.setMetadata('encryption_key_check', JSON.stringify(encryptCredential(Runner.#keyCheckValue, this.#encryptionKey)));

    return;
  }
}
