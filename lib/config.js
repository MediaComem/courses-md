const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

const { execute } = require('./utils');

const OPTIONS = [
  'config',
  'title',
  'scmVersion',
  'repoUrl',
  'baseUrl',
  'root',
  'subjects',
  'ignore',
  'build',
  'homeEntryPoint',
  'homeTemplate',
  'subjectEntryPoint',
  'subjectTemplate',
  'remark',
  'publish.url',
  'publish.branch',
  'publish.version'
];

const templatesDir = path.join(__dirname, 'templates');

/**
 * Configuration object for Courses MD.
 *
 * Configuration options can be provided:
 *
 * * At the command line (e.g. `courses-md --config my-config.js build`)
 * * As environment variables (e.g. `COURSES_MD_CONFIG=my-config.js courses-md build`)
 * * As properties exported from a JavaScript configuration file (`./config.js` by default)
 *
 * Options from the command line take precedence over environment variables, which themselves take precedence over configuration file properties.
 * Not all options can be provided with all 3 techniques, depending on the type.
 *
 * The following options are available:
 *
 * CLI                           | Environment                   | Config file       | Purpose
 * :---                          | :---                          | :---              | :---
 * `-c, --config <file>`         | `$COURSES_MD_CONFIG`          |                   | Path to the configuration file (defaults to `./config.js`)
 * `-b, --build <dir>`           | `$COURSES_MD_BUILD`           | `build`           | Path to the build directory where HTML slideshows are saved (defaults to `./build`)
 * `-t, --title <title>`         | `$COURSES_MD_TITLE`           | `title`           | Home page title (defaults to "Courses MD")
 *                               |                               | `remark`          | Configuration options to pass to Remark (see https://github.com/gnab/remark/wiki/Configuration); note that these will be applied to **all** slideshows
 * `--base-url <url>`            | `$COURSES_MD_BASE_URL`        | `baseUrl`         | Base URL at which the published slides will be available
 * `--repo-url <url>`            | `$COURSES_MD_REPO_URL`        | `repoUrl`         | Web URL of the repository where the Markdown source is committed (this should be the URL to the repository on GitHub, for example, not the Git URL)
 * `--publish-url <url>`         | `$COURSES_MD_PUBLISH_URL`     | `publish.url`     | Git URL of the repository to publish the HTML slides to
 * `--publish-branch <branch>`   | `$COURSES_MD_PUBLISH_BRANCH`  | `publish.branch`  | Branch to publish the HTML slides in (e.g. "gh-pages")
 * `--publish-version <version>` | `$COURSES_MD_PUBLISH_VERSION` | `publish.version` | Version sub-directory to publish the slides in
 */
class Config {
  constructor() {
    this.setDefaultOptions();
  }

  get absoluteBuildDir() {
    return path.resolve(this.absoluteRootDir, this.build);
  }

  get absoluteHomeEntryPointFile() {
    return path.resolve(this.absoluteRootDir, this.homeEntryPoint);
  }

  get absoluteSubjectEntryPointFile() {
    return path.resolve(this.absoluteRootDir, this.subjectEntryPoint);
  }

  get absoluteRootDir() {
    return path.resolve(this.root);
  }

  get absoluteSubjectsDir() {
    return path.resolve(this.absoluteRootDir, this.subjects);
  }

  getEnvVar(name) {
    return process.env[`COURSES_MD_${name}`];
  }

  async getSourceUrl() {
    if (!this.repoUrl) {
      return;
    }

    const scmVersion = await this.loadScmVersion();
    return scmVersion ? `${this.repoUrl}/tree/${scmVersion}` : undefined;
  }

  async load(options) {
    options = options || {};

    this.setDefaultOptions();

    const rootDir = path.resolve(options.root || process.env.ROOT || this.root);
    const configFile = path.resolve(rootDir, options.config || process.env.CONFIG || this.config);
    const configFileRequired = options.config || process.env.CONFIG || false;

    await this.loadFileOptions(configFile, configFileRequired);

    this.setEnvironmentOptions();
    this.set(options);

    return this;
  }

