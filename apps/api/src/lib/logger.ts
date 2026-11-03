import type {
  Lib_Logger_Emit_Level,
  Lib_Logger_Emit_LevelLabel,
  Lib_Logger_Emit_LogTime,
  Lib_Logger_Emit_Message,
  Lib_Logger_Emit_Prefix,
  Lib_Logger_Emit_Returns,
  Lib_Logger_Emit_Stream,
  Lib_Logger_Emit_Timestamp,
  Lib_Logger_IsEnabled_ConfiguredLevel,
  Lib_Logger_IsEnabled_Level,
  Lib_Logger_IsEnabled_MinimumLevel,
  Lib_Logger_IsEnabled_Returns,
  Lib_Logger_IsEnabled_Weights,
  Lib_Logger_LogError_Message,
  Lib_Logger_LogError_Returns,
  Lib_Logger_LogInfo_Message,
  Lib_Logger_LogInfo_Returns,
  Lib_Logger_LogWarn_Message,
  Lib_Logger_LogWarn_Returns,
} from '@/types/lib/logger.d.ts';

/**
 * Lib - Logger - Is Enabled.
 *
 * Applies the configured production log threshold without a runtime framework dependency.
 * Debug and automatic settings retain informational output while warn and error narrow it.
 *
 * @param {Lib_Logger_IsEnabled_Level} level - Level.
 *
 * @returns {Lib_Logger_IsEnabled_Returns}
 *
 * @since 2.0.0
 */
function isEnabled(level: Lib_Logger_IsEnabled_Level): Lib_Logger_IsEnabled_Returns {
  const weights: Lib_Logger_IsEnabled_Weights = {
    error: 40,
    info: 20,
    warn: 30,
  };
  const configuredLevel: Lib_Logger_IsEnabled_ConfiguredLevel = (process.env['LOG_LEVEL'] ?? '').toLowerCase();
  let minimumLevel: Lib_Logger_IsEnabled_MinimumLevel = 'info';

  if (configuredLevel === 'warn' || configuredLevel === 'error') {
    minimumLevel = configuredLevel;
  }

  return weights[level] >= weights[minimumLevel];
}

/**
 * Lib - Logger - Emit.
 *
 * Writes one line to the level-appropriate process stream.
 * Optional timestamps preserve the existing runtime environment contract.
 *
 * @param {Lib_Logger_Emit_Level}   level   - Level.
 * @param {Lib_Logger_Emit_Message} message - Message.
 *
 * @returns {Lib_Logger_Emit_Returns}
 *
 * @since 2.0.0
 */
function emit(level: Lib_Logger_Emit_Level, message: Lib_Logger_Emit_Message): Lib_Logger_Emit_Returns {
  if (isEnabled(level) === false) {
    return;
  }

  const levelLabel: Lib_Logger_Emit_LevelLabel = level.toUpperCase();
  const logTime: Lib_Logger_Emit_LogTime = process.env['LOG_TIME'] === 'true';
  const timestamp: Lib_Logger_Emit_Timestamp = (logTime === true) ? new Date().toISOString() : undefined;
  const prefix: Lib_Logger_Emit_Prefix = (timestamp === undefined) ? levelLabel : `${timestamp} ${levelLabel}`;
  const stream: Lib_Logger_Emit_Stream = (level === 'warn' || level === 'error') ? process.stderr : process.stdout;

  stream.write(`${prefix} ${message}\n`);

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
