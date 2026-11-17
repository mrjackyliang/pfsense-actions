import {
  useMemo,
  useState,
} from 'react';

import {
  applyBackupImport,
  confirmBackupOperation,
  confirmBackupOperationWithPasskey,
  downloadBackupExport,
  getAccountSecurity,
  previewBackupImport,
} from '@/web/api.ts';
import { BackupExportDialog } from '@/web/backup-export-dialog.tsx';
import { BackupFileSource } from '@/web/backup-file-source.tsx';
import { parseBackupDocument } from '@/web/backup-format.ts';
import { BackupImportProgress } from '@/web/backup-import-progress.tsx';
import { BackupImportWizardShell } from '@/web/backup-import-wizard-shell.tsx';
import { BackupReviewList } from '@/web/backup-review-list.tsx';
import { BackupSection } from '@/web/backup-section.tsx';
import { BackupSettingsCompare } from '@/web/backup-settings-compare.tsx';
import { ConfirmIdentityStep } from '@/web/confirm-identity-step.tsx';
import { showToast } from '@/web/toast.ts';

import type {
  ChangeEvent,
  ReactElement,
} from 'react';

import type { Web_Api_AccountSecurity } from '@/types/web/api.d.ts';
import type {
  Web_BackupComponents_ExportOption,
  Web_BackupComponents_ExportSelection,
  Web_BackupComponents_ImportProgressItem,
  Web_BackupComponents_ReviewItem,
  Web_BackupComponents_ReviewNote,
  Web_BackupComponents_RunningImport,
  Web_BackupComponents_SettingsCompareExcludedItem,
  Web_BackupComponents_SettingsCompareRow,
  Web_BackupComponents_WizardStep,
} from '@/types/web/backup-components.d.ts';
import type {
  Web_Backup_Document,
  Web_Backup_ExportSections,
  Web_Backup_ImportPreview,
  Web_Backup_ImportResult,
  Web_Backup_ProgressJob,
  Web_Backup_ViewProps,
  Web_Backup_ViewStep,
} from '@/types/web/backup.d.ts';

/**
 * Backup View - Export options.
 *
 * Describes every portable section and defaults each one to selected.
 * The shared export dialog renders these app-specific choices.
 *
 * @since 2.1.0
 */
const exportOptions: Web_BackupComponents_ExportOption[] = [
  {
    description: 'pfSense SSH address, port, username, and its password or private key.',
    id: 'connection',
    label: 'Connection',
  },
  {
    description: 'Targets, events, settings, and secrets.',
    id: 'notifications',
    label: 'Notifications',
  },
  {
    description: 'Names, scopes, expiry, and stored hashes.',
    id: 'accessTokens',
    label: 'Access tokens',
  },
];

/**
 * Backup View - Wizard steps.
 *
 * Defines the approved pfSense Actions import flow without unrelated source types.
 * The shared shell uses this list for navigation and progress.
 *
 * @since 2.1.0
 */
const baseWizardSteps: Web_BackupComponents_WizardStep[] = [
  {
    id: 'source',
    label: 'Source',
  },
  {
    id: 'settings',
    label: 'Settings',
  },
  {
    id: 'review',
    label: 'Review',
  },
];

/**
 * Backup View - Empty security.
 *
 * Provides a safe render value while current account factors are loading.
 * Confirmation is not enabled until the actual security record arrives.
 *
 * @since 2.1.0
 */
const emptySecurity: Web_Api_AccountSecurity = {
  hostname: '',
  passkeys: [],
  passkeysAvailable: false,
  recoveryCodesRemaining: 0,
  totpEnabled: false,
  username: '',
};

/**
 * Backup View - Count label.
 *
 * Keeps action sentences grammatically correct without emitting zero-count fragments.
 * Review and completion summaries use the same noun choices.
 *
 * @since 2.1.0
 */
