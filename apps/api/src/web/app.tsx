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
import {
  appRouteForView,
  resolveAppNavigationPath,
} from '@/web/app-navigation.ts';
import { AppShell } from '@/web/app-shell.tsx';
import { AuthenticationScreen } from '@/web/auth-screen.tsx';
import { ConnectionView } from '@/web/connection-view.tsx';
import { KeyNotice } from '@/web/key-notice.tsx';
import {
  applyNavigationPath,
  pushNavigationPath,
  replaceNavigationPath,
  startNavigationHistory,
} from '@/web/navigation.ts';
import { NotificationsView } from '@/web/notifications-view.tsx';
import { OverviewView } from '@/web/overview-view.tsx';
import { BrandMark } from '@/web/primitives.tsx';
import { SecurityView } from '@/web/security-view.tsx';

import type { Web_Api_CreatedToken } from '@/types/web/api.d.ts';
import type { Web_AppNavigation_PathMatch } from '@/types/web/app-navigation.d.ts';
import type {
  Web_App_App_ActiveRoute,
  Web_App_App_ActiveRouteState,
  Web_App_App_Activity,
  Web_App_App_ActivityState,
  Web_App_App_ApplyAppRoute,
  Web_App_App_ApplyAppRoute_Returns,
  Web_App_App_ApplyAppRoute_Route,
  Web_App_App_Bootstrap,
  Web_App_App_Bootstrap_Returns,
  Web_App_App_Bootstrap_SetupStatus,
  Web_App_App_Connection,
  Web_App_App_ConnectionDirty,
  Web_App_App_ConnectionDirtyState,
  Web_App_App_ConnectionState,
  Web_App_App_ConnectionTest,
  Web_App_App_ConnectionTestState,
  Web_App_App_EnterApplication,
  Web_App_App_EnterApplication_Principal,
  Web_App_App_EnterApplication_Returns,
  Web_App_App_Guard,
  Web_App_App_Guard_Action,
  Web_App_App_Guard_Returns,
  Web_App_App_LastRemovedSecret,
  Web_App_App_LoadActivity,
  Web_App_App_LoadActivity_Returns,
  Web_App_App_LoadConnection,
  Web_App_App_LoadConnection_Returns,
  Web_App_App_LoadOverview,
  Web_App_App_LoadOverview_NextActivity,
  Web_App_App_LoadOverview_NextOverview,
  Web_App_App_LoadOverview_NextResults,
  Web_App_App_LoadOverview_Returns,
  Web_App_App_LoadRemovedSecrets,
  Web_App_App_LoadRemovedSecrets_Principal,
  Web_App_App_LoadRemovedSecrets_Returns,
  Web_App_App_LoadTokens,
  Web_App_App_LoadTokens_Returns,
  Web_App_App_Notice,
  Web_App_App_OpenRoute,
  Web_App_App_OpenRoute_Returns,
  Web_App_App_OpenRoute_Route,
  Web_App_App_OpenView,
  Web_App_App_OpenView_Returns,
  Web_App_App_OpenView_View,
  Web_App_App_Overview,
  Web_App_App_OverviewState,
  Web_App_App_Phase,
  Web_App_App_PhaseState,
  Web_App_App_RemovedAt,
  Web_App_App_RemovedSecrets,
  Web_App_App_RemovedSecretsState,
  Web_App_App_RenderView,
  Web_App_App_RenderView_Returns,
  Web_App_App_ResetSession,
  Web_App_App_ResetSession_Returns,
  Web_App_App_Returns,
  Web_App_App_RunConnectionTest,
  Web_App_App_RunConnectionTest_Result,
  Web_App_App_RunConnectionTest_Returns,
  Web_App_App_SetActiveRoute,
  Web_App_App_SetActivity,
  Web_App_App_SetConnection,
  Web_App_App_SetConnectionDirty,
  Web_App_App_SetConnectionTest,
  Web_App_App_SetOverview,
  Web_App_App_SetPhase,
  Web_App_App_SetRemovedSecrets,
  Web_App_App_SetStartupError,
  Web_App_App_SetTokens,
  Web_App_App_SetUsername,
  Web_App_App_SignOut,
  Web_App_App_SignOut_Returns,
  Web_App_App_StartupError,
  Web_App_App_StartupErrorState,
  Web_App_App_Tokens,
  Web_App_App_TokensState,
  Web_App_App_Username,
  Web_App_App_UsernameState,
  Web_App_DescribeConnection_Connection,
  Web_App_DescribeConnection_ConnectionTest,
  Web_App_DescribeConnection_Returns,
  Web_App_DescribeConnection_Target,
  Web_App_DescribeRemovedSecret_RemovedSecret,
  Web_App_DescribeRemovedSecret_Returns,
} from '@/types/web/app.d.ts';
import type {
  Web_Components_ConnectionStatus,
  Web_Components_ShellStatus,
  Web_Components_View,
} from '@/types/web/components.d.ts';

