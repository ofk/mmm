const webpack = require('webpack');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';
const rootPath = path.dirname(__dirname);
const nodeModulePath = path.resolve(rootPath, 'node_modules');

module.exports = {
  output: {
    path: path.resolve(rootPath, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: nodeModulePath,
        loader: 'eslint-loader',
      },
      {
        test: /\.js$/,
        exclude: nodeModulePath,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              'env',
              {
                targets: {
                  browsers: '> 1%',
                },
              },
            ],
          ],
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    }),
  ],
  node: {
    __dirname: false,
    __filename: false,
  },
};
