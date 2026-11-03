import type express from 'express';

import type { Runner as Access } from '@/lib/access.js';
import type { Runner as Attempts } from '@/lib/attempts.js';
import type {
  passkeyRegistrationStart,
  passkeyRegistrationVerify,
  passwordChange,
  passwordConfirmation,
  totpEnable,
  usernameChange,
} from '@/lib/schema.js';
import type { Runner as State } from '@/lib/state.js';
import type {
  Lib_Passkeys_CreateRegistrationOptions_Returns,
  Lib_Passkeys_VerifyRegistration_Result,
} from '@/types/lib/passkeys.d.ts';
import type {
  Lib_State_Runner_ChangeAdministratorUsername_Returns,
  Lib_State_Runner_CreatePasskey_Returns,
  Lib_State_Runner_DisableTotp_Returns,
  Lib_State_Runner_EnableTotp_Returns,
  Lib_State_Runner_RemovePasskey_Returns,
  Lib_State_Runner_ReplaceRecoveryCodes_Returns,
  Lib_State_Runner_TakeWebauthnCeremony_Returns,
} from '@/types/lib/state.d.ts';
import type {
  Shared_Administrator,
  Shared_AdministratorPasskeySummary,
  Shared_BrowserSession,
  Shared_WebauthnConfiguration,
} from '@/types/shared.d.ts';

