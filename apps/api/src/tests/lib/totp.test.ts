import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createTotpUri,
  generateTotpSecret,
  verifyTotpCode,
} from '@/lib/totp.js';

import type {
  Tests_Lib_Totp_Secret,
  Tests_Lib_Totp_Uri,
} from '@/types/tests/lib/totp.test.d.ts';

describe('administrator TOTP', () => {
  it('verifies the RFC 6238 SHA-1 fixture with a six-digit code', () => {
    const secret: Tests_Lib_Totp_Secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

    expect(verifyTotpCode(secret, '287082', 59_000)).toBe(1);

    expect(verifyTotpCode(secret, '287082', 89_000)).toBe(1);

    expect(verifyTotpCode(secret, '287082', 119_000)).toBeUndefined();

    expect(verifyTotpCode(secret, '000000', 59_000)).toBeUndefined();

    return;
  });

  it('generates a compatible secret and encoded otpauth URI', () => {
    const secret: Tests_Lib_Totp_Secret = generateTotpSecret();
    const uri: Tests_Lib_Totp_Uri = createTotpUri(secret, 'admin.operator');

    expect(secret).toHaveLength(32);

    expect([...secret].every((character) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.includes(character))).toBe(true);

    expect(uri).toBe(`otpauth://totp/pfSense%20Actions:admin.operator?secret=${secret}&issuer=pfSense%20Actions&algorithm=SHA1&digits=6&period=30`);

    return;
  });

  return;
});
