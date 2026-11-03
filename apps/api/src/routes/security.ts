import { toDataURL } from 'qrcode';

import {
  getClientAddress,
  getRequestHostname,
  getWebauthnConfiguration,
  handleAsync,
  isPasskeyAvailable,
  sendError,
  sendValidationError,
} from '../lib/http.js';
import {
  createPasskeyRegistrationOptions,
  verifyPasskeyRegistration,
} from '../lib/passkeys.js';
import {
  passkeyCredentialIdentifier,
  passkeyRegistrationStart,
  passkeyRegistrationVerify,
  passwordChange,
  passwordConfirmation,
  totpEnable,
  usernameChange,
} from '../lib/schema.js';
import {
  createTotpUri,
  generateTotpSecret,
  verifyTotpCode,
} from '../lib/totp.js';

import type {
  Routes_Security_Runner_Access,
  Routes_Security_Runner_Attempts,
  Routes_Security_Runner_ConfirmPassword_AttemptKey,
  Routes_Security_Runner_ConfirmPassword_Field,
  Routes_Security_Runner_ConfirmPassword_Password,
  Routes_Security_Runner_ConfirmPassword_Request,
  Routes_Security_Runner_ConfirmPassword_Response,
  Routes_Security_Runner_ConfirmPassword_RetryAfterSeconds,
  Routes_Security_Runner_ConfirmPassword_Returns,
  Routes_Security_Runner_ConfirmPassword_Session,
  Routes_Security_Runner_Constructor_Access,
  Routes_Security_Runner_Constructor_Attempts,
  Routes_Security_Runner_Constructor_State,
  Routes_Security_Runner_Register_App,
  Routes_Security_Runner_Register_Returns,
  Routes_Security_Runner_RouteChangePassword_Request,
  Routes_Security_Runner_RouteChangePassword_RequestBody,
  Routes_Security_Runner_RouteChangePassword_Response,
  Routes_Security_Runner_RouteChangePassword_Returns,
  Routes_Security_Runner_RouteChangePassword_Session,
  Routes_Security_Runner_RouteChangeUsername_Request,
  Routes_Security_Runner_RouteChangeUsername_RequestBody,
  Routes_Security_Runner_RouteChangeUsername_Response,
  Routes_Security_Runner_RouteChangeUsername_Result,
  Routes_Security_Runner_RouteChangeUsername_Returns,
  Routes_Security_Runner_RouteChangeUsername_Session,
  Routes_Security_Runner_RouteDeletePasskey_PasskeyId,
  Routes_Security_Runner_RouteDeletePasskey_Request,
  Routes_Security_Runner_RouteDeletePasskey_RequestBody,
  Routes_Security_Runner_RouteDeletePasskey_Response,
  Routes_Security_Runner_RouteDeletePasskey_Result,
  Routes_Security_Runner_RouteDeletePasskey_Returns,
  Routes_Security_Runner_RouteDeletePasskey_Session,
  Routes_Security_Runner_RouteDisableTotp_Request,
  Routes_Security_Runner_RouteDisableTotp_RequestBody,
  Routes_Security_Runner_RouteDisableTotp_Response,
  Routes_Security_Runner_RouteDisableTotp_Result,
  Routes_Security_Runner_RouteDisableTotp_Returns,
  Routes_Security_Runner_RouteDisableTotp_Session,
  Routes_Security_Runner_RouteEnableTotp_MatchedStep,
  Routes_Security_Runner_RouteEnableTotp_RecoveryCodes,
  Routes_Security_Runner_RouteEnableTotp_Request,
  Routes_Security_Runner_RouteEnableTotp_RequestBody,
  Routes_Security_Runner_RouteEnableTotp_Response,
  Routes_Security_Runner_RouteEnableTotp_Returns,
  Routes_Security_Runner_RouteEnableTotp_Secret,
  Routes_Security_Runner_RouteEnableTotp_Session,
  Routes_Security_Runner_RoutePasskeyOptions_Administrator,
  Routes_Security_Runner_RoutePasskeyOptions_CeremonyId,
  Routes_Security_Runner_RoutePasskeyOptions_Configuration,
  Routes_Security_Runner_RoutePasskeyOptions_Options,
  Routes_Security_Runner_RoutePasskeyOptions_Request,
  Routes_Security_Runner_RoutePasskeyOptions_RequestBody,
  Routes_Security_Runner_RoutePasskeyOptions_Response,
  Routes_Security_Runner_RoutePasskeyOptions_Returns,
  Routes_Security_Runner_RoutePasskeyOptions_Session,
  Routes_Security_Runner_RoutePasskeyVerify_Ceremony,
  Routes_Security_Runner_RoutePasskeyVerify_Configuration,
  Routes_Security_Runner_RoutePasskeyVerify_Credential,
  Routes_Security_Runner_RoutePasskeyVerify_Name,
  Routes_Security_Runner_RoutePasskeyVerify_Passkey,
  Routes_Security_Runner_RoutePasskeyVerify_Request,
  Routes_Security_Runner_RoutePasskeyVerify_RequestBody,
  Routes_Security_Runner_RoutePasskeyVerify_Response,
  Routes_Security_Runner_RoutePasskeyVerify_Result,
  Routes_Security_Runner_RoutePasskeyVerify_Returns,
  Routes_Security_Runner_RoutePasskeyVerify_Session,
  Routes_Security_Runner_RouteRecoveryCodes_RecoveryCodes,
  Routes_Security_Runner_RouteRecoveryCodes_Request,
  Routes_Security_Runner_RouteRecoveryCodes_RequestBody,
  Routes_Security_Runner_RouteRecoveryCodes_Response,
  Routes_Security_Runner_RouteRecoveryCodes_Returns,
  Routes_Security_Runner_RouteRecoveryCodes_Session,
  Routes_Security_Runner_RouteSecurity_Request,
  Routes_Security_Runner_RouteSecurity_Response,
  Routes_Security_Runner_RouteSecurity_Returns,
  Routes_Security_Runner_RouteSecurity_Session,
  Routes_Security_Runner_RouteTotpSetup_ExpiresAt,
  Routes_Security_Runner_RouteTotpSetup_QrCode,
  Routes_Security_Runner_RouteTotpSetup_Request,
  Routes_Security_Runner_RouteTotpSetup_RequestBody,
  Routes_Security_Runner_RouteTotpSetup_Response,
  Routes_Security_Runner_RouteTotpSetup_Returns,
  Routes_Security_Runner_RouteTotpSetup_Secret,
  Routes_Security_Runner_RouteTotpSetup_Session,
  Routes_Security_Runner_RouteTotpSetup_Uri,
  Routes_Security_Runner_State,
} from '@/types/routes/security.d.ts';

