import {
  digestsEqual,
  digestValue,
  getBearerToken,
  hasPersonalAccessTokenScope,
} from './auth.js';
import {
  buildCookie,
  getRequestScheme,
  readCookie,
  sendError,
} from './http.js';
import {
  textCsrfToken,
  textSessionToken,
} from './regex.js';

import type {
  Lib_Access_Runner_ClearSession_Request,
  Lib_Access_Runner_ClearSession_Response,
  Lib_Access_Runner_ClearSession_Returns,
  Lib_Access_Runner_ClearSession_Secure,
  Lib_Access_Runner_Constructor_State,
  Lib_Access_Runner_CsrfCookieName,
  Lib_Access_Runner_HasValidCsrf_CookieToken,
  Lib_Access_Runner_HasValidCsrf_HeaderToken,
  Lib_Access_Runner_HasValidCsrf_Request,
  Lib_Access_Runner_HasValidCsrf_Returns,
  Lib_Access_Runner_HasValidCsrf_Session,
  Lib_Access_Runner_IssueSession_Administrator,
  Lib_Access_Runner_IssueSession_CreatedSession,
  Lib_Access_Runner_IssueSession_MaxAge,
  Lib_Access_Runner_IssueSession_Request,
  Lib_Access_Runner_IssueSession_Response,
  Lib_Access_Runner_IssueSession_Returns,
  Lib_Access_Runner_IssueSession_Secure,
  Lib_Access_Runner_IssueSession_Status,
  Lib_Access_Runner_RequireAuthentication_CallbackReturns,
  Lib_Access_Runner_RequireAuthentication_Mutation,
  Lib_Access_Runner_RequireAuthentication_Next,
  Lib_Access_Runner_RequireAuthentication_PersonalAccessToken,
  Lib_Access_Runner_RequireAuthentication_RawToken,
  Lib_Access_Runner_RequireAuthentication_Request,
  Lib_Access_Runner_RequireAuthentication_Response,
  Lib_Access_Runner_RequireAuthentication_Returns,
  Lib_Access_Runner_RequireSession_CallbackReturns,
  Lib_Access_Runner_RequireSession_Mutation,
  Lib_Access_Runner_RequireSession_Next,
  Lib_Access_Runner_RequireSession_Request,
  Lib_Access_Runner_RequireSession_Response,
  Lib_Access_Runner_RequireSession_Returns,
  Lib_Access_Runner_RequireSession_Session,
  Lib_Access_Runner_RequireToken_CallbackReturns,
  Lib_Access_Runner_RequireToken_Next,
  Lib_Access_Runner_RequireToken_PersonalAccessToken,
  Lib_Access_Runner_RequireToken_RawToken,
  Lib_Access_Runner_RequireToken_Request,
  Lib_Access_Runner_RequireToken_Response,
  Lib_Access_Runner_RequireToken_Returns,
  Lib_Access_Runner_RequireToken_Scope,
  Lib_Access_Runner_ResolveSession_Request,
  Lib_Access_Runner_ResolveSession_Returns,
  Lib_Access_Runner_ResolveSession_SessionToken,
  Lib_Access_Runner_SessionCookieName,
  Lib_Access_Runner_State,
} from '@/types/lib/access.d.ts';

/**
 * Lib - Access.
 *
 * Decides who is calling: a signed-in browser session or a scoped API token.
 * A bearer token always wins over a session cookie on the same request.
 *
 * @since 2.0.0
 */
export class Runner {
  /**
   * Lib - Access - Csrf Cookie Name.
   *
   * Names the readable cookie the interface copies into the X-CSRF-Token header.
   * Other sites cannot read it, so they cannot forge that header.
   *
   * @private
   *
   * @since 2.0.0
   */
  static readonly #csrfCookieName: Lib_Access_Runner_CsrfCookieName = 'pfa_csrf';

  /**
   * Lib - Access - Session Cookie Name.
   *
   * Names the HttpOnly cookie that carries the opaque browser session.
   * Scripts on the page can never read its value.
   *
   * @private
   *
   * @since 2.0.0
   */
  static readonly #sessionCookieName: Lib_Access_Runner_SessionCookieName = 'pfa_session';

  /**
   * Lib - Access - State.
   *
   * Resolves sessions and tokens against current SQLite rows.
   * Revoked tokens and signed-out sessions stop working on the next request.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #state: Lib_Access_Runner_State;

  /**
   * Lib - Access - Constructor.
   *
   * Binds access checks to the shared controller state.
   * One instance serves every route module.
   *
   * @param {Lib_Access_Runner_Constructor_State} state - State.
   *
   * @since 2.0.0
   */
  public constructor(state: Lib_Access_Runner_Constructor_State) {
    this.#state = state;

    return;
  }

