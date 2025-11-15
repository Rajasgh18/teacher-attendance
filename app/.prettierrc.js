module.exports = {
  arrowParens: "avoid",
  singleQuote: false,
  trailingComma: "all",
  semi: true,
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  bracketSpacing: true,
  bracketSameLine: false,
  endOfLine: "lf",
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  overrides: [
    {
      files: "*.{js,jsx,ts,tsx}",
      options: {
        singleQuote: false,
        jsxSingleQuote: false,
        quoteProps: "as-needed",
        semi: true,
      },
    },
    {
      files: "*.{json,jsonc}",
      options: {
        singleQuote: false,
      },
    },
  ],
};
