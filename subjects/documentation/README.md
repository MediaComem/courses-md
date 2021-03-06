# Courses MD

Learn how to write courses in Markdown and publish them as HTML slides with
Courses MD.

This documentation is available:

* [On GitHub as Markdown][docs-md]
* [On GitHub Pages as HTML slides][docs-html] (generated from the Markdown with)



## File structure

<!-- slide-front-matter class: center, middle -->

How to organize files in a Courses MD repository

### Main directories

Courses MD mostly looks at these 3 directories:

* **`subjects`**

  This is the main directory where you write your courses. Each subject should
  be a sub-directory in it, e.g. **`subjects/awesome-stuff`**.
* **`build`**

  This is the directory where the compiled HTML slides of your subjects are
  saved. You should never modify anything in it, as its contents will be
  overwritten every time you make changes in the **`subjects`** directory.

  You don't have to commit it since it's generated and can be rebuilt.
* **`src`**

  This directory contains JavaScript files that can be used to customize the
  home page and the slides (for example, to add a CSS file or JavaScript
  library).

### Subjects

Each subject in your courses should be a sub-directory under the main `subjects`
directory. This sub-directory should contain a **`README.md`** file and the
assets (images, etc) you need:

* **`subjects/awesome-stuff/README.md`**

  A subject's **`README.md`** file contains the Markdown source of that subject,
  which will be converted to an HTML slideshow. When published, it will be
  available at `/subjects/awesome-stuff/`.
* **`subjects/awesome-stuff/icon.png`**

  You can include static assets such as images with your courses. Use a relative
  path to display it in your markdown, for example:

        ![Icon](./icon.png)

        <img src="./icon.png" width=20 height=20 />

### Home page

Courses MD expects to find a main **`README.md`** file at the root of the
repository. It will convert it to HTML and use it as the home page of your
courses.

No modifications will be made on the contents of that page, so you should make
sure to include links to the various subjects of your courses. You may use
relative links, for example:

    [Awesome Stuff](subjects/awesome-stuff/)

### Slideshow & home page customization

A Courses MD repository will have a **`src/subject/index.js`** file which is the
entry point of a [webpack][webpack] bundle. This bundle contains the required
JavaScript to display your slides with [Remark][remark].

You may `import` additional assets (e.g. stylesheets or JavaScript libraries)
from there.

[Generate][generate] a Courses MD repository and take a look at
**`src/subject/index.js`**, you will find an import line for an **`index.css`**
file where you may put custom styles.

Similarly, the **`src/home/index.js`** file is the entry point of a webpack
bundle which will be served with the home page (generated from your main
**`README.md`** file). You may use it to import additional assets for your home
page.



## Scripts

When you [generate][generate] a Courses MD repository, the following [npm
scripts][npm-scripts] will be set up for you. You can run them from the root of
the repository:

* **`npm start`**

  Generates HTML slideshows for all your subjects and displays the home page in
  your browser. It will also set up live reload so that the browser will
  automatically refresh when you make changes in the `subjects` directory.
* **`npm run build`**

  Generates HTML slideshows for all your subjects and the home page, and exits.
  The resulting files in the **`build`** directory can be published on any
  platform which can serve static files such as [GitHub Pages][github-pages].



## Configuration

There are several ways to customize the behavior of Courses MD:

* You can modify the **`config.js`** file at the root of your repository to
  configure the **build process** (the process by which your subjects' Markdown
  source is converted to HTML slideshows).

  This allows you to change the default paths (e.g. where Courses MD looks for
  the **`subjects`** directory and other directories), and to change some of the
  slideshows' properties which are injected at build time.

  Look at the documentation of the [Config][config-build] class.
* You can modify the **`src/subject/index.js`** entry point.

  This allows you to customize the runtime behavior and look-and-feel of your
  slideshows.

  Look at the documentation of the [Subject][config-subject] class.

### Configuring Remark

Remark slideshows have their [own configuration][remark-config]. There are 3
ways to provide these options with Courses MD:

* Export a `remark` object from the `config.js` file at the root of your
  repository. These options will be applied to **all** slideshows.
* Export options from a `remark.js` file in a subject's directory (e.g.
  `subjects/awesome-stuff`). These options will only be applied to that
  subject's slideshow, and will take precedence over the options from
  `config.js`.
* Pass options to the `start` method of the [Subject][config-subject] instance
  available in your `src/subject/index.js` file. These options will be applied
  to **all** slideshows and take precedence over all other options.



[config-build]: https://MediaComem.github.io/courses-md/api/class/courses-md/lib/config.js~Config.html
[config-subject]: https://MediaComem.github.io/courses-md/api/class/courses-md/client/modules/subject.js~Subject.html
[docs-html]: https://MediaComem.github.io/courses-md/latest/subjects/documentation/
[docs-md]: https://github.com/MediaComem/courses-md/tree/master/subjects/documentation#readme
[generate]: https://github.com/MediaComem/courses-md#getting-started
[github-pages]: https://pages.github.com
[npm-scripts]: https://docs.npmjs.com/misc/scripts
[remark]: https://remarkjs.com/
[remark-config]: https://github.com/gnab/remark/wiki/Configuration
[webpack]: https://webpack.js.org
