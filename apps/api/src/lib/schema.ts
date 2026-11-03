import z from 'zod';

import { notificationServiceSchema } from './notifications.js';
import {
  textAdministratorUsername,
  textBase64Url,
  textMacAddressLower,
  textMacAddressUpper,
  textPersonalAccessTokenId,
  textSha256Hash,
  textTotpCode,
} from './regex.js';

/**
 * Lib - Schema - Future Date Time.
 *
 * Validates an offset-aware timestamp that has not already expired.
 * Token creation and updates share this time-sensitive boundary.
 *
 * @since 2.0.0
 */
const futureDateTime = z.iso.datetime({
  error: 'Use an ISO 8601 date and time with a time zone, like 2030-01-01T00:00:00Z.',
  offset: true,
}).refine(
  (value) => Number.isNaN(Date.parse(value)) === true || Date.parse(value) > Date.now(),
  { error: 'Choose an expiration date in the future.' },
);

/**
 * Lib - Schema - Administrator Password.
 *
 * Applies the shared password policy for setup and password changes.
 * Length is the only rule, so long passphrases are always accepted.
 *
 * @since 2.0.0
 */
const administratorPassword = z.string({ error: (issue) => ((issue.input === undefined) ? 'Use at least 12 characters.' : undefined) })
  .min(12, 'Use at least 12 characters.')
  .max(1024, 'Use 1024 characters or fewer.');

/**
 * Lib - Schema - Administrator Username.
 *
 * Applies the username rule shared with the other appliances for setup and changes.
 * Usernames stay readable in the activity log and session view.
 *
 * @since 2.0.0
 */
const administratorUsername = z.string({ error: (issue) => ((issue.input === undefined) ? 'Enter a username.' : undefined) })
  .trim()
  .min(1, 'Enter a username.')
  .min(3, 'Use 3 to 64 letters, numbers, periods, underscores, or hyphens, starting with a letter or number.')
  .max(64, 'Use 3 to 64 letters, numbers, periods, underscores, or hyphens, starting with a letter or number.')
  .regex(textAdministratorUsername, 'Use 3 to 64 letters, numbers, periods, underscores, or hyphens, starting with a letter or number.');

/**
 * Lib - Schema - Confirmation Password.
 *
 * Accepts the current password typed to confirm a sensitive change.
 * The value is only compared with the stored hash, so no policy applies.
 *
 * @since 2.0.0
 */
const confirmationPassword = z.string({ error: (issue) => ((issue.input === undefined) ? 'Enter your password.' : undefined) })
  .min(1, 'Enter your password.')
  .max(1024, 'Use 1024 characters or fewer.');

/**
 * Lib - Schema - Ceremony Identifier.
 *
 * Bounds the opaque identifier that links a browser prompt to its stored challenge.
 * The identifier is random and carries no account information.
 *
 * @since 2.0.0
 */
const ceremonyIdentifier = z.string().min(32).max(128).regex(textBase64Url);

/**
 * Lib - Schema - IP Address Formats.
 *
 * Lists the two address formats accepted wherever an IP address is entered.
 * Each field wraps them in a union with its own message.
 *
 * @since 2.0.0
 */
const ipAddressFormats = [
  z.ipv4(),
  z.ipv6(),
] as const;

/**
 * Lib - Schema - Personal Access Token Identifier.
 *
 * Defines the stable identifier used in token routes and stored token records.
 * Reusing one schema prevents the lifecycle endpoints from drifting apart.
 *
 * @since 2.0.0
 */
export const personalAccessTokenIdentifier = z.string({ error: (issue) => ((issue.input === undefined) ? 'Enter a token identifier.' : undefined) })
  .min(1, 'Enter a token identifier.')
  .max(64, 'Use 64 characters or fewer.')
  .regex(textPersonalAccessTokenId, 'Start with a lowercase letter, then use lowercase letters, numbers, and dashes.');

