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
  },
  lintOnSave: true,
  transpileDependencies: [
    'vuetify'
  ],
  pages: {
    index: {
      entry: 'src/index.js',
      template: 'src/index.html',
    },
  },
  devServer: {
    overlay: {
      warnings: false,
      errors: true
    }
  }
}
