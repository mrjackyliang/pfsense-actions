import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { logWarn } from './logger.js';
import { env } from './schema.js';

import type {
  Lib_Utility_GetActionHttpStatus_Response,
  Lib_Utility_GetActionHttpStatus_Returns,
  Lib_Utility_GetDeprecationWarnings_Environment,
  Lib_Utility_GetDeprecationWarnings_HasConnectionValues,
  Lib_Utility_GetDeprecationWarnings_Imports,
  Lib_Utility_GetDeprecationWarnings_Returns,
  Lib_Utility_GetDeprecationWarnings_Warnings,
  Lib_Utility_GetEnvironmentVariables_AdminWebauthnRpName,
  Lib_Utility_GetEnvironmentVariables_DataDirectory,
  Lib_Utility_GetEnvironmentVariables_PfsensePassword,
  Lib_Utility_GetEnvironmentVariables_PfsensePrivateKey,
  Lib_Utility_GetEnvironmentVariables_PfsenseSshIp,
  Lib_Utility_GetEnvironmentVariables_PfsenseSshPort,
  Lib_Utility_GetEnvironmentVariables_PfsenseUsername,
  Lib_Utility_GetEnvironmentVariables_Port,
  Lib_Utility_GetEnvironmentVariables_Returns,
  Lib_Utility_GetPackageVersion_PackageJson,
  Lib_Utility_GetPackageVersion_PackageJsonRaw,
  Lib_Utility_GetPackageVersion_Returns,
  Lib_Utility_GetPackageVersion_Version,
} from '@/types/lib/utility.d.ts';

/**
 * Lib - Utility - Get Action HTTP Status.
 *
 * Maps successful pfSense actions to HTTP 200 and adapter failures to HTTP 502.
 * Callers keep validation, target reachability, and unexpected failures distinct.
 *
 * @param {Lib_Utility_GetActionHttpStatus_Response} response - Response.
 *
 * @returns {Lib_Utility_GetActionHttpStatus_Returns}
 *
 * @since 2.0.0
 */
export function getActionHttpStatus(response: Lib_Utility_GetActionHttpStatus_Response): Lib_Utility_GetActionHttpStatus_Returns {
  return (response['success'] === true) ? 200 : 502;
}
/**
 * Lib - Utility - Get Deprecation Warnings.
 *
 * Explains which deprecated environment variables are set and what happened to them.
 * Each warning points to the console page that replaces the variable.
 *
 * @param {Lib_Utility_GetDeprecationWarnings_Environment} environment - Environment.
 * @param {Lib_Utility_GetDeprecationWarnings_Imports}     imports     - Imports.
 *
 * @returns {Lib_Utility_GetDeprecationWarnings_Returns}
 *
 * @since 2.0.0
 */
export function getDeprecationWarnings(environment: Lib_Utility_GetDeprecationWarnings_Environment, imports: Lib_Utility_GetDeprecationWarnings_Imports): Lib_Utility_GetDeprecationWarnings_Returns {
  const warnings: Lib_Utility_GetDeprecationWarnings_Warnings = [];
  const hasConnectionValues: Lib_Utility_GetDeprecationWarnings_HasConnectionValues = (
    environment['pfsenseSshIp'] !== undefined
    || environment['pfsenseSshPort'] !== undefined
    || environment['pfsenseUsername'] !== undefined
    || environment['pfsensePassword'] !== undefined
    || environment['pfsensePrivateKey'] !== undefined
  );

  if (hasConnectionValues === true && imports['connection'] === true) {
    warnings.push('Imported the pfSense connection from the PFSENSE_* environment variables. They\'re deprecated: manage the connection on the console\'s Connection page and remove them.');
  } else if (hasConnectionValues === true) {
    warnings.push('The PFSENSE_* environment variables are deprecated and were ignored because a connection is already saved. Remove them and use the console\'s Connection page.');
  }

  return warnings;
}

