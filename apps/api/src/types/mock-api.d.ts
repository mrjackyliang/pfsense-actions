import type {
  IncomingMessage,
  ServerResponse,
} from 'node:http';

import type { Plugin } from 'vite';

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_MockScope = 'pfsense:read' | 'reachability:read' | 'wol:execute';

export type MockApi_MockToken = {
  createdAt: string;
  expiresAt: string | null;
  id: string;
  lastUsedAt: string | null;
  name: string;
  scopes: MockApi_MockScope[];
};

export type MockApi_MockPasskey = {
  createdAt: string;
  hostname: string | null;
  id: string;
  lastUsedAt: string | null;
  name: string;
};

export type MockApi_MockTokenInput = {
  name: string;
  scopes: MockApi_MockScope[];
};

export type MockApi_MockActivity = {
  action: string;
  actorId: string;
  category: 'access' | 'configuration' | 'service' | 'token';
  createdAt: string;
  id: string;
  outcome: 'failed' | 'succeeded';
  summary: string;
};

export type MockApi_MockConnection = {
  credentialSaved: boolean;
  credentialType: 'password' | 'privateKey';
  pfsenseSshIp: string;
  pfsenseSshPort: number;
  pfsenseUsername: string;
};

export type MockApi_MockNotificationService = 'apprise' | 'discord' | 'email' | 'gotify' | 'matrix' | 'ntfy' | 'ntfy-reverse-proxy' | 'pushover' | 'slack' | 'telegram' | 'webhook';

export type MockApi_MockNotification = {
  createdAt: string;
  events: string[];
  id: string;
  lastAttemptAt: string | null;
  lastError: string | null;
  name: string;
  secrets: Record<string, true>;
  secretsMissing: string[];
  service: MockApi_MockNotificationService;
  settings: Record<string, string>;
  updatedAt: string;
};

// MockApi_MockNotificationField is one service field: [key, message when missing, secret, required].
export type MockApi_MockNotificationField = [string, string, boolean, boolean];

// MockApi_MockNotificationInput is a checked create or edit body, with the optional secrets to clear.
export type MockApi_MockNotificationInput = Pick<MockApi_MockNotification, 'events' | 'name' | 'secrets' | 'service' | 'settings'> & {
  clearSecrets: string[];
};

export type MockApi_MockBackupPurpose = 'export' | 'import';

export type MockApi_MockBackupDocument = {
  accessTokens?: Array<{
    createdAt: string;
    expiresAt: string | null;
    id: string;
    lastUsedAt: string | null;
    name: string;
    scopes: MockApi_MockScope[];
    tokenHash: string;
  }>;
  appVersion: string;
  connection?: {
    credential: string;
    credentialType: 'password' | 'privateKey';
    pfsenseSshIp: string;
    pfsenseSshPort: number;
    pfsenseUsername: string;
  } | null;
  exportedAt: string;
  format: 'pfsense-actions-export';
  notifications?: Array<{
    events: string[];
    id: string;
    name: string;
    secrets: Record<string, string>;
    service: MockApi_MockNotificationService;
    settings: Record<string, string>;
  }>;
  version: 1;
};

export type MockApi_MockBackupSummary = {
  accessTokens: {
    added: number;
    skipped: number;
  };
  connection: 'added' | 'replaced' | 'skipped';
  notifications: {
    added: number;
    replaced: number;
  };
};

