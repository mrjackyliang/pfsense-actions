import {
  createHash,
  generateKeyPairSync,
  randomBytes,
  sign,
} from 'node:crypto';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  textPersonalAccessToken,
  textSessionToken,
} from '@/lib/regex.js';
import {
  generateCode,
  generateTotpSecret,
} from '@/lib/totp.js';
import { Runner as Server } from '@/server.js';

import type {
  Tests_Routes_Api_Administrator,
  Tests_Routes_Api_Authenticator,
  Tests_Routes_Api_AuthenticatorData_Attested,
  Tests_Routes_Api_AuthenticatorData_Counter,
  Tests_Routes_Api_AuthenticatorData_Flags,
  Tests_Routes_Api_AuthenticatorData_Returns,
  Tests_Routes_Api_AuthenticatorData_RpId,
  Tests_Routes_Api_AuthenticatorData_SignCount,
  Tests_Routes_Api_Body,
  Tests_Routes_Api_CborHead_Head,
  Tests_Routes_Api_CborHead_Length,
  Tests_Routes_Api_CborHead_MajorType,
  Tests_Routes_Api_CborHead_Returns,
  Tests_Routes_Api_CborValue,
  Tests_Routes_Api_Claim_Returns,
  Tests_Routes_Api_Client,
  Tests_Routes_Api_CreateAssertion_Authenticator,
  Tests_Routes_Api_CreateAssertion_AuthenticatorData,
  Tests_Routes_Api_CreateAssertion_ClientData,
  Tests_Routes_Api_CreateAssertion_Options,
  Tests_Routes_Api_CreateAssertion_Origin,
  Tests_Routes_Api_CreateAssertion_Returns,
  Tests_Routes_Api_CreateAssertion_RpId,
  Tests_Routes_Api_CreateAssertion_Signature,
  Tests_Routes_Api_CreateAuthenticator_KeyPair,
  Tests_Routes_Api_CreateAuthenticator_Returns,
  Tests_Routes_Api_CreateClient_BaseUrl,
  Tests_Routes_Api_CreateClient_Cookies,
  Tests_Routes_Api_CreateClient_DefaultHeaders,
  Tests_Routes_Api_CreateClient_Returns,
  Tests_Routes_Api_CreatedToken,
  Tests_Routes_Api_CreateRegistration_AttestationObject,
  Tests_Routes_Api_CreateRegistration_Attested,
  Tests_Routes_Api_CreateRegistration_Authenticator,
  Tests_Routes_Api_CreateRegistration_AuthenticatorData,
  Tests_Routes_Api_CreateRegistration_ClientData,
  Tests_Routes_Api_CreateRegistration_CredentialIdLength,
  Tests_Routes_Api_CreateRegistration_Options,
  Tests_Routes_Api_CreateRegistration_Origin,
  Tests_Routes_Api_CreateRegistration_PublicKey,
  Tests_Routes_Api_CreateRegistration_Returns,
  Tests_Routes_Api_EncodeCbor_Bytes,
  Tests_Routes_Api_EncodeCbor_Entries,
  Tests_Routes_Api_EncodeCbor_Returns,
  Tests_Routes_Api_EncodeCbor_Value,
  Tests_Routes_Api_Environment,
  Tests_Routes_Api_Harness,
  Tests_Routes_Api_Headers,
  Tests_Routes_Api_HttpServer,
  Tests_Routes_Api_Mocks,
  Tests_Routes_Api_NotificationId,
  Tests_Routes_Api_NotificationMocks,
  Tests_Routes_Api_NotificationsModule,
  Tests_Routes_Api_Options,
  Tests_Routes_Api_RecoveryCodes,
  Tests_Routes_Api_Request_Body,
  Tests_Routes_Api_Request_Headers,
  Tests_Routes_Api_Request_Method,
  Tests_Routes_Api_Request_Path,
  Tests_Routes_Api_Request_RequestHeaders,
  Tests_Routes_Api_Request_Response,
  Tests_Routes_Api_Request_Returns,
  Tests_Routes_Api_Request_Text,
  Tests_Routes_Api_Response,
  Tests_Routes_Api_Responses,
  Tests_Routes_Api_SetupClaim,
  Tests_Routes_Api_StartHarness_Address,
  Tests_Routes_Api_StartHarness_HttpServer,
  Tests_Routes_Api_StartHarness_Returns,
  Tests_Routes_Api_StartHarness_Server,
  Tests_Routes_Api_State,
  Tests_Routes_Api_StopHarness_Harness,
  Tests_Routes_Api_StopHarness_Returns,
  Tests_Routes_Api_TokenId,
  Tests_Routes_Api_TotpSecret,
} from '@/types/tests/routes/api.test.d.ts';

/**
 * Tests - Routes - API - Mocks.
 *
 * Stands in for the SSH adapter so no test opens a connection to a firewall.
 * Each test can change what pfSense appears to answer.
 *
 * @since 2.0.0
 */
const apiMocks: Tests_Routes_Api_Mocks = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
  ping: vi.fn(),
  systemInformation: vi.fn(),
  wakeOnLan: vi.fn(),
}));

/**
 * Tests - Routes - API - Notification Mocks.
 *
 * Stands in for every notification send so no test reaches a real service.
 * The rest of the notification module stays real.
 *
 * @since 2.0.0
 */
const notificationMocks: Tests_Routes_Api_NotificationMocks = vi.hoisted(() => ({
  send: vi.fn(),
}));

vi.mock('@/lib/notifications.js', async (importOriginal) => ({
  ...(await importOriginal<Tests_Routes_Api_NotificationsModule>()),
  sendNotification: notificationMocks['send'],
}));

