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
  'subjectEntryPoint',
  'remark',
  'publish.url',
  'publish.branch'
];

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
      subjectEntryPoint: this.getEnvVar('SUBJECT_ENTRY_POINT'),
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
      subjectEntryPoint: 'src/subject/index.js',

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
    this.validateString('subjectEntryPoint');

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