const countLabel = (count: number, singular: string, plural: string = `${singular}s`): string => (
  `${String(count)} ${(count === 1) ? singular : plural}`
);

/**
 * Backup View.
 *
 * Owns the app-specific export choices and import plan while delegating the approved
 * dialog frame, confirmation step, section, and progress presentation to shared UI.
 *
 * @since 2.1.0
 */
export const BackupView = ({ onImported }: Web_Backup_ViewProps): ReactElement => {
  const [
    exportOpen,
    setExportOpen,
  ] = useState<boolean>(false);
  const [
    importOpen,
    setImportOpen,
  ] = useState<boolean>(false);
  const [
    step,
    setStep,
  ] = useState<Web_Backup_ViewStep>('source');
  const [
    filename,
    setFilename,
  ] = useState<string>('');
  const [
    document,
    setDocument,
  ] = useState<Web_Backup_Document | null>(null);
  const [
    preview,
    setPreview,
  ] = useState<Web_Backup_ImportPreview | null>(null);
  const [
    security,
    setSecurity,
  ] = useState<Web_Api_AccountSecurity>(emptySecurity);
  const [
    busy,
    setBusy,
  ] = useState<boolean>(false);
  const [
    error,
    setError,
  ] = useState<string>('');
  const [
    progressJob,
    setProgressJob,
  ] = useState<Web_Backup_ProgressJob | null>(null);

  const runningImport: Web_BackupComponents_RunningImport | null = useMemo((): Web_BackupComponents_RunningImport | null => {
    if (progressJob === null) {
      return null;
    }

    let title: string = 'Import in progress';
    let detail: string = `Imported ${String(progressJob['completed'])} of ${String(progressJob['total'])}`;
    if (progressJob['status'] === 'completed') {
      title = 'Import complete';
      detail = 'See what changed';
    } else if (progressJob['status'] === 'failed') {
      title = 'Import stopped';
      detail = progressJob['error'] || 'Needs review';
    }

    return {
      detail,
      progress: (progressJob['total'] === 0) ? 0 : progressJob['completed'] / progressJob['total'],
      title,
    };
  }, [progressJob]);

  const passkeyAvailable: boolean = security['passkeysAvailable'] && security['passkeys'].length > 0;
  const wizardSteps: Web_BackupComponents_WizardStep[] = useMemo((): Web_BackupComponents_WizardStep[] => {
    const steps: Web_BackupComponents_WizardStep[] = [...baseWizardSteps];
    if (step === 'importing') {
      steps.push({
        id: 'importing',
        label: 'Importing',
      });
    }

    return steps;
  }, [step]);
  const settingRows: Web_BackupComponents_SettingsCompareRow[] = preview?.['sections']
    .filter((section): boolean => section['willImport'])
    .map((section): Web_BackupComponents_SettingsCompareRow => ({
      changed: section['file'] !== section['here'],
      fileValue: section['file'],
      hereValue: section['here'],
      id: section['id'],
      label: section['label'],
    })) ?? [];
  // Every section that does not import is absent from the file, so nothing is left out.
  // Local-only data is covered by the Review note that it stays here.
  const excludedItems: Web_BackupComponents_SettingsCompareExcludedItem[] = [];
  const reviewItems: Web_BackupComponents_ReviewItem[] = [];
  if (preview !== null) {
    if (preview['summary']['connection'] === 'added') {
      reviewItems.push({
        id: 'connection',
        text: 'Add the pfSense connection',
      });
    } else if (preview['summary']['connection'] === 'replaced') {
      reviewItems.push({
        id: 'connection',
        text: 'Replace the pfSense connection',
      });
    }
    if (preview['summary']['notifications']['added'] > 0) {
      reviewItems.push({
        id: 'notifications-added',
        text: `Add ${countLabel(preview['summary']['notifications']['added'], 'notification target')}`,
      });
    }
    if (preview['summary']['notifications']['replaced'] > 0) {
      reviewItems.push({
        id: 'notifications-replaced',
        text: `Replace ${countLabel(preview['summary']['notifications']['replaced'], 'notification target')} with the same name`,
      });
    }
    if (preview['summary']['accessTokens']['added'] > 0) {
      reviewItems.push({
        id: 'access-tokens-added',
        text: `Add ${countLabel(preview['summary']['accessTokens']['added'], 'access token')}`,
      });
    }
    if (preview['summary']['accessTokens']['skipped'] > 0) {
      const skipped: number = preview['summary']['accessTokens']['skipped'];
      reviewItems.push({
        id: 'access-tokens-skipped',
        text: `Skip ${countLabel(skipped, 'access token')} that ${(skipped === 1) ? 'is' : 'are'} already here`,
      });
    }
  }
  const reviewNotes: Web_BackupComponents_ReviewNote[] = [
    {
      icon: 'clock',
      id: 'transaction',
      text: 'Everything is applied at once after you confirm.',
    },
    {
      icon: 'shield',
      id: 'local-data',
      text: 'Your administrator account, sign-in security, sessions and activity history stay here.',
    },
  ];

  /**
   * Backup View - Loads security.
   *
   * Refreshes available confirmation factors immediately before they are needed.
   * This keeps TOTP and passkey choices synchronized with the account.
   *
   * @since 2.1.0
   */
  const loadSecurity = async (): Promise<void> => {
    setSecurity(await getAccountSecurity());
  };

  /**
   * Backup View - Opens export.
   *
   * Shows the export choices and preloads current confirmation factors.
   * A factor-loading failure appears as a non-secret toast.
   *
   * @since 2.1.0
   */
  const openExport = (): void => {
    setExportOpen(true);
    void loadSecurity().catch((caughtError: unknown): void => {
      showToast((caughtError instanceof Error) ? caughtError.message : 'Account security could not be loaded.', false);
    });
  };

  /**
   * Backup View - Clears import.
   *
   * Discards the uploaded document and every transient wizard value.
   * Completed and failed jobs return to a clean Source step.
   *
   * @since 2.1.0
   */
  const clearImport = (): void => {
    setImportOpen(false);
    setStep('source');
    setFilename('');
    setDocument(null);
    setPreview(null);
    setError('');
    setBusy(false);
    setProgressJob(null);
  };

  /**
   * Backup View - Opens import.
   *
   * Starts a new source flow or reopens an import that is still running.
   * Validation messages are cleared when the dialog appears.
   *
   * @since 2.1.0
   */
  const openImport = (): void => {
    setImportOpen(true);
    setStep((progressJob === null) ? 'source' : 'importing');
    setError('');
  };

  /**
   * Backup View - Closes import.
   *
   * Hides an import job without discarding its progress or final result.
   * An unstarted wizard still clears its uploaded document and preview.
   *
   * @since 2.1.0
   */
  const closeImport = (): void => {
    if (progressJob !== null) {
      setImportOpen(false);

      return;
    }

    clearImport();
  };

  /**
   * Backup View - Chooses file.
   *
   * Strictly parses an uploaded export and asks the server for its import plan.
   * The original unvalidated JSON is never kept in wizard state.
   *
   * @since 2.1.0
   */
  const chooseFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const input: HTMLInputElement = event.currentTarget;
    const file: File | undefined = input.files?.[0];

    input.value = '';

    if (file === undefined) {
      return;
    }

    setBusy(true);
    setError('');

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Choose an export file smaller than 10 MB.');
      }

      const value: unknown = JSON.parse(await file.text());
      const nextDocument: Web_Backup_Document = parseBackupDocument(value);
      const nextPreview: Web_Backup_ImportPreview = await previewBackupImport(nextDocument);

      setFilename(file.name);
      setDocument(nextDocument);
      setPreview(nextPreview);
    } catch (caughtError) {
      let message: string = 'That file is not a valid pfSense Actions export.';

      if (caughtError instanceof SyntaxError) {
        message = 'That file is not valid JSON.';
      } else if (caughtError instanceof Error) {
        message = caughtError.message;
      }

      setFilename('');
      setDocument(null);
      setPreview(null);
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * Backup View - Applies import.
   *
   * Exchanges a one-use confirmation grant for one transactional server import.
   * The progress view changes to complete only after the app refresh succeeds.
   *
   * @since 2.1.0
   */
  const applyImport = async (grant: string): Promise<void> => {
    if (document === null || preview === null) {
      throw new Error('Choose an export file first.');
    }

    const items: Web_BackupComponents_ImportProgressItem[] = preview['sections']
      .filter((section): boolean => section['willImport'])
      .map((section): Web_BackupComponents_ImportProgressItem => ({
        context: 'Waiting',
        id: section['id'],
        name: section['label'],
        status: 'Queued',
        tone: 'muted',
      }));

    setStep('importing');
    setBusy(true);
    setProgressJob({
      completed: 0,
      error: '',
      items,
      status: 'running',
      total: items.length,
    });

    try {
      const result: Web_Backup_ImportResult = await applyBackupImport(document, grant);

      await onImported();

      setProgressJob({
        completed: result['importedSections'].length,
        error: '',
        items: items.map((item): Web_BackupComponents_ImportProgressItem => {
          const changes: string[] = [];

          if (item['id'] === 'connection') {
            changes.push((result['connection'] === 'replaced') ? 'Replaced' : 'Added');
          } else if (item['id'] === 'notifications') {
            if (result['notifications']['added'] > 0) {
              changes.push(`${String(result['notifications']['added'])} added`);
            }
            if (result['notifications']['replaced'] > 0) {
              changes.push(`${String(result['notifications']['replaced'])} replaced`);
            }
          } else {
            if (result['accessTokens']['added'] > 0) {
              changes.push(`${String(result['accessTokens']['added'])} added`);
            }
            if (result['accessTokens']['skipped'] > 0) {
              changes.push(`${String(result['accessTokens']['skipped'])} skipped`);
            }
          }

          return {
            ...item,
            context: changes.join(', '),
            status: 'Imported',
            tone: 'success',
          };
        }),
        status: 'completed',
        total: items.length,
      });
    } catch (caughtError) {
      setProgressJob({
        completed: 0,
        error: (caughtError instanceof Error) ? caughtError.message : 'The import could not be applied.',
        items,
        status: 'failed',
        total: items.length,
      });
      throw caughtError;
    } finally {
      setBusy(false);
    }
  };

  /**
   * Backup View - Next.
   *
   * Advances through source, settings, review, and fresh identity confirmation.
   * Confirmation factors are refreshed before entering that sensitive step.
   *
   * @since 2.1.0
   */
  const next = (): void => {
    if (step === 'source') {
      setStep('settings');
    } else if (step === 'settings') {
      setStep('review');
    } else if (step === 'review') {
      setBusy(true);
      void loadSecurity().then((): void => setStep('confirm')).catch((caughtError: unknown): void => {
        setError((caughtError instanceof Error) ? caughtError.message : 'Account security could not be loaded.');
      }).finally((): void => setBusy(false));
    }
  };

  /**
   * Backup View - Back.
   *
   * Moves to the preceding review step without losing the parsed file or plan.
   * Importing is deliberately excluded because it cannot be rewound.
   *
   * @since 2.1.0
   */
  const back = (): void => {
    if (step === 'settings') {
      setStep('source');
    } else if (step === 'review') {
      setStep('settings');
    } else if (step === 'confirm') {
      setStep('review');
    }
  };

  let content: ReactElement = <div />;

  if (step === 'source') {
    content = (
      <div className="backup-source-grid">
        <BackupFileSource
          busy={busy}
          description="A JSON file made from this Backup section."
          fileName={filename}
          label="A pfSense Actions export"
          name="backup-source"
          onFileChange={(event: ChangeEvent<HTMLInputElement>): void => {
            void chooseFile(event);
          }}
          onSelect={(): void => undefined}
          selected
        />
        {(error === '') ? null : <div className="form-error" role="alert">{error}</div>}
      </div>
    );
  } else if (step === 'settings' && preview !== null) {
    content = (
      <BackupSettingsCompare
        description="Review what changes and what remains as it is here."
        excludedItems={excludedItems}
        fileColumn="In the file"
        rows={settingRows}
      />
    );
  } else if (step === 'review' && preview !== null) {
    content = (
      <BackupReviewList error={error} items={reviewItems} notes={reviewNotes} />
    );
  } else if (step === 'confirm') {
    content = (
      <ConfirmIdentityStep
        authenticatorEnabled={security['totpEnabled']}
        description="Confirm the current account before applying this import."
        onBack={back}
        onConfirm={async (password: string, code: string): Promise<string> => confirmBackupOperation('import', password, code)}
        onConfirmed={applyImport}
        onPasskey={async (): Promise<string> => confirmBackupOperationWithPasskey('import')}
        passkeyAvailable={passkeyAvailable}
      />
    );
  } else if (step === 'importing' && progressJob !== null) {
    content = (
      <BackupImportProgress
        applyingLabel="Applying configuration in one transaction…"
        contextColumn="Change"
        headingSummary={countLabel(progressJob['total'], 'section')}
        itemColumn="Section"
        job={progressJob}
        onBackground={(): void => setImportOpen(false)}
        onDone={(): void => {
          showToast('Imported the selected backup configuration.', true);
          clearImport();
        }}
        progressLabel={(completed: number, total: number): string => `Imported ${String(completed)} of ${String(total)}`}
      />
    );
  }

  return (
    <>
      <BackupSection
        description="Save this setup to a file, or bring one in."
        importJob={runningImport}
        onExport={openExport}
        onImport={openImport}
        onOpenImport={openImport}
        rowLabel="Export and import"
        title="Backup"
      />
      <BackupExportDialog
        authenticatorEnabled={security['totpEnabled']}
        description="Choose what to save in this export."
        onClose={(): void => setExportOpen(false)}
        onConfirm={async (password: string, code: string): Promise<string> => confirmBackupOperation('export', password, code)}
        onExport={async (selection: Web_BackupComponents_ExportSelection, grant: string): Promise<void> => {
          const sections: Web_Backup_ExportSections = {
            accessTokens: selection['accessTokens'] === true,
            connection: selection['connection'] === true,
            notifications: selection['notifications'] === true,
          };

          await downloadBackupExport(sections, grant);
          showToast('Export downloaded. Keep it somewhere safe.', true);
        }}
        onPasskey={async (): Promise<string> => confirmBackupOperationWithPasskey('export')}
        open={exportOpen}
        options={exportOptions}
        passkeyAvailable={passkeyAvailable}
        secretWarning="The file includes passwords and keys in plain text. Keep it somewhere safe."
        title="Export"
      />
      <BackupImportWizardShell
        backDisabled={step === 'source'}
        busy={busy}
        currentStep={(step === 'confirm') ? 'review' : step}
        description={(step === 'importing') ? 'You can close this dialog without stopping the import.' : 'Bring settings into this pfSense Actions.'}
        hideNavigation={step === 'confirm' || step === 'importing'}
        nextDisabled={(step === 'source' && preview === null) || (step === 'settings' && preview?.['sections'].some((section): boolean => section['willImport']) !== true)}
        nextIcon={(step === 'review') ? 'upload' : undefined}
        nextLabel={(step === 'review') ? 'Import' : 'Next'}
        onBack={back}
        onClose={closeImport}
        onNext={next}
        open={importOpen}
        steps={wizardSteps}
        title="Import"
      >
        {content}
      </BackupImportWizardShell>
    </>
  );
};
