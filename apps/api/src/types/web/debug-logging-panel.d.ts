import type {
  Dispatch,
  ReactElement,
  SetStateAction,
} from 'react';

import type { Web_Api_Diagnostics } from '@/types/web/api.d.ts';

/**
 * Debug Logging Panel.
 *
 * @since 2.2.1
 */
export type Web_DebugLoggingPanel_DebugLoggingPanel_Returns = ReactElement;
export type Web_DebugLoggingPanel_DebugLoggingPanel_DebugLogging = boolean | null;
export type Web_DebugLoggingPanel_DebugLoggingPanel_SetDebugLogging = Dispatch<SetStateAction<Web_DebugLoggingPanel_DebugLoggingPanel_DebugLogging>>;
export type Web_DebugLoggingPanel_DebugLoggingPanel_DebugLoggingState = [Web_DebugLoggingPanel_DebugLoggingPanel_DebugLogging, Web_DebugLoggingPanel_DebugLoggingPanel_SetDebugLogging];
export type Web_DebugLoggingPanel_DebugLoggingPanel_Saving = boolean;
export type Web_DebugLoggingPanel_DebugLoggingPanel_SetSaving = Dispatch<SetStateAction<Web_DebugLoggingPanel_DebugLoggingPanel_Saving>>;
export type Web_DebugLoggingPanel_DebugLoggingPanel_SavingState = [Web_DebugLoggingPanel_DebugLoggingPanel_Saving, Web_DebugLoggingPanel_DebugLoggingPanel_SetSaving];
export type Web_DebugLoggingPanel_DebugLoggingPanel_Active = boolean;
export type Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Enabled = boolean;
export type Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Returns = Promise<void>;
export type Web_DebugLoggingPanel_DebugLoggingPanel_Toggle = (enabled: Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Enabled) => Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Returns;
export type Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Previous = boolean | null;
export type Web_DebugLoggingPanel_DebugLoggingPanel_Toggle_Saved = Web_Api_Diagnostics;
export type Web_DebugLoggingPanel_DebugLoggingPanel_Enabled = boolean;