  /**
   * Lib - Access - Clear Session.
   *
   * Expires both session cookies in the browser.
   * The stored session itself is deleted by the caller.
   *
   * @param {Lib_Access_Runner_ClearSession_Request}  request  - Request.
   * @param {Lib_Access_Runner_ClearSession_Response} response - Response.
   *
   * @returns {Lib_Access_Runner_ClearSession_Returns}
   *
   * @since 2.0.0
   */
  public clearSession(request: Lib_Access_Runner_ClearSession_Request, response: Lib_Access_Runner_ClearSession_Response): Lib_Access_Runner_ClearSession_Returns {
    const secure: Lib_Access_Runner_ClearSession_Secure = getRequestScheme(request) === 'https';

    response.append('Set-Cookie', buildCookie(Runner.#sessionCookieName, '', {
      httpOnly: true,
      maxAge: 0,
      secure,
    }));

    response.append('Set-Cookie', buildCookie(Runner.#csrfCookieName, '', {
      httpOnly: false,
      maxAge: 0,
      secure,
    }));

    return;
  }

  /**
   * Lib - Access - Issue Session.
   *
   * Creates a stored session for a verified administrator and sets both cookies.
   * Every sign-in method ends here, so each gets the same CSRF protection.
   *
   * @param {Lib_Access_Runner_IssueSession_Request}       request       - Request.
   * @param {Lib_Access_Runner_IssueSession_Response}      response      - Response.
   * @param {Lib_Access_Runner_IssueSession_Administrator} administrator - Administrator.
   * @param {Lib_Access_Runner_IssueSession_Status}        status        - Status.
   *
   * @returns {Lib_Access_Runner_IssueSession_Returns}
   *
   * @since 2.0.0
   */
  public issueSession(request: Lib_Access_Runner_IssueSession_Request, response: Lib_Access_Runner_IssueSession_Response, administrator: Lib_Access_Runner_IssueSession_Administrator, status: Lib_Access_Runner_IssueSession_Status): Lib_Access_Runner_IssueSession_Returns {
    const createdSession: Lib_Access_Runner_IssueSession_CreatedSession = this.#state.createSession(administrator['id']);
    const maxAge: Lib_Access_Runner_IssueSession_MaxAge = Math.floor((Date.parse(createdSession['expiresAt']) - Date.now()) / 1000);
    const secure: Lib_Access_Runner_IssueSession_Secure = getRequestScheme(request) === 'https';

    response.append('Set-Cookie', buildCookie(Runner.#sessionCookieName, createdSession['sessionToken'], {
      httpOnly: true,
      maxAge,
      secure,
    }));

    response.append('Set-Cookie', buildCookie(Runner.#csrfCookieName, createdSession['csrfToken'], {
      httpOnly: false,
      maxAge,
      secure,
    }));

    response.status(status).json({
      administrator: {
        id: administrator['id'],
        username: administrator['username'],
      },
      csrfToken: createdSession['csrfToken'],
      expiresAt: createdSession['expiresAt'],
      status: 'authenticated',
    });

    return;
  }

  /**
   * Lib - Access - Require Authentication.
   *
   * Accepts either a valid API token or a signed-in browser session.
   * Session mutations still need the CSRF header.
   *
   * @param {Lib_Access_Runner_RequireAuthentication_Mutation} mutation - Mutation.
   *
   * @returns {Lib_Access_Runner_RequireAuthentication_Returns}
   *
   * @since 2.0.0
   */
  public requireAuthentication(mutation: Lib_Access_Runner_RequireAuthentication_Mutation): Lib_Access_Runner_RequireAuthentication_Returns {
    return (request: Lib_Access_Runner_RequireAuthentication_Request, response: Lib_Access_Runner_RequireAuthentication_Response, next: Lib_Access_Runner_RequireAuthentication_Next): Lib_Access_Runner_RequireAuthentication_CallbackReturns => {
      if (request.get('Authorization') !== undefined) {
        const rawToken: Lib_Access_Runner_RequireAuthentication_RawToken = getBearerToken(request);
        const personalAccessToken: Lib_Access_Runner_RequireAuthentication_PersonalAccessToken = (rawToken === undefined) ? undefined : this.#state.authenticateToken(rawToken);

        if (personalAccessToken === undefined) {
          sendError(response, 401, 'authentication_required', 'A valid personal access token is required.');

          return;
        }

        Reflect.set(response.locals, 'actorId', personalAccessToken['name']);
        Reflect.set(response.locals, 'personalAccessToken', personalAccessToken);

        next();

        return;
      }

      this.requireSession(mutation)(request, response, next);

      return;
    };
  }

  /**
   * Lib - Access - Require Session.
   *
   * Allows only a signed-in browser session, never an API token.
   * Tokens therefore cannot manage tokens, passwords, or other sign-in methods.
   *
   * @param {Lib_Access_Runner_RequireSession_Mutation} mutation - Mutation.
   *
   * @returns {Lib_Access_Runner_RequireSession_Returns}
   *
   * @since 2.0.0
   */
  public requireSession(mutation: Lib_Access_Runner_RequireSession_Mutation): Lib_Access_Runner_RequireSession_Returns {
    return (request: Lib_Access_Runner_RequireSession_Request, response: Lib_Access_Runner_RequireSession_Response, next: Lib_Access_Runner_RequireSession_Next): Lib_Access_Runner_RequireSession_CallbackReturns => {
      if (request.get('Authorization') !== undefined) {
        sendError(response, 403, 'session_required', 'An administrator browser session is required.');

        return;
      }

      const session: Lib_Access_Runner_RequireSession_Session = this.resolveSession(request);

      if (session === undefined) {
        sendError(response, 401, 'authentication_required', 'Sign in to continue.');

        return;
      }

      if (mutation === true && this.hasValidCsrf(request, session) === false) {
        sendError(response, 403, 'csrf_invalid', 'The request CSRF token is missing or invalid.');

        return;
      }

      Reflect.set(response.locals, 'actorId', session['username']);
      Reflect.set(response.locals, 'session', session);

      next();

      return;
    };
  }

  /**
   * Lib - Access - Require Token.
   *
   * Authenticates a Bearer token and enforces the exact scope one action needs.
   * Missing or invalid tokens return 401, and a missing scope returns 403.
   *
   * @param {Lib_Access_Runner_RequireToken_Scope} scope - Scope.
   *
   * @returns {Lib_Access_Runner_RequireToken_Returns}
   *
   * @since 2.0.0
   */
  public requireToken(scope: Lib_Access_Runner_RequireToken_Scope): Lib_Access_Runner_RequireToken_Returns {
    return (request: Lib_Access_Runner_RequireToken_Request, response: Lib_Access_Runner_RequireToken_Response, next: Lib_Access_Runner_RequireToken_Next): Lib_Access_Runner_RequireToken_CallbackReturns => {
      const rawToken: Lib_Access_Runner_RequireToken_RawToken = getBearerToken(request);
      const personalAccessToken: Lib_Access_Runner_RequireToken_PersonalAccessToken = (rawToken === undefined) ? undefined : this.#state.authenticateToken(rawToken);

      if (personalAccessToken === undefined) {
        sendError(response, 401, 'authentication_required', 'A valid personal access token is required.');

        return;
      }

      if (hasPersonalAccessTokenScope(personalAccessToken, scope) === false) {
        sendError(response, 403, 'scope_required', `This token doesn't have the ${scope} scope.`);

        return;
      }

      Reflect.set(response.locals, 'actorId', personalAccessToken['name']);
      Reflect.set(response.locals, 'personalAccessToken', personalAccessToken);

      next();

      return;
    };
  }

  /**
   * Lib - Access - Has Valid Csrf.
   *
   * Requires the header to equal the readable cookie and to match the stored digest.
   * Digests are compared in constant time.
   *
   * @param {Lib_Access_Runner_HasValidCsrf_Request} request - Request.
   * @param {Lib_Access_Runner_HasValidCsrf_Session} session - Session.
   *
   * @private
   *
   * @returns {Lib_Access_Runner_HasValidCsrf_Returns}
   *
   * @since 2.0.0
   */
  private hasValidCsrf(request: Lib_Access_Runner_HasValidCsrf_Request, session: Lib_Access_Runner_HasValidCsrf_Session): Lib_Access_Runner_HasValidCsrf_Returns {
    const headerToken: Lib_Access_Runner_HasValidCsrf_HeaderToken = request.get('X-CSRF-Token');
    const cookieToken: Lib_Access_Runner_HasValidCsrf_CookieToken = readCookie(request, Runner.#csrfCookieName);

    if (
      headerToken === undefined
      || cookieToken === undefined
      || headerToken !== cookieToken
      || textCsrfToken.test(headerToken) === false
    ) {
      return false;
    }

    return digestsEqual(digestValue(headerToken), session['csrfHash']);
  }

  /**
   * Lib - Access - Resolve Session.
   *
   * Reads the session cookie and returns its stored, unexpired session.
   * Cookies with an unexpected shape are ignored without a database lookup.
   *
   * @param {Lib_Access_Runner_ResolveSession_Request} request - Request.
   *
   * @private
   *
   * @returns {Lib_Access_Runner_ResolveSession_Returns}
   *
   * @since 2.0.0
   */
  private resolveSession(request: Lib_Access_Runner_ResolveSession_Request): Lib_Access_Runner_ResolveSession_Returns {
    const sessionToken: Lib_Access_Runner_ResolveSession_SessionToken = readCookie(request, Runner.#sessionCookieName);

    if (sessionToken === undefined || textSessionToken.test(sessionToken) === false) {
      return undefined;
    }

    return this.#state.getSession(sessionToken);
  }
}
