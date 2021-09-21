module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'no-case-declarations': 'error',
    'vue/no-side-effects-in-computed-properties': 'error',
    'no-useless-escape': 'error',
    'vue/no-dupe-keys': 'error',
    'no-empty': 'error',
    'vue/require-prop-types': 'warn',
    'vue/attributes-order': 'warn',
    'vue/no-confusing-v-for-v-if': 'warn',
    'vue/order-in-components': 'warn',
    'prettier-vue/prettier': [
      'error',
      {
        // Override all options of `prettier` here
        // @see https://prettier.io/docs/en/options.html
        printWidth: 100,
        singleQuote: true,
        semi: false,
        trailingComma: 'es5',
      },
    ],
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
      env: {
        mocha: true,
      },
    },
  ],
};
