import type { Runner as Pfsense } from '@/lib/api.js';
import type { Runner as State } from '@/lib/state.js';
import type {
  Lib_Notifications_App,
  Lib_Notifications_EventDefinitions,
  Lib_Notifications_Notification,
  Lib_Notifications_Result,
  Lib_Notifications_Target,
} from '@/types/lib/notifications.d.ts';
import type {
  Lib_State_Runner_GetNotificationDeliveries_Returns,
  Lib_State_Runner_GetNotificationDelivery_Returns,
} from '@/types/lib/state.d.ts';
import type { Shared_PfsenseConnection } from '@/types/shared.d.ts';

export type Lib_Notifier_ActionLabels = Record<string, string>;

export type Lib_Notifier_App = Lib_Notifications_App;

export type Lib_Notifier_NotificationEvents = Lib_Notifications_EventDefinitions;

export type Lib_Notifier_PfsenseSession = Pick<Pfsense, 'login' | 'logout' | 'systemInformation'>;

export type Lib_Notifier_Runner_CheckCommandTimeoutMilliseconds = number;

export type Lib_Notifier_Runner_CheckInProgress = boolean;

export type Lib_Notifier_Runner_CheckIntervalMilliseconds = number;

export type Lib_Notifier_Runner_CheckTimer = NodeJS.Timeout | undefined;

export type Lib_Notifier_Runner_Dependencies = {
  createPfsense: (connection: Shared_PfsenseConnection) => Lib_Notifier_PfsenseSession;
  send: (app: Lib_Notifications_App, target: Lib_Notifications_Target, notification: Lib_Notifications_Notification) => Promise<Lib_Notifications_Result>;
};

export type Lib_Notifier_Runner_FailedChecks = number;

export type Lib_Notifier_Runner_LockedAddresses = Map<string, number>;

export type Lib_Notifier_Runner_LockWindowMilliseconds = number;

export type Lib_Notifier_Runner_PfsenseDown = boolean;

export type Lib_Notifier_Runner_State = State;

export type Lib_Notifier_Runner_Constructor_State = State;

export type Lib_Notifier_Runner_Constructor_Dependencies = Partial<Lib_Notifier_Runner_Dependencies>;

export type Lib_Notifier_Runner_CheckPfsense_Returns = Promise<void>;

export type Lib_Notifier_Runner_CheckPfsense_Connection = Shared_PfsenseConnection | undefined;

export type Lib_Notifier_Runner_CheckPfsense_Instance = Lib_Notifier_PfsenseSession | undefined;

export type Lib_Notifier_Runner_CheckPfsense_LoginResponse = Awaited<ReturnType<Lib_Notifier_PfsenseSession['login']>>;

export type Lib_Notifier_Runner_CheckPfsense_Reachable = boolean;

export type Lib_Notifier_Runner_CheckPfsense_SystemInformationResponse = Awaited<ReturnType<Lib_Notifier_PfsenseSession['systemInformation']>>;

export type Lib_Notifier_Runner_CheckPfsenseOnce_Returns = Promise<void>;

export type Lib_Notifier_Runner_GetEvents_Returns = Lib_Notifications_EventDefinitions;

export type Lib_Notifier_Runner_NotifyActionFailed_Action = string;

export type Lib_Notifier_Runner_NotifyActionFailed_Reason = string;

export type Lib_Notifier_Runner_NotifyActionFailed_Returns = void;

export type Lib_Notifier_Runner_NotifySecretsRemoved_Items = string[];

export type Lib_Notifier_Runner_NotifySecretsRemoved_Returns = void;

export type Lib_Notifier_Runner_NotifySignInLimit_Key = string;

export type Lib_Notifier_Runner_NotifySignInLimit_Returns = void;

export type Lib_Notifier_Runner_NotifySignInLimit_Address = string;

export type Lib_Notifier_Runner_NotifySignInLimit_Now = number;

export type Lib_Notifier_Runner_NotifySignInLimit_LockedAt = number | undefined;

export type Lib_Notifier_Runner_NotifyWakeOnLanSent_MacAddress = string;

export type Lib_Notifier_Runner_NotifyWakeOnLanSent_BroadcastAddress = string;

export type Lib_Notifier_Runner_NotifyWakeOnLanSent_Returns = void;

export type Lib_Notifier_Runner_SendTest_Id = string;

export type Lib_Notifier_Runner_SendTest_Returns = Promise<Lib_Notifications_Result | 'not-found' | 'secrets-missing'>;

export type Lib_Notifier_Runner_SendTest_Delivery = Lib_State_Runner_GetNotificationDelivery_Returns;

export type Lib_Notifier_Runner_SendTest_Result = Lib_Notifications_Result;

export type Lib_Notifier_Runner_Start_Returns = void;

export type Lib_Notifier_Runner_Stop_Returns = void;

export type Lib_Notifier_Runner_Deliver_Notification = Lib_Notifications_Notification;

export type Lib_Notifier_Runner_Deliver_Returns = void;

export type Lib_Notifier_Runner_Deliver_Deliveries = Lib_State_Runner_GetNotificationDeliveries_Returns;

export type Lib_Notifier_Runner_Deliver_Error = unknown;

export type Lib_Notifier_Runner_Deliver_Reason = string;
