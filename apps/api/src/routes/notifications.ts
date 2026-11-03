import {
  handleAsync,
  sendError,
  sendValidationError,
} from '../lib/http.js';
import {
  notificationInputSchema,
  notificationServiceBody,
  splitNotificationSettings,
} from '../lib/notifications.js';
import { textNotificationTargetId } from '../lib/regex.js';

import type {
  Routes_Notifications_Runner_Access,
  Routes_Notifications_Runner_Constructor_Access,
  Routes_Notifications_Runner_Constructor_Notifier,
  Routes_Notifications_Runner_Constructor_State,
  Routes_Notifications_Runner_EventKeys_Returns,
  Routes_Notifications_Runner_GetNotificationId_NotificationId,
  Routes_Notifications_Runner_GetNotificationId_Request,
  Routes_Notifications_Runner_GetNotificationId_Returns,
  Routes_Notifications_Runner_Notifier,
  Routes_Notifications_Runner_Register_App,
  Routes_Notifications_Runner_Register_Returns,
  Routes_Notifications_Runner_RouteCreate_ActorId,
  Routes_Notifications_Runner_RouteCreate_CreatedTarget,
  Routes_Notifications_Runner_RouteCreate_Request,
  Routes_Notifications_Runner_RouteCreate_RequestBody,
  Routes_Notifications_Runner_RouteCreate_Response,
  Routes_Notifications_Runner_RouteCreate_Returns,
  Routes_Notifications_Runner_RouteCreate_ServiceBody,
  Routes_Notifications_Runner_RouteCreate_Split,
  Routes_Notifications_Runner_RouteDelete_ActorId,
  Routes_Notifications_Runner_RouteDelete_NotificationId,
  Routes_Notifications_Runner_RouteDelete_Request,
  Routes_Notifications_Runner_RouteDelete_Response,
  Routes_Notifications_Runner_RouteDelete_Result,
  Routes_Notifications_Runner_RouteDelete_Returns,
  Routes_Notifications_Runner_RouteEvents_Request,
  Routes_Notifications_Runner_RouteEvents_Response,
  Routes_Notifications_Runner_RouteEvents_Returns,
  Routes_Notifications_Runner_RouteList_Request,
  Routes_Notifications_Runner_RouteList_Response,
  Routes_Notifications_Runner_RouteList_Returns,
  Routes_Notifications_Runner_RouteTest_NotificationId,
  Routes_Notifications_Runner_RouteTest_Request,
  Routes_Notifications_Runner_RouteTest_Response,
  Routes_Notifications_Runner_RouteTest_Result,
  Routes_Notifications_Runner_RouteTest_Returns,
  Routes_Notifications_Runner_RouteUpdate_ActorId,
  Routes_Notifications_Runner_RouteUpdate_ExistingTarget,
  Routes_Notifications_Runner_RouteUpdate_NotificationId,
  Routes_Notifications_Runner_RouteUpdate_Request,
  Routes_Notifications_Runner_RouteUpdate_RequestBody,
  Routes_Notifications_Runner_RouteUpdate_Response,
  Routes_Notifications_Runner_RouteUpdate_Result,
  Routes_Notifications_Runner_RouteUpdate_Returns,
  Routes_Notifications_Runner_RouteUpdate_Split,
  Routes_Notifications_Runner_SendNameTaken_Response,
  Routes_Notifications_Runner_SendNameTaken_Returns,
  Routes_Notifications_Runner_SendNotFound_Response,
  Routes_Notifications_Runner_SendNotFound_Returns,
  Routes_Notifications_Runner_State,
} from '@/types/routes/notifications.d.ts';

/**
 * Routes - Notifications.
 *
 * Lists, adds, edits, tests, and removes the destinations that get alerts.
 * Only a signed-in browser session can manage them, and secret values are never returned.
 *
 * @since 2.0.0
 */
