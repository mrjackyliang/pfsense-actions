import type {
  CipherGCM,
  DecipherGCM,
} from 'node:crypto';

import type express from 'express';

import type {
  Shared_EnvironmentVariables_PersonalAccessToken,
  Shared_EnvironmentVariables_PersonalAccessTokenScope,
} from '@/types/shared.d.ts';

/**
 * Lib - Auth - Authenticate Raw Personal Access Token.
 *
 * @since 2.0.0
 */
export type Lib_Auth_AuthenticateRawPersonalAccessToken_PersonalAccessTokens = Shared_EnvironmentVariables_PersonalAccessToken[];

export type Lib_Auth_AuthenticateRawPersonalAccessToken_PersonalAccessToken = string;

export type Lib_Auth_AuthenticateRawPersonalAccessToken_Now = Date;

export type Lib_Auth_AuthenticateRawPersonalAccessToken_Returns_Id = string;

export type Lib_Auth_AuthenticateRawPersonalAccessToken_Returns_Scopes = Shared_EnvironmentVariables_PersonalAccessTokenScope[];

export type Lib_Auth_AuthenticateRawPersonalAccessToken_Returns = {
  id: Lib_Auth_AuthenticateRawPersonalAccessToken_Returns_Id;
  scopes: Lib_Auth_AuthenticateRawPersonalAccessToken_Returns_Scopes;
} | undefined;

export type Lib_Auth_AuthenticateRawPersonalAccessToken_ProvidedTokenHash = string;

export type Lib_Auth_AuthenticateRawPersonalAccessToken_ProvidedTokenHashBuffer = Buffer;

export type Lib_Auth_AuthenticateRawPersonalAccessToken_MatchedToken = Shared_EnvironmentVariables_PersonalAccessToken | undefined;

export type Lib_Auth_AuthenticateRawPersonalAccessToken_ExpectedTokenHashBuffer = Buffer;

export type Lib_Auth_AuthenticateRawPersonalAccessToken_IsMatch = boolean;

export type Lib_Auth_AuthenticateRawPersonalAccessToken_ExpiresAt = number;

/**
 * Lib - Auth - Code Alphabet.
 *
 * @since 2.0.0
 */
export type Lib_Auth_GenerateCode_Alphabet = string;

/**
 * Lib - Auth - Decrypt Credential.
 *
 * @since 2.0.0
 */
export type Lib_Auth_DecryptCredential_EncryptedCredential_AuthTag = string;

export type Lib_Auth_DecryptCredential_EncryptedCredential_Ciphertext = string;

export type Lib_Auth_DecryptCredential_EncryptedCredential_Iv = string;

export type Lib_Auth_DecryptCredential_EncryptedCredential = {
  authTag: Lib_Auth_DecryptCredential_EncryptedCredential_AuthTag;
  ciphertext: Lib_Auth_DecryptCredential_EncryptedCredential_Ciphertext;
  iv: Lib_Auth_DecryptCredential_EncryptedCredential_Iv;
};

export type Lib_Auth_DecryptCredential_EncryptionKey = string;

export type Lib_Auth_DecryptCredential_Returns = string;

export type Lib_Auth_DecryptCredential_Key = Buffer;

export type Lib_Auth_DecryptCredential_Iv = Buffer;

export type Lib_Auth_DecryptCredential_AuthTag = Buffer;

export type Lib_Auth_DecryptCredential_Ciphertext = Buffer;

export type Lib_Auth_DecryptCredential_Cipher = DecipherGCM;

export type Lib_Auth_DecryptCredential_Plaintext = Buffer;

/**
 * Lib - Auth - Digest Value.
 *
 * @since 2.0.0
 */
export type Lib_Auth_DigestValue_Value = string;

export type Lib_Auth_DigestValue_Returns = string;

/**
 * Lib - Auth - Digests Equal.
 *
 * @since 2.0.0
 */
export type Lib_Auth_DigestsEqual_Left = string;

export type Lib_Auth_DigestsEqual_Right = string;

export type Lib_Auth_DigestsEqual_Returns = boolean;