/**
 * Lib - Schema - Personal Access Token Name.
 *
 * Defines the friendly label an administrator gives a token, like the app that uses it.
 * It follows the passkey name rule and is unique ignoring letter case.
 *
 * @since 2.0.0
 */
const personalAccessTokenName = z.string({ error: 'Name this token.' }).trim().min(1, 'Name this token.').max(80, 'Use 80 characters or fewer.');

/**
 * Lib - Schema - Personal Access Token Scope.
 *
 * Defines the closed capabilities that can be granted to API clients.
 * Route authorization never accepts an unreviewed scope string.
 *
 * @since 2.0.0
 */
export const personalAccessTokenScope = z.enum([
  'pfsense:read',
  'reachability:read',
  'wol:execute',
], { error: 'Choose from: pfsense:read, reachability:read, wol:execute.' });

/**
 * Lib - Schema - Personal Access Token Scopes.
 *
 * Requires at least one unique scope for every token.
 * Duplicates are rejected so stored scope rows stay unambiguous.
 *
 * @since 2.0.0
 */
const personalAccessTokenScopes = z.array(personalAccessTokenScope, { error: 'Choose at least one scope.' })
  .min(1, 'Choose at least one scope.')
  .refine(
    (scopes) => new Set(scopes).size === scopes.length,
    { error: 'Choose each scope only once.' },
  );

/**
 * Lib - Schema - Personal Access Token Record.
 *
 * Validates one hashed API client credential before persistence or authentication.
 * Raw token material never enters this representation.
 *
 * @since 2.0.0
 */
export const personalAccessTokenRecord = z.object({
  createdAt: z.iso.datetime({ offset: true }).optional(),
  expiresAt: z.iso.datetime({ offset: true }).optional(),
  id: personalAccessTokenIdentifier,
  scopes: personalAccessTokenScopes,
  tokenHash: z.string().regex(textSha256Hash),
}).strict();

/**
 * Lib - Schema - Activity Event.
 *
 * Validates the bounded, redacted operational history stored with controller state.
 * Only reviewed categorical fields can enter the administrator-facing activity log.
 *
 * @since 2.0.0
 */
export const activityEvent = z.object({
  action: z.string().min(1).max(64),
  actorId: z.string().min(1).max(80),
  category: z.enum([
    'access',
    'configuration',
    'service',
    'token',
  ]),
  createdAt: z.iso.datetime({ offset: true }),
  id: z.uuid(),
  outcome: z.enum([
    'failed',
    'succeeded',
  ]),
  summary: z.string().min(1).max(160),
}).strict();

/**
 * Lib - Schema - Connection Update.
 *
 * Validates SSH settings before an administrator can test or save them.
 * An omitted credential keeps the saved secret when the method stays the same.
 *
 * @since 2.0.0
 */
export const connectionUpdate = z.object({
  credential: z.string().min(1, 'Enter the password or private key.').max(32768, 'The credential is too long.').optional(),
  credentialType: z.enum([
    'password',
    'privateKey',
  ], { error: 'Choose password or private key.' }),
  pfsenseSshIp: z.union(ipAddressFormats, { error: (issue) => ((issue.input === undefined) ? 'Enter the pfSense IP address.' : 'Enter an IPv4 or IPv6 address.') }),
  pfsenseSshPort: z.number({ error: 'Enter a port number.' }).int('Enter a whole number.').min(1, 'Use a port from 1 to 65535.').max(65535, 'Use a port from 1 to 65535.'),
  pfsenseUsername: z.string({ error: (issue) => ((issue.input === undefined) ? 'Enter the SSH username.' : undefined) }).trim().min(1, 'Enter the SSH username.').max(128, 'Use 128 characters or fewer.'),
}).strict();

/**
 * Lib - Schema - Passkey Credential Identifier.
 *
 * Defines the bounded Base64URL identifier shared by WebAuthn responses and routes.
 * Credential identifiers are public metadata but remain structurally validated.
 *
 * @since 2.0.0
 */
export const passkeyCredentialIdentifier = z.string().min(1).max(2048).regex(textBase64Url);

