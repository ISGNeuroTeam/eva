module.exports = {
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\\.m?js$': './node_modules/babel-jest',
    '^.+\\.js$': './node_modules/babel-jest',
    '.*\\.(vue)$': './node_modules/vue-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(jointjs)/)'],
};
