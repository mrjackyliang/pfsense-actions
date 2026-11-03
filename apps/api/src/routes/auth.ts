import {
  getClientAddress,
  getWebauthnConfiguration,
  handleAsync,
  isPasskeyAvailable,
  sendError,
  sendValidationError,
} from '../lib/http.js';
import {
  createPasskeyAuthenticationOptions,
  verifyPasskeyAuthentication,
} from '../lib/passkeys.js';
import { textTotpCode } from '../lib/regex.js';
import {
  passkeySignInVerify,
  setupClaim,
  signIn,
  signInSecondFactor,
} from '../lib/schema.js';

import type {
  Routes_Auth_Runner_Access,
  Routes_Auth_Runner_Attempts,
  Routes_Auth_Runner_Constructor_Access,
  Routes_Auth_Runner_Constructor_Attempts,
  Routes_Auth_Runner_Constructor_State,
  Routes_Auth_Runner_IsRateLimited_Key,
  Routes_Auth_Runner_IsRateLimited_Message,
  Routes_Auth_Runner_IsRateLimited_Response,
  Routes_Auth_Runner_IsRateLimited_RetryAfterSeconds,
  Routes_Auth_Runner_IsRateLimited_Returns,
  Routes_Auth_Runner_Register_App,
  Routes_Auth_Runner_Register_Returns,
  Routes_Auth_Runner_RejectPasskey_Key,
  Routes_Auth_Runner_RejectPasskey_Message,
  Routes_Auth_Runner_RejectPasskey_Response,
  Routes_Auth_Runner_RejectPasskey_Returns,
  Routes_Auth_Runner_RouteClaim_AttemptKey,
  Routes_Auth_Runner_RouteClaim_Request,
  Routes_Auth_Runner_RouteClaim_RequestBody,
  Routes_Auth_Runner_RouteClaim_Response,
  Routes_Auth_Runner_RouteClaim_Result,
  Routes_Auth_Runner_RouteClaim_Returns,
  Routes_Auth_Runner_RouteCurrentPrincipal_PersonalAccessToken,
  Routes_Auth_Runner_RouteCurrentPrincipal_Request,
  Routes_Auth_Runner_RouteCurrentPrincipal_Response,
  Routes_Auth_Runner_RouteCurrentPrincipal_Returns,
  Routes_Auth_Runner_RouteCurrentPrincipal_Session,
  Routes_Auth_Runner_RouteDismissRemovedSecrets_Request,
  Routes_Auth_Runner_RouteDismissRemovedSecrets_Response,
  Routes_Auth_Runner_RouteDismissRemovedSecrets_Returns,
  Routes_Auth_Runner_RouteDismissRemovedSecrets_Session,
  Routes_Auth_Runner_RouteLogin_Administrator,
  Routes_Auth_Runner_RouteLogin_AttemptKey,
  Routes_Auth_Runner_RouteLogin_Challenge,
  Routes_Auth_Runner_RouteLogin_IsOverlong,
  Routes_Auth_Runner_RouteLogin_Request,
  Routes_Auth_Runner_RouteLogin_RequestBody,
  Routes_Auth_Runner_RouteLogin_Response,
  Routes_Auth_Runner_RouteLogin_Returns,
  Routes_Auth_Runner_RouteLogout_Request,
  Routes_Auth_Runner_RouteLogout_Response,
  Routes_Auth_Runner_RouteLogout_Returns,
  Routes_Auth_Runner_RouteLogout_Session,
  Routes_Auth_Runner_RoutePasskeyOptions_CeremonyId,
  Routes_Auth_Runner_RoutePasskeyOptions_Configuration,
  Routes_Auth_Runner_RoutePasskeyOptions_Options,
  Routes_Auth_Runner_RoutePasskeyOptions_Request,
  Routes_Auth_Runner_RoutePasskeyOptions_Response,
  Routes_Auth_Runner_RoutePasskeyOptions_Returns,
  Routes_Auth_Runner_RoutePasskeyVerify_Administrator,
  Routes_Auth_Runner_RoutePasskeyVerify_AttemptKey,
  Routes_Auth_Runner_RoutePasskeyVerify_Ceremony,
  Routes_Auth_Runner_RoutePasskeyVerify_Configuration,
  Routes_Auth_Runner_RoutePasskeyVerify_Passkey,
  Routes_Auth_Runner_RoutePasskeyVerify_Request,
  Routes_Auth_Runner_RoutePasskeyVerify_RequestBody,
  Routes_Auth_Runner_RoutePasskeyVerify_Response,
  Routes_Auth_Runner_RoutePasskeyVerify_Returns,
  Routes_Auth_Runner_RoutePasskeyVerify_UpdateResult,
  Routes_Auth_Runner_RoutePasskeyVerify_Verification,
  Routes_Auth_Runner_RouteSecondFactor_Administrator,
  Routes_Auth_Runner_RouteSecondFactor_AttemptKey,
  Routes_Auth_Runner_RouteSecondFactor_Challenge,
  Routes_Auth_Runner_RouteSecondFactor_IsExhausted,
  Routes_Auth_Runner_RouteSecondFactor_IsOverlong,
  Routes_Auth_Runner_RouteSecondFactor_IsTotpCode,
  Routes_Auth_Runner_RouteSecondFactor_IsValid,
  Routes_Auth_Runner_RouteSecondFactor_Request,
  Routes_Auth_Runner_RouteSecondFactor_RequestBody,
  Routes_Auth_Runner_RouteSecondFactor_Response,
  Routes_Auth_Runner_RouteSecondFactor_Returns,
  Routes_Auth_Runner_RouteSetupStatus_Request,
  Routes_Auth_Runner_RouteSetupStatus_Response,
  Routes_Auth_Runner_RouteSetupStatus_Returns,
  Routes_Auth_Runner_State,
} from '@/types/routes/auth.d.ts';

