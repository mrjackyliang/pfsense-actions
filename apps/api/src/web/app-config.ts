import brandMarkUrl from '@/web/assets/brand-mark.svg';

import type { Web_AppConfig } from '@/types/web/app-config.d.ts';

/**
 * App Config - App Config.
 *
 * Keeps product copy, storage keys, and token capabilities outside the shared
 * console foundation so another app can adopt it without editing shared files.
 *
 * @since 2.1.0
 */
export const appConfig: Web_AppConfig = {
  appName: 'pfSense Actions',
  brandMarkUrl,
  brandName: 'pfSense Actions',
  claimCodeHint: 'Find it with docker logs. A new code is printed each time the container restarts.',
  recoveryCodeFileName: 'pfsense-actions-recovery-codes.txt',
  roleLabels: {},
  securityLabel: 'Sign-in and security',
  securitySurfaceName: 'console',
  storageKeys: {
    theme: 'pfsense-actions-theme',
  },
  tokenDefaultScopes: ['pfsense:read'],
  tokenNamePlaceholder: 'e.g. Home automation',
  tokenScopes: [
    {
      description: 'Check that pfSense answers, and read its operating system and release.',
      endpoints: [
        'GET /api/v1/connectivity',
        'GET /api/v1/system',
      ],
      id: 'pfsense:read',
    },
    {
      description: 'Ping an address from the firewall.',
      endpoints: ['POST /api/v1/ping'],
      id: 'reachability:read',
    },
    {
      description: 'Send Wake-on-LAN packets.',
      endpoints: ['POST /api/v1/wol'],
      id: 'wol:execute',
    },
  ],
};
