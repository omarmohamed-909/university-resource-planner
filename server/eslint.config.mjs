// eslint.config.mjs — Server (Node.js / CommonJS)
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // Node.js built-ins
        process: 'readonly',
        console: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        // Node 18+ fetch (used in tests / Google OAuth)
        fetch: 'readonly',
        // Node built-in test runner
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      // Allow unused vars/args if prefixed with _ (standard Node pattern)
      // Also ignore ALL function args — abstract repository interfaces have mandatory signatures
      'no-unused-vars': ['warn', {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'none',          // don't warn on unused function args (covers abstract repo methods)
        ignoreRestSiblings: true,
      }],
      'no-console': 'off',
      'no-undef': 'error',
    },
  },
  {
    // Ignore non-CJS files and generated artifacts
    ignores: [
      'node_modules/**',
      'coverage/**',
      '*.mjs',   // ESLint config itself is ESM
    ],
  },
];
