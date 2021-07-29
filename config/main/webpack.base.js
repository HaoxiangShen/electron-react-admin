'use strict';
const path = require('path');
const webpack = require('webpack');

const fs = require('fs');
const dotenv = require('dotenv');

const envFile = fs.readFileSync(`env/.env.${process.env.NODE_ENV}`);
const envConfig = dotenv.parse(envFile);

module.exports = {
  target: 'electron-main',
  entry: path.resolve(__dirname, '../../src/main.ts'),
  output: {
    path: path.resolve(__dirname, '../../dist/main'),
    filename: '[name].js',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@ui': path.resolve(__dirname, '../../ui'),
      '@src': path.resolve(__dirname, '../../src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        loader: 'native-ext-loader',
      },
    ],
  },
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.config': JSON.stringify(envConfig),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
};
