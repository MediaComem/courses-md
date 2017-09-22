const chalk = require('chalk');
const del = require('del');
const fs = require('fs-extra');
const ora = require('ora');
const path = require('path');

const { runWebpack } = require('./lib/utils');

compileClient()
  .catch(err => console.warn(err));

async function compileClient(config) {

  const distDir = path.join(__dirname, 'dist');
  await del(distDir);

  await fs.mkdirs(distDir);

  const entryPointSourcePath = path.join(__dirname, 'client', 'index.js');
  const bundlePath = path.join(distDir, 'client.js');

  const compiling = runWebpack(createWebpackConfig(entryPointSourcePath, bundlePath));

  const spinner = ora('Compiling client...').start();
  await compiling.catch(err => {
    spinner.fail();
    return Promise.reject(err);
  });

  spinner.stop();
  ora(`Compiled client to ${chalk.magenta('dist')}`).succeed();
}

function createWebpackConfig(entryPointPath, bundlePath) {
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
