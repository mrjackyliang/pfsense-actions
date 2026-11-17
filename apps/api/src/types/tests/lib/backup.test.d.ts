import type { GrantStore } from '@/lib/backup.js';
import type {
  Lib_Backup_Document,
  Lib_Backup_Grant,
} from '@/types/lib/backup.d.ts';

export type Tests_Lib_Backup_Document = Lib_Backup_Document;

export type Tests_Lib_Backup_Grant = Lib_Backup_Grant;

export type Tests_Lib_Backup_Now = number;

export type Tests_Lib_Backup_Store = GrantStore;

export type Tests_Lib_Backup_UnknownDocument = Record<string, unknown>;
