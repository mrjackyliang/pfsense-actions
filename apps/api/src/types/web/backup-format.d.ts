import type { Web_Api_Schema } from '@/types/web/api.d.ts';
import type { Web_Backup_Document } from '@/types/web/backup.d.ts';
import type { Web_Notifications_ServiceDefinition } from '@/types/web/notifications.d.ts';

/**
 * Backup Format.
 *
 * @since 2.2.1
 */
export type Web_BackupFormat_BackupDocumentSchema = Web_Api_Schema<Web_Backup_Document>;
export type Web_BackupFormat_BackupDocumentSchema_NotificationNames = string[];
export type Web_BackupFormat_BackupDocumentSchema_NotificationIds = string[];
export type Web_BackupFormat_BackupDocumentSchema_TokenNames = string[];
export type Web_BackupFormat_BackupDocumentSchema_TokenIds = string[];
export type Web_BackupFormat_BackupDocumentSchema_TokenHashes = string[];

/**
 * Backup Format.
 *
 * @since 2.2.1
 */
export type Web_BackupFormat_NotificationSchema_Service = Web_Notifications_ServiceDefinition | undefined;
export type Web_BackupFormat_NotificationSchema_PlainKeys = Set<string>;
export type Web_BackupFormat_NotificationSchema_SecretKeys = Set<string>;

/**
 * Backup Format.
 *
 * @since 2.2.1
 */
export type Web_BackupFormat_ParseBackupDocument_Value = unknown;
export type Web_BackupFormat_ParseBackupDocument_Returns = Web_Backup_Document;