vi.mock('@/lib/logger.js', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

vi.mock('@/lib/api.js', () => ({
  Runner: vi.fn(function runner() {
    return {
      login: apiMocks['login'],
      logout: apiMocks['logout'],
      ping: apiMocks['ping'],
      systemInformation: apiMocks['systemInformation'],
      wakeOnLan: apiMocks['wakeOnLan'],
    };
  }),
}));

/**
 * Tests - Routes - API - Proxy Headers.
 *
 * Makes requests from the loopback test client look like they came through a proxy.
 * The app should then use this hostname and scheme for its own address.
 *
 * @since 2.0.0
 */
const proxyHeaders: Tests_Routes_Api_Headers = {
  'X-Forwarded-Host': 'actions.example.net',
  'X-Forwarded-Proto': 'https',
};

/**
 * Tests - Routes - API - Base Directory.
 *
 * Holds each test's data and console folders in one temporary directory.
 *
 * @since 2.0.0
 */
let baseDirectory: Tests_Routes_Api_Body = '';

/**
 * Tests - Routes - API - Harness.
 *
 * Holds the running server for the current test.
 *
 * @since 2.0.0
 */
let harness: Tests_Routes_Api_Harness = undefined;

/**
 * Tests - Routes - API - Create Environment.
 *
 * Builds a fresh-container environment pointing at the test's data folder.
 *
 * @returns {Tests_Routes_Api_Environment}
 *
 * @since 2.0.0
 */
function createEnvironment(): Tests_Routes_Api_Environment {
  return {
    adminWebauthnRpName: 'pfSense Actions',
    dataDirectory: join(baseDirectory, 'data'),
    port: 0,
  };
}

/**
 * Tests - Routes - API - Start Harness.
 *
 * Builds the real controller and listens on a random loopback port.
 *
 * @returns {Tests_Routes_Api_StartHarness_Returns}
 *
 * @since 2.0.0
 */
async function startHarness(): Tests_Routes_Api_StartHarness_Returns {
  const server: Tests_Routes_Api_StartHarness_Server = new Server(createEnvironment(), join(baseDirectory, 'web'));
  const httpServer: Tests_Routes_Api_StartHarness_HttpServer = createServer(server.getApplication());

  await new Promise((resolve) => {
    httpServer.listen(0, '127.0.0.1', () => {
      resolve(undefined);

      return;
    });

    return;
  });

  const address: Tests_Routes_Api_StartHarness_Address = httpServer.address();

  if (address === null || typeof address === 'string') {
    throw new Error('The test server did not report a port.');
  }

  return {
    baseUrl: `http://127.0.0.1:${address['port']}`,
    httpServer,
    server,
  };
}

/**
 * Tests - Routes - API - Stop Harness.
 *
 * Closes the listener and the SQLite handle of one running server.
 *
 * @param {Tests_Routes_Api_StopHarness_Harness} runningHarness - Running harness.
 *
 * @returns {Tests_Routes_Api_StopHarness_Returns}
 *
 * @since 2.0.0
 */
async function stopHarness(runningHarness: Tests_Routes_Api_StopHarness_Harness): Tests_Routes_Api_StopHarness_Returns {
  const httpServer: Tests_Routes_Api_HttpServer = runningHarness['httpServer'];

  httpServer.closeAllConnections();

  await new Promise((resolve) => {
    httpServer.close(() => {
      resolve(undefined);

      return;
    });

    return;
  });

  runningHarness['server'].getState().close();

  return;
}

/**
 * Tests - Routes - API - Create Client.
 *
 * Makes a small fetch client that keeps cookies and sends the CSRF header like the interface.
 *
 * @param {Tests_Routes_Api_CreateClient_BaseUrl}        baseUrl        - Base url.
 * @param {Tests_Routes_Api_CreateClient_DefaultHeaders} defaultHeaders - Default headers.
 *
 * @returns {Tests_Routes_Api_CreateClient_Returns}
 *
 * @since 2.0.0
 */
function createClient(baseUrl: Tests_Routes_Api_CreateClient_BaseUrl, defaultHeaders: Tests_Routes_Api_CreateClient_DefaultHeaders = {}): Tests_Routes_Api_CreateClient_Returns {
  const cookies: Tests_Routes_Api_CreateClient_Cookies = new Map();

  return {
    cookies,
    request: async (method: Tests_Routes_Api_Request_Method, path: Tests_Routes_Api_Request_Path, body?: Tests_Routes_Api_Request_Body, headers: Tests_Routes_Api_Request_Headers = {}): Tests_Routes_Api_Request_Returns => {
      const requestHeaders: Tests_Routes_Api_Request_RequestHeaders = new Headers({
        ...defaultHeaders,
        ...headers,
      });

      if (cookies.size > 0) {
        requestHeaders.set('Cookie', [...cookies.entries()].map((cookie) => `${cookie[0]}=${cookie[1]}`).join('; '));
      }

      if (
        method !== 'GET'
        && cookies.has('pfa_csrf') === true
        && requestHeaders.has('X-CSRF-Token') === false
      ) {
        requestHeaders.set('X-CSRF-Token', cookies.get('pfa_csrf') ?? '');
      }

      if (body !== undefined) {
        requestHeaders.set('Content-Type', 'application/json');
      }

      const response: Tests_Routes_Api_Request_Response = await fetch(`${baseUrl}${path}`, {
        ...((body === undefined) ? {} : { body: (typeof body === 'string') ? body : JSON.stringify(body) }),
        headers: requestHeaders,
        method,
        redirect: 'manual',
      });

      for (const setCookie of response.headers.getSetCookie()) {
        const pair: Tests_Routes_Api_Body = setCookie.split(';')[0] ?? '';
        const name: Tests_Routes_Api_Body = pair.slice(0, pair.indexOf('='));
        const value: Tests_Routes_Api_Body = pair.slice(pair.indexOf('=') + 1);

        if (value === '') {
          cookies.delete(name);
        } else {
          cookies.set(name, value);
        }
      }

      const text: Tests_Routes_Api_Request_Text = await response.text();

      return {
        body: (text === '' || (response.headers.get('Content-Type') ?? '').includes('application/json') === false) ? text : JSON.parse(text),
        headers: response.headers,
        status: response.status,
      };
    },
  };
}

/**
 * Tests - Routes - API - Claim.
 *
 * Creates the first administrator through the setup endpoint and signs the client in.
 *
 * @param {Tests_Routes_Api_Client}              client         - Client.
 * @param {Tests_Routes_Api_StopHarness_Harness} runningHarness - Running harness.
 *
 * @returns {Tests_Routes_Api_Claim_Returns}
 *
 * @since 2.0.0
 */
async function claim(client: Tests_Routes_Api_Client, runningHarness: Tests_Routes_Api_StopHarness_Harness): Tests_Routes_Api_Claim_Returns {
  const setupClaim: Tests_Routes_Api_SetupClaim = runningHarness['server'].getState().prepareSetupClaim();

  if (setupClaim === undefined) {
    throw new Error('The installation did not issue a setup code.');
  }

  return client.request('POST', '/api/v1/setup/claim', {
    claimCode: setupClaim['code'],
    password: 'fixture admin password',
    username: 'admin',
  });
}

/**
 * Tests - Routes - API - Encode Cbor Head.
 *
 * Encodes one CBOR major type and length the way authenticators do.
 *
 * @param {Tests_Routes_Api_CborHead_MajorType} majorType - Major type.
 * @param {Tests_Routes_Api_CborHead_Length}    length    - Length.
 *
 * @returns {Tests_Routes_Api_CborHead_Returns}
 *
 * @since 2.0.0
 */
function encodeCborHead(majorType: Tests_Routes_Api_CborHead_MajorType, length: Tests_Routes_Api_CborHead_Length): Tests_Routes_Api_CborHead_Returns {
  if (length < 24) {
    return Buffer.from([(majorType * 32) + length]);
  }

  if (length < 256) {
    return Buffer.from([
      (majorType * 32) + 24,
      length,
    ]);
  }

  const head: Tests_Routes_Api_CborHead_Head = Buffer.alloc(3);

  head.writeUInt8((majorType * 32) + 25, 0);

  head.writeUInt16BE(length, 1);

  return head;
}

/**
 * Tests - Routes - API - Encode Cbor.
 *
 * Encodes the small CBOR subset used by attestation objects and COSE keys.
 *
 * @param {Tests_Routes_Api_EncodeCbor_Value} value - Value.
 *
 * @returns {Tests_Routes_Api_EncodeCbor_Returns}
 *
 * @since 2.0.0
 */
function encodeCbor(value: Tests_Routes_Api_EncodeCbor_Value): Tests_Routes_Api_EncodeCbor_Returns {
  if (typeof value === 'number') {
    return (value >= 0) ? encodeCborHead(0, value) : encodeCborHead(1, -1 - value);
  }

  if (typeof value === 'string') {
    const bytes: Tests_Routes_Api_EncodeCbor_Bytes = Buffer.from(value, 'utf8');

    return Buffer.concat([
      encodeCborHead(3, bytes.length),
      bytes,
    ]);
  }

  if (value instanceof Uint8Array) {
    return Buffer.concat([
      encodeCborHead(2, value.length),
      Buffer.from(value),
    ]);
  }

  const entries: Tests_Routes_Api_EncodeCbor_Entries = [...value.entries()];

  return Buffer.concat([
    encodeCborHead(5, entries.length),
    ...entries.flatMap((entry) => [
      encodeCbor(entry[0]),
      encodeCbor(entry[1]),
    ]),
  ]);
}

/**
 * Tests - Routes - API - Create Authenticator Data.
 *
 * Builds the RP ID hash, flags, and counter that start every authenticator response.
 *
 * @param {Tests_Routes_Api_AuthenticatorData_RpId}      rpId        - Rp id.
 * @param {Tests_Routes_Api_AuthenticatorData_Flags}     flags       - Flags.
 * @param {Tests_Routes_Api_AuthenticatorData_SignCount} signCount   - Sign count.
 * @param {Tests_Routes_Api_AuthenticatorData_Attested}  [attested]  - Attested.
 *
 * @returns {Tests_Routes_Api_AuthenticatorData_Returns}
 *
 * @since 2.0.0
 */
function createAuthenticatorData(rpId: Tests_Routes_Api_AuthenticatorData_RpId, flags: Tests_Routes_Api_AuthenticatorData_Flags, signCount: Tests_Routes_Api_AuthenticatorData_SignCount, attested?: Tests_Routes_Api_AuthenticatorData_Attested): Tests_Routes_Api_AuthenticatorData_Returns {
  const counter: Tests_Routes_Api_AuthenticatorData_Counter = Buffer.alloc(4);

  counter.writeUInt32BE(signCount, 0);

  return Buffer.concat([
    createHash('sha256').update(rpId).digest(),
    Buffer.from([flags]),
    counter,
    ...((attested === undefined) ? [] : [attested]),
  ]);
}

/**
 * Tests - Routes - API - Create Authenticator.
 *
 * Creates a software passkey with a P-256 key pair and a random credential ID.
 *
 * @returns {Tests_Routes_Api_CreateAuthenticator_Returns}
 *
 * @since 2.0.0
 */
function createAuthenticator(): Tests_Routes_Api_CreateAuthenticator_Returns {
  const keyPair: Tests_Routes_Api_CreateAuthenticator_KeyPair = generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
  });

  return {
    credentialId: randomBytes(16),
    keyPair,
    signCount: 0,
  };
}

