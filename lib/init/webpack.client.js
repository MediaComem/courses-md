const path = require('path');

module.exports = function(entryPointPath, bundlePath) {
  return {
    entry: entryPointPath,
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
      filename: path.basename(bundlePath),
      library: 'course',
      libraryTarget: 'commonjs2',
      path: path.dirname(bundlePath)
    },
    target: 'web'
  };
};
