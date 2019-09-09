const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  context: resolve(__dirname, 'src'),
  entry: {
    app: ['./index.ts']
  },
  output: {
    filename: '[hash].bundle.js',
    path: resolve(__dirname, 'dist')
  },
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  watch: false,
  devServer: {
    watchContentBase: false,
    compress: false,
    stats: {
      colors: true
    },
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: 'url-loader?limit=10000&mimetype=image/svg+xml'
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.md$/, use: 'raw-loader' }, {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      { test: /\.(jpg|png|gif)$/, use: 'file-loader' },
      { test: /\.js.map$/, use: 'file-loader' },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: 'url-loader?limit=10000&mimetype=application/octet-stream'
      },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      templateParameters: {
        JUPYTER_BASE_URL: 'http://localhost:8888',
        JUPYTER_TOKEN: 'abc',
        JUPYTER_NOTEBOOK_PATH: 'test.ipynb',
        JUPYTER_MATHJAX_URL: 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js'
      },
      template: 'index.html',
      inject: true,

    })
  ]
};
