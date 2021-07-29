const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const base = require('./webpack.base');

module.exports = merge.smart(base, {
  mode: 'development',
  devServer: {
    contentBase: path.resolve(__dirname, '../dist/ui'),
    hot: true,
    port: 8000,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
    }),
  ],
});
