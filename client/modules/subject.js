const $ = require('imports-loader?$=jQuery!jquery/dist/jquery');
const remark = require('exports-loader?remark!remark-slide/out/remark');
const URI = require('urijs/src/URI');

import githugSvg from '../assets/github.svg';
import homeSvg from '../assets/home.svg';

export default class Subject {
  constructor() {

    this.links = [];
    this.config = JSON.parse($('meta[name="config"]').attr('content'));

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
      url: this.getHomeUrl(),
      imageUrl: homeSvg,
      class: 'home-link',
      width: 24,
      height: 24,
      alt: 'Home',
      title: 'Home'
    });
  }

  addLink(options) {
    this.links.push(options);
  }

  setLogo(options) {
    this.logoOptions = options;
  }

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

    $links.prependTo(this.getSlides());
  }

  insertLogo() {
    if (!this.logoOptions) {
      return;
    }

    const $logo = $('<div class="slide-logo" />');
    const $logoLink = $('<a />').appendTo($logo).attr('href', this.logoOptions.linkUrl);
    const $logoImg = $('<img />').appendTo($logoLink).attr('src', this.config.basePath + '/' + this.logoOptions.imageUrl);

    if (this.logoOptions.width) {
      $logoImg.attr('width', this.logoOptions.width);
    }

    if (this.logoOptions.height) {
      $logoImg.attr('height', this.logoOptions.height);
    }

    $logo.prependTo(this.getSlides());
  }

  getHomeUrl() {

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

  getSlides() {
    if (!this.slides) {
      this.slides = $('.remark-slide-content');
    }

    return this.slides;
  }

  start(options) {
    options = options || {};

    this.slideshow = remark.create(options.remark || this.config.remark);

    this.insertLinks();
    this.insertLogo();

    // Make all external links open a new window
    $('a[href]').not('.home-link').not('[href^="#"]').attr('target', '_blank');
  }
}
