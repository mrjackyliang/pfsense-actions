import type { DatabaseSync } from 'node:sqlite';

import type { Runner as State } from '@/lib/state.js';
import type {
  Lib_State_Runner_ClaimInstallation_Returns,
  Lib_State_Runner_CreateSession_Returns,
  Lib_State_Runner_CreateSignInChallenge_Returns,
  Lib_State_Runner_CreateToken_Returns,
  Lib_State_Runner_EnableTotp_Returns,
  Lib_State_Runner_GetAdministrator_Returns,
  Lib_State_Runner_PrepareSetupClaim_Returns,
} from '@/types/lib/state.d.ts';
import type { Shared_EnvironmentVariables } from '@/types/shared.d.ts';

/**
 * Tests - Lib - State - Administrator.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_Administrator = Lib_State_Runner_GetAdministrator_Returns;

/**
 * Tests - Lib - State - Challenge.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_Challenge = Lib_State_Runner_CreateSignInChallenge_Returns;

/**
 * Tests - Lib - State - Claim Result.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_ClaimResult = Lib_State_Runner_ClaimInstallation_Returns;

/**
 * Tests - Lib - State - Create Claimed State.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_CreateClaimedState_Returns = State;

/**
 * Tests - Lib - State - Create Environment.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_CreateEnvironment_Overrides = Partial<Shared_EnvironmentVariables>;

export type Tests_Lib_State_CreateEnvironment_Returns = Shared_EnvironmentVariables;

/**
 * Tests - Lib - State - Created Token.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_CreatedToken = Lib_State_Runner_CreateToken_Returns;

/**
 * Tests - Lib - State - Data Directory.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_DataDirectory = string | undefined;

/**
 * Tests - Lib - State - Database.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_Database = DatabaseSync;

/**
 * Tests - Lib - State - Get Data Directory.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_GetDataDirectory_Returns = string;

/**
 * Tests - Lib - State - Key Path.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_KeyPath = string;

/**
 * Tests - Lib - State - Mode.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_Mode = string;

/**
 * Tests - Lib - State - Old Key.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_OldKey = string;

/**
 * Tests - Lib - State - Recovery Codes.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_RecoveryCodes = Lib_State_Runner_EnableTotp_Returns;

/**
 * Tests - Lib - State - Secret.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_Secret = string;

/**
 * Tests - Lib - State - Session.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_Session = Lib_State_Runner_CreateSession_Returns;

/**
 * Tests - Lib - State - Setup Claim.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_SetupClaim = Lib_State_Runner_PrepareSetupClaim_Returns;

/**
 * Tests - Lib - State - State.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_State = State;

/**
 * Tests - Lib - State - Token.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_Token = string;

/**
 * Tests - Lib - State - Token ID.
 *
 * @since 2.0.0
 */
export type Tests_Lib_State_TokenId = string;
