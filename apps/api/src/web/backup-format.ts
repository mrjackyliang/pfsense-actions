import { z } from 'zod';

import { notificationServices } from '@/web/notification-services.js';
import {
  lowercaseSlugPattern,
  notificationTargetIdPattern,
  sha256HashPattern,
} from '@/web/regex.js';

import type {
  Web_BackupFormat_BackupDocumentSchema,
  Web_BackupFormat_BackupDocumentSchema_NotificationIds,
  Web_BackupFormat_BackupDocumentSchema_NotificationNames,
  Web_BackupFormat_BackupDocumentSchema_TokenHashes,
  Web_BackupFormat_BackupDocumentSchema_TokenIds,
  Web_BackupFormat_BackupDocumentSchema_TokenNames,
  Web_BackupFormat_NotificationSchema_PlainKeys,
  Web_BackupFormat_NotificationSchema_SecretKeys,
  Web_BackupFormat_NotificationSchema_Service,
  Web_BackupFormat_ParseBackupDocument_Returns,
  Web_BackupFormat_ParseBackupDocument_Value,
} from '@/types/web/backup-format.d.ts';

/**
 * Backup Format - Event Schema.
 *
 * Restricts notification subscriptions to events this app currently emits.
 * Unknown event names make the complete file invalid.
 *
 * @since 2.1.0
 */
const eventSchema = z.enum([
  'secrets-removed',
  'sign-in-locked',
  'pfsense-unreachable',
  'pfsense-reachable',
  'action-failed',
  'wol-sent',
]);

/**
 * Backup Format - Service Schema.
 *
 * Restricts portable targets to notification integrations supported here.
 * Service-specific field validation runs after this discriminant is known.
 *
 * @since 2.1.0
 */
const serviceSchema = z.enum([
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
]);

/**
 * Backup Format - String Map Schema.
 *
 * Bounds keys and values used by notification settings and plain-text secrets.
 * Strict notification objects prevent nested or unrelated configuration.
 *
 * @since 2.1.0
 */
const stringMapSchema = z.record(z.string().min(1).max(64), z.string().max(4096));

/**
 * Backup Format - Notification Schema.
 *
 * Validates one portable target and keeps public and secret fields separated.
 * Field names must match the selected service's current definition.
 *
 * @since 2.1.0
 */
const notificationSchema = z.object({
  events: z.array(eventSchema).min(1).max(6).refine((events) => new Set(events).size === events.length),
  id: z.string().regex(new RegExp(notificationTargetIdPattern, 'u')),
  name: z.string().trim().min(1).max(80),
  secrets: stringMapSchema,
  service: serviceSchema,
  settings: stringMapSchema,
}).strict().superRefine((notification, context) => {
  const service: Web_BackupFormat_NotificationSchema_Service = notificationServices.find((definition) => definition['key'] === notification['service']);

  if (service === undefined) {
    return;
  }

  const plainKeys: Web_BackupFormat_NotificationSchema_PlainKeys = new Set(service['fields'].filter((field) => field['secret'] === false).map((field) => field['key']));
  const secretKeys: Web_BackupFormat_NotificationSchema_SecretKeys = new Set(service['fields'].filter((field) => field['secret']).map((field) => field['key']));

  for (const key of Object.keys(notification['settings'])) {
    if (plainKeys.has(key) === false) {
      context.addIssue({
        code: 'custom',
        message: 'The file has an unsupported non-secret setting.',
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
        message: 'The file has an unsupported secret setting.',
        path: [
          'secrets',
          key,
        ],
      });
    }
  }

  return;
});

/**
 * Backup Format - Backup Document Schema.
 *
 * Mirrors the server's strict version-one export contract in the browser.
 * Unknown keys, duplicate identities, and unsupported nested values are rejected.
 *
 * @since 2.1.0
 */
export const backupDocumentSchema: Web_BackupFormat_BackupDocumentSchema = z.object({
  accessTokens: z.array(z.object({
    createdAt: z.iso.datetime({ offset: true }),
    expiresAt: z.iso.datetime({ offset: true }).nullable(),
    id: z.string().min(1).max(64).regex(new RegExp(lowercaseSlugPattern, 'u')),
    lastUsedAt: z.iso.datetime({ offset: true }).nullable(),
    name: z.string().trim().min(1).max(80),
    scopes: z.array(z.enum([
      'pfsense:read',
      'reachability:read',
      'wol:execute',
    ])).min(1).max(3).refine((scopes) => new Set(scopes).size === scopes.length),
    tokenHash: z.string().regex(new RegExp(sha256HashPattern, 'u')),
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
}).strict().superRefine((document, context) => {
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

  const notificationNames: Web_BackupFormat_BackupDocumentSchema_NotificationNames = (document['notifications'] ?? []).map((notification) => notification['name'].toLocaleLowerCase());
  const notificationIds: Web_BackupFormat_BackupDocumentSchema_NotificationIds = (document['notifications'] ?? []).map((notification) => notification['id']);
  const tokenNames: Web_BackupFormat_BackupDocumentSchema_TokenNames = (document['accessTokens'] ?? []).map((token) => token['name'].toLocaleLowerCase());
  const tokenIds: Web_BackupFormat_BackupDocumentSchema_TokenIds = (document['accessTokens'] ?? []).map((token) => token['id']);
  const tokenHashes: Web_BackupFormat_BackupDocumentSchema_TokenHashes = (document['accessTokens'] ?? []).map((token) => token['tokenHash']);

  if (
    new Set(notificationNames).size !== notificationNames.length
      || new Set(notificationIds).size !== notificationIds.length
      || new Set(tokenNames).size !== tokenNames.length
      || new Set(tokenIds).size !== tokenIds.length
      || new Set(tokenHashes).size !== tokenHashes.length
  ) {
    context.addIssue({
      code: 'custom',
      message: 'The export contains duplicate targets or tokens.',
    });
  }

  return;
});

/**
 * Backup Format - Parse Backup Document.
 *
 * Converts an untrusted uploaded JSON value into the strict portable contract.
 * The wizard never previews or applies the original unvalidated value.
 *
 * @returns {Web_BackupFormat_ParseBackupDocument_Returns}
 *
 * @since 2.1.0
 */
export const parseBackupDocument = (value: Web_BackupFormat_ParseBackupDocument_Value): Web_BackupFormat_ParseBackupDocument_Returns => backupDocumentSchema.parse(value);
