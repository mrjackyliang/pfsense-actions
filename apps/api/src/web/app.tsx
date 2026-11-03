import {
  useEffect,
  useState,
} from 'react';

import { AccessView } from '@/web/access-view.tsx';
import { ActivityView } from '@/web/activity-view.tsx';
import {
  ApiError,
  createToken,
  dismissRemovedSecrets,
  getActivity,
  getConnection,
  getCurrentPrincipal,
  getOverview,
  getSetupStatus,
  getTokens,
  logout,
  revokeToken,
  testConnection,
  updateToken,
} from '@/web/api.ts';
import { AppShell } from '@/web/app-shell.tsx';
import { AuthenticationScreen } from '@/web/auth-screen.tsx';
import { ConnectionView } from '@/web/connection-view.tsx';
import { KeyNotice } from '@/web/key-notice.tsx';
import { NotificationsView } from '@/web/notifications-view.tsx';
import { OverviewView } from '@/web/overview-view.tsx';
import { BrandMark } from '@/web/primitives.tsx';
import { SecurityView } from '@/web/security-view.tsx';

import type { ReactElement } from 'react';

import type {
  Web_Api_ActivityEvent,
  Web_Api_Connection,
  Web_Api_CreatedToken,
  Web_Api_CreateTokenInput,
  Web_Api_Overview,
  Web_Api_Principal,
  Web_Api_RemovedSecret,
  Web_Api_Token,
  Web_Api_UpdateTokenInput,
} from '@/types/web/api.d.ts';
import type {
  Web_App_Phase,
  Web_App_RemovedSecretAction,
} from '@/types/web/app.d.ts';
import type {
  Web_Components_ConnectionTestResult,
  Web_Components_View,
} from '@/types/web/components.d.ts';

// What each secret removed with a lost key asks for, and the page where it is entered again.

/**
 * App - Describe removed secret.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
const describeRemovedSecret = (removedSecret: Web_Api_RemovedSecret): Web_App_RemovedSecretAction => {
  if (removedSecret['kind'] === 'notification') {
    return {
      label: `Set up the ${removedSecret['name'] ?? 'removed'} notification again`,
      view: 'notifications',
    };
  }

  if (removedSecret['kind'] === 'pfsense-credential') {
    return {
      label: (removedSecret['credentialType'] === 'privateKey') ? 'Enter the pfSense private key' : 'Enter the pfSense password',
      view: 'connection',
    };
  }

  return {
    label: 'Set up the authenticator app',
    view: 'security',
  };
};

/**
 * App.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @since 2.0.0
 */