/**
 * Routes - Auth.
 *
 * Handles first-run setup and every way of signing in and out.
 * Password, authenticator, recovery-code, and passkey failures share one per-address limit.
 *
 * @since 2.0.0
 */
export class Runner {
  /**
   * Routes - Auth - Access.
   *
   * Issues and clears browser sessions and checks who is calling.
   * Every sign-in method finishes through the same session issuer.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #access: Routes_Auth_Runner_Access;

  /**
   * Routes - Auth - Attempts.
   *
   * Counts failed attempts per client address across every sign-in method.
   * Setup codes use a separate count so a typo cannot lock out sign-in.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #attempts: Routes_Auth_Runner_Attempts;

  /**
   * Routes - Auth - State.
   *
   * Verifies credentials and stores sessions, challenges, and ceremonies.
   * All of them live in SQLite, so a restart keeps sign-ins working.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #state: Routes_Auth_Runner_State;

  /**
   * Routes - Auth - Constructor.
   *
   * Binds the sign-in routes to shared state, access checks, and the attempt counter.
   * No route is registered until register is called.
   *
   * @param {Routes_Auth_Runner_Constructor_State}    state    - State.
   * @param {Routes_Auth_Runner_Constructor_Access}   access   - Access.
   * @param {Routes_Auth_Runner_Constructor_Attempts} attempts - Attempts.
   *
   * @since 2.0.0
   */
  public constructor(state: Routes_Auth_Runner_Constructor_State, access: Routes_Auth_Runner_Constructor_Access, attempts: Routes_Auth_Runner_Constructor_Attempts) {
    this.#access = access;
    this.#attempts = attempts;
    this.#state = state;

    return;
  }

