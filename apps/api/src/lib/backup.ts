import { z } from 'zod';

import {
  digestValue,
  generateOpaqueToken,
} from './auth.js';
import {
  notificationInputSchema,
  notificationServices,
  notificationServiceSchema,
} from './notifications.js';
import {
  textNotificationTargetId,
  textPersonalAccessTokenId,
  textSha256Hash,
} from './regex.js';

import type {
  Lib_Backup_AccessTokenMapper,
  Lib_Backup_AccessTokenScopesPredicate,
  Lib_Backup_DocumentRefinement,
  Lib_Backup_DocumentSchema,
  Lib_Backup_Grant,
  Lib_Backup_GrantStore_Clock,
  Lib_Backup_GrantStore_Consume_Returns,
  Lib_Backup_GrantStore_Digest,
  Lib_Backup_GrantStore_DurationMilliseconds,
  Lib_Backup_GrantStore_Entry,
  Lib_Backup_GrantStore_ExpiresAt,
  Lib_Backup_GrantStore_Grant,
  Lib_Backup_GrantStore_Grants,
  Lib_Backup_GrantStore_Issue_Returns,
  Lib_Backup_GrantStore_Now,
  Lib_Backup_GrantStore_Prune_Returns,
  Lib_Backup_GrantStore_Record,
  Lib_Backup_GrantStore_SessionId,
  Lib_Backup_IsUnique,
  Lib_Backup_NotificationEventKeys,
  Lib_Backup_NotificationEventsPredicate,
  Lib_Backup_NotificationFieldMapper,
  Lib_Backup_NotificationFieldPredicate,
  Lib_Backup_NotificationFields,
  Lib_Backup_NotificationMapper,
  Lib_Backup_NotificationRefinement,
  Lib_Backup_NotificationSchema,
  Lib_Backup_ParseBackupDocument_Returns,
  Lib_Backup_ParseBackupDocument_Value,
  Lib_Backup_ParsedNotification,
  Lib_Backup_Purpose,
  Lib_Backup_StringList,
  Lib_Backup_StringMapSchema,
  Lib_Backup_StringSet,
} from '@/types/lib/backup.d.ts';

/**
 * Lib - Backup - Notification Event Keys.
 *
 * Closes imported notification subscriptions to the events this app can send.
 * The tuple also supplies Zod's non-empty enum contract.
 *
 * @since 2.1.0
 */
const notificationEventKeys: Lib_Backup_NotificationEventKeys = [
  'secrets-removed',
  'sign-in-locked',
  'pfsense-unreachable',
  'pfsense-reachable',
  'action-failed',
  'wol-sent',
];

/**
 * Lib - Backup - Unique Notification Events.
 *
 * Prevents duplicate subscriptions from reaching normalized notification state.
 * Zod uses this named callback for every imported target.
 *
 * @returns {boolean}
 *
 * @since 2.1.0
 */
const uniqueNotificationEvents: Lib_Backup_NotificationEventsPredicate = (events) => new Set(events).size === events.length;

/**
 * Lib - Backup - Unique Access Token Scopes.
 *
 * Keeps imported token scope rows compatible with their composite database key.
 * Repeated scopes make the whole document invalid before a transaction begins.
 *
 * @returns {boolean}
 *
 * @since 2.1.0
 */
const uniqueAccessTokenScopes: Lib_Backup_AccessTokenScopesPredicate = (scopes) => new Set(scopes).size === scopes.length;

/**
 * Lib - Backup - String Map Schema.
 *
 * Bounds portable notification settings and plain-text secret values.
 * Nested objects and unbounded field names are rejected.
 *
 * @since 2.1.0
 */
const stringMapSchema: Lib_Backup_StringMapSchema = z.record(z.string().min(1).max(64), z.string().max(4096));

/**
 * Lib - Backup - Validate Notification.
 *
 * Keeps secret fields sealed and ordinary fields in their public settings column.
 * The existing service validator also checks required values and event choices.
 *
 * @returns {void}
 *
 * @since 2.1.0
 */
