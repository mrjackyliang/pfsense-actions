import {
  describe,
  expect,
  it,
} from 'vitest';

import z from 'zod';

import {
  buildCookie,
  getClientAddress,
  getRequestHost,
  getRequestHostname,
  getRequestOrigin,
  getValidationIssues,
  isPasskeyAvailable,
  isTrustedProxyAddress,
  readCookie,
} from '@/lib/http.js';

import type {
  Tests_Lib_Http_CreateRequest_Headers,
  Tests_Lib_Http_CreateRequest_Name,
  Tests_Lib_Http_CreateRequest_Options,
  Tests_Lib_Http_CreateRequest_Request,
  Tests_Lib_Http_CreateRequest_Returns,
  Tests_Lib_Http_CreateRequest_Unknown,
  Tests_Lib_Http_ParseResult,
} from '@/types/tests/lib/http.test.d.ts';

/**
 * Tests - Lib - HTTP - Create Request.
 *
 * Builds the request fields the address helpers read, without a network listener.
 * Header lookup is case-insensitive like Express.
 *
 * @param {Tests_Lib_Http_CreateRequest_Options} options - Options.
 *
 * @returns {Tests_Lib_Http_CreateRequest_Returns}
 *
 * @since 2.0.0
 */
function createRequest(options: Tests_Lib_Http_CreateRequest_Options): Tests_Lib_Http_CreateRequest_Returns {
  const headers: Tests_Lib_Http_CreateRequest_Headers = Object.fromEntries(Object.entries(options['headers']).map((entry) => [
    entry[0].toLowerCase(),
    entry[1],
  ]));

  return {
    get: (name: Tests_Lib_Http_CreateRequest_Name) => headers[name.toLowerCase()],
    ip: options['ip'],
    protocol: options['protocol'],
    socket: {
      remoteAddress: options['remoteAddress'],
    },
  } as Tests_Lib_Http_CreateRequest_Unknown as Tests_Lib_Http_CreateRequest_Request;
}

describe('trusted proxies', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '172.31.255.254',
    '192.168.1.20',
    '::1',
    'fd12:3456::1',
    '::ffff:10.0.0.5',
  ])('trusts the private or loopback sender %s', (address) => {
    expect(isTrustedProxyAddress(address)).toBe(true);

    return;
  });

  it.each([
    '8.8.8.8',
    '172.32.0.1',
    '203.0.113.10',
    '2001:db8::1',
    '::ffff:8.8.8.8',
    'not-an-address',
    '',
    undefined,
  ])('ignores forwarded headers from %s', (address) => {
    expect(isTrustedProxyAddress(address)).toBe(false);

    return;
  });

  it('shows IPv6-mapped IPv4 client addresses in their usual form', () => {
    expect(getClientAddress(createRequest({
      headers: {},
      ip: '::ffff:192.168.1.50',
      protocol: 'http',
      remoteAddress: '::ffff:192.168.1.50',
    }))).toBe('192.168.1.50');

    expect(getClientAddress(createRequest({
      headers: {},
      ip: undefined,
      protocol: 'http',
      remoteAddress: undefined,
    }))).toBe('unknown');

    return;
  });

  return;
});

describe('own address per request', () => {
  it('uses X-Forwarded-Host only from a trusted proxy', () => {
    const headers: Tests_Lib_Http_CreateRequest_Headers = {
      'Host': '192.168.1.20:22603',
      'X-Forwarded-Host': 'actions.example.net, ignored.example.net',
    };

    expect(getRequestHost(createRequest({
      headers,
      ip: '203.0.113.10',
      protocol: 'https',
      remoteAddress: '172.18.0.2',
    }))).toBe('actions.example.net');

    expect(getRequestHost(createRequest({
      headers,
      ip: '203.0.113.10',
      protocol: 'http',
      remoteAddress: '203.0.113.10',
    }))).toBe('192.168.1.20:22603');

    return;
  });

  it('rejects host values that are not a hostname and port', () => {
    expect(getRequestHost(createRequest({
      headers: {
        Host: 'evil.example/path',
      },
      ip: '127.0.0.1',
      protocol: 'http',
      remoteAddress: '127.0.0.1',
    }))).toBe('');

    return;
  });

  it('builds the passkey origin and RP ID from the visitor scheme and host', () => {
    const request: Tests_Lib_Http_CreateRequest_Returns = createRequest({
      headers: {
        'X-Forwarded-Host': 'Actions.Example.Net',
      },
      ip: '203.0.113.10',
      protocol: 'https',
      remoteAddress: '10.0.0.2',
    });

    expect(getRequestOrigin(request)).toBe('https://actions.example.net');

    expect(getRequestHostname(request)).toBe('actions.example.net');

    expect(isPasskeyAvailable(request)).toBe(true);

    return;
  });

  it('only offers passkeys on a domain name over https or localhost', () => {
    expect(isPasskeyAvailable(createRequest({
      headers: {
        Host: 'actions.example.net',
      },
      ip: '192.168.1.5',
      protocol: 'http',
      remoteAddress: '192.168.1.5',
    }))).toBe(false);

    expect(isPasskeyAvailable(createRequest({
      headers: {
        Host: '192.168.1.20:22603',
      },
      ip: '192.168.1.5',
      protocol: 'https',
      remoteAddress: '192.168.1.5',
    }))).toBe(false);

    expect(isPasskeyAvailable(createRequest({
      headers: {
        Host: '[::1]:22603',
      },
      ip: '::1',
      protocol: 'http',
      remoteAddress: '::1',
    }))).toBe(false);

    expect(isPasskeyAvailable(createRequest({
      headers: {
        Host: 'localhost:22603',
      },
      ip: '127.0.0.1',
      protocol: 'http',
      remoteAddress: '127.0.0.1',
    }))).toBe(true);

    return;
  });

  return;
});

describe('cookies and validation issues', () => {
  it('writes strict site-wide cookies and reads one exact name', () => {
    expect(buildCookie('pfa_session', 'value', {
      httpOnly: true,
      maxAge: 60,
      secure: true,
    })).toBe('pfa_session=value; Path=/; SameSite=Strict; Max-Age=60; HttpOnly; Secure');

    expect(readCookie(createRequest({
      headers: {
        Cookie: 'other=1; pfa_session_extra=2; pfa_session=wanted',
      },
      ip: '127.0.0.1',
      protocol: 'http',
      remoteAddress: '127.0.0.1',
    }), 'pfa_session')).toBe('wanted');

    expect(readCookie(createRequest({
      headers: {
        Cookie: 'pfa_session=%E0%A4%A',
      },
      ip: '127.0.0.1',
      protocol: 'http',
      remoteAddress: '127.0.0.1',
    }), 'pfa_session')).toBeUndefined();

    return;
  });

  it('points each validation issue at its field', () => {
    const result: Tests_Lib_Http_ParseResult = z.object({
      connection: z.object({
        port: z.number({ error: 'Enter a port number.' }),
      }),
      username: z.string().min(1, 'Enter a username.'),
    }).safeParse({
      connection: {
        port: 'twenty-two',
      },
      username: '',
    });

    if (result.success === true) {
      throw new Error('The fixture unexpectedly passed validation.');
    }

    expect(getValidationIssues(result.error)).toEqual([
      {
        field: 'connection.port',
        message: 'Enter a port number.',
        path: [
          'connection',
          'port',
        ],
      },
      {
        field: 'username',
        message: 'Enter a username.',
        path: ['username'],
      },
    ]);

    return;
  });

  return;
});
