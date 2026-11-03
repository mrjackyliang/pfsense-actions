import {
  Notyf,
  NotyfEvent,
} from 'notyf';

import type {
  Web_Toast_GetNotyf_Returns,
  Web_Toast_NotyfInstance,
  Web_Toast_ShowToast_Message,
  Web_Toast_ShowToast_Notification,
  Web_Toast_ShowToast_Returns,
  Web_Toast_ShowToast_SafeMessage,
  Web_Toast_ShowToast_Success,
} from '@/types/web/toast.d.ts';

/**
 * Toast - Notyf instance.
 *
 * Created on the first toast, so every toast shares one container
 * instead of adding a new one to the page each time.
 *
 * @since 2.0.0
 */
let notyfInstance: Web_Toast_NotyfInstance = undefined;

/**
 * Toast - Get Notyf.
 *
 * Returns the shared Notyf instance. The colors are theme variables,
 * so a toast follows the light or dark theme that is showing.
 *
 * @since 2.0.0
 */
const getNotyf = (): Web_Toast_GetNotyf_Returns => {
  if (notyfInstance === undefined) {
    notyfInstance = new Notyf({
      dismissible: true,
      duration: 4000,
      ripple: false,
      types: [
        {
          background: 'var(--color-success)',
          type: 'success',
        },
        {
          background: 'var(--color-danger)',
          duration: 6000,
          type: 'error',
        },
      ],
    });
  }

  return notyfInstance;
};

/**
 * Toast - Show toast.
 *
 * Shows a success or error toast that closes on its own or when clicked. Notyf renders
 * the message as HTML, so the text is escaped and server messages show as typed.
 *
 * @since 2.0.0
 */
export const showToast = (message: Web_Toast_ShowToast_Message, success: Web_Toast_ShowToast_Success): Web_Toast_ShowToast_Returns => {
  const notyf: Web_Toast_GetNotyf_Returns = getNotyf();
  const safeMessage: Web_Toast_ShowToast_SafeMessage = message.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const notification: Web_Toast_ShowToast_Notification = (success) ? notyf.success(safeMessage) : notyf.error(safeMessage);

  notification.on(NotyfEvent.Click, (): void => {
    notyf.dismiss(notification);

    return;
  });
};
