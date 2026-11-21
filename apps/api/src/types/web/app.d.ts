import type {
  Dispatch,
  ReactElement,
  SetStateAction,
} from 'react';

import type {
  Web_Api_ActivityEvent,
  Web_Api_Connection,
  Web_Api_ConnectionTest,
  Web_Api_Overview,
  Web_Api_Principal,
  Web_Api_RemovedSecret,
  Web_Api_SetupStatus,
  Web_Api_Token,
} from '@/types/web/api.d.ts';
import type { Web_AppNavigation_Route } from '@/types/web/app-navigation.d.ts';
import type {
  Web_Components_ConnectionStatus,
  Web_Components_ConnectionTestResult,
  Web_Components_View,
} from '@/types/web/components.d.ts';

/**
 * App.
 *
 * @since 2.2.1
 */
export type Web_App_App_Returns = ReactElement;
export type Web_App_App_Phase = Web_App_Phase;
export type Web_App_App_SetPhase = Dispatch<SetStateAction<Web_App_App_Phase>>;
export type Web_App_App_PhaseState = [Web_App_App_Phase, Web_App_App_SetPhase];
export type Web_App_App_Username = string;
export type Web_App_App_SetUsername = Dispatch<SetStateAction<Web_App_App_Username>>;
export type Web_App_App_UsernameState = [Web_App_App_Username, Web_App_App_SetUsername];
export type Web_App_App_ActiveRoute = Web_AppNavigation_Route;
export type Web_App_App_SetActiveRoute = Dispatch<SetStateAction<Web_App_App_ActiveRoute>>;
export type Web_App_App_ActiveRouteState = [Web_App_App_ActiveRoute, Web_App_App_SetActiveRoute];
export type Web_App_App_Overview = Web_Api_Overview | null;
export type Web_App_App_SetOverview = Dispatch<SetStateAction<Web_App_App_Overview>>;
export type Web_App_App_OverviewState = [Web_App_App_Overview, Web_App_App_SetOverview];
export type Web_App_App_Activity = Web_Api_ActivityEvent[];
export type Web_App_App_SetActivity = Dispatch<SetStateAction<Web_App_App_Activity>>;
export type Web_App_App_ActivityState = [Web_App_App_Activity, Web_App_App_SetActivity];
export type Web_App_App_Connection = Web_Api_Connection | null;
export type Web_App_App_SetConnection = Dispatch<SetStateAction<Web_App_App_Connection>>;
export type Web_App_App_ConnectionState = [Web_App_App_Connection, Web_App_App_SetConnection];
export type Web_App_App_ConnectionTest = Web_Components_ConnectionTestResult;
export type Web_App_App_SetConnectionTest = Dispatch<SetStateAction<Web_App_App_ConnectionTest>>;
export type Web_App_App_ConnectionTestState = [Web_App_App_ConnectionTest, Web_App_App_SetConnectionTest];
export type Web_App_App_Tokens = Web_Api_Token[];
export type Web_App_App_SetTokens = Dispatch<SetStateAction<Web_App_App_Tokens>>;
export type Web_App_App_TokensState = [Web_App_App_Tokens, Web_App_App_SetTokens];
export type Web_App_App_RemovedSecrets = Web_Api_RemovedSecret[];
export type Web_App_App_SetRemovedSecrets = Dispatch<SetStateAction<Web_App_App_RemovedSecrets>>;
export type Web_App_App_RemovedSecretsState = [Web_App_App_RemovedSecrets, Web_App_App_SetRemovedSecrets];
export type Web_App_App_StartupError = string;
export type Web_App_App_SetStartupError = Dispatch<SetStateAction<Web_App_App_StartupError>>;
export type Web_App_App_StartupErrorState = [Web_App_App_StartupError, Web_App_App_SetStartupError];
export type Web_App_App_ConnectionDirty = boolean;
export type Web_App_App_SetConnectionDirty = Dispatch<SetStateAction<Web_App_App_ConnectionDirty>>;
export type Web_App_App_ConnectionDirtyState = [Web_App_App_ConnectionDirty, Web_App_App_SetConnectionDirty];
export type Web_App_App_ResetSession_Returns = void;
export type Web_App_App_ResetSession = () => Web_App_App_ResetSession_Returns;
export type Web_App_App_Guard_Action = () => Promise<void>;
export type Web_App_App_Guard_Returns = Promise<void>;
export type Web_App_App_Guard = (action: Web_App_App_Guard_Action) => Web_App_App_Guard_Returns;
export type Web_App_App_LoadOverview_Returns = Promise<void>;
export type Web_App_App_LoadOverview = () => Web_App_App_LoadOverview_Returns;
export type Web_App_App_LoadOverview_NextResults = [Web_Api_Overview, Web_Api_ActivityEvent[]];
export type Web_App_App_LoadOverview_NextOverview = Web_Api_Overview;
export type Web_App_App_LoadOverview_NextActivity = Web_Api_ActivityEvent[];
export type Web_App_App_LoadActivity_Returns = Promise<void>;
export type Web_App_App_LoadActivity = () => Web_App_App_LoadActivity_Returns;
export type Web_App_App_LoadTokens_Returns = Promise<void>;
export type Web_App_App_LoadTokens = () => Web_App_App_LoadTokens_Returns;
export type Web_App_App_LoadConnection_Returns = Promise<void>;
export type Web_App_App_LoadConnection = () => Web_App_App_LoadConnection_Returns;
export type Web_App_App_LoadRemovedSecrets_Returns = Promise<void>;
export type Web_App_App_LoadRemovedSecrets = () => Web_App_App_LoadRemovedSecrets_Returns;
export type Web_App_App_LoadRemovedSecrets_Principal = Web_Api_Principal | null;
export type Web_App_App_ApplyAppRoute_Route = Web_AppNavigation_Route;
export type Web_App_App_ApplyAppRoute_Returns = void;
export type Web_App_App_ApplyAppRoute = (route: Web_App_App_ApplyAppRoute_Route) => Web_App_App_ApplyAppRoute_Returns;
export type Web_App_App_OpenRoute_Route = Web_AppNavigation_Route;
export type Web_App_App_OpenRoute_Returns = void;
export type Web_App_App_OpenRoute = (route: Web_App_App_OpenRoute_Route) => Web_App_App_OpenRoute_Returns;
export type Web_App_App_OpenView_View = Web_Components_View;
export type Web_App_App_OpenView_Returns = void;
export type Web_App_App_OpenView = (view: Web_App_App_OpenView_View) => Web_App_App_OpenView_Returns;
export type Web_App_App_EnterApplication_Returns = Promise<void>;
export type Web_App_App_EnterApplication = () => Web_App_App_EnterApplication_Returns;
export type Web_App_App_EnterApplication_Principal = Web_Api_Principal | null;
export type Web_App_App_Bootstrap_Returns = Promise<void>;
export type Web_App_App_Bootstrap = () => Web_App_App_Bootstrap_Returns;
export type Web_App_App_Bootstrap_SetupStatus = Web_Api_SetupStatus;
export type Web_App_App_RunConnectionTest_Returns = Promise<void>;
export type Web_App_App_RunConnectionTest = () => Web_App_App_RunConnectionTest_Returns;
export type Web_App_App_RunConnectionTest_Result = Web_Api_ConnectionTest;
export type Web_App_App_SignOut_Returns = Promise<void>;
export type Web_App_App_SignOut = () => Web_App_App_SignOut_Returns;
export type Web_App_App_RenderView_Returns = ReactElement;
export type Web_App_App_RenderView = () => Web_App_App_RenderView_Returns;
export type Web_App_App_LastRemovedSecret = Web_Api_RemovedSecret | undefined;
export type Web_App_App_RemovedAt = string;
export type Web_App_App_Notice = ReactElement | null;

/**
 * App.
 *
 * @since 2.2.1
 */
export type Web_App_DescribeConnection_Connection = Web_Api_Connection | null;
export type Web_App_DescribeConnection_ConnectionTest = Web_Components_ConnectionTestResult;
export type Web_App_DescribeConnection_Returns = Web_Components_ConnectionStatus;
export type Web_App_DescribeConnection_Target = string;

/**
 * App.
 *
 * @since 2.2.1
 */
export type Web_App_DescribeRemovedSecret_RemovedSecret = Web_Api_RemovedSecret;
export type Web_App_DescribeRemovedSecret_Returns = Web_App_RemovedSecretAction;

/**
 * App.
 *
 * @since 2.0.0
 */
export type Web_App_Phase = 'application' | 'claim' | 'loading' | 'login';

/**
 * App.
 *
 * @since 2.0.0
 */
export type Web_App_RemovedSecretAction = {
  label: string;
  view: Web_Components_View;
};
