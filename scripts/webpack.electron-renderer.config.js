const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const IS_PROD = (process.env.NODE_ENV === 'production');
const filename = IS_PROD ? '[name]-[chunkhash:7]' : '[name]';

const config = Object.assign({}, require('./webpack.base.config.js'), {
  entry: {
    renderer: ['./src/renderer.js'],
  },
  devtool: IS_PROD ? false : 'inline-source-map',
  target: 'electron-renderer',
});

config.output = Object.assign({}, config.output, {
  filename: `${filename}.js`,
});

config.module.rules = config.module.rules.concat([
  {
    test: /\.css$/,
    use: ExtractTextWebpackPlugin.extract({
      use: [
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            parser: 'postcss-scss',
            plugins: [
              require('autoprefixer')({
                browsers: ['> 1%'],
              }),
              require('postcss-nesting')(),
            ],
          },
        },
      ],
    }),
  },
  {
    test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/,
    loader: 'file-loader',
    options: {
      name: `${filename.replace(/\[chunk/, '[')}.[ext]`,
    },
  },
]);

config.plugins = config.plugins.concat([
  new HtmlWebpackPlugin({
    template: './src/index.html',
  }),
  new ExtractTextWebpackPlugin({
    allChunks: true,
    filename: `${filename}.css`,
  }),
]);

if (IS_PROD) {
  config.plugins = config.plugins.concat(require('./webpack.plugins.production.js'));
}

module.exports = config;
