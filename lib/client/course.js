var course = {
  links: []
};

course.setLogo = function(logo) {
  course.logo = logo;
};

course.start = function(remarkOptions) {

  course.basePath = $('meta[name="basePath"]').attr('content');

  course.slideshow = remark.create(remarkOptions);

  var $slides = $('.remark-slide-content');

  var $logo = $('#slide-logo');
  if (course.logo) {

    $logo.find('a').attr('href', course.logo.linkUrl);

    $logoImg = $logo.find('img');
    $logoImg.attr('src', course.basePath + '/' + course.logo.imageUrl);

    if (course.logo.width) {
      $logoImg.attr('width', course.logo.width);
    }

    if (course.logo.height) {
      $logoImg.attr('height', course.logo.height);
    }

    // Remove logo from body and add it to each slide
    $logo.remove().prependTo($slides).show();
  } else {
    $logo.remove();
  }

  $('#slide-links .home-link').each(function() {
    var $a = $(this);

    var currentUri = URI(window.location.href);
    var home = currentUri.search(true).home;

    if (typeof(home) == 'string' && home.match(/^[a-z0-9\-\_\.]+\/[a-z0-9\-\_\.]+(?:#.*)?$/i)) {
      $a.attr('href', 'https://github.com/' + home);
    } else if (typeof(home) == 'string') {
      $a.attr('href', home);
    } else if (currentUri.hostname() == '127.0.0.1' || currentUri.hostname() == 'localhost') {
      $a.attr('href', currentUri.path(course.basePath).hash('').toString());
    }
  });

  // Remove links from body and add them to each slide
  $('#slide-links').remove().prependTo($slides).show();

  // Make all external links open a new window
  $('a[href]').not('.home-link').not('[href^="#"]').attr('target', '_blank');
};