/**
 * Lib - Schema - Webauthn Registration Response.
 *
 * Bounds the browser's JSON-safe public-key credential before cryptographic verification.
 * Unknown fields that newer browsers add are dropped, and a null attachment means none.
 *
 * @since 2.0.0
 */
export const webauthnRegistrationResponse = z.object({
  authenticatorAttachment: z.enum([
    'cross-platform',
    'platform',
  ]).nullable().optional().transform((value) => value ?? undefined),
  clientExtensionResults: z.record(z.string(), z.unknown()),
  id: passkeyCredentialIdentifier,
  rawId: passkeyCredentialIdentifier,
  response: z.object({
    attestationObject: z.string().min(1).max(65_536).regex(textBase64Url),
    authenticatorData: z.string().min(1).max(65_536).regex(textBase64Url).optional(),
    clientDataJSON: z.string().min(1).max(65_536).regex(textBase64Url),
    publicKey: z.string().min(1).max(65_536).regex(textBase64Url).optional(),
    publicKeyAlgorithm: z.number().int().optional(),
    transports: z.array(z.string().min(1).max(32)).max(16).optional(),
  }),
  type: z.literal('public-key'),
});

/**
 * Lib - Schema - Webauthn Authentication Response.
 *
 * Bounds an assertion before its signature, origin, relying party, and counter are checked.
 * A missing or null user handle fails the later check against the stored administrator.
 *
 * @since 2.0.0
 */
export const webauthnAuthenticationResponse = z.object({
  authenticatorAttachment: z.enum([
    'cross-platform',
    'platform',
  ]).nullable().optional().transform((value) => value ?? undefined),
  clientExtensionResults: z.record(z.string(), z.unknown()),
  id: passkeyCredentialIdentifier,
  rawId: passkeyCredentialIdentifier,
  response: z.object({
    authenticatorData: z.string().min(1).max(65_536).regex(textBase64Url),
    clientDataJSON: z.string().min(1).max(65_536).regex(textBase64Url),
    signature: z.string().min(1).max(65_536).regex(textBase64Url),
    userHandle: z.string().min(1).max(128).regex(textBase64Url).nullable().optional().transform((value) => value ?? undefined),
  }),
  type: z.literal('public-key'),
});

/**
 * Lib - Schema - Passkey Registration Start.
 *
 * Names a credential and requires the current password before enrollment.
 * Names are display-only and never participate in credential verification.
 *
 * @since 2.0.0
 */
export const passkeyRegistrationStart = z.object({
  name: z.string({ error: (issue) => ((issue.input === undefined) ? 'Name this passkey.' : undefined) }).trim().min(1, 'Name this passkey.').max(80, 'Use 80 characters or fewer.'),
  password: confirmationPassword,
}).strict();

/**
 * Lib - Schema - Passkey Registration Verify.
 *
 * Couples one browser attestation with its short-lived stored ceremony.
 * WebAuthn cryptographic verification runs only after this structural boundary.
 *
 * @since 2.0.0
 */
export const passkeyRegistrationVerify = z.object({
  ceremonyId: ceremonyIdentifier,
  credential: webauthnRegistrationResponse,
}).strict();

/**
 * Lib - Schema - Passkey Sign In Verify.
 *
 * Couples one browser assertion with its anonymous short-lived sign-in ceremony.
 * Credential ownership is resolved exclusively from verified persistent state.
 *
 * @since 2.0.0
 */
export const passkeySignInVerify = z.object({
  ceremonyId: ceremonyIdentifier,
  credential: webauthnAuthenticationResponse,
}).strict();

/**
 * Lib - Schema - Password Change.
 *
 * Requires the current password next to the replacement.
 * The new password follows the same policy as first-run setup.
 *
 * @since 2.0.0
 */
export const passwordChange = z.object({
  currentPassword: z.string({ error: (issue) => ((issue.input === undefined) ? 'Enter your current password.' : undefined) }).min(1, 'Enter your current password.').max(1024, 'Use 1024 characters or fewer.'),
  newPassword: administratorPassword,
}).strict();

