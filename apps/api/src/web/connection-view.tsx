import {
  useEffect,
  useState,
} from 'react';

import {
  issueFor,
  summaryFor,
  updateConnection,
} from '@/web/api.ts';
import { BackupView } from '@/web/backup-view.tsx';
import { DebugLoggingPanel } from '@/web/debug-logging-panel.tsx';
import { FieldLabel } from '@/web/field-label.tsx';
import {
  Button,
  passwordManagerIgnore,
} from '@/web/primitives.tsx';
import { showToast } from '@/web/toast.ts';

import type {
  Web_ConnectionView_ConnectionView_Address,
  Web_ConnectionView_ConnectionView_AddressState,
  Web_ConnectionView_ConnectionView_Busy,
  Web_ConnectionView_ConnectionView_BusyState,
  Web_ConnectionView_ConnectionView_Configured,
  Web_ConnectionView_ConnectionView_Connection,
  Web_ConnectionView_ConnectionView_ConnectionTest,
  Web_ConnectionView_ConnectionView_Credential,
  Web_ConnectionView_ConnectionView_CredentialSaved,
  Web_ConnectionView_ConnectionView_CredentialState,
  Web_ConnectionView_ConnectionView_CredentialType,
  Web_ConnectionView_ConnectionView_CredentialTypeState,
  Web_ConnectionView_ConnectionView_Dirty,
  Web_ConnectionView_ConnectionView_Error,
  Web_ConnectionView_ConnectionView_ErrorState,
  Web_ConnectionView_ConnectionView_FieldIssue,
  Web_ConnectionView_ConnectionView_FieldIssue_Field,
  Web_ConnectionView_ConnectionView_FieldIssue_Message,
  Web_ConnectionView_ConnectionView_FieldIssue_Returns,
  Web_ConnectionView_ConnectionView_Hydrated,
  Web_ConnectionView_ConnectionView_HydratedState,
  Web_ConnectionView_ConnectionView_KeepsCredential,
  Web_ConnectionView_ConnectionView_OnBackupImported,
  Web_ConnectionView_ConnectionView_OnDirtyChange,
  Web_ConnectionView_ConnectionView_OnSave,
  Web_ConnectionView_ConnectionView_OnTestConnection,
  Web_ConnectionView_ConnectionView_Port,
  Web_ConnectionView_ConnectionView_PortState,
  Web_ConnectionView_ConnectionView_Props,
  Web_ConnectionView_ConnectionView_Returns,
  Web_ConnectionView_ConnectionView_Save,
  Web_ConnectionView_ConnectionView_Save_Event,
  Web_ConnectionView_ConnectionView_Save_Returns,
  Web_ConnectionView_ConnectionView_Save_Saved,
  Web_ConnectionView_ConnectionView_SavedAddress,
  Web_ConnectionView_ConnectionView_SavedCredentialLabel,
  Web_ConnectionView_ConnectionView_SavedCredentialType,
  Web_ConnectionView_ConnectionView_SavedPort,
  Web_ConnectionView_ConnectionView_SavedUsername,
  Web_ConnectionView_ConnectionView_SetAddress,
  Web_ConnectionView_ConnectionView_SetBusy,
  Web_ConnectionView_ConnectionView_SetCredential,
  Web_ConnectionView_ConnectionView_SetCredentialType,
  Web_ConnectionView_ConnectionView_SetError,
  Web_ConnectionView_ConnectionView_SetHydrated,
  Web_ConnectionView_ConnectionView_SetPort,
  Web_ConnectionView_ConnectionView_SetUsername,
  Web_ConnectionView_ConnectionView_ShowError,
  Web_ConnectionView_ConnectionView_ShowError_CaughtError,
  Web_ConnectionView_ConnectionView_ShowError_Message,
  Web_ConnectionView_ConnectionView_ShowError_Returns,
  Web_ConnectionView_ConnectionView_Test,
  Web_ConnectionView_ConnectionView_Test_Returns,
  Web_ConnectionView_ConnectionView_TestResult,
  Web_ConnectionView_ConnectionView_Username,
  Web_ConnectionView_ConnectionView_UsernameState,
  Web_ConnectionView_ConnectionView_Warn,
  Web_ConnectionView_ConnectionView_Warn_Event,
  Web_ConnectionView_ConnectionView_Warn_Returns,
} from '@/types/web/connection-view.d.ts';

