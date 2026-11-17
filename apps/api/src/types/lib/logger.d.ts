/**
 * Lib - Logger.
 *
 * @since 2.0.0
 */
export type Lib_Logger_Level = 'debug' | 'error' | 'info' | 'warn';

/**
 * Lib - Logger - Debug Logging.
 *
 * @since 2.1.0
 */
export type Lib_Logger_DebugLogging = boolean;

/**
 * Lib - Logger - Is Debug Logging.
 *
 * @since 2.1.0
 */
export type Lib_Logger_IsDebugLogging_Returns = boolean;

/**
 * Lib - Logger - Log Debug.
 *
 * @since 2.1.0
 */
export type Lib_Logger_LogDebug_Message = string;

export type Lib_Logger_LogDebug_Returns = void;

/**
 * Lib - Logger - Set Debug Logging.
 *
 * @since 2.1.0
 */
export type Lib_Logger_SetDebugLogging_Enabled = boolean;

export type Lib_Logger_SetDebugLogging_Returns = void;

/**
 * Lib - Logger - Emit.
 *
 * @since 2.2.0
 */
export type Lib_Logger_Emit_Level = Lib_Logger_Level;

export type Lib_Logger_Emit_Message = string;

export type Lib_Logger_Emit_Returns = void;

export type Lib_Logger_Emit_LevelLabel = string;

export type Lib_Logger_Emit_Timestamp = string;

export type Lib_Logger_Emit_MessageWithoutCarriageReturns = string;

export type Lib_Logger_Emit_SanitizedMessage = string;

export type Lib_Logger_Emit_Stream = NodeJS.WriteStream;

/**
 * Lib - Logger - Is Enabled.
 *
 * @since 2.0.0
 */
export type Lib_Logger_IsEnabled_ConfiguredLevel = string;

export type Lib_Logger_IsEnabled_Level = Lib_Logger_Level;

export type Lib_Logger_IsEnabled_MinimumLevel = Lib_Logger_Level;

export type Lib_Logger_IsEnabled_Returns = boolean;

export type Lib_Logger_IsEnabled_Weights = Record<Lib_Logger_Level, number>;

/**
 * Lib - Logger - Log Error.
 *
 * @since 2.0.0
 */
export type Lib_Logger_LogError_Message = string;

export type Lib_Logger_LogError_Returns = void;

/**
 * Lib - Logger - Log Info.
 *
 * @since 2.0.0
 */
export type Lib_Logger_LogInfo_Message = string;

export type Lib_Logger_LogInfo_Returns = void;

/**
 * Lib - Logger - Log Warn.
 *
 * @since 2.0.0
 */
export type Lib_Logger_LogWarn_Message = string;

export type Lib_Logger_LogWarn_Returns = void;