export class Runner {
  /**
   * Routes - Notifications - Access.
   *
   * Restricts every notification route to a signed-in browser session.
   * Changes also need the session's CSRF header.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #access: Routes_Notifications_Runner_Access;

  /**
   * Routes - Notifications - Notifier.
   *
   * Supplies the event catalog and sends test messages.
   * Real alerts are sent by the code that sees each event.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #notifier: Routes_Notifications_Runner_Notifier;

  /**
   * Routes - Notifications - State.
   *
   * Stores destinations with their secrets sealed, and records each change.
   * Secret values never leave the state layer.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #state: Routes_Notifications_Runner_State;

  /**
   * Routes - Notifications - Constructor.
   *
   * Binds the notification routes to shared state, access checks, and the notifier.
   * No route is registered until register is called.
   *
   * @param {Routes_Notifications_Runner_Constructor_State}    state    - State.
   * @param {Routes_Notifications_Runner_Constructor_Access}   access   - Access.
   * @param {Routes_Notifications_Runner_Constructor_Notifier} notifier - Notifier.
   *
   * @since 2.0.0
   */
  public constructor(state: Routes_Notifications_Runner_Constructor_State, access: Routes_Notifications_Runner_Constructor_Access, notifier: Routes_Notifications_Runner_Constructor_Notifier) {
    this.#access = access;
    this.#notifier = notifier;
    this.#state = state;

    return;
  }

  /**
   * Routes - Notifications - Register.
   *
   * Installs the notification routes behind the session check.
   * Lists use the shared items envelope.
   *
   * @param {Routes_Notifications_Runner_Register_App} app - App.
   *
   * @returns {Routes_Notifications_Runner_Register_Returns}
   *
   * @since 2.0.0
   */
  public register(app: Routes_Notifications_Runner_Register_App): Routes_Notifications_Runner_Register_Returns {
    app.get('/api/v1/notifications', this.#access.requireSession(false), this['routeList'].bind(this));

    app.get('/api/v1/notifications/events', this.#access.requireSession(false), this['routeEvents'].bind(this));

    app.post('/api/v1/notifications', this.#access.requireSession(true), this['routeCreate'].bind(this));

    app.put('/api/v1/notifications/:notificationId', this.#access.requireSession(true), this['routeUpdate'].bind(this));

    app.delete('/api/v1/notifications/:notificationId', this.#access.requireSession(true), this['routeDelete'].bind(this));

    app.post('/api/v1/notifications/:notificationId/test', this.#access.requireSession(true), handleAsync(this['routeTest'].bind(this)));

    return;
  }

  /**
   * Routes - Notifications - Event Keys.
   *
   * Lists the event keys a destination can listen to.
   * They come from this app's catalog.
   *
   * @private
   *
   * @returns {Routes_Notifications_Runner_EventKeys_Returns}
   *
   * @since 2.0.0
   */
  private eventKeys(): Routes_Notifications_Runner_EventKeys_Returns {
    return this.#notifier.getEvents().map((event) => event['key']);
  }

  /**
   * Routes - Notifications - Get Notification ID.
   *
   * Reads and validates the destination identifier from the route path.
   * Identifiers that could never exist return undefined.
   *
   * @param {Routes_Notifications_Runner_GetNotificationId_Request} request - Request.
   *
   * @private
   *
   * @returns {Routes_Notifications_Runner_GetNotificationId_Returns}
   *
   * @since 2.0.0
   */
  private getNotificationId(request: Routes_Notifications_Runner_GetNotificationId_Request): Routes_Notifications_Runner_GetNotificationId_Returns {
    const notificationId: Routes_Notifications_Runner_GetNotificationId_NotificationId = (typeof request.params['notificationId'] === 'string') ? request.params['notificationId'] : undefined;

    if (notificationId === undefined || textNotificationTargetId.test(notificationId) === false) {
      return undefined;
    }

    return notificationId;
  }

  /**
   * Routes - Notifications - Route Create.
   *
   * Adds a destination after checking its service, fields, and events.
   * A name that is already used fails without changing anything.
   *
   * @param {Routes_Notifications_Runner_RouteCreate_Request}  request  - Request.
   * @param {Routes_Notifications_Runner_RouteCreate_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Notifications_Runner_RouteCreate_Returns}
   *
   * @since 2.0.0
   */
  private routeCreate(request: Routes_Notifications_Runner_RouteCreate_Request, response: Routes_Notifications_Runner_RouteCreate_Response): Routes_Notifications_Runner_RouteCreate_Returns {
    const serviceBody: Routes_Notifications_Runner_RouteCreate_ServiceBody = notificationServiceBody.safeParse(request.body);

    if (serviceBody.success === false) {
      sendValidationError(response, 422, serviceBody.error, 'Check the highlighted fields.');

      return;
    }

    const requestBody: Routes_Notifications_Runner_RouteCreate_RequestBody = notificationInputSchema(serviceBody.data['service'], this.eventKeys(), [], []).safeParse(request.body);

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Check the highlighted fields.');

      return;
    }

    const split: Routes_Notifications_Runner_RouteCreate_Split = splitNotificationSettings(serviceBody.data['service'], requestBody.data['settings']);
    const actorId: Routes_Notifications_Runner_RouteCreate_ActorId = response.locals['actorId'];
    const createdTarget: Routes_Notifications_Runner_RouteCreate_CreatedTarget = this.#state.createNotificationTarget({
      events: requestBody.data['events'],
      name: requestBody.data['name'],
      secrets: split['secrets'],
      service: serviceBody.data['service'],
      settings: split['settings'],
    }, actorId);

    if (createdTarget === undefined) {
      this.sendNameTaken(response);

      return;
    }

    response.status(201).json(createdTarget);

    return;
  }

  /**
   * Routes - Notifications - Route Delete.
   *
   * Removes one destination so it gets no more alerts.
   * Other destinations are unaffected.
   *
   * @param {Routes_Notifications_Runner_RouteDelete_Request}  request  - Request.
   * @param {Routes_Notifications_Runner_RouteDelete_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Notifications_Runner_RouteDelete_Returns}
   *
   * @since 2.0.0
   */
  private routeDelete(request: Routes_Notifications_Runner_RouteDelete_Request, response: Routes_Notifications_Runner_RouteDelete_Response): Routes_Notifications_Runner_RouteDelete_Returns {
    const notificationId: Routes_Notifications_Runner_RouteDelete_NotificationId = this.getNotificationId(request);

    if (notificationId === undefined) {
      this.sendNotFound(response);

      return;
    }

    const actorId: Routes_Notifications_Runner_RouteDelete_ActorId = response.locals['actorId'];
    const result: Routes_Notifications_Runner_RouteDelete_Result = this.#state.removeNotificationTarget(notificationId, actorId);

    if (result === 'not-found') {
      this.sendNotFound(response);

      return;
    }

    response.sendStatus(204);

    return;
  }

  /**
   * Routes - Notifications - Route Events.
   *
   * Lists the events a destination can listen to, with the ones checked by default.
   * The dialog shows them in this order.
   *
   * @param {Routes_Notifications_Runner_RouteEvents_Request}  _request - Request.
   * @param {Routes_Notifications_Runner_RouteEvents_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Notifications_Runner_RouteEvents_Returns}
   *
   * @since 2.0.0
   */
  private routeEvents(_request: Routes_Notifications_Runner_RouteEvents_Request, response: Routes_Notifications_Runner_RouteEvents_Response): Routes_Notifications_Runner_RouteEvents_Returns {
    response.json({
      items: this.#notifier.getEvents().map((event) => ({
        defaultEnabled: event['defaultEnabled'],
        description: event['description'],
        key: event['key'],
        label: event['label'],
      })),
    });

    return;
  }