const validateNotification: Lib_Backup_NotificationRefinement = (notification, context) => {
  const fields: Lib_Backup_NotificationFields = notificationServices[notification['service']]['fields'];

  /**
   * Lib - Backup - Is Plain Field.
   *
   * Identifies fields that belong in the portable public settings object.
   * Secret fields must never be accepted through this path.
   *
   * @returns {boolean}
   *
   * @since 2.1.0
   */
  const isPlainField: Lib_Backup_NotificationFieldPredicate = (field) => field['secret'] === false;

  /**
   * Lib - Backup - Is Secret Field.
   *
   * Identifies fields that belong in the portable plain-text secret object.
   * Public settings must never be accepted through this path.
   *
   * @returns {boolean}
   *
   * @since 2.1.0
   */
  const isSecretField: Lib_Backup_NotificationFieldPredicate = (field) => field['secret'] === true;

  /**
   * Lib - Backup - Field Key.
   *
   * Projects a service field into the stable key used by portable maps.
   * Both public and secret allowlists use the same projection.
   *
   * @returns {string}
   *
   * @since 2.1.0
   */
  const fieldKey: Lib_Backup_NotificationFieldMapper = (field) => field['key'];
  const plainKeys: Lib_Backup_StringSet = new Set(fields.filter(isPlainField).map(fieldKey));
  const secretKeys: Lib_Backup_StringSet = new Set(fields.filter(isSecretField).map(fieldKey));

  for (const key of Object.keys(notification['settings'])) {
    if (plainKeys.has(key) === false) {
      context.addIssue({
        code: 'custom',
        message: 'Use only non-secret settings for this service.',
        path: [
          'settings',
          key,
        ],
      });
    }
  }

  for (const key of Object.keys(notification['secrets'])) {
    if (secretKeys.has(key) === false) {
      context.addIssue({
        code: 'custom',
        message: 'Use only secret settings for this service.',
        path: [
          'secrets',
          key,
        ],
      });
    }
  }

  const parsed: Lib_Backup_ParsedNotification = notificationInputSchema(notification['service'], notificationEventKeys, [], []).safeParse({
    events: notification['events'],
    name: notification['name'],
    service: notification['service'],
    settings: {
      ...notification['settings'],
      ...notification['secrets'],
    },
  });

  if (parsed.success === false) {
    for (const issue of parsed.error.issues) {
      context.addIssue({
        code: 'custom',
        message: issue.message,
        path: issue.path,
      });
    }
  }

  return;
};

/**
 * Lib - Backup - Notification Schema.
 *
 * Defines one portable target with its secrets separated from plain settings.
 * Every nested object is strict before service-specific refinement runs.
 *
 * @since 2.1.0
 */
const notificationSchema: Lib_Backup_NotificationSchema = z.object({
  events: z.array(z.enum(notificationEventKeys)).min(1).max(notificationEventKeys.length).refine(uniqueNotificationEvents),
  id: z.string().regex(textNotificationTargetId),
  name: z.string().trim().min(1).max(80),
  secrets: stringMapSchema,
  service: notificationServiceSchema,
  settings: stringMapSchema,
}).strict().superRefine(validateNotification);

/**
 * Lib - Backup - Validate Document.
 *
 * Requires at least one selected section and rejects ambiguous duplicate identities.
 * Import planning can therefore make one deterministic decision for each record.
 *
 * @returns {void}
 *
 * @since 2.1.0
 */
