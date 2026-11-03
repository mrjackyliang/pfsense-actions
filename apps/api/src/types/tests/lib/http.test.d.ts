import type express from 'express';
import type { ZodSafeParseResult } from 'zod';

/**
 * Tests - Lib - HTTP - Create Request.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Http_CreateRequest_Headers = Record<string, string>;

export type Tests_Lib_Http_CreateRequest_Name = string;

export type Tests_Lib_Http_CreateRequest_Options_Ip = string | undefined;

export type Tests_Lib_Http_CreateRequest_Options_Protocol = string;

export type Tests_Lib_Http_CreateRequest_Options_RemoteAddress = string | undefined;

export type Tests_Lib_Http_CreateRequest_Options = {
  headers: Tests_Lib_Http_CreateRequest_Headers;
  ip: Tests_Lib_Http_CreateRequest_Options_Ip;
  protocol: Tests_Lib_Http_CreateRequest_Options_Protocol;
  remoteAddress: Tests_Lib_Http_CreateRequest_Options_RemoteAddress;
};

export type Tests_Lib_Http_CreateRequest_Returns = express.Request;

export type Tests_Lib_Http_CreateRequest_Request = express.Request;

export type Tests_Lib_Http_CreateRequest_Unknown = unknown;

/**
 * Tests - Lib - HTTP - Parse Result.
 *
 * @since 2.0.0
 */
export type Tests_Lib_Http_ParseResult = ZodSafeParseResult<unknown>;
