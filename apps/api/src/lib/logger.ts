import type {
  Lib_Logger_DebugLogging,
  Lib_Logger_Emit_Level,
  Lib_Logger_Emit_LevelLabel,
  Lib_Logger_Emit_Message,
  Lib_Logger_Emit_MessageWithoutCarriageReturns,
  Lib_Logger_Emit_Returns,
  Lib_Logger_Emit_SanitizedMessage,
  Lib_Logger_Emit_Stream,
  Lib_Logger_Emit_Timestamp,
  Lib_Logger_IsDebugLogging_Returns,
  Lib_Logger_IsEnabled_ConfiguredLevel,
  Lib_Logger_IsEnabled_Level,
  Lib_Logger_IsEnabled_MinimumLevel,
  Lib_Logger_IsEnabled_Returns,
  Lib_Logger_IsEnabled_Weights,
  Lib_Logger_LogDebug_Message,
  Lib_Logger_LogDebug_Returns,
  Lib_Logger_LogError_Message,
  Lib_Logger_LogError_Returns,
  Lib_Logger_LogInfo_Message,
  Lib_Logger_LogInfo_Returns,
  Lib_Logger_LogWarn_Message,
  Lib_Logger_LogWarn_Returns,
  Lib_Logger_SetDebugLogging_Enabled,
  Lib_Logger_SetDebugLogging_Returns,
} from '@/types/lib/logger.d.ts';

/**
 * Lib - Logger - Debug Logging.
 *
 * Whether DEBUG lines are written, as set by Debug logging on the Connection page.
 * It starts off and follows the saved setting once the server reads it.
 *
 * @since 2.1.0
 */
let debugLogging: Lib_Logger_DebugLogging = false;

/**
 * Lib - Logger - Is Enabled.
 *
 * Applies the configured production log threshold without a runtime framework dependency.
 * Debug and automatic settings retain informational output while warn and error narrow it.
 * DEBUG lines also need Debug logging turned on, and warn and error hide them too.
 *
 * @param {Lib_Logger_IsEnabled_Level} level - Level.
 *
 * @returns {Lib_Logger_IsEnabled_Returns}
 *
 * @since 2.0.0
 */
function isEnabled(level: Lib_Logger_IsEnabled_Level): Lib_Logger_IsEnabled_Returns {
  const weights: Lib_Logger_IsEnabled_Weights = {
    debug: 10,
    error: 40,
    info: 20,
    warn: 30,
  };
  const configuredLevel: Lib_Logger_IsEnabled_ConfiguredLevel = (process.env['LOG_LEVEL'] ?? '').toLowerCase();
  let minimumLevel: Lib_Logger_IsEnabled_MinimumLevel = 'info';

  if (configuredLevel === 'warn' || configuredLevel === 'error') {
    minimumLevel = configuredLevel;
  }

  if (level === 'debug') {
    return debugLogging === true && minimumLevel === 'info';
  }

  return weights[level] >= weights[minimumLevel];
}

/**
 * Lib - Logger - Emit.
 *
 * Writes one timestamped component line to the level-appropriate process stream.
 * Line breaks are flattened so each emitted record remains one plain-text fact.
 *
 * @param {Lib_Logger_Emit_Level}   level   - Level.
 * @param {Lib_Logger_Emit_Message} message - Message.
 *
 * @returns {Lib_Logger_Emit_Returns}
 *
 * @since 2.2.0
 */
function emit(level: Lib_Logger_Emit_Level, message: Lib_Logger_Emit_Message): Lib_Logger_Emit_Returns {
  if (isEnabled(level) === false) {
    return;
  }

  const levelLabel: Lib_Logger_Emit_LevelLabel = level.toUpperCase();
  const timestamp: Lib_Logger_Emit_Timestamp = new Date().toISOString();
  const messageWithoutCarriageReturns: Lib_Logger_Emit_MessageWithoutCarriageReturns = message.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
  const sanitizedMessage: Lib_Logger_Emit_SanitizedMessage = messageWithoutCarriageReturns.replaceAll('\n', ' ');
  const stream: Lib_Logger_Emit_Stream = (level === 'warn' || level === 'error') ? process.stderr : process.stdout;

  stream.write(`${timestamp} ${levelLabel} pfsense-actions: ${sanitizedMessage}\n`);

  return;
}

/**
 * Lib - Logger - Is Debug Logging.
 *
 * Says whether Debug logging is on, so a caller can skip timing work while it's off.
 * The answer follows the latest setDebugLogging call.
 *
 * @returns {Lib_Logger_IsDebugLogging_Returns}
 *
 * @since 2.1.0
 */
export function isDebugLogging(): Lib_Logger_IsDebugLogging_Returns {
  return debugLogging;
}

/**
 * Lib - Logger - Log Debug.
 *
 * Writes a DEBUG line while Debug logging is on and the threshold permits info.
 * Callers name the work, its outcome, and how long it took, never a secret.
 *
 * @param {Lib_Logger_LogDebug_Message} message - Message.
 *
 * @returns {Lib_Logger_LogDebug_Returns}
 *
 * @since 2.1.0
 */
export function logDebug(message: Lib_Logger_LogDebug_Message): Lib_Logger_LogDebug_Returns {
  emit('debug', message);

  return;
}

/**
 * Lib - Logger - Log Error.
 *
 * Writes an error message when the configured threshold permits it.
 * Runtime failures remain visible without a production logging dependency.
 *
 * @param {Lib_Logger_LogError_Message} message - Message.
 *
 * @returns {Lib_Logger_LogError_Returns}
 *
 * @since 2.0.0
 */
export function logError(message: Lib_Logger_LogError_Message): Lib_Logger_LogError_Returns {
  emit('error', message);

  return;
}

/**
 * Lib - Logger - Log Info.
 *
 * Writes an informational message when the configured threshold permits it.
 * Startup and action milestones remain visible to container operators.
 *
 * @param {Lib_Logger_LogInfo_Message} message - Message.
 *
 * @returns {Lib_Logger_LogInfo_Returns}
 *
 * @since 2.0.0
 */
export function logInfo(message: Lib_Logger_LogInfo_Message): Lib_Logger_LogInfo_Returns {
  emit('info', message);

  return;
}

/**
 * Lib - Logger - Log Warn.
 *
 * Writes a warning message when the configured threshold permits it.
 * Recoverable configuration issues remain distinct from runtime failures.
 *
 * @param {Lib_Logger_LogWarn_Message} message - Message.
 *
 * @returns {Lib_Logger_LogWarn_Returns}
 *
 * @since 2.0.0
 */
export function logWarn(message: Lib_Logger_LogWarn_Message): Lib_Logger_LogWarn_Returns {
  emit('warn', message);

  return;
}

/**
 * Lib - Logger - Set Debug Logging.
 *
 * Turns DEBUG lines on or off for the whole process at once.
 * The server calls it at startup with the saved setting and whenever the setting changes.
 *
 * @param {Lib_Logger_SetDebugLogging_Enabled} enabled - Enabled.
 *
 * @returns {Lib_Logger_SetDebugLogging_Returns}
 *
 * @since 2.1.0
 */
export function setDebugLogging(enabled: Lib_Logger_SetDebugLogging_Enabled): Lib_Logger_SetDebugLogging_Returns {
  debugLogging = enabled;

  return;
}