/**
 * Lib - Utility - Get Environment Variables.
 *
 * Applies safe local defaults before validating the optional bootstrap configuration.
 * The administrator account is always created in the console with the setup code.
 *
 * @returns {Lib_Utility_GetEnvironmentVariables_Returns}
 *
 * @since 2.0.0
 */
export function getEnvironmentVariables(): Lib_Utility_GetEnvironmentVariables_Returns {
  const dataDirectory: Lib_Utility_GetEnvironmentVariables_DataDirectory = (typeof process.env['DATA_DIRECTORY'] === 'string' && process.env['DATA_DIRECTORY'] !== '') ? process.env['DATA_DIRECTORY'] : resolve(process.cwd(), '.data');
  const pfsensePassword: Lib_Utility_GetEnvironmentVariables_PfsensePassword = (typeof process.env['PFSENSE_PASSWORD'] === 'string' && process.env['PFSENSE_PASSWORD'] !== '') ? process.env['PFSENSE_PASSWORD'] : undefined;
  const pfsensePrivateKey: Lib_Utility_GetEnvironmentVariables_PfsensePrivateKey = (typeof process.env['PFSENSE_PRIVATE_KEY'] === 'string' && process.env['PFSENSE_PRIVATE_KEY'] !== '') ? process.env['PFSENSE_PRIVATE_KEY'] : undefined;
  const pfsenseSshIp: Lib_Utility_GetEnvironmentVariables_PfsenseSshIp = (typeof process.env['PFSENSE_SSH_IP'] === 'string' && process.env['PFSENSE_SSH_IP'] !== '') ? process.env['PFSENSE_SSH_IP'] : undefined;
  const pfsenseSshPort: Lib_Utility_GetEnvironmentVariables_PfsenseSshPort = (typeof process.env['PFSENSE_SSH_PORT'] === 'string' && process.env['PFSENSE_SSH_PORT'] !== '') ? process.env['PFSENSE_SSH_PORT'] : undefined;
  const pfsenseUsername: Lib_Utility_GetEnvironmentVariables_PfsenseUsername = (typeof process.env['PFSENSE_USERNAME'] === 'string' && process.env['PFSENSE_USERNAME'] !== '') ? process.env['PFSENSE_USERNAME'] : undefined;

  let port: Lib_Utility_GetEnvironmentVariables_Port = (typeof process.env['PORT'] === 'string' && process.env['PORT'] !== '') ? process.env['PORT'] : undefined;

  if (port === undefined) {
    logWarn('The environment variable "PORT" has not been defined. Defaulting to 22603 ...');

    port = '22603';
  }

  const adminWebauthnRpName: Lib_Utility_GetEnvironmentVariables_AdminWebauthnRpName = (typeof process.env['ADMIN_WEBAUTHN_RP_NAME'] === 'string' && process.env['ADMIN_WEBAUTHN_RP_NAME'] !== '') ? process.env['ADMIN_WEBAUTHN_RP_NAME'] : 'pfSense Actions';

  return env.parse({
    adminWebauthnRpName,
    dataDirectory,
    pfsensePassword,
    pfsensePrivateKey,
    pfsenseSshIp,
    pfsenseSshPort,
    pfsenseUsername,
    port,
  });
}

/**
 * Lib - Utility - Get Package Version.
 *
 * Reads the workspace manifest so runtime identity follows the installed package.
 * Invalid or missing versions fail early instead of producing misleading startup logs.
 *
 * @returns {Lib_Utility_GetPackageVersion_Returns}
 *
 * @since 2.0.0
 */
export function getPackageVersion(): Lib_Utility_GetPackageVersion_Returns {
  const packageJsonRaw: Lib_Utility_GetPackageVersion_PackageJsonRaw = readFileSync(new URL('../../package.json', import.meta.url), 'utf8');
  const packageJson: Lib_Utility_GetPackageVersion_PackageJson = JSON.parse(packageJsonRaw);
  const version: Lib_Utility_GetPackageVersion_Version = packageJson['version'];

  if (typeof version !== 'string' || version.length === 0) {
    throw new Error('The pfSense Actions package version is missing or invalid. Reinstall the package and try again.');
  }

  return version;
}
