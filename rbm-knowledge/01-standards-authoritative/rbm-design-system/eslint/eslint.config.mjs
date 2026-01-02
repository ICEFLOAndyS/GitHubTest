import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import regexp from "eslint-plugin-regexp";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
      unicorn,
      "unused-imports": unusedImports,
      regexp,
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": { typescript: true },
    },
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "prefer-const": "error",

      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "import/no-duplicates": "error",
      "import/order": [
        "error",
        {
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
        },
      ],

      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-no-useless-fragment": "error",

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",

      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/button-has-type": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/control-has-associated-label": "error",

      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='style']",
          message:
            "RBM DS: Inline styles are forbidden. Use tokenised CSS classes or CSS variables from rbm.tokens.css.",
        },
      ],

      "unicorn/prefer-node-protocol": "error",
      "unicorn/filename-case": [
        "error",
        { cases: { kebabCase: true, pascalCase: true } },
      ],
      "unicorn/no-null": "off",

      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: { "no-console": "off" },
  },
];
