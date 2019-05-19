
'use strict';
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

const env = process.env.NODE_ENV;
const config = {
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env']
          }
        }
      }
    ],
  },
  output: {
    library: 'Stateum',
    libraryTarget: 'umd',
    filename: 'stateum.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ],
  mode: 'development'
};

if (env === 'production') {
  config.mode = 'production';
  config.optimization = {
    minimizer: [
      new UglifyJsPlugin(),
    ],
  };
}

module.exports = config;
