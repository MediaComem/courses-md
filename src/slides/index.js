import course from '../../dist/client';

import './index.css';

import markdownLogo from '../../markdown.svg';

course.setLogo({
  linkUrl: 'https://github.com/MediaComem/courses-md',
  imageUrl: markdownLogo,
  width: 48.75,
  height: 30
});

course.start();
