import { registerDotenvSuite } from '@cbnventures/nova/rules/vitest';
import * as vitest from 'vitest';

/** Dotenv. */
registerDotenvSuite({
  vitest,
  envPaths: [
    '.env.sample',
    'apps/api/.env.sample',
  ],
  enable: 'all',
});
