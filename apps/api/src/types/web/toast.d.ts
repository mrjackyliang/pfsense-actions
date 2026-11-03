import type {
  Notyf,
  NotyfNotification,
} from 'notyf';

/**
 * Toast.
 *
 * @since 2.0.0
 */
export type Web_Toast_NotyfInstance = Notyf | undefined;
export type Web_Toast_GetNotyf_Returns = Notyf;
export type Web_Toast_ShowToast_Message = string;
export type Web_Toast_ShowToast_Success = boolean;
export type Web_Toast_ShowToast_SafeMessage = string;
export type Web_Toast_ShowToast_Notification = NotyfNotification;
export type Web_Toast_ShowToast_Returns = void;
