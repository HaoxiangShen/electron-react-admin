const merge = require('webpack-merge');
const baseConfig = require('./webpack.base');

module.exports = merge.smart(baseConfig, {
  mode: 'development',
  devtool: false,
});