/**
 * Connection View - Connection View.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @param {Web_ConnectionView_ConnectionView_Props} props - Props.
 *
 * @returns {Web_ConnectionView_ConnectionView_Returns}
 *
 * @since 2.0.0
 */
export const ConnectionView = (props: Web_ConnectionView_ConnectionView_Props): Web_ConnectionView_ConnectionView_Returns => {
  const connection: Web_ConnectionView_ConnectionView_Connection = props['connection'];
  const connectionTest: Web_ConnectionView_ConnectionView_ConnectionTest = props['connectionTest'];
  const onBackupImported: Web_ConnectionView_ConnectionView_OnBackupImported = props['onBackupImported'];
  const onDirtyChange: Web_ConnectionView_ConnectionView_OnDirtyChange = props['onDirtyChange'];
  const onSave: Web_ConnectionView_ConnectionView_OnSave = props['onSave'];
  const onTestConnection: Web_ConnectionView_ConnectionView_OnTestConnection = props['onTestConnection'];
  const addressState: Web_ConnectionView_ConnectionView_AddressState = useState<Web_ConnectionView_ConnectionView_Address>('');
  const address: Web_ConnectionView_ConnectionView_Address = addressState[0];
  const setAddress: Web_ConnectionView_ConnectionView_SetAddress = addressState[1];
  const portState: Web_ConnectionView_ConnectionView_PortState = useState<Web_ConnectionView_ConnectionView_Port>('22');
  const port: Web_ConnectionView_ConnectionView_Port = portState[0];
  const setPort: Web_ConnectionView_ConnectionView_SetPort = portState[1];
  const usernameState: Web_ConnectionView_ConnectionView_UsernameState = useState<Web_ConnectionView_ConnectionView_Username>('');
  const username: Web_ConnectionView_ConnectionView_Username = usernameState[0];
  const setUsername: Web_ConnectionView_ConnectionView_SetUsername = usernameState[1];
  const credentialTypeState: Web_ConnectionView_ConnectionView_CredentialTypeState = useState<Web_ConnectionView_ConnectionView_CredentialType>('privateKey');
  const credentialType: Web_ConnectionView_ConnectionView_CredentialType = credentialTypeState[0];
  const setCredentialType: Web_ConnectionView_ConnectionView_SetCredentialType = credentialTypeState[1];
  const credentialState: Web_ConnectionView_ConnectionView_CredentialState = useState<Web_ConnectionView_ConnectionView_Credential>('');
  const credential: Web_ConnectionView_ConnectionView_Credential = credentialState[0];
  const setCredential: Web_ConnectionView_ConnectionView_SetCredential = credentialState[1];
  const busyState: Web_ConnectionView_ConnectionView_BusyState = useState<Web_ConnectionView_ConnectionView_Busy>(false);
  const busy: Web_ConnectionView_ConnectionView_Busy = busyState[0];
  const setBusy: Web_ConnectionView_ConnectionView_SetBusy = busyState[1];
  const errorState: Web_ConnectionView_ConnectionView_ErrorState = useState<Web_ConnectionView_ConnectionView_Error>(null);
  const error: Web_ConnectionView_ConnectionView_Error = errorState[0];
  const setError: Web_ConnectionView_ConnectionView_SetError = errorState[1];
  const hydratedState: Web_ConnectionView_ConnectionView_HydratedState = useState<Web_ConnectionView_ConnectionView_Hydrated>(false);
  const hydrated: Web_ConnectionView_ConnectionView_Hydrated = hydratedState[0];
  const setHydrated: Web_ConnectionView_ConnectionView_SetHydrated = hydratedState[1];

  useEffect(() => {
    if (connection === null) {
      setHydrated(false);

      return;
    }

    setAddress((connection['configured'] === true) ? (connection['pfsenseSshIp'] ?? '') : '');
    setPort(String((connection['configured'] === true) ? (connection['pfsenseSshPort'] ?? 22) : 22));
    setUsername((connection['configured'] === true) ? (connection['pfsenseUsername'] ?? '') : '');
    setCredentialType((connection['configured'] === true) ? (connection['credentialType'] ?? 'privateKey') : 'privateKey');
    setCredential('');
    setHydrated(true);

    return;
  }, [connection]);

  const configured: Web_ConnectionView_ConnectionView_Configured = connection !== null && connection['configured'] === true;
  const savedAddress: Web_ConnectionView_ConnectionView_SavedAddress = (configured === true && connection !== null) ? (connection['pfsenseSshIp'] ?? '') : '';
  const savedPort: Web_ConnectionView_ConnectionView_SavedPort = String((configured === true && connection !== null) ? (connection['pfsenseSshPort'] ?? 22) : 22);
  const savedUsername: Web_ConnectionView_ConnectionView_SavedUsername = (configured === true && connection !== null) ? (connection['pfsenseUsername'] ?? '') : '';
  const savedCredentialType: Web_ConnectionView_ConnectionView_SavedCredentialType = (configured === true && connection !== null) ? (connection['credentialType'] ?? 'privateKey') : 'privateKey';
  const dirty: Web_ConnectionView_ConnectionView_Dirty = hydrated && (
    address !== savedAddress
    || port !== savedPort
    || username !== savedUsername
    || credentialType !== savedCredentialType
    || credential !== ''
  );

  // Closing or refreshing the tab keeps the browser's native data-loss warning.
  useEffect(() => {
    /**
     * Connection View - Warn.
     *
     * Centralizes this operation for the surrounding workflow.
     * Callers reuse one implementation instead of repeating the behavior.
     *
     * @param {Web_ConnectionView_ConnectionView_Warn_Event} event - Event.
     *
     * @returns {Web_ConnectionView_ConnectionView_Warn_Returns}
     *
     * @since 2.0.0
     */
    const warn: Web_ConnectionView_ConnectionView_Warn = (event: Web_ConnectionView_ConnectionView_Warn_Event): Web_ConnectionView_ConnectionView_Warn_Returns => {
      event.preventDefault();

      return;
    };

    if (dirty === true) {
      window.addEventListener('beforeunload', warn);
    }

    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // The app owns in-console navigation, so it needs the same dirty state.
  useEffect(() => {
    onDirtyChange(dirty);

    return () => onDirtyChange(false);
  }, [
    dirty,
    onDirtyChange,
  ]);

  if (connection === null) {
    return (
      <div className="detail-loading">
        <span className="spinner" />
        Loading the connection…
      </div>
    );
  }

  const credentialSaved: Web_ConnectionView_ConnectionView_CredentialSaved = connection['credentialSaved'] !== false;
  const keepsCredential: Web_ConnectionView_ConnectionView_KeepsCredential = (
    configured
    && credentialSaved
    && connection['credentialType'] === credentialType
  );
  const savedCredentialLabel: Web_ConnectionView_ConnectionView_SavedCredentialLabel = (connection['credentialType'] === 'privateKey') ? 'Private key' : 'Password';

  /**
   * Connection View - Field Issue.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @param {Web_ConnectionView_ConnectionView_FieldIssue_Field} field - Field.
   *
   * @returns {Web_ConnectionView_ConnectionView_FieldIssue_Returns}
   *
   * @since 2.0.0
   */
  const fieldIssue: Web_ConnectionView_ConnectionView_FieldIssue = (field: Web_ConnectionView_ConnectionView_FieldIssue_Field): Web_ConnectionView_ConnectionView_FieldIssue_Returns => {
    const message: Web_ConnectionView_ConnectionView_FieldIssue_Message = issueFor(error, field);

    return (message === '') ? null : <small className="field-error">{message}</small>;
  };

  /**
   * Connection View - Show Error.
   *
   * Keeps an error that belongs to a field beside that field
   * and shows any other error as a toast.
   *
   * @param {Web_ConnectionView_ConnectionView_ShowError_CaughtError} caughtError - Caught error.
   *
   * @returns {Web_ConnectionView_ConnectionView_ShowError_Returns}
   *
   * @since 2.0.0
   */
  const showError: Web_ConnectionView_ConnectionView_ShowError = (caughtError: Web_ConnectionView_ConnectionView_ShowError_CaughtError): Web_ConnectionView_ConnectionView_ShowError_Returns => {
    const message: Web_ConnectionView_ConnectionView_ShowError_Message = summaryFor(caughtError, [
      'credential',
      'pfsenseSshIp',
      'pfsenseSshPort',
      'pfsenseUsername',
    ], 'That didn\'t work. Try again.');

    setError(caughtError);

    if (message !== '') {
      showToast(message, false);
    }

    return;
  };

  /**
   * Connection View - Save.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @param {Web_ConnectionView_ConnectionView_Save_Event} event - Event.
   *
   * @returns {Web_ConnectionView_ConnectionView_Save_Returns}
   *
   * @since 2.0.0
   */
  const save: Web_ConnectionView_ConnectionView_Save = async (event: Web_ConnectionView_ConnectionView_Save_Event): Web_ConnectionView_ConnectionView_Save_Returns => {
    event.preventDefault();

    setBusy(true);
    setError(null);

    try {
      const saved: Web_ConnectionView_ConnectionView_Save_Saved = await updateConnection({
        ...((credential === '') ? {} : { credential }),
        credentialType,
        pfsenseSshIp: address.trim(),
        pfsenseSshPort: Number(port),
        pfsenseUsername: username.trim(),
      });

      setAddress(saved['pfsenseSshIp'] ?? '');
      setPort(String(saved['pfsenseSshPort'] ?? 22));
      setUsername(saved['pfsenseUsername'] ?? '');
      setCredentialType(saved['credentialType'] ?? 'privateKey');
      setCredential('');
      onDirtyChange(false);
      onSave(saved);
      showToast('Saved. pfSense Actions signed in over SSH with these settings.', true);
    } catch (caughtError) {
      showError(caughtError);
    } finally {
      setBusy(false);
    }

    return;
  };

  /**
   * Connection View - Test.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {Web_ConnectionView_ConnectionView_Test_Returns}
   *
   * @since 2.0.0
   */
  const test: Web_ConnectionView_ConnectionView_Test = async (): Web_ConnectionView_ConnectionView_Test_Returns => {
    setBusy(true);
    setError(null);

    try {
      await onTestConnection();
    } catch (caughtError) {
      showError(caughtError);
    } finally {
      setBusy(false);
    }

    return;
  };

  let testResult: Web_ConnectionView_ConnectionView_TestResult = null;

  if (connectionTest === true) {
    testResult = (
      <dd className="details-status-protected">
        <span className="status-dot" />
        Signed in over SSH
      </dd>
    );
  } else if (connectionTest === false) {
    testResult = (
      <dd className="details-status-blocked">
        <span className="status-dot" />
        {'Couldn\'t sign in over SSH'}
      </dd>
    );
  } else {
    testResult = <dd>Not tested since you signed in</dd>;
  }

  return (
    <section className="workspace-section">
      <div className="workspace-heading">
        <h1>pfSense connection</h1>
        <p>{'pfSense Actions signs in over SSH to run each action. New settings are tested before they\'re saved.'}</p>
      </div>

      {(configured === true) ? (
        <div className="panel">
          <section className="form-section">
            <div className="form-section-head">
              <h2>Saved connection</h2>
              <Button
                disabled={busy}
                onClick={() => {
                  void test();

                  return;
                }}
              >
                {(busy === true) ? 'Testing…' : 'Test connection'}
              </Button>
            </div>
            <dl className="details">
              <div>
                <dt>Address</dt>
                <dd>{`${connection['pfsenseSshIp'] ?? ''}:${connection['pfsenseSshPort'] ?? 22}`}</dd>
              </div>
              <div>
                <dt>SSH username</dt>
                <dd>{connection['pfsenseUsername']}</dd>
              </div>
              <div>
                <dt>Sign-in</dt>
                <dd>{(credentialSaved === true) ? savedCredentialLabel : `${savedCredentialLabel}, not saved`}</dd>
              </div>
              <div>
                <dt>Last test</dt>
                {testResult}
              </div>
            </dl>
          </section>
        </div>
      ) : null}

      <div className="panel">
        <form className="form-section" noValidate onSubmit={save}>
          <div className="form-section-head">
            <h2>{(configured === true) ? 'Change connection' : 'Set up the connection'}</h2>
          </div>

          <div className="field-row">
            <FieldLabel>
              <span>pfSense address</span>
              <input aria-invalid={issueFor(error, 'pfsenseSshIp') !== ''} autoCapitalize="none" className="monospace" inputMode="decimal" onChange={(event) => setAddress(event.currentTarget.value)} placeholder="e.g. 192.168.1.1" spellCheck={false} value={address} />
              {fieldIssue('pfsenseSshIp') ?? <small>{'The firewall\'s IP address. Hostnames aren\'t accepted.'}</small>}
            </FieldLabel>
            <FieldLabel>
              <span>SSH port</span>
              <input aria-invalid={issueFor(error, 'pfsenseSshPort') !== ''} className="monospace" inputMode="numeric" onChange={(event) => setPort(event.currentTarget.value)} value={port} />
              {fieldIssue('pfsenseSshPort')}
            </FieldLabel>
          </div>

          <FieldLabel>
            <span>SSH username</span>
            <input {...passwordManagerIgnore} aria-invalid={issueFor(error, 'pfsenseUsername') !== ''} autoCapitalize="none" autoComplete="off" onChange={(event) => setUsername(event.currentTarget.value)} placeholder="e.g. admin" spellCheck={false} value={username} />
            {fieldIssue('pfsenseUsername')}
          </FieldLabel>

          <div className="field">
            <span id="credential-type-label">Sign in with</span>
            <div aria-labelledby="credential-type-label" className="segmented segmented-fit" role="group">
              <button aria-pressed={credentialType === 'privateKey'} onClick={() => setCredentialType('privateKey')} type="button">Private key</button>
              <button aria-pressed={credentialType === 'password'} onClick={() => setCredentialType('password')} type="button">Password</button>
            </div>
          </div>

          <FieldLabel>
            <span>{(credentialType === 'privateKey') ? 'Private key' : 'Password'}</span>
            {(credentialType === 'privateKey') ? (
              <textarea
                aria-invalid={issueFor(error, 'credential') !== ''}
                className="monospace credential-key"
                onChange={(event) => setCredential(event.currentTarget.value)}
                placeholder={(keepsCredential === true) ? 'Leave empty to keep the saved key' : 'e.g. -----BEGIN OPENSSH PRIVATE KEY-----'}
                rows={5}
                spellCheck={false}
                value={credential}
              />
            ) : (
              <input
                {...passwordManagerIgnore}
                aria-invalid={issueFor(error, 'credential') !== ''}
                autoComplete="off"
                onChange={(event) => setCredential(event.currentTarget.value)}
                placeholder={(keepsCredential === true) ? 'Leave empty to keep the saved password' : ''}
                type="password"
                value={credential}
              />
            )}
            {fieldIssue('credential') ?? <small>Stored encrypted and never shown again. A key is safer than a password.</small>}
          </FieldLabel>

          <div className="panel-actions">
            <Button
              disabled={(
                busy === true
                || address.trim() === ''
                || username.trim() === ''
              )}
              type="submit"
              variant="primary"
            >
              {(busy === true) ? 'Testing…' : 'Test and save'}
            </Button>
          </div>
        </form>
      </div>

      <BackupView onImported={onBackupImported} />

      <DebugLoggingPanel />
    </section>
  );
};