const validateDocument: Lib_Backup_DocumentRefinement = (document, context) => {
  if (
    Object.hasOwn(document, 'connection') === false
    && document['notifications'] === undefined
    && document['accessTokens'] === undefined
  ) {
    context.addIssue({
      code: 'custom',
      message: 'The export does not contain any sections.',
    });
  }

  /**
   * Lib - Backup - Notification Name.
   *
   * Normalizes one notification name for case-insensitive duplicate detection.
   * This matches the replacement rule used during import.
   *
   * @returns {string}
   *
   * @since 2.1.0
   */
  const notificationName: Lib_Backup_NotificationMapper = (notification) => notification['name'].toLocaleLowerCase();

  /**
   * Lib - Backup - Notification ID.
   *
   * Projects one notification into its stable portable identifier.
   * Duplicate identifiers would make import planning ambiguous.
   *
   * @returns {string}
   *
   * @since 2.1.0
   */
  const notificationId: Lib_Backup_NotificationMapper = (notification) => notification['id'];

  /**
   * Lib - Backup - Access Token Name.
   *
   * Normalizes one token name for case-insensitive duplicate detection.
   * This matches the skip rule used during import.
   *
   * @returns {string}
   *
   * @since 2.1.0
   */
  const accessTokenName: Lib_Backup_AccessTokenMapper = (token) => token['name'].toLocaleLowerCase();

  /**
   * Lib - Backup - Access Token ID.
   *
   * Projects one token into its stable portable identifier.
   * Duplicate identifiers would make the file internally inconsistent.
   *
   * @returns {string}
   *
   * @since 2.1.0
   */
  const accessTokenId: Lib_Backup_AccessTokenMapper = (token) => token['id'];

  /**
   * Lib - Backup - Access Token Hash.
   *
   * Projects one token into the stored authentication hash restored by import.
   * Duplicate hashes would represent the same credential twice.
   *
   * @returns {string}
   *
   * @since 2.1.0
   */
  const accessTokenHash: Lib_Backup_AccessTokenMapper = (token) => token['tokenHash'];
  const notificationNames: Lib_Backup_StringList = (document['notifications'] ?? []).map(notificationName);
  const notificationIds: Lib_Backup_StringList = (document['notifications'] ?? []).map(notificationId);
  const tokenNames: Lib_Backup_StringList = (document['accessTokens'] ?? []).map(accessTokenName);
  const tokenIds: Lib_Backup_StringList = (document['accessTokens'] ?? []).map(accessTokenId);
  const tokenHashes: Lib_Backup_StringList = (document['accessTokens'] ?? []).map(accessTokenHash);
  const isUnique: Lib_Backup_IsUnique = (
    new Set(notificationNames).size === notificationNames.length
      && new Set(notificationIds).size === notificationIds.length
      && new Set(tokenNames).size === tokenNames.length
      && new Set(tokenIds).size === tokenIds.length
      && new Set(tokenHashes).size === tokenHashes.length
  );

  if (isUnique === false) {
    context.addIssue({
      code: 'custom',
      message: 'The export contains duplicate targets or tokens.',
    });
  }

  return;
};

/**
 * Lib - Backup - Document Schema.
 *
 * Mirrors the browser schema and rejects unknown keys at every object level.
 * Version one contains only connection, notification, and access-token sections.
 *
 * @since 2.1.0
 */
export const backupDocumentSchema: Lib_Backup_DocumentSchema = z.object({
  accessTokens: z.array(z.object({
    createdAt: z.iso.datetime({ offset: true }),
    expiresAt: z.iso.datetime({ offset: true }).nullable(),
    id: z.string().min(1).max(64).regex(textPersonalAccessTokenId),
    lastUsedAt: z.iso.datetime({ offset: true }).nullable(),
    name: z.string().trim().min(1).max(80),
    scopes: z.array(z.enum([
      'pfsense:read',
      'reachability:read',
      'wol:execute',
    ])).min(1).max(3).refine(uniqueAccessTokenScopes),
    tokenHash: z.string().regex(textSha256Hash),
  }).strict()).max(1000).optional(),
  appVersion: z.string().min(1).max(64),
  connection: z.object({
    credential: z.string().min(1).max(32768),
    credentialType: z.enum([
      'password',
      'privateKey',
    ]),
    pfsenseSshIp: z.union([
      z.ipv4(),
      z.ipv6(),
    ]),
    pfsenseSshPort: z.number().int().min(1).max(65535),
    pfsenseUsername: z.string().trim().min(1).max(128),
  }).strict().nullable().optional(),
  exportedAt: z.iso.datetime({ offset: true }),
  format: z.literal('pfsense-actions-export'),
  notifications: z.array(notificationSchema).max(1000).optional(),
  version: z.literal(1),
}).strict().superRefine(validateDocument);

/**
 * Lib - Backup - Parse Backup Document.
 *
 * Exposes the strict versioned format through one server-side entry point.
 * Callers receive only the normalized version-one contract.
 *
 * @param {Lib_Backup_ParseBackupDocument_Value} value - Value.
 *
 * @returns {Lib_Backup_ParseBackupDocument_Returns}
 *
 * @since 2.1.0
 */
export const parseBackupDocument = (value: Lib_Backup_ParseBackupDocument_Value): Lib_Backup_ParseBackupDocument_Returns => backupDocumentSchema.parse(value);

/**
 * Lib - Backup.
 *
 * Holds only digests of short-lived confirmation grants in process memory.
 * Session and purpose binding make every opaque grant single-use.
 *
 * @since 2.1.0
 */
export class GrantStore {
  /**
   * Lib - Backup - Grant Store - Duration Milliseconds.
   *
   * Gives a confirmed administrator five minutes to complete the selected operation.
   * An operation consumes the grant before it reads or writes portable secrets.
   *
   * @private
   *
   * @since 2.1.0
   */
  static readonly #durationMilliseconds: Lib_Backup_GrantStore_DurationMilliseconds = 5 * 60 * 1000;

