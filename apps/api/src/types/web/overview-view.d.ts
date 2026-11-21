import type {
  Dispatch,
  ReactElement,
  SetStateAction,
} from 'react';

import type { Web_Api_Overview } from '@/types/web/api.d.ts';
import type { Web_Components_OverviewView_Props } from '@/types/web/components.d.ts';

/**
 * Overview View.
 *
 * @since 2.2.1
 */
export type Web_OverviewView_OverviewView_Props = Web_Components_OverviewView_Props;
export type Web_OverviewView_OverviewView_Returns = ReactElement;
export type Web_OverviewView_OverviewView_Activity = Web_Components_OverviewView_Props['activity'];
export type Web_OverviewView_OverviewView_ConnectionTest = Web_Components_OverviewView_Props['connectionTest'];
export type Web_OverviewView_OverviewView_OnOpenActivity = Web_Components_OverviewView_Props['onOpenActivity'];
export type Web_OverviewView_OverviewView_OnOpenConnection = Web_Components_OverviewView_Props['onOpenConnection'];
export type Web_OverviewView_OverviewView_OnRefresh = Web_Components_OverviewView_Props['onRefresh'];
export type Web_OverviewView_OverviewView_OnTestConnection = Web_Components_OverviewView_Props['onTestConnection'];
export type Web_OverviewView_OverviewView_Overview = Web_Components_OverviewView_Props['overview'];
export type Web_OverviewView_OverviewView_Busy = boolean;
export type Web_OverviewView_OverviewView_SetBusy = Dispatch<SetStateAction<Web_OverviewView_OverviewView_Busy>>;
export type Web_OverviewView_OverviewView_BusyState = [Web_OverviewView_OverviewView_Busy, Web_OverviewView_OverviewView_SetBusy];
export type Web_OverviewView_OverviewView_Error = string;
export type Web_OverviewView_OverviewView_SetError = Dispatch<SetStateAction<Web_OverviewView_OverviewView_Error>>;
export type Web_OverviewView_OverviewView_ErrorState = [Web_OverviewView_OverviewView_Error, Web_OverviewView_OverviewView_SetError];
export type Web_OverviewView_OverviewView_Run_Action = () => Promise<void>;
export type Web_OverviewView_OverviewView_Run_Returns = Promise<void>;
export type Web_OverviewView_OverviewView_Run = (action: Web_OverviewView_OverviewView_Run_Action) => Web_OverviewView_OverviewView_Run_Returns;
export type Web_OverviewView_OverviewView_Connection = Web_Api_Overview['connection'];
export type Web_OverviewView_OverviewView_CredentialLabel = string;
export type Web_OverviewView_OverviewView_LastTest = string;
export type Web_OverviewView_OverviewView_LastTestClass = string;
