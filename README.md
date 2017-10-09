# Courses <img src="https://cdn.rawgit.com/dcurtis/markdown-mark/10a241f3/svg/markdown-mark.svg" width=48.75 height=30 alt="MD">

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



[generator-courses-md]: https://github.com/MediaComem/generator-courses-md
[generator-courses-md-docs]: https://github.com/MediaComem/generator-courses-md#readme
[md2remark]: https://github.com/AlphaHydrae/md2remark
[node]: https://nodejs.org
[remark]: https://remarkjs.com/#1
