import { randomBytes } from 'node:crypto';

import { toDataURL } from 'qrcode';

import {
  administratorUsernamePattern,
  ipAddressPattern,
  notificationPathPattern,
  separatorsPattern,
  tokenPathPattern,
  totpCodePattern,
} from './src/web/regex.js';

import type {
  MockApi_Activity,
  MockApi_ActivitySeeds,
  MockApi_ActivitySequence,
  MockApi_Administrator,
  MockApi_BackupGrant,
  MockApi_BackupPasskeyPurposes,
  MockApi_BackupSummary_ConnectionAction,
  MockApi_BackupSummary_Document,
  MockApi_BackupSummary_Hashes,
  MockApi_BackupSummary_ImportedNotifications,
  MockApi_BackupSummary_ImportedTokens,
  MockApi_BackupSummary_NotificationNames,
  MockApi_BackupSummary_Returns,
  MockApi_BackupSummary_TokenIds,
  MockApi_BackupSummary_TokenNames,
  MockApi_Connection,
  MockApi_ConnectionCredential,
  MockApi_ConnectionResource_Returns,
  MockApi_CsrfToken,
  MockApi_DebugLogging,
  MockApi_HandleRequest_Address,
  MockApi_HandleRequest_Body,
  MockApi_HandleRequest_CeremonyId,
  MockApi_HandleRequest_CeremonyPasskeyName,
  MockApi_HandleRequest_CheckPassword,
  MockApi_HandleRequest_CheckPassword_Field,
  MockApi_HandleRequest_CheckPassword_Returns,
  MockApi_HandleRequest_ClaimUsernameIssue,
  MockApi_HandleRequest_Code,
  MockApi_HandleRequest_Connected,
  MockApi_HandleRequest_CurrentUsername,
  MockApi_HandleRequest_Document,
  MockApi_HandleRequest_Existing,
  MockApi_HandleRequest_ExistingHashes,
  MockApi_HandleRequest_ExistingIds,
  MockApi_HandleRequest_ExistingNames,
  MockApi_HandleRequest_ExportDocument,
  MockApi_HandleRequest_ExportSecretEntry,
  MockApi_HandleRequest_ExportSections,
  MockApi_HandleRequest_FoundNotification,
  MockApi_HandleRequest_FoundToken,
  MockApi_HandleRequest_ImportedSecretEntry,
  MockApi_HandleRequest_ImportedSections,
  MockApi_HandleRequest_Index,
  MockApi_HandleRequest_IssueBackupGrant,
  MockApi_HandleRequest_IssueBackupGrant_ExpiresAt,
  MockApi_HandleRequest_IssueBackupGrant_Purpose,
  MockApi_HandleRequest_IssueBackupGrant_Returns,
  MockApi_HandleRequest_IssueBackupGrant_Token,
  MockApi_HandleRequest_IsTotpCode,
  MockApi_HandleRequest_Method,
  MockApi_HandleRequest_NewUsernameIssue,
  MockApi_HandleRequest_Notification,
  MockApi_HandleRequest_NotificationInput,
  MockApi_HandleRequest_NotificationInput_Clearable,
  MockApi_HandleRequest_NotificationInput_ClearSecretKeys,
  MockApi_HandleRequest_NotificationInput_ClearSecrets,
  MockApi_HandleRequest_NotificationInput_Events,
  MockApi_HandleRequest_NotificationInput_Existing,
  MockApi_HandleRequest_NotificationInput_InvalidIndex,
  MockApi_HandleRequest_NotificationInput_Key,
  MockApi_HandleRequest_NotificationInput_Missing,
  MockApi_HandleRequest_NotificationInput_Name,
  MockApi_HandleRequest_NotificationInput_Replaced,
  MockApi_HandleRequest_NotificationInput_Required,
  MockApi_HandleRequest_NotificationInput_Returns,
  MockApi_HandleRequest_NotificationInput_Saved,
  MockApi_HandleRequest_NotificationInput_Secret,
  MockApi_HandleRequest_NotificationInput_Secrets,
  MockApi_HandleRequest_NotificationInput_Service,
  MockApi_HandleRequest_NotificationInput_Settings,
  MockApi_HandleRequest_NotificationInput_Value,
  MockApi_HandleRequest_NotificationInput_Values,
  MockApi_HandleRequest_NotificationInputResult,
  MockApi_HandleRequest_NotificationMatch,
  MockApi_HandleRequest_Now,
  MockApi_HandleRequest_Passkey,
  MockApi_HandleRequest_PasskeyId,
  MockApi_HandleRequest_PasskeyName,
  MockApi_HandleRequest_Path,
  MockApi_HandleRequest_Plaintext,
  MockApi_HandleRequest_PreviewSections,
  MockApi_HandleRequest_Purpose,
  MockApi_HandleRequest_RecoveryCode,
  MockApi_HandleRequest_Request,
  MockApi_HandleRequest_Response,
  MockApi_HandleRequest_Returns,
  MockApi_HandleRequest_Summary,
  MockApi_HandleRequest_Token,
  MockApi_HandleRequest_TokenInput,
  MockApi_HandleRequest_TokenInput_ExceptId,
  MockApi_HandleRequest_TokenInput_Name,
  MockApi_HandleRequest_TokenInput_Returns,
  MockApi_HandleRequest_TokenInput_Scopes,
  MockApi_HandleRequest_TokenInputResult,
  MockApi_HandleRequest_TokenMatch,
  MockApi_HandleRequest_TotpUri,
  MockApi_HandleRequest_Url,
  MockApi_KeyReplaced,
  MockApi_Minute,
  MockApi_MockApi_Next,
  MockApi_MockApi_Request,
  MockApi_MockApi_Response,
  MockApi_MockApi_Returns,
  MockApi_MockNotificationService,
  MockApi_NewRecoveryCodes_Code,
  MockApi_NewRecoveryCodes_Returns,
  MockApi_NormalizeCode_Returns,
  MockApi_NormalizeCode_Value,
  MockApi_NotificationEvents,
  MockApi_NotificationFields,
  MockApi_Notifications,
  MockApi_PasskeyCeremonies,
  MockApi_Passkeys,
  MockApi_PendingChallenge,
  MockApi_ReadBody_Chunks,
  MockApi_ReadBody_Request,
  MockApi_ReadBody_Returns,
  MockApi_ReadBody_Text,
  MockApi_RecordActivity_Event,
  MockApi_RecordActivity_MinutesAgo,
  MockApi_RecordActivity_Returns,
  MockApi_RecoveryCodes,
  MockApi_RemovedSecrets,
  MockApi_ScopeOrder,
  MockApi_SecretKeys,
  MockApi_SendEmpty_Response,
  MockApi_SendEmpty_Returns,
  MockApi_SendError_Code,
  MockApi_SendError_Message,
  MockApi_SendError_Response,
  MockApi_SendError_Returns,
  MockApi_SendError_Status,
  MockApi_SendFieldError_Code,
  MockApi_SendFieldError_Field,
  MockApi_SendFieldError_Message,
  MockApi_SendFieldError_Response,
  MockApi_SendFieldError_Returns,
  MockApi_SendFieldError_Status,
  MockApi_SendJson_Body,
  MockApi_SendJson_Response,
  MockApi_SendJson_Returns,
  MockApi_SendJson_Status,
  MockApi_SetupCode,
  MockApi_SignedIn,
  MockApi_StartedAt,
  MockApi_StartSession_Response,
  MockApi_StartSession_Returns,
  MockApi_StartSession_Status,
  MockApi_TokenHashes,
  MockApi_TokenHashes_Entry,
  MockApi_Tokens,
  MockApi_TotpEnabled,
  MockApi_TotpPending,
  MockApi_UsernameIssue_Returns,
  MockApi_UsernameIssue_Value,
} from './src/types/mock-api.d.ts';

// Each service's fields: [key, message when missing, secret, required].

