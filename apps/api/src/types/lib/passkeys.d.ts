import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
} from '@simplewebauthn/server';

import type {
  webauthnAuthenticationResponse,
  webauthnRegistrationResponse,
} from '@/lib/schema.js';
import type {
  Shared_Administrator,
  Shared_AdministratorPasskey,
  Shared_WebauthnConfiguration,
} from '@/types/shared.d.ts';

export type Lib_Passkeys_GetUserHandle_AdministratorId = string;
export type Lib_Passkeys_GetUserHandle_Returns = string;

export type Lib_Passkeys_CreateRegistrationOptions_Configuration = Shared_WebauthnConfiguration;
export type Lib_Passkeys_CreateRegistrationOptions_Administrator = Shared_Administrator;
export type Lib_Passkeys_CreateRegistrationOptions_ExistingPasskeys = Shared_AdministratorPasskey[];
export type Lib_Passkeys_CreateRegistrationOptions_Returns = Promise<PublicKeyCredentialCreationOptionsJSON>;

export type Lib_Passkeys_VerifyRegistration_Configuration = Shared_WebauthnConfiguration;
export type Lib_Passkeys_VerifyRegistration_Response = ReturnType<typeof webauthnRegistrationResponse.parse>;
export type Lib_Passkeys_VerifyRegistration_ResponseTransports = string[];
export type Lib_Passkeys_VerifyRegistration_Challenge = string;
export type Lib_Passkeys_VerifyRegistration_Returns = Promise<Lib_Passkeys_VerifyRegistration_Result | undefined>;
export type Lib_Passkeys_VerifyRegistration_Transports = string[];
export type Lib_Passkeys_VerifyRegistration_Verification = VerifiedRegistrationResponse | undefined;
export type Lib_Passkeys_VerifyRegistration_Result = {
  backedUp: boolean;
  counter: number;
  deviceType: Shared_AdministratorPasskey['deviceType'];
  id: string;
  publicKey: Uint8Array<ArrayBuffer>;
  transports: string[];
};

export type Lib_Passkeys_CreateAuthenticationOptions_Configuration = Shared_WebauthnConfiguration;
export type Lib_Passkeys_CreateAuthenticationOptions_Returns = Promise<PublicKeyCredentialRequestOptionsJSON>;

export type Lib_Passkeys_VerifyAuthentication_Configuration = Shared_WebauthnConfiguration;
export type Lib_Passkeys_VerifyAuthentication_Response = ReturnType<typeof webauthnAuthenticationResponse.parse>;
export type Lib_Passkeys_VerifyAuthentication_Challenge = string;
export type Lib_Passkeys_VerifyAuthentication_Passkey = Shared_AdministratorPasskey;
export type Lib_Passkeys_VerifyAuthentication_Returns = Promise<Lib_Passkeys_VerifyAuthentication_Result | undefined>;
export type Lib_Passkeys_VerifyAuthentication_Verification = VerifiedAuthenticationResponse | undefined;
export type Lib_Passkeys_VerifyAuthentication_Result = {
  backedUp: boolean;
  counter: number;
  deviceType: Shared_AdministratorPasskey['deviceType'];
};
