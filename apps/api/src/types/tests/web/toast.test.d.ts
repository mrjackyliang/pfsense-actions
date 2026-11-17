/// <reference lib="dom" />

import type {
  Notyf,
  NotyfEventCallback,
  NotyfNotification,
} from 'notyf';
import type {
  Mock,
  MockInstance,
} from 'vitest';

/**
 * Tests - Web - Toast - Click handler.
 *
 * @since 2.1.0
 */
export type Tests_Web_Toast_ClickHandler = NotyfEventCallback;

/**
 * Tests - Web - Toast - Error notification.
 *
 * @since 2.1.0
 */
export type Tests_Web_Toast_ErrorNotification = NotyfNotification;

/**
 * Tests - Web - Toast - Notyf mocks.
 *
 * @since 2.1.0
 */
export type Tests_Web_Toast_NotyfMocks_Dismiss = Mock<Notyf['dismiss']>;

export type Tests_Web_Toast_NotyfMocks_DismissAll = Mock<Notyf['dismissAll']>;

export type Tests_Web_Toast_NotyfMocks_Error = Mock<Notyf['error']>;

export type Tests_Web_Toast_NotyfMocks_Success = Mock<Notyf['success']>;

export type Tests_Web_Toast_NotyfMocks = {
  dismiss: Tests_Web_Toast_NotyfMocks_Dismiss;
  dismissAll: Tests_Web_Toast_NotyfMocks_DismissAll;
  error: Tests_Web_Toast_NotyfMocks_Error;
  success: Tests_Web_Toast_NotyfMocks_Success;
};

/**
 * Tests - Web - Toast - Notification.
 *
 * @since 2.1.0
 */
export type Tests_Web_Toast_Notification = NotyfNotification;

/**
 * Tests - Web - Toast - Notification call.
 *
 * @since 2.1.0
 */
export type Tests_Web_Toast_NotificationCall = Parameters<NotyfNotification['on']> | undefined;

/**
 * Tests - Web - Toast - Notification on.
 *
 * @since 2.1.0
 */
export type Tests_Web_Toast_NotificationOn = MockInstance<NotyfNotification['on']>;

/**
 * Tests - Web - Toast - Success notification.
 *
 * @since 2.1.0
 */
export type Tests_Web_Toast_SuccessNotification = NotyfNotification;

/**
 * Tests - Web - Toast - Visible toast.
 *
 * @since 2.1.0
 */
export type Tests_Web_Toast_VisibleToast = {
  hidden: boolean;
  remove: () => void;
};

export type Tests_Web_Toast_VisibleToasts = Tests_Web_Toast_VisibleToast[];
