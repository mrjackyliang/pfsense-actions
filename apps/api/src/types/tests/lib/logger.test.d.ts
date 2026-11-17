import type { MockInstance } from 'vitest';

/**
 * Tests - Lib - Logger - Lines.
 *
 * @since 2.1.0
 */
export type Tests_Lib_Logger_Lines = string[];

/**
 * Tests - Lib - Logger - Write.
 *
 * @since 2.1.0
 */
export type Tests_Lib_Logger_Write = MockInstance<typeof process.stdout.write>;