  /**
   * Routes - Auth - Register.
   *
   * Installs the public setup and sign-in routes and the signed-in identity routes.
   * Paths match the other appliances so one interface client works with all of them.
   *
   * @param {Routes_Auth_Runner_Register_App} app - App.
   *
   * @returns {Routes_Auth_Runner_Register_Returns}
   *
   * @since 2.0.0
   */
  public register(app: Routes_Auth_Runner_Register_App): Routes_Auth_Runner_Register_Returns {
    app.get('/api/v1/setup/status', this['routeSetupStatus'].bind(this));

    app.post('/api/v1/setup/claim', this['routeClaim'].bind(this));

    app.post('/api/v1/auth/login', this['routeLogin'].bind(this));

    app.post('/api/v1/auth/login/second-factor', this['routeSecondFactor'].bind(this));

    app.post('/api/v1/auth/passkeys/login/options', handleAsync(this['routePasskeyOptions'].bind(this)));

    app.post('/api/v1/auth/passkeys/login/verify', handleAsync(this['routePasskeyVerify'].bind(this)));

    app.post('/api/v1/auth/logout', this.#access.requireAuthentication(true), this['routeLogout'].bind(this));

    app.get('/api/v1/auth/me', this.#access.requireAuthentication(false), this['routeCurrentPrincipal'].bind(this));

    app.delete('/api/v1/auth/removed-secrets', this.#access.requireSession(true), this['routeDismissRemovedSecrets'].bind(this));

    return;
  }

  /**
   * Routes - Auth - Is Rate Limited.
   *
   * Refuses an attempt when its address already reached the failure limit.
   * The response tells the client how many seconds to wait.
   *
   * @param {Routes_Auth_Runner_IsRateLimited_Response} response - Response.
   * @param {Routes_Auth_Runner_IsRateLimited_Key}      key      - Key.
   * @param {Routes_Auth_Runner_IsRateLimited_Message}  message  - Message.
   *
   * @private
   *
   * @returns {Routes_Auth_Runner_IsRateLimited_Returns}
   *
   * @since 2.0.0
   */
  private isRateLimited(response: Routes_Auth_Runner_IsRateLimited_Response, key: Routes_Auth_Runner_IsRateLimited_Key, message: Routes_Auth_Runner_IsRateLimited_Message): Routes_Auth_Runner_IsRateLimited_Returns {
    if (this.#attempts.isAllowed(key) === true) {
      return false;
    }

    const retryAfterSeconds: Routes_Auth_Runner_IsRateLimited_RetryAfterSeconds = this.#attempts.getRetryAfterSeconds(key);

    response.set('Retry-After', String(retryAfterSeconds));

    sendError(response, 429, 'rate_limited', message);

    return true;
  }

  /**
   * Routes - Auth - Reject Passkey.
   *
   * Counts a failed passkey sign-in and returns the rejection for its situation.
   * The response never says which check failed.
   *
   * @param {Routes_Auth_Runner_RejectPasskey_Response} response - Response.
   * @param {Routes_Auth_Runner_RejectPasskey_Key}      key      - Key.
   * @param {Routes_Auth_Runner_RejectPasskey_Message}  message  - Message.
   *
   * @private
   *
   * @returns {Routes_Auth_Runner_RejectPasskey_Returns}
   *
   * @since 2.0.0
   */
  private rejectPasskey(response: Routes_Auth_Runner_RejectPasskey_Response, key: Routes_Auth_Runner_RejectPasskey_Key, message: Routes_Auth_Runner_RejectPasskey_Message): Routes_Auth_Runner_RejectPasskey_Returns {
    this.#attempts.recordFailure(key);

    this.#state.recordActivity('anonymous', 'sign-in', 'access', 'failed', 'Rejected a passkey sign-in');

    sendError(response, 401, 'passkey_rejected', message);

    return;
  }

  /**
   * Routes - Auth - Route Claim.
   *
   * Creates the first administrator with the setup code from the container log.
   * A correct code signs the new account in right away.
   *
   * @param {Routes_Auth_Runner_RouteClaim_Request}  request  - Request.
   * @param {Routes_Auth_Runner_RouteClaim_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Auth_Runner_RouteClaim_Returns}
   *
   * @since 2.0.0
   */
  private routeClaim(request: Routes_Auth_Runner_RouteClaim_Request, response: Routes_Auth_Runner_RouteClaim_Response): Routes_Auth_Runner_RouteClaim_Returns {
    const attemptKey: Routes_Auth_Runner_RouteClaim_AttemptKey = `setup:${getClientAddress(request)}`;

    if (this.isRateLimited(response, attemptKey, 'Too many setup attempts. Try again in 15 minutes.') === true) {
      return;
    }

    if (this.#state.hasAdministrator() === true) {
      sendError(response, 409, 'claim_unavailable', 'Setup is already complete. Sign in instead.');

      return;
    }

    const requestBody: Routes_Auth_Runner_RouteClaim_RequestBody = setupClaim.safeParse(request.body);

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Check the highlighted fields.');

      return;
    }

    const result: Routes_Auth_Runner_RouteClaim_Result = this.#state.claimInstallation(requestBody.data['claimCode'], requestBody.data['username'], requestBody.data['password']);

    if (result === 'invalid') {
      this.#attempts.recordFailure(attemptKey);

      this.#state.recordActivity('anonymous', 'installation-claim', 'access', 'failed', 'Rejected a setup code');

      sendError(response, 401, 'claim_invalid', 'That setup code is wrong or expired. Restart the container to print a new one.', [{
        field: 'claimCode',
        message: 'That setup code is wrong or expired. Restart the container to print a new one.',
        path: ['claimCode'],
      }]);

      return;
    }

    this.#attempts.reset(attemptKey);

    this.#access.issueSession(request, response, result, 201);

    return;
  }

  /**
   * Routes - Auth - Route Current Principal.
   *
   * Describes the signed-in browser session or the API token making the request.
   * The interface calls it on load to decide between the console and sign-in.
   *
   * @param {Routes_Auth_Runner_RouteCurrentPrincipal_Request}  _request - Request.
   * @param {Routes_Auth_Runner_RouteCurrentPrincipal_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Auth_Runner_RouteCurrentPrincipal_Returns}
   *
   * @since 2.0.0
   */
  private routeCurrentPrincipal(_request: Routes_Auth_Runner_RouteCurrentPrincipal_Request, response: Routes_Auth_Runner_RouteCurrentPrincipal_Response): Routes_Auth_Runner_RouteCurrentPrincipal_Returns {
    const personalAccessToken: Routes_Auth_Runner_RouteCurrentPrincipal_PersonalAccessToken = response.locals['personalAccessToken'];
    const session: Routes_Auth_Runner_RouteCurrentPrincipal_Session = response.locals['session'];

    if (personalAccessToken !== undefined) {
      response.json({
        authenticationType: 'token',
        id: personalAccessToken['id'],
        name: personalAccessToken['name'],
        scopes: personalAccessToken['scopes'],
      });

      return;
    }

    if (session === undefined) {
      sendError(response, 401, 'authentication_required', 'Sign in to continue.');

      return;
    }

    response.json({
      administratorId: session['administratorId'],
      authenticationType: 'session',
      id: session['id'],
      removedSecrets: this.#state.getRemovedSecrets(session['administratorId']),
      username: session['username'],
    });

    return;
  }

  /**
   * Routes - Auth - Route Dismiss Removed Secrets.
   *
   * Hides the console notice about secrets a lost encryption key took.
   * Only a signed-in browser session can dismiss it.
   *
   * @param {Routes_Auth_Runner_RouteDismissRemovedSecrets_Request}  _request - Request.
   * @param {Routes_Auth_Runner_RouteDismissRemovedSecrets_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Auth_Runner_RouteDismissRemovedSecrets_Returns}
   *
   * @since 2.0.0
   */
  private routeDismissRemovedSecrets(_request: Routes_Auth_Runner_RouteDismissRemovedSecrets_Request, response: Routes_Auth_Runner_RouteDismissRemovedSecrets_Response): Routes_Auth_Runner_RouteDismissRemovedSecrets_Returns {
    const session: Routes_Auth_Runner_RouteDismissRemovedSecrets_Session = response.locals['session'];

    this.#state.dismissRemovedSecrets(session['administratorId']);

    response.sendStatus(204);

    return;
  }

  /**
   * Routes - Auth - Route Login.
   *
   * Checks the username and password, then asks for a second factor when one is on.
   * Wrong credentials share one response that never says which field was wrong.
   *
   * @param {Routes_Auth_Runner_RouteLogin_Request}  request  - Request.
   * @param {Routes_Auth_Runner_RouteLogin_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Auth_Runner_RouteLogin_Returns}
   *
   * @since 2.0.0
   */
  private routeLogin(request: Routes_Auth_Runner_RouteLogin_Request, response: Routes_Auth_Runner_RouteLogin_Response): Routes_Auth_Runner_RouteLogin_Returns {
    const attemptKey: Routes_Auth_Runner_RouteLogin_AttemptKey = `sign-in:${getClientAddress(request)}`;

    if (this.isRateLimited(response, attemptKey, 'Too many sign-in attempts. Try again in 15 minutes.') === true) {
      return;
    }

    const requestBody: Routes_Auth_Runner_RouteLogin_RequestBody = signIn.safeParse(request.body);

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Enter your username and password.');

      return;
    }

    // Values longer than any account allows can't be right, so they skip the hash check.
    const isOverlong: Routes_Auth_Runner_RouteLogin_IsOverlong = requestBody.data['username'].length > 64 || requestBody.data['password'].length > 1024;
    const administrator: Routes_Auth_Runner_RouteLogin_Administrator = (isOverlong === true) ? undefined : this.#state.authenticateAdministrator(requestBody.data['username'], requestBody.data['password']);

    if (administrator === undefined) {
      this.#attempts.recordFailure(attemptKey);

      this.#state.recordActivity('anonymous', 'sign-in', 'access', 'failed', 'Rejected a password sign-in');

      sendError(response, 401, 'credentials_invalid', 'The username or password is incorrect.');

      return;
    }

    if (this.#state.hasTotp(administrator['id']) === true) {
      const challenge: Routes_Auth_Runner_RouteLogin_Challenge = this.#state.createSignInChallenge(administrator['id']);

      response.json({
        challenge: challenge['challenge'],
        expiresAt: challenge['expiresAt'],
        status: 'second_factor_required',
      });

      return;
    }

    this.#attempts.reset(attemptKey);

    this.#state.recordActivity(administrator['username'], 'sign-in', 'access', 'succeeded', 'Signed in with a password');

    this.#access.issueSession(request, response, administrator, 200);

    return;
  }

  /**
   * Routes - Auth - Route Logout.
   *
   * Deletes the stored browser session and expires its cookies.
   * Token callers have no session, so the call is harmless for them.
   *
   * @param {Routes_Auth_Runner_RouteLogout_Request}  request  - Request.
   * @param {Routes_Auth_Runner_RouteLogout_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Auth_Runner_RouteLogout_Returns}
   *
   * @since 2.0.0
   */
  private routeLogout(request: Routes_Auth_Runner_RouteLogout_Request, response: Routes_Auth_Runner_RouteLogout_Response): Routes_Auth_Runner_RouteLogout_Returns {
    const session: Routes_Auth_Runner_RouteLogout_Session = response.locals['session'];

    if (session !== undefined) {
      this.#state.deleteSession(session['id']);

      this.#state.recordActivity(session['username'], 'sign-out', 'access', 'succeeded', 'Signed out of the console');

      this.#access.clearSession(request, response);
    }

    response.sendStatus(204);

    return;
  }

  /**
   * Routes - Auth - Route Passkey Options.
   *
   * Starts a username-less passkey sign-in for this request's hostname.
   * Hostnames that browsers refuse for passkeys get a clear error instead.
   *
   * @param {Routes_Auth_Runner_RoutePasskeyOptions_Request}  request  - Request.
   * @param {Routes_Auth_Runner_RoutePasskeyOptions_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Auth_Runner_RoutePasskeyOptions_Returns}
   *
   * @since 2.0.0
   */
  private async routePasskeyOptions(request: Routes_Auth_Runner_RoutePasskeyOptions_Request, response: Routes_Auth_Runner_RoutePasskeyOptions_Response): Routes_Auth_Runner_RoutePasskeyOptions_Returns {
    if (isPasskeyAvailable(request) === false) {
      sendError(response, 409, 'passkeys_unavailable', 'Passkeys need https and a domain name. Open this page at its domain, or use your password.');

      return;
    }

    const configuration: Routes_Auth_Runner_RoutePasskeyOptions_Configuration = getWebauthnConfiguration(request, this.#state.getWebauthnRpName());
    const options: Routes_Auth_Runner_RoutePasskeyOptions_Options = await createPasskeyAuthenticationOptions(configuration);
    const ceremonyId: Routes_Auth_Runner_RoutePasskeyOptions_CeremonyId = this.#state.createWebauthnCeremony({
      challenge: options['challenge'],
      kind: 'authentication',
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
   * Routes - Auth - Route Passkey Verify.
   *
   * Verifies a passkey assertion against its stored ceremony and signs the account in.
   * The hostname and origin must match the ones the ceremony was started on.
   *
   * @param {Routes_Auth_Runner_RoutePasskeyVerify_Request}  request  - Request.
   * @param {Routes_Auth_Runner_RoutePasskeyVerify_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Auth_Runner_RoutePasskeyVerify_Returns}
   *
   * @since 2.0.0
   */
  private async routePasskeyVerify(request: Routes_Auth_Runner_RoutePasskeyVerify_Request, response: Routes_Auth_Runner_RoutePasskeyVerify_Response): Routes_Auth_Runner_RoutePasskeyVerify_Returns {
    const attemptKey: Routes_Auth_Runner_RoutePasskeyVerify_AttemptKey = `sign-in:${getClientAddress(request)}`;

    if (this.isRateLimited(response, attemptKey, 'Too many sign-in attempts. Try again in 15 minutes.') === true) {
      return;
    }

    const requestBody: Routes_Auth_Runner_RoutePasskeyVerify_RequestBody = passkeySignInVerify.safeParse(request.body);

    if (requestBody.success === false) {
      this.rejectPasskey(response, attemptKey, 'That passkey wasn\'t accepted.');

      return;
    }

    const ceremony: Routes_Auth_Runner_RoutePasskeyVerify_Ceremony = this.#state.takeWebauthnCeremony(requestBody.data['ceremonyId'], 'authentication');
    const configuration: Routes_Auth_Runner_RoutePasskeyVerify_Configuration = getWebauthnConfiguration(request, this.#state.getWebauthnRpName());

    if (ceremony === undefined) {
      sendError(response, 409, 'passkey_ceremony_invalid', 'That passkey request expired. Try again.');

      return;
    }

    if (
      ceremony['rpId'] !== configuration['rpId']
      || ceremony['origin'] !== configuration['origin']
    ) {
      this.rejectPasskey(response, attemptKey, 'That passkey wasn\'t accepted. It may belong to a different address for this app.');

      return;
    }

    const passkey: Routes_Auth_Runner_RoutePasskeyVerify_Passkey = this.#state.getPasskey(requestBody.data['credential']['id']);

    if (passkey === undefined) {
      this.rejectPasskey(response, attemptKey, 'That passkey wasn\'t accepted. It may belong to a different address for this app.');

      return;
    }

    const verification: Routes_Auth_Runner_RoutePasskeyVerify_Verification = await verifyPasskeyAuthentication(configuration, requestBody.data['credential'], ceremony['challenge'], passkey);

    if (verification === undefined) {
      this.rejectPasskey(response, attemptKey, 'That passkey wasn\'t accepted. It may belong to a different address for this app.');

      return;
    }

    const updateResult: Routes_Auth_Runner_RoutePasskeyVerify_UpdateResult = this.#state.updatePasskeyUsage(passkey['id'], verification['counter'], verification['deviceType'], verification['backedUp'], ceremony['rpId']);
    const administrator: Routes_Auth_Runner_RoutePasskeyVerify_Administrator = this.#state.getAdministratorById(passkey['administratorId']);

    if (updateResult !== 'updated' || administrator === undefined) {
      this.rejectPasskey(response, attemptKey, 'That passkey wasn\'t accepted.');

      return;
    }

    this.#attempts.reset(attemptKey);

    this.#state.recordActivity(administrator['username'], 'sign-in', 'access', 'succeeded', `Signed in with passkey ${passkey['name']}`);

    this.#access.issueSession(request, response, administrator, 200);

    return;
  }

  /**
   * Routes - Auth - Route Second Factor.
   *
   * Finishes a password sign-in with an authenticator code or a recovery code.
   * Six digits are checked as an authenticator code and anything else as a recovery code.
   *
   * @param {Routes_Auth_Runner_RouteSecondFactor_Request}  request  - Request.
   * @param {Routes_Auth_Runner_RouteSecondFactor_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Auth_Runner_RouteSecondFactor_Returns}
   *
   * @since 2.0.0
   */
  private routeSecondFactor(request: Routes_Auth_Runner_RouteSecondFactor_Request, response: Routes_Auth_Runner_RouteSecondFactor_Response): Routes_Auth_Runner_RouteSecondFactor_Returns {
    const attemptKey: Routes_Auth_Runner_RouteSecondFactor_AttemptKey = `sign-in:${getClientAddress(request)}`;

    if (this.isRateLimited(response, attemptKey, 'Too many sign-in attempts. Try again in 15 minutes.') === true) {
      return;
    }

    const requestBody: Routes_Auth_Runner_RouteSecondFactor_RequestBody = signInSecondFactor.safeParse(request.body);

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Enter a code.');

      return;
    }

    const challenge: Routes_Auth_Runner_RouteSecondFactor_Challenge = this.#state.getSignInChallenge(requestBody.data['challenge']);

    if (challenge === undefined) {
      sendError(response, 401, 'challenge_expired', 'Your sign-in timed out. Enter your password again.');

      return;
    }

    const isTotpCode: Routes_Auth_Runner_RouteSecondFactor_IsTotpCode = textTotpCode.test(requestBody.data['code']);
    const isOverlong: Routes_Auth_Runner_RouteSecondFactor_IsOverlong = requestBody.data['code'].length > 64;
    let isValid: Routes_Auth_Runner_RouteSecondFactor_IsValid = false;

    if (isTotpCode === true) {
      isValid = this.#state.verifyTotp(challenge['administratorId'], requestBody.data['code']);
    } else if (isOverlong === false) {
      isValid = this.#state.consumeRecoveryCode(challenge['administratorId'], requestBody.data['code']);
    }

    if (isValid === false) {
      this.#attempts.recordFailure(attemptKey);

      const isExhausted: Routes_Auth_Runner_RouteSecondFactor_IsExhausted = this.#state.recordSignInChallengeFailure(requestBody.data['challenge']);

      this.#state.recordActivity('anonymous', 'sign-in', 'access', 'failed', 'Rejected a second-factor code');

      if (isExhausted === true) {
        sendError(response, 401, 'challenge_expired', 'Too many wrong codes. Enter your password again.');

        return;
      }

      sendError(response, 401, 'code_invalid', 'That code doesn\'t match. Try the current code, or a recovery code.', [{
        field: 'code',
        message: 'That code doesn\'t match. Try the current code, or a recovery code.',
        path: ['code'],
      }]);

      return;
    }

    const administrator: Routes_Auth_Runner_RouteSecondFactor_Administrator = this.#state.getAdministratorById(challenge['administratorId']);

    this.#state.deleteSignInChallenge(requestBody.data['challenge']);

    if (administrator === undefined) {
      sendError(response, 401, 'challenge_expired', 'Your sign-in timed out. Enter your password again.');

      return;
    }

    this.#attempts.reset(attemptKey);

    this.#state.recordActivity(administrator['username'], 'sign-in', 'access', 'succeeded', (isTotpCode === true) ? 'Signed in with a password and authenticator code' : 'Signed in with a password and recovery code');

    this.#access.issueSession(request, response, administrator, 200);

    return;
  }

  /**
   * Routes - Auth - Route Setup Status.
   *
   * Tells the interface whether to show the setup screen or the sign-in screen.
   * The response holds no code and no account details.
   *
   * @param {Routes_Auth_Runner_RouteSetupStatus_Request}  _request - Request.
   * @param {Routes_Auth_Runner_RouteSetupStatus_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Auth_Runner_RouteSetupStatus_Returns}
   *
   * @since 2.0.0
   */
  private routeSetupStatus(_request: Routes_Auth_Runner_RouteSetupStatus_Request, response: Routes_Auth_Runner_RouteSetupStatus_Response): Routes_Auth_Runner_RouteSetupStatus_Returns {
    response.json(this.#state.getSetupStatus());

    return;
  }
}
