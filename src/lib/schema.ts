import z from 'zod';

import { textMacAddressLower, textMacAddressUpper } from '@/lib/regex.js';

/**
 * Env.
 *
 * @since 1.0.0
 */
export const env = z.object({
  apiKey: z.string(),
  port: z.coerce.number().min(1).max(65535),
  pfsenseSshIp: z.string().ip(),
  pfsenseSshPort: z.coerce.number().min(1).max(65535),
  pfsenseUsername: z.string().min(1),
  pfsensePassword: z.string().min(1),
  pfsensePrivateKey: z.string().min(1),
}).partial({
  pfsensePassword: true,
  pfsensePrivateKey: true,
}).refine(
  (value) => value.pfsensePassword || value.pfsensePrivateKey,
  {
    message: 'The "PFSENSE_PASSWORD" or "PFSENSE_PRIVATE_KEY" environment variables are not set',
    path: [
      'pfsensePassword',
    ],
  },
);

/**
 * Wake on lan.
 *
 * @since 1.0.0
 */
export const wakeOnLan = z.object({
  broadcastAddress: z.string().ip(),
  macAddress: z.string().refine(
    (value) => textMacAddressLower.test(value) || textMacAddressUpper.test(value),
    {
      message: 'Invalid MAC address',
      path: [
        'macAddress',
      ],
    },
  ),
});
