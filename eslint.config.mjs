import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "*.config.*",
      "check-architecture.mjs",
      "scripts/**",
      ".claude/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      // React hooks
      ...reactHooks.configs.recommended.rules,
      // TODO: react-hooks/refs — ~20 warnings. Requires refactoring components
      // that read ref.current during render (e.g., navigation, skill-card) to
      // use state or derive values inside effects/callbacks instead.
      "react-hooks/refs": "warn",
      // TODO: react-hooks/set-state-in-effect — requires replacing synchronous
      // setState calls inside useEffect bodies with useSyncExternalStore or
      // initializer patterns (e.g., useMediaQuery, portrait).
      "react-hooks/set-state-in-effect": "warn",
      // TODO: react-hooks/use-memo — useMemo first arg must be inline function
      // expression (convergence createEmbers). Minor refactor.
      "react-hooks/use-memo": "warn",
      // TODO: react-hooks/immutability — terminal replay modifies ref'd DOM
      // elements passed as props. Requires restructuring to use callback refs
      // or lifting DOM manipulation to the parent component.
      "react-hooks/immutability": "warn",
      // Not using React Compiler — manual memoization is intentional
      "react-hooks/preserve-manual-memoization": "off",
      "no-useless-assignment": "error",

      // TypeScript — relax rules that conflict with the codebase patterns
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",

      // A11y — warn only (will fix in Phase 8)
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
    },
  },
  prettier,
);
