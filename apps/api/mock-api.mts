import { randomBytes } from 'node:crypto';

import { toDataURL } from 'qrcode';

import type {
  IncomingMessage,
  ServerResponse,
} from 'node:http';

import type { Plugin } from 'vite';

/**
 * Mock API - Mock scope.
 *
 * Names this local contract so fixtures and handlers agree.
 * Keeping one shape prevents the surrounding workflow from drifting.
 *
 * @since 2.0.0
 */
type MockScope = 'pfsense:read' | 'reachability:read' | 'wol:execute';

/**
 * Mock API - Mock token.
 *
 * Names this local contract so fixtures and handlers agree.
 * Keeping one shape prevents the surrounding workflow from drifting.
 *
 * @since 2.0.0
 */
type MockToken = {
  createdAt: string
  expiresAt: string | null
  id: string
  lastUsedAt: string | null
  name: string
  scopes: MockScope[]
};

/**
 * Mock API - Mock passkey.
 *
 * Names this local contract so fixtures and handlers agree.
 * Keeping one shape prevents the surrounding workflow from drifting.
 *
 * @since 2.0.0
 */
type MockPasskey = {
  createdAt: string
  hostname: string | null
  id: string
  lastUsedAt: string | null
  name: string
};

/**
 * Mock API - Mock token input.
 *
 * Names this local contract so fixtures and handlers agree.
 * Keeping one shape prevents the surrounding workflow from drifting.
 *
 * @since 2.0.0
 */
type MockTokenInput = {
  name: string
  scopes: MockScope[]
};

/**
 * Mock API - Mock activity.
 *
 * Names this local contract so fixtures and handlers agree.
 * Keeping one shape prevents the surrounding workflow from drifting.
 *
 * @since 2.0.0
 */
type MockActivity = {
  action: string
  actorId: string
  category: 'access' | 'configuration' | 'service' | 'token'
  createdAt: string
  id: string
  outcome: 'failed' | 'succeeded'
  summary: string
};

/**
 * Mock API - Mock connection.
 *
 * Names this local contract so fixtures and handlers agree.
 * Keeping one shape prevents the surrounding workflow from drifting.
 *
 * @since 2.0.0
 */
type MockConnection = {
  credentialSaved: boolean
  credentialType: 'password' | 'privateKey'
  pfsenseSshIp: string
  pfsenseSshPort: number
  pfsenseUsername: string
};

/**
 * Mock API - Mock notification service.
 *
 * Names this local contract so fixtures and handlers agree.
 * Keeping one shape prevents the surrounding workflow from drifting.
 *
 * @since 2.0.0
 */
type MockNotificationService = 'apprise' | 'discord' | 'email' | 'gotify' | 'matrix' | 'ntfy' | 'ntfy-reverse-proxy' | 'pushover' | 'slack' | 'telegram' | 'webhook';

/**
 * Mock API - Mock notification.
 *
 * Names this local contract so fixtures and handlers agree.
 * Keeping one shape prevents the surrounding workflow from drifting.
 *
 * @since 2.0.0
 */
type MockNotification = {
  createdAt: string
  events: string[]
  id: string
  lastAttemptAt: string | null
  lastError: string | null
  name: string
  secrets: Record<string, true>
  secretsMissing: string[]
  service: MockNotificationService
  settings: Record<string, string>
  updatedAt: string
};

// MockNotificationField is one service field: [key, message when missing, secret, required].

/**
 * Mock API - Mock notification field.
 *
 * Names this local contract so fixtures and handlers agree.
 * Keeping one shape prevents the surrounding workflow from drifting.
 *
 * @since 2.0.0
 */
type MockNotificationField = [string, string, boolean, boolean];

// MockNotificationInput is a checked create or edit body, with the optional secrets to clear.

/**
 * Mock API - Mock notification input.
 *
 * Names this local contract so fixtures and handlers agree.
 * Keeping one shape prevents the surrounding workflow from drifting.
 *
 * @since 2.0.0
 */
