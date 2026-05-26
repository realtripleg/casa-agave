(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.nav__toggle');
    const links = document.querySelector('.nav__links');

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const isOpen = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });

      links.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
          links.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    const path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav__links a[data-route]').forEach((link) => {
      const route = link.getAttribute('data-route');
      if (route === path) {
        link.classList.add('is-active');
      }
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId.length > 1) {
          const target = document.querySelector(targetId);
          if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', targetId);
          }
        }
      });
    });

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const revealEls = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window && revealEls.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -80px 0px', threshold: 0.05 }
      );
      revealEls.forEach((el) => observer.observe(el));
    }
  });
})();
