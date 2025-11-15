module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["@react-native/babel-preset"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@": "./src",
          },
        },
      ],
      ["inline-import", { extensions: [".sql"] }],
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
      ["@babel/plugin-proposal-decorators", { legacy: true }],
    ],
  };
};