/**
 * Routes - Security - Runner - Access.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_Access = Access;

/**
 * Routes - Security - Runner - Attempts.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_Attempts = Attempts;

/**
 * Routes - Security - Runner - Confirm Password.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_ConfirmPassword_Request = express.Request;

export type Routes_Security_Runner_ConfirmPassword_Response = express.Response;

export type Routes_Security_Runner_ConfirmPassword_Password = string;

export type Routes_Security_Runner_ConfirmPassword_Field = string;

export type Routes_Security_Runner_ConfirmPassword_Returns = boolean;

export type Routes_Security_Runner_ConfirmPassword_AttemptKey = string;

export type Routes_Security_Runner_ConfirmPassword_Session = Shared_BrowserSession;

export type Routes_Security_Runner_ConfirmPassword_RetryAfterSeconds = number;

/**
 * Routes - Security - Runner - Constructor.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_Constructor_State = State;

export type Routes_Security_Runner_Constructor_Access = Access;

export type Routes_Security_Runner_Constructor_Attempts = Attempts;

/**
 * Routes - Security - Runner - Register.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_Register_App = express.Express;

export type Routes_Security_Runner_Register_Returns = void;

/**
 * Routes - Security - Runner - Route Change Password.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_RouteChangePassword_Request = express.Request;

export type Routes_Security_Runner_RouteChangePassword_Response = express.Response;

export type Routes_Security_Runner_RouteChangePassword_Returns = void;

export type Routes_Security_Runner_RouteChangePassword_RequestBody = ReturnType<typeof passwordChange.safeParse>;

export type Routes_Security_Runner_RouteChangePassword_Session = Shared_BrowserSession;

/**
 * Routes - Security - Runner - Route Change Username.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_RouteChangeUsername_Request = express.Request;

export type Routes_Security_Runner_RouteChangeUsername_Response = express.Response;

export type Routes_Security_Runner_RouteChangeUsername_Returns = void;

export type Routes_Security_Runner_RouteChangeUsername_RequestBody = ReturnType<typeof usernameChange.safeParse>;

export type Routes_Security_Runner_RouteChangeUsername_Session = Shared_BrowserSession;

export type Routes_Security_Runner_RouteChangeUsername_Result = Lib_State_Runner_ChangeAdministratorUsername_Returns;

/**
 * Routes - Security - Runner - Route Delete Passkey.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_RouteDeletePasskey_Request = express.Request;

export type Routes_Security_Runner_RouteDeletePasskey_Response = express.Response;

export type Routes_Security_Runner_RouteDeletePasskey_Returns = void;

export type Routes_Security_Runner_RouteDeletePasskey_PasskeyId = string | undefined;

export type Routes_Security_Runner_RouteDeletePasskey_RequestBody = ReturnType<typeof passwordConfirmation.safeParse>;

export type Routes_Security_Runner_RouteDeletePasskey_Session = Shared_BrowserSession;

export type Routes_Security_Runner_RouteDeletePasskey_Result = Lib_State_Runner_RemovePasskey_Returns;

/**
 * Routes - Security - Runner - Route Disable Totp.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_RouteDisableTotp_Request = express.Request;

export type Routes_Security_Runner_RouteDisableTotp_Response = express.Response;

export type Routes_Security_Runner_RouteDisableTotp_Returns = void;

export type Routes_Security_Runner_RouteDisableTotp_RequestBody = ReturnType<typeof passwordConfirmation.safeParse>;

export type Routes_Security_Runner_RouteDisableTotp_Session = Shared_BrowserSession;

export type Routes_Security_Runner_RouteDisableTotp_Result = Lib_State_Runner_DisableTotp_Returns;

/**
 * Routes - Security - Runner - Route Enable Totp.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_RouteEnableTotp_Request = express.Request;

export type Routes_Security_Runner_RouteEnableTotp_Response = express.Response;

export type Routes_Security_Runner_RouteEnableTotp_Returns = void;

export type Routes_Security_Runner_RouteEnableTotp_RequestBody = ReturnType<typeof totpEnable.safeParse>;

export type Routes_Security_Runner_RouteEnableTotp_Session = Shared_BrowserSession;

export type Routes_Security_Runner_RouteEnableTotp_Secret = string | undefined;

export type Routes_Security_Runner_RouteEnableTotp_MatchedStep = number | undefined;

export type Routes_Security_Runner_RouteEnableTotp_RecoveryCodes = Lib_State_Runner_EnableTotp_Returns;

/**
 * Routes - Security - Runner - Route Passkey Options.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_RoutePasskeyOptions_Request = express.Request;

export type Routes_Security_Runner_RoutePasskeyOptions_Response = express.Response;

export type Routes_Security_Runner_RoutePasskeyOptions_Returns = Promise<void>;

export type Routes_Security_Runner_RoutePasskeyOptions_RequestBody = ReturnType<typeof passkeyRegistrationStart.safeParse>;

export type Routes_Security_Runner_RoutePasskeyOptions_Session = Shared_BrowserSession;

export type Routes_Security_Runner_RoutePasskeyOptions_Administrator = Shared_Administrator | undefined;

export type Routes_Security_Runner_RoutePasskeyOptions_Configuration = Shared_WebauthnConfiguration;

export type Routes_Security_Runner_RoutePasskeyOptions_Options = Awaited<Lib_Passkeys_CreateRegistrationOptions_Returns>;

export type Routes_Security_Runner_RoutePasskeyOptions_CeremonyId = string;

/**
 * Routes - Security - Runner - Route Passkey Verify.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_RoutePasskeyVerify_Request = express.Request;

export type Routes_Security_Runner_RoutePasskeyVerify_Response = express.Response;

export type Routes_Security_Runner_RoutePasskeyVerify_Returns = Promise<void>;

export type Routes_Security_Runner_RoutePasskeyVerify_RequestBody = ReturnType<typeof passkeyRegistrationVerify.safeParse>;

export type Routes_Security_Runner_RoutePasskeyVerify_Session = Shared_BrowserSession;

export type Routes_Security_Runner_RoutePasskeyVerify_Ceremony = Lib_State_Runner_TakeWebauthnCeremony_Returns;

export type Routes_Security_Runner_RoutePasskeyVerify_Configuration = Shared_WebauthnConfiguration;

export type Routes_Security_Runner_RoutePasskeyVerify_Credential = Lib_Passkeys_VerifyRegistration_Result | undefined;

export type Routes_Security_Runner_RoutePasskeyVerify_Name = string;

export type Routes_Security_Runner_RoutePasskeyVerify_Result = Lib_State_Runner_CreatePasskey_Returns;

export type Routes_Security_Runner_RoutePasskeyVerify_Passkey = Shared_AdministratorPasskeySummary | undefined;

/**
 * Routes - Security - Runner - Route Recovery Codes.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_RouteRecoveryCodes_Request = express.Request;

export type Routes_Security_Runner_RouteRecoveryCodes_Response = express.Response;

export type Routes_Security_Runner_RouteRecoveryCodes_Returns = void;

export type Routes_Security_Runner_RouteRecoveryCodes_RequestBody = ReturnType<typeof passwordConfirmation.safeParse>;

export type Routes_Security_Runner_RouteRecoveryCodes_Session = Shared_BrowserSession;

export type Routes_Security_Runner_RouteRecoveryCodes_RecoveryCodes = Lib_State_Runner_ReplaceRecoveryCodes_Returns;

/**
 * Routes - Security - Runner - Route Security.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_RouteSecurity_Request = express.Request;

export type Routes_Security_Runner_RouteSecurity_Response = express.Response;

export type Routes_Security_Runner_RouteSecurity_Returns = void;

export type Routes_Security_Runner_RouteSecurity_Session = Shared_BrowserSession;

/**
 * Routes - Security - Runner - Route Totp Setup.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_RouteTotpSetup_Request = express.Request;

export type Routes_Security_Runner_RouteTotpSetup_Response = express.Response;

export type Routes_Security_Runner_RouteTotpSetup_Returns = Promise<void>;

export type Routes_Security_Runner_RouteTotpSetup_RequestBody = ReturnType<typeof passwordConfirmation.safeParse>;

export type Routes_Security_Runner_RouteTotpSetup_Session = Shared_BrowserSession;

export type Routes_Security_Runner_RouteTotpSetup_Secret = string;

export type Routes_Security_Runner_RouteTotpSetup_Uri = string;

export type Routes_Security_Runner_RouteTotpSetup_QrCode = string;

export type Routes_Security_Runner_RouteTotpSetup_ExpiresAt = string;

/**
 * Routes - Security - Runner - State.
 *
 * @since 2.0.0
 */
export type Routes_Security_Runner_State = State;
