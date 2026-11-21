import {
  dxCodeStyle,
  dxIgnore,
  fwExpressjs,
  fwReact,
  langJavascript,
  langTypescript,
  novaRules,
  runtimeBrowser,
  runtimeNode,
  toolVite,
} from '@cbnventures/nova/presets/eslint';

/**
 * ESLint Configuration.
 *
 * Composes Nova's Node.js, TypeScript, and Express contracts for the service.
 * The console under src/web adds Nova's React and browser contracts.
 *
 * @since 0.0.0
 */
export default [
  ...dxIgnore,
  ...dxCodeStyle,
  ...langJavascript,
  ...langTypescript,
  ...fwExpressjs,
  ...runtimeNode.map((config) => ({
    ...config,
    ignores: [
      'src/types/web/**',
      'src/web/**',
    ],
  })),
  ...fwReact.map((config) => ({
    ...config,
    files: [
      'src/web/**/*.ts',
      'src/web/**/*.tsx',
    ],
  })),
  ...runtimeBrowser.map((config) => ({
    ...config,
    files: [
      'src/web/**/*.ts',
      'src/web/**/*.tsx',
    ],
  })),
  ...toolVite,
  {
    name: 'custom-tsconfig',
    files: [
      '**/*.cts',
      '**/*.mts',
      '**/*.ts',
      '**/*.tsx',
    ],
    languageOptions: {
      parserOptions: {
        project: [
          './tsconfig.source.json',
          './tsconfig.config.json',
          './tsconfig.tests.json',
          './tsconfig.web.json',
        ],
      },
    },
  },
  ...novaRules,
  {
    name: 'custom-nova-rules',
    files: [
      '**/*.cjs',
      '**/*.cts',
      '**/*.js',
      '**/*.jsx',
      '**/*.mjs',
      '**/*.mts',
      '**/*.ts',
      '**/*.tsx',
    ],
    rules: {
      '@cbnventures/nova/no-regex-literals': [
        'error',
        {
          ignoreFiles: [],
          regexFile: './src/lib/regex.ts',
        },
      ],
      '@cbnventures/nova/no-shared-type-import': [
        'error',
        {
          ignoreFiles: [],
          sharedFiles: ['./src/types/shared.d.ts'],
        },
      ],
      '@cbnventures/nova/require-jsdoc-hierarchy': [
        'error',
        {
          anchorDirectories: ['src'],
          ignoreFiles: [
            './eslint.config.mts',
            './mock-api.mts',
            './vite.config.mts',
            './vitest.config.mts',
          ],
          knownNames: {
            api: 'API',
            pfsense: 'pfSense',
          },
          stripDirectories: ['types'],
        },
      ],
      '@cbnventures/nova/require-kebab-case-filename': [
        'error',
        {
          extraExtensions: [],
          ignoreFiles: [
            './eslint.config.mts',
            './vite.config.mts',
            './vitest.config.mts',
          ],
        },
      ],
      '@cbnventures/nova/require-jsdoc-presence': [
        'error',
        {
          ignoreFiles: [
            './eslint.config.mts',
            './mock-api.mts',
            './vite.config.mts',
            './vitest.config.mts',
          ],
          skipDirectories: [
            'tests',
            'types',
          ],
        },
      ],
    },
  },
  {
    // The console's React files are shared with the other appliances, so their JSDoc chains start at src/web.
    name: 'console-jsdoc-hierarchy',
    files: [
      'src/types/web/**/*.d.ts',
      'src/web/**/*.ts',
      'src/web/**/*.tsx',
    ],
    rules: {
      '@cbnventures/nova/require-jsdoc-hierarchy': [
        'error',
        {
          anchorDirectories: ['web'],
          ignoreFiles: [],
          knownNames: {
            api: 'API',
            pfsense: 'pfSense',
          },
          stripDirectories: ['types'],
        },
      ],
    },
  },
  {
    // The console and its mock API keep their patterns beside the console code, apart from the service's patterns.
    name: 'console-regex-file',
    files: [
      'mock-api.mts',
      'src/web/**/*.ts',
      'src/web/**/*.tsx',
    ],
    rules: {
      '@cbnventures/nova/no-regex-literals': [
        'error',
        {
          ignoreFiles: [],
          regexFile: './src/web/regex.ts',
        },
      ],
    },
  },
];
