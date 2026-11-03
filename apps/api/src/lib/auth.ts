import {
  argon2Sync,
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

import {
  textBearerAuthorization,
  textPersonalAccessToken,
  textRecoveryCode,
  textSetupCode,
  textWhitespace,
} from './regex.js';

import type {
  Lib_Auth_AuthenticateRawPersonalAccessToken_ExpectedTokenHashBuffer,
  Lib_Auth_AuthenticateRawPersonalAccessToken_ExpiresAt,
  Lib_Auth_AuthenticateRawPersonalAccessToken_IsMatch,
  Lib_Auth_AuthenticateRawPersonalAccessToken_MatchedToken,
  Lib_Auth_AuthenticateRawPersonalAccessToken_Now,
  Lib_Auth_AuthenticateRawPersonalAccessToken_PersonalAccessToken,
  Lib_Auth_AuthenticateRawPersonalAccessToken_PersonalAccessTokens,
  Lib_Auth_AuthenticateRawPersonalAccessToken_ProvidedTokenHash,
  Lib_Auth_AuthenticateRawPersonalAccessToken_ProvidedTokenHashBuffer,
  Lib_Auth_AuthenticateRawPersonalAccessToken_Returns,
  Lib_Auth_DecryptCredential_AuthTag,
  Lib_Auth_DecryptCredential_Cipher,
  Lib_Auth_DecryptCredential_Ciphertext,
  Lib_Auth_DecryptCredential_EncryptedCredential,
  Lib_Auth_DecryptCredential_EncryptionKey,
  Lib_Auth_DecryptCredential_Iv,
  Lib_Auth_DecryptCredential_Key,
  Lib_Auth_DecryptCredential_Plaintext,
  Lib_Auth_DecryptCredential_Returns,
  Lib_Auth_DigestsEqual_Left,
  Lib_Auth_DigestsEqual_LeftBuffer,
  Lib_Auth_DigestsEqual_Returns,
  Lib_Auth_DigestsEqual_Right,
  Lib_Auth_DigestsEqual_RightBuffer,
  Lib_Auth_DigestValue_Returns,
  Lib_Auth_DigestValue_Value,
  Lib_Auth_EncodeBase64_Bytes,
  Lib_Auth_EncodeBase64_Returns,
  Lib_Auth_EncryptCredential_AuthTag,
  Lib_Auth_EncryptCredential_Cipher,
  Lib_Auth_EncryptCredential_Ciphertext,
  Lib_Auth_EncryptCredential_Credential,
  Lib_Auth_EncryptCredential_EncryptionKey,
  Lib_Auth_EncryptCredential_Iv,
  Lib_Auth_EncryptCredential_Key,
  Lib_Auth_EncryptCredential_Returns,
  Lib_Auth_GenerateCode_Alphabet,
  Lib_Auth_GenerateCode_Length,
  Lib_Auth_GenerateCode_RandomValue,
  Lib_Auth_GenerateCode_Returns,
  Lib_Auth_GenerateEncryptionKey_Returns,
  Lib_Auth_GenerateOpaqueToken_ByteLength,
  Lib_Auth_GenerateOpaqueToken_Prefix,
  Lib_Auth_GenerateOpaqueToken_Returns,
  Lib_Auth_GeneratePersonalAccessToken_RandomValue,
  Lib_Auth_GeneratePersonalAccessToken_Returns,
  Lib_Auth_GenerateRecoveryCodes_Code,
  Lib_Auth_GenerateRecoveryCodes_Codes,
  Lib_Auth_GenerateRecoveryCodes_Returns,
  Lib_Auth_GenerateSetupCode_Code,
  Lib_Auth_GenerateSetupCode_Returns,
  Lib_Auth_GetBearerToken_AuthorizationHeader,
  Lib_Auth_GetBearerToken_AuthorizationPattern,
  Lib_Auth_GetBearerToken_Match,
  Lib_Auth_GetBearerToken_Request,
  Lib_Auth_GetBearerToken_Returns,
  Lib_Auth_HashAdministratorPassword_DerivedKey,
  Lib_Auth_HashAdministratorPassword_Password,
  Lib_Auth_HashAdministratorPassword_Returns,
  Lib_Auth_HashAdministratorPassword_Salt,
  Lib_Auth_HashPersonalAccessToken_PersonalAccessToken,
  Lib_Auth_HashPersonalAccessToken_Returns,
  Lib_Auth_HasPersonalAccessTokenScope_PersonalAccessToken,
  Lib_Auth_HasPersonalAccessTokenScope_Returns,
  Lib_Auth_HasPersonalAccessTokenScope_Scope,
  Lib_Auth_NormalizeRecoveryCode_Normalized,
  Lib_Auth_NormalizeRecoveryCode_Returns,
  Lib_Auth_NormalizeRecoveryCode_Value,
  Lib_Auth_NormalizeSetupCode_Characters,
  Lib_Auth_NormalizeSetupCode_Normalized,
  Lib_Auth_NormalizeSetupCode_Returns,
  Lib_Auth_NormalizeSetupCode_Value,
  Lib_Auth_PasswordParameters,
  Lib_Auth_VerifyAdministratorPassword_Password,
  Lib_Auth_VerifyAdministratorPassword_PasswordHash,
  Lib_Auth_VerifyAdministratorPassword_Returns,
  Lib_Auth_VerifyArgon2idPassword_DerivedKey,
  Lib_Auth_VerifyArgon2idPassword_ExpectedKey,
  Lib_Auth_VerifyArgon2idPassword_Memory,
  Lib_Auth_VerifyArgon2idPassword_Parallelism,
  Lib_Auth_VerifyArgon2idPassword_ParameterParts,
  Lib_Auth_VerifyArgon2idPassword_Parts,
  Lib_Auth_VerifyArgon2idPassword_Passes,
  Lib_Auth_VerifyArgon2idPassword_Password,
  Lib_Auth_VerifyArgon2idPassword_PasswordHash,
  Lib_Auth_VerifyArgon2idPassword_Returns,
  Lib_Auth_VerifyArgon2idPassword_Salt,
} from '@/types/lib/auth.d.ts';

/**
 * Lib - Auth - Password Parameters.
 *
 * Matches the Argon2id cost used by every appliance so stored hashes stay comparable.
 * The encoded hash carries these values, so later cost changes can still verify old hashes.
 *
 * @since 2.0.0
 */
const passwordParameters: Lib_Auth_PasswordParameters = {
  memory: 64 * 1024,
  parallelism: 2,
  passes: 3,
  saltLength: 16,
  tagLength: 32,
};

/**
 * Lib - Auth - Code Alphabet.
 *
 * Omits look-alike characters such as 0, O, 1, and I from setup and recovery codes.
 * Thirty-two symbols divide 256 evenly, so each random byte maps without bias.
 *
 * @since 2.0.0
 */
const codeAlphabet: Lib_Auth_GenerateCode_Alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Lib - Auth - Decrypt Credential.
 *
 * Opens one AES-256-GCM value using the deployment-owned encryption key.
 * Authentication failure is fatal so corrupted or substituted credentials fail closed.
 *
 * @param {Lib_Auth_DecryptCredential_EncryptedCredential} encryptedCredential - Encrypted credential.
 * @param {Lib_Auth_DecryptCredential_EncryptionKey}       encryptionKey       - Encryption key.
 *
 * @returns {Lib_Auth_DecryptCredential_Returns}
 *
 * @since 2.0.0
 */
export function decryptCredential(encryptedCredential: Lib_Auth_DecryptCredential_EncryptedCredential, encryptionKey: Lib_Auth_DecryptCredential_EncryptionKey): Lib_Auth_DecryptCredential_Returns {
  const key: Lib_Auth_DecryptCredential_Key = Buffer.from(encryptionKey, 'hex');
  const iv: Lib_Auth_DecryptCredential_Iv = Buffer.from(encryptedCredential['iv'], 'base64url');
  const authTag: Lib_Auth_DecryptCredential_AuthTag = Buffer.from(encryptedCredential['authTag'], 'base64url');
  const ciphertext: Lib_Auth_DecryptCredential_Ciphertext = Buffer.from(encryptedCredential['ciphertext'], 'base64url');
  const cipher: Lib_Auth_DecryptCredential_Cipher = createDecipheriv('aes-256-gcm', key, iv);

  cipher.setAuthTag(authTag);

  const plaintext: Lib_Auth_DecryptCredential_Plaintext = Buffer.concat([
    cipher.update(ciphertext),
    cipher.final(),
  ]);

  return plaintext.toString('utf8');
}

/**
 * Lib - Auth - Encrypt Credential.
 *
 * Seals one secret with an independent random IV and authentication tag.
 * The database stores only ciphertext while the key stays outside the table.
 *
 * @param {Lib_Auth_EncryptCredential_Credential}    credential    - Credential.
 * @param {Lib_Auth_EncryptCredential_EncryptionKey} encryptionKey - Encryption key.
 *
 * @returns {Lib_Auth_EncryptCredential_Returns}
 *
 * @since 2.0.0
 */
export function encryptCredential(credential: Lib_Auth_EncryptCredential_Credential, encryptionKey: Lib_Auth_EncryptCredential_EncryptionKey): Lib_Auth_EncryptCredential_Returns {
  const key: Lib_Auth_EncryptCredential_Key = Buffer.from(encryptionKey, 'hex');
  const iv: Lib_Auth_EncryptCredential_Iv = randomBytes(12);
  const cipher: Lib_Auth_EncryptCredential_Cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext: Lib_Auth_EncryptCredential_Ciphertext = Buffer.concat([
    cipher.update(credential, 'utf8'),
    cipher.final(),
  ]);
  const authTag: Lib_Auth_EncryptCredential_AuthTag = cipher.getAuthTag();

  return {
    authTag: authTag.toString('base64url'),
    ciphertext: ciphertext.toString('base64url'),
    iv: iv.toString('base64url'),
  };
}

/**
 * Lib - Auth - Get Bearer Token.
 *
 * Extracts one well-formed personal access token from the Authorization header.
 * Missing, foreign-scheme, and malformed values all return undefined.
 *
 * @param {Lib_Auth_GetBearerToken_Request} request - Request.
 *
 * @returns {Lib_Auth_GetBearerToken_Returns}
 *
 * @since 2.0.0
 */
export function getBearerToken(request: Lib_Auth_GetBearerToken_Request): Lib_Auth_GetBearerToken_Returns {
  const authorizationHeader: Lib_Auth_GetBearerToken_AuthorizationHeader = request.get('Authorization');

  if (authorizationHeader === undefined) {
    return undefined;
  }

  const authorizationPattern: Lib_Auth_GetBearerToken_AuthorizationPattern = new RegExp(textBearerAuthorization, 'i');
  const match: Lib_Auth_GetBearerToken_Match = authorizationHeader.match(authorizationPattern);

  if (
    match === null
    || match[1] === undefined
    || textPersonalAccessToken.test(match[1]) === false
  ) {
    return undefined;
  }

  return match[1];
}

/**
 * Lib - Auth - Authenticate Raw Personal Access Token.
 *
 * Resolves an already extracted credential against stored hashes and expiry metadata.
 * Expired, malformed, and unknown credentials share the same rejected result.
 *
 * @param {Lib_Auth_AuthenticateRawPersonalAccessToken_PersonalAccessTokens} personalAccessTokens - Personal access tokens.
 * @param {Lib_Auth_AuthenticateRawPersonalAccessToken_PersonalAccessToken}  personalAccessToken  - Personal access token.
 * @param {Lib_Auth_AuthenticateRawPersonalAccessToken_Now}                  now                  - Now.
 *
 * @returns {Lib_Auth_AuthenticateRawPersonalAccessToken_Returns}
 *
 * @since 2.0.0
 */
export function authenticateRawPersonalAccessToken(personalAccessTokens: Lib_Auth_AuthenticateRawPersonalAccessToken_PersonalAccessTokens, personalAccessToken: Lib_Auth_AuthenticateRawPersonalAccessToken_PersonalAccessToken, now: Lib_Auth_AuthenticateRawPersonalAccessToken_Now = new Date()): Lib_Auth_AuthenticateRawPersonalAccessToken_Returns {
  if (textPersonalAccessToken.test(personalAccessToken) === false) {
    return undefined;
  }

  const providedTokenHash: Lib_Auth_AuthenticateRawPersonalAccessToken_ProvidedTokenHash = hashPersonalAccessToken(personalAccessToken);
  const providedTokenHashBuffer: Lib_Auth_AuthenticateRawPersonalAccessToken_ProvidedTokenHashBuffer = Buffer.from(providedTokenHash, 'hex');

  let matchedToken: Lib_Auth_AuthenticateRawPersonalAccessToken_MatchedToken = undefined;

  for (const configuredPersonalAccessToken of personalAccessTokens) {
    const expectedTokenHashBuffer: Lib_Auth_AuthenticateRawPersonalAccessToken_ExpectedTokenHashBuffer = Buffer.from(configuredPersonalAccessToken['tokenHash'], 'hex');
    const isMatch: Lib_Auth_AuthenticateRawPersonalAccessToken_IsMatch = timingSafeEqual(providedTokenHashBuffer, expectedTokenHashBuffer);

    if (isMatch === true) {
      matchedToken = configuredPersonalAccessToken;
    }
  }

  if (matchedToken === undefined) {
    return undefined;
  }

  if (matchedToken['expiresAt'] !== undefined) {
    const expiresAt: Lib_Auth_AuthenticateRawPersonalAccessToken_ExpiresAt = Date.parse(matchedToken['expiresAt']);

    if (expiresAt <= now.getTime()) {
      return undefined;
    }
  }

  return {
    id: matchedToken['id'],
    scopes: matchedToken['scopes'],
  };
}

/**
 * Lib - Auth - Digest Value.
 *
 * Derives the fixed-length SHA-256 value stored for random session, CSRF, and code values.
 * High-entropy inputs need no password hashing, and the digest allows indexed lookup.
 *
 * @param {Lib_Auth_DigestValue_Value} value - Value.
 *
 * @returns {Lib_Auth_DigestValue_Returns}
 *
 * @since 2.0.0
 */
export function digestValue(value: Lib_Auth_DigestValue_Value): Lib_Auth_DigestValue_Returns {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Lib - Auth - Digests Equal.
 *
 * Compares two hexadecimal digests in constant time.
 * Values of different lengths are rejected before the timing-safe comparison.
 *
 * @param {Lib_Auth_DigestsEqual_Left}  left  - Left.
 * @param {Lib_Auth_DigestsEqual_Right} right - Right.
 *
 * @returns {Lib_Auth_DigestsEqual_Returns}
 *
 * @since 2.0.0
 */
export function digestsEqual(left: Lib_Auth_DigestsEqual_Left, right: Lib_Auth_DigestsEqual_Right): Lib_Auth_DigestsEqual_Returns {
  const leftBuffer: Lib_Auth_DigestsEqual_LeftBuffer = Buffer.from(left, 'utf8');
  const rightBuffer: Lib_Auth_DigestsEqual_RightBuffer = Buffer.from(right, 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

/**
 * Lib - Auth - Generate Encryption Key.
 *
 * Creates the 32-byte hexadecimal key used when a deployment does not supply one.
 * The value has the same shape as the optional encryption key environment variable.
 *
 * @returns {Lib_Auth_GenerateEncryptionKey_Returns}
 *
 * @since 2.0.0
 */
export function generateEncryptionKey(): Lib_Auth_GenerateEncryptionKey_Returns {
  return randomBytes(32).toString('hex');
}

/**
 * Lib - Auth - Generate Opaque Token.
 *
 * Creates a prefixed random Base64URL value for browser sessions and CSRF protection.
 * Only the digest of the returned value is ever written to SQLite.
 *
 * @param {Lib_Auth_GenerateOpaqueToken_Prefix}     prefix     - Prefix.
 * @param {Lib_Auth_GenerateOpaqueToken_ByteLength} byteLength - Byte length.
 *
 * @returns {Lib_Auth_GenerateOpaqueToken_Returns}
 *
 * @since 2.0.0
 */
export function generateOpaqueToken(prefix: Lib_Auth_GenerateOpaqueToken_Prefix, byteLength: Lib_Auth_GenerateOpaqueToken_ByteLength): Lib_Auth_GenerateOpaqueToken_Returns {
  return `${prefix}${randomBytes(byteLength).toString('base64url')}`;
}

/**
 * Lib - Auth - Generate Personal Access Token.
 *
 * Creates a high-entropy token suitable for one-time provisioning to a client.
 * The raw value is never required by the service after its hash is stored.
 *
 * @returns {Lib_Auth_GeneratePersonalAccessToken_Returns}
 *
 * @since 2.0.0
 */
export function generatePersonalAccessToken(): Lib_Auth_GeneratePersonalAccessToken_Returns {
  const randomValue: Lib_Auth_GeneratePersonalAccessToken_RandomValue = randomBytes(32).toString('base64url');

  return `pfa_${randomValue}`;
}

/**
 * Lib - Auth - Generate Recovery Codes.
 *
 * Creates ten single-use codes shown once when the authenticator app is turned on.
 * Each code holds fifty bits of randomness split into two readable groups.
 *
 * @returns {Lib_Auth_GenerateRecoveryCodes_Returns}
 *
 * @since 2.0.0
 */
export function generateRecoveryCodes(): Lib_Auth_GenerateRecoveryCodes_Returns {
  const codes: Lib_Auth_GenerateRecoveryCodes_Codes = [];

  while (codes.length < 10) {
    const code: Lib_Auth_GenerateRecoveryCodes_Code = generateCode(10);

    codes.push(`${code.slice(0, 5)}-${code.slice(5)}`);
  }

  return codes;
}

/**
 * Lib - Auth - Generate Setup Code.
 *
 * Creates the one-time code printed to the container log for first-run setup.
 * Three groups of five symbols hold seventy-five bits of randomness.
 *
 * @returns {Lib_Auth_GenerateSetupCode_Returns}
 *
 * @since 2.0.0
 */
export function generateSetupCode(): Lib_Auth_GenerateSetupCode_Returns {
  const code: Lib_Auth_GenerateSetupCode_Code = generateCode(15);

  return `${code.slice(0, 5)}-${code.slice(5, 10)}-${code.slice(10)}`;
}

/**
 * Lib - Auth - Hash Administrator Password.
 *
 * Derives an Argon2id hash in the standard encoded form used by every appliance.
 * Fixed costs keep verification predictable and the salt makes every hash unique.
 *
 * @param {Lib_Auth_HashAdministratorPassword_Password} password - Password.
 *
 * @returns {Lib_Auth_HashAdministratorPassword_Returns}
 *
 * @since 2.0.0
 */
export function hashAdministratorPassword(password: Lib_Auth_HashAdministratorPassword_Password): Lib_Auth_HashAdministratorPassword_Returns {
  const salt: Lib_Auth_HashAdministratorPassword_Salt = randomBytes(passwordParameters['saltLength']);
  const derivedKey: Lib_Auth_HashAdministratorPassword_DerivedKey = argon2Sync('argon2id', {
    memory: passwordParameters['memory'],
    message: password,
    nonce: salt,
    parallelism: passwordParameters['parallelism'],
    passes: passwordParameters['passes'],
    tagLength: passwordParameters['tagLength'],
  });

  return `$argon2id$v=19$m=${passwordParameters['memory']},t=${passwordParameters['passes']},p=${passwordParameters['parallelism']}$${encodeBase64(salt)}$${encodeBase64(derivedKey)}`;
}

/**
 * Lib - Auth - Hash Personal Access Token.
 *
 * Derives the fixed-length value stored in the server-side token table.
 * High-entropy raw tokens remain exclusively with their clients.
 *
 * @param {Lib_Auth_HashPersonalAccessToken_PersonalAccessToken} personalAccessToken - Personal access token.
 *
 * @returns {Lib_Auth_HashPersonalAccessToken_Returns}
 *
 * @since 2.0.0
 */
export function hashPersonalAccessToken(personalAccessToken: Lib_Auth_HashPersonalAccessToken_PersonalAccessToken): Lib_Auth_HashPersonalAccessToken_Returns {
  return digestValue(personalAccessToken);
}

/**
 * Lib - Auth - Has Personal Access Token Scope.
 *
 * Checks one authenticated token against the exact capability required by a route.
 * Scopes are deliberately closed rather than accepting arbitrary permission strings.
 *
 * @param {Lib_Auth_HasPersonalAccessTokenScope_PersonalAccessToken} personalAccessToken - Personal access token.
 * @param {Lib_Auth_HasPersonalAccessTokenScope_Scope}               scope               - Scope.
 *
 * @returns {Lib_Auth_HasPersonalAccessTokenScope_Returns}
 *
 * @since 2.0.0
 */
export function hasPersonalAccessTokenScope(personalAccessToken: Lib_Auth_HasPersonalAccessTokenScope_PersonalAccessToken, scope: Lib_Auth_HasPersonalAccessTokenScope_Scope): Lib_Auth_HasPersonalAccessTokenScope_Returns {
  return personalAccessToken['scopes'].includes(scope);
}

/**
 * Lib - Auth - Normalize Recovery Code.
 *
 * Uppercases a typed recovery code and removes the spaces and dashes people add.
 * Values that still do not match the generated shape return undefined.
 *
 * @param {Lib_Auth_NormalizeRecoveryCode_Value} value - Value.
 *
 * @returns {Lib_Auth_NormalizeRecoveryCode_Returns}
 *
 * @since 2.0.0
 */
export function normalizeRecoveryCode(value: Lib_Auth_NormalizeRecoveryCode_Value): Lib_Auth_NormalizeRecoveryCode_Returns {
  const normalized: Lib_Auth_NormalizeRecoveryCode_Normalized = value.toUpperCase().split(textWhitespace).join('').replaceAll('-', '');

  if (textRecoveryCode.test(normalized) === false) {
    return undefined;
  }

  return normalized;
}

/**
 * Lib - Auth - Normalize Setup Code.
 *
 * Accepts the setup code with or without dashes and in any letter case.
 * The result always uses the printed three-group form, or undefined when invalid.
 *
 * @param {Lib_Auth_NormalizeSetupCode_Value} value - Value.
 *
 * @returns {Lib_Auth_NormalizeSetupCode_Returns}
 *
 * @since 2.0.0
 */
export function normalizeSetupCode(value: Lib_Auth_NormalizeSetupCode_Value): Lib_Auth_NormalizeSetupCode_Returns {
  const characters: Lib_Auth_NormalizeSetupCode_Characters = value.toUpperCase().split(textWhitespace).join('').replaceAll('-', '');
  const normalized: Lib_Auth_NormalizeSetupCode_Normalized = `${characters.slice(0, 5)}-${characters.slice(5, 10)}-${characters.slice(10)}`;

  if (characters.length !== 15 || textSetupCode.test(normalized) === false) {
    return undefined;
  }

  return normalized;
}

/**
 * Lib - Auth - Verify Administrator Password.
 *
 * Checks a password against its stored Argon2id hash.
 * Malformed stored hashes return the same false result as an incorrect password.
 *
 * @param {Lib_Auth_VerifyAdministratorPassword_Password}     password     - Password.
 * @param {Lib_Auth_VerifyAdministratorPassword_PasswordHash} passwordHash - Password hash.
 *
 * @returns {Lib_Auth_VerifyAdministratorPassword_Returns}
 *
 * @since 2.0.0
 */
export function verifyAdministratorPassword(password: Lib_Auth_VerifyAdministratorPassword_Password, passwordHash: Lib_Auth_VerifyAdministratorPassword_PasswordHash): Lib_Auth_VerifyAdministratorPassword_Returns {
  return verifyArgon2idPassword(password, passwordHash);
}

/**
 * Lib - Auth - Encode Base64.
 *
 * Writes bytes in the unpadded standard Base64 form used by encoded Argon2 hashes.
 * Padding only ever appears at the end, so removing every equals sign is safe.
 *
 * @param {Lib_Auth_EncodeBase64_Bytes} bytes - Bytes.
 *
 * @returns {Lib_Auth_EncodeBase64_Returns}
 *
 * @since 2.0.0
 */
function encodeBase64(bytes: Lib_Auth_EncodeBase64_Bytes): Lib_Auth_EncodeBase64_Returns {
  return bytes.toString('base64').replaceAll('=', '');
}

/**
 * Lib - Auth - Generate Code.
 *
 * Draws characters from the shared code alphabet using the system random source.
 * Each byte maps to one symbol, and the alphabet size keeps the mapping unbiased.
 *
 * @param {Lib_Auth_GenerateCode_Length} length - Length.
 *
 * @returns {Lib_Auth_GenerateCode_Returns}
 *
 * @since 2.0.0
 */
function generateCode(length: Lib_Auth_GenerateCode_Length): Lib_Auth_GenerateCode_Returns {
  const randomValue: Lib_Auth_GenerateCode_RandomValue = randomBytes(length);

  return [...randomValue].map((byte) => codeAlphabet[byte % codeAlphabet.length]).join('');
}

/**
 * Lib - Auth - Verify Argon2id Password.
 *
 * Parses one encoded Argon2id hash, bounds its costs, and recomputes the tag.
 * Unsupported versions, costs, or lengths fail closed.
 *
 * @param {Lib_Auth_VerifyArgon2idPassword_Password}     password     - Password.
 * @param {Lib_Auth_VerifyArgon2idPassword_PasswordHash} passwordHash - Password hash.
 *
 * @returns {Lib_Auth_VerifyArgon2idPassword_Returns}
 *
 * @since 2.0.0
 */
function verifyArgon2idPassword(password: Lib_Auth_VerifyArgon2idPassword_Password, passwordHash: Lib_Auth_VerifyArgon2idPassword_PasswordHash): Lib_Auth_VerifyArgon2idPassword_Returns {
  const parts: Lib_Auth_VerifyArgon2idPassword_Parts = passwordHash.split('$');

  if (
    parts.length !== 6
    || parts[0] !== ''
    || parts[1] !== 'argon2id'
    || parts[2] !== 'v=19'
    || parts[3] === undefined
    || parts[4] === undefined
    || parts[5] === undefined
  ) {
    return false;
  }

  const parameterParts: Lib_Auth_VerifyArgon2idPassword_ParameterParts = parts[3].split(',');

  if (
    parameterParts.length !== 3
    || parameterParts[0] === undefined
    || parameterParts[1] === undefined
    || parameterParts[2] === undefined
    || parameterParts[0].startsWith('m=') === false
    || parameterParts[1].startsWith('t=') === false
    || parameterParts[2].startsWith('p=') === false
  ) {
    return false;
  }

  const memory: Lib_Auth_VerifyArgon2idPassword_Memory = Number(parameterParts[0].slice(2));
  const passes: Lib_Auth_VerifyArgon2idPassword_Passes = Number(parameterParts[1].slice(2));
  const parallelism: Lib_Auth_VerifyArgon2idPassword_Parallelism = Number(parameterParts[2].slice(2));

  if (
    Number.isInteger(memory) === false
    || Number.isInteger(passes) === false
    || Number.isInteger(parallelism) === false
    || memory < 8 * 1024
    || memory > 1024 * 1024
    || passes < 1
    || passes > 20
    || parallelism < 1
    || parallelism > 32
  ) {
    return false;
  }

  const salt: Lib_Auth_VerifyArgon2idPassword_Salt = Buffer.from(parts[4], 'base64');
  const expectedKey: Lib_Auth_VerifyArgon2idPassword_ExpectedKey = Buffer.from(parts[5], 'base64');

  if (
    salt.length < 16
    || salt.length > 64
    || expectedKey.length < 16
    || expectedKey.length > 64
  ) {
    return false;
  }

  const derivedKey: Lib_Auth_VerifyArgon2idPassword_DerivedKey = argon2Sync('argon2id', {
    memory,
    message: password,
    nonce: salt,
    parallelism,
    passes,
    tagLength: expectedKey.length,
  });

  return timingSafeEqual(derivedKey, expectedKey);
}
