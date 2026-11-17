import { z } from 'zod';

import { notificationServices } from '@/web/notification-services.js';

import type { Web_Api_Schema } from '@/types/web/api.d.ts';
import type { Web_Backup_Document } from '@/types/web/backup.d.ts';

/**
 * Backup Format - Event schema.
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
 * Backup Format - Service schema.
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
 * Backup Format - String map schema.
 *
 * Bounds keys and values used by notification settings and plain-text secrets.
 * Strict notification objects prevent nested or unrelated configuration.
 *
 * @since 2.1.0
 */
const stringMapSchema = z.record(z.string().min(1).max(64), z.string().max(4096));

/**
 * Backup Format - Notification schema.
 *
 * Validates one portable target and keeps public and secret fields separated.
 * Field names must match the selected service's current definition.
 *
 * @since 2.1.0
 */
const notificationSchema = z.object({
  events: z.array(eventSchema).min(1).max(6).refine((events): boolean => new Set(events).size === events.length),
  id: z.string().regex(/^ntf-[0-9a-f]{16}$/u),
  name: z.string().trim().min(1).max(80),
  secrets: stringMapSchema,
  service: serviceSchema,
  settings: stringMapSchema,
}).strict().superRefine((notification, context): void => {
  const service = notificationServices.find((definition): boolean => definition['key'] === notification['service']);

  if (service === undefined) {
    return;
  }

  const plainKeys: Set<string> = new Set(service['fields'].filter((field): boolean => field['secret'] === false).map((field): string => field['key']));
  const secretKeys: Set<string> = new Set(service['fields'].filter((field): boolean => field['secret']).map((field): string => field['key']));

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
});

/**
 * Backup Format - Backup document schema.
 *
 * Mirrors the server's strict version-one export contract in the browser.
 * Unknown keys, duplicate identities, and unsupported nested values are rejected.
 *
 * @since 2.1.0
 */
export const backupDocumentSchema: Web_Api_Schema<Web_Backup_Document> = z.object({
  accessTokens: z.array(z.object({
    createdAt: z.iso.datetime({ offset: true }),
    expiresAt: z.iso.datetime({ offset: true }).nullable(),
    id: z.string().min(1).max(64).regex(/^[a-z][a-z0-9-]*$/u),
    lastUsedAt: z.iso.datetime({ offset: true }).nullable(),
    name: z.string().trim().min(1).max(80),
    scopes: z.array(z.enum([
      'pfsense:read',
      'reachability:read',
      'wol:execute',
    ])).min(1).max(3).refine((scopes): boolean => new Set(scopes).size === scopes.length),
    tokenHash: z.string().regex(/^[0-9a-f]{64}$/u),
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
}).strict().superRefine((document, context): void => {
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

  const notificationNames: string[] = (document['notifications'] ?? []).map((notification): string => notification['name'].toLocaleLowerCase());
  const notificationIds: string[] = (document['notifications'] ?? []).map((notification): string => notification['id']);
  const tokenNames: string[] = (document['accessTokens'] ?? []).map((token): string => token['name'].toLocaleLowerCase());
  const tokenIds: string[] = (document['accessTokens'] ?? []).map((token): string => token['id']);
  const tokenHashes: string[] = (document['accessTokens'] ?? []).map((token): string => token['tokenHash']);

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
});

/**
 * Backup Format - Parse backup document.
 *
 * Converts an untrusted uploaded JSON value into the strict portable contract.
 * The wizard never previews or applies the original unvalidated value.
 *
 * @since 2.1.0
 */
export const parseBackupDocument = (value: unknown): Web_Backup_Document => backupDocumentSchema.parse(value);
