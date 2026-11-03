import {
  sendError,
  sendValidationError,
} from '../lib/http.js';
import {
  personalAccessTokenIdentifier,
  tokenCreate,
  tokenUpdate,
} from '../lib/schema.js';

import type {
  Routes_Tokens_Runner_Access,
  Routes_Tokens_Runner_Constructor_Access,
  Routes_Tokens_Runner_Constructor_State,
  Routes_Tokens_Runner_GetTokenId_Request,
  Routes_Tokens_Runner_GetTokenId_Returns,
  Routes_Tokens_Runner_GetTokenId_TokenId,
  Routes_Tokens_Runner_Register_App,
  Routes_Tokens_Runner_Register_Returns,
  Routes_Tokens_Runner_RouteCreate_ActorId,
  Routes_Tokens_Runner_RouteCreate_CreatedToken,
  Routes_Tokens_Runner_RouteCreate_Request,
  Routes_Tokens_Runner_RouteCreate_RequestBody,
  Routes_Tokens_Runner_RouteCreate_Response,
  Routes_Tokens_Runner_RouteCreate_Returns,
  Routes_Tokens_Runner_RouteDelete_ActorId,
  Routes_Tokens_Runner_RouteDelete_Request,
  Routes_Tokens_Runner_RouteDelete_Response,
  Routes_Tokens_Runner_RouteDelete_Result,
  Routes_Tokens_Runner_RouteDelete_Returns,
  Routes_Tokens_Runner_RouteDelete_TokenId,
  Routes_Tokens_Runner_RouteList_Request,
  Routes_Tokens_Runner_RouteList_Response,
  Routes_Tokens_Runner_RouteList_Returns,
  Routes_Tokens_Runner_RouteUpdate_ActorId,
  Routes_Tokens_Runner_RouteUpdate_Request,
  Routes_Tokens_Runner_RouteUpdate_RequestBody,
  Routes_Tokens_Runner_RouteUpdate_Response,
  Routes_Tokens_Runner_RouteUpdate_Result,
  Routes_Tokens_Runner_RouteUpdate_Returns,
  Routes_Tokens_Runner_RouteUpdate_TokenId,
  Routes_Tokens_Runner_State,
} from '@/types/routes/tokens.d.ts';

/**
 * Routes - Tokens.
 *
 * Lists, creates, edits, and revokes the scoped personal access tokens of API clients.
 * Only a signed-in browser session can manage tokens, so a leaked token cannot mint more.
 *
 * @since 2.0.0
 */
export class Runner {
  /**
   * Routes - Tokens - Access.
   *
   * Restricts every token route to a signed-in browser session.
   * Mutations also need the session's CSRF header.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #access: Routes_Tokens_Runner_Access;

  /**
   * Routes - Tokens - State.
   *
   * Stores token hashes and scopes and records each change in the activity log.
   * Raw token values are never stored.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #state: Routes_Tokens_Runner_State;

  /**
   * Routes - Tokens - Constructor.
   *
   * Binds the token routes to shared state and access checks.
   * No route is registered until register is called.
   *
   * @param {Routes_Tokens_Runner_Constructor_State}  state  - State.
   * @param {Routes_Tokens_Runner_Constructor_Access} access - Access.
   *
   * @since 2.0.0
   */
  public constructor(state: Routes_Tokens_Runner_Constructor_State, access: Routes_Tokens_Runner_Constructor_Access) {
    this.#access = access;
    this.#state = state;

    return;
  }

