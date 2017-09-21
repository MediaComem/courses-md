const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');

const { execute } = require('./utils');

const OPTIONS = [
  'config',
  'title',
  'version',
  'scmVersion',
  'repoUrl',
  'baseUrl',
  'root',
  'subjects',
  'ignore',
  'build',
  'entryPoint',
  'clientBundle',
  'remark'
];

class Config {
  constructor() {
    this.setDefaultOptions();
  }

  get absoluteBuildDir() {
    return path.resolve(this.absoluteRootDir, this.build);
  }

  get clientBundlePath() {
    return path.resolve(this.absoluteRootDir, this.clientBundle);
  }

  get entryPointPath() {
    return path.resolve(this.absoluteRootDir, this.entryPoint);
  }

  get mainBundlePath() {
    return path.resolve(this.absoluteBuildDir, 'bundle.js');
  }

  get absoluteEntryPointFile() {
    return path.resolve(this.absoluteRootDir, this.entryPoint);
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
    if (!this.repoUrl || !(await fs.pathExists(path.join(config.absoluteRootDir, '.git')))) {
      return;
    }

    return `${this.repoUrl}/tree/${await this.loadScmVersion()}`;
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
    return this.set(options);
  }

  async loadScmVersion() {
    if (typeof(this.scmVersion) == 'function') {
      return Promise.resolve(this.scmVersion(this));
    } else {
      return this.scmVersion;
    }
  }

  async loadDefaultScmVersion() {
    return execute('git rev-parse --verify HEAD', { cwd: this.absoluteRootDir }).then(result => result.toString().trim());
  }

  setEnvironmentOptions() {
    return this.set({
      title: this.getEnvVar('TITLE'),
      version: this.getEnvVar('VERSION'),
      scmVersion: this.getEnvVar('SCM_VERSION'),
      repoUrl: this.getEnvVar('REPO'),
      baseUrl: this.getEnvVar('BASE_URL'),
      root: this.getEnvVar('ROOT'),
      subjects: this.getEnvVar('SUBJECTS'),
      build: this.getEnvVar('BUILD'),
      entryPoint: this.getEnvVar('ENTRY_POINT'),
      clientBundle: this.getEnvVar('CLIENT_BUNDLE')
    });
  }

  setDefaultOptions() {
    return this.set({
      config: 'config.js',

      title: 'Courses MD',
      version: new Date().getFullYear().toString(),
      scmVersion: () => this.loadDefaultScmVersion(),

      repoUrl: undefined,
      baseUrl: undefined,

      root: '.',

      subjects: 'subjects',
      ignore: [ '**/node_modules/**' ],

      build: 'build',
      entryPoint: 'src/index.js',
      clientBundle: 'vendor/courses-md.js',

      remark: {}
    });
  }

  set(options) {

    OPTIONS.forEach(property => {
      const value = options[property];
      if (value !== undefined) {
        this[property] = value;
      }
    });

    return this;
  }

  validate() {

    this.validateString('title');
    this.validateString('version');
    this.validateString('repoUrl');
    this.validateString('baseUrl');
    this.validateString('root');
    this.validateString('subjects');
    this.validateString('build');
    this.validateString('entryPoint');
    this.validateString('clientBundle');

    if (!_.isArray(this.ignore)) {
      throw new Error(`"ignore" property must be an array, got ${typeof(this.ignore)}: ${this.ignore}`);
    }

    if (!_.isObject(this.remark)) {
      throw new Error(`"remark" property must be an object, got ${typeof(this.remark)}: ${this.remark}`);
    }

    if (!_.includes([ 'string', 'function' ], typeof(this.scmVersion))) {
      throw new Error(`"scmVersion" property must be a string or a function, got ${typeof(this.scmVersion)}: ${this.remark}`);
    }

    return this;
  }

  validateString(property) {
    const value = this[property];
    if (typeof(value) != 'string') {
      throw new Error(`"${property}" property must be a string, got ${typeof(value)}: ${value}`);
    }
  }
}

module.exports = Config;
