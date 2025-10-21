module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  ignorePatterns: ["dist", "node_modules"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: false,
  },
  rules: {
    "prettier/prettier": ["error", { singleQuote: false, semi: true, printWidth: 100 }],
  },
};
