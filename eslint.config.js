import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Disable 'any' type warnings - will be addressed in Phase 2 type safety improvement
      '@typescript-eslint/no-explicit-any': 'error',

      // Allow unused vars starting with underscore (common convention)
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],

      // Allow empty interfaces (common in shadcn/ui component patterns)
      '@typescript-eslint/no-empty-object-type': 'off',

      // Relax react-refresh rules for UI library components (shadcn/ui patterns)
      'react-refresh/only-export-components': 'off',

      // Relax React hooks exhaustive-deps for stable callback patterns
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])
