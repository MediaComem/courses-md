const path = require('path');

module.exports = function(config, entryPointPath, bundleDir, bundleName) {
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
    output: {
      filename: `${bundleName}-[hash].js`,
      path: bundleDir,
      publicPath: config.effectiveBaseUrl
    },
    target: 'web'
  };
}
