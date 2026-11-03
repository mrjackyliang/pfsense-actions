/**
 * Lib - Attempts - Runner - Failures.
 *
 * @since 2.0.0
 */
export type Lib_Attempts_Runner_Failures = Map<string, number[]>;

/**
 * Lib - Attempts - Runner - Get Recent Failures.
 *
 * @since 2.0.0
 */
export type Lib_Attempts_Runner_GetRecentFailures_Key = string;

export type Lib_Attempts_Runner_GetRecentFailures_Now = number;

export type Lib_Attempts_Runner_GetRecentFailures_Returns = number[];

export type Lib_Attempts_Runner_GetRecentFailures_Failures = number[];

/**
 * Lib - Attempts - Runner - Get Retry After Seconds.
 *
 * @since 2.0.0
 */
export type Lib_Attempts_Runner_GetRetryAfterSeconds_Key = string;

export type Lib_Attempts_Runner_GetRetryAfterSeconds_Now = number;

export type Lib_Attempts_Runner_GetRetryAfterSeconds_Returns = number;

export type Lib_Attempts_Runner_GetRetryAfterSeconds_Failures = number[];

export type Lib_Attempts_Runner_GetRetryAfterSeconds_OldestFailure = number | undefined;

/**
 * Lib - Attempts - Runner - Is Allowed.
 *
 * @since 2.0.0
 */
export type Lib_Attempts_Runner_IsAllowed_Key = string;

export type Lib_Attempts_Runner_IsAllowed_Now = number;

export type Lib_Attempts_Runner_IsAllowed_Returns = boolean;

/**
 * Lib - Attempts - Runner - Limit.
 *
 * @since 2.0.0
 */
export type Lib_Attempts_Runner_Limit = number;

/**
 * Lib - Attempts - Runner - Maximum Keys.
 *
 * @since 2.0.0
 */
export type Lib_Attempts_Runner_MaximumKeys = number;

/**
 * Lib - Attempts - Runner - Prune.
 *
 * @since 2.0.0
 */
export type Lib_Attempts_Runner_Prune_Now = number;

export type Lib_Attempts_Runner_Prune_Returns = void;

/**
 * Lib - Attempts - Runner - Record Failure.
 *
 * @since 2.0.0
 */
export type Lib_Attempts_Runner_RecordFailure_Key = string;

export type Lib_Attempts_Runner_RecordFailure_Now = number;

export type Lib_Attempts_Runner_RecordFailure_Returns = void;

export type Lib_Attempts_Runner_RecordFailure_Failures = number[];

/**
 * Lib - Attempts - Runner - Reset.
 *
 * @since 2.0.0
 */
export type Lib_Attempts_Runner_Reset_Key = string;

export type Lib_Attempts_Runner_Reset_Returns = void;

/**
 * Lib - Attempts - Runner - Window Milliseconds.
 *
 * @since 2.0.0
 */
export type Lib_Attempts_Runner_WindowMilliseconds = number;

export type Lib_Attempts_Runner_OnLimitReached = ((key: string) => void) | undefined;

export type Lib_Attempts_Runner_Constructor_OnLimitReached = (key: string) => void;
