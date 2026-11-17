import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';

import { sendError } from '../lib/http.js';

import type {
  Routes_Web_Runner_AllowCaching_Next,
  Routes_Web_Runner_AllowCaching_Request,
  Routes_Web_Runner_AllowCaching_Response,
  Routes_Web_Runner_AllowCaching_Returns,
  Routes_Web_Runner_ConsoleHeaders_Next,
  Routes_Web_Runner_ConsoleHeaders_Request,
  Routes_Web_Runner_ConsoleHeaders_Response,
  Routes_Web_Runner_ConsoleHeaders_Returns,
  Routes_Web_Runner_Constructor_Root,
  Routes_Web_Runner_Register_App,
  Routes_Web_Runner_Register_Returns,
  Routes_Web_Runner_RegisterFallback_App,
  Routes_Web_Runner_RegisterFallback_Returns,
  Routes_Web_Runner_Root,
  Routes_Web_Runner_SendApplication_IndexPath,
  Routes_Web_Runner_SendApplication_Request,
  Routes_Web_Runner_SendApplication_Response,
  Routes_Web_Runner_SendApplication_Returns,
  Routes_Web_Runner_SendBrowserApplication_Next,
  Routes_Web_Runner_SendBrowserApplication_Preferred,
  Routes_Web_Runner_SendBrowserApplication_Request,
  Routes_Web_Runner_SendBrowserApplication_Response,
  Routes_Web_Runner_SendBrowserApplication_Returns,
} from '@/types/routes/web.d.ts';

/**
 * Routes - Web.
 *
 * Serves the built console for root-level page addresses while retaining the
 * /admin static build. API requests continue through to their route modules.
 *
 * @since 2.0.0
 */
export class Runner {
  /**
   * Routes - Web - Root.
   *
   * Points to the folder the Vite build writes the console into.
   * Hashed asset names let those files be cached for a year.
   *
   * @private
   *
   * @since 2.0.0
   */
  readonly #root: Routes_Web_Runner_Root;

  /**
   * Routes - Web - Constructor.
   *
   * Uses the built console beside the compiled service unless a folder is given.
   * Tests pass their own folder.
   *
   * @param {Routes_Web_Runner_Constructor_Root} [root] - Root.
   *
   * @since 2.0.0
   */
  public constructor(root?: Routes_Web_Runner_Constructor_Root) {
    this.#root = root ?? fileURLToPath(new URL('../../build/admin', import.meta.url));

    return;
  }

  /**
   * Routes - Web - Register.
   *
   * Installs the root browser entry, the console's strict browser policy, its
   * files, and the legacy /admin page before the root connectivity alias.
   *
   * @param {Routes_Web_Runner_Register_App} app - App.
   *
   * @returns {Routes_Web_Runner_Register_Returns}
   *
   * @since 2.0.0
   */
  public register(app: Routes_Web_Runner_Register_App): Routes_Web_Runner_Register_Returns {
    app.get('/', this['sendBrowserApplication'].bind(this));

    app.use('/admin', this['consoleHeaders'].bind(this));

    app.use('/admin/assets', this['allowCaching'].bind(this), express.static(join(this.#root, 'assets'), {
      fallthrough: false,
      immutable: true,
      index: false,
      maxAge: '1y',
    }));

    app.use('/admin', this['allowCaching'].bind(this), express.static(this.#root, {
      index: false,
      maxAge: '1h',
    }));

    app.get([
      '/admin',
      '/admin/*',
    ], this['sendApplication'].bind(this));

