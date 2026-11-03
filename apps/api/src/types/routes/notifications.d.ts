import type express from 'express';

import type { Runner as Access } from '@/lib/access.js';
import type {
  notificationInputSchema,
  notificationServiceBody,
} from '@/lib/notifications.js';
import type { Runner as Notifier } from '@/lib/notifier.js';
import type { Runner as State } from '@/lib/state.js';
import type { Lib_Notifications_SplitNotificationSettings_Returns } from '@/types/lib/notifications.d.ts';
import type {
  Lib_State_Runner_CreateNotificationTarget_Returns,
  Lib_State_Runner_RemoveNotificationTarget_Returns,
  Lib_State_Runner_UpdateNotificationTarget_Returns,
} from '@/types/lib/state.d.ts';
import type { Shared_NotificationTarget } from '@/types/shared.d.ts';

/**
 * Routes - Notifications - Runner - Access.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_Access = Access;

/**
 * Routes - Notifications - Runner - Notifier.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_Notifier = Notifier;

/**
 * Routes - Notifications - Runner - State.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_State = State;

/**
 * Routes - Notifications - Runner - Constructor.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_Constructor_State = State;

export type Routes_Notifications_Runner_Constructor_Access = Access;

export type Routes_Notifications_Runner_Constructor_Notifier = Notifier;

/**
 * Routes - Notifications - Runner - Register.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_Register_App = express.Express;

export type Routes_Notifications_Runner_Register_Returns = void;

/**
 * Routes - Notifications - Runner - Event Keys.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_EventKeys_Returns = string[];

/**
 * Routes - Notifications - Runner - Get Notification ID.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_GetNotificationId_Request = express.Request;

export type Routes_Notifications_Runner_GetNotificationId_Returns = string | undefined;

export type Routes_Notifications_Runner_GetNotificationId_NotificationId = string | undefined;

/**
 * Routes - Notifications - Runner - Route Create.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_RouteCreate_Request = express.Request;

export type Routes_Notifications_Runner_RouteCreate_Response = express.Response;

export type Routes_Notifications_Runner_RouteCreate_Returns = void;

export type Routes_Notifications_Runner_RouteCreate_ServiceBody = ReturnType<typeof notificationServiceBody.safeParse>;

export type Routes_Notifications_Runner_RouteCreate_RequestBody = ReturnType<ReturnType<typeof notificationInputSchema>['safeParse']>;

export type Routes_Notifications_Runner_RouteCreate_Split = Lib_Notifications_SplitNotificationSettings_Returns;

export type Routes_Notifications_Runner_RouteCreate_ActorId = string;

export type Routes_Notifications_Runner_RouteCreate_CreatedTarget = Lib_State_Runner_CreateNotificationTarget_Returns;

/**
 * Routes - Notifications - Runner - Route Delete.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_RouteDelete_Request = express.Request;

export type Routes_Notifications_Runner_RouteDelete_Response = express.Response;

export type Routes_Notifications_Runner_RouteDelete_Returns = void;

export type Routes_Notifications_Runner_RouteDelete_NotificationId = string | undefined;

export type Routes_Notifications_Runner_RouteDelete_ActorId = string;

export type Routes_Notifications_Runner_RouteDelete_Result = Lib_State_Runner_RemoveNotificationTarget_Returns;

/**
 * Routes - Notifications - Runner - Route Events.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_RouteEvents_Request = express.Request;

export type Routes_Notifications_Runner_RouteEvents_Response = express.Response;

export type Routes_Notifications_Runner_RouteEvents_Returns = void;

/**
 * Routes - Notifications - Runner - Route List.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_RouteList_Request = express.Request;

export type Routes_Notifications_Runner_RouteList_Response = express.Response;

export type Routes_Notifications_Runner_RouteList_Returns = void;

/**
 * Routes - Notifications - Runner - Route Test.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_RouteTest_Request = express.Request;

export type Routes_Notifications_Runner_RouteTest_Response = express.Response;

export type Routes_Notifications_Runner_RouteTest_Returns = Promise<void>;

export type Routes_Notifications_Runner_RouteTest_NotificationId = string | undefined;

export type Routes_Notifications_Runner_RouteTest_Result = Awaited<ReturnType<Notifier['sendTest']>>;

/**
 * Routes - Notifications - Runner - Route Update.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_RouteUpdate_Request = express.Request;

export type Routes_Notifications_Runner_RouteUpdate_Response = express.Response;

export type Routes_Notifications_Runner_RouteUpdate_Returns = void;

export type Routes_Notifications_Runner_RouteUpdate_NotificationId = string | undefined;

export type Routes_Notifications_Runner_RouteUpdate_ExistingTarget = Shared_NotificationTarget | undefined;

export type Routes_Notifications_Runner_RouteUpdate_RequestBody = ReturnType<ReturnType<typeof notificationInputSchema>['safeParse']>;

export type Routes_Notifications_Runner_RouteUpdate_Split = Lib_Notifications_SplitNotificationSettings_Returns;

export type Routes_Notifications_Runner_RouteUpdate_ActorId = string;

export type Routes_Notifications_Runner_RouteUpdate_Result = Lib_State_Runner_UpdateNotificationTarget_Returns;

/**
 * Routes - Notifications - Runner - Send Name Taken.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_SendNameTaken_Response = express.Response;

export type Routes_Notifications_Runner_SendNameTaken_Returns = void;

/**
 * Routes - Notifications - Runner - Send Not Found.
 *
 * @since 2.0.0
 */
export type Routes_Notifications_Runner_SendNotFound_Response = express.Response;

export type Routes_Notifications_Runner_SendNotFound_Returns = void;
