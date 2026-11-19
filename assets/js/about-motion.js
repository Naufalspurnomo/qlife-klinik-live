(() => {
  'use strict';
  const page = document.querySelector('.about-page');
  if (!page) return;
  const items = [...page.querySelectorAll('[data-abw-reveal]')];
  const showAll = () => items.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { showAll(); return; }
  if (!window.gsap || !window.ScrollTrigger) { showAll(); return; }
  try {
    gsap.registerPlugin(ScrollTrigger);
    page.classList.add('abw-motion');
    gsap.from('.abw-hero__copy > *', { opacity: 0, y: 22, duration: .8, stagger: .08, ease: 'power2.out', clearProps: 'all' });
    gsap.from('.abw-hero__media', { opacity: 0, scale: .985, duration: 1.05, ease: 'power2.out', clearProps: 'all' });
    const mobile = matchMedia('(max-width: 767px)').matches;
    items.forEach((el) => gsap.to(el, { opacity: 1, y: 0, duration: mobile ? .55 : .8, ease: 'power2.out', clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 88%', once: mobile, toggleActions: mobile ? 'play none none none' : 'play none none reverse' } }));
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  } catch (error) {
    page.classList.remove('abw-motion');
    showAll();
    console.warn('About motion fallback:', error);
  }
})();