/**
 * Lib - Schema - Password Confirmation.
 *
 * Carries the current password for changes to sign-in methods.
 * A stolen browser session alone cannot weaken or take over the account.
 *
 * @since 2.0.0
 */
export const passwordConfirmation = z.object({
  password: confirmationPassword,
}).strict();

/**
 * Lib - Schema - Setup Claim.
 *
 * Validates the one-time code and the first account created on a new container.
 * The code itself is normalized and compared against its stored digest.
 *
 * @since 2.0.0
 */
export const setupClaim = z.object({
  claimCode: z.string({ error: (issue) => ((issue.input === undefined) ? 'Enter the setup code from the container log.' : undefined) }).trim().min(1, 'Enter the setup code from the container log.'),
  password: administratorPassword,
  username: administratorUsername,
}).strict();

/**
 * Lib - Schema - Sign In.
 *
 * Validates local credentials used to establish a browser session.
 * The password is consumed in memory and compared against a slow stored hash.
 *
 * @since 2.0.0
 */
export const signIn = z.object({
  password: z.string({ error: (issue) => ((issue.input === undefined) ? 'Enter your password.' : undefined) }).min(1, 'Enter your password.'),
  username: z.string({ error: (issue) => ((issue.input === undefined) ? 'Enter your username.' : undefined) }).trim().min(1, 'Enter your username.'),
}).strict();

/**
 * Lib - Schema - Sign In Second Factor.
 *
 * Pairs the password step's challenge with an authenticator or recovery code.
 * The challenge is opaque and only works with its stored server-side record.
 *
 * @since 2.0.0
 */
export const signInSecondFactor = z.object({
  challenge: ceremonyIdentifier,
  code: z.string({ error: (issue) => ((issue.input === undefined) ? 'Enter the code from your authenticator app, or a recovery code.' : undefined) }).trim().min(1, 'Enter the code from your authenticator app, or a recovery code.'),
}).strict();

/**
 * Lib - Schema - Token Create.
 *
 * Validates token metadata accepted by the operations console.
 * Token material remains server-generated so browser input cannot reduce entropy.
 *
 * @since 2.0.0
 */
export const tokenCreate = z.object({
  expiresAt: futureDateTime.nullable().optional(),
  name: personalAccessTokenName,
  scopes: personalAccessTokenScopes,
}).strict();

/**
 * Lib - Schema - Token Update.
 *
 * Validates the name, scopes, and expiry an administrator can change on a token.
 * Identifiers and token hashes stay immutable to preserve deterministic revocation.
 *
 * @since 2.0.0
 */
export const tokenUpdate = z.object({
  expiresAt: futureDateTime.nullable().optional(),
  name: personalAccessTokenName,
  scopes: personalAccessTokenScopes,
}).strict();

/**
 * Lib - Schema - Totp Enable.
 *
 * Accepts the first code from the authenticator app to finish its setup.
 * A correct code proves the app holds the secret shown on screen.
 *
 * @since 2.0.0
 */
export const totpEnable = z.object({
  code: z.string({ error: (issue) => ((issue.input === undefined) ? 'Enter the 6-digit code from your app.' : undefined) }).trim().regex(textTotpCode, 'Enter the 6-digit code from your app.'),
}).strict();

/**
 * Lib - Schema - Username Change.
 *
 * Requires the current password before the account is renamed.
 * The new username follows the same rule as first-run setup.
 *
 * @since 2.0.0
 */
export const usernameChange = z.object({
  password: confirmationPassword,
  username: administratorUsername,
}).strict();

/**
 * Lib - Schema - Stored Administrator.
 *
 * Validates one administrator row read from SQLite before authentication uses it.
 * The password hash stays internal and is removed from every browser response.
 *
 * @since 2.0.0
 */
