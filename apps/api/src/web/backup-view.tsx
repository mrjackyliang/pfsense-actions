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

import type { ReactElement } from 'react';

import type {
  Web_BackupView_BackupView_ApplyImport,
  Web_BackupView_BackupView_ApplyImport_Changes,
  Web_BackupView_BackupView_ApplyImport_Grant,
  Web_BackupView_BackupView_ApplyImport_Items,
  Web_BackupView_BackupView_ApplyImport_Returns,
  Web_BackupView_BackupView_Back,
  Web_BackupView_BackupView_Back_Returns,
  Web_BackupView_BackupView_Busy,
  Web_BackupView_BackupView_BusyState,
  Web_BackupView_BackupView_ChooseFile,
  Web_BackupView_BackupView_ChooseFile_Event,
  Web_BackupView_BackupView_ChooseFile_File,
  Web_BackupView_BackupView_ChooseFile_Input,
  Web_BackupView_BackupView_ChooseFile_InputFiles,
  Web_BackupView_BackupView_ChooseFile_Message,
  Web_BackupView_BackupView_ChooseFile_Returns,
  Web_BackupView_BackupView_ChooseFile_Value,
  Web_BackupView_BackupView_ClearImport,
  Web_BackupView_BackupView_ClearImport_Returns,
  Web_BackupView_BackupView_CloseImport,
  Web_BackupView_BackupView_CloseImport_Returns,
  Web_BackupView_BackupView_Detail,
  Web_BackupView_BackupView_Document,
  Web_BackupView_BackupView_DocumentState,
  Web_BackupView_BackupView_Error,
  Web_BackupView_BackupView_ErrorState,
  Web_BackupView_BackupView_ExcludedItems,
  Web_BackupView_BackupView_ExportOpen,
  Web_BackupView_BackupView_ExportOpenState,
  Web_BackupView_BackupView_Filename,
  Web_BackupView_BackupView_FilenameState,
  Web_BackupView_BackupView_ImportOpen,
  Web_BackupView_BackupView_ImportOpenState,
  Web_BackupView_BackupView_LoadSecurity,
  Web_BackupView_BackupView_LoadSecurity_Returns,
  Web_BackupView_BackupView_Next,
  Web_BackupView_BackupView_Next_Returns,
  Web_BackupView_BackupView_OnImported,
  Web_BackupView_BackupView_OpenExport,
  Web_BackupView_BackupView_OpenExport_Returns,
  Web_BackupView_BackupView_OpenImport,
  Web_BackupView_BackupView_OpenImport_Returns,
  Web_BackupView_BackupView_PasskeyAvailable,
  Web_BackupView_BackupView_Preview,
  Web_BackupView_BackupView_PreviewState,
  Web_BackupView_BackupView_ProgressJob,
  Web_BackupView_BackupView_ProgressJobState,
  Web_BackupView_BackupView_Props,
  Web_BackupView_BackupView_Returns,
  Web_BackupView_BackupView_ReviewItems,
  Web_BackupView_BackupView_ReviewNotes,
  Web_BackupView_BackupView_RunningImport,
  Web_BackupView_BackupView_Security,
  Web_BackupView_BackupView_SecurityState,
  Web_BackupView_BackupView_SetBusy,
  Web_BackupView_BackupView_SetDocument,
  Web_BackupView_BackupView_SetError,
  Web_BackupView_BackupView_SetExportOpen,
  Web_BackupView_BackupView_SetFilename,
  Web_BackupView_BackupView_SetImportOpen,
  Web_BackupView_BackupView_SetPreview,
  Web_BackupView_BackupView_SetProgressJob,
  Web_BackupView_BackupView_SetSecurity,
  Web_BackupView_BackupView_SetStep,
  Web_BackupView_BackupView_SettingRows,
  Web_BackupView_BackupView_SettingsImportable,
  Web_BackupView_BackupView_Skipped,
  Web_BackupView_BackupView_SkippedVerb,
  Web_BackupView_BackupView_Step,
  Web_BackupView_BackupView_Steps,
  Web_BackupView_BackupView_StepState,
  Web_BackupView_BackupView_Title,
  Web_BackupView_BackupView_WizardSteps,
  Web_BackupView_BaseWizardSteps,
  Web_BackupView_CountLabel_Count,
  Web_BackupView_CountLabel_Noun,
  Web_BackupView_CountLabel_Plural,
  Web_BackupView_CountLabel_Returns,
  Web_BackupView_CountLabel_Singular,
  Web_BackupView_EmptySecurity,
  Web_BackupView_ExportOptions,
} from '@/types/web/backup-view.d.ts';
import type {
  Web_Backup_Document,
  Web_Backup_ExportSections,
  Web_Backup_ImportPreview,
  Web_Backup_ImportResult,
} from '@/types/web/backup.d.ts';