// What each secret removed with a lost key asks for, and the page where it is entered again.

/**
 * App - Describe Removed Secret.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @param {Web_App_DescribeRemovedSecret_RemovedSecret} removedSecret - Removed secret.
 *
 * @returns {Web_App_DescribeRemovedSecret_Returns}
 *
 * @since 2.0.0
 */
const describeRemovedSecret = (removedSecret: Web_App_DescribeRemovedSecret_RemovedSecret): Web_App_DescribeRemovedSecret_Returns => {
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
 * App - Describe Connection.
 *
 * Reduces the saved connection and its latest test to the generic status data
 * consumed by the shared shell's desktop card and phone pill.
 *
 * @param {Web_App_DescribeConnection_Connection}     connection     - Connection.
 * @param {Web_App_DescribeConnection_ConnectionTest} connectionTest - Connection test.
 *
 * @returns {Web_App_DescribeConnection_Returns}
 *
 * @since 2.0.0
 */
const describeConnection = (
  connection: Web_App_DescribeConnection_Connection,
  connectionTest: Web_App_DescribeConnection_ConnectionTest,
): Web_App_DescribeConnection_Returns => {
  if (connection === null) {
    return {
      detail: 'Loading…',
      label: 'pfSense',
      tone: 'idle',
    };
  }

  if (connection['configured'] === false) {
    return {
      detail: 'Set up the SSH connection',
      label: 'Not connected',
      tone: 'blocked',
    };
  }

  if (connection['credentialSaved'] === false) {
    return {
      detail: (connection['credentialType'] === 'privateKey') ? 'Enter the private key again' : 'Enter the password again',
      label: 'Not connected',
      tone: 'blocked',
    };
  }

  const target: Web_App_DescribeConnection_Target = `${connection['pfsenseUsername'] ?? ''}@${connection['pfsenseSshIp'] ?? ''}`;

  if (connectionTest === true) {
    return {
      detail: target,
      label: 'Connected',
      tone: 'protected',
    };
  }

  if (connectionTest === false) {
    return {
      detail: 'The last test failed',
      label: 'Can\'t reach pfSense',
      tone: 'blocked',
    };
  }

  return {
    detail: target,
    label: 'pfSense',
    tone: 'idle',
  };
};

/**
 * App - App.
 *
 * Centralizes this operation for the surrounding workflow.
 * Callers reuse one implementation instead of repeating the behavior.
 *
 * @returns {Web_App_App_Returns}
 *
 * @since 2.0.0
 */
export const App = (): Web_App_App_Returns => {
  const initialNavigation: Web_AppNavigation_PathMatch = resolveAppNavigationPath(window.location.pathname);
  const phaseState: Web_App_App_PhaseState = useState<Web_App_App_Phase>('loading');
  const phase: Web_App_App_Phase = phaseState[0];
  const setPhase: Web_App_App_SetPhase = phaseState[1];
  const usernameState: Web_App_App_UsernameState = useState<Web_App_App_Username>('');
  const username: Web_App_App_Username = usernameState[0];
  const setUsername: Web_App_App_SetUsername = usernameState[1];
  const activeRouteState: Web_App_App_ActiveRouteState = useState<Web_App_App_ActiveRoute>(initialNavigation['route']);
  const activeRoute: Web_App_App_ActiveRoute = activeRouteState[0];
  const setActiveRoute: Web_App_App_SetActiveRoute = activeRouteState[1];
  const activeView: Web_Components_View = activeRoute['view'];
  const overviewState: Web_App_App_OverviewState = useState<Web_App_App_Overview>(null);
  const overview: Web_App_App_Overview = overviewState[0];
  const setOverview: Web_App_App_SetOverview = overviewState[1];
  const activityState: Web_App_App_ActivityState = useState<Web_App_App_Activity>([]);
  const activity: Web_App_App_Activity = activityState[0];
  const setActivity: Web_App_App_SetActivity = activityState[1];
  const connectionState: Web_App_App_ConnectionState = useState<Web_App_App_Connection>(null);
  const connection: Web_App_App_Connection = connectionState[0];
  const setConnection: Web_App_App_SetConnection = connectionState[1];
  const connectionTestState: Web_App_App_ConnectionTestState = useState<Web_App_App_ConnectionTest>(null);
  const connectionTest: Web_App_App_ConnectionTest = connectionTestState[0];
  const setConnectionTest: Web_App_App_SetConnectionTest = connectionTestState[1];
  const tokensState: Web_App_App_TokensState = useState<Web_App_App_Tokens>([]);
  const tokens: Web_App_App_Tokens = tokensState[0];
  const setTokens: Web_App_App_SetTokens = tokensState[1];
  const removedSecretsState: Web_App_App_RemovedSecretsState = useState<Web_App_App_RemovedSecrets>([]);
  const removedSecrets: Web_App_App_RemovedSecrets = removedSecretsState[0];
  const setRemovedSecrets: Web_App_App_SetRemovedSecrets = removedSecretsState[1];
  const startupErrorState: Web_App_App_StartupErrorState = useState<Web_App_App_StartupError>('');
  const startupError: Web_App_App_StartupError = startupErrorState[0];
  const setStartupError: Web_App_App_SetStartupError = startupErrorState[1];
  const connectionDirtyState: Web_App_App_ConnectionDirtyState = useState<Web_App_App_ConnectionDirty>(false);
  const connectionDirty: Web_App_App_ConnectionDirty = connectionDirtyState[0];
  const setConnectionDirty: Web_App_App_SetConnectionDirty = connectionDirtyState[1];

  /**
   * App - Reset Session.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {Web_App_App_ResetSession_Returns}
   *
   * @since 2.0.0
   */
  const resetSession: Web_App_App_ResetSession = (): Web_App_App_ResetSession_Returns => {
    setUsername('');
    setOverview(null);
    setActivity([]);
    setConnection(null);
    setConnectionTest(null);
    setTokens([]);
    setRemovedSecrets([]);
    setConnectionDirty(false);
    setPhase('login');

    return;
  };

  // A request that finds the session gone sends the browser back to sign-in.

  /**
   * App - Guard.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @param {Web_App_App_Guard_Action} action - Action.
   *
   * @returns {Web_App_App_Guard_Returns}
   *
   * @since 2.0.0
   */
  const guard: Web_App_App_Guard = async (action: Web_App_App_Guard_Action): Web_App_App_Guard_Returns => {
    try {
      await action();
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        resetSession();

        return;
      }

      throw caughtError;
    }

    return;
  };

  /**
   * App - Load Overview.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {Web_App_App_LoadOverview_Returns}
   *
   * @since 2.0.0
   */
  const loadOverview: Web_App_App_LoadOverview = async (): Web_App_App_LoadOverview_Returns => guard(async () => {
    const nextResults: Web_App_App_LoadOverview_NextResults = await Promise.all([
      getOverview(),
      getActivity(),
    ]);
    const nextOverview: Web_App_App_LoadOverview_NextOverview = nextResults[0];
    const nextActivity: Web_App_App_LoadOverview_NextActivity = nextResults[1];

    setOverview(nextOverview);
    setConnection(nextOverview['connection']);
    setActivity(nextActivity);

    return;
  });

  /**
   * App - Load Activity.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {Web_App_App_LoadActivity_Returns}
   *
   * @since 2.0.0
   */
  const loadActivity: Web_App_App_LoadActivity = async (): Web_App_App_LoadActivity_Returns => guard(async () => {
    setActivity(await getActivity());

    return;
  });

  /**
   * App - Load Tokens.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {Web_App_App_LoadTokens_Returns}
   *
   * @since 2.0.0
   */
  const loadTokens: Web_App_App_LoadTokens = async (): Web_App_App_LoadTokens_Returns => guard(async () => {
    setTokens(await getTokens());

    return;
  });

  /**
   * App - Load Connection.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {Web_App_App_LoadConnection_Returns}
   *
   * @since 2.0.0
   */
  const loadConnection: Web_App_App_LoadConnection = async (): Web_App_App_LoadConnection_Returns => guard(async () => {
    setConnection(await getConnection());

    return;
  });

  // The notice shrinks as secrets are entered again, so the list is read again after each one.

  /**
   * App - Load Removed Secrets.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {Web_App_App_LoadRemovedSecrets_Returns}
   *
   * @since 2.0.0
   */
  const loadRemovedSecrets: Web_App_App_LoadRemovedSecrets = async (): Web_App_App_LoadRemovedSecrets_Returns => guard(async () => {
    const principal: Web_App_App_LoadRemovedSecrets_Principal = await getCurrentPrincipal();

    if (principal === null) {
      resetSession();

      return;
    }

    setRemovedSecrets(principal['removedSecrets'] ?? []);

    return;
  });

  /**
   * App - Apply App Route.
   *
   * Keeps the rendered page synchronized with a resolved browser address.
   * Browser Back and Forward reuse this transition without pushing history.
   *
   * @param {Web_App_App_ApplyAppRoute_Route} route - Route.
   *
   * @returns {Web_App_App_ApplyAppRoute_Returns}
   *
   * @since 2.1.0
   */
  const applyAppRoute: Web_App_App_ApplyAppRoute = (route: Web_App_App_ApplyAppRoute_Route): Web_App_App_ApplyAppRoute_Returns => {
    setConnectionDirty(false);
    setActiveRoute(route);

    window.scrollTo(0, 0);

    return;
  };

  /**
   * App - Open Route.
   *
   * Preserves the connection editor's unsaved-change guard, pushes browser
   * history, and then applies the selected page and its refresh behavior.
   *
   * @param {Web_App_App_OpenRoute_Route} route - Route.
   *
   * @returns {Web_App_App_OpenRoute_Returns}
   *
   * @since 2.1.0
   */
  const openRoute: Web_App_App_OpenRoute = (route: Web_App_App_OpenRoute_Route): Web_App_App_OpenRoute_Returns => {
    if (route['view'] === activeView) {
      return;
    }

    if (connectionDirty === true && window.confirm('Discard your unsaved changes?') === false) {
      return;
    }

    pushNavigationPath(window, route['path']);
    applyAppRoute(route);

    if (route['view'] === 'activity') {
      void loadActivity();
    } else if (route['view'] === 'connection') {
      void loadConnection();
    } else if (route['view'] === 'overview') {
      void loadOverview();
    }

    return;
  };

  /**
   * App - Open View.
   *
   * Resolves shell destinations through the app-owned path table before the
   * shared History API transition runs.
   *
   * @param {Web_App_App_OpenView_View} view - View.
   *
   * @returns {Web_App_App_OpenView_Returns}
   *
   * @since 2.1.0
   */
  const openView: Web_App_App_OpenView = (view: Web_App_App_OpenView_View): Web_App_App_OpenView_Returns => {
    openRoute(appRouteForView(view));

    return;
  };

  useEffect(() => startNavigationHistory(
    window,
    resolveAppNavigationPath,
    applyAppRoute,
  ), []);

  /**
   * App - Enter Application.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {Web_App_App_EnterApplication_Returns}
   *
   * @since 2.0.0
   */
  const enterApplication: Web_App_App_EnterApplication = async (): Web_App_App_EnterApplication_Returns => {
    const principal: Web_App_App_EnterApplication_Principal = await getCurrentPrincipal();

    if (principal === null || principal['authenticationType'] !== 'session') {
      setPhase('login');

      return;
    }

    setUsername(principal['username'] ?? 'Administrator');
    setRemovedSecrets(principal['removedSecrets'] ?? []);
    applyNavigationPath(window, resolveAppNavigationPath, applyAppRoute);
    setPhase('application');

    await Promise.all([
      loadOverview(),
      loadTokens(),
    ]);

    return;
  };

  useEffect(() => {
    /**
     * App - Bootstrap.
     *
     * Centralizes this operation for the surrounding workflow.
     * Callers reuse one implementation instead of repeating the behavior.
     *
     * @returns {Web_App_App_Bootstrap_Returns}
     *
     * @since 2.0.0
     */
    const bootstrap: Web_App_App_Bootstrap = async (): Web_App_App_Bootstrap_Returns => {
      setStartupError('');

      try {
        const setupStatus: Web_App_App_Bootstrap_SetupStatus = await getSetupStatus();

        if (setupStatus['claimRequired'] === true) {
          setPhase('claim');

          return;
        }

        await enterApplication();
      } catch (caughtError) {
        setStartupError((caughtError instanceof Error) ? caughtError.message : 'The console could not be loaded.');
      }

      return;
    };

    void bootstrap();

    return;
  }, []);

  /**
   * App - Run Connection Test.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {Web_App_App_RunConnectionTest_Returns}
   *
   * @since 2.0.0
   */
  const runConnectionTest: Web_App_App_RunConnectionTest = async (): Web_App_App_RunConnectionTest_Returns => guard(async () => {
    const result: Web_App_App_RunConnectionTest_Result = await testConnection();

    setConnectionTest(result['connected']);

    await loadOverview();

    return;
  });

  /**
   * App - Sign Out.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {Web_App_App_SignOut_Returns}
   *
   * @since 2.0.0
   */
  const signOut: Web_App_App_SignOut = async (): Web_App_App_SignOut_Returns => {
    if (connectionDirty === true && window.confirm('Discard your unsaved changes?') === false) {
      return;
    }

    try {
      await logout();
    } finally {
      const rootNavigation: Web_AppNavigation_PathMatch = resolveAppNavigationPath('/');

      replaceNavigationPath(window, rootNavigation['path']);
      applyAppRoute(rootNavigation['route']);
      resetSession();
    }

    return;
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
   * App - Render View.
   *
   * Centralizes this operation for the surrounding workflow.
   * Callers reuse one implementation instead of repeating the behavior.
   *
   * @returns {Web_App_App_RenderView_Returns}
   *
   * @since 2.0.0
   */
  const renderView: Web_App_App_RenderView = (): Web_App_App_RenderView_Returns => {
    switch (activeView) {
      case 'activity': {
        return <ActivityView activity={activity} onRefresh={loadActivity} />;
      }

      case 'access': {
        return (
          <AccessView
            onCreateToken={async (input) => {
              const nextToken: Web_Api_CreatedToken = await createToken(input);

              await loadTokens();

              return nextToken;
            }}
            onRevokeToken={async (tokenId) => {
              await revokeToken(tokenId);
              await loadTokens();

              return;
            }}
            onUpdateToken={async (tokenId, input) => {
              await updateToken(tokenId, input);
              await loadTokens();

              return;
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
            onBackupImported={async () => {
              setConnectionTest(null);

              await Promise.all([
                loadOverview(),
                loadTokens(),
                loadRemovedSecrets(),
              ]);

              return;
            }}
            onDirtyChange={setConnectionDirty}
            onSave={(savedConnection) => {
              setConnectionDirty(false);
              setConnection(savedConnection);
              setConnectionTest(true);
              void loadOverview();
              void loadRemovedSecrets();

              return;
            }}
            onTestConnection={runConnectionTest}
          />
        );
      }

      case 'notifications': {
        return (
          <NotificationsView
            interpreter="pfsense-actions"
            onChange={() => {
              void loadRemovedSecrets();

              return;
            }}
          />
        );
      }

      case 'security': {
        return (
          <SecurityView
            onAuthenticatorEnabled={() => {
              void loadRemovedSecrets();

              return;
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
            onOpenActivity={() => openView('activity')}
            onOpenConnection={() => openView('connection')}
            onRefresh={loadOverview}
            onTestConnection={runConnectionTest}
            overview={overview}
          />
        );
      }
    }
  };

  const lastRemovedSecret: Web_App_App_LastRemovedSecret = removedSecrets.at(-1);
  const removedAt: Web_App_App_RemovedAt = (lastRemovedSecret !== undefined) ? lastRemovedSecret['removedAt'] : '';
  const notice: Web_App_App_Notice = (removedSecrets.length === 0) ? null : (
    <KeyNotice
      appName="pfSense Actions"
      items={removedSecrets.map((removedSecret) => ({
        id: removedSecret['notificationId'] ?? removedSecret['kind'],
        label: describeRemovedSecret(removedSecret)['label'],
        onOpen: () => openView(describeRemovedSecret(removedSecret)['view']),
      }))}
      keyName="encryption key"
      onDismiss={async () => {
        await dismissRemovedSecrets();

        setRemovedSecrets([]);

        return;
      }}
      removedAt={removedAt}
    />
  );
  const connectionStatus: Web_Components_ConnectionStatus = describeConnection(connection, connectionTest);
  const shellStatus: Web_Components_ShellStatus = {
    ...connectionStatus,
    onOpen: () => openView('connection'),
  };

  return (
    <AppShell
      activeView={activeView}
      notice={notice}
      onLogout={() => {
        void signOut();

        return;
      }}
      onViewChange={openView}
      status={shellStatus}
      username={username}
    >
      {renderView()}
    </AppShell>
  );
};