/**
 * Mock API - Notification fields.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const notificationFields: MockApi_NotificationFields = {
  'apprise': [
    [
      'url',
      'Enter the Apprise URL.',
      true,
      true,
    ],
    [
      'urls',
      '',
      true,
      false,
    ],
  ],
  'discord': [[
    'webhookUrl',
    'Enter the webhook URL.',
    true,
    true,
  ]],
  'email': [
    [
      'host',
      'Enter the SMTP server.',
      false,
      true,
    ],
    [
      'port',
      'Enter a port number.',
      false,
      true,
    ],
    [
      'security',
      'Choose STARTTLS, TLS, or none.',
      false,
      true,
    ],
    [
      'username',
      '',
      false,
      false,
    ],
    [
      'password',
      '',
      true,
      false,
    ],
    [
      'from',
      'Enter the address to send from.',
      false,
      true,
    ],
    [
      'to',
      'Enter the address to send to.',
      false,
      true,
    ],
  ],
  'gotify': [
    [
      'url',
      'Enter the server URL.',
      false,
      true,
    ],
    [
      'token',
      'Enter the app token.',
      true,
      true,
    ],
  ],
  'matrix': [
    [
      'homeserverUrl',
      'Enter the homeserver URL.',
      false,
      true,
    ],
    [
      'roomId',
      'Enter the room ID.',
      false,
      true,
    ],
    [
      'accessToken',
      'Enter the access token.',
      true,
      true,
    ],
  ],
  'ntfy': [
    [
      'url',
      'Enter the topic URL.',
      false,
      true,
    ],
    [
      'token',
      '',
      true,
      false,
    ],
  ],
  'ntfy-reverse-proxy': [
    [
      'url',
      'Enter the context URL.',
      false,
      true,
    ],
    [
      'token',
      '',
      true,
      false,
    ],
  ],
  'pushover': [
    [
      'userKey',
      'Enter the user key.',
      true,
      true,
    ],
    [
      'appToken',
      'Enter the app token.',
      true,
      true,
    ],
  ],
  'slack': [[
    'webhookUrl',
    'Enter the webhook URL.',
    true,
    true,
  ]],
  'telegram': [
    [
      'botToken',
      'Enter the bot token.',
      true,
      true,
    ],
    [
      'chatId',
      'Enter the chat ID.',
      false,
      true,
    ],
  ],
  'webhook': [
    [
      'url',
      'Enter the URL.',
      true,
      true,
    ],
    [
      'token',
      '',
      true,
      false,
    ],
  ],
};

/**
 * Mock API - Notification events.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const notificationEvents: MockApi_NotificationEvents = [
  {
    defaultEnabled: true,
    description: 'The app started without its key and removed what it locked.',
    key: 'secrets-removed',
    label: 'Saved secrets were removed',
  },
  {
    defaultEnabled: true,
    description: 'Ten failed sign-ins from one address paused sign-in from it.',
    key: 'sign-in-locked',
    label: 'Sign-in locked',
  },
  {
    defaultEnabled: true,
    description: 'The scheduled check couldn\'t sign in to pfSense over SSH.',
    key: 'pfsense-unreachable',
    label: 'pfSense can\'t be reached',
  },
  {
    defaultEnabled: true,
    description: 'The scheduled check reached pfSense after it was down.',
    key: 'pfsense-reachable',
    label: 'pfSense reachable again',
  },
  {
    defaultEnabled: false,
    description: 'A ping, Wake-on-LAN, or system request failed.',
    key: 'action-failed',
    label: 'Action failed',
  },
  {
    defaultEnabled: false,
    description: 'A wake packet went out.',
    key: 'wol-sent',
    label: 'Wake-on-LAN sent',
  },
];

/**
 * Mock API - Scope order.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const scopeOrder: MockApi_ScopeOrder = [
  'pfsense:read',
  'reachability:read',
  'wol:execute',
];

/**
 * Mock API - Setup code.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const setupCode: MockApi_SetupCode = 'ABCDE-FGHJK-LMNPQ';

/**
 * Mock API - Csrf token.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const csrfToken: MockApi_CsrfToken = 'pfc_mockmockmockmockmockmockmockmock';

/**
 * Mock API - Started at.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const startedAt: MockApi_StartedAt = Date.now();

/**
 * Mock API - Minute.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const minute: MockApi_Minute = 60 * 1000;

/**
 * Mock API - Administrator.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let administrator: MockApi_Administrator = null;

/**
 * Mock API - Signed in.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let signedIn: MockApi_SignedIn = false;

/**
 * Mock API - Pending challenge.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let pendingChallenge: MockApi_PendingChallenge = '';

/**
 * Mock API - TOTP enabled.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let totpEnabled: MockApi_TotpEnabled = false;

/**
 * Mock API - TOTP pending.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let totpPending: MockApi_TotpPending = false;

/**
 * Mock API - Recovery codes.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let recoveryCodes: MockApi_RecoveryCodes = [];

// Two saved passkeys, so the Sign-in and security page shows a realistic list. Ones added in the mock are kept until it restarts.

/**
 * Mock API - Passkeys.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let passkeys: MockApi_Passkeys = [
  {
    createdAt: new Date(startedAt - (41 * 24 * 60 * minute)).toISOString(),
    hostname: 'actions.example.net',
    id: 'pk-qT4mW8xZ1cV6bN3s',
    lastUsedAt: new Date(startedAt - (5 * 60 * minute)).toISOString(),
    name: 'MacBook Pro',
  },
  {
    createdAt: new Date(startedAt - (16 * 24 * 60 * minute)).toISOString(),
    hostname: 'actions.example.net',
    id: 'pk-rY7kP2dG5hJ9fL1a',
    lastUsedAt: new Date(startedAt - (2 * 24 * 60 * minute)).toISOString(),
    name: 'iPhone',
  },
];

/**
 * Mock API - Passkey ceremonies.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const passkeyCeremonies: MockApi_PasskeyCeremonies = new Map();

/**
 * Mock API - Activity sequence.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let activitySequence: MockApi_ActivitySequence = 0;

// MOCK_KEY_REPLACED=true starts as if the encryption key had been lost, to show the notice.

/**
 * Mock API - Key replaced.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const keyReplaced: MockApi_KeyReplaced = process.env['MOCK_KEY_REPLACED'] === 'true';

/**
 * Mock API - Removed secrets.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let removedSecrets: MockApi_RemovedSecrets = (keyReplaced === true) ? [
  {
    credentialType: 'privateKey',
    kind: 'pfsense-credential',
    removedAt: new Date(startedAt).toISOString(),
  },
  {
    kind: 'authenticator',
    removedAt: new Date(startedAt).toISOString(),
  },
] : [];

/**
 * Mock API - Connection.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let connection: MockApi_Connection = {
  credentialSaved: keyReplaced === false,
  credentialType: 'privateKey',
  pfsenseSshIp: '192.168.1.1',
  pfsenseSshPort: 22,
  pfsenseUsername: 'admin',
};

let connectionCredential: MockApi_ConnectionCredential = (keyReplaced === true) ? '' : [
  '-----BEGIN OPENSSH PRIVATE KEY-----',
  'mock-private-key',
  '-----END OPENSSH PRIVATE KEY-----',
].join('\n');

/**
 * Mock API - Debug logging.
 *
 * Whether the Connection page's Debug logging switch is on.
 * It starts off, like a fresh installation.
 *
 * @since 2.1.0
 */
let debugLogging: MockApi_DebugLogging = false;

/**
 * Mock API - Notifications.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const notifications: MockApi_Notifications = [
  {
    createdAt: new Date(startedAt - (30 * 24 * 60 * minute)).toISOString(),
    events: [
      'secrets-removed',
      'sign-in-locked',
      'pfsense-unreachable',
      'pfsense-reachable',
    ],
    id: 'ntf-2a4c6e8a0b2d4f60',
    lastAttemptAt: new Date(startedAt - (2 * 60 * minute)).toISOString(),
    lastError: null,
    name: 'My phone',
    secrets: {},
    secretsMissing: [],
    service: 'ntfy',
    settings: { url: 'https://ntfy.sh/pfsense-alerts' },
    updatedAt: new Date(startedAt - (30 * 24 * 60 * minute)).toISOString(),
  },
  {
    createdAt: new Date(startedAt - (9 * 24 * 60 * minute)).toISOString(),
    events: [
      'pfsense-unreachable',
      'pfsense-reachable',
      'action-failed',
    ],
    id: 'ntf-5c7e9a1b3d5f7a90',
    lastAttemptAt: new Date(startedAt - (26 * 60 * minute)).toISOString(),
    lastError: null,
    name: 'Ops chat',
    secrets: { botToken: true },
    secretsMissing: [],
    service: 'telegram',
    settings: { chatId: '-1001234567890' },
    updatedAt: new Date(startedAt - (9 * 24 * 60 * minute)).toISOString(),
  },
  {
    createdAt: new Date(startedAt - (4 * 24 * 60 * minute)).toISOString(),
    events: [
      'pfsense-unreachable',
      'action-failed',
    ],
    id: 'ntf-8d0f2b4c6e8a0c13',
    lastAttemptAt: new Date(startedAt - (3 * 60 * minute)).toISOString(),
    lastError: 'HTTP 404: Unknown Webhook',
    name: 'Network alerts',
    secrets: { webhookUrl: true },
    secretsMissing: [],
    service: 'discord',
    settings: {},
    updatedAt: new Date(startedAt - (4 * 24 * 60 * minute)).toISOString(),
  },
  {
    createdAt: new Date(startedAt - (2 * 24 * 60 * minute)).toISOString(),
    events: [
      'pfsense-unreachable',
      'pfsense-reachable',
    ],
    id: 'ntf-4b6d8f0a2c4e6b71',
    lastAttemptAt: new Date(startedAt - (5 * 60 * minute)).toISOString(),
    lastError: null,
    name: 'Firewall alerts',
    secrets: { token: true },
    secretsMissing: [],
    service: 'ntfy-reverse-proxy',
    settings: { url: 'https://alerts.ntfy.example.com' },
    updatedAt: new Date(startedAt - (2 * 24 * 60 * minute)).toISOString(),
  },
];

// A lost key removes every destination's saved secrets, as the server does, and pauses
// those destinations until the secrets are entered again.
if (keyReplaced === true) {
  for (const notification of [...notifications].sort((left, right) => left['name'].localeCompare(right['name']))) {
    const secretKeys: MockApi_SecretKeys = Object.keys(notification['secrets']).sort();

    if (secretKeys.length === 0) {
      continue;
    }

    notification.secrets = {};
    notification.secretsMissing = secretKeys;

    removedSecrets.push({
      kind: 'notification',
      name: notification['name'],
      notificationId: notification['id'],
      removedAt: new Date(startedAt).toISOString(),
    });
  }
}

/**
 * Mock API - Tokens.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const tokens: MockApi_Tokens = [
  {
    createdAt: new Date(startedAt - (40 * 24 * 60 * minute)).toISOString(),
    expiresAt: null,
    id: 'tok-3f9a1c2b7d4e5f60',
    lastUsedAt: new Date(startedAt - (3 * minute)).toISOString(),
    name: 'Home Assistant',
    scopes: [
      'pfsense:read',
      'wol:execute',
    ],
  },
  {
    createdAt: new Date(startedAt - (12 * 24 * 60 * minute)).toISOString(),
    expiresAt: new Date(startedAt + (78 * 24 * 60 * minute)).toISOString(),
    id: 'tok-8b2e4d6f1a3c5e70',
    lastUsedAt: new Date(startedAt - (45 * 1000)).toISOString(),
    name: 'Uptime Kuma',
    scopes: [
      'pfsense:read',
      'reachability:read',
    ],
  },
];

const tokenHashes: MockApi_TokenHashes = new Map(tokens.map((token): MockApi_TokenHashes_Entry => [
  token['id'],
  randomBytes(32).toString('hex'),
]));

let backupGrant: MockApi_BackupGrant = null;

const backupPasskeyPurposes: MockApi_BackupPasskeyPurposes = new Map();

/**
 * Mock API - Activity.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const activity: MockApi_Activity = [];

/**
 * Mock API - Records activity.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {MockApi_RecordActivity_Returns}
 *
 * @since 2.0.0
 */
