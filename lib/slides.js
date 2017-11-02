const _ = require('lodash');
const chalk = require('chalk');
const debug = require('debug')('courses-md:slides');
const escapeHtml = require('escape-html');
const fs = require('fs-extra');
const handlebars = require('handlebars');
const md2remark = require('md2remark');
const path = require('path');

const { getTemplate } = require('./templates');

exports.compileSlides = async function(config, relativeFilePath, subjectBundlePath) {

  const compiled = await markdownToSlides(config, relativeFilePath, subjectBundlePath);

  const sourcePath = path.join(config.absoluteSubjectsDir, relativeFilePath);
  const targetPath = compiled.path;

  await fs.mkdirs(path.dirname(compiled.path));
  await fs.writeFile(compiled.path, compiled.contents, { encoding: 'utf-8' });

  debug(`${chalk.yellow(sourcePath)} -> ${chalk.green(targetPath)}`);
};

async function markdownToSlides(config, relativeFilePath, subjectBundlePath) {

  const sourceFilePath = path.join(config.absoluteSubjectsDir, relativeFilePath);
  let markdown = await fs.readFile(sourceFilePath, { encoding: 'utf8'});

  let targetRelativeFilePath = path.join('subjects', relativeFilePath);

  const basenameWithoutExt = path.basename(relativeFilePath, '.md');
  if (basenameWithoutExt == 'README') {
    // Convert subjects/a/b/c/README.md to subjects/a/b/c/index.html
    targetRelativeFilePath = path.join(path.dirname(targetRelativeFilePath), 'index.html');
  } else {
    // Convert subjects/a/b/c/INSTALL.md to subjects/a/b/c/install/index.html
    targetRelativeFilePath = path.join(path.dirname(targetRelativeFilePath), basenameWithoutExt.toLowerCase(), 'index.html');

    // Update relative Markdown links to take into account the new directory
    markdown = markdown
      .replace(/(\[[^\]]+\]\(\.\.\/)/g, '$1../') // "[foo](../something)" => "[foo](../../something)"
      .replace(/^(\[[^\]]+\]:\s*\.\.\/)/g, '$1../'); // "[foo]: ../something" => "[foo]: ../../something"
  }

  const targetFilePath = path.join(config.absoluteBuildDir, targetRelativeFilePath);

  const md2remarkOptions = {
    breadcrumbs: true,
    file: sourceFilePath
  };

  const remarkMarkdown = await md2remark(markdown, md2remarkOptions);

  // Determine depth of Markdown file compared to subjects directory
  // (subjects/a/index.html has depth 1, subjects/a/b/index.html has depth 2, etc)
  let depth = 0;
  const subjectPath = path.dirname(relativeFilePath);
  let currentPath = subjectPath;
  while (currentPath != '.') {
    depth++;
    currentPath = path.dirname(currentPath);
  }

  // Use the first Markdown header as the HTML <title>
  const subjectTitleMatch = markdown.match(/^#\s*([^\n]+)/m);
  const subjectTitle = subjectTitleMatch ? subjectTitleMatch[1] : 'Slides';

  const templateFunc = await getTemplate(config.subjectTemplate);

  const basePath = '../'.repeat(depth + 1).replace(/\/$/, '');
  const title = `${subjectTitle} (${config.title})`;

  let subjectUrl;

  const sourceUrl = await config.getSourceUrl();
  if (sourceUrl) {
    subjectUrl = `${sourceUrl}/subjects/${subjectPath}`;
  }

  // Get remark options from main configuration file
  const remarkOptions = _.cloneDeep(config.remark);

  // Override remark options per slide deck with subjects/*/remark.js configuration file (if present)
  const remarkOptionsOverrideFile = path.join(config.absoluteSubjectsDir, subjectPath, 'remark');
  try {
    _.merge(remarkOptions, require(remarkOptionsOverrideFile));
  } catch(err) {
    if (fs.existsSync(remarkOptionsOverrideFile + '.js') || fs.existsSync(remarkOptionsOverrideFile + '.json')) {
      throw err;
    }
  }

  const scripts = [
    path.join(basePath, path.relative(config.absoluteBuildDir, subjectBundlePath))
  ];

  const subjectScriptFile = path.join(config.absoluteSubjectsDir, subjectPath, 'index.js');
  if (fs.existsSync(subjectScriptFile)) {
    scripts.push('./index.js');
  }

  // Insert the Remark Markdown into our HTML template
  const remarkPage = templateFunc({
    config: {
      basePath: basePath,
      remark: remarkOptions,
      subjectUrl: subjectUrl
    },
    scripts: scripts.map(script => `<script src="${escapeHtml(script)}"></script>`).join('\n'),
    source: remarkMarkdown,
    title: title
  }, {
    helpers: {
      json: function(contents) {
        return JSON.stringify(contents);
      }
    }
  });

  return {
    contents: remarkPage,
    path: targetFilePath
  };
};
