# Courses <img src="./markdown.svg" width=48.75 height=30 alt="MD">

> Write courses in Markdown and publish them as HTML slides.

[![npm version](https://badge.fury.io/js/courses-md.svg)](https://badge.fury.io/js/courses-md)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Requirements](#requirements)
- [Getting started](#getting-started)
- [What sorcery is this?](#what-sorcery-is-this)
- [Usage](#usage)
  - [File structure](#file-structure)
  - [Scripts](#scripts)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



## Requirements

* [Node.js][node] 8+



## Getting started

Install our [Yeoman generator][generator-courses-md] to get started:

```bash
npm install -g yo generator-courses-md
```

Create a directory in which to write your courses. Go into it and run the generator:

```bash
mkdir courses
cd courses
yo courses-md
```

Run `yo courses-md --help` or read the [project's documentation][generator-courses-md] to see what options are available.



## What sorcery is this?

Courses MD allows you to write Markdown which will be automatically transformed
into HTML slides.

The resulting HTML files are [Remark][remark] slides and Courses MD uses
[md2remark][md2remark] to process the Markdown, so you should familiarize
yourself with these 2 tools to know what you can do.



## Usage

### File structure

* **`README.md`**

  The `README.md` file in the root directory will be compiled to HTML and become
  the home page for your courses.
* **`subjects`**

  This is the main directory where you write your courses.  Each course should
  be a sub-directory in it, e.g. `subjects/awesome-stuff`.
* **`subjects/awesome-stuff/README.md`**

  Each course should have a `README.md` file which contains the Markdown source
  of the course. When published, it will be available at
  `/subjects/awesome-stuff/`.
* **`subjects/awesome-stuff/icon.png`**

  You can include static assets such as images with your courses. Use a relative
  path to display it in your markdown, e.g. `<img src="./icon.png" />`.
* **`subjects/awesome-stuff/INSTALL.md`**

  You can include additional Markdown files which will be available under the
  course's path, in this case `/subjects/awesome-stuff/install/`.
* **`src/index.js`**

  This file is the entry point for your courses' JavaScript and CSS
  dependencies. You may `import` additional librairies and assets from there.  A
  bundle will be compiled with [webpack][webpack].
* **`src/index.css`**

  This file is created by the generator as an example of custom styling. As you
  can see if you open `src/index.js`, it is imported there.
* **`build`**

  This is the directory where the compiled, HTML version of your courses is
  saved. You should never modify anything in it, as its contents will be
  overwritten every time you make changes in the `subjects` directory.

  You don't have to commit it since it's automatically generated. The generator
  automatically adds it to your `.gitignore` by default.

### Scripts

The generator sets up the following [npm scripts][npm-scripts] for you:

* **`npm start`**

  Builds all your courses and display the home page in your browser.  It will
  also set up live reload so that the browser will automatically refresh when
  you make changes in the `subjects` directory.
* **`npm run build`**

  Builds all your courses once and exit. Useful if you want to just get the
  compiled courses and publish them yourself.



[generator-courses-md]: https://github.com/MediaComem/generator-courses-md
[generator-courses-md-docs]: https://github.com/MediaComem/generator-courses-md#readme
[md2remark]: https://github.com/AlphaHydrae/md2remark
[node]: https://nodejs.org
[npm-scripts]: https://docs.npmjs.com/misc/scripts
[remark]: https://remarkjs.com/#1
[webpack]: https://webpack.js.org
