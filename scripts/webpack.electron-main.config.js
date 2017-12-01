const IS_PROD = (process.env.NODE_ENV === 'production');

const config = Object.assign({}, require('./webpack.base.config.js'), {
  entry: {
    main: ['./src/main.js'],
  },
  target: 'electron-main',
});

if (IS_PROD) {
  config.plugins = config.plugins.concat(require('./webpack.plugins.production.js'));
}

module.exports = config;
