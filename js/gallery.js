(function () {
  'use strict';

  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  const loading = document.getElementById('gallery-loading');

  if (!grid) return;

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const btnClose = document.querySelector('.lightbox__close');
  const btnPrev = document.querySelector('.lightbox__prev');
  const btnNext = document.querySelector('.lightbox__next');

  let photos = [
    { src: '/images/gallery/unnamed.jpg', alt: 'Unnamed' },
    { src: '/images/gallery/unnamed.png', alt: 'Unnamed' },
    { src: '/images/gallery/unnamed%20(1).jpg', alt: 'Unnamed (1)' },
    { src: '/images/gallery/unnamed%20(1).png', alt: 'Unnamed (1)' },
    { src: '/images/gallery/unnamed%20(2).jpg', alt: 'Unnamed (2)' },
    { src: '/images/gallery/unnamed%20(2).png', alt: 'Unnamed (2)' },
    { src: '/images/gallery/unnamed%20(3).jpg', alt: 'Unnamed (3)' },
    { src: '/images/gallery/unnamed%20(3).png', alt: 'Unnamed (3)' },
    { src: '/images/gallery/unnamed%20(4).jpg', alt: 'Unnamed (4)' },
    { src: '/images/gallery/unnamed%20(4).png', alt: 'Unnamed (4)' },
    { src: '/images/gallery/unnamed%20(5).jpg', alt: 'Unnamed (5)' },
    { src: '/images/gallery/unnamed%20(5).png', alt: 'Unnamed (5)' },
    { src: '/images/gallery/unnamed%20(6).jpg', alt: 'Unnamed (6)' },
    { src: '/images/gallery/unnamed%20(7).jpg', alt: 'Unnamed (7)' },
  ];
  let activeIndex = 0;

  render();

  function render() {
    if (loading) loading.remove();

    if (photos.length === 0) {
      if (empty) empty.hidden = false;
      grid.hidden = true;
      return;
    }

    if (empty) empty.hidden = true;
    grid.hidden = false;
    grid.innerHTML = '';

    const frag = document.createDocumentFragment();
    photos.forEach((photo, idx) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'gallery-tile';
      tile.setAttribute('aria-label', `Open photo: ${photo.alt}`);
      tile.dataset.index = String(idx);

      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = 'lazy';
      img.decoding = 'async';

      const caption = document.createElement('span');
      caption.className = 'gallery-tile__caption';
      caption.textContent = photo.alt;

      tile.appendChild(img);
      tile.appendChild(caption);
      tile.addEventListener('click', () => open(idx));
      frag.appendChild(tile);
    });

    grid.appendChild(frag);
  }

  function open(idx) {
    if (!lightbox || photos.length === 0) return;
    activeIndex = idx;
    show(activeIndex);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-locked');
    document.addEventListener('keydown', onKey);
    btnClose && btnClose.focus();
  }

  function close() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-locked');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => {
      if (lightboxImg) lightboxImg.src = '';
    }, 240);
  }

  function show(idx) {
    if (!lightboxImg) return;
    const photo = photos[idx];
    if (!photo) return;
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.alt;
    if (lightboxCaption) lightboxCaption.textContent = photo.alt;
    if (lightboxCounter) lightboxCounter.textContent = `${idx + 1} / ${photos.length}`;
  }

  function next() {
    if (photos.length === 0) return;
    activeIndex = (activeIndex + 1) % photos.length;
    show(activeIndex);
  }

  function prev() {
    if (photos.length === 0) return;
    activeIndex = (activeIndex - 1 + photos.length) % photos.length;
    show(activeIndex);
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });
  }
  btnClose && btnClose.addEventListener('click', close);
  btnNext && btnNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });
  btnPrev && btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });

  let touchStartX = null;
  if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) touchStartX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (touchStartX == null) return;
      const dx = (e.changedTouches[0] || {}).clientX - touchStartX;
      if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
      touchStartX = null;
    });
  }
})();
