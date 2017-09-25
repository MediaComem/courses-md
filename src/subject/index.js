import subject from '../../dist/client';

import './index.css';

import markdownLogo from '../../markdown.svg';

subject.setLogo({
  linkUrl: 'https://github.com/MediaComem/courses-md',
  imageUrl: markdownLogo,
  width: 48.75,
  height: 30
});

subject.start();
