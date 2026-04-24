import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Add jsx-a11y recommended rules as warnings (to avoid breaking CI on pre-existing issues)
  // Users can progressively fix these. For new code, prefer fixing a11y issues.
  {
    rules: Object.fromEntries(
      Object.entries(jsxA11y.configs.recommended.rules).map(([rule, severity]) => [
        rule,
        severity === "error" ? "warn" : severity,
      ])
    ),
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Project-specific overrides for generated files and tests (flat config entries)
  {
    files: ["tina/__generated__/**", "tina/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    files: ["test/**", "tests/**", "**/*.spec.ts", "**/*.spec.tsx", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
