const path = require('path');

const config = require('../config');

module.exports = function(entryPointPath) {
  return {
    entry: path.resolve(entryPointPath),
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /\/node_modules\//,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: {
                presets: ['env']
              }
            }
          ]
        },
        {
          test: /\.styl$/,
          use: [
            require.resolve('style-loader'),
            require.resolve('css-loader'),
            require.resolve('stylus-loader')
          ]
        },
        {
          test: /\.css$/,
          use: [
            require.resolve('style-loader'),
            require.resolve('css-loader')
          ]
        },
        {
          test: /\.(gif|jpg|png|svg)$/,
          use: [ require.resolve('base64-image-loader') ]
        }
      ]
    },
    output: {
      filename: 'courses-md.js',
      library: 'course',
      libraryTarget: 'commonjs2',
      path: path.resolve(config.vendorDir)
    },
    target: 'web'
  };
};
