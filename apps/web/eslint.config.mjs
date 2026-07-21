// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook"

import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ...storybook.configs["flat/recommended"],
  {
    rules: {
      // Deliberately-unused bindings are prefixed with _ (destructuring
      // splits, ignored args) — the default rule flags them anyway.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // React Compiler-era rules that demand per-component refactors
      // (setState-in-effect, ref discipline). Real debt, tracked as
      // warnings so new occurrences stay visible without blocking CI —
      // do NOT silence individual hits with disable comments; fix them
      // or leave them counted here.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  {
    // Test doubles and stories stub shapes on purpose — `any` is the point
    // (the Supabase mock builder is deliberately loose). App code still
    // errors on it.
    files: [
      "**/__tests__/**",
      "**/*.test.{ts,tsx}",
      "tests/**",
      "e2e/**",
      "**/*.stories.tsx",
      ".storybook/**",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
])

export default eslintConfig
