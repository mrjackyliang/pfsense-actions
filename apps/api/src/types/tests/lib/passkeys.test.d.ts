import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server';

import type {
  Shared_Administrator,
  Shared_WebauthnConfiguration,
} from '@/types/shared.d.ts';

export type Tests_Lib_Passkeys_Administrator = Shared_Administrator;
export type Tests_Lib_Passkeys_AuthenticationOptions = PublicKeyCredentialRequestOptionsJSON;
export type Tests_Lib_Passkeys_Configuration = Shared_WebauthnConfiguration;
export type Tests_Lib_Passkeys_RegistrationOptions = PublicKeyCredentialCreationOptionsJSON;
export type Tests_Lib_Passkeys_UserHandle = string;
