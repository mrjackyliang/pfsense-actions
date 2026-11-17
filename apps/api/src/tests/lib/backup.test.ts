import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  backupDocumentSchema as serverBackupDocumentSchema,
  GrantStore,
} from '@/lib/backup.js';
import { backupDocumentSchema as browserBackupDocumentSchema } from '@/web/backup-format.js';

import type {
  Tests_Lib_Backup_Document,
  Tests_Lib_Backup_Grant,
  Tests_Lib_Backup_Now,
  Tests_Lib_Backup_Store,
  Tests_Lib_Backup_UnknownDocument,
} from '@/types/tests/lib/backup.test.d.ts';

/**
 * Tests - Lib - Backup - Valid Document.
 *
 * Provides the smallest version-one document accepted by both strict schemas.
 * Individual validation cases add one untrusted difference at a time.
 *
 * @since 2.1.0
 */
const validDocument: Tests_Lib_Backup_Document = {
  appVersion: '2.0.0',
  connection: null,
  exportedAt: '2026-11-08T12:00:00.000Z',
  format: 'pfsense-actions-export',
  version: 1,
};

describe('backup confirmation grants', () => {
  it('expires after five minutes', () => {
    let now: Tests_Lib_Backup_Now = Date.parse('2026-11-08T12:00:00.000Z');
    const store: Tests_Lib_Backup_Store = new GrantStore(() => now);
    const issued: Tests_Lib_Backup_Grant = store.issue('session-one', 'export');

    now += (5 * 60 * 1000) + 1;

    expect(store.consume(issued['grant'], 'session-one', 'export')).toBe(false);

    return;
  });

  it('is single use and bound to its browser session and purpose', () => {
    const store: Tests_Lib_Backup_Store = new GrantStore();
    const issued: Tests_Lib_Backup_Grant = store.issue('session-one', 'import');

    expect(store.consume(issued['grant'], 'session-two', 'import')).toBe(false);

    expect(store.consume(issued['grant'], 'session-one', 'export')).toBe(false);

    expect(store.consume(issued['grant'], 'session-one', 'import')).toBe(true);

    expect(store.consume(issued['grant'], 'session-one', 'import')).toBe(false);

    return;
  });

  return;
});

describe('backup document validation', () => {
  it('rejects unknown top-level and nested fields in the server and browser', () => {
    const unknownTopLevel: Tests_Lib_Backup_UnknownDocument = {
      ...validDocument,
      administrator: {
        password: 'must-not-import',
      },
    };
    const unknownNested: Tests_Lib_Backup_UnknownDocument = {
      ...validDocument,
      connection: {
        credential: 'fixture-secret',
        credentialType: 'password',
        pfsenseSshIp: '192.0.2.10',
        pfsenseSshPort: 22,
        pfsenseUsername: 'operator',
        session: 'must-not-import',
      },
    };

    expect(serverBackupDocumentSchema.safeParse(unknownTopLevel).success).toBe(false);

    expect(browserBackupDocumentSchema.safeParse(unknownTopLevel).success).toBe(false);

    expect(serverBackupDocumentSchema.safeParse(unknownNested).success).toBe(false);

    expect(browserBackupDocumentSchema.safeParse(unknownNested).success).toBe(false);

    return;
  });

  it('rejects empty files and duplicate target or token identities', () => {
    const emptyDocument: Tests_Lib_Backup_UnknownDocument = {
      appVersion: validDocument['appVersion'],
      exportedAt: validDocument['exportedAt'],
      format: validDocument['format'],
      version: validDocument['version'],
    };
    const duplicateDocument: Tests_Lib_Backup_UnknownDocument = {
      ...validDocument,
      accessTokens: [
        {
          createdAt: '2026-11-08T12:00:00.000Z',
          expiresAt: null,
          id: 'token-one',
          lastUsedAt: null,
          name: 'Automation',
          scopes: ['pfsense:read'],
          tokenHash: 'a'.repeat(64),
        },
        {
          createdAt: '2026-11-08T12:00:00.000Z',
          expiresAt: null,
          id: 'token-two',
          lastUsedAt: null,
          name: 'AUTOMATION',
          scopes: ['wol:execute'],
          tokenHash: 'b'.repeat(64),
        },
      ],
    };

    expect(serverBackupDocumentSchema.safeParse(emptyDocument).success).toBe(false);

    expect(browserBackupDocumentSchema.safeParse(emptyDocument).success).toBe(false);

    expect(serverBackupDocumentSchema.safeParse(duplicateDocument).success).toBe(false);

    expect(browserBackupDocumentSchema.safeParse(duplicateDocument).success).toBe(false);

    return;
  });

  return;
});