export const App = (): ReactElement => {
  const [
    phase,
    setPhase,
  ] = useState<Web_App_Phase>('loading');
  const [
    username,
    setUsername,
  ] = useState<string>('');
  const [
    activeView,
    setActiveView,
  ] = useState<Web_Components_View>('overview');
  const [
    overview,
    setOverview,
  ] = useState<Web_Api_Overview | null>(null);
  const [
    activity,
    setActivity,
  ] = useState<Web_Api_ActivityEvent[]>([]);
  const [
    connection,
    setConnection,
  ] = useState<Web_Api_Connection | null>(null);
  const [
    connectionTest,
    setConnectionTest,
  ] = useState<Web_Components_ConnectionTestResult>(null);
  const [
    tokens,
    setTokens,
  ] = useState<Web_Api_Token[]>([]);
  const [
    createdToken,
    setCreatedToken,
  ] = useState<Web_Api_CreatedToken | null>(null);
  const [
    removedSecrets,
    setRemovedSecrets,
  ] = useState<Web_Api_RemovedSecret[]>([]);
  const [
    startupError,
    setStartupError,
  ] = useState<string>('');
  const [
    connectionDirty,
    setConnectionDirty,
  ] = useState<boolean>(false);

  /**
   * App - Reset session.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const resetSession = (): void => {
    setUsername('');
    setOverview(null);
    setActivity([]);
    setConnection(null);
    setConnectionTest(null);
    setTokens([]);
    setCreatedToken(null);
    setRemovedSecrets([]);
    setConnectionDirty(false);
    setActiveView('overview');
    setPhase('login');
  };

  // A request that finds the session gone sends the browser back to sign-in.

  /**
   * App - Guard.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const guard = async (action: () => Promise<void>): Promise<void> => {
    try {
      await action();
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        resetSession();

        return;
      }

      throw caughtError;
    }
  };

  /**
   * App - Loads overview.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const loadOverview = async (): Promise<void> => guard(async (): Promise<void> => {
    const [
      nextOverview,
      nextActivity,
    ] = await Promise.all([
      getOverview(),
      getActivity(),
    ]);

    setOverview(nextOverview);
    setConnection(nextOverview['connection']);
    setActivity(nextActivity);
  });

  /**
   * App - Loads activity.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const loadActivity = async (): Promise<void> => guard(async (): Promise<void> => {
    setActivity(await getActivity());
  });

  /**
   * App - Loads tokens.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const loadTokens = async (): Promise<void> => guard(async (): Promise<void> => {
    setTokens(await getTokens());
  });

  /**
   * App - Loads connection.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const loadConnection = async (): Promise<void> => guard(async (): Promise<void> => {
    setConnection(await getConnection());
  });

  // The notice shrinks as secrets are entered again, so the list is read again after each one.

  /**
   * App - Loads removed secrets.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const loadRemovedSecrets = async (): Promise<void> => guard(async (): Promise<void> => {
    const principal: Web_Api_Principal | null = await getCurrentPrincipal();
    if (principal === null) {
      resetSession();

      return;
    }

    setRemovedSecrets(principal['removedSecrets'] ?? []);
  });

  /**
   * App - Enter application.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const enterApplication = async (): Promise<void> => {
    const principal: Web_Api_Principal | null = await getCurrentPrincipal();
    if (principal === null || principal['authenticationType'] !== 'session') {
      setPhase('login');

      return;
    }

    setUsername(principal['username'] ?? 'Administrator');
    setRemovedSecrets(principal['removedSecrets'] ?? []);
    setPhase('application');

    await Promise.all([
      loadOverview(),
      loadTokens(),
    ]);
  };

  useEffect((): void => {
    /**
     * App - Bootstrap.
     *
     * Centralizes this operation for the surrounding workflow.
     * Callers reuse one implementation instead of repeating the behavior.
     *
     * @since 2.0.0
     */
    const bootstrap = async (): Promise<void> => {
      setStartupError('');
      try {
        const setupStatus = await getSetupStatus();
        if (setupStatus['claimRequired']) {
          setPhase('claim');

          return;
        }

        await enterApplication();
      } catch (caughtError) {
        setStartupError((caughtError instanceof Error) ? caughtError.message : 'The console could not be loaded.');
      }
    };

    void bootstrap();
  }, []);

  /**
   * App - Run connection test.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const runConnectionTest = async (): Promise<void> => guard(async (): Promise<void> => {
    const result = await testConnection();

    setConnectionTest(result['connected']);
    await loadOverview();
  });

  /**
   * App - Sign out.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const signOut = async (): Promise<void> => {
    if (connectionDirty && !window.confirm('Discard your unsaved changes?')) {
      return;
    }

    try {
      await logout();
    } finally {
      resetSession();
    }
  };

  if (phase === 'loading') {
    return (
      <main className="startup-screen">
        <BrandMark />
        <span className="spinner" />
        <strong>Opening pfSense Actions</strong>
        {(startupError === '') ? null : <p role="alert">{startupError}</p>}
      </main>
    );
  }

  if (phase === 'claim' || phase === 'login') {
    return <AuthenticationScreen mode={phase} onSignedIn={enterApplication} />;
  }

  /**
   * App - Renders view.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const renderView = (): ReactElement => {
    switch (activeView) {
      case 'activity': {
        return <ActivityView activity={activity} onRefresh={loadActivity} />;
      }
      case 'access': {
        return (
          <AccessView
            createdToken={createdToken}
            onCreateToken={async (input: Web_Api_CreateTokenInput): Promise<void> => {
              const nextToken: Web_Api_CreatedToken = await createToken(input);

              setCreatedToken(nextToken);
              await loadTokens();
            }}
            onDismissCreatedToken={(): void => setCreatedToken(null)}
            onRevokeToken={async (tokenId: string): Promise<void> => {
              await revokeToken(tokenId);
              await loadTokens();
            }}
            onUpdateToken={async (tokenId: string, input: Web_Api_UpdateTokenInput): Promise<void> => {
              await updateToken(tokenId, input);
              await loadTokens();
            }}
            tokens={tokens}
          />
        );
      }
      case 'connection': {
        return (
          <ConnectionView
            connection={connection}
            connectionTest={connectionTest}
            onDirtyChange={setConnectionDirty}
            onSave={(savedConnection: Web_Api_Connection): void => {
              setConnectionDirty(false);
              setConnection(savedConnection);
              setConnectionTest(true);
              void loadOverview();
              void loadRemovedSecrets();
            }}
            onTestConnection={runConnectionTest}
          />
        );
      }
      case 'notifications': {
        return (
          <NotificationsView
            interpreter="pfsense-actions"
            onChange={(): void => {
              void loadRemovedSecrets();
            }}
          />
        );
      }
      case 'security': {
        return (
          <SecurityView
            onAuthenticatorEnabled={(): void => {
              void loadRemovedSecrets();
            }}
            onUsernameChanged={setUsername}
          />
        );
      }
      default: {
        return (
          <OverviewView
            activity={activity}
            connectionTest={connectionTest}
            onOpenActivity={(): void => openView('activity')}
            onOpenConnection={(): void => openView('connection')}
            onRefresh={loadOverview}
            onTestConnection={runConnectionTest}
            overview={overview}
          />
        );
      }
    }
  };

  /**
   * App - Opens view.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @since 2.0.0
   */
  const openView = (view: Web_Components_View): void => {
    if (view === activeView) {
      return;
    }

    if (connectionDirty && !window.confirm('Discard your unsaved changes?')) {
      return;
    }

    setConnectionDirty(false);
    setActiveView(view);
    window.scrollTo(0, 0);

    if (view === 'activity') {
      void loadActivity();
    } else if (view === 'connection') {
      void loadConnection();
    } else if (view === 'overview') {
      void loadOverview();
    }
  };

  const notice: ReactElement | null = (removedSecrets.length === 0) ? null : (
    <KeyNotice
      appName="pfSense Actions"
      items={removedSecrets.map((removedSecret: Web_Api_RemovedSecret) => ({
        id: removedSecret['notificationId'] ?? removedSecret['kind'],
        label: describeRemovedSecret(removedSecret)['label'],
        onOpen: (): void => openView(describeRemovedSecret(removedSecret)['view']),
      }))}
      keyName="encryption key"
      onDismiss={async (): Promise<void> => {
        await dismissRemovedSecrets();
        setRemovedSecrets([]);
      }}
      removedAt={removedSecrets.at(-1)?.['removedAt'] ?? ''}
    />
  );

  return (
    <AppShell
      activeView={activeView}
      connection={connection}
      connectionTest={connectionTest}
      notice={notice}
      onLogout={(): void => {
        void signOut();
      }}
      onViewChange={openView}
      username={username}
    >
      {renderView()}
    </AppShell>
  );
};
