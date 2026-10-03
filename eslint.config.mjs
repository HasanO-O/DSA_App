import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * Flat ESLint config.
 *
 * `eslint-config-next@16` ships native flat configs, so no `FlatCompat` shim is
 * needed. Pinning the config to the same major as `next` matters: a mismatched
 * version nests its plugins where ESLint 9 cannot resolve them, and lint fails
 * with "couldn't find the plugin" rather than reporting real issues.
 */
const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'coverage/**',
      'next-env.d.ts',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Kept as a warning to match the project rules, but new `any` should not
      // be introduced — every external boundary is validated with Zod instead.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];

export default eslintConfig;