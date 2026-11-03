import type {
  Lib_Notifications_App,
  Lib_Notifications_Dependencies,
  Lib_Notifications_MailOptions,
  Lib_Notifications_Notification,
  Lib_Notifications_Result,
  Lib_Notifications_Target,
} from '@/types/lib/notifications.d.ts';

export type Tests_Lib_Notifications_App = Lib_Notifications_App;

export type Tests_Lib_Notifications_Call = {
  body: string;
  headers: Record<string, string>;
  method: string;
  url: string;
};

export type Tests_Lib_Notifications_Calls = Tests_Lib_Notifications_Call[];

export type Tests_Lib_Notifications_Dependencies = Lib_Notifications_Dependencies;

export type Tests_Lib_Notifications_Issues = string[];

export type Tests_Lib_Notifications_Mail = Lib_Notifications_MailOptions;

export type Tests_Lib_Notifications_Mails = Lib_Notifications_MailOptions[];

export type Tests_Lib_Notifications_Notification = Lib_Notifications_Notification;

export type Tests_Lib_Notifications_Parse = ReturnType<ReturnType<typeof import('@/lib/notifications.js').notificationInputSchema>['safeParse']>;

export type Tests_Lib_Notifications_Result = Lib_Notifications_Result;

export type Tests_Lib_Notifications_Target = Lib_Notifications_Target;

export type Tests_Lib_Notifications_Body = string;

export type Tests_Lib_Notifications_SendOnce_Returns = Promise<Tests_Lib_Notifications_Call>;

export type Tests_Lib_Notifications_Status = number;