export type Lib_Auth_DigestsEqual_LeftBuffer = Buffer;

export type Lib_Auth_DigestsEqual_RightBuffer = Buffer;

/**
 * Lib - Auth - Encode Base64.
 *
 * @since 2.0.0
 */
export type Lib_Auth_EncodeBase64_Bytes = Buffer;

export type Lib_Auth_EncodeBase64_Returns = string;

/**
 * Lib - Auth - Encrypt Credential.
 *
 * @since 2.0.0
 */
export type Lib_Auth_EncryptCredential_Credential = string;

export type Lib_Auth_EncryptCredential_EncryptionKey = string;

export type Lib_Auth_EncryptCredential_Returns = Lib_Auth_EncryptCredential_EncryptedCredential;

export type Lib_Auth_EncryptCredential_Key = Buffer;

export type Lib_Auth_EncryptCredential_Iv = Buffer;

export type Lib_Auth_EncryptCredential_Cipher = CipherGCM;

export type Lib_Auth_EncryptCredential_Ciphertext = Buffer;

export type Lib_Auth_EncryptCredential_AuthTag = Buffer;

export type Lib_Auth_EncryptCredential_EncryptedCredential_AuthTag = string;

export type Lib_Auth_EncryptCredential_EncryptedCredential_Ciphertext = string;

export type Lib_Auth_EncryptCredential_EncryptedCredential_Iv = string;

export type Lib_Auth_EncryptCredential_EncryptedCredential = {
  authTag: Lib_Auth_EncryptCredential_EncryptedCredential_AuthTag;
  ciphertext: Lib_Auth_EncryptCredential_EncryptedCredential_Ciphertext;
  iv: Lib_Auth_EncryptCredential_EncryptedCredential_Iv;
};

/**
 * Lib - Auth - Generate Code.
 *
 * @since 2.0.0
 */
export type Lib_Auth_GenerateCode_Length = number;

export type Lib_Auth_GenerateCode_Returns = string;

export type Lib_Auth_GenerateCode_RandomValue = Buffer;

/**
 * Lib - Auth - Generate Encryption Key.
 *
 * @since 2.0.0
 */
export type Lib_Auth_GenerateEncryptionKey_Returns = string;

/**
 * Lib - Auth - Generate Opaque Token.
 *
 * @since 2.0.0
 */
export type Lib_Auth_GenerateOpaqueToken_Prefix = string;

export type Lib_Auth_GenerateOpaqueToken_ByteLength = number;

export type Lib_Auth_GenerateOpaqueToken_Returns = string;

/**
 * Lib - Auth - Generate Personal Access Token.
 *
 * @since 2.0.0
 */
export type Lib_Auth_GeneratePersonalAccessToken_Returns = string;

export type Lib_Auth_GeneratePersonalAccessToken_RandomValue = string;

/**
 * Lib - Auth - Generate Recovery Codes.
 *
 * @since 2.0.0
 */
export type Lib_Auth_GenerateRecoveryCodes_Returns = string[];

export type Lib_Auth_GenerateRecoveryCodes_Codes = string[];

export type Lib_Auth_GenerateRecoveryCodes_Code = string;

/**
 * Lib - Auth - Generate Setup Code.
 *
 * @since 2.0.0
 */
export type Lib_Auth_GenerateSetupCode_Returns = string;

export type Lib_Auth_GenerateSetupCode_Code = string;

/**
 * Lib - Auth - Get Bearer Token.
 *
 * @since 2.0.0
 */
export type Lib_Auth_GetBearerToken_Request = express.Request;

export type Lib_Auth_GetBearerToken_Returns = string | undefined;

export type Lib_Auth_GetBearerToken_AuthorizationHeader = string | undefined;

export type Lib_Auth_GetBearerToken_AuthorizationPattern = RegExp;

export type Lib_Auth_GetBearerToken_Match = RegExpMatchArray | null;

/**
 * Lib - Auth - Hash Administrator Password.
 *
 * @since 2.0.0
 */
export type Lib_Auth_HashAdministratorPassword_Password = string;

export type Lib_Auth_HashAdministratorPassword_Returns = string;

