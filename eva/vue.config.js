const path = require('path');

module.exports = {
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader');

    config.plugin('copy')
      .tap((entries) => {
        entries[0].push({
          from: path.resolve(__dirname, 'src/workers/job-worker.js'),
          to: path.resolve(__dirname, 'dist/js/job-worker.js'),
        });
        return entries;
      });

    return config;
  },
  productionSourceMap: false,
  lintOnSave: true,
  transpileDependencies: ['vuetify'],
  pages: {
    index: {
      entry: 'src/index.js',
      template: 'src/index.html',
    },
  },
  devServer: {
    proxy: process.env.VUE_APP_PROXY,
    overlay: {
      warnings: false,
      errors: true,
    },
  },
};
