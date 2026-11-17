import type express from 'express';
import type { ZodSafeParseResult } from 'zod';

import type { Runner as Access } from '@/lib/access.js';
import type { Runner as Attempts } from '@/lib/attempts.js';
import type { GrantStore } from '@/lib/backup.js';
import type {
  passkeyCredentialIdentifier,
  webauthnAuthenticationResponse,
} from '@/lib/schema.js';
import type { Runner as State } from '@/lib/state.js';
import type {
  Lib_Backup_Document,
  Lib_Backup_ExportSections,
  Lib_Backup_ImportPreview,
  Lib_Backup_ImportResult,
  Lib_Backup_Purpose,
} from '@/types/lib/backup.d.ts';
import type {
  Lib_Passkeys_CreateAuthenticationOptions_Returns,
  Lib_Passkeys_VerifyAuthentication_Result,
} from '@/types/lib/passkeys.d.ts';
import type {
  Lib_State_Runner_TakeWebauthnCeremony_Returns,
  Lib_State_Runner_UpdatePasskeyUsage_Returns,
} from '@/types/lib/state.d.ts';
import type {
  Shared_AdministratorPasskey,
  Shared_BrowserSession,
  Shared_WebauthnConfiguration,
} from '@/types/shared.d.ts';

export type Routes_Backup_HasSection = (sections: Lib_Backup_ExportSections) => boolean;

export type Routes_Backup_Runner_Access = Access;
export type Routes_Backup_Runner_Attempts = Attempts;
export type Routes_Backup_Runner_Grants = GrantStore;
export type Routes_Backup_Runner_State = State;

export type Routes_Backup_Runner_Constructor_State = State;
export type Routes_Backup_Runner_Constructor_Access = Access;
export type Routes_Backup_Runner_Constructor_Attempts = Attempts;
export type Routes_Backup_Runner_Constructor_Grants = GrantStore | undefined;

export type Routes_Backup_Runner_Register_App = express.Express;
export type Routes_Backup_Runner_Register_Returns = void;

export type Routes_Backup_Runner_CeremonyBinding = {
  expiresAt: number;
  purpose: Lib_Backup_Purpose;
  sessionId: string;
};

export type Routes_Backup_Runner_Ceremonies = Map<string, Routes_Backup_Runner_CeremonyBinding>;

export type Routes_Backup_Runner_IsRateLimited_Request = express.Request;
export type Routes_Backup_Runner_IsRateLimited_Response = express.Response;
export type Routes_Backup_Runner_IsRateLimited_Returns = boolean;
export type Routes_Backup_Runner_IsRateLimited_AttemptKey = string;

export type Routes_Backup_Runner_RejectIdentity_Request = express.Request;
export type Routes_Backup_Runner_RejectIdentity_Response = express.Response;
export type Routes_Backup_Runner_RejectIdentity_Field = 'password' | 'code';
export type Routes_Backup_Runner_RejectIdentity_Message = string;
export type Routes_Backup_Runner_RejectIdentity_Returns = void;

export type Routes_Backup_Runner_RouteConfirmation_Request = express.Request;
export type Routes_Backup_Runner_RouteConfirmation_Response = express.Response;
export type Routes_Backup_Runner_RouteConfirmation_Returns = void;
export type Routes_Backup_Runner_RouteConfirmation_Data = {
  code?: string | undefined;
  password: string;
  purpose: Lib_Backup_Purpose;
};
export type Routes_Backup_Runner_RouteConfirmation_RequestBody = ZodSafeParseResult<Routes_Backup_Runner_RouteConfirmation_Data>;
export type Routes_Backup_Runner_RouteConfirmation_Session = Shared_BrowserSession;

export type Routes_Backup_Runner_RoutePasskeyOptions_Request = express.Request;
export type Routes_Backup_Runner_RoutePasskeyOptions_Response = express.Response;
export type Routes_Backup_Runner_RoutePasskeyOptions_Returns = Promise<void>;
export type Routes_Backup_Runner_RoutePasskeyOptions_Data = {
  purpose: Lib_Backup_Purpose;
};
export type Routes_Backup_Runner_RoutePasskeyOptions_RequestBody = ZodSafeParseResult<Routes_Backup_Runner_RoutePasskeyOptions_Data>;
export type Routes_Backup_Runner_RoutePasskeyOptions_Session = Shared_BrowserSession;
export type Routes_Backup_Runner_RoutePasskeyOptions_Configuration = Shared_WebauthnConfiguration;
export type Routes_Backup_Runner_RoutePasskeyOptions_Options = Awaited<Lib_Passkeys_CreateAuthenticationOptions_Returns>;
export type Routes_Backup_Runner_RoutePasskeyOptions_CeremonyId = string;
export type Routes_Backup_Runner_RoutePasskeyOptions_ExpiresAt = number;

