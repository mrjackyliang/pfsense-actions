import {
  existsSync,
  readFileSync,
} from 'node:fs';

import { registerPackageScriptsSuite } from '@cbnventures/nova/rules/vitest';
import * as vitest from 'vitest';
import {
  describe,
  expect,
  it,
} from 'vitest';

import apiPackageJson from '../apps/api/package.json' with { type: 'json' };
import docsPackageJson from '../apps/docs/package.json' with { type: 'json' };
import packageJson from '../package.json' with { type: 'json' };
import dockerBuildPackageJson from '../packages/docker/build-package.json' with { type: 'json' };
import dockerPackageJson from '../packages/docker/package.json' with { type: 'json' };

/**
 * Project - Project Root.
 *
 * Confirms the repository root remains a private monorepo coordinator.
 *
 * @since 0.0.0
 */
describe('Project root', () => {
  it('stays private', () => {
    expect(packageJson['private']).toBe(true);

    return;
  });

  it('keeps the release version on the API and 0.0.0 on the frozen manifests', () => {
    expect(apiPackageJson['version']).not.toBe('0.0.0');

    expect(packageJson['version']).toBe('0.0.0');

    expect(docsPackageJson['version']).toBe('0.0.0');

    expect(dockerBuildPackageJson['version']).toBe('0.0.0');

    expect(dockerPackageJson['version']).toBe('0.0.0');

    return;
  });

  it('keeps the passkey display name in the generated API environment sample', () => {
    expect(readFileSync(new URL('../apps/api/.env.sample', import.meta.url), 'utf8')).toContain('ADMIN_WEBAUTHN_RP_NAME="pfSense Actions"');

    return;
  });

  it('keeps one repository-wide container entry point', () => {
    expect(existsSync(new URL('../Dockerfile', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../compose.yml', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../.dockerignore', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../packages/docker/package.json', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../packages/docker/manifest.json', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../packages/docker/build-package.json', import.meta.url))).toBe(true);

    expect(readFileSync(new URL('../.dockerignore', import.meta.url), 'utf8')).toContain('**/.env');

    expect(readFileSync(new URL('../.dockerignore', import.meta.url), 'utf8')).toContain('!**/.env.sample');

    expect(readFileSync(new URL('../.dockerignore', import.meta.url), 'utf8')).toContain('**/build');

    expect(readFileSync(new URL('../.dockerignore', import.meta.url), 'utf8')).toContain('**/dist');

    expect(readFileSync(new URL('../.dockerignore', import.meta.url), 'utf8')).toContain('**/node_modules');

    expect(readFileSync(new URL('../.dockerignore', import.meta.url), 'utf8')).toContain('**/.secrets');

    expect(existsSync(new URL('../apps/api/Dockerfile', import.meta.url))).toBe(false);

    expect(existsSync(new URL('../apps/api/compose.yml', import.meta.url))).toBe(false);

    expect(existsSync(new URL('../apps/api/.dockerignore', import.meta.url))).toBe(false);

    expect(readFileSync(new URL('../compose.yml', import.meta.url), 'utf8')).not.toContain('secrets:');

    return;
  });

  it('builds the API in the image and starts it after root initialization', () => {
    expect(readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8')).toContain('npm run build --workspace=\'pfsense-actions-app-api\'');

    expect(readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8')).toContain('COPY packages/docker/rootfs/ /');

    expect(readFileSync(new URL('../packages/docker/manifest.json', import.meta.url), 'utf8')).toContain('"runtimePaths"');

    expect(existsSync(new URL('../packages/docker/rootfs/etc/s6-overlay/s6-rc.d/nova-container-init/dependencies.d/base', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../packages/docker/rootfs/etc/s6-overlay/s6-rc.d/pfsense-actions/dependencies.d/nova-container-init', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../packages/docker/rootfs/etc/s6-overlay/user-bundles.d/user/contents.d/pfsense-actions', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../packages/docker/rootfs/etc/s6-overlay/s6-rc.d/container-init', import.meta.url))).toBe(false);

    expect(existsSync(new URL('../packages/docker/rootfs/etc/s6-overlay/s6-rc.d/user', import.meta.url))).toBe(false);

    expect(readFileSync(new URL('../packages/docker/rootfs/usr/local/libexec/nova-docker/init-user', import.meta.url), 'utf8')).toContain('done < /etc/nova-docker/writable-paths');

    expect(readFileSync(new URL('../packages/docker/rootfs/etc/s6-overlay/s6-rc.d/pfsense-actions/run', import.meta.url), 'utf8')).toContain('exec /command/s6-applyuidgid');

    expect(readFileSync(new URL('../packages/docker/rootfs/etc/s6-overlay/s6-rc.d/pfsense-actions/run', import.meta.url), 'utf8')).toContain('export DATA_DIRECTORY=\'/data\'');

    return;
  });

  return;
});

registerPackageScriptsSuite({
  vitest,
  requireRootScripts: true,
  enable: 'all',
});
