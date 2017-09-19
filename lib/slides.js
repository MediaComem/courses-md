const _ = require('lodash');
const chalk = require('chalk');
const debug = require('debug')('slides');
const fs = require('fs-extra');
const handlebars = require('handlebars');
const md2remark = require('md2remark');
const path = require('path');

const { getTemplate } = require('./templates');

exports.compileSlides = async function(config, relativeFilePath) {

  const compiled = await markdownToSlides(config, relativeFilePath);

  const sourcePath = path.join(config.subjects, relativeFilePath);
  const targetPath = compiled.path;

  await fs.mkdirsAsync(path.dirname(compiled.path));
  await fs.writeFileAsync(compiled.path, compiled.contents, { encoding: 'utf-8' });

  debug(`${chalk.yellow(sourcePath)} -> ${chalk.green(targetPath)}`);
};

async function markdownToSlides(config, relativeFilePath) {

  const sourceFilePath = path.join(config.subjects, relativeFilePath);
  let markdown = await fs.readFileAsync(sourceFilePath, { encoding: 'utf8'});

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

  const targetFilePath = path.join(config.buildDir, targetRelativeFilePath);

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

  const templateFunc = await getTemplate('remark.html');

  const basePath = '../'.repeat(depth + 1).replace(/\/$/, '');
  const sourceUrl = `${config.repoUrl}/tree/${config.sourceVersion}/subjects/${subjectPath}/`;
  const title = `${subjectTitle} (${config.title})`;

  // Get remark options from main configuration file
  const remarkOptions = _.cloneDeep(config.remark);

  // Override remark options per slide deck with subjects/*/remark.js configuration file (if present)
  const remarkOptionsOverrideFile = path.join(process.cwd(), config.subjects, subjectPath, 'remark');
  try {
    _.merge(remarkOptions, require(remarkOptionsOverrideFile));
  } catch(err) {
    if (fs.existsSync(remarkOptionsOverrideFile + '.js')) {
      throw err;
    }
  }

  // Insert the Remark Markdown into our HTML template
  const remarkPage = templateFunc({
    config: {
      basePath: basePath,
      remark: remarkOptions,
      sourceUrl: sourceUrl,
      webfonts: config.webfonts
    },
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