  /**
   * Lib - Backup - Grant Store - Clock.
   *
   * Supplies wall time for expiry checks.
   * Tests replace it to cover expiry without waiting.
   *
   * @private
   *
   * @since 2.1.0
   */
  readonly #clock: Lib_Backup_GrantStore_Clock;

  /**
   * Lib - Backup - Grant Store - Grants.
   *
   * Maps SHA-256 digests to their session, purpose, and expiry.
   * Raw grants exist only in the response and subsequent request.
   *
   * @private
   *
   * @since 2.1.0
   */
  readonly #grants: Lib_Backup_GrantStore_Grants = new Map();

  /**
   * Lib - Backup - Constructor.
   *
   * Starts an empty in-memory store with the supplied clock.
   * No grant survives a process restart.
   *
   * @param {Lib_Backup_GrantStore_Clock} [clock] - Clock.
   *
   * @since 2.1.0
   */
  public constructor(clock: Lib_Backup_GrantStore_Clock = Date.now) {
    this.#clock = clock;

    return;
  }

  /**
   * Lib - Backup - Issue.
   *
   * Returns a random raw grant once while retaining only its digest.
   * The record is bound to one browser session and one operation.
   *
   * @param {Lib_Backup_GrantStore_SessionId} sessionId - Session id.
   * @param {Lib_Backup_Purpose}              purpose   - Purpose.
   *
   * @returns {Lib_Backup_GrantStore_Issue_Returns}
   *
   * @since 2.1.0
   */
  public issue(sessionId: Lib_Backup_GrantStore_SessionId, purpose: Lib_Backup_Purpose): Lib_Backup_GrantStore_Issue_Returns {
    const now: Lib_Backup_GrantStore_Now = this.#clock();
    const grant: Lib_Backup_GrantStore_Grant = generateOpaqueToken('pbg_', 32);
    const expiresAt: Lib_Backup_GrantStore_ExpiresAt = now + GrantStore.#durationMilliseconds;

    this.prune(now);

    this.#grants.set(digestValue(grant), {
      expiresAt,
      purpose,
      sessionId,
    });

    return {
      expiresAt: new Date(expiresAt).toISOString(),
      grant,
    } satisfies Lib_Backup_Grant;
  }

  /**
   * Lib - Backup - Consume.
   *
   * Deletes a matching unexpired grant before reporting success.
   * A wrong session or purpose cannot invalidate the rightful caller's grant.
   *
   * @param {Lib_Backup_GrantStore_Grant}     grant     - Grant.
   * @param {Lib_Backup_GrantStore_SessionId} sessionId - Session id.
   * @param {Lib_Backup_Purpose}              purpose   - Purpose.
   *
   * @returns {Lib_Backup_GrantStore_Consume_Returns}
   *
   * @since 2.1.0
   */
  public consume(grant: Lib_Backup_GrantStore_Grant, sessionId: Lib_Backup_GrantStore_SessionId, purpose: Lib_Backup_Purpose): Lib_Backup_GrantStore_Consume_Returns {
    const now: Lib_Backup_GrantStore_Now = this.#clock();
    const digest: Lib_Backup_GrantStore_Digest = digestValue(grant);
    const record: Lib_Backup_GrantStore_Record = this.#grants.get(digest);

    if (record === undefined) {
      return false;
    }

    if (record['expiresAt'] <= now) {
      this.#grants.delete(digest);

      return false;
    }

    if (record['sessionId'] !== sessionId || record['purpose'] !== purpose) {
      return false;
    }

    this.#grants.delete(digest);

    return true;
  }

  /**
   * Lib - Backup - Prune.
   *
   * Drops expired digests whenever a new grant is issued.
   * The in-memory map therefore stays bounded by active confirmations.
   *
   * @param {Lib_Backup_GrantStore_Now} now - Now.
   *
   * @private
   *
   * @returns {Lib_Backup_GrantStore_Prune_Returns}
   *
   * @since 2.1.0
   */
  private prune(now: Lib_Backup_GrantStore_Now): Lib_Backup_GrantStore_Prune_Returns {
    for (const entry of this.#grants) {
      const grantEntry: Lib_Backup_GrantStore_Entry = entry;
      const digest: Lib_Backup_GrantStore_Digest = grantEntry[0];
      const record: Lib_Backup_GrantStore_Record = grantEntry[1];

      if (record !== undefined && record['expiresAt'] <= now) {
        this.#grants.delete(digest);
      }
    }

    return;
  }
}
