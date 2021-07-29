const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const { getEntry, getHtmlWebpackPlugins } = require('./get-entry');
const { theme } = require('./theme');

const entry = getEntry();

module.exports = {
  entry,
  target: 'electron-renderer',
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    path: path.resolve(__dirname, '../../dist/ui'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.json', '.js', '.jsx'],
    alias: {
      '@ui': path.resolve(__dirname, '../../ui'),
      '@src': path.resolve(__dirname, '../../src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        loader: 'babel-loader!ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(css|less)$/,
        include: [/node_modules/, /theme/],
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true,
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: { ...theme },
              },
            },
          },
        ],
      },
      {
        test: /\.(css|less)$/,
        exclude: [/node_modules/, /theme/],
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true,
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1, // 之前有1个loaders
              modules: {
                mode: 'local',
                localIdentName: '[local]--[hash:base64:5]',
              },
            },
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpeg|jpg|svg)$/,
        loader: 'file-loader',
      },
      {
        test: /codicon\.ttf$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              publicPath: 'https://server.com/resources',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    ...getHtmlWebpackPlugins(entry),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].chunk.css',
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new MonacoWebpackPlugin({ languages: ['json', 'javascript', 'python', 'ini', 'xml'] }),
  ],
};