/**
 * Routes - Security.
 *
 * Lets the signed-in administrator manage their password and every sign-in method.
 * Each change needs a browser session and the current password, never an API token.
 *
 * @since 2.0.0
 */
export class Runner {
  /**
   * Routes - Security - Access.
   *
   * Restricts every route here to a signed-in browser session.
   * Mutations also need the session's CSRF header.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #access: Routes_Security_Runner_Access;

  /**
   * Routes - Security - Attempts.
   *
   * Counts wrong current passwords toward the same limit as sign-in.
   * A stolen session cannot guess the password without being stopped.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #attempts: Routes_Security_Runner_Attempts;

  /**
   * Routes - Security - State.
   *
   * Stores password hashes, authenticator secrets, recovery codes, and passkeys.
   * Secrets are encrypted or hashed before they reach SQLite.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #state: Routes_Security_Runner_State;

  /**
   * Routes - Security - Constructor.
   *
   * Binds the account routes to shared state, access checks, and the attempt counter.
   * No route is registered until register is called.
   *
   * @param {Routes_Security_Runner_Constructor_State}    state    - State.
   * @param {Routes_Security_Runner_Constructor_Access}   access   - Access.
   * @param {Routes_Security_Runner_Constructor_Attempts} attempts - Attempts.
   *
   * @since 2.0.0
   */
  public constructor(state: Routes_Security_Runner_Constructor_State, access: Routes_Security_Runner_Constructor_Access, attempts: Routes_Security_Runner_Constructor_Attempts) {
    this.#access = access;
    this.#attempts = attempts;
    this.#state = state;

    return;
  }