/**
 * Tests - Routes - API - Create Registration.
 *
 * Answers registration options like a browser and platform authenticator would.
 *
 * @param {Tests_Routes_Api_CreateRegistration_Authenticator} authenticator - Authenticator.
 * @param {Tests_Routes_Api_CreateRegistration_Options}       options       - Options.
 * @param {Tests_Routes_Api_CreateRegistration_Origin}        origin        - Origin.
 *
 * @returns {Tests_Routes_Api_CreateRegistration_Returns}
 *
 * @since 2.0.0
 */
function createRegistration(authenticator: Tests_Routes_Api_CreateRegistration_Authenticator, options: Tests_Routes_Api_CreateRegistration_Options, origin: Tests_Routes_Api_CreateRegistration_Origin): Tests_Routes_Api_CreateRegistration_Returns {
  const publicKey: Tests_Routes_Api_CreateRegistration_PublicKey = authenticator['keyPair']['publicKey'].export({
    format: 'jwk',
  });
  const credentialIdLength: Tests_Routes_Api_CreateRegistration_CredentialIdLength = Buffer.alloc(2);

  credentialIdLength.writeUInt16BE(authenticator['credentialId'].length, 0);

  const attested: Tests_Routes_Api_CreateRegistration_Attested = Buffer.concat([
    Buffer.alloc(16),
    credentialIdLength,
    authenticator['credentialId'],
    encodeCbor(new Map<Tests_Routes_Api_CborValue, Tests_Routes_Api_CborValue>([
      [
        1,
        2,
      ],
      [
        3,
        -7,
      ],
      [
        -1,
        1,
      ],
      [
        -2,
        Buffer.from(publicKey['x'] ?? '', 'base64url'),
      ],
      [
        -3,
        Buffer.from(publicKey['y'] ?? '', 'base64url'),
      ],
    ])),
  ]);
  const authenticatorData: Tests_Routes_Api_CreateRegistration_AuthenticatorData = createAuthenticatorData(String(Reflect.get(Object(options['rp']), 'id')), 69, authenticator['signCount'], attested);
  const attestationObject: Tests_Routes_Api_CreateRegistration_AttestationObject = encodeCbor(new Map<Tests_Routes_Api_CborValue, Tests_Routes_Api_CborValue>([
    [
      'fmt',
      'none',
    ],
    [
      'attStmt',
      new Map(),
    ],
    [
      'authData',
      authenticatorData,
    ],
  ]));
  const clientData: Tests_Routes_Api_CreateRegistration_ClientData = Buffer.from(JSON.stringify({
    challenge: options['challenge'],
    crossOrigin: false,
    origin,
    type: 'webauthn.create',
  }));

  return {
    authenticatorAttachment: 'platform',
    clientExtensionResults: {},
    id: authenticator['credentialId'].toString('base64url'),
    rawId: authenticator['credentialId'].toString('base64url'),
    response: {
      attestationObject: attestationObject.toString('base64url'),
      clientDataJSON: clientData.toString('base64url'),
      transports: ['internal'],
    },
    type: 'public-key',
  };
}

/**
 * Tests - Routes - API - Create Assertion.
 *
 * Signs authentication options like a browser and platform authenticator would.
 *
 * @param {Tests_Routes_Api_CreateAssertion_Authenticator} authenticator - Authenticator.
 * @param {Tests_Routes_Api_CreateAssertion_Options}       options       - Options.
 * @param {Tests_Routes_Api_CreateAssertion_Origin}        origin        - Origin.
 * @param {Tests_Routes_Api_CreateAssertion_RpId}          rpId          - Rp id.
 *
 * @returns {Tests_Routes_Api_CreateAssertion_Returns}
 *
 * @since 2.0.0
 */
function createAssertion(authenticator: Tests_Routes_Api_CreateAssertion_Authenticator, options: Tests_Routes_Api_CreateAssertion_Options, origin: Tests_Routes_Api_CreateAssertion_Origin, rpId: Tests_Routes_Api_CreateAssertion_RpId): Tests_Routes_Api_CreateAssertion_Returns {
  Reflect.set(authenticator, 'signCount', authenticator['signCount'] + 1);

  const authenticatorData: Tests_Routes_Api_CreateAssertion_AuthenticatorData = createAuthenticatorData(rpId, 5, authenticator['signCount']);
  const clientData: Tests_Routes_Api_CreateAssertion_ClientData = Buffer.from(JSON.stringify({
    challenge: options['challenge'],
    crossOrigin: false,
    origin,
    type: 'webauthn.get',
  }));
  const signature: Tests_Routes_Api_CreateAssertion_Signature = sign('sha256', Buffer.concat([
    authenticatorData,
    createHash('sha256').update(clientData).digest(),
  ]), authenticator['keyPair']['privateKey']);

  return {
    authenticatorAttachment: 'platform',
    clientExtensionResults: {},
    id: authenticator['credentialId'].toString('base64url'),
    rawId: authenticator['credentialId'].toString('base64url'),
    response: {
      authenticatorData: authenticatorData.toString('base64url'),
      clientDataJSON: clientData.toString('base64url'),
      signature: signature.toString('base64url'),
      userHandle: String(authenticator['userHandle'] ?? ''),
    },
    type: 'public-key',
  };
}

