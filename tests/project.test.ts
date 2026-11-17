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
import novaConfigJson from '../nova.config.json' with { type: 'json' };
import packageJson from '../package.json' with { type: 'json' };
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

    expect(dockerPackageJson['version']).toBe('0.0.0');

    return;
  });

  it('keeps the passkey display name in the API environment settings', () => {
    expect(novaConfigJson['environment']['workspaces']['./apps/api']['variables']).toContainEqual(expect.objectContaining({
      key: 'ADMIN_WEBAUTHN_RP_NAME',
      defaultValue: 'pfSense Actions',
    }));

    return;
  });

  it('keeps one repository-wide container entry point', () => {
    expect(existsSync(new URL('../Dockerfile', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../compose.yml', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../.dockerignore', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../packages/docker/package.json', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../packages/docker/manifest.json', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../packages/docker/build-package.json', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../apps/api/Dockerfile', import.meta.url))).toBe(false);

    expect(existsSync(new URL('../apps/api/compose.yml', import.meta.url))).toBe(false);

    expect(existsSync(new URL('../apps/api/.dockerignore', import.meta.url))).toBe(false);

    expect(readFileSync(new URL('../compose.yml', import.meta.url), 'utf8')).not.toContain('secrets:');

    return;
  });

  it('builds the API in the image and starts it after root initialization', () => {
    expect(readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8')).toContain('npm run build --workspace=\'pfsense-actions-app-api\'');

    expect(readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8')).toContain('COPY packages/docker/rootfs/ /');

    expect(readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8')).toContain('RUN mkdir -p /config /data');

    expect(readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8')).toContain('S6_BEHAVIOUR_IF_STAGE2_FAILS=2');

    expect(readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8')).toContain('util-linux');

    expect(readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8')).toContain('HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3');

    expect(readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8')).not.toContain('VOLUME');

    expect(readFileSync(new URL('../compose.yml', import.meta.url), 'utf8')).toContain('pfsense_actions_data:/config');

    expect(readFileSync(new URL('../compose.yml', import.meta.url), 'utf8')).toContain('network_mode: host');

    expect(readFileSync(new URL('../compose.yml', import.meta.url), 'utf8')).toContain('user: "0:0"');

    expect(readFileSync(new URL('../packages/docker/manifest.json', import.meta.url), 'utf8')).toContain('"runtimePaths"');

    expect(readFileSync(new URL('../packages/docker/manifest.json', import.meta.url), 'utf8')).toContain('"stateEnvironment": "DATA_DIRECTORY"');

    expect(readFileSync(new URL('../packages/docker/manifest.json', import.meta.url), 'utf8')).toContain('"critical": true');

    expect(readFileSync(new URL('../packages/docker/manifest.json', import.meta.url), 'utf8')).toContain('"healthPath": "/health"');

    expect(existsSync(new URL('../packages/docker/rootfs/etc/s6-overlay/s6-rc.d/nova-container-init/dependencies.d/base', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../packages/docker/rootfs/etc/s6-overlay/s6-rc.d/pfsense-actions/dependencies.d/nova-container-init', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../packages/docker/rootfs/etc/s6-overlay/user-bundles.d/user/contents.d/pfsense-actions', import.meta.url))).toBe(true);

    expect(existsSync(new URL('../packages/docker/rootfs/etc/s6-overlay/s6-rc.d/container-init', import.meta.url))).toBe(false);

    expect(existsSync(new URL('../packages/docker/rootfs/etc/s6-overlay/s6-rc.d/user', import.meta.url))).toBe(false);

    expect(readFileSync(new URL('../packages/docker/rootfs/usr/local/libexec/nova-docker/init-user', import.meta.url), 'utf8')).toContain('done < /etc/nova-docker/writable-paths');

    expect(readFileSync(new URL('../packages/docker/rootfs/usr/local/libexec/nova-docker/init-user', import.meta.url), 'utf8')).toContain([
      'chown -R "$',
      '{PUID_VALUE}:$',
      '{PGID_VALUE}" -- "$',
      '{STATE_DIRECTORY}"',
    ].join(''));

    expect(readFileSync(new URL('../packages/docker/rootfs/usr/local/libexec/nova-docker/init-user', import.meta.url), 'utf8')).toContain('export NOVA_INSTALLATION_KEY_FILE=%s/keys/installation.key');

    expect(readFileSync(new URL('../packages/docker/rootfs/usr/local/libexec/nova-docker/init-user', import.meta.url), 'utf8')).toContain('export NOVA_DATABASE_DIRECTORY=%s/database');

    expect(readFileSync(new URL('../packages/docker/rootfs/etc/s6-overlay/s6-rc.d/pfsense-actions/run', import.meta.url), 'utf8')).toContain('exec /command/s6-applyuidgid');

    expect(readFileSync(new URL('../packages/docker/rootfs/etc/s6-overlay/s6-rc.d/pfsense-actions/run', import.meta.url), 'utf8')).toContain('. /run/nova-docker/environment');

    expect(existsSync(new URL('../packages/docker/rootfs/etc/s6-overlay/s6-rc.d/pfsense-actions/finish', import.meta.url))).toBe(true);

    expect(readFileSync(new URL('../packages/docker/rootfs/usr/local/libexec/nova-docker/healthcheck', import.meta.url), 'utf8')).toContain('http://127.0.0.1:22603/health');

    expect(readFileSync(new URL('../packages/docker/rootfs/etc/nova-docker/legacy-state-paths', import.meta.url), 'utf8')).toBe([
      'keys/installation.key',
      'pfsense-actions.sqlite3',
      'pfsense-actions.sqlite3-shm',
      'pfsense-actions.sqlite3-wal',
      '',
    ].join('\n'));

    expect(readFileSync(new URL('../packages/docker/rootfs/etc/nova-docker/writable-paths', import.meta.url), 'utf8')).toBe('');

    expect(existsSync(new URL('../packages/docker/rootfs/usr/local/libexec/nova-docker/state-mount', import.meta.url))).toBe(false);

    expect(existsSync(new URL('../packages/docker/tests/state-mount.test.sh', import.meta.url))).toBe(false);

    return;
  });

  return;
});

registerPackageScriptsSuite({
  vitest,
  requireRootScripts: true,
  enable: 'all',
});
