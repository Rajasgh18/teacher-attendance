module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
    "react-native/react-native": true,
  },
  extends: [
    "@react-native",
    "eslint:recommended",
    "prettier", // Disables ESLint rules that conflict with Prettier
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["react", "react-native", "prettier"],
  rules: {
    // Prettier integration
    "prettier/prettier": "error",

    // General JavaScript/ES6 rules
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],

    // React rules (excluding hooks)
    "react/jsx-uses-react": "off", // Not needed in React 17+
    "react/react-in-jsx-scope": "off", // Not needed in React 17+
    "react/prop-types": "off", // Using TypeScript instead
    "react/display-name": "off",
    "react/no-unescaped-entities": "off",

    // React Native specific rules
    "react-native/no-unused-styles": "error",
    "react-native/split-platform-components": "off",
    "react-native/no-inline-styles": "off",
    "react-native/no-color-literals": "off",
    "react-native/no-raw-text": "off", // Allow raw text in components

    // General JavaScript/ES6 rules
    "no-catch-shadow": "off",
    "no-bitwise": "off",
    "no-console": ["error", { allow: ["error", "warn", "info"] }],
    "no-debugger": "error",
    "no-alert": "warn",
    "no-var": "error",
    "prefer-const": "error",
    "prefer-arrow-callback": "error",
    "no-duplicate-imports": "error",
    "no-unused-expressions": "error",
    "no-unreachable": "error",
    "no-constant-condition": "error",
    "no-empty": "warn",
    "no-extra-semi": "error",
    "no-irregular-whitespace": "error",
    "no-trailing-spaces": "error",
    "eol-last": "error",

    // Let Prettier handle formatting
    "comma-dangle": "off",
    semi: "off",
    quotes: "off",
    indent: "off",
    "object-curly-spacing": "off",
    "array-bracket-spacing": "off",
    "comma-spacing": "off",
    "key-spacing": "off",
    "keyword-spacing": "off",
    "space-before-blocks": "off",
    "space-before-function-paren": "off",
    "space-in-parens": "off",
    "space-infix-ops": "off",
    "space-unary-ops": "off",
    "spaced-comment": "off",
    "no-multiple-empty-lines": "off",

    // Import/Export rules
    "import/no-unresolved": "off", // TypeScript handles this
    "import/extensions": "off",
    "import/prefer-default-export": "off",
    "import/no-default-export": "off",

    // Accessibility rules - disabled as plugins not available
    // 'jsx-a11y/alt-text': 'warn',
    // 'jsx-a11y/click-events-have-key-events': 'warn',
    // 'jsx-a11y/no-static-element-interactions': 'warn',

    // Performance rules
    "react/jsx-key": "error",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-undef": "error",
    "react/jsx-uses-vars": "error",
    "react/no-array-index-key": "off",
    "react/no-danger": "warn",
    "react/no-deprecated": "warn",
    "react/no-direct-mutation-state": "error",
    "react/no-is-mounted": "error",
    "react/no-render-return-value": "error",
    "react/no-string-refs": "error",
    "react/no-unknown-property": "error",
    "react/self-closing-comp": "error",
    "react/sort-comp": "off", // Can be too restrictive

    // Disable problematic rules
    "react-hooks/rules-of-hooks": "off", // Disable hooks linting
    "react-hooks/exhaustive-deps": "off", // Disable useEffect dependency warnings
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        // TypeScript specific overrides
        "no-undef": "off", // TypeScript handles this
        "no-unused-vars": "off", // Use @typescript-eslint version instead
      },
    },
    {
      files: ["*.js", "*.jsx"],
      rules: {
        // JavaScript specific overrides
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
  ignorePatterns: [
    "node_modules/",
    "android/",
    "ios/",
    "*.d.ts",
    "*.config.js",
    "metro.config.js",
    "babel.config.js",
    "jest.config.js",
    "coverage/",
    "build/",
    "dist/",
  ],
};
