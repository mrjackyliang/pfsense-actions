import type {
  Shared_ApiResponse,
  Shared_ApiResponse_Action,
  Shared_ApiResponse_Success_Info,
  Shared_EnvironmentImports,
  Shared_EnvironmentVariables,
} from '@/types/shared.d.ts';

/**
 * Lib - Utility - Get Action HTTP Status.
 *
 * @since 2.0.0
 */
export type Lib_Utility_GetActionHttpStatus_Response = Shared_ApiResponse<
  Shared_ApiResponse_Action,
  Shared_ApiResponse_Success_Info
>;

export type Lib_Utility_GetActionHttpStatus_Returns = 200 | 502;

/**
 * Lib - Utility - Get Deprecation Warnings.
 *
 * @since 2.0.0
 */
export type Lib_Utility_GetDeprecationWarnings_Environment = Shared_EnvironmentVariables;

export type Lib_Utility_GetDeprecationWarnings_Imports = Shared_EnvironmentImports;

export type Lib_Utility_GetDeprecationWarnings_Returns = string[];

export type Lib_Utility_GetDeprecationWarnings_Warnings = string[];

export type Lib_Utility_GetDeprecationWarnings_HasConnectionValues = boolean;

/**
 * Lib - Utility - Get Environment Variables.
 *
 * @since 2.0.0
 */
export type Lib_Utility_GetEnvironmentVariables_Returns = Shared_EnvironmentVariables;

export type Lib_Utility_GetEnvironmentVariables_AdminWebauthnRpName = string;

export type Lib_Utility_GetEnvironmentVariables_DataDirectory = string;

export type Lib_Utility_GetEnvironmentVariables_PfsensePassword = string | undefined;

export type Lib_Utility_GetEnvironmentVariables_PfsensePrivateKey = string | undefined;

export type Lib_Utility_GetEnvironmentVariables_PfsenseSshIp = string | undefined;

export type Lib_Utility_GetEnvironmentVariables_PfsenseSshPort = string | undefined;

export type Lib_Utility_GetEnvironmentVariables_PfsenseUsername = string | undefined;

export type Lib_Utility_GetEnvironmentVariables_Port = string | undefined;

/**
 * Lib - Utility - Get Package Version.
 *
 * @since 2.0.0
 */
export type Lib_Utility_GetPackageVersion_Returns = string;

export type Lib_Utility_GetPackageVersion_PackageJsonRaw = string;

export type Lib_Utility_GetPackageVersion_PackageJson = Record<string, unknown>;

export type Lib_Utility_GetPackageVersion_Version = unknown;