    return;
  }

  /**
   * Routes - Web - Register Fallback.
   *
   * Installs the HTML fallback after API routes so refreshes and unknown page
   * addresses reach React without changing API or static-file behavior.
   *
   * @param {Routes_Web_Runner_RegisterFallback_App} app - App.
   *
   * @returns {Routes_Web_Runner_RegisterFallback_Returns}
   *
   * @since 2.1.0
   */
  public registerFallback(app: Routes_Web_Runner_RegisterFallback_App): Routes_Web_Runner_RegisterFallback_Returns {
    app.get('*', this['sendBrowserApplication'].bind(this));

    return;
  }

  /**
   * Routes - Web - Allow Caching.
   *
   * Removes the default no-store header so static files can set their own lifetime.
   * The page itself is sent later with no-store again.
   *
   * @param {Routes_Web_Runner_AllowCaching_Request}  _request - Request.
   * @param {Routes_Web_Runner_AllowCaching_Response} response - Response.
   * @param {Routes_Web_Runner_AllowCaching_Next}     next     - Next.
   *
   * @private
   *
   * @returns {Routes_Web_Runner_AllowCaching_Returns}
   *
   * @since 2.0.0
   */
  private allowCaching(_request: Routes_Web_Runner_AllowCaching_Request, response: Routes_Web_Runner_AllowCaching_Response, next: Routes_Web_Runner_AllowCaching_Next): Routes_Web_Runner_AllowCaching_Returns {
    response.removeHeader('Cache-Control');

    next();

    return;
  }

  /**
   * Routes - Web - Console Headers.
   *
   * Applies a restrictive browser policy to every console response.
   * The page loads scripts, styles, and data only from this same address.
   *
   * @param {Routes_Web_Runner_ConsoleHeaders_Request}  _request - Request.
   * @param {Routes_Web_Runner_ConsoleHeaders_Response} response - Response.
   * @param {Routes_Web_Runner_ConsoleHeaders_Next}     next     - Next.
   *
   * @private
   *
   * @returns {Routes_Web_Runner_ConsoleHeaders_Returns}
   *
   * @since 2.0.0
   */
  private consoleHeaders(_request: Routes_Web_Runner_ConsoleHeaders_Request, response: Routes_Web_Runner_ConsoleHeaders_Response, next: Routes_Web_Runner_ConsoleHeaders_Next): Routes_Web_Runner_ConsoleHeaders_Returns {
    response.set({
      'Content-Security-Policy': 'default-src \'self\'; base-uri \'none\'; connect-src \'self\'; font-src \'self\'; form-action \'self\'; frame-ancestors \'none\'; img-src \'self\' data:; object-src \'none\'; script-src \'self\'; style-src \'self\'',
      'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
      'X-Frame-Options': 'DENY',
    });

    next();

    return;
  }

  /**
   * Routes - Web - Send Browser Application.
   *
   * Sends the application only to HTML navigation requests outside the API.
   * Token-authenticated and JSON requests continue to the normal route chain.
   *
   * @param {Routes_Web_Runner_SendBrowserApplication_Request}  request  - Request.
   * @param {Routes_Web_Runner_SendBrowserApplication_Response} response - Response.
   * @param {Routes_Web_Runner_SendBrowserApplication_Next}     next     - Next.
   *
   * @private
   *
   * @returns {Routes_Web_Runner_SendBrowserApplication_Returns}
   *
   * @since 2.1.0
   */
  private sendBrowserApplication(request: Routes_Web_Runner_SendBrowserApplication_Request, response: Routes_Web_Runner_SendBrowserApplication_Response, next: Routes_Web_Runner_SendBrowserApplication_Next): Routes_Web_Runner_SendBrowserApplication_Returns {
    const preferred: Routes_Web_Runner_SendBrowserApplication_Preferred = request.accepts([
      'json',
      'html',
    ]);

    if (
      request.path.startsWith('/api/') === true
      || request.get('Authorization') !== undefined
      || preferred !== 'html'
    ) {
      next();

      return;
    }

    response.set({
      'Content-Security-Policy': 'default-src \'self\'; base-uri \'none\'; connect-src \'self\'; font-src \'self\'; form-action \'self\'; frame-ancestors \'none\'; img-src \'self\' data:; object-src \'none\'; script-src \'self\'; style-src \'self\'',
      'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
      'X-Frame-Options': 'DENY',
    });

    this.sendApplication(request, response);

    return;
  }

  /**
   * Routes - Web - Send Application.
   *
   * Returns the console page for any console path so links and reloads work.
   * A missing build answers with a clear error instead of an empty page.
   *
   * @param {Routes_Web_Runner_SendApplication_Request}  _request - Request.
   * @param {Routes_Web_Runner_SendApplication_Response} response - Response.
   *
   * @private
   *
   * @returns {Routes_Web_Runner_SendApplication_Returns}
   *
   * @since 2.0.0
   */
  private sendApplication(_request: Routes_Web_Runner_SendApplication_Request, response: Routes_Web_Runner_SendApplication_Response): Routes_Web_Runner_SendApplication_Returns {
    const indexPath: Routes_Web_Runner_SendApplication_IndexPath = join(this.#root, 'index.html');

    response.set('Cache-Control', 'no-store');

    response.sendFile(indexPath, (error) => {
      if (error !== undefined && response.headersSent === false) {
        sendError(response, 404, 'console_not_built', 'The console isn\'t built. Run npm run build:web in apps/api.');
      }

      return;
    });

    return;
  }
}