  /**
   * Routes - Notifications - Route List.
   *
   * Lists every destination with its events and last result, but no secret values.
   * Saved secret fields are named so the dialog can keep them.
   *
   * @param {Routes_Notifications_Runner_RouteList_Request}  _request - Request.
   * @param {Routes_Notifications_Runner_RouteList_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Notifications_Runner_RouteList_Returns}
   *
   * @since 2.0.0
   */
  private routeList(_request: Routes_Notifications_Runner_RouteList_Request, response: Routes_Notifications_Runner_RouteList_Response): Routes_Notifications_Runner_RouteList_Returns {
    response.json({
      items: this.#state.getNotificationTargets(),
    });

    return;
  }

  /**
   * Routes - Notifications - Route Test.
   *
   * Sends the test message to one destination and reports whether it arrived.
   * A destination waiting for a removed secret isn't sent to.
   *
   * @param {Routes_Notifications_Runner_RouteTest_Request}  request  - Request.
   * @param {Routes_Notifications_Runner_RouteTest_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Notifications_Runner_RouteTest_Returns}
   *
   * @since 2.0.0
   */
  private async routeTest(request: Routes_Notifications_Runner_RouteTest_Request, response: Routes_Notifications_Runner_RouteTest_Response): Routes_Notifications_Runner_RouteTest_Returns {
    const notificationId: Routes_Notifications_Runner_RouteTest_NotificationId = this.getNotificationId(request);

    if (notificationId === undefined) {
      this.sendNotFound(response);

      return;
    }

    const result: Routes_Notifications_Runner_RouteTest_Result = await this.#notifier.sendTest(notificationId);

    if (result === 'not-found') {
      this.sendNotFound(response);

      return;
    }

    if (result === 'secrets-missing') {
      response.json({
        delivered: false,
        message: 'Enter the removed secrets again first.',
      });

      return;
    }

    response.json(result);

    return;
  }

