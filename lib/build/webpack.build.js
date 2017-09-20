const path = require('path');

module.exports = function(entryPointPath, bundlePath) {
  return {
    entry: entryPointPath,
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
      filename: path.basename(bundlePath),
      path: path.dirname(bundlePath)
    },
    target: 'web'
  };
}
