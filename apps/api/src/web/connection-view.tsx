import {
  useEffect,
  useState,
} from 'react';

import {
  issueFor,
  summaryFor,
  updateConnection,
} from '@/web/api.ts';
import { FieldLabel } from '@/web/field-label.tsx';
import { Button } from '@/web/primitives.tsx';
import { showToast } from '@/web/toast.ts';

import type {
  FormEvent,
  ReactElement,
} from 'react';

import type { Web_Api_CredentialType } from '@/types/web/api.d.ts';
import type { Web_Components_ConnectionView_Props } from '@/types/web/components.d.ts';

/**
 * Connection View.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
export const ConnectionView = ({
  connection,
  connectionTest,
  onDirtyChange,
  onSave,
  onTestConnection,
}: Web_Components_ConnectionView_Props): ReactElement => {
  const [
    address,
    setAddress,
  ] = useState<string>('');
  const [
    port,
    setPort,
  ] = useState<string>('22');
  const [
    username,
    setUsername,
  ] = useState<string>('');
  const [
    credentialType,
    setCredentialType,
  ] = useState<Web_Api_CredentialType>('privateKey');
  const [
    credential,
    setCredential,
  ] = useState<string>('');
  const [
    busy,
    setBusy,
  ] = useState<boolean>(false);
  const [
    error,
    setError,
  ] = useState<unknown>(null);
  const [
    hydrated,
    setHydrated,
  ] = useState<boolean>(false);

  useEffect((): void => {
    if (connection === null) {
      setHydrated(false);

      return;
    }

    setAddress((connection['configured']) ? (connection['pfsenseSshIp'] ?? '') : '');
    setPort(String((connection['configured']) ? (connection['pfsenseSshPort'] ?? 22) : 22));
    setUsername((connection['configured']) ? (connection['pfsenseUsername'] ?? '') : '');
    setCredentialType((connection['configured']) ? (connection['credentialType'] ?? 'privateKey') : 'privateKey');
    setCredential('');
    setHydrated(true);
  }, [connection]);

  const configured: boolean = connection?.['configured'] === true;
  const savedAddress: string = (configured) ? (connection?.['pfsenseSshIp'] ?? '') : '';
  const savedPort: string = String((configured) ? (connection?.['pfsenseSshPort'] ?? 22) : 22);
  const savedUsername: string = (configured) ? (connection?.['pfsenseUsername'] ?? '') : '';
  const savedCredentialType: Web_Api_CredentialType = (configured) ? (connection?.['credentialType'] ?? 'privateKey') : 'privateKey';
  const dirty: boolean = hydrated && (
    address !== savedAddress
    || port !== savedPort
    || username !== savedUsername
    || credentialType !== savedCredentialType
    || credential !== ''
  );

  // Closing or refreshing the tab keeps the browser's native data-loss warning.
  useEffect((): (() => void) => {
    /**
     * Connection View - Warn.
     *
     * Centralizes this operation for the surrounding workflow.
     * Callers reuse one implementation instead of repeating the behavior.
     *
     * @since 2.0.0
     */
    const warn = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
    };

    if (dirty) {
      window.addEventListener('beforeunload', warn);
    }

    return (): void => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // The app owns in-console navigation, so it needs the same dirty state.
  useEffect((): (() => void) => {
    onDirtyChange(dirty);

    return (): void => onDirtyChange(false);
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

  const credentialSaved: boolean = connection['credentialSaved'] !== false;
  const keepsCredential: boolean = configured && credentialSaved && connection['credentialType'] === credentialType;
  const savedCredentialLabel: string = (connection['credentialType'] === 'privateKey') ? 'Private key' : 'Password';

  /**
   * Connection View - Field issue.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const fieldIssue = (field: string): ReactElement | null => {
    const message: string = issueFor(error, field);

    return (message === '') ? null : <small className="field-error">{message}</small>;
  };

  /**
   * Connection View - Show error.
   *
   * Keeps an error that belongs to a field beside that field
   * and shows any other error as a toast.
   *
   * @since 2.0.0
   */
  const showError = (caughtError: unknown): void => {
    const message: string = summaryFor(caughtError, [
      'credential',
      'pfsenseSshIp',
      'pfsenseSshPort',
      'pfsenseUsername',
    ], 'That didn\'t work. Try again.');

    setError(caughtError);

    if (message !== '') {
      showToast(message, false);
    }
  };

  /**
   * Connection View - Save.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const save = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const saved = await updateConnection({
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
  };

  /**
   * Connection View - Test.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const test = async (): Promise<void> => {
    setBusy(true);
    setError(null);

    try {
      await onTestConnection();
    } catch (caughtError) {
      showError(caughtError);
    } finally {
      setBusy(false);
    }
  };

  let testResult: ReactElement | null = null;

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

      {(configured) ? (
        <div className="panel">
          <section className="form-section">
            <div className="form-section-head">
              <h2>Saved connection</h2>
              <Button
                disabled={busy}
                onClick={(): void => {
                  void test();
                }}
              >
                {(busy) ? 'Testing…' : 'Test connection'}
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
                <dd>{(credentialSaved) ? savedCredentialLabel : `${savedCredentialLabel}, not saved`}</dd>
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
            <h2>{(configured) ? 'Change connection' : 'Set up the connection'}</h2>
          </div>

          <div className="field-row">
            <FieldLabel>
              <span>pfSense address</span>
              <input aria-invalid={issueFor(error, 'pfsenseSshIp') !== ''} autoCapitalize="none" className="monospace" inputMode="decimal" onChange={(event): void => setAddress(event.currentTarget.value)} placeholder="e.g. 192.168.1.1" spellCheck={false} value={address} />
              {fieldIssue('pfsenseSshIp') ?? <small>{'The firewall\'s IP address. Hostnames aren\'t accepted.'}</small>}
            </FieldLabel>
            <FieldLabel>
              <span>SSH port</span>
              <input aria-invalid={issueFor(error, 'pfsenseSshPort') !== ''} className="monospace" inputMode="numeric" onChange={(event): void => setPort(event.currentTarget.value)} value={port} />
              {fieldIssue('pfsenseSshPort')}
            </FieldLabel>
          </div>

          <FieldLabel>
            <span>SSH username</span>
            <input aria-invalid={issueFor(error, 'pfsenseUsername') !== ''} autoCapitalize="none" autoComplete="off" onChange={(event): void => setUsername(event.currentTarget.value)} placeholder="e.g. admin" spellCheck={false} value={username} />
            {fieldIssue('pfsenseUsername')}
          </FieldLabel>

          <div className="field">
            <span id="credential-type-label">Sign in with</span>
            <div aria-labelledby="credential-type-label" className="segmented segmented-fit" role="group">
              <button aria-pressed={credentialType === 'privateKey'} onClick={(): void => setCredentialType('privateKey')} type="button">Private key</button>
              <button aria-pressed={credentialType === 'password'} onClick={(): void => setCredentialType('password')} type="button">Password</button>
            </div>
          </div>

          <FieldLabel>
            <span>{(credentialType === 'privateKey') ? 'Private key' : 'Password'}</span>
            {(credentialType === 'privateKey') ? (
              <textarea
                aria-invalid={issueFor(error, 'credential') !== ''}
                className="monospace credential-key"
                onChange={(event): void => setCredential(event.currentTarget.value)}
                placeholder={(keepsCredential) ? 'Leave empty to keep the saved key' : 'e.g. -----BEGIN OPENSSH PRIVATE KEY-----'}
                rows={5}
                spellCheck={false}
                value={credential}
              />
            ) : (
              <input
                aria-invalid={issueFor(error, 'credential') !== ''}
                autoComplete="new-password"
                onChange={(event): void => setCredential(event.currentTarget.value)}
                placeholder={(keepsCredential) ? 'Leave empty to keep the saved password' : ''}
                type="password"
                value={credential}
              />
            )}
            {fieldIssue('credential') ?? <small>Stored encrypted and never shown again. A key is safer than a password.</small>}
          </FieldLabel>

          <div className="panel-actions">
            <Button disabled={busy || address.trim() === '' || username.trim() === ''} type="submit" variant="primary">
              {(busy) ? 'Testing…' : 'Test and save'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};
