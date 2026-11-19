/* ===== Q-LIFE KLINIK — Awwwards-level motion system ===== */
(function () {
  "use strict";

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverable = window.matchMedia('(hover:hover)').matches;
  const isEnglish = document.documentElement.lang === 'en';

  function styleBrandInitials() {
    document.querySelector('#loaderWord .lw')?.classList.add('brand-q');
    const tokenPattern = /q(?:[-\u2011\u2013]|\s)?life\b/gi;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement.closest('script,style,noscript,textarea,title,svg,.brand-q,.brand-lockup') && tokenPattern.test(node.data)) nodes.push(node);
      tokenPattern.lastIndex = 0;
    }
    nodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      node.data.replace(tokenPattern, (token, offset) => {
        fragment.append(node.data.slice(cursor, offset));
        const lockup = document.createElement('span');
        lockup.className = 'brand-lockup';
        const initial = document.createElement('span');
        initial.className = 'brand-q';
        initial.textContent = token.charAt(0);
        lockup.append(initial, token.slice(1));
        fragment.append(lockup);
        cursor = offset + token.length;
        return token;
      });
      fragment.append(node.data.slice(cursor));
      node.replaceWith(fragment);
    });
  }

  styleBrandInitials();

  // ================= SIGNATURE LOADER =================
  // Only the homepage carries the full loader markup; sub-pages get page-transition entrance only.
  const loader = document.getElementById('loader');
  const loaderCount = document.getElementById('loaderCount');
  const loaderLine = document.getElementById('loaderLine');
  const loaderCurtain = document.getElementById('loaderCurtain');
  let loaderDone = false;

  function playLoader(onComplete) {
    if (!loader) { onComplete && onComplete(); return; }
    if (typeof gsap === 'undefined') { // graceful fallback without gsap
      loader.style.display = 'none';
      if (loaderCurtain) loaderCurtain.style.display = 'none';
      onComplete && onComplete(); return;
    }
    const letters = loader.querySelectorAll('.lw');
    gsap.set(letters, { yPercent: 110 });
    const counter = { v: 0 };
    const tl = gsap.timeline({ onComplete: () => { loaderDone = true; onComplete && onComplete(); } });
    tl.to(letters, { yPercent: 0, duration: 0.5, ease: 'power4.out', stagger: 0.02 }, 0.05)
      .to(counter, { v: 100, duration: 0.7, ease: 'power2.inOut',
        onUpdate: () => { if (loaderCount) loaderCount.textContent = Math.round(counter.v).toString().padStart(2,'0'); } }, 0.1)
      .fromTo(loaderLine, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, 0.1)
      .to(loader.querySelector('.loader-word'), { yPercent: -18, opacity: 0, duration: 0.35, ease: 'power3.in' }, '+=0.05')
      .to('.loader-meta, .loader-line', { opacity: 0, duration: 0.25 }, '<')
      .set(loader, { display: 'none' })
      // curtain lift — 5 panels rise in sequence, revealing the hero
      .to(loaderCurtain ? loaderCurtain.querySelectorAll('span') : [], {
        yPercent: -101, duration: 0.5, ease: 'power4.inOut', stagger: 0.04,
        onComplete: () => { if (loaderCurtain) loaderCurtain.style.display = 'none'; }
      }, '-=0.15');
    return tl;
  }

  // ================= PAGE TRANSITIONS (site-wide) =================
  // Lazy lookup: shell.js may inject the curtain after this file is parsed.
  const getPt = () => document.getElementById('pt');
  const getPtBrand = () => document.getElementById('ptBrand');
  let navigationLocked = false;
  let navigationTimer = 0;

  function resetCurtain() {
    window.clearTimeout(navigationTimer);
    navigationLocked = false;
    const pt = getPt();
    const brand = getPtBrand();
    if (!pt) return;
    const panels = pt.querySelectorAll('span');
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf(panels);
      if (brand) gsap.killTweensOf(brand);
      gsap.set(panels, { yPercent: 101, clearProps: 'transformOrigin' });
      if (brand) gsap.set(brand, { opacity: 0 });
    } else {
      panels.forEach((panel) => { panel.style.transform = 'translateY(101%)'; });
      if (brand) brand.style.opacity = '0';
    }
    pt.classList.remove('cover');
    pt.style.pointerEvents = 'none';
    pt.style.visibility = 'hidden';
  }

  function internalHtmlUrl(a) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return null;
    const raw = (a.getAttribute('href') || '').trim();
    if (!raw || raw[0] === '#' || /^(mailto:|tel:|javascript:)/i.test(raw) || /(?:wa\.me|whatsapp\.com)/i.test(raw)) return null;
    let url;
    try { url = new URL(raw, location.href); } catch (_) { return null; }
    if (url.origin !== location.origin || !/\.html?$/i.test(url.pathname)) return null;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return null;
    return url.href;
  }

  function plainNavigate(url) {
    resetCurtain();
    location.assign(url);
  }

  function pageExit(url) {
    const pt = getPt();
    if (!pt || typeof gsap === 'undefined' || reduced) { plainNavigate(url); return; }
    const panels = pt.querySelectorAll('span');
    const brand = getPtBrand();
    pt.style.visibility = 'visible';
    pt.style.pointerEvents = 'all';
    pt.classList.add('cover');
    gsap.killTweensOf(panels);
    const go = () => location.assign(url);
    navigationTimer = window.setTimeout(go, 1150);
    const tl = gsap.timeline({ onComplete: go, onInterrupt: go });
    tl.set(panels, { transformOrigin: 'bottom' })
      .to(panels, { yPercent: 0, duration: 0.44, ease: 'power4.inOut', stagger: 0.035 });
    if (brand) tl.to(brand, { opacity: 1, duration: 0.22 }, '-=0.16');
  }

  function pageEnter() {
    const pt = getPt();
    const arrived = sessionStorage.getItem('qlife-nav') === '1';
    sessionStorage.removeItem('qlife-nav');
    if (!pt || typeof gsap === 'undefined' || reduced || !arrived) { resetCurtain(); return; }
    const panels = pt.querySelectorAll('span');
    const brand = getPtBrand();
    pt.style.visibility = 'visible';
    pt.style.pointerEvents = 'none';
    pt.classList.add('cover');
    gsap.set(panels, { yPercent: 0 });
    if (brand) gsap.set(brand, { opacity: 1 });
    const tl = gsap.timeline({ delay: 0.03, onComplete: resetCurtain, onInterrupt: resetCurtain });
    if (brand) tl.to(brand, { opacity: 0, duration: 0.2 });
    tl.to(panels, { yPercent: -101, duration: 0.52, ease: 'power4.inOut', stagger: 0.035 }, brand ? '-=0.08' : 0);
    navigationTimer = window.setTimeout(resetCurtain, 1100);
  }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    const url = internalHtmlUrl(a);
    if (!url || navigationLocked) return;
    e.preventDefault();
    navigationLocked = true;
    try { sessionStorage.setItem('qlife-nav', '1'); } catch (_) {}
    closeMobileMenu();
    pageExit(url);
  });
  window.addEventListener('pageshow', resetCurtain);
  window.addEventListener('pagehide', () => {
    window.clearTimeout(navigationTimer);
    if (typeof gsap !== 'undefined') {
      const pt = getPt();
      if (pt) gsap.killTweensOf(pt.querySelectorAll('span'));
    }
  });

  // ---- BURGER MENU: bound immediately via event delegation, independent of GSAP/Lenis ----
  // Accessibility: dialog semantics, initial focus, Tab focus trap, focus restore on Escape/close.
  let menuWasOpen = false;
  function setMenuAria(isOpen) {
    const menu = document.getElementById('mobileMenu');
    const burger = document.getElementById('burger');
    if (burger) burger.setAttribute('aria-expanded', String(isOpen));
    if (!menu) return;
    if (!menu.hasAttribute('role')) menu.setAttribute('role', 'dialog');
    if (!menu.hasAttribute('aria-modal')) menu.setAttribute('aria-modal', 'true');
    menu.setAttribute('aria-hidden', String(!isOpen));
  }
  function openMobileMenu(burger) {
    setMenuAria(true);
    menuWasOpen = true;
    const menu = document.getElementById('mobileMenu');
    menu?.addEventListener('transitionend', () => document.getElementById('mmClose')?.focus(), { once: true });
  }
  function closeMobileMenu(restoreFocus) {
    const menu = document.getElementById('mobileMenu');
    const burger = document.getElementById('burger');
    if (menu) menu.classList.remove('open');
    if (burger) burger.classList.remove('active');
    document.body.classList.remove('menu-open');
    setMenuAria(false);
    // Only steal focus back for deliberate dismissals (Escape / close button);
    // link-click close may navigate, and restoring focus then disrupts the user.
    if (restoreFocus && menuWasOpen && burger) setTimeout(() => burger.focus(), 0);
    menuWasOpen = false;
  }
  setMenuAria(false);
  document.addEventListener('click', (e) => {
    const burger = e.target.closest('#burger');
    if (burger) {
      e.preventDefault();
      const menu = document.getElementById('mobileMenu');
      const isOpen = menu.classList.toggle('open');
      burger.classList.toggle('active', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      if (isOpen) openMobileMenu(burger); else closeMobileMenu(false);
      return;
    }
    if (e.target.closest('#mmClose')) { e.preventDefault(); closeMobileMenu(true); return; }
    if (e.target.closest('#mobileMenu a')) closeMobileMenu(false);
  });
  function menuFocusables(menu) {
    return [...menu.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]')]
      .filter((el) => el.tabIndex >= 0 && !el.disabled && el.getClientRects().length > 0);
  }
  document.addEventListener('keydown', (e) => {
    const menu = document.getElementById('mobileMenu');
    if (!menu || !menu.classList.contains('open')) {
      if (e.key === 'Escape') closeMobileMenu(false);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMobileMenu(true);
      return;
    }
    if (e.key !== 'Tab') return;
    // Focus trap: keep Tab / Shift+Tab inside the open menu.
    const items = menuFocusables(menu);
    if (!items.length) { e.preventDefault(); menu.focus(); return; }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !menu.contains(active))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (active === last || !menu.contains(active))) { e.preventDefault(); first.focus(); }
  });

  function waitForLibs() {
    return new Promise((resolve) => {
      const ok = () => typeof gsap !== 'undefined' && typeof Lenis !== 'undefined' && typeof ScrollTrigger !== 'undefined';
      if (ok()) return resolve();
      let t = 0;
      const iv = setInterval(() => { if (ok() || ++t > 120) { clearInterval(iv); resolve(); } }, 40);
    });
  }

  // legacy no-op retained for sub-pages that call it
  function finishPreloader() {}

  // Google review carousel stays independent from animation libraries.
  function initReviewCarousel() {
    const carousel = document.querySelector('[data-review-carousel]');
    if (!carousel) return;

    const viewport = carousel.querySelector('[data-review-viewport]');
    const slides = Array.from(carousel.querySelectorAll('.review-quote'));
    const previous = carousel.querySelector('[data-review-prev]');
    const next = carousel.querySelector('[data-review-next]');
    const autoplay = carousel.querySelector('[data-review-autoplay]');
    const counter = carousel.querySelector('[data-review-counter]');
    const dots = Array.from(carousel.querySelectorAll('[data-review-dots] button'));
    const dialog = document.querySelector('[data-review-dialog]');
    const dialogClose = dialog?.querySelector('[data-review-dialog-close]');
    const dialogTitle = dialog?.querySelector('[data-review-dialog-title]');
    const dialogQuote = dialog?.querySelector('[data-review-dialog-quote]');
    const dialogInitial = dialog?.querySelector('[data-review-dialog-initial]');
    const dialogAuthor = dialog?.querySelector('[data-review-dialog-author]');
    const dialogImages = dialog?.querySelector('[data-review-dialog-images]');
    if (!viewport || slides.length === 0 || !previous || !next || !counter) return;

    let activeIndex = 0;
    let scrollFrame = 0;
    let autoplayTimer = 0;
    let lastDialogTrigger = null;
    const pauseReasons = new Set();
    const autoplayDelay = 6500;
    const pad = (value) => String(value).padStart(2, '0');

    const updateExpandableButtons = () => {
      slides.forEach((slide) => {
        const quote = slide.querySelector('blockquote');
        const button = slide.querySelector('[data-review-expand]');
        if (!quote || !button) return;
        const isTruncated = quote.scrollHeight > quote.clientHeight + 1;
        button.hidden = !isTruncated;
      });
    };

    const updatePosition = (index) => {
      activeIndex = Math.max(0, Math.min(index, slides.length - 1));
      counter.textContent = `${pad(activeIndex + 1)} / ${pad(slides.length)}`;
      dots.forEach((dot, dotIndex) => {
        if (dotIndex === activeIndex) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        const expandControls = slide.querySelectorAll('[data-review-expand], [data-review-expand-media]');
        if (isActive) slide.setAttribute('aria-current', 'true');
        else slide.removeAttribute('aria-current');
        expandControls.forEach((control) => { control.tabIndex = isActive ? 0 : -1; });
      });
    };

    const slideOffset = (slide) => {
      const viewportRect = viewport.getBoundingClientRect();
      const slideRect = slide.getBoundingClientRect();
      return viewport.scrollLeft + slideRect.left - viewportRect.left;
    };

    const goTo = (index, behavior = reduced ? 'auto' : 'smooth') => {
      const normalized = (index + slides.length) % slides.length;
      updatePosition(normalized);
      viewport.scrollTo({ left: slideOffset(slides[normalized]), behavior });
    };

    const stopAutoplay = () => {
      window.clearInterval(autoplayTimer);
      autoplayTimer = 0;
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (reduced || pauseReasons.size > 0 || document.hidden) return;
      autoplayTimer = window.setInterval(() => goTo(activeIndex + 1), autoplayDelay);
    };

    const pause = (reason) => {
      pauseReasons.add(reason);
      stopAutoplay();
    };

    const resume = (reason) => {
      pauseReasons.delete(reason);
      startAutoplay();
    };

    const useControl = (index) => {
      goTo(index);
      startAutoplay();
    };

    previous.addEventListener('click', () => useControl(activeIndex - 1));
    next.addEventListener('click', () => useControl(activeIndex + 1));
    if (autoplay) {
      autoplay.addEventListener('click', () => {
        const paused = pauseReasons.has('manual');
        if (paused) {
          pauseReasons.delete('manual');
          autoplay.classList.remove('is-paused');
          autoplay.setAttribute('aria-pressed', 'false');
          autoplay.setAttribute('aria-label', isEnglish ? 'Pause automatic rotation' : 'Jeda pergeseran otomatis');
          startAutoplay();
        } else {
          pause('manual');
          autoplay.classList.add('is-paused');
          autoplay.setAttribute('aria-pressed', 'true');
          autoplay.setAttribute('aria-label', isEnglish ? 'Resume automatic rotation' : 'Lanjutkan pergeseran otomatis');
        }
      });
    }
    dots.forEach((dot, index) => dot.addEventListener('click', () => useControl(index)));

    const closeReviewDialog = () => {
      if (dialog?.open) dialog.close();
    };

    const openReviewDialog = (slide, trigger) => {
      if (!dialog || !dialogTitle || !dialogQuote || !dialogAuthor || !dialogInitial || !dialogImages) return;
      const quote = slide.querySelector('blockquote');
      const author = slide.querySelector('cite');
      const initial = slide.querySelector('.review-initial');
      if (!quote || !author || !initial) return;

      lastDialogTrigger = trigger;
      dialogTitle.textContent = `${isEnglish ? 'Review by' : 'Ulasan dari'} ${author.textContent.trim()}`;
      dialogQuote.innerHTML = quote.innerHTML;
      dialogAuthor.textContent = author.textContent.trim();
      dialogInitial.textContent = initial.textContent.trim();
      const clones = Array.from(slide.querySelectorAll('.review-media img'), (image) => {
        const clone = image.cloneNode();
        clone.loading = 'eager';
        return clone;
      });
      dialogImages.replaceChildren(...clones);
      dialogImages.hidden = clones.length === 0;
      pause('dialog');
      dialog.showModal();
    };

    slides.forEach((slide) => {
      slide.querySelectorAll('[data-review-expand], [data-review-expand-media]').forEach((control) => {
        control.addEventListener('click', () => openReviewDialog(slide, control));
      });
    });
    if (dialog) {
      dialogClose?.addEventListener('click', closeReviewDialog);
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closeReviewDialog();
      });
      dialog.addEventListener('close', () => {
        resume('dialog');
        lastDialogTrigger?.focus();
        lastDialogTrigger = null;
      });
    }

    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        useControl(activeIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        useControl(activeIndex + 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        useControl(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        useControl(slides.length - 1);
      }
    });

    carousel.addEventListener('mouseenter', () => pause('hover'));
    carousel.addEventListener('mouseleave', () => resume('hover'));
    carousel.addEventListener('focusin', () => pause('focus'));
    carousel.addEventListener('focusout', (event) => {
      if (!carousel.contains(event.relatedTarget)) resume('focus');
    });
    viewport.addEventListener('pointerdown', () => pause('pointer'));
    viewport.addEventListener('pointerup', () => resume('pointer'));
    viewport.addEventListener('pointercancel', () => resume('pointer'));

    viewport.addEventListener('scroll', () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(() => {
        const viewportLeft = viewport.getBoundingClientRect().left;
        let nearestIndex = 0;
        let nearestDistance = Infinity;
        slides.forEach((slide, index) => {
          const distance = Math.abs(slide.getBoundingClientRect().left - viewportLeft);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });
        updatePosition(nearestIndex);
      });
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pause('hidden');
      else resume('hidden');
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        document.body.classList.toggle('review-is-visible', entry.isIntersecting);
        if (entry.isIntersecting) resume('offscreen');
        else pause('offscreen');
      }, { threshold: 0.25 });
      pauseReasons.add('offscreen');
      observer.observe(carousel);
    }

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(updateExpandableButtons);
      slides.forEach((slide) => resizeObserver.observe(slide));
    } else {
      window.addEventListener('resize', updateExpandableButtons, { passive: true });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateExpandableButtons);

    updatePosition(0);
    window.requestAnimationFrame(updateExpandableButtons);
    startAutoplay();
  }

  initReviewCarousel();

  // split a plain-text element into word spans (skips elements with child tags handled separately)
  function splitWords(el) {
    const nodes = [...el.childNodes];
    el.innerHTML = '';
    nodes.forEach((node) => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach((chunk) => {
          if (chunk.trim() === '') { el.appendChild(document.createTextNode(chunk)); return; }
          const w = document.createElement('span'); w.className = 'sw';
          const inner = document.createElement('span'); inner.className = 'sw-i'; inner.textContent = chunk;
          w.appendChild(inner); el.appendChild(w);
        });
      } else if (node.nodeType === 1) {
        // keep element (e.g. .serif span) but wrap for reveal
        const w = document.createElement('span'); w.className = 'sw';
        node.classList.add('sw-i'); w.appendChild(node); el.appendChild(w);
      }
    });
    return el.querySelectorAll('.sw-i');
  }

  function panelIndexFromProgress(progress, panelCount) {
    if (panelCount <= 1) return 0;
    const normalizedProgress = Math.max(0, Math.min(1, progress));
    return Math.round(normalizedProgress * (panelCount - 1));
  }

  function createViewportPausedLoop(element, fromVars, toVars) {
    const loopVars = { ...toVars, ease: 'none', repeat: -1, paused: true };
    const tween = fromVars
      ? gsap.fromTo(element, fromVars, loopVars)
      : gsap.to(element, loopVars);

    if (!('IntersectionObserver' in window)) {
      tween.play();
      return tween;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) tween.resume();
      else tween.pause();
    });
    observer.observe(element);
    return tween;
  }

  waitForLibs().then(init);

  function init() {
    if (typeof gsap === 'undefined') { playLoader(); pageEnter(); return; }
    gsap.registerPlugin(ScrollTrigger);

    // Mark active nav link (homepage: Galeri is an in-page anchor → active when on index)
    const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.nav-links a, .mobile-menu a, .nav-cta').forEach((a) => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      const isMatch = href === page;
      a.classList.toggle('active', isMatch);
    });

    let lenis = null;
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      // expose scroll velocity for the WebGL shader
      lenis.on('scroll', (e) => { window.__qlifeScrollV = e.velocity || 0; });
    }

    // page-transition entrance (covers sub-pages arriving from internal nav)
    pageEnter();

    let nav = document.getElementById('nav');

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault(); closeMobileMenu();
        const navOffset = -((nav ? nav.offsetHeight : 62) + 2);
        if (lenis) lenis.scrollTo(el, { offset: navOffset, duration: 1.2 });
        else el.scrollIntoView({ behavior: 'smooth' });
      });
    });

    ScrollTrigger.create({ start: 'top -70', end: 99999, onUpdate: (s) => { if (!nav) nav = document.getElementById('nav'); if (nav) nav.classList.toggle('scrolled', s.scroll() > 70); } });

    // ---- HERO entrance (only on pages that have a .hero) ----
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      const heroWords = gsap.utils.toArray('.hero-title .w');
      gsap.set(heroWords, { yPercent: 115 });
      gsap.set('.hero-inner [data-hero]', { opacity: 0, y: 26 });
      gsap.set('.hero-video-strip', { opacity: 0, y: 44 });

      const runHero = () => {
        const tl = gsap.timeline();
        tl.to(heroWords, { yPercent: 0, duration: 1.15, ease: 'power4.out', stagger: 0.07 })
          .to('.hero-inner [data-hero]', { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.1 }, '-=0.7')
          .to('.hero-video-strip', { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, '-=0.55');
      };

      // loader plays, then hands off to the hero (signature moment)
      if (loader) playLoader(runHero); else runHero();

      // hero parallax on scroll
      if (!reduced) {
        gsap.to('.hero-inner', { yPercent: -22, opacity: 0.35, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
        gsap.to('.hero-video-strip', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      }
    } else if (loader) {
      playLoader();
    } else {
      finishPreloader();
    }

    // ---- section title word-split reveal (skip titles that use manual [data-line] children) ----
    gsap.utils.toArray('.stitle, .cta-title, .about-title, .why-big').forEach((title) => {
      if (title.querySelector('[data-line]')) return; // manual line reveal handles it
      const inner = splitWords(title);
      gsap.set(inner, { yPercent: 110 });
      ScrollTrigger.create({
        trigger: title, start: 'top 85%', once: true,
        onEnter: () => gsap.to(inner, { yPercent: 0, duration: 0.85, ease: 'power4.out', stagger: 0.035 }),
      });
    });

    // ---- generic reveals ----
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.set(el, { opacity: 0, y: 36 });
      const show = () => gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) setTimeout(show, 650);
      else ScrollTrigger.create({ trigger: el, start: 'top 86%', once: true, onEnter: show });
    });

    // ---- directional reveals (cards) ----
    gsap.utils.toArray('[data-dir]').forEach((el, i) => {
      const dir = el.dataset.dir === 'left' ? -50 : el.dataset.dir === 'right' ? 50 : 0;
      gsap.set(el, { opacity: 0, x: dir, y: 34 });
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(el, { opacity: 1, x: 0, y: 0, duration: 0.85, ease: 'power3.out' }) });
    });

    // ---- image clip-path reveal ----
    gsap.utils.toArray('[data-clip]').forEach((wrap) => {
      const img = wrap.querySelector('img');
      gsap.set(wrap, { clipPath: 'inset(100% 0 0 0)' });
      if (img) gsap.set(img, { scale: 1.3 });
      ScrollTrigger.create({ trigger: wrap, start: 'top 84%', once: true,
        onEnter: () => {
          gsap.to(wrap, { clipPath: 'inset(0% 0 0 0)', duration: 1.05, ease: 'power4.out' });
          if (img) gsap.to(img, { scale: 1, duration: 1.3, ease: 'power3.out' });
        } });
    });

    // ---- manual line reveals ([data-line]) — opacity + rise (no mask dependency) ----
    gsap.utils.toArray('[data-line]').forEach((el, i) => {
      gsap.set(el, { opacity: 0, y: 40 });
      const parent = el.closest('h1,h2,h3,p,blockquote') || el;
      ScrollTrigger.create({ trigger: parent, start: 'top 86%', once: true,
        onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.06 }) });
    });

    // ---- ozone rows stagger ----
    gsap.utils.toArray('[data-oz]').forEach((el, i) => {
      gsap.set(el, { opacity: 0, y: 24 });
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true,
        onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: (i % 3) * 0.08 }) });
    });

    // ---- OZONE JOURNEY: pinned horizontal scroll-telling ----
    const ozViewport = document.getElementById('ozjViewport');
    const ozTrack = document.getElementById('ozjTrack');
    if (ozViewport && ozTrack && !reduced && window.innerWidth > 820 && getComputedStyle(ozTrack).display === 'flex') {
      const panels = gsap.utils.toArray('.ozj-panel');
      const bar = document.getElementById('ozjBar');
      const cur = document.getElementById('ozjCur');
      const journeyBackdrop = document.querySelector('.ozj-hero-media');
      let activePanelIndex = -1;
      // Measure in viewport coordinates. Track padding/position must not enter the
      // calculation; otherwise the first panel starts offset on wide screens.
      const getOffsets = () => {
        const f = panels[0].getBoundingClientRect();
        const l = panels[panels.length - 1].getBoundingClientRect();
        const firstCenter = f.left + f.width / 2;
        const lastCenter = l.left + l.width / 2;
        return {
          startOffset: firstCenter - window.innerWidth / 2,
          distance: lastCenter - firstCenter,
        };
      };

      const offsets = getOffsets();
      gsap.set(ozTrack, { x: -offsets.startOffset });
      const journey = gsap.to(ozTrack, {
        x: () => -(offsets.startOffset + offsets.distance),
        ease: 'none',
        scrollTrigger: {
          trigger: ozViewport,
          start: 'top top',
          end: () => `+=${offsets.distance + window.innerHeight * 0.6}`,
          pin: ozViewport,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar) bar.style.transform = `scaleX(${self.progress})`;
            if (journeyBackdrop) {
              const backdropOpacity = 0.42 * Math.max(0, 1 - self.progress * 1.7);
              journeyBackdrop.style.opacity = backdropOpacity.toFixed(3);
              journeyBackdrop.style.transform = `translate3d(${(-self.progress * 36).toFixed(1)}px, 0, 0)`;
            }
            // Equal panel spacing makes scroll progress the active-panel source of truth.
            const nextPanelIndex = panelIndexFromProgress(self.progress, panels.length);
            if (nextPanelIndex !== activePanelIndex) {
              activePanelIndex = nextPanelIndex;
              panels.forEach((panel, index) => panel.classList.toggle('is-active', index === activePanelIndex));
              if (cur) cur.textContent = String(activePanelIndex + 1).padStart(2, '0');
            }
          },
        },
      });
    }

    // ---- counters ----
    gsap.utils.toArray('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const obj = { v: 0 };
      let done = false;
      const run = () => { if (done) return; done = true;
        gsap.to(obj, { v: end, duration: 1.9, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.floor(obj.v).toLocaleString(isEnglish ? 'en-US' : 'id-ID') + suffix; },
          onComplete: () => { el.textContent = end.toLocaleString(isEnglish ? 'en-US' : 'id-ID') + suffix; } }); };
      if (el.closest('.hero')) setTimeout(run, 950);
      else ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: run });
    });

    // ---- gallery marquee (two rows opposite direction) ----
    if (!reduced) {
      document.querySelectorAll('.grail-track').forEach((track, i) => {
        track.innerHTML += track.innerHTML;
        const dir = i % 2 === 0 ? -50 : 0;
        createViewportPausedLoop(track, { xPercent: i % 2 === 0 ? 0 : -50 }, { xPercent: dir, duration: 40 });
      });
    }

    // ---- top marquee ----
    const track = document.getElementById('marqueeTrack');
    if (track && !reduced) {
      track.innerHTML += track.innerHTML;
      createViewportPausedLoop(track, null, { xPercent: -50, duration: 24 });
    }

    // ---- cursor (dot + ring) ----
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (dot && hoverable) {
      let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, rx = mx, ry = my;
      addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; if (ring) ring.classList.add('show'); });
      gsap.ticker.add(() => {
        cx += (mx - cx) * 0.28; cy += (my - cy) * 0.28;
        dot.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
        if (ring) { rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16; ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; }
      });
      // hover growth on interactive elements
      document.querySelectorAll('a,button,[data-magnetic],.svc-card,.grail-item,.doc-card,.ozj-panel').forEach((el) => {
        el.addEventListener('mouseenter', () => { dot.classList.add('grow'); ring && ring.classList.add('grow'); });
        el.addEventListener('mouseleave', () => { dot.classList.remove('grow'); ring && ring.classList.remove('grow'); });
      });
    }

    // ---- magnetic ----
    if (hoverable) {
      document.querySelectorAll('[data-magnetic]').forEach((el) => {
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4 });
        });
        el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' }));
      });
    }

    // ---- section index counter (fixed, editorial) ----
    const sindex = document.getElementById('sindex');
    if (sindex) {
      const ozoneSection = document.querySelector('.ozone-journey');
      if (ozoneSection) {
        const updateOzoneIndexVisibility = () => {
          const rect = ozoneSection.getBoundingClientRect();
          document.body.classList.toggle('ozone-is-visible', rect.bottom > 0 && rect.top < window.innerHeight);
        };
        updateOzoneIndexVisibility();
        window.addEventListener('scroll', updateOzoneIndexVisibility, { passive: true });
        window.addEventListener('resize', updateOzoneIndexVisibility);
      }
      const sections = gsap.utils.toArray('main > section, main > .statement, main > .gallery');
      const total = String(sections.length).padStart(2, '0');
      sindex.querySelector('b').textContent = '01';
      sindex.innerHTML = `<b>01</b> / ${total}`;
      sections.forEach((sec, i) => {
        ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%',
          onToggle: (self) => {
            if (!self.isActive) return;
            const suppressSectionIndex = sec.classList.contains('review-comments') || sec.classList.contains('ozone-journey');
            sindex.style.opacity = suppressSectionIndex ? '0' : '1';
            sindex.innerHTML = `<b>${String(i+1).padStart(2,'0')}</b> / ${total}`;
          } });
      });
    }

    ScrollTrigger.refresh();
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }
})();