const recordActivity = (event: MockApi_RecordActivity_Event, minutesAgo: MockApi_RecordActivity_MinutesAgo = 0): MockApi_RecordActivity_Returns => {
  activitySequence += 1;

  activity.unshift({
    ...event,
    createdAt: new Date(Date.now() - (minutesAgo * minute)).toISOString(),
    id: `00000000-0000-4000-8000-${String(activitySequence).padStart(12, '0')}`,
  });

  activity.splice(250);

  return;
};

const activitySeeds: MockApi_ActivitySeeds = [
  {
    action: 'state-initialized',
    actorId: 'system',
    category: 'service',
    minutesAgo: 58_000,
    outcome: 'succeeded',
    summary: 'Initialized the SQLite controller database',
  },
  {
    action: 'connection-updated',
    actorId: 'admin',
    category: 'configuration',
    minutesAgo: 57_900,
    outcome: 'succeeded',
    summary: 'Updated the pfSense SSH connection',
  },
  {
    action: 'token-created',
    actorId: 'admin',
    category: 'token',
    minutesAgo: 57_600,
    outcome: 'succeeded',
    summary: 'Created personal access token Home Assistant',
  },
  {
    action: 'token-created',
    actorId: 'admin',
    category: 'token',
    minutesAgo: 17_280,
    outcome: 'succeeded',
    summary: 'Created personal access token Uptime Kuma',
  },
  {
    action: 'sign-in',
    actorId: 'anonymous',
    category: 'access',
    minutesAgo: 600,
    outcome: 'failed',
    summary: 'Rejected a password sign-in',
  },
  {
    action: 'wake-on-lan',
    actorId: 'Home Assistant',
    category: 'access',
    minutesAgo: 190,
    outcome: 'succeeded',
    summary: 'Completed Wake-on-LAN request',
  },
  {
    action: 'reachability-check',
    actorId: 'Uptime Kuma',
    category: 'access',
    minutesAgo: 62,
    outcome: 'failed',
    summary: 'Completed bounded reachability check',
  },
  {
    action: 'system-information',
    actorId: 'Home Assistant',
    category: 'access',
    minutesAgo: 14,
    outcome: 'succeeded',
    summary: 'Read reviewed pfSense system information',
  },
  {
    action: 'connectivity-check',
    actorId: 'Uptime Kuma',
    category: 'access',
    minutesAgo: 1,
    outcome: 'succeeded',
    summary: 'Completed pfSense connectivity check',
  },
];

activitySeeds.forEach((activitySeed) => {
  recordActivity({
    action: activitySeed['action'],
    actorId: activitySeed['actorId'],
    category: activitySeed['category'],
    outcome: activitySeed['outcome'],
    summary: activitySeed['summary'],
  }, activitySeed['minutesAgo']);

  return;
});

// The server records the key replacement when it removes the locked secrets at startup.
if (keyReplaced === true) {
  recordActivity({
    action: 'encryption-key-replaced',
    actorId: 'system',
    category: 'service',
    outcome: 'succeeded',
    summary: 'Made a new encryption key and removed the secrets locked with the old one',
  });
}

/**
 * Mock API - Sends JSON.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {MockApi_SendJson_Returns}
 *
 * @since 2.0.0
 */
const sendJSON = (response: MockApi_SendJson_Response, status: MockApi_SendJson_Status, body: MockApi_SendJson_Body): MockApi_SendJson_Returns => {
  response.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(body));

  return;
};

/**
 * Mock API - Sends empty.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {MockApi_SendEmpty_Returns}
 *
 * @since 2.0.0
 */
const sendEmpty = (response: MockApi_SendEmpty_Response): MockApi_SendEmpty_Returns => {
  response.writeHead(204).end();

  return;
};

/**
 * Mock API - Sends error.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {MockApi_SendError_Returns}
 *
 * @since 2.0.0
 */
const sendError = (response: MockApi_SendError_Response, status: MockApi_SendError_Status, code: MockApi_SendError_Code, message: MockApi_SendError_Message): MockApi_SendError_Returns => {
  sendJSON(response, status, {
    error: {
      code,
      message,
    },
  });

  return;
};

/**
 * Mock API - Sends field error.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {MockApi_SendFieldError_Returns}
 *
 * @since 2.0.0
 */
const sendFieldError = (response: MockApi_SendFieldError_Response, status: MockApi_SendFieldError_Status, code: MockApi_SendFieldError_Code, field: MockApi_SendFieldError_Field, message: MockApi_SendFieldError_Message): MockApi_SendFieldError_Returns => {
  sendJSON(response, status, {
    error: {
      code,
      issues: [{
        field,
        message,
        path: [field],
      }],
      message,
    },
  });

  return;
};

// Marks the mock signed in and answers like the real session response.

/**
 * Mock API - Starts session.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {MockApi_StartSession_Returns}
 *
 * @since 2.0.0
 */
const startSession = (response: MockApi_StartSession_Response, status: MockApi_StartSession_Status = 200): MockApi_StartSession_Returns => {
  signedIn = true;

  response.setHeader('Set-Cookie', `pfa_csrf=${csrfToken}; Path=/; SameSite=Strict`);

  sendJSON(response, status, {
    administrator: {
      id: '00000000-0000-4000-8000-000000000001',
      username: (administrator !== null) ? administrator['username'] : 'admin',
    },
    csrfToken,
    expiresAt: new Date(Date.now() + (24 * 60 * minute)).toISOString(),
    status: 'authenticated',
  });

  return;
};

/**
 * Mock API - Reads body.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {MockApi_ReadBody_Returns}
 *
 * @since 2.0.0
 */
const readBody = async (request: MockApi_ReadBody_Request): MockApi_ReadBody_Returns => {
  const chunks: MockApi_ReadBody_Chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  const text: MockApi_ReadBody_Text = Buffer.concat(chunks).toString('utf-8');

  return (text === '') ? {} : JSON.parse(text);
};

/**
 * Mock API - Connection resource.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {MockApi_ConnectionResource_Returns}
 *
 * @since 2.0.0
 */
const connectionResource = (): MockApi_ConnectionResource_Returns => ((connection === null) ? { configured: false } : {
  configured: true,
  ...connection,
});

/**
 * Mock API - Backup summary.
 *
 * Applies the real importer's name and hash duplicate rules to one mock document.
 * This keeps browser-only development aligned with the server preview.
 *
 * @returns {MockApi_BackupSummary_Returns}
 *
 * @since 2.1.0
 */