  async loadFileOptions(file, required = true) {

    const exists = await fs.pathExists(file);
    if (!exists) {
      if (required) {
        throw new Error(`Configuration path "${file}" does not exist`);
      } else {
        return this;
      }
    }

    const options = await Promise.resolve(require(file));
    this.set(options);

    if (options.publish && options.publish.afterBuild) {
      this.publish.afterBuild = options.publish.afterBuild;
    }

    return this;
  }

  async loadScmVersion() {
    if (typeof(this.scmVersion) == 'function') {
      return Promise.resolve(this.scmVersion(this));
    } else {
      return this.scmVersion;
    }
  }

  async loadDefaultScmVersion() {
    return execute([ 'git', 'rev-parse', '--verify', 'HEAD' ], { cwd: this.absoluteRootDir }).then(result => result.toString().trim()).catch(() => undefined);
  }

  setEnvironmentOptions() {
    return this.set({
      title: this.getEnvVar('TITLE'),
      scmVersion: this.getEnvVar('SCM_VERSION'),
      repoUrl: this.getEnvVar('REPO'),
      baseUrl: this.getEnvVar('BASE_URL'),
      root: this.getEnvVar('ROOT'),
      subjects: this.getEnvVar('SUBJECTS'),
      build: this.getEnvVar('BUILD'),
      homeEntryPoint: this.getEnvVar('HOME_ENTRY_POINT'),
      homeTemplate: this.getEnvVar('HOME_TEMPLATE'),
      subjectEntryPoint: this.getEnvVar('SUBJECT_ENTRY_POINT'),
      subjectTemplate: this.getEnvVar('SUBJECT_TEMPLATE'),
      publish: {
        url: this.getEnvVar('PUBLISH_URL'),
        branch: this.getEnvVar('PUBLISH_BRANCH'),
        version: this.getEnvVar('PUBLISH_VERSION')
      }
    });
  }

  setDefaultOptions() {

    this.remark = {};
    this.publish = {};

    return this.set({
      config: 'config.js',

      title: 'Courses MD',
      scmVersion: () => this.loadDefaultScmVersion(),

      repoUrl: undefined,
      baseUrl: undefined,

      root: '.',

      subjects: 'subjects',
      ignore: [ '**/node_modules/**' ],

      build: 'build',
      homeEntryPoint: 'src/home/index.js',
      homeTemplate: path.join(templatesDir, 'index.html'),
      subjectEntryPoint: 'src/subject/index.js',
      subjectTemplate: path.join(templatesDir, 'remark.html'),

      publish: {
        branch: 'master',
        version: new Date().getFullYear().toString()
      }
    });
  }

  set(options) {

    OPTIONS.forEach(property => {
      const value = _.get(options, property);
      if (value !== undefined) {
        _.set(this, property, value);
      }
    });

    return this;
  }

  validate() {

    this.validateString('title');
    this.validateString('repoUrl');
    this.validateString('baseUrl');
    this.validateString('root');
    this.validateString('subjects');
    this.validateString('build');
    this.validateString('homeEntryPoint');
    this.validateString('homeTemplate');
    this.validateString('subjectEntryPoint');
    this.validateString('subjectTemplate');

    if (!_.isArray(this.ignore)) {
      throw new Error(`"ignore" property must be an array, got ${typeof(this.ignore)}: ${this.ignore}`);
    }

    if (!_.isObject(this.remark)) {
      throw new Error(`"remark" property must be an object, got ${typeof(this.remark)}: ${this.remark}`);
    }

    if (!_.includes([ 'string', 'function' ], typeof(this.scmVersion))) {
      throw new Error(`"scmVersion" property must be a string or a function, got ${typeof(this.scmVersion)}: ${this.remark}`);
    }

    if (this.publish.url !== undefined) {
      this.validateString('publish.url');
    }

    if (this.publish.version !== undefined) {
      this.validateString('publish.version');
    }

    return this;
  }

  validateString(property) {
    const value = _.get(this, property);
    if (typeof(value) != 'string') {
      throw new Error(`"${property}" property must be a string, got ${typeof(value)}: ${value}`);
    }
  }
}

module.exports = Config;