/**
 * Backup View - Export Options.
 *
 * Describes every portable section and defaults each one to selected.
 * The shared export dialog renders these app-specific choices.
 *
 * @since 2.1.0
 */
const exportOptions: Web_BackupView_ExportOptions = [
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
 * Backup View - Base Wizard Steps.
 *
 * Defines the approved pfSense Actions import flow without unrelated source types.
 * The shared shell uses this list for navigation and progress.
 *
 * @since 2.1.0
 */
const baseWizardSteps: Web_BackupView_BaseWizardSteps = [
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
 * Backup View - Empty Security.
 *
 * Provides a safe render value while current account factors are loading.
 * Confirmation is not enabled until the actual security record arrives.
 *
 * @since 2.1.0
 */
const emptySecurity: Web_BackupView_EmptySecurity = {
  hostname: '',
  passkeys: [],
  passkeysAvailable: false,
  recoveryCodesRemaining: 0,
  totpEnabled: false,
  username: '',
};

/**
 * Backup View - Count Label.
 *
 * Keeps action sentences grammatically correct without emitting zero-count fragments.
 * Review and completion summaries use the same noun choices.
 *
 * @param {Web_BackupView_CountLabel_Count}    count    - Count.
 * @param {Web_BackupView_CountLabel_Singular} singular - Singular.
 * @param {Web_BackupView_CountLabel_Plural}   [plural] - Plural.
 *
 * @returns {Web_BackupView_CountLabel_Returns}
 *
 * @since 2.1.0
 */
const countLabel = (count: Web_BackupView_CountLabel_Count, singular: Web_BackupView_CountLabel_Singular, plural: Web_BackupView_CountLabel_Plural = `${singular}s`): Web_BackupView_CountLabel_Returns => {
  const noun: Web_BackupView_CountLabel_Noun = (count === 1) ? singular : plural;

  return `${String(count)} ${noun}`;
};

/**
 * Backup View - Backup View.
 *
 * Owns the app-specific export choices and import plan while delegating the approved
 * dialog frame, confirmation step, section, and progress presentation to shared UI.
 *
 * @param {Web_BackupView_BackupView_Props} props - Props.
 *
 * @returns {Web_BackupView_BackupView_Returns}
 *
 * @since 2.1.0
 */
export const BackupView = (props: Web_BackupView_BackupView_Props): Web_BackupView_BackupView_Returns => {
  const onImported: Web_BackupView_BackupView_OnImported = props['onImported'];
  const exportOpenState: Web_BackupView_BackupView_ExportOpenState = useState<Web_BackupView_BackupView_ExportOpen>(false);
  const exportOpen: Web_BackupView_BackupView_ExportOpen = exportOpenState[0];
  const setExportOpen: Web_BackupView_BackupView_SetExportOpen = exportOpenState[1];
  const importOpenState: Web_BackupView_BackupView_ImportOpenState = useState<Web_BackupView_BackupView_ImportOpen>(false);
  const importOpen: Web_BackupView_BackupView_ImportOpen = importOpenState[0];
  const setImportOpen: Web_BackupView_BackupView_SetImportOpen = importOpenState[1];
  const stepState: Web_BackupView_BackupView_StepState = useState<Web_BackupView_BackupView_Step>('source');
  const step: Web_BackupView_BackupView_Step = stepState[0];
  const setStep: Web_BackupView_BackupView_SetStep = stepState[1];
  const filenameState: Web_BackupView_BackupView_FilenameState = useState<Web_BackupView_BackupView_Filename>('');
  const filename: Web_BackupView_BackupView_Filename = filenameState[0];
  const setFilename: Web_BackupView_BackupView_SetFilename = filenameState[1];
  const documentState: Web_BackupView_BackupView_DocumentState = useState<Web_BackupView_BackupView_Document>(null);
  const document: Web_BackupView_BackupView_Document = documentState[0];
  const setDocument: Web_BackupView_BackupView_SetDocument = documentState[1];
  const previewState: Web_BackupView_BackupView_PreviewState = useState<Web_BackupView_BackupView_Preview>(null);
  const preview: Web_BackupView_BackupView_Preview = previewState[0];
  const setPreview: Web_BackupView_BackupView_SetPreview = previewState[1];
  const securityState: Web_BackupView_BackupView_SecurityState = useState<Web_BackupView_BackupView_Security>(emptySecurity);
  const security: Web_BackupView_BackupView_Security = securityState[0];
  const setSecurity: Web_BackupView_BackupView_SetSecurity = securityState[1];
  const busyState: Web_BackupView_BackupView_BusyState = useState<Web_BackupView_BackupView_Busy>(false);
  const busy: Web_BackupView_BackupView_Busy = busyState[0];
  const setBusy: Web_BackupView_BackupView_SetBusy = busyState[1];
  const errorState: Web_BackupView_BackupView_ErrorState = useState<Web_BackupView_BackupView_Error>('');
  const error: Web_BackupView_BackupView_Error = errorState[0];
  const setError: Web_BackupView_BackupView_SetError = errorState[1];
  const progressJobState: Web_BackupView_BackupView_ProgressJobState = useState<Web_BackupView_BackupView_ProgressJob>(null);
  const progressJob: Web_BackupView_BackupView_ProgressJob = progressJobState[0];
  const setProgressJob: Web_BackupView_BackupView_SetProgressJob = progressJobState[1];

  const runningImport: Web_BackupView_BackupView_RunningImport = useMemo<Web_BackupView_BackupView_RunningImport>(() => {
    if (progressJob === null) {
      return null;
    }

    let title: Web_BackupView_BackupView_Title = 'Import in progress';
    let detail: Web_BackupView_BackupView_Detail = `Imported ${String(progressJob['completed'])} of ${String(progressJob['total'])}`;
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

  const passkeyAvailable: Web_BackupView_BackupView_PasskeyAvailable = security['passkeysAvailable'] && security['passkeys'].length > 0;
  const wizardSteps: Web_BackupView_BackupView_WizardSteps = useMemo<Web_BackupView_BackupView_WizardSteps>(() => {
    const steps: Web_BackupView_BackupView_Steps = [...baseWizardSteps];
    if (step === 'importing') {
      steps.push({
        id: 'importing',
        label: 'Importing',
      });
    }

    return steps;
  }, [step]);
  const settingRows: Web_BackupView_BackupView_SettingRows = (preview !== null) ? preview['sections']
    .filter((section) => section['willImport'])
    .map((section) => ({
      changed: section['file'] !== section['here'],
      fileValue: section['file'],
      hereValue: section['here'],
      id: section['id'],
      label: section['label'],
    })) : [];

  // Every section that does not import is absent from the file, so nothing is left out.
  // Local-only data is covered by the Review note that it stays here.
  const excludedItems: Web_BackupView_BackupView_ExcludedItems = [];
  const reviewItems: Web_BackupView_BackupView_ReviewItems = [];
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
      const skipped: Web_BackupView_BackupView_Skipped = preview['summary']['accessTokens']['skipped'];
      const skippedVerb: Web_BackupView_BackupView_SkippedVerb = (skipped === 1) ? 'is' : 'are';

      reviewItems.push({
        id: 'access-tokens-skipped',
        text: `Skip ${countLabel(skipped, 'access token')} that ${skippedVerb} already here`,
      });
    }
  }
  const reviewNotes: Web_BackupView_BackupView_ReviewNotes = [
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
   * Backup View - Load Security.
   *
   * Refreshes available confirmation factors immediately before they are needed.
   * This keeps TOTP and passkey choices synchronized with the account.
   *
   * @returns {Web_BackupView_BackupView_LoadSecurity_Returns}
   *
   * @since 2.1.0
   */
  const loadSecurity: Web_BackupView_BackupView_LoadSecurity = async (): Web_BackupView_BackupView_LoadSecurity_Returns => {
    setSecurity(await getAccountSecurity());

    return;
  };

  /**
   * Backup View - Open Export.
   *
   * Shows the export choices and preloads current confirmation factors.
   * A factor-loading failure appears as a non-secret toast.
   *
   * @returns {Web_BackupView_BackupView_OpenExport_Returns}
   *
   * @since 2.1.0
   */
  const openExport: Web_BackupView_BackupView_OpenExport = (): Web_BackupView_BackupView_OpenExport_Returns => {
    setExportOpen(true);
    void loadSecurity().catch((caughtError) => {
      showToast((caughtError instanceof Error) ? caughtError.message : 'Account security could not be loaded.', false);

      return;
    });

    return;
  };

  /**
   * Backup View - Clear Import.
   *
   * Discards the uploaded document and every transient wizard value.
   * Completed and failed jobs return to a clean Source step.
   *
   * @returns {Web_BackupView_BackupView_ClearImport_Returns}
   *
   * @since 2.1.0
   */
  const clearImport: Web_BackupView_BackupView_ClearImport = (): Web_BackupView_BackupView_ClearImport_Returns => {
    setImportOpen(false);
    setStep('source');
    setFilename('');
    setDocument(null);
    setPreview(null);
    setError('');
    setBusy(false);
    setProgressJob(null);

    return;
  };

  /**
   * Backup View - Open Import.
   *
   * Starts a new source flow or reopens an import that is still running.
   * Validation messages are cleared when the dialog appears.
   *
   * @returns {Web_BackupView_BackupView_OpenImport_Returns}
   *
   * @since 2.1.0
   */
  const openImport: Web_BackupView_BackupView_OpenImport = (): Web_BackupView_BackupView_OpenImport_Returns => {
    setImportOpen(true);
    setStep((progressJob === null) ? 'source' : 'importing');
    setError('');

    return;
  };

  /**
   * Backup View - Close Import.
   *
   * Hides an import job without discarding its progress or final result.
   * An unstarted wizard still clears its uploaded document and preview.
   *
   * @returns {Web_BackupView_BackupView_CloseImport_Returns}
   *
   * @since 2.1.0
   */
  const closeImport: Web_BackupView_BackupView_CloseImport = (): Web_BackupView_BackupView_CloseImport_Returns => {
    if (progressJob !== null) {
      setImportOpen(false);

      return;
    }

    clearImport();

    return;
  };

  /**
   * Backup View - Choose File.
   *
   * Strictly parses an uploaded export and asks the server for its import plan.
   * The original unvalidated JSON is never kept in wizard state.
   *
   * @param {Web_BackupView_BackupView_ChooseFile_Event} event - Event.
   *
   * @returns {Web_BackupView_BackupView_ChooseFile_Returns}
   *
   * @since 2.1.0
   */
  const chooseFile: Web_BackupView_BackupView_ChooseFile = async (event: Web_BackupView_BackupView_ChooseFile_Event): Web_BackupView_BackupView_ChooseFile_Returns => {
    const input: Web_BackupView_BackupView_ChooseFile_Input = event.currentTarget;
    const inputFiles: Web_BackupView_BackupView_ChooseFile_InputFiles = input.files;
    const file: Web_BackupView_BackupView_ChooseFile_File = (inputFiles !== null) ? inputFiles[0] : undefined;

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

      const value: Web_BackupView_BackupView_ChooseFile_Value = JSON.parse(await file.text());
      const nextDocument: Web_Backup_Document = parseBackupDocument(value);
      const nextPreview: Web_Backup_ImportPreview = await previewBackupImport(nextDocument);

      setFilename(file.name);
      setDocument(nextDocument);
      setPreview(nextPreview);
    } catch (caughtError) {
      let message: Web_BackupView_BackupView_ChooseFile_Message = 'That file is not a valid pfSense Actions export.';

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

    return;
  };

  /**
   * Backup View - Apply Import.
   *
   * Exchanges a one-use confirmation grant for one transactional server import.
   * The progress view changes to complete only after the app refresh succeeds.
   *
   * @param {Web_BackupView_BackupView_ApplyImport_Grant} grant - Grant.
   *
   * @returns {Web_BackupView_BackupView_ApplyImport_Returns}
   *
   * @since 2.1.0
   */
  const applyImport: Web_BackupView_BackupView_ApplyImport = async (grant: Web_BackupView_BackupView_ApplyImport_Grant): Web_BackupView_BackupView_ApplyImport_Returns => {
    if (document === null || preview === null) {
      throw new Error('Choose an export file first.');
    }

    const items: Web_BackupView_BackupView_ApplyImport_Items = preview['sections']
      .filter((section) => section['willImport'])
      .map((section) => ({
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
        items: items.map((item) => {
          const changes: Web_BackupView_BackupView_ApplyImport_Changes = [];

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

    return;
  };

  /**
   * Backup View - Next.
   *
   * Advances through source, settings, review, and fresh identity confirmation.
   * Confirmation factors are refreshed before entering that sensitive step.
   *
   * @returns {Web_BackupView_BackupView_Next_Returns}
   *
   * @since 2.1.0
   */
  const next: Web_BackupView_BackupView_Next = (): Web_BackupView_BackupView_Next_Returns => {
    if (step === 'source') {
      setStep('settings');
    } else if (step === 'settings') {
      setStep('review');
    } else if (step === 'review') {
      setBusy(true);
      void loadSecurity().then(() => setStep('confirm')).catch((caughtError) => {
        setError((caughtError instanceof Error) ? caughtError.message : 'Account security could not be loaded.');

        return;
      }).finally(() => setBusy(false));
    }

    return;
  };

  /**
   * Backup View - Back.
   *
   * Moves to the preceding review step without losing the parsed file or plan.
   * Importing is deliberately excluded because it cannot be rewound.
   *
   * @returns {Web_BackupView_BackupView_Back_Returns}
   *
   * @since 2.1.0
   */
  const back: Web_BackupView_BackupView_Back = (): Web_BackupView_BackupView_Back_Returns => {
    if (step === 'settings') {
      setStep('source');
    } else if (step === 'review') {
      setStep('settings');
    } else if (step === 'confirm') {
      setStep('review');
    }

    return;
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
          onFileChange={(event) => {
            void chooseFile(event);

            return;
          }}
          onSelect={() => undefined}
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
        onConfirm={async (password, code) => confirmBackupOperation('import', password, code)}
        onConfirmed={applyImport}
        onPasskey={async () => confirmBackupOperationWithPasskey('import')}
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
        onBackground={() => setImportOpen(false)}
        onDone={() => {
          showToast('Imported the selected backup configuration.', true);
          clearImport();

          return;
        }}
        progressLabel={(completed, total) => `Imported ${String(completed)} of ${String(total)}`}
      />
    );
  }

  const settingsImportable: Web_BackupView_BackupView_SettingsImportable = preview !== null && preview['sections'].some((section) => section['willImport']);

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
        onClose={() => setExportOpen(false)}
        onConfirm={async (password, code) => confirmBackupOperation('export', password, code)}
        onExport={async (selection, grant) => {
          const sections: Web_Backup_ExportSections = {
            accessTokens: selection['accessTokens'] === true,
            connection: selection['connection'] === true,
            notifications: selection['notifications'] === true,
          };

          await downloadBackupExport(sections, grant);
          showToast('Export downloaded. Keep it somewhere safe.', true);

          return;
        }}
        onPasskey={async () => confirmBackupOperationWithPasskey('export')}
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
        nextDisabled={(
          (
            step === 'source'
            && preview === null
          )
          || (
            step === 'settings'
            && settingsImportable !== true
          )
        )}
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
