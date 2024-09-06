import { v4 as uuidv4 } from 'uuid';

import { env } from '@/lib/schema.js';
import type {
  GetEnvironmentVariablesReturns,
  IsValidApiKeyEnvironment,
  IsValidApiKeyRequest,
  IsValidApiKeyReturns,
} from '@/types/index.d.ts';

/**
 * Get environment variables.
 *
 * @returns {GetEnvironmentVariablesReturns}
 *
 * @since 1.0.0
 */
export function getEnvironmentVariables(): GetEnvironmentVariablesReturns {
  const pfsensePassword = (typeof process.env.PFSENSE_PASSWORD === 'string' && process.env.PFSENSE_PASSWORD !== '') ? process.env.PFSENSE_PASSWORD : undefined;
  const pfsensePrivateKey = (typeof process.env.PFSENSE_PRIVATE_KEY === 'string' && process.env.PFSENSE_PRIVATE_KEY !== '') ? process.env.PFSENSE_PRIVATE_KEY : undefined;
  const pfsenseSshIp = (typeof process.env.PFSENSE_SSH_IP === 'string' && process.env.PFSENSE_SSH_IP !== '') ? process.env.PFSENSE_SSH_IP : undefined;
  const pfsenseSshPort = (typeof process.env.PFSENSE_SSH_PORT === 'string' && process.env.PFSENSE_SSH_PORT !== '') ? process.env.PFSENSE_SSH_PORT : undefined;
  const pfsenseUsername = (typeof process.env.PFSENSE_USERNAME === 'string' && process.env.PFSENSE_USERNAME !== '') ? process.env.PFSENSE_USERNAME : undefined;

  let apiKey = (typeof process.env.API_KEY === 'string' && process.env.API_KEY !== '') ? process.env.API_KEY : undefined;
  let port = (typeof process.env.PORT === 'string' && process.env.PORT !== '') ? process.env.PORT : undefined;

  // If "PORT" is undefined.
  if (port === undefined) {
    console.warn('The environment variable "PORT" has not been defined. Defaulting to 9898 ...');

    port = '9898';
  }

  // If "API_KEY" is undefined.
  if (apiKey === undefined) {
    console.warn('The environment variable "API_KEY" has not been defined. Defaulting to randomized key ...');

    apiKey = uuidv4();
  }

  return env.parse({
    apiKey,
    pfsensePassword,
    pfsensePrivateKey,
    pfsenseSshIp,
    pfsenseSshPort,
    pfsenseUsername,
    port,
  });
}

/**
 * Is valid api key.
 *
 * @param {IsValidApiKeyEnvironment} environment - Environment.
 * @param {IsValidApiKeyRequest}     request     - Request.
 *
 * @returns {IsValidApiKeyReturns}
 *
 * @since 1.0.0
 */
export function isValidApiKey(environment: IsValidApiKeyEnvironment, request: IsValidApiKeyRequest): IsValidApiKeyReturns {
  const authorizationHeader = request.get('Authorization');

  // If API key was not provided.
  if (authorizationHeader === undefined) {
    return false;
  }

  // Replace the "Bearer " then compare API key.
  return authorizationHeader.replace(/^Bearer (.+)$/, '$1') === environment.apiKey;
}
