/* Q-Life editorial motion: dokter, artikel, kontak only. Content stays visible by default. */
(function () {
  'use strict';

  var body = document.body;
  if (!body || !body.matches('.doc-page,.art-page,.con-page')) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var owned = Array.prototype.slice.call(document.querySelectorAll('[data-pg-reveal]'));

  function showAll() {
    owned.forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.visibility = 'visible';
    });
  }

  function removeLegacyRevealOwnership() {
    owned.forEach(function (el) {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(function (trigger) {
          if (trigger.trigger === el) trigger.kill(true);
        });
      }
      if (typeof gsap !== 'undefined') gsap.killTweensOf(el);
      el.removeAttribute('data-pg-reveal');
    });
    showAll();
  }

  function boot() {
    removeLegacyRevealOwnership();
    if (reduced || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    var hero = document.querySelector('.pg-hero');
    var heroItems = hero ? hero.querySelectorAll('.page-crumb,.pg-eyebrow,h1,.pg-hero-lead,.ox-hero-actions') : [];
    if (heroItems.length) {
      gsap.from(heroItems, {
        opacity: 0, y: 26, duration: 0.82, ease: 'power3.out', stagger: 0.075,
        clearProps: 'opacity,transform', delay: 0.08
      });
    }

    var groups = [];
    if (body.classList.contains('doc-page')) {
      groups = [document.querySelectorAll('.doc-plate'), document.querySelectorAll('.doc-sched-card')];
    } else if (body.classList.contains('art-page')) {
      groups = [document.querySelectorAll('.art-feature'), document.querySelectorAll('.art-card')];
    } else {
      groups = [document.querySelectorAll('.con-row'), document.querySelectorAll('.con-map')];
    }

    groups.forEach(function (nodes) {
      if (!nodes.length) return;
      gsap.from(nodes, {
        opacity: 0, y: touch ? 24 : 34, duration: touch ? 0.62 : 0.82,
        ease: 'power3.out', stagger: touch ? 0.055 : 0.1, clearProps: 'opacity,transform',
        scrollTrigger: { trigger: nodes[0], start: 'top 88%', once: true }
      });
    });

    if (!touch && hero) {
      gsap.to(hero.querySelector('.wrap'), {
        opacity: 0.72, y: -18, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'bottom 70%', end: 'bottom top', scrub: 0.5 }
      });
    }
  }

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) showAll();
  });
  window.addEventListener('pagehide', showAll);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else window.requestAnimationFrame(boot);
}());
