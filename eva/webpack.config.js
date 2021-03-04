const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const  VuetifyLoaderPlugin  = require('vuetify-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {

  entry: {
    app: './src/index.js'
  },
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname,'dist'),
    publicPath: '/'
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: '/node_modules/',
    }, {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        loader: {
          sass: 'vue-style-loader!css-loader!sass-loader'
        }
      },
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
          options: { sourceMap: true }
        },
        {
          loader: "postcss-loader",
          options: { sourceMap: true, config: {path: path.resolve(__dirname,'src/js/postcss.config.js')}  }
        },  
      ],
    },  {
      test: /\.sass$/,
      use: [
        'style-loader',
        MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
          options: { sourceMap: true }
        },
        {
          loader: "postcss-loader",
          options: { sourceMap: true, config: {path: './src/js/postcss.config.js'}  }
        },
        {
          loader: "sass-loader",
          options: {  sourceMap: true,  implementation: require('sass') }
        },
      ],
    },{
      test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/'
          }
        }
      ]
    },{
      test: /\.(jpg|png|svg|gif)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'images/'
          }
        }
      ]
    },]
  },
  devServer: {
    contentBase: './dist',
    overlay: true,
    historyApiFallback: true,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      "vue$": "vue/dist/vue.js",
    }
  },
  plugins: [
    new VueLoaderPlugin(),
    new VuetifyLoaderPlugin(),
    new HtmlWebpackPlugin({
      hash: true,
      template: './src/index.html', 
      filename: './index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
  ],
}
