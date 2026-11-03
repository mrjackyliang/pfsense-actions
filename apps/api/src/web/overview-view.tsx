import { useState } from 'react';

import { ActivityList } from '@/web/activity-view.tsx';
import {
  formatDate,
  formatDuration,
} from '@/web/format.ts';
import {
  Button,
  Icon,
} from '@/web/primitives.tsx';

import type { ReactElement } from 'react';

import type { Web_Components_OverviewView_Props } from '@/types/web/components.d.ts';

/**
 * Overview View.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @since 2.0.0
 */
export const OverviewView = ({
  activity,
  connectionTest,
  onOpenActivity,
  onOpenConnection,
  onRefresh,
  onTestConnection,
  overview,
}: Web_Components_OverviewView_Props): ReactElement => {
  const [
    busy,
    setBusy,
  ] = useState<boolean>(false);
  const [
    error,
    setError,
  ] = useState<string>('');

  /**
   * Overview View - Run.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const run = async (action: () => Promise<void>): Promise<void> => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (caughtError) {
      setError((caughtError instanceof Error) ? caughtError.message : 'That didn\'t work. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (overview === null) {
    return (
      <div className="detail-loading">
        <span className="spinner" />
        Loading the overview…
      </div>
    );
  }

  const connection = overview['connection'];
  const credentialLabel: string = (connection['credentialType'] === 'privateKey') ? 'Private key' : 'Password';
  let lastTest: string = 'Not tested since you signed in';
  let lastTestClass: string = '';

  if (connectionTest === true) {
    lastTest = 'Signed in over SSH';
    lastTestClass = 'details-status-protected';
  } else if (connectionTest === false) {
    lastTest = 'Couldn\'t sign in over SSH';
    lastTestClass = 'details-status-blocked';
  }

  return (
    <section className="workspace-section">
      <div className="workspace-heading workspace-heading-split">
        <div>
          <h1>Overview</h1>
          <p>{`pfSense Actions ${overview['version']}, running for ${formatDuration(overview['uptimeSeconds'])}.`}</p>
        </div>
        <Button
          disabled={busy}
          icon="refresh"
          onClick={(): void => {
            void run(onRefresh);
          }}
        >
          Refresh
        </Button>
      </div>

      {(error === '') ? null : (
        <div className="form-error" role="alert">
          <Icon name="warning" size={16} />
          <span>{error}</span>
        </div>
      )}

      {(connection['configured']) ? null : (
        <div className="panel">
          <section className="form-section">
            <div className="form-section-head">
              <h2>Connect to pfSense</h2>
            </div>
            <p className="form-section-note">{'Actions can\'t run until pfSense Actions can sign in to your firewall over SSH.'}</p>
            <div className="panel-actions panel-actions-start">
              <Button onClick={onOpenConnection} variant="primary">Set up the connection</Button>
            </div>
          </section>
        </div>
      )}

      <div className="panel">
        <section className="form-section">
          <div className="form-section-head">
            <h2>Controller</h2>
          </div>
          <dl className="details">
            <div>
              <dt>Version</dt>
              <dd>{overview['version']}</dd>
            </div>
            <div>
              <dt>Uptime</dt>
              <dd>{formatDuration(overview['uptimeSeconds'])}</dd>
            </div>
            <div>
              <dt>Administrator</dt>
              <dd>{(overview['administrator'] === null) ? '—' : overview['administrator']['username']}</dd>
            </div>
            <div>
              <dt>Account created</dt>
              <dd>{(overview['administrator'] === null) ? '—' : formatDate(overview['administrator']['createdAt'])}</dd>
            </div>
            <div>
              <dt>Access tokens</dt>
              <dd>{overview['tokenCount']}</dd>
            </div>
            <div>
              <dt>Activity events</dt>
              <dd>{overview['activityCount']}</dd>
            </div>
          </dl>
        </section>

        {(connection['configured']) ? (
          <section className="form-section">
            <div className="form-section-head">
              <h2>pfSense</h2>
              <Button
                disabled={busy}
                onClick={(): void => {
                  void run(onTestConnection);
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
                <dd>{(connection['credentialSaved'] === false) ? `${credentialLabel}, not saved` : credentialLabel}</dd>
              </div>
              <div>
                <dt>Last test</dt>
                <dd className={lastTestClass}>
                  {(lastTestClass === '') ? null : <span className="status-dot" />}
                  {lastTest}
                </dd>
              </div>
            </dl>
          </section>
        ) : null}
      </div>

      <div className="panel">
        <section className="form-section">
          <div className="form-section-head">
            <h2>Recent activity</h2>
            <button className="text-button" onClick={onOpenActivity} type="button">View all</button>
          </div>
          <ActivityList activity={activity.slice(0, 8)} compact />
        </section>
      </div>
    </section>
  );
};
