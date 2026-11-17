import type { ZodType } from 'zod';

import type {
  Lib_Notifications_Field,
  Lib_Notifications_NotificationInputSchema_Returns,
} from '@/types/lib/notifications.d.ts';
import type {
  Lib_State_Runner_GetStoredTokens_Returns,
  Lib_State_Runner_StoredNotificationTarget,
} from '@/types/lib/state.d.ts';
import type {
  Shared_PersonalAccessTokenSummary,
  Shared_PfsenseConnection,
} from '@/types/shared.d.ts';

export type Lib_Backup_Purpose = 'export' | 'import';

export type Lib_Backup_ExportSections = {
  accessTokens: boolean;
  connection: boolean;
  notifications: boolean;
};

export type Lib_Backup_Connection = {
  credential: string;
  credentialType: 'password' | 'privateKey';
  pfsenseSshIp: string;
  pfsenseSshPort: number;
  pfsenseUsername: string;
};

export type Lib_Backup_Notification = {
  events: string[];
  id: string;
  name: string;
  secrets: Record<string, string>;
  service: 'apprise' | 'discord' | 'email' | 'gotify' | 'matrix' | 'ntfy' | 'ntfy-reverse-proxy' | 'pushover' | 'slack' | 'telegram' | 'webhook';
  settings: Record<string, string>;
};

export type Lib_Backup_AccessToken = {
  createdAt: string;
  expiresAt: string | null;
  id: string;
  lastUsedAt: string | null;
  name: string;
  scopes: Array<'pfsense:read' | 'reachability:read' | 'wol:execute'>;
  tokenHash: string;
};

export type Lib_Backup_Document = {
  accessTokens?: Lib_Backup_AccessToken[] | undefined;
  appVersion: string;
  connection?: Lib_Backup_Connection | null | undefined;
  exportedAt: string;
  format: 'pfsense-actions-export';
  notifications?: Lib_Backup_Notification[] | undefined;
  version: 1;
};

export type Lib_Backup_SectionId = 'connection' | 'notifications' | 'accessTokens';

export type Lib_Backup_ImportSectionPreview = {
  file: string;
  here: string;
  id: Lib_Backup_SectionId;
  label: string;
  reason?: string | undefined;
  willImport: boolean;
};

