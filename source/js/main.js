'use strict';
(() => {
  const pageHeader = document.querySelector('.page-header');
  const headerToggle = document.querySelector('.page-header__toggle');

  pageHeader.classList.remove('page-header--nojs');

  headerToggle.addEventListener('click', () => {
    if (pageHeader.classList.contains('page-header--closed')) {
      pageHeader.classList.remove('page-header--closed');
      pageHeader.classList.add('page-header--opened');
    } else {
      pageHeader.classList.add('page-header--closed');
      pageHeader.classList.remove('page-header--opened');
    }
  });
})();