type MockNotificationInput = Pick<MockNotification, 'events' | 'name' | 'secrets' | 'service' | 'settings'> & {
  clearSecrets: string[]
};

// Each service's fields: [key, message when missing, secret, required].

/**
 * Mock API - Notification fields.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const notificationFields: Record<MockNotificationService, [string, string, boolean, boolean][]> = {
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
const notificationEvents: {
  defaultEnabled: boolean
  description: string
  key: string
  label: string
}[] = [
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
const scopeOrder: MockScope[] = [
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
const setupCode: string = 'ABCDE-FGHJK-LMNPQ';

/**
 * Mock API - Csrf token.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const csrfToken: string = 'pfc_mockmockmockmockmockmockmockmock';

/**
 * Mock API - Started at.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const startedAt: number = Date.now();

/**
 * Mock API - Minute.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const minute: number = 60 * 1000;

/**
 * Mock API - Administrator.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let administrator: {
  createdAt: string
  password: string
  username: string
} | null = null;

/**
 * Mock API - Signed in.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let signedIn: boolean = false;

/**
 * Mock API - Pending challenge.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let pendingChallenge: string = '';

/**
 * Mock API - TOTP enabled.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let totpEnabled: boolean = false;

/**
 * Mock API - TOTP pending.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let totpPending: boolean = false;

/**
 * Mock API - Recovery codes.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let recoveryCodes: string[] = [];
// Two saved passkeys, so the Password and sign-in page shows a realistic list. Ones added in the mock are kept until it restarts.

/**
 * Mock API - Passkeys.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let passkeys: MockPasskey[] = [
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
const passkeyCeremonies: Map<string, string> = new Map();

/**
 * Mock API - Activity sequence.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let activitySequence: number = 0;
// MOCK_KEY_REPLACED=true starts as if the encryption key had been lost, to show the notice.

/**
 * Mock API - Key replaced.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const keyReplaced: boolean = process.env['MOCK_KEY_REPLACED'] === 'true';

/**
 * Mock API - Removed secrets.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
let removedSecrets: {
  credentialType?: 'password' | 'privateKey'
  kind: 'authenticator' | 'notification' | 'pfsense-credential'
  name?: string
  notificationId?: string
  removedAt: string
}[] = (keyReplaced) ? [
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
let connection: MockConnection | null = {
  credentialSaved: !keyReplaced,
  credentialType: 'privateKey',
  pfsenseSshIp: '192.168.1.1',
  pfsenseSshPort: 22,
  pfsenseUsername: 'admin',
};

/**
 * Mock API - Notifications.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const notifications: MockNotification[] = [
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
if (keyReplaced) {
  for (const notification of [...notifications].sort((left: MockNotification, right: MockNotification): number => left.name.localeCompare(right.name))) {
    const secretKeys: string[] = Object.keys(notification.secrets).sort();

    if (secretKeys.length === 0) {
      continue;
    }

    notification.secrets = {};
    notification.secretsMissing = secretKeys;
    removedSecrets.push({
      kind: 'notification',
      name: notification.name,
      notificationId: notification.id,
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
const tokens: MockToken[] = [
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

/**
 * Mock API - Activity.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
const activity: MockActivity[] = [];

/**
 * Mock API - Records activity.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
const recordActivity = (event: Omit<MockActivity, 'createdAt' | 'id'>, minutesAgo: number = 0): void => {
  activitySequence += 1;
  activity.unshift({
    ...event,
    createdAt: new Date(Date.now() - (minutesAgo * minute)).toISOString(),
    id: `00000000-0000-4000-8000-${String(activitySequence).padStart(12, '0')}`,
  });
  activity.splice(250);
};

[
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
].forEach((event): void => {
  const {
    minutesAgo,
    ...rest
  } = event;

  recordActivity(rest as Omit<MockActivity, 'createdAt' | 'id'>, minutesAgo);
});

// The server records the key replacement when it removes the locked secrets at startup.
if (keyReplaced) {
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
 * @since 2.0.0
 */
const sendJSON = (response: ServerResponse, status: number, body: unknown): void => {
  response.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(body));
};