export type Lib_Backup_ImportSummary = {
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

export type Lib_Backup_ImportPreview = {
  appVersion: string;
  exportedAt: string;
  sections: Lib_Backup_ImportSectionPreview[];
  summary: Lib_Backup_ImportSummary;
};

export type Lib_Backup_ImportResult = Lib_Backup_ImportSummary & {
  importedSections: Lib_Backup_SectionId[];
};

export type Lib_Backup_Schema<Value> = ZodType<Value>;

export type Lib_Backup_DocumentSchema = ZodType<Lib_Backup_Document>;

export type Lib_Backup_Grant = {
  expiresAt: string;
  grant: string;
};

export type Lib_Backup_GrantRecord = {
  expiresAt: number;
  purpose: Lib_Backup_Purpose;
  sessionId: string;
};

export type Lib_Backup_GrantStore_Clock = () => number;

export type Lib_Backup_GrantStore_Grants = Map<string, Lib_Backup_GrantRecord>;

export type Lib_Backup_GrantStore_Issue_Returns = Lib_Backup_Grant;

export type Lib_Backup_GrantStore_Consume_Returns = boolean;

export type Lib_Backup_GrantStore_Prune_Returns = void;

export type Lib_Backup_NotificationEventKeys = [string, ...string[]];

export type Lib_Backup_StringMapSchema = ZodType<Record<string, string>>;

export type Lib_Backup_NotificationSchema = ZodType<Lib_Backup_Notification>;

export type Lib_Backup_NotificationRefinement = Parameters<Lib_Backup_NotificationSchema['superRefine']>[0];

export type Lib_Backup_DocumentRefinement = Parameters<Lib_Backup_Schema<Lib_Backup_Document>['superRefine']>[0];

export type Lib_Backup_NotificationEvents = string[];

export type Lib_Backup_IsUnique = boolean;

export type Lib_Backup_NotificationEventsPredicate = (events: Lib_Backup_NotificationEvents) => Lib_Backup_IsUnique;

export type Lib_Backup_AccessTokenScopes = Lib_Backup_AccessToken['scopes'];

export type Lib_Backup_AccessTokenScopesPredicate = (scopes: Lib_Backup_AccessTokenScopes) => Lib_Backup_IsUnique;

export type Lib_Backup_NotificationFields = Lib_Notifications_Field[];

export type Lib_Backup_NotificationFieldPredicate = (field: Lib_Notifications_Field) => boolean;

export type Lib_Backup_NotificationFieldMapper = (field: Lib_Notifications_Field) => string;

export type Lib_Backup_StringSet = Set<string>;

export type Lib_Backup_ParsedNotification = ReturnType<Lib_Notifications_NotificationInputSchema_Returns['safeParse']>;

export type Lib_Backup_NotificationMapper = (notification: Lib_Backup_Notification) => string;

export type Lib_Backup_AccessTokenMapper = (token: Lib_Backup_AccessToken) => string;

export type Lib_Backup_StringList = string[];

export type Lib_Backup_ParseBackupDocument_Value = unknown;

export type Lib_Backup_ParseBackupDocument_Returns = Lib_Backup_Document;

export type Lib_Backup_GrantStore_DurationMilliseconds = number;

export type Lib_Backup_GrantStore_SessionId = string;

export type Lib_Backup_GrantStore_Grant = string;

export type Lib_Backup_GrantStore_Now = number;

export type Lib_Backup_GrantStore_ExpiresAt = number;

export type Lib_Backup_GrantStore_Digest = string;

export type Lib_Backup_GrantStore_Record = Lib_Backup_GrantRecord | undefined;

export type Lib_Backup_GrantStore_Entry = [string, Lib_Backup_GrantRecord];

export type Lib_Backup_State_ActorId = string;

export type Lib_Backup_State_AppVersion = string;

export type Lib_Backup_State_ImportedSections = Lib_Backup_SectionId[];

export type Lib_Backup_State_SectionPredicate = (section: Lib_Backup_ImportSectionPreview) => boolean;

export type Lib_Backup_State_SectionMapper = (section: Lib_Backup_ImportSectionPreview) => Lib_Backup_SectionId;

export type Lib_Backup_State_TransactionCallback = () => void;

export type Lib_Backup_State_StoredTarget = Lib_State_Runner_StoredNotificationTarget;

export type Lib_Backup_State_TargetEntry = [string, Lib_Backup_State_StoredTarget];

export type Lib_Backup_State_TargetEntryMapper = (target: Lib_Backup_State_StoredTarget) => Lib_Backup_State_TargetEntry;

export type Lib_Backup_State_TargetIdMapper = (target: Lib_Backup_State_StoredTarget) => string;

export type Lib_Backup_State_TargetMap = Map<string, Lib_Backup_State_StoredTarget>;

export type Lib_Backup_State_StringSet = Set<string>;

export type Lib_Backup_State_ExistingTarget = Lib_Backup_State_StoredTarget | undefined;

export type Lib_Backup_State_NotificationId = string;

export type Lib_Backup_State_SealedSecrets = {
  authTag: string;
  ciphertext: string;
  iv: string;
} | undefined;

export type Lib_Backup_State_Now = string;

export type Lib_Backup_State_TokenRow = {
  id: string;
  name: string;
  tokenHash: string;
};

export type Lib_Backup_State_TokenRows = Lib_Backup_State_TokenRow[];

export type Lib_Backup_State_TokenRowIdMapper = (row: Lib_Backup_State_TokenRow) => string;

export type Lib_Backup_State_TokenRowNameMapper = (row: Lib_Backup_State_TokenRow) => string;

export type Lib_Backup_State_TokenRowHashMapper = (row: Lib_Backup_State_TokenRow) => string;

export type Lib_Backup_State_SectionLabelMapper = (section: Lib_Backup_SectionId) => string;

export type Lib_Backup_State_Labels = string[];

export type Lib_Backup_State_Connection = Shared_PfsenseConnection | undefined;

export type Lib_Backup_State_NotificationDocumentMapper = (target: Lib_Backup_State_StoredTarget) => Lib_Backup_Notification;

export type Lib_Backup_State_TokenMetadata = Map<string, Shared_PersonalAccessTokenSummary>;

export type Lib_Backup_State_TokenMetadataEntry = [string, Shared_PersonalAccessTokenSummary];

export type Lib_Backup_State_TokenMetadataMapper = (token: Shared_PersonalAccessTokenSummary) => Lib_Backup_State_TokenMetadataEntry;

export type Lib_Backup_State_StoredAccessToken = Lib_State_Runner_GetStoredTokens_Returns[number];

export type Lib_Backup_State_AccessTokenDocumentMapper = (token: Lib_Backup_State_StoredAccessToken) => Lib_Backup_AccessToken;

export type Lib_Backup_State_TokenSummary = Shared_PersonalAccessTokenSummary | undefined;

export type Lib_Backup_State_LastUsedAt = string | null;

export type Lib_Backup_State_TokenName = string;

export type Lib_Backup_State_ConnectionCredential = string;

export type Lib_Backup_State_CurrentTargets = Lib_Backup_State_StoredTarget[];

export type Lib_Backup_State_Notifications = Lib_Backup_Notification[];

export type Lib_Backup_State_AccessTokens = Lib_Backup_AccessToken[];

export type Lib_Backup_State_AccessTokenPredicate = (token: Lib_Backup_AccessToken) => boolean;

export type Lib_Backup_State_NotificationPredicate = (target: Lib_Backup_Notification) => boolean;

export type Lib_Backup_State_ImportSections = Lib_Backup_ImportSectionPreview[];

export type Lib_Backup_State_ConnectionAction = Lib_Backup_ImportSummary['connection'];

export type Lib_Backup_State_PluralSuffix = string;

export type Lib_Backup_State_ConnectionDescription = string;