  /**
   * Routes - Tokens - Register.
   *
   * Installs the token routes behind the session check.
   * Lists use the shared items envelope.
   *
   * @param {Routes_Tokens_Runner_Register_App} app - App.
   *
   * @returns {Routes_Tokens_Runner_Register_Returns}
   *
   * @since 2.0.0
   */
  public register(app: Routes_Tokens_Runner_Register_App): Routes_Tokens_Runner_Register_Returns {
    app.get('/api/v1/auth/tokens', this.#access.requireSession(false), this['routeList'].bind(this));

    app.post('/api/v1/auth/tokens', this.#access.requireSession(true), this['routeCreate'].bind(this));

    app.put('/api/v1/auth/tokens/:tokenId', this.#access.requireSession(true), this['routeUpdate'].bind(this));

    app.delete('/api/v1/auth/tokens/:tokenId', this.#access.requireSession(true), this['routeDelete'].bind(this));

    return;
  }

  /**
   * Routes - Tokens - Get Token ID.
   *
   * Reads and validates the token identifier from the route path.
   * Identifiers that could never exist return undefined.
   *
   * @param {Routes_Tokens_Runner_GetTokenId_Request} request - Request.
   *
   * @private
   *
   * @returns {Routes_Tokens_Runner_GetTokenId_Returns}
   *
   * @since 2.0.0
   */
  private getTokenId(request: Routes_Tokens_Runner_GetTokenId_Request): Routes_Tokens_Runner_GetTokenId_Returns {
    const tokenId: Routes_Tokens_Runner_GetTokenId_TokenId = (typeof request.params['tokenId'] === 'string') ? request.params['tokenId'] : undefined;

    if (tokenId === undefined || personalAccessTokenIdentifier.safeParse(tokenId).success === false) {
      return undefined;
    }

    return tokenId;
  }

  /**
   * Routes - Tokens - Route Create.
   *
   * Creates a token and returns its raw value in this response only.
   * A name that is already used fails without changing anything.
   *
   * @param {Routes_Tokens_Runner_RouteCreate_Request}  request  - Request.
   * @param {Routes_Tokens_Runner_RouteCreate_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Tokens_Runner_RouteCreate_Returns}
   *
   * @since 2.0.0
   */
  private routeCreate(request: Routes_Tokens_Runner_RouteCreate_Request, response: Routes_Tokens_Runner_RouteCreate_Response): Routes_Tokens_Runner_RouteCreate_Returns {
    const requestBody: Routes_Tokens_Runner_RouteCreate_RequestBody = tokenCreate.safeParse(request.body);

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Check the highlighted fields.');

      return;
    }

    const actorId: Routes_Tokens_Runner_RouteCreate_ActorId = response.locals['actorId'];
    const createdToken: Routes_Tokens_Runner_RouteCreate_CreatedToken = this.#state.createToken(requestBody.data, actorId);

    if (createdToken === undefined) {
      sendError(response, 409, 'token_exists', 'A token with this name already exists.', [{
        field: 'name',
        message: 'A token with this name already exists.',
        path: ['name'],
      }]);

      return;
    }

    response.status(201).json({
      plaintext: createdToken['personalAccessToken'],
      token: createdToken['token'],
    });

    return;
  }

  /**
   * Routes - Tokens - Route Delete.
   *
   * Revokes one token so its next request is rejected.
   * The browser session and other tokens are unaffected.
   *
   * @param {Routes_Tokens_Runner_RouteDelete_Request}  request  - Request.
   * @param {Routes_Tokens_Runner_RouteDelete_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Tokens_Runner_RouteDelete_Returns}
   *
   * @since 2.0.0
   */
  private routeDelete(request: Routes_Tokens_Runner_RouteDelete_Request, response: Routes_Tokens_Runner_RouteDelete_Response): Routes_Tokens_Runner_RouteDelete_Returns {
    const tokenId: Routes_Tokens_Runner_RouteDelete_TokenId = this.getTokenId(request);

    if (tokenId === undefined) {
      sendError(response, 404, 'token_not_found', 'That token no longer exists.');

      return;
    }

    const actorId: Routes_Tokens_Runner_RouteDelete_ActorId = response.locals['actorId'];
    const result: Routes_Tokens_Runner_RouteDelete_Result = this.#state.removeToken(tokenId, actorId);

    if (result === 'not-found') {
      sendError(response, 404, 'token_not_found', 'That token no longer exists.');

      return;
    }

    response.sendStatus(204);

    return;
  }

  /**
   * Routes - Tokens - Route List.
   *
   * Lists safe token metadata without hashes or recoverable raw values.
   * Each token shows its scopes, expiry, and when it was last used.
   *
   * @param {Routes_Tokens_Runner_RouteList_Request}  _request - Request.
   * @param {Routes_Tokens_Runner_RouteList_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Tokens_Runner_RouteList_Returns}
   *
   * @since 2.0.0
   */
  private routeList(_request: Routes_Tokens_Runner_RouteList_Request, response: Routes_Tokens_Runner_RouteList_Response): Routes_Tokens_Runner_RouteList_Returns {
    response.json({
      items: this.#state.getTokens(),
    });

    return;
  }

  /**
   * Routes - Tokens - Route Update.
   *
   * Changes a token's name, scopes, and expiry without changing or revealing its value.
   * A name another token uses fails without changing anything.
   *
   * @param {Routes_Tokens_Runner_RouteUpdate_Request}  request  - Request.
   * @param {Routes_Tokens_Runner_RouteUpdate_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Tokens_Runner_RouteUpdate_Returns}
   *
   * @since 2.0.0
   */
  private routeUpdate(request: Routes_Tokens_Runner_RouteUpdate_Request, response: Routes_Tokens_Runner_RouteUpdate_Response): Routes_Tokens_Runner_RouteUpdate_Returns {
    const tokenId: Routes_Tokens_Runner_RouteUpdate_TokenId = this.getTokenId(request);

    if (tokenId === undefined) {
      sendError(response, 404, 'token_not_found', 'That token no longer exists.');

      return;
    }

    const requestBody: Routes_Tokens_Runner_RouteUpdate_RequestBody = tokenUpdate.safeParse(request.body);

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Check the highlighted fields.');

      return;
    }

    const actorId: Routes_Tokens_Runner_RouteUpdate_ActorId = response.locals['actorId'];
    const result: Routes_Tokens_Runner_RouteUpdate_Result = this.#state.updateToken(tokenId, requestBody.data, actorId);

    if (result === 'not-found') {
      sendError(response, 404, 'token_not_found', 'That token no longer exists.');

      return;
    }

    if (result === 'name-taken') {
      sendError(response, 409, 'token_exists', 'A token with this name already exists.', [{
        field: 'name',
        message: 'A token with this name already exists.',
        path: ['name'],
      }]);

      return;
    }

    response.json(result);

    return;
  }
}
