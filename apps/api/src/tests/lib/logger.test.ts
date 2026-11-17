import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  isDebugLogging,
  logDebug,
  logInfo,
  setDebugLogging,
} from '@/lib/logger.js';

import type {
  Tests_Lib_Logger_Lines,
  Tests_Lib_Logger_Write,
} from '@/types/tests/lib/logger.test.d.ts';

describe('debug logging', () => {
  afterEach(() => {
    setDebugLogging(false);

    vi.unstubAllEnvs();

    vi.restoreAllMocks();

    return;
  });

  it('writes DEBUG lines only while debug logging is on', () => {
    vi.stubEnv('LOG_LEVEL', '');
    vi.stubEnv('LOG_TIME', '');

    const write: Tests_Lib_Logger_Write = vi.spyOn(process.stdout, 'write').mockReturnValue(true);

    logDebug('hidden while off');

    expect(isDebugLogging()).toBe(false);

    setDebugLogging(true);

    logDebug('shown while on');

    logInfo('still shown');

    const lines: Tests_Lib_Logger_Lines = write.mock.calls.map((call) => String(call[0]));

    expect(isDebugLogging()).toBe(true);

    expect(lines).toEqual([
      'DEBUG shown while on\n',
      'INFO still shown\n',
    ]);

    return;
  });

  it('leaves DEBUG lines out while LOG_LEVEL hides info', () => {
    vi.stubEnv('LOG_LEVEL', 'warn');
    vi.stubEnv('LOG_TIME', '');

    const write: Tests_Lib_Logger_Write = vi.spyOn(process.stdout, 'write').mockReturnValue(true);

    setDebugLogging(true);

    logDebug('hidden by LOG_LEVEL');

    expect(write).not.toHaveBeenCalled();

    return;
  });

  return;
});
