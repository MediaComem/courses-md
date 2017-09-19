const path = require('path');

const config = require('../config');

module.exports = function(entryPointPath) {
  return {
    entry: path.resolve(entryPointPath),
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            require.resolve('style-loader'),
            require.resolve('css-loader')
          ]
        },
        {
          test: /\.(gif|jpg|png|svg|eot|ttf|woff|woff2)$/,
          use: [
            {
              loader: require.resolve('file-loader'),
              options: {
                emitFile: true,
                name: `[name]-[hash].[ext]`
              }
            }
          ]
        }
      ]
    },
    externals: [ 'course' ],
    output: {
      filename: 'bundle.js',
      path: path.resolve(config.buildDir)
    },
    target: 'web'
  };
}
