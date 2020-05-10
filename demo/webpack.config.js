var path = require('path');
var babelConfig = require('../.babelrc.js');
module.exports = {
  entry: path.resolve(__dirname, './example.js'),
  output: {
    path: __dirname,
    filename: 'example.build.js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelConfig,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      'babel-plugin-transform-jsx-vue3/injectCode/dynamicRender': path.resolve(
        __dirname,
        '../injectCode/dynamicRender',
      ),
      'babel-plugin-transform-jsx-vue3/injectCode/mergeJSXProps': path.resolve(
        __dirname,
        '../injectCode/mergeJSXProps',
      ),
    },
  },
};
