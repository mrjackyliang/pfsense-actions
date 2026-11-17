import type { Web_BackupComponents_ImportProgressJob } from '@/types/web/backup-components.d.ts';

export type Web_Backup_Purpose = 'export' | 'import';

export type Web_Backup_ExportSections = {
  accessTokens: boolean;
  connection: boolean;
  notifications: boolean;
};

export type Web_Backup_Connection = {
  credential: string;
  credentialType: 'password' | 'privateKey';
  pfsenseSshIp: string;
  pfsenseSshPort: number;
  pfsenseUsername: string;
};

export type Web_Backup_Notification = {
  events: string[];
  id: string;
  name: string;
  secrets: Record<string, string>;
  service: 'apprise' | 'discord' | 'email' | 'gotify' | 'matrix' | 'ntfy' | 'ntfy-reverse-proxy' | 'pushover' | 'slack' | 'telegram' | 'webhook';
  settings: Record<string, string>;
};

export type Web_Backup_AccessToken = {
  createdAt: string;
  expiresAt: string | null;
  id: string;
  lastUsedAt: string | null;
  name: string;
  scopes: Array<'pfsense:read' | 'reachability:read' | 'wol:execute'>;
  tokenHash: string;
};

export type Web_Backup_Document = {
  accessTokens?: Web_Backup_AccessToken[] | undefined;
  appVersion: string;
  connection?: Web_Backup_Connection | null | undefined;
  exportedAt: string;
  format: 'pfsense-actions-export';
  notifications?: Web_Backup_Notification[] | undefined;
  version: 1;
};

export type Web_Backup_Grant = {
  expiresAt: string;
  grant: string;
};

export type Web_Backup_SectionId = 'connection' | 'notifications' | 'accessTokens';

export type Web_Backup_ImportSectionPreview = {
  file: string;
  here: string;
  id: Web_Backup_SectionId;
  label: string;
  reason?: string | undefined;
  willImport: boolean;
};

export type Web_Backup_ImportSummary = {
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

export type Web_Backup_ImportPreview = {
  appVersion: string;
  exportedAt: string;
  sections: Web_Backup_ImportSectionPreview[];
  summary: Web_Backup_ImportSummary;
};

export type Web_Backup_ImportResult = Web_Backup_ImportSummary & {
  importedSections: Web_Backup_SectionId[];
};

export type Web_Backup_ViewStep = 'source' | 'settings' | 'review' | 'confirm' | 'importing';

export type Web_Backup_ViewProps = {
  onImported: () => Promise<void>;
};

export type Web_Backup_ProgressJob = Web_BackupComponents_ImportProgressJob;