export const storedAdministrator = z.object({
  createdAt: z.iso.datetime({ offset: true }),
  id: z.uuid(),
  passwordHash: z.string().min(1),
  updatedAt: z.iso.datetime({ offset: true }),
  username: z.string().min(1).max(64).regex(textAdministratorUsername),
}).strict();

/**
 * Lib - Schema - Stored Administrator Totp.
 *
 * Validates the encrypted second-factor record read from SQLite.
 * Plaintext secrets never enter the persistent representation.
 *
 * @since 2.0.0
 */
export const storedAdministratorTotp = z.object({
  administratorId: z.uuid(),
  createdAt: z.iso.datetime({ offset: true }),
  lastUsedStep: z.number().int().nonnegative().nullable(),
  secretAuthTag: z.string().min(1),
  secretCiphertext: z.string().min(1),
  secretIv: z.string().min(1),
}).strict();

/**
 * Lib - Schema - Stored Administrator Passkey.
 *
 * Validates a verified WebAuthn credential and its replay counter from SQLite.
 * The RP ID records the hostname the passkey was created on.
 *
 * @since 2.0.0
 */
export const storedAdministratorPasskey = z.object({
  administratorId: z.uuid(),
  backedUp: z.boolean(),
  counter: z.number().int().nonnegative(),
  createdAt: z.iso.datetime({ offset: true }),
  deviceType: z.enum([
    'multiDevice',
    'singleDevice',
  ]),
  id: passkeyCredentialIdentifier,
  lastUsedAt: z.iso.datetime({ offset: true }).nullable(),
  name: z.string().min(1).max(80),
  publicKey: z.instanceof(Uint8Array),
  rpId: z.string().min(1).max(253).nullable(),
  transports: z.array(z.string().min(1).max(32)).max(16),
}).strict();

/**
 * Lib - Schema - Stored Connection.
 *
 * Validates encrypted pfSense connection columns returned from SQLite.
 * Decryption happens only after every public field and sealed value passes validation.
 *
 * @since 2.0.0
 */
export const storedConnection = z.object({
  credentialAuthTag: z.string().min(1).nullable(),
  credentialCiphertext: z.string().min(1).nullable(),
  credentialIv: z.string().min(1).nullable(),
  credentialType: z.enum([
    'password',
    'privateKey',
  ]),
  pfsenseSshIp: z.union(ipAddressFormats),
  pfsenseSshPort: z.number().int().min(1).max(65535),
  pfsenseUsername: z.string().min(1).max(128),
}).strict();

/**
 * Lib - Schema - Stored Notification Keys.
 *
 * Validates a JSON list of event keys or field names stored with a destination.
 * Each entry is a short identifier, never a secret value.
 *
 * @since 2.0.0
 */
export const storedNotificationKeys = z.array(z.string().min(1).max(64));

/**
 * Lib - Schema - Stored Notification Target.
 *
 * Validates one notification destination row read from SQLite.
 * Lists and settings stay JSON text here and are parsed on their own.
 *
 * @since 2.0.0
 */
export const storedNotificationTarget = z.object({
  createdAt: z.iso.datetime({ offset: true }),
  events: z.string(),
  id: z.string().min(1),
  lastAttemptAt: z.iso.datetime({ offset: true }).nullable(),
  lastError: z.string().nullable(),
  missingSecrets: z.string(),
  name: z.string().min(1).max(80),
  secretFields: z.string(),
  secretsAuthTag: z.string().min(1).nullable(),
  secretsCiphertext: z.string().min(1).nullable(),
  secretsIv: z.string().min(1).nullable(),
  service: notificationServiceSchema,
  settings: z.string(),
  updatedAt: z.iso.datetime({ offset: true }),
}).strict();

/**
 * Lib - Schema - Stored Notification Values.
 *
 * Validates the plain settings or opened secrets of one destination.
 * Every value is text, as the service fields are.
 *
 * @since 2.0.0
 */
export const storedNotificationValues = z.record(z.string(), z.string());