  /**
   * Routes - Security - Register.
   *
   * Installs the account routes behind the session check.
   * Paths match the other appliances so one interface client works with all of them.
   *
   * @param {Routes_Security_Runner_Register_App} app - App.
   *
   * @returns {Routes_Security_Runner_Register_Returns}
   *
   * @since 2.0.0
   */
  public register(app: Routes_Security_Runner_Register_App): Routes_Security_Runner_Register_Returns {
    app.get('/api/v1/auth/security', this.#access.requireSession(false), this['routeSecurity'].bind(this));

    app.post('/api/v1/auth/password', this.#access.requireSession(true), this['routeChangePassword'].bind(this));

    app.post('/api/v1/auth/username', this.#access.requireSession(true), this['routeChangeUsername'].bind(this));

    app.post('/api/v1/auth/totp/setup', this.#access.requireSession(true), handleAsync(this['routeTotpSetup'].bind(this)));

    app.post('/api/v1/auth/totp/enable', this.#access.requireSession(true), this['routeEnableTotp'].bind(this));

    app.post('/api/v1/auth/totp/disable', this.#access.requireSession(true), this['routeDisableTotp'].bind(this));

    app.post('/api/v1/auth/recovery-codes', this.#access.requireSession(true), this['routeRecoveryCodes'].bind(this));

    app.post('/api/v1/auth/passkeys/register/options', this.#access.requireSession(true), handleAsync(this['routePasskeyOptions'].bind(this)));

    app.post('/api/v1/auth/passkeys/register/verify', this.#access.requireSession(true), handleAsync(this['routePasskeyVerify'].bind(this)));

    app.delete('/api/v1/auth/passkeys/:passkeyId', this.#access.requireSession(true), this['routeDeletePasskey'].bind(this));

    return;
  }

  /**
   * Routes - Security - Confirm Password.
   *
   * Rechecks the current password and answers the request itself when it is wrong.
   * Wrong passwords count toward the sign-in limit for the caller's address.
   *
   * @param {Routes_Security_Runner_ConfirmPassword_Request}  request  - Request.
   * @param {Routes_Security_Runner_ConfirmPassword_Response} response - Response.
   * @param {Routes_Security_Runner_ConfirmPassword_Password} password - Password.
   * @param {Routes_Security_Runner_ConfirmPassword_Field}    field    - Field.
   *
   * @private
   *
   * @returns {Routes_Security_Runner_ConfirmPassword_Returns}
   *
   * @since 2.0.0
   */
  private confirmPassword(request: Routes_Security_Runner_ConfirmPassword_Request, response: Routes_Security_Runner_ConfirmPassword_Response, password: Routes_Security_Runner_ConfirmPassword_Password, field: Routes_Security_Runner_ConfirmPassword_Field): Routes_Security_Runner_ConfirmPassword_Returns {
    const attemptKey: Routes_Security_Runner_ConfirmPassword_AttemptKey = `sign-in:${getClientAddress(request)}`;
    const session: Routes_Security_Runner_ConfirmPassword_Session = response.locals['session'];

    if (this.#attempts.isAllowed(attemptKey) === false) {
      const retryAfterSeconds: Routes_Security_Runner_ConfirmPassword_RetryAfterSeconds = this.#attempts.getRetryAfterSeconds(attemptKey);

      response.set('Retry-After', String(retryAfterSeconds));

      sendError(response, 429, 'rate_limited', 'Too many attempts. Try again in 15 minutes.');

      return false;
    }

    if (this.#state.confirmAdministratorPassword(session['administratorId'], password) === false) {
      this.#attempts.recordFailure(attemptKey);

      sendError(response, 422, 'password_incorrect', 'That password is incorrect.', [{
        field,
        message: 'That password is incorrect.',
        path: [field],
      }]);

      return false;
    }

    return true;
  }

  /**
   * Routes - Security - Route Change Password.
   *
   * Replaces the password after confirming the current one.
   * Every other browser is signed out, and this one stays signed in.
   *
   * @param {Routes_Security_Runner_RouteChangePassword_Request}  request  - Request.
   * @param {Routes_Security_Runner_RouteChangePassword_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Security_Runner_RouteChangePassword_Returns}
   *
   * @since 2.0.0
   */
  private routeChangePassword(request: Routes_Security_Runner_RouteChangePassword_Request, response: Routes_Security_Runner_RouteChangePassword_Response): Routes_Security_Runner_RouteChangePassword_Returns {
    const requestBody: Routes_Security_Runner_RouteChangePassword_RequestBody = passwordChange.safeParse(request.body);
    const session: Routes_Security_Runner_RouteChangePassword_Session = response.locals['session'];

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Check the highlighted fields.');

      return;
    }

    if (this.confirmPassword(request, response, requestBody.data['currentPassword'], 'currentPassword') === false) {
      return;
    }

    this.#state.changeAdministratorPassword(session['administratorId'], requestBody.data['newPassword'], session['id'], session['username']);

    response.sendStatus(204);

    return;
  }

  /**
   * Routes - Security - Route Change Username.
   *
   * Renames the account after confirming the current password.
   * The new name applies to this and every other signed-in browser.
   *
   * @param {Routes_Security_Runner_RouteChangeUsername_Request}  request  - Request.
   * @param {Routes_Security_Runner_RouteChangeUsername_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Security_Runner_RouteChangeUsername_Returns}
   *
   * @since 2.0.0
   */
  private routeChangeUsername(request: Routes_Security_Runner_RouteChangeUsername_Request, response: Routes_Security_Runner_RouteChangeUsername_Response): Routes_Security_Runner_RouteChangeUsername_Returns {
    const requestBody: Routes_Security_Runner_RouteChangeUsername_RequestBody = usernameChange.safeParse(request.body);
    const session: Routes_Security_Runner_RouteChangeUsername_Session = response.locals['session'];

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Check the highlighted fields.');

      return;
    }

    if (this.confirmPassword(request, response, requestBody.data['password'], 'password') === false) {
      return;
    }

    const result: Routes_Security_Runner_RouteChangeUsername_Result = this.#state.changeAdministratorUsername(session['administratorId'], requestBody.data['username']);

    if (result === 'not-found') {
      sendError(response, 401, 'authentication_required', 'Sign in to continue.');

      return;
    }

    if (result === 'conflict') {
      sendError(response, 409, 'username_taken', 'That username is already in use.', [{
        field: 'username',
        message: 'That username is already in use.',
        path: ['username'],
      }]);

      return;
    }

    response.json({
      administrator: {
        id: result['id'],
        username: result['username'],
      },
    });

    return;
  }

  /**
   * Routes - Security - Route Delete Passkey.
   *
   * Removes one passkey after confirming the current password.
   * Other passkeys and the password keep working.
   *
   * @param {Routes_Security_Runner_RouteDeletePasskey_Request}  request  - Request.
   * @param {Routes_Security_Runner_RouteDeletePasskey_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Security_Runner_RouteDeletePasskey_Returns}
   *
   * @since 2.0.0
   */
  private routeDeletePasskey(request: Routes_Security_Runner_RouteDeletePasskey_Request, response: Routes_Security_Runner_RouteDeletePasskey_Response): Routes_Security_Runner_RouteDeletePasskey_Returns {
    const passkeyId: Routes_Security_Runner_RouteDeletePasskey_PasskeyId = (typeof request.params['passkeyId'] === 'string') ? request.params['passkeyId'] : undefined;
    const requestBody: Routes_Security_Runner_RouteDeletePasskey_RequestBody = passwordConfirmation.safeParse(request.body);
    const session: Routes_Security_Runner_RouteDeletePasskey_Session = response.locals['session'];

    if (passkeyId === undefined || passkeyCredentialIdentifier.safeParse(passkeyId).success === false) {
      sendError(response, 404, 'passkey_not_found', 'That passkey no longer exists.');

      return;
    }

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Enter your password.');

      return;
    }

    if (this.confirmPassword(request, response, requestBody.data['password'], 'password') === false) {
      return;
    }

    const result: Routes_Security_Runner_RouteDeletePasskey_Result = this.#state.removePasskey(session['administratorId'], passkeyId, session['username']);

    if (result === 'not-found') {
      sendError(response, 404, 'passkey_not_found', 'That passkey no longer exists.');

      return;
    }

    response.sendStatus(204);

    return;
  }

  /**
   * Routes - Security - Route Disable Totp.
   *
   * Turns off the authenticator app after confirming the current password.
   * Its recovery codes stop working at the same time.
   *
   * @param {Routes_Security_Runner_RouteDisableTotp_Request}  request  - Request.
   * @param {Routes_Security_Runner_RouteDisableTotp_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Security_Runner_RouteDisableTotp_Returns}
   *
   * @since 2.0.0
   */
  private routeDisableTotp(request: Routes_Security_Runner_RouteDisableTotp_Request, response: Routes_Security_Runner_RouteDisableTotp_Response): Routes_Security_Runner_RouteDisableTotp_Returns {
    const requestBody: Routes_Security_Runner_RouteDisableTotp_RequestBody = passwordConfirmation.safeParse(request.body);
    const session: Routes_Security_Runner_RouteDisableTotp_Session = response.locals['session'];

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Enter your password.');

      return;
    }

    if (this.confirmPassword(request, response, requestBody.data['password'], 'password') === false) {
      return;
    }

    const result: Routes_Security_Runner_RouteDisableTotp_Result = this.#state.disableTotp(session['administratorId'], session['username']);

    if (result === 'not-found') {
      sendError(response, 409, 'totp_disabled', 'The authenticator app is already off.');

      return;
    }

    response.sendStatus(204);

    return;
  }

  /**
   * Routes - Security - Route Enable Totp.
   *
   * Turns on the authenticator app once its first code matches the pending secret.
   * The response carries ten recovery codes that are never shown again.
   *
   * @param {Routes_Security_Runner_RouteEnableTotp_Request}  request  - Request.
   * @param {Routes_Security_Runner_RouteEnableTotp_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Security_Runner_RouteEnableTotp_Returns}
   *
   * @since 2.0.0
   */
  private routeEnableTotp(request: Routes_Security_Runner_RouteEnableTotp_Request, response: Routes_Security_Runner_RouteEnableTotp_Response): Routes_Security_Runner_RouteEnableTotp_Returns {
    const requestBody: Routes_Security_Runner_RouteEnableTotp_RequestBody = totpEnable.safeParse(request.body);
    const session: Routes_Security_Runner_RouteEnableTotp_Session = response.locals['session'];

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Enter the 6-digit code from your app.');

      return;
    }

    const secret: Routes_Security_Runner_RouteEnableTotp_Secret = this.#state.getTotpEnrollment(session['administratorId']);

    if (secret === undefined) {
      sendError(response, 409, 'totp_setup_expired', 'Authenticator setup expired. Start again.');

      return;
    }

    const matchedStep: Routes_Security_Runner_RouteEnableTotp_MatchedStep = verifyTotpCode(secret, requestBody.data['code']);

    if (matchedStep === undefined) {
      sendError(response, 422, 'code_invalid', 'That code doesn\'t match. Check the time on your device and try again.', [{
        field: 'code',
        message: 'That code doesn\'t match. Check the time on your device and try again.',
        path: ['code'],
      }]);

      return;
    }

    const recoveryCodes: Routes_Security_Runner_RouteEnableTotp_RecoveryCodes = this.#state.enableTotp(session['administratorId'], secret, matchedStep, session['username']);

    if (recoveryCodes === undefined) {
      sendError(response, 401, 'authentication_required', 'Sign in to continue.');

      return;
    }

    response.json({
      recoveryCodes,
    });

    return;
  }

  /**
   * Routes - Security - Route Passkey Options.
   *
   * Starts adding a passkey for this request's hostname after confirming the password.
   * Hostnames that browsers refuse for passkeys get a clear error instead.
   *
   * @param {Routes_Security_Runner_RoutePasskeyOptions_Request}  request  - Request.
   * @param {Routes_Security_Runner_RoutePasskeyOptions_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Security_Runner_RoutePasskeyOptions_Returns}
   *
   * @since 2.0.0
   */
  private async routePasskeyOptions(request: Routes_Security_Runner_RoutePasskeyOptions_Request, response: Routes_Security_Runner_RoutePasskeyOptions_Response): Routes_Security_Runner_RoutePasskeyOptions_Returns {
    const requestBody: Routes_Security_Runner_RoutePasskeyOptions_RequestBody = passkeyRegistrationStart.safeParse(request.body);
    const session: Routes_Security_Runner_RoutePasskeyOptions_Session = response.locals['session'];

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Check the highlighted fields.');

      return;
    }

    if (isPasskeyAvailable(request) === false) {
      sendError(response, 409, 'passkeys_unavailable', 'Passkeys need https and a domain name. Open this page at its domain, or use your password.');

      return;
    }

    if (this.confirmPassword(request, response, requestBody.data['password'], 'password') === false) {
      return;
    }

    const administrator: Routes_Security_Runner_RoutePasskeyOptions_Administrator = this.#state.getAdministratorById(session['administratorId']);

    if (administrator === undefined) {
      sendError(response, 401, 'authentication_required', 'Sign in to continue.');

      return;
    }

    const configuration: Routes_Security_Runner_RoutePasskeyOptions_Configuration = getWebauthnConfiguration(request, this.#state.getWebauthnRpName());
    const options: Routes_Security_Runner_RoutePasskeyOptions_Options = await createPasskeyRegistrationOptions(configuration, administrator, this.#state.getPasskeys(session['administratorId']));
    const ceremonyId: Routes_Security_Runner_RoutePasskeyOptions_CeremonyId = this.#state.createWebauthnCeremony({
      administratorId: session['administratorId'],
      challenge: options['challenge'],
      kind: 'registration',
      name: requestBody.data['name'],
      origin: configuration['origin'],
      rpId: configuration['rpId'],
    });

    response.json({
      ceremonyId,
      options,
    });

    return;
  }

  /**
   * Routes - Security - Route Passkey Verify.
   *
   * Verifies the new passkey against its stored ceremony and saves it.
   * The passkey is tied to the hostname the ceremony was started on.
   *
   * @param {Routes_Security_Runner_RoutePasskeyVerify_Request}  request  - Request.
   * @param {Routes_Security_Runner_RoutePasskeyVerify_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Security_Runner_RoutePasskeyVerify_Returns}
   *
   * @since 2.0.0
   */
  private async routePasskeyVerify(request: Routes_Security_Runner_RoutePasskeyVerify_Request, response: Routes_Security_Runner_RoutePasskeyVerify_Response): Routes_Security_Runner_RoutePasskeyVerify_Returns {
    const requestBody: Routes_Security_Runner_RoutePasskeyVerify_RequestBody = passkeyRegistrationVerify.safeParse(request.body);
    const session: Routes_Security_Runner_RoutePasskeyVerify_Session = response.locals['session'];

    if (requestBody.success === false) {
      sendError(response, 422, 'passkey_invalid', 'The passkey couldn\'t be verified. Try again.');

      return;
    }

    const ceremony: Routes_Security_Runner_RoutePasskeyVerify_Ceremony = this.#state.takeWebauthnCeremony(requestBody.data['ceremonyId'], 'registration');
    const configuration: Routes_Security_Runner_RoutePasskeyVerify_Configuration = getWebauthnConfiguration(request, this.#state.getWebauthnRpName());

    if (
      ceremony === undefined
      || ceremony['administratorId'] !== session['administratorId']
      || ceremony['rpId'] !== configuration['rpId']
      || ceremony['origin'] !== configuration['origin']
    ) {
      sendError(response, 409, 'passkey_ceremony_invalid', 'That passkey request expired. Try again.');

      return;
    }

    const credential: Routes_Security_Runner_RoutePasskeyVerify_Credential = await verifyPasskeyRegistration(configuration, requestBody.data['credential'], ceremony['challenge']);

    if (credential === undefined) {
      sendError(response, 422, 'passkey_invalid', 'The passkey couldn\'t be verified. Try again.');

      return;
    }

    const name: Routes_Security_Runner_RoutePasskeyVerify_Name = ceremony['name'] ?? 'Passkey';
    const result: Routes_Security_Runner_RoutePasskeyVerify_Result = this.#state.createPasskey(session['administratorId'], name, ceremony['rpId'], credential, session['username']);

    if (result === 'conflict') {
      sendError(response, 409, 'passkey_exists', 'This passkey is already added.');

      return;
    }

    if (result === 'not-found') {
      sendError(response, 401, 'authentication_required', 'Sign in to continue.');

      return;
    }

    const passkey: Routes_Security_Runner_RoutePasskeyVerify_Passkey = this.#state.getAdministratorSecurity(session['administratorId'])['passkeys'].find((summary) => summary['id'] === credential['id']);

    response.status(201).json(passkey);

    return;
  }

  /**
   * Routes - Security - Route Recovery Codes.
   *
   * Replaces every recovery code after confirming the current password.
   * The new codes are returned once, and the old ones stop working.
   *
   * @param {Routes_Security_Runner_RouteRecoveryCodes_Request}  request  - Request.
   * @param {Routes_Security_Runner_RouteRecoveryCodes_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Security_Runner_RouteRecoveryCodes_Returns}
   *
   * @since 2.0.0
   */
  private routeRecoveryCodes(request: Routes_Security_Runner_RouteRecoveryCodes_Request, response: Routes_Security_Runner_RouteRecoveryCodes_Response): Routes_Security_Runner_RouteRecoveryCodes_Returns {
    const requestBody: Routes_Security_Runner_RouteRecoveryCodes_RequestBody = passwordConfirmation.safeParse(request.body);
    const session: Routes_Security_Runner_RouteRecoveryCodes_Session = response.locals['session'];

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Enter your password.');

      return;
    }

    if (this.confirmPassword(request, response, requestBody.data['password'], 'password') === false) {
      return;
    }

    const recoveryCodes: Routes_Security_Runner_RouteRecoveryCodes_RecoveryCodes = this.#state.replaceRecoveryCodes(session['administratorId'], session['username']);

    if (recoveryCodes === undefined) {
      sendError(response, 409, 'totp_disabled', 'Turn on the authenticator app first.');

      return;
    }

    response.json({
      recoveryCodes,
    });

    return;
  }

  /**
   * Routes - Security - Route Security.
   *
   * Describes the account's sign-in methods for the password and sign-in page.
   * It also says whether passkeys work at the address the page was opened on.
   *
   * @param {Routes_Security_Runner_RouteSecurity_Request}  request  - Request.
   * @param {Routes_Security_Runner_RouteSecurity_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Security_Runner_RouteSecurity_Returns}
   *
   * @since 2.0.0
   */
  private routeSecurity(request: Routes_Security_Runner_RouteSecurity_Request, response: Routes_Security_Runner_RouteSecurity_Response): Routes_Security_Runner_RouteSecurity_Returns {
    const session: Routes_Security_Runner_RouteSecurity_Session = response.locals['session'];

    response.json({
      ...this.#state.getAdministratorSecurity(session['administratorId']),
      hostname: getRequestHostname(request),
      passkeysAvailable: isPasskeyAvailable(request),
    });

    return;
  }

  /**
   * Routes - Security - Route Totp Setup.
   *
   * Confirms the password, then returns a new secret and its QR code to scan.
   * Nothing changes for sign-in until the first code confirms the app.
   *
   * @param {Routes_Security_Runner_RouteTotpSetup_Request}  request  - Request.
   * @param {Routes_Security_Runner_RouteTotpSetup_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Security_Runner_RouteTotpSetup_Returns}
   *
   * @since 2.0.0
   */
  private async routeTotpSetup(request: Routes_Security_Runner_RouteTotpSetup_Request, response: Routes_Security_Runner_RouteTotpSetup_Response): Routes_Security_Runner_RouteTotpSetup_Returns {
    const requestBody: Routes_Security_Runner_RouteTotpSetup_RequestBody = passwordConfirmation.safeParse(request.body);
    const session: Routes_Security_Runner_RouteTotpSetup_Session = response.locals['session'];

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Enter your password.');

      return;
    }

    if (this.confirmPassword(request, response, requestBody.data['password'], 'password') === false) {
      return;
    }

    if (this.#state.hasTotp(session['administratorId']) === true) {
      sendError(response, 409, 'totp_enabled', 'The authenticator app is already on.');

      return;
    }

    const secret: Routes_Security_Runner_RouteTotpSetup_Secret = generateTotpSecret();
    const uri: Routes_Security_Runner_RouteTotpSetup_Uri = createTotpUri(secret, session['username']);
    const qrCode: Routes_Security_Runner_RouteTotpSetup_QrCode = await toDataURL(uri, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 240,
    });
    const expiresAt: Routes_Security_Runner_RouteTotpSetup_ExpiresAt = this.#state.startTotpEnrollment(session['administratorId'], secret);

    response.json({
      expiresAt,
      qrCode,
      secret,
      uri,
    });

    return;
  }
}