/**
 * Mock API - Sends empty.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
const sendEmpty = (response: ServerResponse): void => {
  response.writeHead(204).end();
};

/**
 * Mock API - Sends error.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
const sendError = (response: ServerResponse, status: number, code: string, message: string): void => {
  sendJSON(response, status, {
    error: {
      code,
      message,
    },
  });
};

/**
 * Mock API - Sends field error.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
const sendFieldError = (response: ServerResponse, status: number, code: string, field: string, message: string): void => {
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
};

// Marks the mock signed in and answers like the real session response.

/**
 * Mock API - Starts session.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
const startSession = (response: ServerResponse, status: number = 200): void => {
  signedIn = true;
  response.setHeader('Set-Cookie', `pfa_csrf=${csrfToken}; Path=/; SameSite=Strict`);
  sendJSON(response, status, {
    administrator: {
      id: '00000000-0000-4000-8000-000000000001',
      username: administrator?.username ?? 'admin',
    },
    csrfToken,
    expiresAt: new Date(Date.now() + (24 * 60 * minute)).toISOString(),
    status: 'authenticated',
  });
};

/**
 * Mock API - Reads body.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
const readBody = async (request: IncomingMessage): Promise<Record<string, unknown>> => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  const text: string = Buffer.concat(chunks).toString('utf-8');

  return (text === '') ? {} : JSON.parse(text);
};

/**
 * Mock API - Connection resource.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
const connectionResource = (): Record<string, unknown> => ((connection === null) ? { configured: false } : {
  configured: true,
  ...connection,
});

// Codes are compared like the server does: any letter case, with or without spaces and dashes.

/**
 * Mock API - Normalizes code.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
const normalizeCode = (value: string): string => value.toUpperCase().replace(/[\s-]/gu, '');

// Usernames follow the rule every appliance shares: 3 to 64 characters, starting with a letter or number.

/**
 * Mock API - Username issue.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
const usernameIssue = (value: string): string => {
  if (value === '') {
    return 'Enter a username.';
  }

  return (/^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$/u.test(value)) ? '' : 'Use 3 to 64 letters, numbers, periods, underscores, or hyphens, starting with a letter or number.';
};

// newRecoveryCodes makes ten codes the way the server does: ten characters without look-alikes, split 5-5.

/**
 * Mock API - New recovery codes.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
const newRecoveryCodes = (): string[] => Array.from({ length: 10 }, (): string => {
  const code: string = [...randomBytes(10)].map((byte: number): string => '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'.charAt(byte % 32)).join('');

  return `${code.slice(0, 5)}-${code.slice(5)}`;
});

// Answers one console API call, or returns false so Vite serves the page.

/**
 * Mock API - Handles request.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
const handleRequest = async (request: IncomingMessage, response: ServerResponse): Promise<boolean> => {
  // The Host header gives the address the page was opened at, like the real server sees it.
  const url: URL = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const path: string = url.pathname;
  const method: string = request.method ?? 'GET';

  if (!path.startsWith('/api/v1/')) {
    return false;
  }

  const body: Record<string, unknown> = (method === 'GET') ? {} : await readBody(request);

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

    const claimUsernameIssue: string = usernameIssue(String(body['username'] ?? '').trim());

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
      actorId: administrator.username,
      category: 'access',
      outcome: 'succeeded',
      summary: 'Created the administrator account with the setup code',
    });
    startSession(response, 201);

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/login') {
    if (administrator === null || body['username'] !== administrator.username || body['password'] !== administrator.password) {
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

    if (totpEnabled) {
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
    const code: string = String(body['code'] ?? '').trim();
    const isTotpCode: boolean = /^[0-9]{6}$/u.test(code);
    const recoveryCode: string | undefined = (isTotpCode) ? undefined : recoveryCodes.find((candidate: string): boolean => normalizeCode(candidate) === normalizeCode(code));

    if (body['challenge'] !== pendingChallenge || pendingChallenge === '') {
      sendError(response, 401, 'challenge_expired', 'Your sign-in timed out. Enter your password again.');

      return true;
    }

    if ((isTotpCode && code !== '123456') || (!isTotpCode && recoveryCode === undefined)) {
      sendFieldError(response, 401, 'code_invalid', 'code', 'That code doesn\'t match. Try the current code, or a recovery code.');

      return true;
    }

    recoveryCodes = recoveryCodes.filter((candidate: string): boolean => candidate !== recoveryCode);
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

  if (!signedIn) {
    sendError(response, 401, 'authentication_required', 'Sign in to continue.');

    return true;
  }

  if (method !== 'GET' && request.headers['x-csrf-token'] !== csrfToken) {
    sendError(response, 403, 'csrf_invalid', 'The request CSRF token is missing or invalid.');

    return true;
  }

  const currentUsername: string = administrator?.username ?? 'admin';

  /**
   * Mock API - Checks password.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const checkPassword = (field: string = 'password'): boolean => {
    if (body[field] !== administrator?.password) {
      sendFieldError(response, 422, 'password_incorrect', field, 'That password is incorrect.');

      return false;
    }

    return true;
  };

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
    if (!checkPassword('currentPassword')) {
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
    const newUsernameIssue: string = usernameIssue(String(body['username'] ?? '').trim());

    if (newUsernameIssue !== '') {
      sendFieldError(response, 422, 'invalid_request', 'username', newUsernameIssue);

      return true;
    }

    if (!checkPassword()) {
      return true;
    }

    if (administrator !== null) {
      administrator.username = String(body['username'] ?? '').trim();
    }

    sendJSON(response, 200, {
      administrator: {
        id: '00000000-0000-4000-8000-000000000001',
        username: administrator?.username ?? 'admin',
      },
    });

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/totp/setup') {
    if (!checkPassword()) {
      return true;
    }

    // The same URI and QR code options as the real server, so the code scans.
    const totpUri: string = `otpauth://totp/pfSense%20Actions:${encodeURIComponent(currentUsername)}?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=pfSense%20Actions&algorithm=SHA1&digits=6&period=30`;

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
    if (!totpPending) {
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
    removedSecrets = removedSecrets.filter((removedSecret): boolean => removedSecret.kind !== 'authenticator');
    sendJSON(response, 200, { recoveryCodes });

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/totp/disable') {
    if (!checkPassword()) {
      return true;
    }

    totpEnabled = false;
    recoveryCodes = [];
    sendEmpty(response);

    return true;
  }

  if (method === 'POST' && path === '/api/v1/auth/recovery-codes') {
    if (!checkPassword()) {
      return true;
    }

    recoveryCodes = newRecoveryCodes();
    sendJSON(response, 200, { recoveryCodes });

    return true;
  }

  // Adding a passkey runs the browser's real prompt; the mock saves whatever answer comes back.
  if (method === 'POST' && path === '/api/v1/auth/passkeys/register/options') {
    const passkeyName: string = (typeof body['name'] === 'string') ? body['name'].trim() : '';

    if (passkeyName === '' || [...passkeyName].length > 80) {
      sendFieldError(response, 422, 'invalid_request', 'name', (passkeyName === '') ? 'Name this passkey.' : 'Use 80 characters or fewer.');

      return true;
    }

    if (!checkPassword()) {
      return true;
    }

    const ceremonyId: string = randomBytes(16).toString('base64url');

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
    const ceremonyId: string = (typeof body['ceremonyId'] === 'string') ? body['ceremonyId'] : '';
    const passkeyName: string | undefined = passkeyCeremonies.get(ceremonyId);

    if (passkeyName === undefined) {
      sendError(response, 409, 'passkey_ceremony_invalid', 'That passkey request expired. Try again.');

      return true;
    }

    const passkey: MockPasskey = {
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

  if (method === 'DELETE' && path.startsWith('/api/v1/auth/passkeys/')) {
    const passkeyId: string = decodeURIComponent(path.slice('/api/v1/auth/passkeys/'.length));

    if (!passkeys.some((passkey: MockPasskey): boolean => passkey.id === passkeyId)) {
      sendError(response, 404, 'passkey_not_found', 'That passkey no longer exists.');

      return true;
    }

    if (!checkPassword()) {
      return true;
    }

    passkeys = passkeys.filter((passkey: MockPasskey): boolean => passkey.id !== passkeyId);
    sendEmpty(response);

    return true;
  }

  if (method === 'GET' && path === '/api/v1/notifications/events') {
    sendJSON(response, 200, { items: notificationEvents });

    return true;
  }

  if (method === 'GET' && path === '/api/v1/notifications') {
    sendJSON(response, 200, { items: [...notifications].sort((left: MockNotification, right: MockNotification): number => right.createdAt.localeCompare(left.createdAt)) });

    return true;
  }

  // notificationInput checks a create or edit body like the server, sending the first problem.

  /**
   * Mock API - Notification input.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const notificationInput = (existing: MockNotification | null): MockNotificationInput | null => {
    const service: MockNotificationService = existing?.service ?? body['service'] as MockNotificationService;
    const name: string = (typeof body['name'] === 'string') ? body['name'].trim() : '';
    const events: string[] = (Array.isArray(body['events'])) ? body['events'] as string[] : [];
    const values: Record<string, unknown> = (typeof body['settings'] === 'object' && body['settings'] !== null) ? body['settings'] as Record<string, unknown> : {};

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

    const settings: Record<string, string> = {};
    const secrets: Record<string, true> = { ...(existing?.secrets ?? {}) };

    for (const [
      key,
      missing,
      secret,
      required,
    ] of notificationFields[service]) {
      const value: string = (typeof values[key] === 'string') ? (values[key]).trim() : '';
      const saved: boolean = secret && existing !== null && existing.secrets[key] === true;

      if (value === '' && required && !saved) {
        sendFieldError(response, 422, 'invalid_request', `settings.${key}`, missing);

        return null;
      }

      if (value !== '' && secret) {
        secrets[key] = true;
      } else if (value !== '') {
        settings[key] = value;
      }
    }

    // Optional secrets that are saved, or missing after a lost key, can be cleared once each, never alongside a new value.
    const clearable: string[] = notificationFields[service]
      .filter((field: MockNotificationField): boolean => field[2] && !field[3] && existing !== null && (existing.secrets[field[0]] === true || existing.secretsMissing.includes(field[0])))
      .map((field: MockNotificationField): string => field[0]);
    const clearSecrets: unknown[] = (Array.isArray(body['clearSecrets'])) ? body['clearSecrets'] : [];
    const invalidIndex: number = clearSecrets.findIndex((key: unknown): boolean => typeof key !== 'string' || !clearable.includes(key));

    if (body['clearSecrets'] !== undefined && !Array.isArray(body['clearSecrets'])) {
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

    const replaced: string | undefined = (clearSecrets as string[]).find((key: string): boolean => typeof values[key] === 'string' && (values[key]).trim() !== '');

    if (replaced !== undefined) {
      sendFieldError(response, 422, 'invalid_request', `settings.${replaced}`, 'Enter a new value or clear this field, not both.');

      return null;
    }

    for (const key of clearSecrets as string[]) {
      Reflect.deleteProperty(secrets, key);
    }

    if (notifications.some((notification: MockNotification): boolean => notification.id !== existing?.id && notification.name.toLowerCase() === name.toLowerCase())) {
      sendFieldError(response, 409, 'notification_exists', 'name', 'A notification with this name already exists.');

      return null;
    }

    return {
      events,
      name,
      clearSecrets: clearSecrets as string[],
      secrets,
      service,
      settings,
    };
  };

  if (method === 'POST' && path === '/api/v1/notifications') {
    const input: MockNotificationInput | null = notificationInput(null);

    if (input === null) {
      return true;
    }

    const notification: MockNotification = {
      events: input.events,
      name: input.name,
      secrets: input.secrets,
      service: input.service,
      settings: input.settings,
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
      summary: `Added notification ${notification.name}`,
    });
    sendJSON(response, 201, notification);

    return true;
  }

  const notificationMatch: RegExpMatchArray | null = path.match(/^\/api\/v1\/notifications\/(ntf-[0-9a-f]{16})(\/test)?$/u);

  if (notificationMatch !== null) {
    const index: number = notifications.findIndex((notification: MockNotification): boolean => notification.id === notificationMatch[1]);
    const notification: MockNotification | undefined = notifications[index];

    if (notification === undefined) {
      sendError(response, 404, 'notification_not_found', 'That notification no longer exists.');

      return true;
    }

    if (method === 'POST' && notificationMatch[2] === '/test') {
      if (notification.secretsMissing.length > 0) {
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
      removedSecrets = removedSecrets.filter((removedSecret): boolean => removedSecret.notificationId !== notification.id);
      recordActivity({
        action: 'notification-removed',
        actorId: currentUsername,
        category: 'configuration',
        outcome: 'succeeded',
        summary: `Removed notification ${notification.name}`,
      });
      sendEmpty(response);

      return true;
    }

    if (method === 'PUT') {
      const input: MockNotificationInput | null = notificationInput(notification);

      if (input === null) {
        return true;
      }

      notification.events = input.events;
      notification.name = input.name;
      notification.secrets = input.secrets;
      // A missing secret is settled by entering it again or, when optional, by clearing it.
      notification.secretsMissing = notification.secretsMissing.filter((key: string): boolean => input.secrets[key] !== true && !input.clearSecrets.includes(key));
      notification.settings = input.settings;
      notification.updatedAt = new Date().toISOString();

      if (notification.secretsMissing.length === 0) {
        removedSecrets = removedSecrets.filter((removedSecret): boolean => removedSecret.notificationId !== notification.id);
      }

      recordActivity({
        action: 'notification-updated',
        actorId: currentUsername,
        category: 'configuration',
        outcome: 'succeeded',
        summary: `Updated notification ${notification.name}`,
      });
      sendJSON(response, 200, notification);

      return true;
    }
  }

  if (method === 'GET' && path === '/api/v1/auth/tokens') {
    sendJSON(response, 200, { items: [...tokens].sort((left: MockToken, right: MockToken): number => right.createdAt.localeCompare(left.createdAt)) });

    return true;
  }

  // tokenInput reads and checks a create or edit body, sending the first problem it finds.

  /**
   * Mock API - Token input.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const tokenInput = (exceptId: string): MockTokenInput | null => {
    const name: string = (typeof body['name'] === 'string') ? body['name'].trim() : '';
    const scopes: MockScope[] = (Array.isArray(body['scopes'])) ? body['scopes'] as MockScope[] : [];

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

    if (tokens.some((token: MockToken): boolean => token.id !== exceptId && token.name.toLowerCase() === name.toLowerCase())) {
      sendFieldError(response, 409, 'token_exists', 'name', 'A token with this name already exists.');

      return null;
    }

    return {
      name,
      scopes: scopeOrder.filter((scope: MockScope): boolean => scopes.includes(scope)),
    };
  };

  if (method === 'POST' && path === '/api/v1/auth/tokens') {
    const input: MockTokenInput | null = tokenInput('');

    if (input === null) {
      return true;
    }

    const token: MockToken = {
      createdAt: new Date().toISOString(),
      expiresAt: (typeof body['expiresAt'] === 'string') ? body['expiresAt'] : null,
      id: `tok-${randomBytes(8).toString('hex')}`,
      lastUsedAt: null,
      name: input.name,
      scopes: input.scopes,
    };

    tokens.push(token);
    recordActivity({
      action: 'token-created',
      actorId: currentUsername,
      category: 'token',
      outcome: 'succeeded',
      summary: `Created personal access token ${token.name}`,
    });
    sendJSON(response, 201, {
      plaintext: `pfa_${randomBytes(32).toString('base64url')}`,
      token,
    });

    return true;
  }

  const tokenMatch: RegExpMatchArray | null = path.match(/^\/api\/v1\/auth\/tokens\/([a-z0-9-]+)$/u);

  if (tokenMatch !== null) {
    const index: number = tokens.findIndex((token: MockToken): boolean => token.id === tokenMatch[1]);
    const token: MockToken | undefined = tokens[index];

    if (token === undefined) {
      sendError(response, 404, 'token_not_found', 'That token no longer exists.');

      return true;
    }

    if (method === 'DELETE') {
      tokens.splice(index, 1);
      recordActivity({
        action: 'token-revoked',
        actorId: currentUsername,
        category: 'token',
        outcome: 'succeeded',
        summary: `Revoked personal access token ${token.name}`,
      });
      sendEmpty(response);

      return true;
    }

    if (method === 'PUT') {
      const input: MockTokenInput | null = tokenInput(token.id);

      if (input === null) {
        return true;
      }

      token.name = input.name;
      token.scopes = input.scopes;
      if (body['expiresAt'] !== undefined) {
        token.expiresAt = (typeof body['expiresAt'] === 'string') ? body['expiresAt'] : null;
      }
      recordActivity({
        action: 'token-updated',
        actorId: currentUsername,
        category: 'token',
        outcome: 'succeeded',
        summary: `Updated personal access token ${token.name}`,
      });
      sendJSON(response, 200, token);

      return true;
    }
  }

  if (method === 'GET' && path === '/api/v1/overview') {
    sendJSON(response, 200, {
      activityCount: activity.length,
      administrator: (administrator === null) ? null : {
        createdAt: administrator.createdAt,
        username: administrator.username,
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

  if (method === 'GET' && path === '/api/v1/connection') {
    sendJSON(response, 200, connectionResource());

    return true;
  }

  if (method === 'POST' && path === '/api/v1/connection/test') {
    if (connection === null) {
      sendError(response, 409, 'connection_not_configured', 'Save the pfSense connection first.');

      return true;
    }

    if (!connection.credentialSaved) {
      sendError(response, 409, 'connection_not_configured', 'Enter the password or private key again, then save the connection.');

      return true;
    }

    const connected: boolean = connection.pfsenseSshIp !== '192.0.2.66';

    recordActivity({
      action: 'connection-tested',
      actorId: currentUsername,
      category: 'configuration',
      outcome: (connected) ? 'succeeded' : 'failed',
      summary: (connected) ? 'Verified the saved pfSense SSH connection' : 'Could not verify the saved pfSense SSH connection',
    });
    sendJSON(response, 200, { connected });

    return true;
  }

  if (method === 'PUT' && path === '/api/v1/connection') {
    const address: string = String(body['pfsenseSshIp'] ?? '').trim();

    if (!/^(\d{1,3}\.){3}\d{1,3}$|:/u.test(address)) {
      sendFieldError(response, 422, 'invalid_request', 'pfsenseSshIp', 'Enter an IPv4 or IPv6 address.');

      return true;
    }

    if (body['credential'] === undefined && (connection === null || !connection.credentialSaved || connection.credentialType !== body['credentialType'])) {
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

    removedSecrets = removedSecrets.filter((removedSecret): boolean => removedSecret.kind !== 'pfsense-credential');
    connection = {
      credentialSaved: true,
      credentialType: (body['credentialType'] === 'password') ? 'password' : 'privateKey',
      pfsenseSshIp: address,
      pfsenseSshPort: Number(body['pfsenseSshPort'] ?? 22),
      pfsenseUsername: String(body['pfsenseUsername'] ?? '').trim(),
    };
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
 * @returns {Plugin}
 *
 * @since 2.0.0
 */
export const mockApi = (): Plugin => ({
  name: 'pfsense-actions-mock-api',
  configureServer: (server): void => {
    server.config.logger.info(`  Mock setup code: ${setupCode}`);

    server.middlewares.use((request: IncomingMessage, response: ServerResponse, next: () => void): void => {
      void handleRequest(request, response).then((handled: boolean): void => {
        if (!handled) {
          next();
        }
      });
    });
  },
});
