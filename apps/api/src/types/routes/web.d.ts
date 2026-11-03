import type express from 'express';

/**
 * Routes - Web - Runner - Allow Caching.
 *
 * @since 2.0.0
 */
export type Routes_Web_Runner_AllowCaching_Request = express.Request;

export type Routes_Web_Runner_AllowCaching_Response = express.Response;

export type Routes_Web_Runner_AllowCaching_Next = express.NextFunction;

export type Routes_Web_Runner_AllowCaching_Returns = void;

/**
 * Routes - Web - Runner - Console Headers.
 *
 * @since 2.0.0
 */
export type Routes_Web_Runner_ConsoleHeaders_Request = express.Request;

export type Routes_Web_Runner_ConsoleHeaders_Response = express.Response;

export type Routes_Web_Runner_ConsoleHeaders_Next = express.NextFunction;

export type Routes_Web_Runner_ConsoleHeaders_Returns = void;

/**
 * Routes - Web - Runner - Constructor.
 *
 * @since 2.0.0
 */
export type Routes_Web_Runner_Constructor_Root = string;

/**
 * Routes - Web - Runner - Redirect Browsers.
 *
 * @since 2.0.0
 */
export type Routes_Web_Runner_RedirectBrowsers_Request = express.Request;

export type Routes_Web_Runner_RedirectBrowsers_Response = express.Response;

export type Routes_Web_Runner_RedirectBrowsers_Next = express.NextFunction;

export type Routes_Web_Runner_RedirectBrowsers_Returns = void;

export type Routes_Web_Runner_RedirectBrowsers_Preferred = string | false;

/**
 * Routes - Web - Runner - Register.
 *
 * @since 2.0.0
 */
export type Routes_Web_Runner_Register_App = express.Express;

export type Routes_Web_Runner_Register_Returns = void;

/**
 * Routes - Web - Runner - Root.
 *
 * @since 2.0.0
 */
export type Routes_Web_Runner_Root = string;

/**
 * Routes - Web - Runner - Send Application.
 *
 * @since 2.0.0
 */
export type Routes_Web_Runner_SendApplication_Request = express.Request;

export type Routes_Web_Runner_SendApplication_Response = express.Response;

export type Routes_Web_Runner_SendApplication_Returns = void;

export type Routes_Web_Runner_SendApplication_IndexPath = string;