export type Lib_Auth_HashAdministratorPassword_Salt = Buffer;

export type Lib_Auth_HashAdministratorPassword_DerivedKey = Buffer;

/**
 * Lib - Auth - Hash Personal Access Token.
 *
 * @since 2.0.0
 */
export type Lib_Auth_HashPersonalAccessToken_PersonalAccessToken = string;

export type Lib_Auth_HashPersonalAccessToken_Returns = string;

/**
 * Lib - Auth - Has Personal Access Token Scope.
 *
 * @since 2.0.0
 */
export type Lib_Auth_HasPersonalAccessTokenScope_PersonalAccessToken_Scopes = Shared_EnvironmentVariables_PersonalAccessTokenScope[];

export type Lib_Auth_HasPersonalAccessTokenScope_PersonalAccessToken = {
  scopes: Lib_Auth_HasPersonalAccessTokenScope_PersonalAccessToken_Scopes;
};

export type Lib_Auth_HasPersonalAccessTokenScope_Scope = Shared_EnvironmentVariables_PersonalAccessTokenScope;

export type Lib_Auth_HasPersonalAccessTokenScope_Returns = boolean;

/**
 * Lib - Auth - Normalize Recovery Code.
 *
 * @since 2.0.0
 */
export type Lib_Auth_NormalizeRecoveryCode_Value = string;

export type Lib_Auth_NormalizeRecoveryCode_Returns = string | undefined;

export type Lib_Auth_NormalizeRecoveryCode_Normalized = string;

/**
 * Lib - Auth - Normalize Setup Code.
 *
 * @since 2.0.0
 */
export type Lib_Auth_NormalizeSetupCode_Value = string;

export type Lib_Auth_NormalizeSetupCode_Returns = string | undefined;

export type Lib_Auth_NormalizeSetupCode_Characters = string;

export type Lib_Auth_NormalizeSetupCode_Normalized = string;

/**
 * Lib - Auth - Password Parameters.
 *
 * @since 2.0.0
 */
export type Lib_Auth_PasswordParameters_Memory = number;

export type Lib_Auth_PasswordParameters_Parallelism = number;

export type Lib_Auth_PasswordParameters_Passes = number;

export type Lib_Auth_PasswordParameters_SaltLength = number;

export type Lib_Auth_PasswordParameters_TagLength = number;

export type Lib_Auth_PasswordParameters = {
  memory: Lib_Auth_PasswordParameters_Memory;
  parallelism: Lib_Auth_PasswordParameters_Parallelism;
  passes: Lib_Auth_PasswordParameters_Passes;
  saltLength: Lib_Auth_PasswordParameters_SaltLength;
  tagLength: Lib_Auth_PasswordParameters_TagLength;
};

/**
 * Lib - Auth - Verify Administrator Password.
 *
 * @since 2.0.0
 */
export type Lib_Auth_VerifyAdministratorPassword_Password = string;

export type Lib_Auth_VerifyAdministratorPassword_PasswordHash = string;

export type Lib_Auth_VerifyAdministratorPassword_Returns = boolean;

/**
 * Lib - Auth - Verify Argon2id Password.
 *
 * @since 2.0.0
 */
export type Lib_Auth_VerifyArgon2idPassword_Password = string;

export type Lib_Auth_VerifyArgon2idPassword_PasswordHash = string;

export type Lib_Auth_VerifyArgon2idPassword_Returns = boolean;

export type Lib_Auth_VerifyArgon2idPassword_Parts = string[];

export type Lib_Auth_VerifyArgon2idPassword_ParameterParts = string[];

export type Lib_Auth_VerifyArgon2idPassword_Memory = number;

export type Lib_Auth_VerifyArgon2idPassword_Passes = number;

export type Lib_Auth_VerifyArgon2idPassword_Parallelism = number;

export type Lib_Auth_VerifyArgon2idPassword_Salt = Buffer;

export type Lib_Auth_VerifyArgon2idPassword_ExpectedKey = Buffer;

export type Lib_Auth_VerifyArgon2idPassword_DerivedKey = Buffer;