const backupSummary = (document: MockApi_BackupSummary_Document): MockApi_BackupSummary_Returns => {
  const importedNotifications: MockApi_BackupSummary_ImportedNotifications = document['notifications'] ?? [];
  const importedTokens: MockApi_BackupSummary_ImportedTokens = document['accessTokens'] ?? [];
  const notificationNames: MockApi_BackupSummary_NotificationNames = new Set(notifications.map((notification) => notification['name'].toLocaleLowerCase()));
  const tokenIds: MockApi_BackupSummary_TokenIds = new Set(tokens.map((token) => token['id']));
  const tokenNames: MockApi_BackupSummary_TokenNames = new Set(tokens.map((token) => token['name'].toLocaleLowerCase()));
  const hashes: MockApi_BackupSummary_Hashes = new Set(tokenHashes.values());

  let connectionAction: MockApi_BackupSummary_ConnectionAction = 'skipped';

  if (document['connection'] !== undefined && document['connection'] !== null) {
    connectionAction = (connection === null) ? 'added' : 'replaced';
  }

  return {
    accessTokens: {
      added: importedTokens.filter((token) => {
        return (
          tokenIds.has(token['id']) === false
          && tokenNames.has(token['name'].toLocaleLowerCase()) === false
          && hashes.has(token['tokenHash']) === false
        );
      }).length,
      skipped: importedTokens.filter((token) => {
        return (
          tokenIds.has(token['id']) === true
          || tokenNames.has(token['name'].toLocaleLowerCase()) === true
          || hashes.has(token['tokenHash']) === true
        );
      }).length,
    },
    connection: connectionAction,
    notifications: {
      added: importedNotifications.filter((notification) => notificationNames.has(notification['name'].toLocaleLowerCase()) === false).length,
      replaced: importedNotifications.filter((notification) => notificationNames.has(notification['name'].toLocaleLowerCase())).length,
    },
  };
};

// Codes are compared like the server does: any letter case, with or without spaces and dashes.

/**
 * Mock API - Normalizes code.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {MockApi_NormalizeCode_Returns}
 *
 * @since 2.0.0
 */
const normalizeCode = (value: MockApi_NormalizeCode_Value): MockApi_NormalizeCode_Returns => {
  return value.toUpperCase().replace(new RegExp(separatorsPattern, 'gu'), '');
};

// Usernames follow the rule every appliance shares: 3 to 64 characters, starting with a letter or number.

/**
 * Mock API - Username issue.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {MockApi_UsernameIssue_Returns}
 *
 * @since 2.0.0
 */
const usernameIssue = (value: MockApi_UsernameIssue_Value): MockApi_UsernameIssue_Returns => {
  if (value === '') {
    return 'Enter a username.';
  }

  return (new RegExp(administratorUsernamePattern, 'u').test(value) === true) ? '' : 'Use 3 to 64 letters, numbers, periods, underscores, or hyphens, starting with a letter or number.';
};

// newRecoveryCodes makes ten codes the way the server does: ten characters without look-alikes, split 5-5.

/**
 * Mock API - New recovery codes.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {MockApi_NewRecoveryCodes_Returns}
 *
 * @since 2.0.0
 */
const newRecoveryCodes = (): MockApi_NewRecoveryCodes_Returns => Array.from({ length: 10 }, () => {
  const code: MockApi_NewRecoveryCodes_Code = [...randomBytes(10)].map((byte) => '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'.charAt(byte % 32)).join('');

  return `${code.slice(0, 5)}-${code.slice(5)}`;
});

// Answers one console API call, or returns false so Vite serves the page.

/**
 * Mock API - Handles request.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {MockApi_HandleRequest_Returns}
 *
 * @since 2.0.0
 */