  /**
   * Routes - Notifications - Route Update.
   *
   * Changes a destination's name, events, and settings; its service stays the same.
   * Secret fields left blank keep their saved values, unless explicitly removed.
   *
   * @param {Routes_Notifications_Runner_RouteUpdate_Request}  request  - Request.
   * @param {Routes_Notifications_Runner_RouteUpdate_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Notifications_Runner_RouteUpdate_Returns}
   *
   * @since 2.0.0
   */
  private routeUpdate(request: Routes_Notifications_Runner_RouteUpdate_Request, response: Routes_Notifications_Runner_RouteUpdate_Response): Routes_Notifications_Runner_RouteUpdate_Returns {
    const notificationId: Routes_Notifications_Runner_RouteUpdate_NotificationId = this.getNotificationId(request);
    const existingTarget: Routes_Notifications_Runner_RouteUpdate_ExistingTarget = (notificationId === undefined) ? undefined : this.#state.getNotificationTargets().find((target) => target['id'] === notificationId);

    if (notificationId === undefined || existingTarget === undefined) {
      this.sendNotFound(response);

      return;
    }

    const requestBody: Routes_Notifications_Runner_RouteUpdate_RequestBody = notificationInputSchema(existingTarget['service'], this.eventKeys(), Object.keys(existingTarget['secrets']), existingTarget['secretsMissing']).safeParse(request.body);

    if (requestBody.success === false) {
      sendValidationError(response, 422, requestBody.error, 'Check the highlighted fields.');

      return;
    }

    const split: Routes_Notifications_Runner_RouteUpdate_Split = splitNotificationSettings(existingTarget['service'], requestBody.data['settings']);
    const actorId: Routes_Notifications_Runner_RouteUpdate_ActorId = response.locals['actorId'];
    const result: Routes_Notifications_Runner_RouteUpdate_Result = this.#state.updateNotificationTarget(notificationId, {
      clearSecrets: requestBody.data['clearSecrets'] ?? [],
      events: requestBody.data['events'],
      name: requestBody.data['name'],
      secrets: split['secrets'],
      settings: split['settings'],
    }, actorId);

    if (result === 'not-found') {
      this.sendNotFound(response);

      return;
    }

    if (result === 'name-taken') {
      this.sendNameTaken(response);

      return;
    }

    response.json(result);

    return;
  }

  /**
   * Routes - Notifications - Send Name Taken.
   *
   * Answers a name another destination already uses.
   * The issue points at the name field.
   *
   * @param {Routes_Notifications_Runner_SendNameTaken_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Notifications_Runner_SendNameTaken_Returns}
   *
   * @since 2.0.0
   */
  private sendNameTaken(response: Routes_Notifications_Runner_SendNameTaken_Response): Routes_Notifications_Runner_SendNameTaken_Returns {
    sendError(response, 409, 'notification_exists', 'A notification with this name already exists.', [{
      field: 'name',
      message: 'A notification with this name already exists.',
      path: ['name'],
    }]);

    return;
  }

  /**
   * Routes - Notifications - Send Not Found.
   *
   * Answers a destination that doesn't exist or was removed.
   * The same answer covers identifiers that could never exist.
   *
   * @param {Routes_Notifications_Runner_SendNotFound_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Notifications_Runner_SendNotFound_Returns}
   *
   * @since 2.0.0
   */
  private sendNotFound(response: Routes_Notifications_Runner_SendNotFound_Response): Routes_Notifications_Runner_SendNotFound_Returns {
    sendError(response, 404, 'notification_not_found', 'That notification no longer exists.');

    return;
  }
}
