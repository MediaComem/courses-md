const $ = require('imports-loader?$=jQuery!jquery/dist/jquery');
const remark = require('exports-loader?remark!remark-slide/out/remark');
const URI = require('urijs/src/URI');

import githugSvg from '../assets/github.svg';
import homeSvg from '../assets/home.svg';
import { extend } from './utils';

/**
 * A subject in a course that can be displayed as a Remark HTML slideshow.
 *
 * Various methods of this class can be used to customize the runtime behavior
 * and look-and-feel of the slideshow before calling {@link Subject#start}.
 *
 * The `src/subject/index.js` file in your Courses MD repository should provide
 * a Subject instance that you can customize.
 */
export default class Subject {

  /**
   * Constructs a new subject with the default configuration.
   *
   * The subject will have 1 or 2 default links:
   *
   * * If a `subjectUrl` is configured, a link to the subject's Markdown source
   *   will be added.
   * * A link to the home page will be added.
   */
  constructor() {

    /**
     * @private
     */
    this.config = JSON.parse($('meta[name="config"]').attr('content'));

    /**
     * @private
     */
    this.links = [];

    /**
     * @private
     */
    this.logoOptions = undefined;

    if (this.config.subjectUrl) {
      this.addLink({
        url: this.config.subjectUrl,
        imageUrl: githugSvg,
        class: 'source-link',
        width: 24,
        height: 24,
        alt: 'Source code',
        title: 'Source code'
      });
    }

    this.addLink({
      url: this.homeUrl,
      imageUrl: homeSvg,
      class: 'home-link',
      width: 24,
      height: 24,
      alt: 'Home',
      title: 'Home'
    });

    this.jQuery = $;
  }

  /**
   * Adds a link to the slideshow (displayed in the top right corner with the
   * default style).
   *
   * Links are inserted into an element with the `slide-links` class which you
   * can customize through CSS.
   *
   * @param {Object} options - Link options.
   * @param {string} options.url - The URL to link to.
   * @param {string} options.imageUrl - The URL of the image to use to display
   * the link.
   * @param {number} [options.width] - The width of the link's image.
   * @param {number} [options.height] - The height of the link's image.
   * @param {string} [options.class] - Class to add to the link element.
   * @param {string} [options.alt] - Alternate text of the link's image.
   * @param {string} [options.title] - Title of the link's image.
   */
  addLink(options) {
    this.links.push(options);
  }

  /**
   * Removes all configured links.
   */
  clearLinks() {
    this.links.length = 0;
  }

  /**
   * Displays a logo with the specified options (in the top-left corner with the default style).
   *
   * The logo will be an element with the `slide-logo` class which you can
   * customize through CSS.
   *
   * @param {Object} options - Logo options.
   * @param {string} options.url - The URL to go to when the logo is
   * clicked.
   * @param {string} options.imageUrl - The URL of the logo's image.
   * @param {number} [options.width] - The width of the logo's image.
   * @param {number} [options.height] - The height of the logo's image.
   */
  setLogo(options) {
    this.logoOptions = options;
  }

  /**
   * The URL to which the default home link points to (customizable at runtime
   * through the `home` URL query param).
   *
   * By default, this is the same value as the `basePath` configuration property
   * provided by the build process. However, it can be customized by providing
   * the `home` URL query param:
   *
   * * If the `home` query param is a GitHub identifier in the `User/Repo`
   * format, the home URL will point to that repository on `https://github.com`.
   * * If the `home` query param is an URL, it will be used as the home URL.
   *
   * @type {string}
   */
  get homeUrl() {

    const currentUri = URI(window.location.href);
    const home = currentUri.search(true).home;

    if (typeof(home) == 'string' && home.match(/^[a-z0-9\-\_\.]+\/[a-z0-9\-\_\.]+(?:#.*)?$/i)) {
      return `https://github.com/${home}`;
    } else if (typeof(home) == 'string') {
      return home;
    } else {
      return this.config.basePath;
    }
  }

  /**
   * A jQuery object that contains an element for each Remark slide in the slideshow.
   *
   * @type {jQuery}
   */
  get slides() {
    if (!this._slides) {
      const slides = $('.remark-slide-content');
      if (slides.length) {
        this._slides = slides;
      }
    }

    return this._slides;
  }

  /**
   * Starts the Remark slideshow.
   *
   * @param {Object} options - Slideshow options.
   * @param {Object} [options.remark] - Configuration options to pass to
   * Remark (see https://github.com/gnab/remark/wiki/Configuration); note that
   * these will be applied to **all** slideshows
   */
  start(options) {
    options = options || {};

    const remarkOptions = extend({}, this.config.remark, options.remark);

    /**
     * The Remark slideshow (only available after calling `start`).
     *
     * @type {Remark}
     */
    this.slideshow = remark.create();

    this.insertLinks();
    this.insertLogo();

    // Make all external links open a new window
    $('a[href]').not('.home-link').not('[href^="#"]').attr('target', '_blank');
  }

  /**
   * Inserts the configured links into the slideshow.
   *
   * @private
   */
  insertLinks() {
    if (!this.links.length) {
      return;
    }

    const $links = $('<div class="slide-links" />');

    this.links.reverse().forEach(link => {

      const $link = $('<a />').attr('href', link.url).prependTo($links);

      if (link.class) {
        $link.addClass(link.class);
      }

      const $linkImg = $('<img />').attr('src', link.imageUrl).appendTo($link);

      if (link.alt) {
        $linkImg.attr('alt', link.alt);
      }

      if (link.title) {
        $linkImg.attr('title', link.title);
      }

      if (link.width) {
        $linkImg.attr('width', link.width);
      }

      if (link.height) {
        $linkImg.attr('height', link.height);
      }
    });

    $links.prependTo(this.slides);
  }

  /**
   * Inserts the configured logo into the slideshow.
   *
   * @private
   */
  insertLogo() {
    if (!this.logoOptions) {
      return;
    }

    const $logo = $('<div class="slide-logo" />');
    const $logoLink = $('<a />').appendTo($logo).attr('href', this.logoOptions.url);
    const $logoImg = $('<img />').appendTo($logoLink).attr('src', this.logoOptions.imageUrl);

    if (this.logoOptions.width) {
      $logoImg.attr('width', this.logoOptions.width);
    }

    if (this.logoOptions.height) {
      $logoImg.attr('height', this.logoOptions.height);
    }

    $logo.prependTo(this.slides);
  }
}
