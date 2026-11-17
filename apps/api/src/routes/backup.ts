import { z } from 'zod';

import {
  backupDocumentSchema,
  GrantStore,
} from '../lib/backup.js';
import {
  getClientLimitKey,
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
import {
  textBackupGrant,
  textBase64Url,
  textTotpCode,
} from '../lib/regex.js';
import {
  passkeyCredentialIdentifier,
  webauthnAuthenticationResponse,
} from '../lib/schema.js';
import { getPackageVersion } from '../lib/utility.js';

import type {
  Routes_Backup_HasSection,
  Routes_Backup_Runner_Access,
  Routes_Backup_Runner_Attempts,
  Routes_Backup_Runner_Ceremonies,
  Routes_Backup_Runner_Constructor_Access,
  Routes_Backup_Runner_Constructor_Attempts,
  Routes_Backup_Runner_Constructor_Grants,
  Routes_Backup_Runner_Constructor_State,
  Routes_Backup_Runner_Grants,
  Routes_Backup_Runner_IsRateLimited_AttemptKey,
  Routes_Backup_Runner_IsRateLimited_Request,
  Routes_Backup_Runner_IsRateLimited_Response,
  Routes_Backup_Runner_IsRateLimited_Returns,
  Routes_Backup_Runner_Register_App,
  Routes_Backup_Runner_Register_Returns,
  Routes_Backup_Runner_RejectIdentity_Field,
  Routes_Backup_Runner_RejectIdentity_Message,
  Routes_Backup_Runner_RejectIdentity_Request,
  Routes_Backup_Runner_RejectIdentity_Response,
  Routes_Backup_Runner_RejectIdentity_Returns,
  Routes_Backup_Runner_RouteConfirmation_Request,
  Routes_Backup_Runner_RouteConfirmation_RequestBody,
  Routes_Backup_Runner_RouteConfirmation_Response,
  Routes_Backup_Runner_RouteConfirmation_Returns,
  Routes_Backup_Runner_RouteConfirmation_Session,
  Routes_Backup_Runner_RouteExport_Date,
  Routes_Backup_Runner_RouteExport_Document,
  Routes_Backup_Runner_RouteExport_Request,
  Routes_Backup_Runner_RouteExport_RequestBody,
  Routes_Backup_Runner_RouteExport_Response,
  Routes_Backup_Runner_RouteExport_Returns,
  Routes_Backup_Runner_RouteExport_Session,
  Routes_Backup_Runner_RouteImport_Request,
  Routes_Backup_Runner_RouteImport_RequestBody,
  Routes_Backup_Runner_RouteImport_Response,
  Routes_Backup_Runner_RouteImport_Result,
  Routes_Backup_Runner_RouteImport_Returns,
  Routes_Backup_Runner_RouteImport_Session,
  Routes_Backup_Runner_RoutePasskeyOptions_CeremonyId,
  Routes_Backup_Runner_RoutePasskeyOptions_Configuration,
  Routes_Backup_Runner_RoutePasskeyOptions_ExpiresAt,
  Routes_Backup_Runner_RoutePasskeyOptions_Options,
  Routes_Backup_Runner_RoutePasskeyOptions_Request,
  Routes_Backup_Runner_RoutePasskeyOptions_RequestBody,
  Routes_Backup_Runner_RoutePasskeyOptions_Response,
  Routes_Backup_Runner_RoutePasskeyOptions_Returns,
  Routes_Backup_Runner_RoutePasskeyOptions_Session,
  Routes_Backup_Runner_RoutePasskeyVerify_Binding,
  Routes_Backup_Runner_RoutePasskeyVerify_Ceremony,
  Routes_Backup_Runner_RoutePasskeyVerify_Configuration,
  Routes_Backup_Runner_RoutePasskeyVerify_CredentialId,
  Routes_Backup_Runner_RoutePasskeyVerify_Passkey,
  Routes_Backup_Runner_RoutePasskeyVerify_Request,
  Routes_Backup_Runner_RoutePasskeyVerify_RequestBody,
  Routes_Backup_Runner_RoutePasskeyVerify_Response,
  Routes_Backup_Runner_RoutePasskeyVerify_Returns,
  Routes_Backup_Runner_RoutePasskeyVerify_Session,
  Routes_Backup_Runner_RoutePasskeyVerify_UpdateResult,
  Routes_Backup_Runner_RoutePasskeyVerify_Verification,
  Routes_Backup_Runner_RoutePreview_Preview,
  Routes_Backup_Runner_RoutePreview_Request,
  Routes_Backup_Runner_RoutePreview_RequestBody,
  Routes_Backup_Runner_RoutePreview_Response,
  Routes_Backup_Runner_RoutePreview_Returns,
  Routes_Backup_Runner_State,
} from '@/types/routes/backup.d.ts';

/**
 * Routes - Backup - Purpose Schema.
 *
 * Restricts confirmation grants to the operation that will consume them.
 * Export and import grants are never interchangeable.
 *
 * @since 2.1.0
 */
const purposeSchema = z.enum([
  'export',
  'import',
]);

/**
 * Routes - Backup - Confirmation Schema.
 *
 * Validates a password proof and the optional six-digit TOTP proof.
 * The state layer decides whether the current administrator requires that code.
 *
 * @since 2.1.0
 */
const confirmationSchema = z.object({
  code: z.string().trim().regex(textTotpCode, 'Enter the 6-digit code from your authenticator app.').optional(),
  password: z.string().min(1, 'Enter your password.').max(1024, 'Use 1024 characters or fewer.'),
  purpose: purposeSchema,
}).strict();

/**
 * Routes - Backup - Has Section.
 *
 * Requires an export to include at least one portable configuration section.
 * Empty exports would not produce a valid version-one document.
 *
 * @returns {boolean}
 *
 * @since 2.1.0
 */
const hasSection: Routes_Backup_HasSection = (sections) => Object.values(sections).some(Boolean);

/**
 * Routes - Backup - Sections Schema.
 *
 * Enumerates every section supported by the version-one portable format.
 * Unknown flags and an all-false selection are rejected.
 *
 * @since 2.1.0
 */
const sectionsSchema = z.object({
  accessTokens: z.boolean(),
  connection: z.boolean(),
  notifications: z.boolean(),
}).strict().refine(hasSection, { message: 'Choose at least one section.' });

/**
 * Routes - Backup - Grant Schema.
 *
 * Rejects malformed confirmation credentials before any digest lookup.
 * Raw grants are otherwise opaque to the route.
 *
 * @since 2.1.0
 */
const grantSchema = z.string().min(32).max(128).regex(textBackupGrant);

/**
 * Routes - Backup - Export Schema.
 *
 * Couples one scoped confirmation grant to the requested portable sections.
 * The grant is consumed before secret-bearing state is opened.
 *
 * @since 2.1.0
 */
const exportSchema = z.object({
  grant: grantSchema,
  sections: sectionsSchema,
}).strict();

/**
 * Routes - Backup - Preview Schema.
 *
 * Accepts only a complete strictly validated portable document.
 * Preview itself is read-only and does not require a confirmation grant.
 *
 * @since 2.1.0
 */
const previewSchema = z.object({
  document: backupDocumentSchema,
}).strict();

/**
 * Routes - Backup - Import Schema.
 *
 * Couples the reviewed document to a purpose-bound confirmation grant.
 * The same strict document schema runs again immediately before apply.
 *
 * @since 2.1.0
 */
const importSchema = z.object({
  document: backupDocumentSchema,
  grant: grantSchema,
}).strict();

/**
 * Routes - Backup - Passkey Options Schema.
 *
 * Binds the new WebAuthn ceremony to its eventual backup operation.
 * The binding is also tied to the active browser session in memory.
 *
 * @since 2.1.0
 */
const passkeyOptionsSchema = z.object({
  purpose: purposeSchema,
}).strict();

/**
 * Routes - Backup - Passkey Verify Schema.
 *
 * Validates the WebAuthn assertion and repeats the operation purpose.
 * Ceremony, session, and purpose must all match before verification.
 *
 * @since 2.1.0
 */
const passkeyVerifySchema = z.object({
  ceremonyId: z.string().min(32).max(128).regex(textBase64Url),
  credential: webauthnAuthenticationResponse,
  purpose: purposeSchema,
}).strict();

/**
 * Routes - Backup.
 *
 * Confirms the signed-in administrator, exports portable configuration, and applies
 * strictly validated imports. Every route refuses API tokens through requireSession.
 *
 * @since 2.1.0
 */
export class Runner {
  /**
   * Routes - Backup - Access.
   *
   * Restricts every backup operation to a browser session and CSRF proof.
   * Personal access tokens cannot reach these routes.
   *
   * @private
   *
   * @since 2.1.0
   */
  readonly #access: Routes_Backup_Runner_Access;

  /**
   * Routes - Backup - Attempts.
   *
   * Shares the normal sign-in rate-limit bucket for fresh identity proof.
   * Incorrect passwords, codes, and passkeys all record failures.
   *
   * @private
   *
   * @since 2.1.0
   */
  readonly #attempts: Routes_Backup_Runner_Attempts;

  /**
   * Routes - Backup - Ceremonies.
   *
   * Binds passkey ceremonies to one browser session and backup purpose.
   * Entries live only in process memory and expire after five minutes.
   *
   * @private
   *
   * @since 2.1.0
   */
  readonly #ceremonies: Routes_Backup_Runner_Ceremonies = new Map();

  /**
   * Routes - Backup - Grants.
   *
   * Stores digests of short-lived, one-use identity confirmation grants.
   * Raw grant values exist only in the matching browser requests.
   *
   * @private
   *
   * @since 2.1.0
   */
  readonly #grants: Routes_Backup_Runner_Grants;

  /**
   * Routes - Backup - State.
   *
   * Supplies authentication factors and transactional portable configuration state.
   * Secret-bearing values never enter route logs or caches.
   *
   * @private
   *
   * @since 2.1.0
   */
  readonly #state: Routes_Backup_Runner_State;

  /**
   * Routes - Backup - Constructor.
   *
   * Binds backup routes to shared state, access checks, attempts, and in-memory grants.
   * Tests can provide a deterministic grant store without changing production behavior.
   *
   * @param {Routes_Backup_Runner_Constructor_State}    state    - State.
   * @param {Routes_Backup_Runner_Constructor_Access}   access   - Access.
   * @param {Routes_Backup_Runner_Constructor_Attempts} attempts - Attempts.
   * @param {Routes_Backup_Runner_Constructor_Grants}   [grants] - Grants.
   *
   * @since 2.1.0
   */
  public constructor(state: Routes_Backup_Runner_Constructor_State, access: Routes_Backup_Runner_Constructor_Access, attempts: Routes_Backup_Runner_Constructor_Attempts, grants?: Routes_Backup_Runner_Constructor_Grants) {
    this.#access = access;
    this.#attempts = attempts;
    this.#grants = grants ?? new GrantStore();
    this.#state = state;

    return;
  }

  /**
   * Routes - Backup - Register.
   *
   * Installs every endpoint behind session-only access and CSRF validation.
   * Passkey handlers use the shared async error boundary.
   *
   * @param {Routes_Backup_Runner_Register_App} app - App.
   *
   * @returns {Routes_Backup_Runner_Register_Returns}
   *
   * @since 2.1.0
   */
  public register(app: Routes_Backup_Runner_Register_App): Routes_Backup_Runner_Register_Returns {
    app.post('/api/v1/backup/confirmation', this.#access.requireSession(true), this['routeConfirmation'].bind(this));

    app.post('/api/v1/backup/confirmation/passkey/options', this.#access.requireSession(true), handleAsync(this['routePasskeyOptions'].bind(this)));

    app.post('/api/v1/backup/confirmation/passkey/verify', this.#access.requireSession(true), handleAsync(this['routePasskeyVerify'].bind(this)));

    app.post('/api/v1/backup/export', this.#access.requireSession(true), this['routeExport'].bind(this));

    app.post('/api/v1/backup/imports/preview', this.#access.requireSession(true), this['routePreview'].bind(this));

    app.post('/api/v1/backup/imports', this.#access.requireSession(true), this['routeImport'].bind(this));

    return;
  }

  /**
   * Routes - Backup - Is Rate Limited.
   *
   * Checks the shared sign-in attempt bucket before fresh identity proof.
   * A limited client receives the remaining retry interval.
   *
   * @param {Routes_Backup_Runner_IsRateLimited_Request}  request  - Request.
   * @param {Routes_Backup_Runner_IsRateLimited_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Backup_Runner_IsRateLimited_Returns}
   *
   * @since 2.1.0
   */
  private isRateLimited(request: Routes_Backup_Runner_IsRateLimited_Request, response: Routes_Backup_Runner_IsRateLimited_Response): Routes_Backup_Runner_IsRateLimited_Returns {
    const attemptKey: Routes_Backup_Runner_IsRateLimited_AttemptKey = `sign-in:${getClientLimitKey(request)}`;

    if (this.#attempts.isAllowed(attemptKey) === true) {
      return false;
    }

    response.set('Retry-After', String(this.#attempts.getRetryAfterSeconds(attemptKey)));

    sendError(response, 429, 'rate_limited', 'Too many attempts. Try again in 15 minutes.');

    return true;
  }

  /**
   * Routes - Backup - Reject Identity.
   *
   * Records one failed proof and returns a field-level confirmation error.
   * The response never reveals stored factor details.
   *
   * @param {Routes_Backup_Runner_RejectIdentity_Request}  request  - Request.
   * @param {Routes_Backup_Runner_RejectIdentity_Response} response - Response.
   * @param {Routes_Backup_Runner_RejectIdentity_Field}    field    - Field.
   * @param {Routes_Backup_Runner_RejectIdentity_Message}  message  - Message.
   *
   * @private
   *
   * @returns {Routes_Backup_Runner_RejectIdentity_Returns}
   *
   * @since 2.1.0
   */
  private rejectIdentity(request: Routes_Backup_Runner_RejectIdentity_Request, response: Routes_Backup_Runner_RejectIdentity_Response, field: Routes_Backup_Runner_RejectIdentity_Field, message: Routes_Backup_Runner_RejectIdentity_Message): Routes_Backup_Runner_RejectIdentity_Returns {
    this.#attempts.recordFailure(`sign-in:${getClientLimitKey(request)}`);

    sendError(response, 422, 'identity_not_confirmed', message, [{
      field,
      message,
      path: [field],
    }]);

    return;
  }

  /**
   * Routes - Backup - Route Confirmation.
   *
   * Verifies the current administrator's password and required authenticator code.
   * Successful proof creates a five-minute grant for one requested operation.
   *
   * @param {Routes_Backup_Runner_RouteConfirmation_Request}  request  - Request.
   * @param {Routes_Backup_Runner_RouteConfirmation_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Backup_Runner_RouteConfirmation_Returns}
   *
   * @since 2.1.0
   */
  private routeConfirmation(request: Routes_Backup_Runner_RouteConfirmation_Request, response: Routes_Backup_Runner_RouteConfirmation_Response): Routes_Backup_Runner_RouteConfirmation_Returns {
    if (this.isRateLimited(request, response) === true) {
      return;
    }

    const requestBody: Routes_Backup_Runner_RouteConfirmation_RequestBody = confirmationSchema.safeParse(request.body);
    const session: Routes_Backup_Runner_RouteConfirmation_Session = response.locals['session'];

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Check the highlighted fields.');

      return;
    }

    if (this.#state.confirmAdministratorPassword(session['administratorId'], requestBody.data['password']) === false) {
      this.rejectIdentity(request, response, 'password', 'That password is incorrect.');

      return;
    }

    if (
      this.#state.hasTotp(session['administratorId']) === true
      && (
        requestBody.data['code'] === undefined
        || this.#state.verifyTotp(session['administratorId'], requestBody.data['code']) === false
      )
    ) {
      this.rejectIdentity(request, response, 'code', 'That authenticator code is incorrect.');

      return;
    }

    this.#attempts.reset(`sign-in:${getClientLimitKey(request)}`);

    response.json(this.#grants.issue(session['id'], requestBody.data['purpose']));

    return;
  }

  /**
   * Routes - Backup - Route Passkey Options.
   *
   * Starts a passkey ceremony bound to this session and backup operation.
   * Unsupported browser origins receive the normal passkey availability error.
   *
   * @param {Routes_Backup_Runner_RoutePasskeyOptions_Request}  request  - Request.
   * @param {Routes_Backup_Runner_RoutePasskeyOptions_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Backup_Runner_RoutePasskeyOptions_Returns}
   *
   * @since 2.1.0
   */
  private async routePasskeyOptions(request: Routes_Backup_Runner_RoutePasskeyOptions_Request, response: Routes_Backup_Runner_RoutePasskeyOptions_Response): Routes_Backup_Runner_RoutePasskeyOptions_Returns {
    const requestBody: Routes_Backup_Runner_RoutePasskeyOptions_RequestBody = passkeyOptionsSchema.safeParse(request.body);
    const session: Routes_Backup_Runner_RoutePasskeyOptions_Session = response.locals['session'];

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Choose what you are confirming.');

      return;
    }

    if (isPasskeyAvailable(request) === false) {
      sendError(response, 409, 'passkeys_unavailable', 'Passkeys need https and a domain name. Open this page at its domain, or use your password.');

      return;
    }

    const configuration: Routes_Backup_Runner_RoutePasskeyOptions_Configuration = getWebauthnConfiguration(request, this.#state.getWebauthnRpName());
    const options: Routes_Backup_Runner_RoutePasskeyOptions_Options = await createPasskeyAuthenticationOptions(configuration);
    const ceremonyId: Routes_Backup_Runner_RoutePasskeyOptions_CeremonyId = this.#state.createWebauthnCeremony({
      administratorId: session['administratorId'],
      challenge: options['challenge'],
      kind: 'authentication',
      origin: configuration['origin'],
      rpId: configuration['rpId'],
    });
    const expiresAt: Routes_Backup_Runner_RoutePasskeyOptions_ExpiresAt = Date.now() + (5 * 60 * 1000);

    this.#ceremonies.set(ceremonyId, {
      expiresAt,
      purpose: requestBody.data['purpose'],
      sessionId: session['id'],
    });

    response.json({
      ceremonyId,
      options,
    });

    return;
  }

  /**
   * Routes - Backup - Route Passkey Verify.
   *
   * Verifies a session- and purpose-bound passkey assertion for the administrator.
   * Successful proof creates the same one-use grant as password confirmation.
   *
   * @param {Routes_Backup_Runner_RoutePasskeyVerify_Request}  request  - Request.
   * @param {Routes_Backup_Runner_RoutePasskeyVerify_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Backup_Runner_RoutePasskeyVerify_Returns}
   *
   * @since 2.1.0
   */
  private async routePasskeyVerify(request: Routes_Backup_Runner_RoutePasskeyVerify_Request, response: Routes_Backup_Runner_RoutePasskeyVerify_Response): Routes_Backup_Runner_RoutePasskeyVerify_Returns {
    if (this.isRateLimited(request, response) === true) {
      return;
    }

    const requestBody: Routes_Backup_Runner_RoutePasskeyVerify_RequestBody = passkeyVerifySchema.safeParse(request.body);
    const session: Routes_Backup_Runner_RoutePasskeyVerify_Session = response.locals['session'];

    if (requestBody.success === false) {
      this.rejectIdentity(request, response, 'password', 'That passkey wasn\'t accepted.');

      return;
    }

    const binding: Routes_Backup_Runner_RoutePasskeyVerify_Binding = this.#ceremonies.get(requestBody.data['ceremonyId']);

    if (
      binding === undefined
      || binding['expiresAt'] <= Date.now()
      || binding['sessionId'] !== session['id']
      || binding['purpose'] !== requestBody.data['purpose']
    ) {
      if (binding !== undefined && binding['expiresAt'] <= Date.now()) {
        this.#ceremonies.delete(requestBody.data['ceremonyId']);
      }

      sendError(response, 409, 'passkey_ceremony_invalid', 'That passkey request expired. Try again.');

      return;
    }

    this.#ceremonies.delete(requestBody.data['ceremonyId']);

    const ceremony: Routes_Backup_Runner_RoutePasskeyVerify_Ceremony = this.#state.takeWebauthnCeremony(requestBody.data['ceremonyId'], 'authentication');
    const configuration: Routes_Backup_Runner_RoutePasskeyVerify_Configuration = getWebauthnConfiguration(request, this.#state.getWebauthnRpName());
    const credentialId: Routes_Backup_Runner_RoutePasskeyVerify_CredentialId = passkeyCredentialIdentifier.safeParse(requestBody.data['credential']['id']);
    const passkey: Routes_Backup_Runner_RoutePasskeyVerify_Passkey = (credentialId.success === true) ? this.#state.getPasskey(credentialId.data) : undefined;

    if (
      ceremony === undefined
      || ceremony['administratorId'] !== session['administratorId']
      || ceremony['rpId'] !== configuration['rpId']
      || ceremony['origin'] !== configuration['origin']
      || passkey === undefined
      || passkey['administratorId'] !== session['administratorId']
    ) {
      this.rejectIdentity(request, response, 'password', 'That passkey wasn\'t accepted.');

      return;
    }

    const verification: Routes_Backup_Runner_RoutePasskeyVerify_Verification = await verifyPasskeyAuthentication(configuration, requestBody.data['credential'], ceremony['challenge'], passkey);

    if (verification === undefined) {
      this.rejectIdentity(request, response, 'password', 'That passkey wasn\'t accepted.');

      return;
    }

    const updateResult: Routes_Backup_Runner_RoutePasskeyVerify_UpdateResult = this.#state.updatePasskeyUsage(passkey['id'], verification['counter'], verification['deviceType'], verification['backedUp'], ceremony['rpId']);

    if (updateResult !== 'updated') {
      this.rejectIdentity(request, response, 'password', 'That passkey wasn\'t accepted.');

      return;
    }

    this.#attempts.reset(`sign-in:${getClientLimitKey(request)}`);

    response.json(this.#grants.issue(session['id'], requestBody.data['purpose']));

    return;
  }

  /**
   * Routes - Backup - Route Export.
   *
   * Consumes an export grant before opening the selected portable secrets.
   * The response is named with the export date and is never cached here.
   *
   * @param {Routes_Backup_Runner_RouteExport_Request}  request  - Request.
   * @param {Routes_Backup_Runner_RouteExport_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Backup_Runner_RouteExport_Returns}
   *
   * @since 2.1.0
   */
  private routeExport(request: Routes_Backup_Runner_RouteExport_Request, response: Routes_Backup_Runner_RouteExport_Response): Routes_Backup_Runner_RouteExport_Returns {
    const requestBody: Routes_Backup_Runner_RouteExport_RequestBody = exportSchema.safeParse(request.body);
    const session: Routes_Backup_Runner_RouteExport_Session = response.locals['session'];

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Choose what to export.');

      return;
    }

    if (this.#grants.consume(requestBody.data['grant'], session['id'], 'export') === false) {
      sendError(response, 401, 'backup_confirmation_expired', 'Confirm it\'s you again.');

      return;
    }

    const document: Routes_Backup_Runner_RouteExport_Document = this.#state.createBackupDocument(requestBody.data['sections'], getPackageVersion());
    const date: Routes_Backup_Runner_RouteExport_Date = document['exportedAt'].slice(0, 10);

    response.set('Content-Disposition', `attachment; filename="pfsense-actions-export-${date}.json"`);

    response.json(document);

    return;
  }

  /**
   * Routes - Backup - Route Preview.
   *
   * Compares one strict portable file with current configuration without writing.
   * The wizard uses the plan to explain replacements, additions, and skips.
   *
   * @param {Routes_Backup_Runner_RoutePreview_Request}  request  - Request.
   * @param {Routes_Backup_Runner_RoutePreview_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Backup_Runner_RoutePreview_Returns}
   *
   * @since 2.1.0
   */
  private routePreview(request: Routes_Backup_Runner_RoutePreview_Request, response: Routes_Backup_Runner_RoutePreview_Response): Routes_Backup_Runner_RoutePreview_Returns {
    const requestBody: Routes_Backup_Runner_RoutePreview_RequestBody = previewSchema.safeParse(request.body);

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Choose a valid pfSense Actions export file.');

      return;
    }

    const preview: Routes_Backup_Runner_RoutePreview_Preview = this.#state.previewBackupImport(requestBody.data['document']);

    response.json(preview);

    return;
  }

  /**
   * Routes - Backup - Route Import.
   *
   * Consumes an import grant before applying the reviewed document atomically.
   * The state layer records one redacted configuration activity event.
   *
   * @param {Routes_Backup_Runner_RouteImport_Request}  request  - Request.
   * @param {Routes_Backup_Runner_RouteImport_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Backup_Runner_RouteImport_Returns}
   *
   * @since 2.1.0
   */
  private routeImport(request: Routes_Backup_Runner_RouteImport_Request, response: Routes_Backup_Runner_RouteImport_Response): Routes_Backup_Runner_RouteImport_Returns {
    const requestBody: Routes_Backup_Runner_RouteImport_RequestBody = importSchema.safeParse(request.body);
    const session: Routes_Backup_Runner_RouteImport_Session = response.locals['session'];

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Choose a valid pfSense Actions export file.');

      return;
    }

    if (this.#grants.consume(requestBody.data['grant'], session['id'], 'import') === false) {
      sendError(response, 401, 'backup_confirmation_expired', 'Confirm it\'s you again.');

      return;
    }

    const result: Routes_Backup_Runner_RouteImport_Result = this.#state.applyBackupImport(requestBody.data['document'], session['username']);

    response.json(result);

    return;
  }
}