const handleRequest = async (request: MockApi_HandleRequest_Request, response: MockApi_HandleRequest_Response): MockApi_HandleRequest_Returns => {
  // The Host header gives the address the page was opened at, like the real server sees it.
  const url: MockApi_HandleRequest_Url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const path: MockApi_HandleRequest_Path = url.pathname;
  const method: MockApi_HandleRequest_Method = request.method ?? 'GET';

  if (path.startsWith('/api/v1/') === false) {
    return false;
  }

  const body: MockApi_HandleRequest_Body = (method === 'GET') ? {} : await readBody(request);

  if (method === 'GET' && path === '/api/v1/setup/status') {
    sendJSON(response, 200, (administrator === null) ? {
      claimExpiresAt: new Date(startedAt + (30 * minute)).toISOString(),
      claimRequired: true,
    } : { claimRequired: false });

    return true;
  }

  if (method === 'POST' && path === '/api/v1/setup/claim') {
    if (administrator !== null) {
      sendError(response, 409, 'claim_unavailable', 'Setup is already complete. Sign in instead.');

      return true;
    }

    if (normalizeCode(String(body['claimCode'] ?? '')) !== normalizeCode(setupCode)) {
      sendFieldError(response, 401, 'claim_invalid', 'claimCode', 'That setup code is wrong or expired. Restart the container to print a new one.');

      return true;
    }

    const claimUsernameIssue: MockApi_HandleRequest_ClaimUsernameIssue = usernameIssue(String(body['username'] ?? '').trim());

    if (claimUsernameIssue !== '') {
      sendFieldError(response, 422, 'invalid_request', 'username', claimUsernameIssue);

      return true;
    }

    if (String(body['password'] ?? '').length < 12) {
      sendFieldError(response, 422, 'invalid_request', 'password', 'Use at least 12 characters.');

      return true;
    }

    administrator = {
      createdAt: new Date().toISOString(),
      password: String(body['password']),
      username: String(body['username'] ?? 'admin').trim(),
    };

    recordActivity({
      action: 'installation-claimed',
      actorId: administrator['username'],
      category: 'access',
      outcome: 'succeeded',
      summary: 'Created the administrator account with the setup code',
    });

    startSession(response, 201);

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/login') {
    if (
      administrator === null
      || body['username'] !== administrator['username']
      || body['password'] !== administrator['password']
    ) {
      recordActivity({
        action: 'sign-in',
        actorId: 'anonymous',
        category: 'access',
        outcome: 'failed',
        summary: 'Rejected a password sign-in',
      });

      sendError(response, 401, 'credentials_invalid', 'The username or password is incorrect.');

      return true;
    }

    if (totpEnabled === true) {
      pendingChallenge = 'mockchallengemockchallengemockchallenge01';

      sendJSON(response, 200, {
        challenge: pendingChallenge,
        expiresAt: new Date(Date.now() + (5 * minute)).toISOString(),
        status: 'second_factor_required',
      });

      return true;
    }

    startSession(response);

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/login/second-factor') {
    const code: MockApi_HandleRequest_Code = String(body['code'] ?? '').trim();
    const isTotpCode: MockApi_HandleRequest_IsTotpCode = new RegExp(totpCodePattern, 'u').test(code);
    const recoveryCode: MockApi_HandleRequest_RecoveryCode = (isTotpCode === true) ? undefined : recoveryCodes.find((candidate) => normalizeCode(candidate) === normalizeCode(code));

    if (body['challenge'] !== pendingChallenge || pendingChallenge === '') {
      sendError(response, 401, 'challenge_expired', 'Your sign-in timed out. Enter your password again.');

      return true;
    }

    if (
      (
        isTotpCode === true
        && code !== '123456'
      )
      || (
        isTotpCode === false
        && recoveryCode === undefined
      )
    ) {
      sendFieldError(response, 401, 'code_invalid', 'code', 'That code doesn\'t match. Try the current code, or a recovery code.');

      return true;
    }

    recoveryCodes = recoveryCodes.filter((candidate) => candidate !== recoveryCode);
    pendingChallenge = '';

    startSession(response);

    return true;
  }

  // Passkey sign-in accepts any answer from the browser, like the transmission-vpn mock.
  if (method === 'POST' && path === '/api/v1/auth/passkeys/login/options') {
    sendJSON(response, 200, {
      ceremonyId: randomBytes(16).toString('base64url'),
      options: {
        allowCredentials: [],
        challenge: randomBytes(32).toString('base64url'),
        rpId: url.hostname,
        timeout: 300000,
        userVerification: 'required',
      },
    });

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/passkeys/login/verify') {
    if (administrator === null) {
      sendError(response, 401, 'passkey_rejected', 'That passkey wasn\'t accepted.');

      return true;
    }

    startSession(response);

    return true;
  }

  if (signedIn === false) {
    sendError(response, 401, 'authentication_required', 'Sign in to continue.');

    return true;
  }

  if (method !== 'GET' && request.headers['x-csrf-token'] !== csrfToken) {
    sendError(response, 403, 'csrf_invalid', 'The request CSRF token is missing or invalid.');

    return true;
  }

  const currentUsername: MockApi_HandleRequest_CurrentUsername = (administrator !== null) ? administrator['username'] : 'admin';

  /**
   * Mock API - Checks password.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {MockApi_HandleRequest_CheckPassword_Returns}
   *
   * @since 2.0.0
   */
  const checkPassword: MockApi_HandleRequest_CheckPassword = (field: MockApi_HandleRequest_CheckPassword_Field = 'password'): MockApi_HandleRequest_CheckPassword_Returns => {
    if (body[field] !== ((administrator !== null) ? administrator['password'] : undefined)) {
      sendFieldError(response, 422, 'password_incorrect', field, 'That password is incorrect.');

      return false;
    }

    return true;
  };

  /**
   * Mock API - Issues backup grant.
   *
   * Keeps the raw grant in short-lived mock memory for one matching operation.
   * Browser development therefore exercises the same scoped flow as production.
   *
   * @returns {MockApi_HandleRequest_IssueBackupGrant_Returns}
   *
   * @since 2.1.0
   */
  const issueBackupGrant: MockApi_HandleRequest_IssueBackupGrant = (purpose: MockApi_HandleRequest_IssueBackupGrant_Purpose): MockApi_HandleRequest_IssueBackupGrant_Returns => {
    const token: MockApi_HandleRequest_IssueBackupGrant_Token = [
      'pbg_',
      randomBytes(32).toString('base64url'),
    ].join('');
    const expiresAt: MockApi_HandleRequest_IssueBackupGrant_ExpiresAt = Date.now() + (5 * minute);

    backupGrant = {
      expiresAt,
      purpose,
      token,
    };

    sendJSON(response, 200, {
      expiresAt: new Date(expiresAt).toISOString(),
      grant: token,
    });

    return;
  };

  if (method === 'POST' && path === '/api/v1/backup/confirmation') {
    const purpose: MockApi_HandleRequest_Purpose = (body['purpose'] === 'export' || body['purpose'] === 'import') ? body['purpose'] : null;

    if (purpose === null) {
      sendError(response, 422, 'invalid_request', 'Choose what you are confirming.');

      return true;
    }

    if (checkPassword() === false) {
      return true;
    }

    if (totpEnabled === true && body['code'] !== '123456') {
      sendFieldError(response, 422, 'identity_not_confirmed', 'code', 'That authenticator code is incorrect. In the mock, use 123456.');

      return true;
    }

    issueBackupGrant(purpose);

    return true;
  }

  if (method === 'POST' && path === '/api/v1/backup/confirmation/passkey/options') {
    const purpose: MockApi_HandleRequest_Purpose = (body['purpose'] === 'export' || body['purpose'] === 'import') ? body['purpose'] : null;

    if (purpose === null) {
      sendError(response, 422, 'invalid_request', 'Choose what you are confirming.');

      return true;
    }

    const ceremonyId: MockApi_HandleRequest_CeremonyId = randomBytes(24).toString('base64url');

    backupPasskeyPurposes.set(ceremonyId, purpose);

    sendJSON(response, 200, {
      ceremonyId,
      options: {
        allowCredentials: [],
        challenge: randomBytes(32).toString('base64url'),
        rpId: url.hostname,
        timeout: 300000,
        userVerification: 'required',
      },
    });

    return true;
  }

  if (method === 'POST' && path === '/api/v1/backup/confirmation/passkey/verify') {
    const ceremonyId: MockApi_HandleRequest_CeremonyId = String(body['ceremonyId'] ?? '');
    const purpose: MockApi_HandleRequest_Purpose = (body['purpose'] === 'export' || body['purpose'] === 'import') ? body['purpose'] : null;

    if (purpose === null || backupPasskeyPurposes.get(ceremonyId) !== purpose) {
      sendError(response, 409, 'passkey_ceremony_invalid', 'That passkey request expired. Try again.');

      return true;
    }

    backupPasskeyPurposes.delete(ceremonyId);

    issueBackupGrant(purpose);

    return true;
  }

  if (method === 'POST' && path === '/api/v1/backup/export') {
    if (
      backupGrant === null
      || backupGrant['expiresAt'] <= Date.now()
      || backupGrant['purpose'] !== 'export'
      || body['grant'] !== backupGrant['token']
    ) {
      sendError(response, 401, 'backup_confirmation_expired', 'Confirm it\'s you again.');

      return true;
    }

    backupGrant = null;

    const sections: MockApi_HandleRequest_ExportSections = (typeof body['sections'] === 'object' && body['sections'] !== null) ? body['sections'] as MockApi_HandleRequest_ExportSections : {};
    const document: MockApi_HandleRequest_ExportDocument = {
      appVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      format: 'pfsense-actions-export',
      version: 1,
    };

    if (sections['connection'] === true) {
      document.connection = (connection === null) ? null : {
        credential: connectionCredential,
        credentialType: connection['credentialType'],
        pfsenseSshIp: connection['pfsenseSshIp'],
        pfsenseSshPort: connection['pfsenseSshPort'],
        pfsenseUsername: connection['pfsenseUsername'],
      };
    }

    if (sections['notifications'] === true) {
      document.notifications = notifications.map((notification) => ({
        events: [...notification['events']],
        id: notification['id'],
        name: notification['name'],
        secrets: Object.fromEntries(Object.keys(notification['secrets']).map((key): MockApi_HandleRequest_ExportSecretEntry => [
          key,
          [
            'mock-',
            key,
            '-secret',
          ].join(''),
        ])),
        service: notification['service'],
        settings: { ...notification['settings'] },
      }));
    }

    if (sections['accessTokens'] === true) {
      document.accessTokens = tokens.map((token) => ({
        ...token,
        tokenHash: tokenHashes.get(token['id']) ?? randomBytes(32).toString('hex'),
      }));
    }

    response.setHeader('Content-Disposition', [
      'attachment; filename="pfsense-actions-export-',
      document['exportedAt'].slice(0, 10),
      '.json"',
    ].join(''));

    sendJSON(response, 200, document);

    return true;
  }

  if (method === 'POST' && path === '/api/v1/backup/imports/preview') {
    const document: MockApi_HandleRequest_Document = (typeof body['document'] === 'object' && body['document'] !== null) ? body['document'] as MockApi_HandleRequest_Document : null;

    if (
      document === null
      || document['format'] !== 'pfsense-actions-export'
      || document['version'] !== 1
    ) {
      sendError(response, 422, 'invalid_request', 'Choose a valid pfSense Actions export file.');

      return true;
    }

    const summary: MockApi_HandleRequest_Summary = backupSummary(document);
    const sections: MockApi_HandleRequest_PreviewSections = [];

    if (Object.hasOwn(document, 'connection') === true) {
      sections.push({
        file: (document['connection'] === null) ? 'No saved connection' : [
          (document['connection'] !== undefined) ? document['connection']['pfsenseSshIp'] : '',
          ':',
          String((document['connection'] !== undefined) ? document['connection']['pfsenseSshPort'] : ''),
        ].join(''),
        here: (connection === null) ? 'No saved connection' : [
          connection['pfsenseSshIp'],
          ':',
          String(connection['pfsenseSshPort']),
        ].join(''),
        id: 'connection',
        label: 'Connection',
        ...((document['connection'] === null) ? { reason: 'The file does not contain a saved connection.' } : {}),
        willImport: document['connection'] !== null,
      });
    }

    if (document['notifications'] !== undefined) {
      sections.push({
        file: [
          String(document['notifications'].length),
          ' targets',
        ].join(''),
        here: [
          String(notifications.length),
          ' targets',
        ].join(''),
        id: 'notifications',
        label: 'Notifications',
        willImport: true,
      });
    }

    if (document['accessTokens'] !== undefined) {
      sections.push({
        file: [
          String(document['accessTokens'].length),
          ' tokens',
        ].join(''),
        here: [
          String(tokens.length),
          ' tokens',
        ].join(''),
        id: 'accessTokens',
        label: 'Access tokens',
        willImport: true,
      });
    }

    sendJSON(response, 200, {
      appVersion: document['appVersion'],
      exportedAt: document['exportedAt'],
      sections,
      summary,
    });

    return true;
  }

  if (method === 'POST' && path === '/api/v1/backup/imports') {
    const document: MockApi_HandleRequest_Document = (typeof body['document'] === 'object' && body['document'] !== null) ? body['document'] as MockApi_HandleRequest_Document : null;

    if (
      document === null
      || backupGrant === null
      || backupGrant['expiresAt'] <= Date.now()
      || backupGrant['purpose'] !== 'import'
      || body['grant'] !== backupGrant['token']
    ) {
      sendError(response, 401, 'backup_confirmation_expired', 'Confirm it\'s you again.');

      return true;
    }

    backupGrant = null;

    const summary: MockApi_HandleRequest_Summary = backupSummary(document);
    const importedSections: MockApi_HandleRequest_ImportedSections = [];

    if (document['connection'] !== undefined && document['connection'] !== null) {
      connection = {
        credentialSaved: true,
        credentialType: document['connection']['credentialType'],
        pfsenseSshIp: document['connection']['pfsenseSshIp'],
        pfsenseSshPort: document['connection']['pfsenseSshPort'],
        pfsenseUsername: document['connection']['pfsenseUsername'],
      };
      connectionCredential = document['connection']['credential'];

      importedSections.push('connection');
    }

    if (document['notifications'] !== undefined) {
      for (const imported of document['notifications']) {
        const index: MockApi_HandleRequest_Index = notifications.findIndex((notification) => notification['name'].toLocaleLowerCase() === imported['name'].toLocaleLowerCase());
        const existing: MockApi_HandleRequest_Existing = notifications[index];
        const now: MockApi_HandleRequest_Now = new Date().toISOString();
        const notification: MockApi_HandleRequest_Notification = {
          createdAt: (existing !== undefined) ? existing['createdAt'] : now,
          events: [...imported['events']],
          id: (existing !== undefined) ? existing['id'] : imported['id'],
          lastAttemptAt: (existing !== undefined) ? existing['lastAttemptAt'] : null,
          lastError: (existing !== undefined) ? existing['lastError'] : null,
          name: imported['name'],
          secrets: Object.fromEntries(Object.keys(imported['secrets']).map((key): MockApi_HandleRequest_ImportedSecretEntry => [
            key,
            true,
          ])),
          secretsMissing: [],
          service: imported['service'],
          settings: { ...imported['settings'] },
          updatedAt: now,
        };

        if (existing === undefined) {
          notifications.push(notification);
        } else {
          Reflect.set(notifications, index, notification);
        }
      }

      importedSections.push('notifications');
    }

    if (document['accessTokens'] !== undefined) {
      const existingIds: MockApi_HandleRequest_ExistingIds = new Set(tokens.map((token) => token['id']));
      const existingNames: MockApi_HandleRequest_ExistingNames = new Set(tokens.map((token) => token['name'].toLocaleLowerCase()));
      const existingHashes: MockApi_HandleRequest_ExistingHashes = new Set(tokenHashes.values());

      for (const imported of document['accessTokens']) {
        if (
          existingIds.has(imported['id']) === true
          || existingNames.has(imported['name'].toLocaleLowerCase()) === true
          || existingHashes.has(imported['tokenHash']) === true
        ) {
          continue;
        }

        tokens.push({
          createdAt: imported['createdAt'],
          expiresAt: imported['expiresAt'],
          id: imported['id'],
          lastUsedAt: imported['lastUsedAt'],
          name: imported['name'],
          scopes: imported['scopes'],
        });

        tokenHashes.set(imported['id'], imported['tokenHash']);

        existingIds.add(imported['id']);

        existingNames.add(imported['name'].toLocaleLowerCase());

        existingHashes.add(imported['tokenHash']);
      }

      importedSections.push('accessTokens');
    }

    recordActivity({
      action: 'backup-imported',
      actorId: currentUsername,
      category: 'configuration',
      outcome: 'succeeded',
      summary: 'Imported backup configuration',
    });

    sendJSON(response, 200, {
      ...summary,
      importedSections,
    });

    return true;
  }

  if (method === 'GET' && path === '/api/v1/auth/me') {
    sendJSON(response, 200, {
      administratorId: '00000000-0000-4000-8000-000000000001',
      authenticationType: 'session',
      id: 'mock-session',
      removedSecrets,
      username: currentUsername,
    });

    return true;
  }

  if (method === 'DELETE' && path === '/api/v1/auth/removed-secrets') {
    removedSecrets = [];

    sendEmpty(response);

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/logout') {
    signedIn = false;

    sendEmpty(response);

    return true;
  }

  if (method === 'GET' && path === '/api/v1/auth/security') {
    sendJSON(response, 200, {
      hostname: url.hostname,
      passkeys,
      passkeysAvailable: true,
      recoveryCodesRemaining: recoveryCodes.length,
      totpEnabled,
      username: currentUsername,
    });

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/password') {
    if (checkPassword('currentPassword') === false) {
      return true;
    }

    if (String(body['newPassword'] ?? '').length < 12) {
      sendFieldError(response, 422, 'invalid_request', 'newPassword', 'Use at least 12 characters.');

      return true;
    }

    if (administrator !== null) {
      administrator.password = String(body['newPassword']);
    }

    sendEmpty(response);

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/username') {
    const newUsernameIssue: MockApi_HandleRequest_NewUsernameIssue = usernameIssue(String(body['username'] ?? '').trim());

    if (newUsernameIssue !== '') {
      sendFieldError(response, 422, 'invalid_request', 'username', newUsernameIssue);

      return true;
    }

    if (checkPassword() === false) {
      return true;
    }

    if (administrator !== null) {
      administrator.username = String(body['username'] ?? '').trim();
    }

    sendJSON(response, 200, {
      administrator: {
        id: '00000000-0000-4000-8000-000000000001',
        username: (administrator !== null) ? administrator['username'] : 'admin',
      },
    });

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/totp/setup') {
    if (checkPassword() === false) {
      return true;
    }

    // The same URI and QR code options as the real server, so the code scans.
    const totpUri: MockApi_HandleRequest_TotpUri = `otpauth://totp/pfSense%20Actions:${encodeURIComponent(currentUsername)}?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=pfSense%20Actions&algorithm=SHA1&digits=6&period=30`;

    totpPending = true;

    sendJSON(response, 200, {
      expiresAt: new Date(Date.now() + (10 * minute)).toISOString(),
      qrCode: await toDataURL(totpUri, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 240,
      }),
      secret: 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP',
      uri: totpUri,
    });

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/totp/enable') {
    if (totpPending === false) {
      sendError(response, 409, 'totp_setup_expired', 'Authenticator setup expired. Start again.');

      return true;
    }

    if (body['code'] !== '123456') {
      sendFieldError(response, 422, 'code_invalid', 'code', 'That code doesn\'t match. Check the time on your device and try again. In the mock, use 123456.');

      return true;
    }

    totpEnabled = true;
    totpPending = false;
    recoveryCodes = newRecoveryCodes();
    removedSecrets = removedSecrets.filter((removedSecret) => removedSecret['kind'] !== 'authenticator');

    sendJSON(response, 200, { recoveryCodes });

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/totp/disable') {
    if (checkPassword() === false) {
      return true;
    }

    totpEnabled = false;
    recoveryCodes = [];

    sendEmpty(response);

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/recovery-codes') {
    if (checkPassword() === false) {
      return true;
    }

    recoveryCodes = newRecoveryCodes();

    sendJSON(response, 200, { recoveryCodes });

    return true;
  }

  // Adding a passkey runs the browser's real prompt; the mock saves whatever answer comes back.
  if (method === 'POST' && path === '/api/v1/auth/passkeys/register/options') {
    const passkeyName: MockApi_HandleRequest_PasskeyName = (typeof body['name'] === 'string') ? body['name'].trim() : '';

    if (passkeyName === '' || [...passkeyName].length > 80) {
      sendFieldError(response, 422, 'invalid_request', 'name', (passkeyName === '') ? 'Name this passkey.' : 'Use 80 characters or fewer.');

      return true;
    }

    if (checkPassword() === false) {
      return true;
    }

    const ceremonyId: MockApi_HandleRequest_CeremonyId = randomBytes(16).toString('base64url');

    passkeyCeremonies.set(ceremonyId, passkeyName);

    sendJSON(response, 200, {
      ceremonyId,
      options: {
        attestation: 'none',
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'preferred',
        },
        challenge: randomBytes(32).toString('base64url'),
        excludeCredentials: [],
        pubKeyCredParams: [
          {
            alg: -7,
            type: 'public-key',
          },
          {
            alg: -257,
            type: 'public-key',
          },
        ],
        rp: {
          id: url.hostname,
          name: 'pfSense Actions',
        },
        timeout: 300000,
        user: {
          displayName: currentUsername,
          id: Buffer.from('00000000-0000-4000-8000-000000000001').toString('base64url'),
          name: currentUsername,
        },
      },
    });

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/passkeys/register/verify') {
    const ceremonyId: MockApi_HandleRequest_CeremonyId = (typeof body['ceremonyId'] === 'string') ? body['ceremonyId'] : '';
    const passkeyName: MockApi_HandleRequest_CeremonyPasskeyName = passkeyCeremonies.get(ceremonyId);

    if (passkeyName === undefined) {
      sendError(response, 409, 'passkey_ceremony_invalid', 'That passkey request expired. Try again.');

      return true;
    }

    const passkey: MockApi_HandleRequest_Passkey = {
      createdAt: new Date().toISOString(),
      hostname: url.hostname,
      id: `pk-${randomBytes(12).toString('base64url')}`,
      lastUsedAt: null,
      name: passkeyName,
    };

    passkeyCeremonies.delete(ceremonyId);

    passkeys = [
      ...passkeys,
      passkey,
    ];

    sendJSON(response, 201, passkey);

    return true;
  }

  if (method === 'DELETE' && path.startsWith('/api/v1/auth/passkeys/') === true) {
    const passkeyId: MockApi_HandleRequest_PasskeyId = decodeURIComponent(path.slice('/api/v1/auth/passkeys/'.length));

    if (passkeys.some((passkey) => passkey['id'] === passkeyId) === false) {
      sendError(response, 404, 'passkey_not_found', 'That passkey no longer exists.');

      return true;
    }

    if (checkPassword() === false) {
      return true;
    }

    passkeys = passkeys.filter((passkey) => passkey['id'] !== passkeyId);

    sendEmpty(response);

    return true;
  }

  if (method === 'GET' && path === '/api/v1/notifications/events') {
    sendJSON(response, 200, { items: notificationEvents });

    return true;
  }

  if (method === 'GET' && path === '/api/v1/notifications') {
    sendJSON(response, 200, { items: [...notifications].sort((left, right) => right['createdAt'].localeCompare(left['createdAt'])) });

    return true;
  }

  // notificationInput checks a create or edit body like the server, sending the first problem.

  /**
   * Mock API - Notification input.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {MockApi_HandleRequest_NotificationInput_Returns}
   *
   * @since 2.0.0
   */
  const notificationInput: MockApi_HandleRequest_NotificationInput = (existing: MockApi_HandleRequest_NotificationInput_Existing): MockApi_HandleRequest_NotificationInput_Returns => {
    const service: MockApi_HandleRequest_NotificationInput_Service = (existing !== null) ? existing['service'] : body['service'] as MockApi_MockNotificationService;
    const name: MockApi_HandleRequest_NotificationInput_Name = (typeof body['name'] === 'string') ? body['name'].trim() : '';
    const events: MockApi_HandleRequest_NotificationInput_Events = (Array.isArray(body['events']) === true) ? body['events'] as MockApi_HandleRequest_NotificationInput_Events : [];
    const values: MockApi_HandleRequest_NotificationInput_Values = (typeof body['settings'] === 'object' && body['settings'] !== null) ? body['settings'] as MockApi_HandleRequest_NotificationInput_Values : {};

    if (notificationFields[service] === undefined) {
      sendFieldError(response, 422, 'invalid_request', 'service', 'Choose a service.');

      return null;
    }

    if (name === '') {
      sendFieldError(response, 422, 'invalid_request', 'name', 'Name this notification.');

      return null;
    }

    if (events.length === 0) {
      sendFieldError(response, 422, 'invalid_request', 'events', 'Choose at least one event.');

      return null;
    }

    const settings: MockApi_HandleRequest_NotificationInput_Settings = {};
    const secrets: MockApi_HandleRequest_NotificationInput_Secrets = { ...((existing !== null) ? existing['secrets'] : {}) };

    for (const notificationField of notificationFields[service]) {
      const key: MockApi_HandleRequest_NotificationInput_Key = notificationField[0];
      const missing: MockApi_HandleRequest_NotificationInput_Missing = notificationField[1];
      const secret: MockApi_HandleRequest_NotificationInput_Secret = notificationField[2];
      const required: MockApi_HandleRequest_NotificationInput_Required = notificationField[3];
      const value: MockApi_HandleRequest_NotificationInput_Value = (typeof values[key] === 'string') ? (values[key]).trim() : '';
      const saved: MockApi_HandleRequest_NotificationInput_Saved = (
        secret === true
        && existing !== null
        && existing['secrets'][key] === true
      );

      if (
        value === ''
        && required === true
        && saved === false
      ) {
        sendFieldError(response, 422, 'invalid_request', `settings.${key}`, missing);

        return null;
      }

      if (value !== '' && secret === true) {
        Reflect.set(secrets, key, true);
      } else if (value !== '') {
        Reflect.set(settings, key, value);
      }
    }

    // Optional secrets that are saved, or missing after a lost key, can be cleared once each, never alongside a new value.
    const clearable: MockApi_HandleRequest_NotificationInput_Clearable = notificationFields[service]
      .filter((field) => {
        return (
          field[2] === true
          && field[3] === false
          && existing !== null
          && (
            existing['secrets'][field[0]] === true
            || existing['secretsMissing'].includes(field[0]) === true
          )
        );
      })
      .map((field) => field[0]);
    const clearSecrets: MockApi_HandleRequest_NotificationInput_ClearSecrets = (Array.isArray(body['clearSecrets']) === true) ? body['clearSecrets'] : [];
    const invalidIndex: MockApi_HandleRequest_NotificationInput_InvalidIndex = clearSecrets.findIndex((key) => typeof key !== 'string' || clearable.includes(key) === false);

    if (body['clearSecrets'] !== undefined && Array.isArray(body['clearSecrets']) === false) {
      sendFieldError(response, 422, 'invalid_request', 'clearSecrets', 'Choose an optional saved secret.');

      return null;
    }

    if (invalidIndex !== -1) {
      sendFieldError(response, 422, 'invalid_request', `clearSecrets.${invalidIndex}`, 'Choose an optional saved secret.');

      return null;
    }

    if (new Set(clearSecrets).size !== clearSecrets.length) {
      sendFieldError(response, 422, 'invalid_request', 'clearSecrets', 'Choose each secret only once.');

      return null;
    }

    const replaced: MockApi_HandleRequest_NotificationInput_Replaced = (clearSecrets as MockApi_HandleRequest_NotificationInput_ClearSecretKeys).find((key) => typeof values[key] === 'string' && (values[key]).trim() !== '');

    if (replaced !== undefined) {
      sendFieldError(response, 422, 'invalid_request', `settings.${replaced}`, 'Enter a new value or clear this field, not both.');

      return null;
    }

    for (const key of clearSecrets as MockApi_HandleRequest_NotificationInput_ClearSecretKeys) {
      Reflect.deleteProperty(secrets, key);
    }

    if (notifications.some((notification) => notification['id'] !== ((existing !== null) ? existing['id'] : undefined) && notification['name'].toLowerCase() === name.toLowerCase()) === true) {
      sendFieldError(response, 409, 'notification_exists', 'name', 'A notification with this name already exists.');

      return null;
    }

    return {
      events,
      name,
      clearSecrets: clearSecrets as MockApi_HandleRequest_NotificationInput_ClearSecretKeys,
      secrets,
      service,
      settings,
    };
  };

  if (method === 'POST' && path === '/api/v1/notifications') {
    const input: MockApi_HandleRequest_NotificationInputResult = notificationInput(null);

    if (input === null) {
      return true;
    }

    const notification: MockApi_HandleRequest_Notification = {
      events: input['events'],
      name: input['name'],
      secrets: input['secrets'],
      service: input['service'],
      settings: input['settings'],
      createdAt: new Date().toISOString(),
      id: `ntf-${randomBytes(8).toString('hex')}`,
      lastAttemptAt: null,
      lastError: null,
      secretsMissing: [],
      updatedAt: new Date().toISOString(),
    };

    notifications.push(notification);

    recordActivity({
      action: 'notification-created',
      actorId: currentUsername,
      category: 'configuration',
      outcome: 'succeeded',
      summary: `Added notification ${notification['name']}`,
    });

    sendJSON(response, 201, notification);

    return true;
  }

  const notificationMatch: MockApi_HandleRequest_NotificationMatch = path.match(new RegExp(notificationPathPattern, 'u'));

  if (notificationMatch !== null) {
    const index: MockApi_HandleRequest_Index = notifications.findIndex((notification) => notification['id'] === notificationMatch[1]);
    const notification: MockApi_HandleRequest_FoundNotification = notifications[index];

    if (notification === undefined) {
      sendError(response, 404, 'notification_not_found', 'That notification no longer exists.');

      return true;
    }

    if (method === 'POST' && notificationMatch[2] === '/test') {
      if (notification['secretsMissing'].length > 0) {
        sendJSON(response, 200, {
          delivered: false,
          message: 'Enter the removed secrets again first.',
        });

        return true;
      }

      notification.lastAttemptAt = new Date().toISOString();
      notification.lastError = null;

      sendJSON(response, 200, { delivered: true });

      return true;
    }

    if (method === 'DELETE') {
      notifications.splice(index, 1);

      removedSecrets = removedSecrets.filter((removedSecret) => removedSecret['notificationId'] !== notification['id']);

      recordActivity({
        action: 'notification-removed',
        actorId: currentUsername,
        category: 'configuration',
        outcome: 'succeeded',
        summary: `Removed notification ${notification['name']}`,
      });

      sendEmpty(response);

      return true;
    }

    if (method === 'PUT') {
      const input: MockApi_HandleRequest_NotificationInputResult = notificationInput(notification);

      if (input === null) {
        return true;
      }

      notification.events = input['events'];
      notification.name = input['name'];
      notification.secrets = input['secrets'];

      // A missing secret is settled by entering it again or, when optional, by clearing it.
      notification.secretsMissing = notification['secretsMissing'].filter((key) => input['secrets'][key] !== true && input['clearSecrets'].includes(key) === false);
      notification.settings = input['settings'];
      notification.updatedAt = new Date().toISOString();

      if (notification['secretsMissing'].length === 0) {
        removedSecrets = removedSecrets.filter((removedSecret) => removedSecret['notificationId'] !== notification['id']);
      }

      recordActivity({
        action: 'notification-updated',
        actorId: currentUsername,
        category: 'configuration',
        outcome: 'succeeded',
        summary: `Updated notification ${notification['name']}`,
      });

      sendJSON(response, 200, notification);

      return true;
    }
  }

  if (method === 'GET' && path === '/api/v1/auth/tokens') {
    sendJSON(response, 200, { items: [...tokens].sort((left, right) => right['createdAt'].localeCompare(left['createdAt'])) });

    return true;
  }

  // tokenInput reads and checks a create or edit body, sending the first problem it finds.

  /**
   * Mock API - Token input.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {MockApi_HandleRequest_TokenInput_Returns}
   *
   * @since 2.0.0
   */
  const tokenInput: MockApi_HandleRequest_TokenInput = (exceptId: MockApi_HandleRequest_TokenInput_ExceptId): MockApi_HandleRequest_TokenInput_Returns => {
    const name: MockApi_HandleRequest_TokenInput_Name = (typeof body['name'] === 'string') ? body['name'].trim() : '';
    const scopes: MockApi_HandleRequest_TokenInput_Scopes = (Array.isArray(body['scopes']) === true) ? body['scopes'] as MockApi_HandleRequest_TokenInput_Scopes : [];

    if (name === '') {
      sendFieldError(response, 422, 'invalid_request', 'name', 'Name this token.');

      return null;
    }

    if (name.length > 80) {
      sendFieldError(response, 422, 'invalid_request', 'name', 'Use 80 characters or fewer.');

      return null;
    }

    if (scopes.length === 0) {
      sendFieldError(response, 422, 'invalid_request', 'scopes', 'Choose at least one scope.');

      return null;
    }

    if (tokens.some((token) => token['id'] !== exceptId && token['name'].toLowerCase() === name.toLowerCase()) === true) {
      sendFieldError(response, 409, 'token_exists', 'name', 'A token with this name already exists.');

      return null;
    }

    return {
      name,
      scopes: scopeOrder.filter((scope) => scopes.includes(scope)),
    };
  };

  if (method === 'POST' && path === '/api/v1/auth/tokens') {
    const input: MockApi_HandleRequest_TokenInputResult = tokenInput('');

    if (input === null) {
      return true;
    }

    const plaintext: MockApi_HandleRequest_Plaintext = [
      'pfa_',
      randomBytes(32).toString('base64url'),
    ].join('');
    const token: MockApi_HandleRequest_Token = {
      createdAt: new Date().toISOString(),
      expiresAt: (typeof body['expiresAt'] === 'string') ? body['expiresAt'] : null,
      id: `tok-${randomBytes(8).toString('hex')}`,
      lastUsedAt: null,
      name: input['name'],
      scopes: input['scopes'],
    };

    tokens.push(token);

    tokenHashes.set(token['id'], randomBytes(32).toString('hex'));

    recordActivity({
      action: 'token-created',
      actorId: currentUsername,
      category: 'token',
      outcome: 'succeeded',
      summary: `Created personal access token ${token['name']}`,
    });

    sendJSON(response, 201, {
      plaintext,
      token,
    });

    return true;
  }

  const tokenMatch: MockApi_HandleRequest_TokenMatch = path.match(new RegExp(tokenPathPattern, 'u'));

  if (tokenMatch !== null) {
    const index: MockApi_HandleRequest_Index = tokens.findIndex((token) => token['id'] === tokenMatch[1]);
    const token: MockApi_HandleRequest_FoundToken = tokens[index];

    if (token === undefined) {
      sendError(response, 404, 'token_not_found', 'That token no longer exists.');

      return true;
    }

    if (method === 'DELETE') {
      tokens.splice(index, 1);

      tokenHashes.delete(token['id']);

      recordActivity({
        action: 'token-revoked',
        actorId: currentUsername,
        category: 'token',
        outcome: 'succeeded',
        summary: `Revoked personal access token ${token['name']}`,
      });

      sendEmpty(response);

      return true;
    }

    if (method === 'PUT') {
      const input: MockApi_HandleRequest_TokenInputResult = tokenInput(token['id']);

      if (input === null) {
        return true;
      }

      token.name = input['name'];
      token.scopes = input['scopes'];

      if (body['expiresAt'] !== undefined) {
        token.expiresAt = (typeof body['expiresAt'] === 'string') ? body['expiresAt'] : null;
      }

      recordActivity({
        action: 'token-updated',
        actorId: currentUsername,
        category: 'token',
        outcome: 'succeeded',
        summary: `Updated personal access token ${token['name']}`,
      });

      sendJSON(response, 200, token);

      return true;
    }
  }

  if (method === 'GET' && path === '/api/v1/overview') {
    sendJSON(response, 200, {
      activityCount: activity.length,
      administrator: (administrator === null) ? null : {
        createdAt: administrator['createdAt'],
        username: administrator['username'],
      },
      connection: connectionResource(),
      tokenCount: tokens.length,
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000) + (3 * 24 * 3600) + 7200,
      version: '2.0.0',
    });

    return true;
  }

  if (method === 'GET' && path === '/api/v1/activity') {
    sendJSON(response, 200, { items: activity });

    return true;
  }

  if (method === 'GET' && path === '/api/v1/diagnostics') {
    sendJSON(response, 200, { debugLogging });

    return true;
  }

  if (method === 'PUT' && path === '/api/v1/diagnostics') {
    if (typeof body['debugLogging'] !== 'boolean') {
      sendFieldError(response, 422, 'invalid_request', 'debugLogging', 'Choose on or off.');

      return true;
    }

    if (body['debugLogging'] !== debugLogging) {
      debugLogging = body['debugLogging'];

      recordActivity({
        action: 'debug-logging-updated',
        actorId: currentUsername,
        category: 'configuration',
        outcome: 'succeeded',
        summary: (debugLogging === true) ? 'Turned debug logging on' : 'Turned debug logging off',
      });
    }

    sendJSON(response, 200, { debugLogging });

    return true;
  }

  if (method === 'GET' && path === '/api/v1/connection') {
    sendJSON(response, 200, connectionResource());

    return true;
  }

  if (method === 'POST' && path === '/api/v1/connection/test') {
    if (connection === null) {
      sendError(response, 409, 'connection_not_configured', 'Save the pfSense connection first.');

      return true;
    }

    if (connection['credentialSaved'] === false) {
      sendError(response, 409, 'connection_not_configured', 'Enter the password or private key again, then save the connection.');

      return true;
    }

    const connected: MockApi_HandleRequest_Connected = connection['pfsenseSshIp'] !== '192.0.2.66';

    recordActivity({
      action: 'connection-tested',
      actorId: currentUsername,
      category: 'configuration',
      outcome: (connected === true) ? 'succeeded' : 'failed',
      summary: (connected === true) ? 'Verified the saved pfSense SSH connection' : 'Could not verify the saved pfSense SSH connection',
    });

    sendJSON(response, 200, { connected });

    return true;
  }

  if (method === 'PUT' && path === '/api/v1/connection') {
    const address: MockApi_HandleRequest_Address = String(body['pfsenseSshIp'] ?? '').trim();

    if (new RegExp(ipAddressPattern, 'u').test(address) === false) {
      sendFieldError(response, 422, 'invalid_request', 'pfsenseSshIp', 'Enter an IPv4 or IPv6 address.');

      return true;
    }

    if (
      body['credential'] === undefined
      && (
        connection === null
        || connection['credentialSaved'] === false
        || connection['credentialType'] !== body['credentialType']
      )
    ) {
      sendFieldError(response, 422, 'credential_required', 'credential', (body['credentialType'] === 'password') ? 'Enter the SSH password.' : 'Paste the SSH private key.');

      return true;
    }

    if (address === '192.0.2.66') {
      recordActivity({
        action: 'connection-update',
        actorId: currentUsername,
        category: 'configuration',
        outcome: 'failed',
        summary: 'Rejected pfSense SSH settings that could not sign in',
      });

      sendError(response, 502, 'connection_failed', 'pfSense Actions couldn\'t sign in over SSH with these settings. Nothing was saved.');

      return true;
    }

    removedSecrets = removedSecrets.filter((removedSecret) => removedSecret['kind'] !== 'pfsense-credential');
    connection = {
      credentialSaved: true,
      credentialType: (body['credentialType'] === 'password') ? 'password' : 'privateKey',
      pfsenseSshIp: address,
      pfsenseSshPort: Number(body['pfsenseSshPort'] ?? 22),
      pfsenseUsername: String(body['pfsenseUsername'] ?? '').trim(),
    };

    if (typeof body['credential'] === 'string') {
      connectionCredential = body['credential'];
    }

    recordActivity({
      action: 'connection-updated',
      actorId: currentUsername,
      category: 'configuration',
      outcome: 'succeeded',
      summary: 'Updated the pfSense SSH connection',
    });

    sendJSON(response, 200, connectionResource());

    return true;
  }

  sendError(response, 404, 'not_found', 'No route matches this request.');

  return true;
};

/**
 * Mock API.
 *
 * Answers the console's API from memory so the interface can run without a firewall.
 * The setup code is printed when the dev server starts; the authenticator code is 123456,
 * and recovery codes are random, shown once when they're made.
 *
 * @returns {MockApi_MockApi_Returns}
 *
 * @since 2.0.0
 */
export const mockApi = (): MockApi_MockApi_Returns => ({
  name: 'pfsense-actions-mock-api',
  configureServer: (server) => {
    server.config.logger.info(`  Mock setup code: ${setupCode}`);

    server.middlewares.use((request: MockApi_MockApi_Request, response: MockApi_MockApi_Response, next: MockApi_MockApi_Next) => {
      void handleRequest(request, response).then((handled) => {
        if (handled === false) {
          next();
        }

        return;
      });

      return;
    });

    return;
  },
});
