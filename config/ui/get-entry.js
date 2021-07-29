const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const globby = require('globby');

function getEntry() {
  const paths = globby.sync('ui/entry/*.tsx', { absolute: true, objectMode: true });
  const entry = {};
  paths.forEach(p => {
    const name = path.basename(p.name, '.tsx');
    entry[name] = p.path;
  });
  return entry;
}

function getHtmlWebpackPlugins(entry) {
  return Object.keys(entry).map(
    name =>
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, '../../index.html'),
        filename: `${name}.html`,
        chunks: [name],
      }),
  );
}

module.exports = {
  getEntry,
  getHtmlWebpackPlugins,
};
