/**
 * RBM ESLint Configuration (ServiceNow IDE + Build Agent)
 * - TypeScript + React (.ts/.tsx)
 * - Enforces RBM Development Standards (no unsafe HTML injection, strong typing, hooks rules)
 *
 * Prereqs (devDependencies):
 *   eslint
 *   @typescript-eslint/parser
 *   @typescript-eslint/eslint-plugin
 *   eslint-plugin-react
 *   eslint-plugin-react-hooks
 *   eslint-plugin-import
 *   eslint-plugin-jsx-a11y
 *
 * If your toolchain supports it, also add:
 *   eslint-config-prettier
 *   prettier
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
    // If you use type-aware linting, uncomment and ensure tsconfig path is correct:
    // project: ["./tsconfig.json"],
    // tsconfigRootDir: __dirname,
  },
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      // If using TypeScript path aliases, consider eslint-import-resolver-typescript
      node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
    },
  },
  plugins: ["@typescript-eslint", "react", "react-hooks", "import", "jsx-a11y"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    // If using Prettier, uncomment:
    // "prettier",
  ],
  rules: {
    /**
     * Core JS rules
     */
    "eqeqeq": ["error", "always"],
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-var": "error",
    "prefer-const": ["error", { destructuring: "all" }],

    /**
     * TypeScript standards (RBM 7A)
     */
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      { allowExpressions: true, allowTypedFunctionExpressions: true, allowHigherOrderFunctions: true }
    ],
    "@typescript-eslint/no-unsafe-assignment": "off", // enable when using type-aware linting (project option)
    "@typescript-eslint/no-unsafe-member-access": "off", // enable when using type-aware linting (project option)
    "@typescript-eslint/no-unsafe-call": "off", // enable when using type-aware linting (project option)
    "@typescript-eslint/no-floating-promises": "off", // enable when using type-aware linting (project option)

    /**
     * React / hooks
     */
    "react/prop-types": "off", // TypeScript handles props typing
    "react/react-in-jsx-scope": "off", // React 17+ JSX transform
    "react/jsx-key": ["error", { checkFragmentShorthand: true }],

    /**
     * Import hygiene
     */
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }
    ],
    "import/no-duplicates": "error",
    "import/no-cycle": ["warn", { maxDepth: 1 }],

    /**
     * Accessibility baseline
     */
    "jsx-a11y/no-autofocus": "warn",
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/interactive-supports-focus": "warn",

    /**
     * RBM Non-negotiables: forbid unsafe HTML injection and direct DOM manipulation patterns
     * (Developers should use components + templating, not innerHTML/outerHTML)
     */
    "no-restricted-properties": [
      "error",
      { "object": "Element", "property": "innerHTML", "message": "RBM: Do not use innerHTML. Use components/templating (see Dev Standards §11)." },
      { "object": "Element", "property": "outerHTML", "message": "RBM: Do not use outerHTML. Use components/templating (see Dev Standards §11)." }
    ],
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.property.name='insertAdjacentHTML']",
        "message": "RBM: Do not use insertAdjacentHTML. Use components/templating (see Dev Standards §11)."
      },
      {
        "selector": "CallExpression[callee.object.name='document'][callee.property.name=/^(write|writeln)$/]",
        "message": "RBM: Do not use document.write/writeln."
      }
    ],
  },
  overrides: [
    /**
     * For config and scripts
     */
    {
      files: ["*.cjs", "*.js"],
      env: { node: true, browser: false },
    },
    /**
     * TypeScript files
     */
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        // Encourage safe error handling: catch variables must be unknown (TS 4.4+ supports useUnknownInCatchVariables)
        "@typescript-eslint/no-throw-literal": "error",
      },
    },
  ],
};