export type MockApi_MockAdministrator = {
  createdAt: string;
  password: string;
  username: string;
};

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_Activity = MockApi_MockActivity[];

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_ActivitySeeds_ActivitySeed = Omit<MockApi_MockActivity, 'createdAt' | 'id'> & {
  minutesAgo: number;
};
export type MockApi_ActivitySeeds = MockApi_ActivitySeeds_ActivitySeed[];

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_ActivitySequence = number;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_Administrator = MockApi_MockAdministrator | null;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_BackupGrant_Grant = {
  expiresAt: number;
  purpose: MockApi_MockBackupPurpose;
  token: string;
};
export type MockApi_BackupGrant = MockApi_BackupGrant_Grant | null;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_BackupPasskeyPurposes = Map<string, MockApi_MockBackupPurpose>;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_BackupSummary_Document = MockApi_MockBackupDocument;
export type MockApi_BackupSummary_Returns = MockApi_MockBackupSummary;
export type MockApi_BackupSummary_ImportedNotifications = NonNullable<MockApi_MockBackupDocument['notifications']>;
export type MockApi_BackupSummary_ImportedTokens = NonNullable<MockApi_MockBackupDocument['accessTokens']>;
export type MockApi_BackupSummary_NotificationNames = Set<string>;
export type MockApi_BackupSummary_TokenIds = Set<string>;
export type MockApi_BackupSummary_TokenNames = Set<string>;
export type MockApi_BackupSummary_Hashes = Set<string>;
export type MockApi_BackupSummary_ConnectionAction = MockApi_MockBackupSummary['connection'];

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_Connection = MockApi_MockConnection | null;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_ConnectionCredential = string;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_ConnectionResource_Returns = Record<string, unknown>;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_CsrfToken = string;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_DebugLogging = boolean;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_HandleRequest_Request = IncomingMessage;
export type MockApi_HandleRequest_Response = ServerResponse;
export type MockApi_HandleRequest_Returns = Promise<boolean>;
export type MockApi_HandleRequest_Url = URL;
export type MockApi_HandleRequest_Path = string;
export type MockApi_HandleRequest_Method = string;
export type MockApi_HandleRequest_Body = Record<string, unknown>;
export type MockApi_HandleRequest_ClaimUsernameIssue = string;
export type MockApi_HandleRequest_Code = string;
export type MockApi_HandleRequest_IsTotpCode = boolean;
export type MockApi_HandleRequest_RecoveryCode = string | undefined;
export type MockApi_HandleRequest_CurrentUsername = string;
export type MockApi_HandleRequest_Purpose = MockApi_MockBackupPurpose | null;
export type MockApi_HandleRequest_CeremonyId = string;
export type MockApi_HandleRequest_ExportSections = Record<string, unknown>;
export type MockApi_HandleRequest_ExportDocument = MockApi_MockBackupDocument;
export type MockApi_HandleRequest_ExportSecretEntry = [string, string];
export type MockApi_HandleRequest_Document = MockApi_MockBackupDocument | null;
export type MockApi_HandleRequest_Summary = MockApi_MockBackupSummary;
export type MockApi_HandleRequest_PreviewSections = Record<string, unknown>[];
export type MockApi_HandleRequest_ImportedSections = ('connection' | 'notifications' | 'accessTokens')[];
export type MockApi_HandleRequest_Index = number;
export type MockApi_HandleRequest_Existing = MockApi_MockNotification | undefined;
export type MockApi_HandleRequest_Now = string;
export type MockApi_HandleRequest_Notification = MockApi_MockNotification;
export type MockApi_HandleRequest_ImportedSecretEntry = [string, true];
export type MockApi_HandleRequest_ExistingIds = Set<string>;
export type MockApi_HandleRequest_ExistingNames = Set<string>;
export type MockApi_HandleRequest_ExistingHashes = Set<string>;
export type MockApi_HandleRequest_NewUsernameIssue = string;
export type MockApi_HandleRequest_TotpUri = string;
export type MockApi_HandleRequest_PasskeyName = string;
export type MockApi_HandleRequest_CeremonyPasskeyName = string | undefined;
export type MockApi_HandleRequest_Passkey = MockApi_MockPasskey;
export type MockApi_HandleRequest_PasskeyId = string;
export type MockApi_HandleRequest_NotificationInputResult = MockApi_MockNotificationInput | null;
export type MockApi_HandleRequest_NotificationMatch = RegExpMatchArray | null;
export type MockApi_HandleRequest_FoundNotification = MockApi_MockNotification | undefined;
export type MockApi_HandleRequest_TokenInputResult = MockApi_MockTokenInput | null;
export type MockApi_HandleRequest_Plaintext = string;
export type MockApi_HandleRequest_Token = MockApi_MockToken;
export type MockApi_HandleRequest_TokenMatch = RegExpMatchArray | null;
export type MockApi_HandleRequest_FoundToken = MockApi_MockToken | undefined;
export type MockApi_HandleRequest_Connected = boolean;
export type MockApi_HandleRequest_Address = string;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_HandleRequest_CheckPassword_Field = string;
export type MockApi_HandleRequest_CheckPassword_Returns = boolean;
export type MockApi_HandleRequest_CheckPassword = (field?: MockApi_HandleRequest_CheckPassword_Field) => MockApi_HandleRequest_CheckPassword_Returns;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_HandleRequest_IssueBackupGrant_Purpose = MockApi_MockBackupPurpose;
export type MockApi_HandleRequest_IssueBackupGrant_Returns = void;
export type MockApi_HandleRequest_IssueBackupGrant_Token = string;
export type MockApi_HandleRequest_IssueBackupGrant_ExpiresAt = number;
export type MockApi_HandleRequest_IssueBackupGrant = (purpose: MockApi_HandleRequest_IssueBackupGrant_Purpose) => MockApi_HandleRequest_IssueBackupGrant_Returns;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_HandleRequest_NotificationInput_Existing = MockApi_MockNotification | null;
export type MockApi_HandleRequest_NotificationInput_Returns = MockApi_MockNotificationInput | null;
export type MockApi_HandleRequest_NotificationInput_Service = MockApi_MockNotificationService;
export type MockApi_HandleRequest_NotificationInput_Name = string;
export type MockApi_HandleRequest_NotificationInput_Events = string[];
export type MockApi_HandleRequest_NotificationInput_Values = Record<string, unknown>;
export type MockApi_HandleRequest_NotificationInput_Settings = Record<string, string>;
export type MockApi_HandleRequest_NotificationInput_Secrets = Record<string, true>;
export type MockApi_HandleRequest_NotificationInput_Key = string;
export type MockApi_HandleRequest_NotificationInput_Missing = string;
export type MockApi_HandleRequest_NotificationInput_Secret = boolean;
export type MockApi_HandleRequest_NotificationInput_Required = boolean;
export type MockApi_HandleRequest_NotificationInput_Value = string;
export type MockApi_HandleRequest_NotificationInput_Saved = boolean;
export type MockApi_HandleRequest_NotificationInput_Clearable = string[];
export type MockApi_HandleRequest_NotificationInput_ClearSecrets = unknown[];
export type MockApi_HandleRequest_NotificationInput_InvalidIndex = number;
export type MockApi_HandleRequest_NotificationInput_ClearSecretKeys = string[];
export type MockApi_HandleRequest_NotificationInput_Replaced = string | undefined;
export type MockApi_HandleRequest_NotificationInput = (existing: MockApi_HandleRequest_NotificationInput_Existing) => MockApi_HandleRequest_NotificationInput_Returns;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_HandleRequest_TokenInput_ExceptId = string;
export type MockApi_HandleRequest_TokenInput_Returns = MockApi_MockTokenInput | null;
export type MockApi_HandleRequest_TokenInput_Name = string;
export type MockApi_HandleRequest_TokenInput_Scopes = MockApi_MockScope[];
export type MockApi_HandleRequest_TokenInput = (exceptId: MockApi_HandleRequest_TokenInput_ExceptId) => MockApi_HandleRequest_TokenInput_Returns;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_KeyReplaced = boolean;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_Minute = number;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_MockApi_Returns = Plugin;
export type MockApi_MockApi_Request = IncomingMessage;
export type MockApi_MockApi_Response = ServerResponse;
export type MockApi_MockApi_Next = () => void;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_NewRecoveryCodes_Returns = string[];
export type MockApi_NewRecoveryCodes_Code = string;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_NormalizeCode_Value = string;
export type MockApi_NormalizeCode_Returns = string;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_NotificationEvents_NotificationEvent = {
  defaultEnabled: boolean;
  description: string;
  key: string;
  label: string;
};
export type MockApi_NotificationEvents = MockApi_NotificationEvents_NotificationEvent[];

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_NotificationFields = Record<MockApi_MockNotificationService, MockApi_MockNotificationField[]>;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_Notifications = MockApi_MockNotification[];

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_PasskeyCeremonies = Map<string, string>;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_Passkeys = MockApi_MockPasskey[];

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_PendingChallenge = string;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_ReadBody_Request = IncomingMessage;
export type MockApi_ReadBody_Returns = Promise<Record<string, unknown>>;
export type MockApi_ReadBody_Chunks = Buffer[];
export type MockApi_ReadBody_Text = string;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_RecordActivity_Event = Omit<MockApi_MockActivity, 'createdAt' | 'id'>;
export type MockApi_RecordActivity_MinutesAgo = number;
export type MockApi_RecordActivity_Returns = void;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_RecoveryCodes = string[];

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_RemovedSecrets_RemovedSecret = {
  credentialType?: 'password' | 'privateKey';
  kind: 'authenticator' | 'notification' | 'pfsense-credential';
  name?: string;
  notificationId?: string;
  removedAt: string;
};
export type MockApi_RemovedSecrets = MockApi_RemovedSecrets_RemovedSecret[];

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_ScopeOrder = MockApi_MockScope[];

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_SecretKeys = string[];

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_SendEmpty_Response = ServerResponse;
export type MockApi_SendEmpty_Returns = void;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_SendError_Response = ServerResponse;
export type MockApi_SendError_Status = number;
export type MockApi_SendError_Code = string;
export type MockApi_SendError_Message = string;
export type MockApi_SendError_Returns = void;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_SendFieldError_Response = ServerResponse;
export type MockApi_SendFieldError_Status = number;
export type MockApi_SendFieldError_Code = string;
export type MockApi_SendFieldError_Field = string;
export type MockApi_SendFieldError_Message = string;
export type MockApi_SendFieldError_Returns = void;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_SendJson_Response = ServerResponse;
export type MockApi_SendJson_Status = number;
export type MockApi_SendJson_Body = unknown;
export type MockApi_SendJson_Returns = void;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_SetupCode = string;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_SignedIn = boolean;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_StartSession_Response = ServerResponse;
export type MockApi_StartSession_Status = number;
export type MockApi_StartSession_Returns = void;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_StartedAt = number;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_TokenHashes_Entry = [string, string];
export type MockApi_TokenHashes = Map<string, string>;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_Tokens = MockApi_MockToken[];

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_TotpEnabled = boolean;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_TotpPending = boolean;

/**
 * Mock API.
 *
 * @since 2.2.1
 */
export type MockApi_UsernameIssue_Value = string;
export type MockApi_UsernameIssue_Returns = string;