/**
 * Lib - Schema - Stored Removed Secret.
 *
 * Validates one record of a secret removed with a lost encryption key.
 * The console lists these so they can be entered again.
 *
 * @since 2.0.0
 */
export const storedRemovedSecret = z.object({
  credentialType: z.enum([
    'password',
    'privateKey',
  ]).nullable(),
  kind: z.enum([
    'authenticator',
    'notification',
    'pfsense-credential',
  ]),
  name: z.string().min(1).max(80).nullable(),
  notificationId: z.string().min(1).nullable(),
  removedAt: z.iso.datetime({ offset: true }),
}).strict();

/**
 * Lib - Schema - Env.
 *
 * Validates the runtime environment, in which every bootstrap value is optional.
 * Partial SSH settings fail startup instead of being half-applied.
 *
 * @since 2.0.0
 */
export const env = z.object({
  adminWebauthnRpName: z.string().min(1).max(64),
  dataDirectory: z.string().min(1),
  port: z.coerce.number().int().min(1).max(65535),
  pfsensePassword: z.string().min(1).optional(),
  pfsensePrivateKey: z.string().min(1).optional(),
  pfsenseSshIp: z.union(ipAddressFormats).optional(),
  pfsenseSshPort: z.coerce.number().int().min(1).max(65535).optional(),
  pfsenseUsername: z.string().min(1).optional(),
}).refine(
  (value) => (
    (
      value['pfsenseSshIp'] === undefined
      && value['pfsenseUsername'] === undefined
      && value['pfsensePassword'] === undefined
      && value['pfsensePrivateKey'] === undefined
    )
    || (
      value['pfsenseSshIp'] !== undefined
      && value['pfsenseUsername'] !== undefined
      && (
        value['pfsensePassword'] !== undefined
        || value['pfsensePrivateKey'] !== undefined
      )
    )
  ),
  {
    error: 'Set "PFSENSE_SSH_IP", "PFSENSE_USERNAME", and "PFSENSE_PASSWORD" or "PFSENSE_PRIVATE_KEY" together, or leave all of them unset',
    path: ['pfsenseSshIp'],
  },
);

/**
 * Lib - Schema - Ping.
 *
 * Validates ping requests before they can reach the SSH command boundary.
 * Counts must be positive integers and targets must be valid IP addresses.
 *
 * @since 2.0.0
 */
export const ping = z.object({
  count: z.number({ error: 'Set count to a whole number from 1 to 10.' }).int('Set count to a whole number from 1 to 10.').min(1, 'Set count to a whole number from 1 to 10.').max(10, 'Set count to a whole number from 1 to 10.'),
  ipAddress: z.union(ipAddressFormats, { error: 'Enter the IPv4 or IPv6 address to ping.' }),
  strict: z.boolean({ error: 'Set strict to true or false.' }).default(false),
});

/**
 * Lib - Schema - System Information Output.
 *
 * Validates the reviewed fields parsed from Netgate's documented uname command.
 * Unexpected command output fails closed instead of reaching a public response.
 *
 * @since 2.0.0
 */
export const systemInformationOutput = z.object({
  architecture: z.string().min(1),
  operatingSystem: z.string().min(1),
  release: z.string().min(1),
}).strict();

/**
 * Lib - Schema - Wake On Lan.
 *
 * Validates Wake-on-LAN destinations before constructing an SSH command.
 * Both broadcast and hardware addresses are checked at the HTTP boundary.
 *
 * @since 2.0.0
 */
export const wakeOnLan = z.object({
  broadcastAddress: z.union(ipAddressFormats, { error: 'Enter the broadcast address of the device\'s subnet, such as 192.0.2.255.' }),
  macAddress: z.string({ error: 'Enter a MAC address such as 00:11:22:33:44:55.' }).refine(
    (value) => textMacAddressLower.test(value) === true || textMacAddressUpper.test(value) === true,
    { error: 'Enter a MAC address such as 00:11:22:33:44:55, in all lowercase or all uppercase.' },
  ),
});
