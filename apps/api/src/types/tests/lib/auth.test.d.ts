import type express from 'express';

import type {
  authenticateRawPersonalAccessToken,
  encryptCredential,
} from '@/lib/auth.js';
import type { Shared_EnvironmentVariables_PersonalAccessToken } from '@/types/shared.d.ts';

/**
 * Tests - Lib - Auth - Authenticated Personal Access Token.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Auth_AuthenticatedPersonalAccessToken = ReturnType<typeof authenticateRawPersonalAccessToken>;

/**
 * Tests - Lib - Auth - Create Request.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Auth_CreateRequest_Authorization = string | undefined;

export type Tests_Lib_Auth_CreateRequest_Returns = express.Request;

export type Tests_Lib_Auth_CreateRequest_Request = express.Request;

export type Tests_Lib_Auth_CreateRequest_Unknown = unknown;

/**
 * Tests - Lib - Auth - Encrypted Credential.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Auth_EncryptedCredential = ReturnType<typeof encryptCredential>;

export type Tests_Lib_Auth_EncryptionKey = string;

export type Tests_Lib_Auth_PasswordHash = string;

/**
 * Tests - Lib - Auth - Personal Access Token.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Auth_PersonalAccessToken = string;

export type Tests_Lib_Auth_PersonalAccessTokens = Shared_EnvironmentVariables_PersonalAccessToken[];

/**
 * Tests - Lib - Auth - Recovery Codes.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Auth_RecoveryCodes = string[];

/**
 * Tests - Lib - Auth - Setup Code.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Auth_SetupCode = string;
