# Courses MD

Documentation slides.

## Directory structure

* **`subjects`**

  This is the main directory where you write your courses.  Each course should
  be a sub-directory in it, e.g. `subjects/awesome-stuff`.
* **`src`**

  The source directory contains JavaScript files that can be used to customize
  the home page and the slides.
* **`build`**

  This is the directory where the compiled HTML version of your courses is
  saved. You should never modify anything in it, as its contents will be
  overwritten every time you make changes in the `subjects` directory.

  You don't have to commit it since it's generated and can be rebuilt.

## Subject structure

* **`README.md`**

  The `README.md` file in the root directory will be compiled to HTML and become
  the home page for your courses.
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
* **`src/slides/index.js`**

  This file is the entry point for your courses' JavaScript and CSS
  dependencies. You may `import` additional librairies and assets from there.  A
  bundle will be compiled with [webpack][webpack].
* **`src/slides/index.css`**

  This file is created by the generator as an example of custom styling. As you
  can see in `src/slides/index.js`, it is imported there.

## Scripts

The generator sets up the following [npm scripts][npm-scripts] for you:

* **`npm start`**

  Builds all your courses and display the home page in your browser.  It will
  also set up live reload so that the browser will automatically refresh when
  you make changes in the `subjects` directory.
* **`npm run build`**

  Builds all your courses once and exit. Useful if you want to just get the
  compiled courses and publish them yourself.
