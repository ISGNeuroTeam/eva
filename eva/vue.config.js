module.exports = {
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
      warnings: true,
      errors: true
    }
  }
}