describe('console API', () => {
  beforeEach(async () => {
    baseDirectory = mkdtempSync(join(tmpdir(), 'pfsense-actions-api-'));

    mkdirSync(join(baseDirectory, 'web', 'assets'), {
      recursive: true,
    });

    writeFileSync(join(baseDirectory, 'web', 'index.html'), '<!doctype html><title>pfSense Actions</title>');

    writeFileSync(join(baseDirectory, 'web', 'assets', 'app-1234.js'), 'console.log("console");');

    notificationMocks['send'].mockReset().mockResolvedValue({ delivered: true });

    apiMocks['login'].mockReset().mockResolvedValue({
      action: 'LOGIN',
      info: null,
      success: true,
    });

    apiMocks['logout'].mockReset().mockResolvedValue({
      action: 'LOGOUT',
      info: null,
      success: true,
    });

    apiMocks['ping'].mockReset().mockResolvedValue({
      action: 'PING',
      info: {
        code: 0,
        signal: null,
        stderr: '',
        stdout: '5 packets transmitted, 5 packets received, 0.0% packet loss',
      },
      success: true,
    });

    apiMocks['systemInformation'].mockReset().mockResolvedValue({
      action: 'SYSTEM_INFORMATION',
      info: {
        architecture: 'amd64',
        operatingSystem: 'FreeBSD',
        release: '14.0-CURRENT',
      },
      success: true,
    });

    apiMocks['wakeOnLan'].mockReset().mockResolvedValue({
      action: 'WAKE_ON_LAN',
      info: {
        code: 0,
        signal: null,
        stderr: '',
        stdout: '',
      },
      success: true,
    });

    harness = await startHarness();

    return;
  });

  afterEach(async () => {
    if (harness !== undefined) {
      await stopHarness(harness);
    }

    harness = undefined;

    rmSync(baseDirectory, {
      force: true,
      recursive: true,
    });

    return;
  });

  it('creates the first account with the setup code and guards every change with CSRF', async () => {
    if (harness === undefined) {
      throw new Error('The test server is not running.');
    }

    const client: Tests_Routes_Api_Client = createClient(harness['baseUrl']);

    expect(await client.request('GET', '/api/v1/setup/status')).toEqual(expect.objectContaining({
      body: {
        claimRequired: true,
      },
      status: 200,
    }));

    expect(await client.request('POST', '/api/v1/setup/claim', {
      claimCode: 'AAAAA-BBBBB-CCCCC',
      password: 'fixture admin password',
      username: 'admin',
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'claim_invalid',
        }),
      }),
      status: 401,
    }));

    expect(await client.request('POST', '/api/v1/setup/claim', {
      claimCode: 'AAAAA-BBBBB-CCCCC',
      password: 'fixture admin password',
      username: 'ab',
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'invalid_request',
          issues: [expect.objectContaining({
            field: 'username',
            message: 'Use 3 to 64 letters, numbers, periods, underscores, or hyphens, starting with a letter or number.',
          })],
        }),
      }),
      status: 422,
    }));

    expect(await claim(client, harness)).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        administrator: expect.objectContaining({
          username: 'admin',
        }),
        status: 'authenticated',
      }),
      status: 201,
    }));

    expect(client['cookies'].get('pfa_session')).toMatch(textSessionToken);

    expect(await client.request('GET', '/api/v1/auth/me')).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        authenticationType: 'session',
        username: 'admin',
      }),
      status: 200,
    }));

    expect(await client.request('POST', '/api/v1/auth/tokens', {
      name: 'Home Assistant',
      scopes: ['pfsense:read'],
    }, {
      'X-CSRF-Token': 'pfc_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    })).toEqual(expect.objectContaining({
      body: {
        error: {
          code: 'csrf_invalid',
          message: 'The request CSRF token is missing or invalid.',
        },
      },
      status: 403,
    }));

    expect(await client.request('POST', '/api/v1/auth/tokens', {
      name: '   ',
      scopes: [],
    })).toEqual(expect.objectContaining({
      body: {
        error: {
          code: 'invalid_request',
          issues: [
            {
              field: 'name',
              message: 'Name this token.',
              path: ['name'],
            },
            {
              field: 'scopes',
              message: 'Choose at least one scope.',
              path: ['scopes'],
            },
          ],
          message: 'Name this token.',
        },
      },
      status: 422,
    }));

    expect(await client.request('POST', '/api/v1/auth/tokens', {
      name: 'Home Assistant',
      scopes: ['pfsense:read'],
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        plaintext: expect.stringMatching(textPersonalAccessToken),
      }),
      status: 201,
    }));

    expect(await client.request('GET', '/api/v1/auth/tokens')).toEqual(expect.objectContaining({
      body: {
        items: [expect.objectContaining({
          lastUsedAt: null,
          name: 'Home Assistant',
        })],
      },
      status: 200,
    }));

    expect(await createClient(harness['baseUrl']).request('POST', '/api/v1/setup/claim', {
      claimCode: 'AAAAA-BBBBB-CCCCC',
      password: 'fixture admin password',
      username: 'intruder',
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'claim_unavailable',
        }),
      }),
      status: 409,
    }));

    expect(await client.request('POST', '/api/v1/auth/logout')).toEqual(expect.objectContaining({
      status: 204,
    }));

    expect(await client.request('GET', '/api/v1/auth/me')).toEqual(expect.objectContaining({
      status: 401,
    }));

    return;
  });

  it('runs actions with a scoped token at their new and original paths', async () => {
    if (harness === undefined) {
      throw new Error('The test server is not running.');
    }

    const state: Tests_Routes_Api_State = harness['server'].getState();
    const setupClaim: Tests_Routes_Api_SetupClaim = state.prepareSetupClaim();

    if (setupClaim === undefined) {
      throw new Error('The installation did not issue a setup code.');
    }

    state.claimInstallation(setupClaim['code'], 'admin', 'fixture admin password');

    const readToken: Tests_Routes_Api_CreatedToken = state.createToken({
      name: 'Dashboard',
      scopes: ['pfsense:read'],
    }, 'admin');
    const fullToken: Tests_Routes_Api_CreatedToken = state.createToken({
      name: 'Automation',
      scopes: [
        'pfsense:read',
        'reachability:read',
        'wol:execute',
      ],
    }, 'admin');

    if (readToken === undefined || fullToken === undefined) {
      throw new Error('The fixture tokens were not created.');
    }
    const reader: Tests_Routes_Api_Client = createClient(harness['baseUrl'], {
      'Authorization': `Bearer ${readToken['personalAccessToken']}`,
      'X-Forwarded-For': '198.51.100.1',
    });
    const automation: Tests_Routes_Api_Client = createClient(harness['baseUrl'], {
      'Authorization': `Bearer ${fullToken['personalAccessToken']}`,
      'X-Forwarded-For': '198.51.100.2',
    });

    expect(await reader.request('GET', '/api/v1/auth/me', undefined, {
      'X-Forwarded-For': '198.51.100.9',
    })).toEqual(expect.objectContaining({
      body: {
        authenticationType: 'token',
        id: readToken['token']['id'],
        name: 'Dashboard',
        scopes: ['pfsense:read'],
      },
      status: 200,
    }));

    expect(await reader.request('GET', '/system')).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'connection_not_configured',
        }),
      }),
      status: 503,
    }));

    state.updateConnection({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    }, 'admin');

    expect(await reader.request('GET', '/api/v1/system')).toEqual(expect.objectContaining({
      body: {
        architecture: 'amd64',
        operatingSystem: 'FreeBSD',
        release: '14.0-CURRENT',
      },
      status: 200,
    }));

    expect(await reader.request('GET', '/', undefined, {
      'Accept': 'application/json',
    })).toEqual(expect.objectContaining({
      body: {
        connected: true,
      },
      status: 200,
    }));

    expect(await reader.request('GET', '/system')).toEqual(expect.objectContaining({
      status: 429,
    }));

    expect(await reader.request('POST', '/api/v1/ping', {
      count: 1,
      ipAddress: '192.0.2.10',
    }, {
      'X-Forwarded-For': '198.51.100.3',
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'scope_required',
        }),
      }),
      status: 403,
    }));

    expect(await automation.request('POST', '/ping', {
      count: 1,
      ipAddress: '192.0.2.10',
    })).toEqual(expect.objectContaining({
      body: {
        reachable: true,
      },
      status: 200,
    }));

    expect(state.getActivity(1)).toEqual([expect.objectContaining({
      actorId: 'Automation',
    })]);

    apiMocks['ping'].mockResolvedValue({
      action: 'PING',
      info: {
        code: 0,
        signal: null,
        stderr: '',
        stdout: '5 packets transmitted, 0 packets received, 100.0% packet loss',
      },
      success: true,
    });

    expect(await automation.request('POST', '/api/v1/ping', {
      count: 2,
      ipAddress: '192.0.2.10',
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'target_unreachable',
        }),
      }),
      status: 503,
    }));

    state.createNotificationTarget({
      events: ['action-failed'],
      name: 'Action alerts',
      secrets: {},
      service: 'ntfy',
      settings: { url: 'https://ntfy.sh/actions' },
    }, 'admin');

    apiMocks['ping'].mockResolvedValue({
      action: 'PING',
      info: { message: 'The pfSense command exited unsuccessfully' },
      success: false,
    });

    expect(await automation.request('POST', '/api/v1/ping', {
      count: 1,
      ipAddress: '192.0.2.10',
    }, {
      'X-Forwarded-For': '198.51.100.6',
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'command_failed',
        }),
      }),
      status: 502,
    }));

    await vi.waitFor(() => {
      expect(notificationMocks['send']).toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.objectContaining({
        details: {
          action: 'reachability-check',
          reason: 'The pfSense command failed.',
        },
        event: 'action-failed',
      }));

      return;
    });

    expect(await automation.request('POST', '/wol', {
      broadcastAddress: '192.0.2.255',
      macAddress: 'not-a-mac',
    }, {
      'X-Forwarded-For': '198.51.100.4',
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'invalid_request',
          issues: [{
            field: 'macAddress',
            message: 'Enter a MAC address such as 00:11:22:33:44:55, in all lowercase or all uppercase.',
            path: ['macAddress'],
          }],
        }),
      }),
      status: 400,
    }));

    apiMocks['login'].mockResolvedValue({
      action: 'LOGIN',
      info: {},
      success: false,
    });

    expect(await automation.request('POST', '/api/v1/wol', {
      broadcastAddress: '192.0.2.255',
      macAddress: '00:11:22:33:44:55',
    }, {
      'X-Forwarded-For': '198.51.100.4',
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'pfsense_unavailable',
        }),
      }),
      status: 502,
    }));

    expect(await createClient(harness['baseUrl']).request('GET', '/api/v1/system')).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'authentication_required',
        }),
      }),
      status: 401,
    }));

    expect(await reader.request('GET', '/api/v1/auth/tokens', undefined, {
      'X-Forwarded-For': '198.51.100.5',
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'session_required',
        }),
      }),
      status: 403,
    }));

    return;
  });

  it('creates, edits, and revokes named tokens', async () => {
    if (harness === undefined) {
      throw new Error('The test server is not running.');
    }

    const client: Tests_Routes_Api_Client = createClient(harness['baseUrl']);

    await claim(client, harness);

    const created: Tests_Routes_Api_Response = await client.request('POST', '/api/v1/auth/tokens', {
      name: '  Home Assistant  ',
      scopes: [
        'wol:execute',
        'pfsense:read',
      ],
    });

    expect(created).toEqual(expect.objectContaining({
      body: {
        plaintext: expect.stringMatching(textPersonalAccessToken),
        token: {
          createdAt: expect.any(String),
          expiresAt: null,
          id: expect.any(String),
          lastUsedAt: null,
          name: 'Home Assistant',
          scopes: [
            'pfsense:read',
            'wol:execute',
          ],
        },
      },
      status: 201,
    }));

    const tokenId: Tests_Routes_Api_TokenId = String(Reflect.get(Object(Reflect.get(Object(created['body']), 'token')), 'id'));

    expect(await client.request('POST', '/api/v1/auth/tokens', {
      expiresAt: null,
      name: 'Backup script',
      scopes: ['wol:execute'],
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        token: expect.objectContaining({
          expiresAt: null,
        }),
      }),
      status: 201,
    }));

    expect(await client.request('POST', '/api/v1/auth/tokens', {
      name: 'HOME ASSISTANT',
      scopes: ['pfsense:read'],
    })).toEqual(expect.objectContaining({
      body: {
        error: {
          code: 'token_exists',
          issues: [{
            field: 'name',
            message: 'A token with this name already exists.',
            path: ['name'],
          }],
          message: 'A token with this name already exists.',
        },
      },
      status: 409,
    }));

    expect(await client.request('POST', '/api/v1/auth/tokens', {
      expiresAt: '2099-01-31',
      id: 'home-assistant',
      name: 'x'.repeat(81),
      scopes: [
        'pfsense:write',
        'pfsense:write',
      ],
    })).toEqual(expect.objectContaining({
      body: {
        error: {
          code: 'invalid_request',
          issues: [
            {
              field: 'expiresAt',
              message: 'Use an ISO 8601 date and time with a time zone, like 2030-01-01T00:00:00Z.',
              path: ['expiresAt'],
            },
            {
              field: 'name',
              message: 'Use 80 characters or fewer.',
              path: ['name'],
            },
            {
              field: 'scopes.0',
              message: 'Choose from: pfsense:read, reachability:read, wol:execute.',
              path: [
                'scopes',
                '0',
              ],
            },
            {
              field: 'scopes.1',
              message: 'Choose from: pfsense:read, reachability:read, wol:execute.',
              path: [
                'scopes',
                '1',
              ],
            },
            {
              field: 'id',
              message: 'This field isn\'t accepted.',
              path: ['id'],
            },
          ],
          message: 'Use an ISO 8601 date and time with a time zone, like 2030-01-01T00:00:00Z.',
        },
      },
      status: 422,
    }));

    expect(await client.request('POST', '/api/v1/auth/tokens', {
      expiresAt: '2020-01-01T00:00:00Z',
      name: 'Old script',
      scopes: [
        'pfsense:read',
        'pfsense:read',
      ],
    })).toEqual(expect.objectContaining({
      body: {
        error: {
          code: 'invalid_request',
          issues: [
            {
              field: 'expiresAt',
              message: 'Choose an expiration date in the future.',
              path: ['expiresAt'],
            },
            {
              field: 'scopes',
              message: 'Choose each scope only once.',
              path: ['scopes'],
            },
          ],
          message: 'Choose an expiration date in the future.',
        },
      },
      status: 422,
    }));

    expect(await client.request('PUT', `/api/v1/auth/tokens/${tokenId}`, {
      name: 'backup SCRIPT',
      scopes: ['pfsense:read'],
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'token_exists',
        }),
      }),
      status: 409,
    }));

    expect(await client.request('PUT', `/api/v1/auth/tokens/${tokenId}`, {
      expiresAt: '2099-01-01T00:00:00.000Z',
      name: 'home assistant',
      scopes: ['reachability:read'],
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        expiresAt: '2099-01-01T00:00:00.000Z',
        id: tokenId,
        name: 'home assistant',
        scopes: ['reachability:read'],
      }),
      status: 200,
    }));

    expect(await client.request('PUT', `/api/v1/auth/tokens/${tokenId}`, {
      name: 'Home Assistant',
      scopes: ['reachability:read'],
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        expiresAt: '2099-01-01T00:00:00.000Z',
        name: 'Home Assistant',
      }),
      status: 200,
    }));

    expect(await client.request('PUT', `/api/v1/auth/tokens/${tokenId}`, {
      expiresAt: null,
      name: 'Home Assistant',
      scopes: ['reachability:read'],
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        expiresAt: null,
      }),
      status: 200,
    }));

    expect(await client.request('GET', '/api/v1/auth/tokens')).toEqual(expect.objectContaining({
      body: {
        items: [
          expect.objectContaining({
            name: 'Backup script',
          }),
          expect.objectContaining({
            id: tokenId,
            name: 'Home Assistant',
          }),
        ],
      },
      status: 200,
    }));

    expect(await client.request('DELETE', `/api/v1/auth/tokens/${tokenId}`)).toEqual(expect.objectContaining({
      status: 204,
    }));

    for (const missingTokenId of [
      tokenId,
      'Not A Token',
    ]) {
      expect(await client.request('PUT', `/api/v1/auth/tokens/${encodeURIComponent(missingTokenId)}`, {
        name: 'Home Assistant',
        scopes: ['pfsense:read'],
      })).toEqual(expect.objectContaining({
        body: {
          error: {
            code: 'token_not_found',
            message: 'That token no longer exists.',
          },
        },
        status: 404,
      }));

      expect(await client.request('DELETE', `/api/v1/auth/tokens/${encodeURIComponent(missingTokenId)}`)).toEqual(expect.objectContaining({
        status: 404,
      }));
    }

    return;
  });

  it('asks for a second factor and limits failed sign-ins per client address', async () => {
    if (harness === undefined) {
      throw new Error('The test server is not running.');
    }

    const client: Tests_Routes_Api_Client = createClient(harness['baseUrl'], {
      'X-Forwarded-For': '198.51.100.20',
    });

    await claim(client, harness);

    const setup: Tests_Routes_Api_Response = await client.request('POST', '/api/v1/auth/totp/setup', {
      password: 'fixture admin password',
    });
    const secret: Tests_Routes_Api_TotpSecret = String(Reflect.get(Object(setup['body']), 'secret'));

    expect(setup['body']).toEqual(expect.objectContaining({
      qrCode: expect.stringContaining('data:image/png;base64,'),
      uri: expect.stringContaining('otpauth://totp/'),
    }));

    const enabled: Tests_Routes_Api_Response = await client.request('POST', '/api/v1/auth/totp/enable', {
      code: generateCode(secret, Math.floor(Date.now() / 30_000)),
    });
    const recoveryCodes: Tests_Routes_Api_RecoveryCodes = Reflect.get(Object(enabled['body']), 'recoveryCodes');

    expect(recoveryCodes).toHaveLength(10);

    await client.request('POST', '/api/v1/auth/logout');

    const passwordStep: Tests_Routes_Api_Response = await client.request('POST', '/api/v1/auth/login', {
      password: 'fixture admin password',
      username: 'admin',
    });

    expect(passwordStep).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        status: 'second_factor_required',
      }),
      status: 200,
    }));

    expect(client['cookies'].has('pfa_session')).toBe(false);

    expect(await client.request('POST', '/api/v1/auth/login/second-factor', {
      challenge: Reflect.get(Object(passwordStep['body']), 'challenge'),
      code: '000000',
    })).toEqual(expect.objectContaining({
      body: {
        error: {
          code: 'code_invalid',
          issues: [{
            field: 'code',
            message: 'That code doesn\'t match. Try the current code, or a recovery code.',
            path: ['code'],
          }],
          message: 'That code doesn\'t match. Try the current code, or a recovery code.',
        },
      },
      status: 401,
    }));

    expect(await client.request('POST', '/api/v1/auth/login/second-factor', {
      challenge: Reflect.get(Object(passwordStep['body']), 'challenge'),
      code: recoveryCodes[0] ?? '',
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        status: 'authenticated',
      }),
      status: 200,
    }));

    expect(await client.request('GET', '/api/v1/auth/security')).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        recoveryCodesRemaining: 9,
        totpEnabled: true,
      }),
      status: 200,
    }));

    const guesser: Tests_Routes_Api_Client = createClient(harness['baseUrl'], {
      'X-Forwarded-For': '198.51.100.21',
    });
    const guessedStep: Tests_Routes_Api_Response = await guesser.request('POST', '/api/v1/auth/login', {
      password: 'fixture admin password',
      username: 'admin',
    });
    const guesses: Tests_Routes_Api_Responses = [];

    for (const guess of [
      '111111',
      '222222',
      '333333',
      '444444',
      '555555',
    ]) {
      guesses.push(await guesser.request('POST', '/api/v1/auth/login/second-factor', {
        challenge: Reflect.get(Object(guessedStep['body']), 'challenge'),
        code: guess,
      }));
    }

    expect(guesses.map((guess) => Reflect.get(Object(Reflect.get(Object(guess['body']), 'error')), 'code'))).toEqual([
      'code_invalid',
      'code_invalid',
      'code_invalid',
      'code_invalid',
      'challenge_expired',
    ]);

    expect(Reflect.get(Object(guesses[4]), 'body')).toEqual({
      error: {
        code: 'challenge_expired',
        message: 'Too many wrong codes. Enter your password again.',
      },
    });

    const attacker: Tests_Routes_Api_Client = createClient(harness['baseUrl'], {
      'X-Forwarded-For': '198.51.100.66',
    });

    const failedAttempts: Tests_Routes_Api_Responses = await Promise.all(Array.from({ length: 10 }, async () => attacker.request('POST', '/api/v1/auth/login', {
      password: 'wrong password guess',
      username: 'admin',
    })));

    expect(failedAttempts.map((failedAttempt) => failedAttempt['status'])).toEqual(Array.from({ length: 10 }, () => 401));

    expect(Reflect.get(Object(failedAttempts[0]), 'body')).toEqual({
      error: {
        code: 'credentials_invalid',
        message: 'The username or password is incorrect.',
      },
    });

    const limited: Tests_Routes_Api_Response = await attacker.request('POST', '/api/v1/auth/login', {
      password: 'fixture admin password',
      username: 'admin',
    });

    expect(limited['status']).toBe(429);

    expect(Number(limited['headers'].get('Retry-After'))).toBeGreaterThan(0);

    expect((await createClient(harness['baseUrl'], {
      'X-Forwarded-For': '198.51.100.67',
    }).request('POST', '/api/v1/auth/login', {
      password: 'fixture admin password',
      username: 'admin',
    }))['status']).toBe(200);

    return;
  });

  it('keeps a browser signed in across a restart', async () => {
    if (harness === undefined) {
      throw new Error('The test server is not running.');
    }

    const client: Tests_Routes_Api_Client = createClient(harness['baseUrl']);

    await claim(client, harness);

    await stopHarness(harness);

    harness = await startHarness();

    const restartedClient: Tests_Routes_Api_Client = createClient(harness['baseUrl']);

    for (const cookie of client['cookies']) {
      restartedClient['cookies'].set(cookie[0], cookie[1]);
    }

    expect(await restartedClient.request('GET', '/api/v1/auth/me')).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        username: 'admin',
      }),
      status: 200,
    }));

    return;
  });

  it('lists what a lost key removed until it is dismissed', async () => {
    if (harness === undefined) {
      throw new Error('The test server is not running.');
    }

    const client: Tests_Routes_Api_Client = createClient(harness['baseUrl']);

    await claim(client, harness);

    const state: Tests_Routes_Api_State = harness['server'].getState();
    const administrator: Tests_Routes_Api_Administrator = state.getAdministrator();
    const readToken: Tests_Routes_Api_CreatedToken = state.createToken({
      name: 'Dashboard',
      scopes: ['pfsense:read'],
    }, 'admin');

    if (administrator === undefined || readToken === undefined) {
      throw new Error('The fixture account or token was not created.');
    }

    state.enableTotp(administrator['id'], generateTotpSecret(), 1, 'admin');

    state.updateConnection({
      pfsensePassword: 'fixture-password',
      pfsenseSshIp: '192.0.2.1',
      pfsenseSshPort: 22,
      pfsenseUsername: 'fixture-user',
    }, 'admin');

    await stopHarness(harness);

    rmSync(join(baseDirectory, 'data', 'keys', 'installation.key'));

    harness = await startHarness();

    const restartedClient: Tests_Routes_Api_Client = createClient(harness['baseUrl']);
    const reader: Tests_Routes_Api_Client = createClient(harness['baseUrl'], {
      Authorization: `Bearer ${readToken['personalAccessToken']}`,
    });

    for (const cookie of client['cookies']) {
      restartedClient['cookies'].set(cookie[0], cookie[1]);
    }

    expect(await restartedClient.request('GET', '/api/v1/auth/me')).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        removedSecrets: [
          {
            kind: 'authenticator',
            removedAt: expect.any(String),
          },
          {
            credentialType: 'password',
            kind: 'pfsense-credential',
            removedAt: expect.any(String),
          },
        ],
      }),
      status: 200,
    }));

    expect(await restartedClient.request('GET', '/api/v1/connection')).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        configured: true,
        credentialSaved: false,
        pfsenseSshIp: '192.0.2.1',
      }),
      status: 200,
    }));

    expect(await reader.request('GET', '/api/v1/system')).toEqual(expect.objectContaining({
      body: {
        error: {
          code: 'connection_not_configured',
          message: 'Enter the pfSense password or private key again in the console.',
        },
      },
      status: 503,
    }));

    expect(await reader.request('DELETE', '/api/v1/auth/removed-secrets')).toEqual(expect.objectContaining({
      status: 403,
    }));

    expect(await restartedClient.request('DELETE', '/api/v1/auth/removed-secrets', undefined, {
      'X-CSRF-Token': 'pfc_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    })).toEqual(expect.objectContaining({
      status: 403,
    }));

    expect(await restartedClient.request('DELETE', '/api/v1/auth/removed-secrets')).toEqual(expect.objectContaining({
      status: 204,
    }));

    expect(await restartedClient.request('GET', '/api/v1/auth/me')).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        removedSecrets: [],
      }),
      status: 200,
    }));

    return;
  });

  it('adds a passkey and signs in with it only on the hostname it was made on', async () => {
    if (harness === undefined) {
      throw new Error('The test server is not running.');
    }

    const client: Tests_Routes_Api_Client = createClient(harness['baseUrl'], proxyHeaders);
    const authenticator: Tests_Routes_Api_Authenticator = createAuthenticator();

    await claim(client, harness);

    expect(await createClient(harness['baseUrl']).request('POST', '/api/v1/auth/passkeys/login/options')).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'passkeys_unavailable',
        }),
      }),
      status: 409,
    }));

    const registrationOptions: Tests_Routes_Api_Response = await client.request('POST', '/api/v1/auth/passkeys/register/options', {
      name: 'MacBook',
      password: 'fixture admin password',
    });
    const creationOptions: Tests_Routes_Api_Options = Reflect.get(Object(registrationOptions['body']), 'options');

    Reflect.set(authenticator, 'userHandle', Reflect.get(Object(creationOptions['user']), 'id'));

    expect(creationOptions['rp']).toEqual(expect.objectContaining({
      id: 'actions.example.net',
    }));

    expect(await client.request('POST', '/api/v1/auth/passkeys/register/verify', {
      ceremonyId: Reflect.get(Object(registrationOptions['body']), 'ceremonyId'),
      credential: createRegistration(authenticator, creationOptions, 'https://actions.example.net'),
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        hostname: 'actions.example.net',
        name: 'MacBook',
      }),
      status: 201,
    }));

    await client.request('POST', '/api/v1/auth/logout');

    const signInOptions: Tests_Routes_Api_Response = await client.request('POST', '/api/v1/auth/passkeys/login/options');
    const requestOptions: Tests_Routes_Api_Options = Reflect.get(Object(signInOptions['body']), 'options');

    expect(await client.request('POST', '/api/v1/auth/passkeys/login/verify', {
      ceremonyId: Reflect.get(Object(signInOptions['body']), 'ceremonyId'),
      credential: createAssertion(authenticator, requestOptions, 'https://actions.example.net', 'actions.example.net'),
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        status: 'authenticated',
      }),
      status: 200,
    }));

    const otherHost: Tests_Routes_Api_Client = createClient(harness['baseUrl'], {
      'X-Forwarded-Host': 'other.example.net',
      'X-Forwarded-Proto': 'https',
    });
    const otherOptions: Tests_Routes_Api_Response = await otherHost.request('POST', '/api/v1/auth/passkeys/login/options');

    expect(await otherHost.request('POST', '/api/v1/auth/passkeys/login/verify', {
      ceremonyId: Reflect.get(Object(otherOptions['body']), 'ceremonyId'),
      credential: createAssertion(authenticator, Reflect.get(Object(otherOptions['body']), 'options'), 'https://other.example.net', 'actions.example.net'),
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'passkey_rejected',
        }),
      }),
      status: 401,
    }));

    return;
  });

  it('adds, edits, tests, and removes notification destinations', async () => {
    if (harness === undefined) {
      throw new Error('The test server is not running.');
    }

    const client: Tests_Routes_Api_Client = createClient(harness['baseUrl']);

    await claim(client, harness);

    expect(await client.request('GET', '/api/v1/notifications/events')).toEqual(expect.objectContaining({
      body: {
        items: expect.arrayContaining([
          {
            defaultEnabled: true,
            description: 'The scheduled check couldn\'t sign in to pfSense over SSH.',
            key: 'pfsense-unreachable',
            label: 'pfSense can\'t be reached',
          },
          {
            defaultEnabled: false,
            description: 'A wake packet went out.',
            key: 'wol-sent',
            label: 'Wake-on-LAN sent',
          },
        ]),
      },
      status: 200,
    }));

    expect(await client.request('POST', '/api/v1/notifications', {
      events: [],
      name: 'Phone',
      service: 'discord',
      settings: { webhookUrl: 'https://example.com/hook' },
    })).toEqual(expect.objectContaining({
      body: {
        error: expect.objectContaining({
          code: 'invalid_request',
          issues: [
            expect.objectContaining({
              field: 'events',
              message: 'Choose at least one event.',
            }),
            expect.objectContaining({
              field: 'settings.webhookUrl',
              message: 'Use a Discord webhook URL. It starts with https://discord.com/api/webhooks/.',
            }),
          ],
        }),
      },
      status: 422,
    }));

    const created: Tests_Routes_Api_Response = await client.request('POST', '/api/v1/notifications', {
      events: [
        'wol-sent',
        'sign-in-locked',
      ],
      name: 'Phone',
      service: 'telegram',
      settings: {
        botToken: '123:abc',
        chatId: '42',
      },
    });

    expect(created).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        events: [
          'wol-sent',
          'sign-in-locked',
        ],
        lastAttemptAt: null,
        name: 'Phone',
        secrets: { botToken: true },
        secretsMissing: [],
        service: 'telegram',
        settings: { chatId: '42' },
      }),
      status: 201,
    }));

    expect(JSON.stringify(created['body'])).not.toContain('123:abc');

    const notificationId: Tests_Routes_Api_NotificationId = String(Reflect.get(Object(created['body']), 'id'));

    expect(await client.request('POST', '/api/v1/notifications', {
      events: ['wol-sent'],
      name: 'PHONE',
      service: 'ntfy',
      settings: { url: 'https://ntfy.sh/alerts' },
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'notification_exists',
        }),
      }),
      status: 409,
    }));

    expect(await client.request('PUT', `/api/v1/notifications/${notificationId}`, {
      events: [
        'wol-sent',
        'sign-in-locked',
      ],
      name: 'My phone',
      settings: {
        botToken: '',
        chatId: '43',
      },
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        name: 'My phone',
        secrets: { botToken: true },
        settings: { chatId: '43' },
      }),
      status: 200,
    }));

    expect(await client.request('PUT', `/api/v1/notifications/${notificationId}`, {
      events: [
        'wol-sent',
        'sign-in-locked',
      ],
      name: 'My phone',
      clearSecrets: ['botToken'],
      settings: {
        botToken: '',
        chatId: '43',
      },
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'invalid_request',
          issues: [expect.objectContaining({ field: 'clearSecrets.0' })],
        }),
      }),
      status: 422,
    }));

    expect(await client.request('POST', `/api/v1/notifications/${notificationId}/test`)).toEqual(expect.objectContaining({
      body: { delivered: true },
      status: 200,
    }));

    expect(notificationMocks['send']).toHaveBeenLastCalledWith(expect.objectContaining({ key: 'pfsense-actions' }), {
      secrets: { botToken: '123:abc' },
      service: 'telegram',
      settings: { chatId: '43' },
    }, expect.objectContaining({ event: 'test' }));

    notificationMocks['send'].mockResolvedValueOnce({
      delivered: false,
      message: 'HTTP 401: Unauthorized',
    });

    expect(await client.request('POST', `/api/v1/notifications/${notificationId}/test`)).toEqual(expect.objectContaining({
      body: {
        delivered: false,
        message: 'HTTP 401: Unauthorized',
      },
      status: 200,
    }));

    expect(await client.request('GET', '/api/v1/notifications')).toEqual(expect.objectContaining({
      body: {
        items: [expect.objectContaining({
          id: notificationId,
          lastAttemptAt: expect.any(String),
          lastError: 'HTTP 401: Unauthorized',
        })],
      },
    }));

    const stranger: Tests_Routes_Api_Client = createClient(harness['baseUrl'], {
      'X-Forwarded-For': '198.51.100.40',
    });

    await Promise.all(Array.from({ length: 10 }, () => stranger.request('POST', '/api/v1/auth/login', {
      password: 'not the password',
      username: 'admin',
    })));

    await vi.waitFor(() => {
      expect(notificationMocks['send']).toHaveBeenLastCalledWith(expect.anything(), expect.anything(), expect.objectContaining({
        details: { address: '198.51.100.40' },
        event: 'sign-in-locked',
      }));

      return;
    });

    const createdToken: Tests_Routes_Api_Response = await client.request('POST', '/api/v1/auth/tokens', {
      name: 'Script',
      scopes: ['pfsense:read'],
    });
    const scriptClient: Tests_Routes_Api_Client = createClient(harness['baseUrl'], {
      Authorization: `Bearer ${String(Reflect.get(Object(createdToken['body']), 'plaintext'))}`,
    });

    expect(await scriptClient.request('GET', '/api/v1/notifications')).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'session_required',
        }),
      }),
      status: 403,
    }));

    expect((await client.request('DELETE', `/api/v1/notifications/${notificationId}`))['status']).toBe(204);

    expect(await client.request('GET', '/api/v1/notifications')).toEqual(expect.objectContaining({
      body: { items: [] },
      status: 200,
    }));

    expect((await client.request('DELETE', `/api/v1/notifications/${notificationId}`))['status']).toBe(404);

    return;
  });

  it('clears saved optional notification secrets explicitly', async () => {
    if (harness === undefined) {
      throw new Error('The test server is not running.');
    }

    const client: Tests_Routes_Api_Client = createClient(harness['baseUrl']);

    await claim(client, harness);

    const created: Tests_Routes_Api_Response = await client.request('POST', '/api/v1/notifications', {
      events: ['action-failed'],
      name: 'Optional token',
      service: 'ntfy',
      settings: {
        token: 'ntfy-secret',
        url: 'https://ntfy.sh/actions',
      },
    });
    const notificationId: Tests_Routes_Api_NotificationId = String(Reflect.get(Object(created['body']), 'id'));

    expect(await client.request('PUT', `/api/v1/notifications/${notificationId}`, {
      events: ['action-failed'],
      name: 'Optional token',
      clearSecrets: ['url'],
      settings: {
        token: '',
        url: 'https://ntfy.sh/actions',
      },
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'invalid_request',
          issues: [expect.objectContaining({ field: 'clearSecrets.0' })],
        }),
      }),
      status: 422,
    }));

    expect(await client.request('PUT', `/api/v1/notifications/${notificationId}`, {
      clearSecrets: ['token'],
      events: ['action-failed'],
      name: 'Optional token',
      settings: {
        token: 'new-secret',
        url: 'https://ntfy.sh/actions',
      },
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          issues: [expect.objectContaining({
            field: 'settings.token',
            message: 'Enter a new value or clear this field, not both.',
          })],
        }),
      }),
      status: 422,
    }));

    expect(await client.request('PUT', `/api/v1/notifications/${notificationId}`, {
      events: ['action-failed'],
      name: 'Optional token',
      clearSecrets: ['token'],
      settings: {
        token: '',
        url: 'https://ntfy.sh/actions',
      },
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        secrets: {},
        secretsMissing: [],
      }),
      status: 200,
    }));

    // Once it's gone there's nothing left to clear.
    expect(await client.request('PUT', `/api/v1/notifications/${notificationId}`, {
      clearSecrets: ['token'],
      events: ['action-failed'],
      name: 'Optional token',
      settings: {
        token: '',
        url: 'https://ntfy.sh/actions',
      },
    })).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          issues: [expect.objectContaining({
            field: 'clearSecrets.0',
            message: 'Choose an optional saved secret.',
          })],
        }),
      }),
      status: 422,
    }));

    expect((await client.request('POST', `/api/v1/notifications/${notificationId}/test`))['status']).toBe(200);

    expect(notificationMocks['send']).toHaveBeenLastCalledWith(expect.anything(), {
      secrets: {},
      service: 'ntfy',
      settings: { url: 'https://ntfy.sh/actions' },
    }, expect.objectContaining({ event: 'test' }));

    return;
  });

  it('answers malformed requests with the shared error envelope', async () => {
    if (harness === undefined) {
      throw new Error('The test server is not running.');
    }

    const client: Tests_Routes_Api_Client = createClient(harness['baseUrl']);

    expect(await client.request('POST', '/api/v1/auth/login', '{"username":')).toEqual(expect.objectContaining({
      body: expect.objectContaining({
        error: expect.objectContaining({
          code: 'invalid_json',
        }),
      }),
      status: 400,
    }));

    expect(await client.request('POST', '/api/v1/auth/login', {
      password: 'x'.repeat(70_000),
      username: 'admin',
    })).toEqual(expect.objectContaining({
      status: 413,
    }));

    expect(await client.request('POST', '/api/v1/auth/login', {
      password: 'fixture admin password',
      remember: true,
      username: 'admin',
    })).toEqual(expect.objectContaining({
      body: {
        error: {
          code: 'invalid_request',
          issues: [{
            field: 'remember',
            message: 'This field isn\'t accepted.',
            path: ['remember'],
          }],
          message: 'This field isn\'t accepted.',
        },
      },
      status: 422,
    }));

    expect(await client.request('GET', '/api/v1/unknown')).toEqual(expect.objectContaining({
      body: {
        error: {
          code: 'not_found',
          message: 'No route matches this request.',
        },
      },
      status: 404,
    }));

    return;
  });

  it('serves the console page for every console path', async () => {
    if (harness === undefined) {
      throw new Error('The test server is not running.');
    }

    const client: Tests_Routes_Api_Client = createClient(harness['baseUrl']);
    const page: Tests_Routes_Api_Response = await client.request('GET', '/admin/tokens');
    const asset: Tests_Routes_Api_Response = await client.request('GET', '/admin/assets/app-1234.js');
    const root: Tests_Routes_Api_Response = await client.request('GET', '/', undefined, {
      Accept: 'text/html',
    });

    expect(page['status']).toBe(200);

    expect(page['body']).toContain('<title>pfSense Actions</title>');

    expect(page['headers'].get('Content-Security-Policy')).toContain('script-src \'self\'');

    expect(page['headers'].get('Cache-Control')).toBe('no-store');

    expect(asset['headers'].get('Cache-Control')).toContain('immutable');

    expect(root['status']).toBe(302);

    expect(root['headers'].get('Location')).toBe('/admin/');

    return;
  });

  return;
});