export type Routes_Backup_Runner_RoutePasskeyVerify_Request = express.Request;
export type Routes_Backup_Runner_RoutePasskeyVerify_Response = express.Response;
export type Routes_Backup_Runner_RoutePasskeyVerify_Returns = Promise<void>;
export type Routes_Backup_Runner_RoutePasskeyVerify_Data = {
  ceremonyId: string;
  credential: ReturnType<typeof webauthnAuthenticationResponse.parse>;
  purpose: Lib_Backup_Purpose;
};
export type Routes_Backup_Runner_RoutePasskeyVerify_RequestBody = ZodSafeParseResult<Routes_Backup_Runner_RoutePasskeyVerify_Data>;
export type Routes_Backup_Runner_RoutePasskeyVerify_Session = Shared_BrowserSession;
export type Routes_Backup_Runner_RoutePasskeyVerify_Binding = Routes_Backup_Runner_CeremonyBinding | undefined;
export type Routes_Backup_Runner_RoutePasskeyVerify_Ceremony = Lib_State_Runner_TakeWebauthnCeremony_Returns;
export type Routes_Backup_Runner_RoutePasskeyVerify_Configuration = Shared_WebauthnConfiguration;
export type Routes_Backup_Runner_RoutePasskeyVerify_CredentialId = ReturnType<typeof passkeyCredentialIdentifier.safeParse>;
export type Routes_Backup_Runner_RoutePasskeyVerify_Passkey = Shared_AdministratorPasskey | undefined;
export type Routes_Backup_Runner_RoutePasskeyVerify_Verification = Lib_Passkeys_VerifyAuthentication_Result | undefined;
export type Routes_Backup_Runner_RoutePasskeyVerify_UpdateResult = Lib_State_Runner_UpdatePasskeyUsage_Returns;

export type Routes_Backup_Runner_RouteExport_Request = express.Request;
export type Routes_Backup_Runner_RouteExport_Response = express.Response;
export type Routes_Backup_Runner_RouteExport_Returns = void;
export type Routes_Backup_Runner_RouteExport_Data = {
  grant: string;
  sections: Lib_Backup_ExportSections;
};
export type Routes_Backup_Runner_RouteExport_RequestBody = ZodSafeParseResult<Routes_Backup_Runner_RouteExport_Data>;
export type Routes_Backup_Runner_RouteExport_Session = Shared_BrowserSession;
export type Routes_Backup_Runner_RouteExport_Document = Lib_Backup_Document;
export type Routes_Backup_Runner_RouteExport_Date = string;

export type Routes_Backup_Runner_RoutePreview_Request = express.Request;
export type Routes_Backup_Runner_RoutePreview_Response = express.Response;
export type Routes_Backup_Runner_RoutePreview_Returns = void;
export type Routes_Backup_Runner_RoutePreview_Data = {
  document: Lib_Backup_Document;
};
export type Routes_Backup_Runner_RoutePreview_RequestBody = ZodSafeParseResult<Routes_Backup_Runner_RoutePreview_Data>;
export type Routes_Backup_Runner_RoutePreview_Preview = Lib_Backup_ImportPreview;

export type Routes_Backup_Runner_RouteImport_Request = express.Request;
export type Routes_Backup_Runner_RouteImport_Response = express.Response;
export type Routes_Backup_Runner_RouteImport_Returns = void;
export type Routes_Backup_Runner_RouteImport_Data = {
  document: Lib_Backup_Document;
  grant: string;
};
export type Routes_Backup_Runner_RouteImport_RequestBody = ZodSafeParseResult<Routes_Backup_Runner_RouteImport_Data>;
export type Routes_Backup_Runner_RouteImport_Session = Shared_BrowserSession;
export type Routes_Backup_Runner_RouteImport_Result = Lib_Backup_ImportResult;
