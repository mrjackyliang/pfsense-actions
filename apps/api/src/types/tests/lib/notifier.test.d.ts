import type { Mock } from 'vitest';

import type { Runner as State } from '@/lib/state.js';
import type {
  Lib_Api_Runner_Login_Returns,
  Lib_Api_Runner_Logout_Returns,
  Lib_Api_Runner_SystemInformation_Returns,
} from '@/types/lib/api.d.ts';
import type {
  Lib_Notifier_PfsenseSession,
  Lib_Notifier_Runner_Dependencies,
} from '@/types/lib/notifier.d.ts';
import type { Lib_State_Runner_CreateNotificationTarget_Returns } from '@/types/lib/state.d.ts';
import type {
  Shared_NotificationTarget,
  Shared_PfsenseConnection,
} from '@/types/shared.d.ts';

export type Tests_Lib_Notifier_CreatedTarget = Lib_State_Runner_CreateNotificationTarget_Returns;

export type Tests_Lib_Notifier_DataDirectory = string | undefined;

export type Tests_Lib_Notifier_GetDataDirectory_Returns = string;

export type Tests_Lib_Notifier_OpenState_Returns = State;

export type Tests_Lib_Notifier_Reachable = {
  current: boolean;
};

export type Tests_Lib_Notifier_Send = Mock<Lib_Notifier_Runner_Dependencies['send']>;

export type Tests_Lib_Notifier_Session = Lib_Notifier_PfsenseSession;

export type Tests_Lib_Notifier_SessionFactory = Mock<(connection: Shared_PfsenseConnection) => Lib_Notifier_PfsenseSession>;

export type Tests_Lib_Notifier_State = State;

export type Tests_Lib_Notifier_TargetId = string;

export type Tests_Lib_Notifier_Login = () => Lib_Api_Runner_Login_Returns;

export type Tests_Lib_Notifier_Logout = () => Lib_Api_Runner_Logout_Returns;

export type Tests_Lib_Notifier_SystemInformation = () => Lib_Api_Runner_SystemInformation_Returns;

export type Tests_Lib_Notifier_SystemInformationResponse = Awaited<Lib_Api_Runner_SystemInformation_Returns>;

export type Tests_Lib_Notifier_FindTarget_State = State;

export type Tests_Lib_Notifier_FindTarget_Name = string;

export type Tests_Lib_Notifier_FindTarget_Returns = Shared_NotificationTarget;

export type Tests_Lib_Notifier_FindTarget_Target = Shared_NotificationTarget | undefined;
