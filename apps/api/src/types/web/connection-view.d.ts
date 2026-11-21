import type {
  Dispatch,
  FormEvent,
  ReactElement,
  SetStateAction,
} from 'react';

import type {
  Web_Api_Connection,
  Web_Api_CredentialType,
} from '@/types/web/api.d.ts';
import type { Web_Components_ConnectionView_Props } from '@/types/web/components.d.ts';

/**
 * Connection View.
 *
 * @since 2.2.1
 */
export type Web_ConnectionView_ConnectionView_Props = Web_Components_ConnectionView_Props;
export type Web_ConnectionView_ConnectionView_Returns = ReactElement;
export type Web_ConnectionView_ConnectionView_Connection = Web_Components_ConnectionView_Props['connection'];
export type Web_ConnectionView_ConnectionView_ConnectionTest = Web_Components_ConnectionView_Props['connectionTest'];
export type Web_ConnectionView_ConnectionView_OnBackupImported = Web_Components_ConnectionView_Props['onBackupImported'];
export type Web_ConnectionView_ConnectionView_OnDirtyChange = Web_Components_ConnectionView_Props['onDirtyChange'];
export type Web_ConnectionView_ConnectionView_OnSave = Web_Components_ConnectionView_Props['onSave'];
export type Web_ConnectionView_ConnectionView_OnTestConnection = Web_Components_ConnectionView_Props['onTestConnection'];
export type Web_ConnectionView_ConnectionView_Address = string;
export type Web_ConnectionView_ConnectionView_SetAddress = Dispatch<SetStateAction<Web_ConnectionView_ConnectionView_Address>>;
export type Web_ConnectionView_ConnectionView_AddressState = [Web_ConnectionView_ConnectionView_Address, Web_ConnectionView_ConnectionView_SetAddress];
export type Web_ConnectionView_ConnectionView_Port = string;
export type Web_ConnectionView_ConnectionView_SetPort = Dispatch<SetStateAction<Web_ConnectionView_ConnectionView_Port>>;
export type Web_ConnectionView_ConnectionView_PortState = [Web_ConnectionView_ConnectionView_Port, Web_ConnectionView_ConnectionView_SetPort];
export type Web_ConnectionView_ConnectionView_Username = string;
export type Web_ConnectionView_ConnectionView_SetUsername = Dispatch<SetStateAction<Web_ConnectionView_ConnectionView_Username>>;
export type Web_ConnectionView_ConnectionView_UsernameState = [Web_ConnectionView_ConnectionView_Username, Web_ConnectionView_ConnectionView_SetUsername];
export type Web_ConnectionView_ConnectionView_CredentialType = Web_Api_CredentialType;
export type Web_ConnectionView_ConnectionView_SetCredentialType = Dispatch<SetStateAction<Web_ConnectionView_ConnectionView_CredentialType>>;
export type Web_ConnectionView_ConnectionView_CredentialTypeState = [Web_ConnectionView_ConnectionView_CredentialType, Web_ConnectionView_ConnectionView_SetCredentialType];
export type Web_ConnectionView_ConnectionView_Credential = string;
export type Web_ConnectionView_ConnectionView_SetCredential = Dispatch<SetStateAction<Web_ConnectionView_ConnectionView_Credential>>;
export type Web_ConnectionView_ConnectionView_CredentialState = [Web_ConnectionView_ConnectionView_Credential, Web_ConnectionView_ConnectionView_SetCredential];
export type Web_ConnectionView_ConnectionView_Busy = boolean;
export type Web_ConnectionView_ConnectionView_SetBusy = Dispatch<SetStateAction<Web_ConnectionView_ConnectionView_Busy>>;
export type Web_ConnectionView_ConnectionView_BusyState = [Web_ConnectionView_ConnectionView_Busy, Web_ConnectionView_ConnectionView_SetBusy];
export type Web_ConnectionView_ConnectionView_Error = unknown;
export type Web_ConnectionView_ConnectionView_SetError = Dispatch<SetStateAction<Web_ConnectionView_ConnectionView_Error>>;
export type Web_ConnectionView_ConnectionView_ErrorState = [Web_ConnectionView_ConnectionView_Error, Web_ConnectionView_ConnectionView_SetError];
export type Web_ConnectionView_ConnectionView_Hydrated = boolean;
export type Web_ConnectionView_ConnectionView_SetHydrated = Dispatch<SetStateAction<Web_ConnectionView_ConnectionView_Hydrated>>;
export type Web_ConnectionView_ConnectionView_HydratedState = [Web_ConnectionView_ConnectionView_Hydrated, Web_ConnectionView_ConnectionView_SetHydrated];
export type Web_ConnectionView_ConnectionView_Configured = boolean;
export type Web_ConnectionView_ConnectionView_SavedAddress = string;
export type Web_ConnectionView_ConnectionView_SavedPort = string;
export type Web_ConnectionView_ConnectionView_SavedUsername = string;
export type Web_ConnectionView_ConnectionView_SavedCredentialType = Web_Api_CredentialType;
export type Web_ConnectionView_ConnectionView_Dirty = boolean;
export type Web_ConnectionView_ConnectionView_Warn_Event = BeforeUnloadEvent;
export type Web_ConnectionView_ConnectionView_Warn_Returns = void;
export type Web_ConnectionView_ConnectionView_Warn = (event: Web_ConnectionView_ConnectionView_Warn_Event) => Web_ConnectionView_ConnectionView_Warn_Returns;
export type Web_ConnectionView_ConnectionView_CredentialSaved = boolean;
export type Web_ConnectionView_ConnectionView_KeepsCredential = boolean;
export type Web_ConnectionView_ConnectionView_SavedCredentialLabel = string;
export type Web_ConnectionView_ConnectionView_FieldIssue_Field = string;
export type Web_ConnectionView_ConnectionView_FieldIssue_Returns = ReactElement | null;
export type Web_ConnectionView_ConnectionView_FieldIssue = (field: Web_ConnectionView_ConnectionView_FieldIssue_Field) => Web_ConnectionView_ConnectionView_FieldIssue_Returns;
export type Web_ConnectionView_ConnectionView_FieldIssue_Message = string;
export type Web_ConnectionView_ConnectionView_ShowError_CaughtError = unknown;
export type Web_ConnectionView_ConnectionView_ShowError_Returns = void;
export type Web_ConnectionView_ConnectionView_ShowError = (caughtError: Web_ConnectionView_ConnectionView_ShowError_CaughtError) => Web_ConnectionView_ConnectionView_ShowError_Returns;
export type Web_ConnectionView_ConnectionView_ShowError_Message = string;
export type Web_ConnectionView_ConnectionView_Save_Event = FormEvent<HTMLFormElement>;
export type Web_ConnectionView_ConnectionView_Save_Returns = Promise<void>;
export type Web_ConnectionView_ConnectionView_Save = (event: Web_ConnectionView_ConnectionView_Save_Event) => Web_ConnectionView_ConnectionView_Save_Returns;
export type Web_ConnectionView_ConnectionView_Save_Saved = Web_Api_Connection;
export type Web_ConnectionView_ConnectionView_Test_Returns = Promise<void>;
export type Web_ConnectionView_ConnectionView_Test = () => Web_ConnectionView_ConnectionView_Test_Returns;
export type Web_ConnectionView_ConnectionView_TestResult = ReactElement | null;
