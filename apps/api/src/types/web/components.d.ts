import type {
  ReactElement,
  ReactNode,
} from 'react';

import type {
  Web_Api_ActivityEvent,
  Web_Api_Connection,
  Web_Api_CreatedToken,
  Web_Api_CreateTokenInput,
  Web_Api_Overview,
  Web_Api_Scope,
  Web_Api_Token,
  Web_Api_UpdateTokenInput,
} from '@/types/web/api.d.ts';

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_Icon_Name =
  'activity'
  | 'add'
  | 'bell'
  | 'check'
  | 'chevron'
  | 'chevron-down'
  | 'copy'
  | 'download'
  | 'edit'
  | 'key'
  | 'logout'
  | 'more'
  | 'overview'
  | 'refresh'
  | 'remove'
  | 'send'
  | 'server'
  | 'shield'
  | 'warning'
  | 'x';

export type Web_Components_Icon_Props = {
  name: Web_Components_Icon_Name;
  size?: number;
};
export type Web_Components_Icon_Returns = ReactElement;

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_Button_Variant = 'primary' | 'secondary' | 'quiet' | 'danger';
export type Web_Components_Button_Props = {
  block?: boolean;
  children: ReactNode;
  disabled?: boolean;
  icon?: Web_Components_Icon_Name;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: Web_Components_Button_Variant;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_ConfirmDialog_Tone = 'danger' | 'primary';
export type Web_Components_ConfirmDialog_Props = {
  busy: boolean;
  busyLabel: string;
  children?: ReactNode;
  confirmDisabled?: boolean;
  confirmLabel: string;
  error: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
  tone?: Web_Components_ConfirmDialog_Tone;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_TotpDialog_Mode = 'disable' | 'recovery' | 'setup';
export type Web_Components_TotpDialog_Step = 'codes' | 'password' | 'scan';
export type Web_Components_TotpDialog_Props = {
  mode: Web_Components_TotpDialog_Mode | null;
  onAuthenticatorEnabled: () => void;
  onChanged: () => Promise<void>;
  onClose: () => void;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_View = 'access' | 'activity' | 'connection' | 'notifications' | 'overview' | 'security';

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_NavigationItem = {
  icon: Web_Components_Icon_Name;
  id: Exclude<Web_Components_View, 'security'>;
  label: string;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_ConnectionTone = 'blocked' | 'connecting' | 'idle' | 'protected';

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_ConnectionStatus = {
  detail: string;
  label: string;
  tone: Web_Components_ConnectionTone;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_ConnectionTestResult = boolean | null;

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_AppShell_Props = {
  activeView: Web_Components_View;
  children: ReactNode;
  connection: Web_Api_Connection | null;
  connectionTest: Web_Components_ConnectionTestResult;
  notice: ReactNode;
  onLogout: () => void;
  onViewChange: (view: Web_Components_View) => void;
  username: string;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_AccountMenu_Props = {
  compact: boolean;
  onLogout: () => void;
  onViewChange: (view: Web_Components_View) => void;
  username: string;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_AuthenticationScreen_Mode = 'claim' | 'login';
export type Web_Components_AuthenticationScreen_Props = {
  mode: Web_Components_AuthenticationScreen_Mode;
  onSignedIn: () => Promise<void>;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_SecurityView_ErrorContext = 'page' | 'passkey' | 'password' | 'prompt' | 'username';
export type Web_Components_SecurityView_Props = {
  onAuthenticatorEnabled: () => void;
  onUsernameChanged: (username: string) => void;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_KeyNotice_Item = {
  id: string;
  label: string;
  onOpen: () => void;
};
export type Web_Components_KeyNotice_Props = {
  appName: string;
  items: Web_Components_KeyNotice_Item[];
  keyName: string;
  onDismiss: () => Promise<void>;
  removedAt: string;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_OverviewView_Props = {
  activity: Web_Api_ActivityEvent[];
  connectionTest: Web_Components_ConnectionTestResult;
  onOpenActivity: () => void;
  onOpenConnection: () => void;
  onRefresh: () => Promise<void>;
  onTestConnection: () => Promise<void>;
  overview: Web_Api_Overview | null;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_ActivityFilter = 'access' | 'all' | 'configuration' | 'failed' | 'service' | 'token';
export type Web_Components_ActivityFilterOption = {
  id: Web_Components_ActivityFilter;
  label: string;
};
export type Web_Components_ActivityView_Props = {
  activity: Web_Api_ActivityEvent[];
  onRefresh: () => Promise<void>;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_ActivityList_Props = {
  activity: Web_Api_ActivityEvent[];
  compact?: boolean;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_AccessView_Props = {
  createdToken: Web_Api_CreatedToken | null;
  onCreateToken: (input: Web_Api_CreateTokenInput) => Promise<void>;
  onDismissCreatedToken: () => void;
  onRevokeToken: (tokenId: string) => Promise<void>;
  onUpdateToken: (tokenId: string, input: Web_Api_UpdateTokenInput) => Promise<void>;
  tokens: Web_Api_Token[];
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_Endpoint = {
  method: 'GET' | 'POST';
  path: string;
  scope: Web_Api_Scope;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_TokenDialog_Expiry = '30' | '90' | '365' | 'keep' | 'never';
export type Web_Components_TokenDialog_Props = {
  onClose: () => void;
  onCreate: (input: Web_Api_CreateTokenInput) => Promise<void>;
  onUpdate: (tokenId: string, input: Web_Api_UpdateTokenInput) => Promise<void>;
  open: boolean;
  token: Web_Api_Token | null;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_ScopeOption = {
  description: string;
  endpoints: string[];
  id: Web_Api_Scope;
};

/**
 * Components.
 *
 * @since 2.0.0
 */
export type Web_Components_ConnectionView_Props = {
  connection: Web_Api_Connection | null;
  connectionTest: Web_Components_ConnectionTestResult;
  onDirtyChange: (dirty: boolean) => void;
  onSave: (connection: Web_Api_Connection) => void;
  onTestConnection: () => Promise<void>;
};
