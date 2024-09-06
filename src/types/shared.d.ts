import type { ErrorObject } from 'serialize-error';

/**
 * Api response.
 *
 * @since 1.0.0
 */
export type ApiResponseAction =
  'LOGIN'
  | 'LOGOUT'
  | 'RELOAD_FILTER'
  | 'SYSTEM_INFORMATION'
  | 'UPDATE_DYNDNS'
  | 'WAKE_ON_LAN';

export type ApiResponseSuccessSuccess = true;

export type ApiResponseSuccessInfo = object | null;

export type ApiResponseSuccess<Action extends ApiResponseAction, Info extends ApiResponseSuccessInfo> = {
  action: Action;
  success: ApiResponseSuccessSuccess;
  info: Info;
};

export type ApiResponseFailSuccess = false;

export type ApiResponseFailInfoError = ErrorObject;

export type ApiResponseFailInfoMessage = string;

export type ApiResponseFailInfo = {
  error?: ApiResponseFailInfoError;
  message?: ApiResponseFailInfoMessage;
};

export type ApiResponseFail<Action extends ApiResponseAction> = {
  action: Action;
  success: ApiResponseFailSuccess;
  info: ApiResponseFailInfo;
};

export type ApiResponse<Action extends ApiResponseAction, Info extends ApiResponseSuccessInfo> =
  ApiResponseSuccess<Action, Info>
  | ApiResponseFail<Action>;

/**
 * Environment variables.
 *
 * @since 1.0.0
 */
export type EnvironmentVariablesApiKey = string;

export type EnvironmentVariablesPfsensePassword = string;

export type EnvironmentVariablesPfsensePrivateKey = string;

export type EnvironmentVariablesPfsenseSshIp = string;

export type EnvironmentVariablesPfsenseSshPort = number;

export type EnvironmentVariablesPfsenseUsername = string;

export type EnvironmentVariablesPort = number;

export type EnvironmentVariables = {
  apiKey: EnvironmentVariablesApiKey;
  pfsensePassword?: EnvironmentVariablesPfsensePassword;
  pfsensePrivateKey?: EnvironmentVariablesPfsensePrivateKey;
  pfsenseSshIp: EnvironmentVariablesPfsenseSshIp;
  pfsenseSshPort: EnvironmentVariablesPfsenseSshPort;
  pfsenseUsername: EnvironmentVariablesPfsenseUsername;
  port: EnvironmentVariablesPort;
};
