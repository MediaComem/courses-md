const fs = require('fs-extra');
const path = require('path');

const { getTemplate } = require('../templates');

module.exports = async function initSubject(config) {

  const subjectsDir = config.absoluteSubjectsDir;
  const subjectDir = path.join(subjectsDir, 'courses-md');
  const subjectPath = path.join(subjectDir, 'README.md');

  if (await fs.pathExists(subjectsDir)) {
    return {
      subjectPath: subjectPath,
      saved: false
    };
  }

  const markdownIconPath = path.join(__dirname, '..', 'templates', 'assets', 'markdown.svg');
  const markdownIconTargetPath = path.join(subjectDir, 'markdown.svg');

  const templaceFunc = await getTemplate('SUBJECT.md');
  const subjectContents = templaceFunc({});

  await fs.mkdirs(subjectDir);

  await Promise.all([
    fs.copy(markdownIconPath, markdownIconTargetPath),
    fs.writeFile(subjectPath, subjectContents, { encoding: 'utf8' })
  ]);

  return {
    subjectPath: subjectPath,
    saved: true
  };
};
