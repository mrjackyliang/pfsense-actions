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

import type {
  Web_OverviewView_OverviewView_Activity,
  Web_OverviewView_OverviewView_Busy,
  Web_OverviewView_OverviewView_BusyState,
  Web_OverviewView_OverviewView_Connection,
  Web_OverviewView_OverviewView_ConnectionTest,
  Web_OverviewView_OverviewView_CredentialLabel,
  Web_OverviewView_OverviewView_Error,
  Web_OverviewView_OverviewView_ErrorState,
  Web_OverviewView_OverviewView_LastTest,
  Web_OverviewView_OverviewView_LastTestClass,
  Web_OverviewView_OverviewView_OnOpenActivity,
  Web_OverviewView_OverviewView_OnOpenConnection,
  Web_OverviewView_OverviewView_OnRefresh,
  Web_OverviewView_OverviewView_OnTestConnection,
  Web_OverviewView_OverviewView_Overview,
  Web_OverviewView_OverviewView_Props,
  Web_OverviewView_OverviewView_Returns,
  Web_OverviewView_OverviewView_Run,
  Web_OverviewView_OverviewView_Run_Action,
  Web_OverviewView_OverviewView_Run_Returns,
  Web_OverviewView_OverviewView_SetBusy,
  Web_OverviewView_OverviewView_SetError,
} from '@/types/web/overview-view.d.ts';

/**
 * Overview View - Overview View.
 *
 * Stores this module-level value in one named location.
 * Related code reuses it instead of duplicating the definition.
 *
 * @param {Web_OverviewView_OverviewView_Props} props - Props.
 *
 * @returns {Web_OverviewView_OverviewView_Returns}
 *
 * @since 2.0.0
 */
export const OverviewView = (props: Web_OverviewView_OverviewView_Props): Web_OverviewView_OverviewView_Returns => {
  const activity: Web_OverviewView_OverviewView_Activity = props['activity'];
  const connectionTest: Web_OverviewView_OverviewView_ConnectionTest = props['connectionTest'];
  const onOpenActivity: Web_OverviewView_OverviewView_OnOpenActivity = props['onOpenActivity'];
  const onOpenConnection: Web_OverviewView_OverviewView_OnOpenConnection = props['onOpenConnection'];
  const onRefresh: Web_OverviewView_OverviewView_OnRefresh = props['onRefresh'];
  const onTestConnection: Web_OverviewView_OverviewView_OnTestConnection = props['onTestConnection'];
  const overview: Web_OverviewView_OverviewView_Overview = props['overview'];
  const busyState: Web_OverviewView_OverviewView_BusyState = useState<Web_OverviewView_OverviewView_Busy>(false);
  const busy: Web_OverviewView_OverviewView_Busy = busyState[0];
  const setBusy: Web_OverviewView_OverviewView_SetBusy = busyState[1];
  const errorState: Web_OverviewView_OverviewView_ErrorState = useState<Web_OverviewView_OverviewView_Error>('');
  const error: Web_OverviewView_OverviewView_Error = errorState[0];
  const setError: Web_OverviewView_OverviewView_SetError = errorState[1];

  /**
   * Overview View - Run.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @param {Web_OverviewView_OverviewView_Run_Action} action - Action.
   *
   * @returns {Web_OverviewView_OverviewView_Run_Returns}
   *
   * @since 2.0.0
   */
  const run: Web_OverviewView_OverviewView_Run = async (action: Web_OverviewView_OverviewView_Run_Action): Web_OverviewView_OverviewView_Run_Returns => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (caughtError) {
      setError((caughtError instanceof Error) ? caughtError.message : 'That didn\'t work. Try again.');
    } finally {
      setBusy(false);
    }

    return;
  };

  if (overview === null) {
    return (
      <div className="detail-loading">
        <span className="spinner" />
        Loading the overview…
      </div>
    );
  }

  const connection: Web_OverviewView_OverviewView_Connection = overview['connection'];
  const credentialLabel: Web_OverviewView_OverviewView_CredentialLabel = (connection['credentialType'] === 'privateKey') ? 'Private key' : 'Password';
  let lastTest: Web_OverviewView_OverviewView_LastTest = 'Not tested since you signed in';
  let lastTestClass: Web_OverviewView_OverviewView_LastTestClass = '';

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
          onClick={() => {
            void run(onRefresh);

            return;
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

      {(connection['configured'] === true) ? null : (
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

        {(connection['configured'] === true) ? (
          <section className="form-section">
            <div className="form-section-head">
              <h2>pfSense</h2>
              <Button
                disabled={busy}
                onClick={() => {
                  void run(onTestConnection);

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
