/* Q-Life Palliative — calm Pallium motion choreography. */
(function () {
  "use strict";
  var page = document.querySelector(".pal-page");
  if (!page) return;
  var selector = ".plw-hero-copy > *, .plw-hero-media, .plw-thesis-copy, .plw-thesis-media, .plw-section-head, .plw-register-primary, .plw-ledger article, .plw-ther-stage, .plw-therapy-index li, .plw-peak-image, .plw-peak-copy > *, .plw-cta .cta-box";
  var initialized = false;
  function restore() {
    page.classList.remove("plw-motion-ready");
    page.querySelectorAll(selector).forEach(function (el) {
      ["opacity", "transform", "visibility", "will-change"].forEach(function (prop) { el.style.removeProperty(prop); });
    });
  }
  function scene(trigger, items, from, exit) {
    var elements = gsap.utils.toArray(items, page);
    if (!elements.length) return;
    gsap.timeline({ scrollTrigger: { trigger: trigger, start: "top 88%", end: "bottom 8%", scrub: 0.9, invalidateOnRefresh: true } })
      .fromTo(elements, from, { opacity: 1, x: 0, y: 0, scale: 1, duration: .32, stagger: .045, ease: "power2.out" })
      .to({}, { duration: .5 })
      .to(elements, Object.assign({ opacity: .62, duration: .2, stagger: .02, ease: "power1.inOut" }, exit));
  }
  function init() {
    if (initialized) return;
    if (!window.gsap || !window.ScrollTrigger) { restore(); return; }
    initialized = true;
    try {
      gsap.registerPlugin(ScrollTrigger);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { restore(); ScrollTrigger.refresh(); return; }
      var touch = matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
      var desktop = innerWidth > 820 && !touch;
      if (desktop) {
        page.classList.add("plw-motion-ready");
        gsap.timeline({ defaults: { ease: "power3.out" } })
          .from(".plw-hero-copy > *", { opacity: 0, y: 24, duration: .78, stagger: .075, clearProps: "opacity,transform" }, .12)
          .from(".plw-hero-media", { opacity: 0, x: 40, scale: 1.025, duration: 1.15, clearProps: "opacity,transform" }, .2);
        scene(".plw-thesis", ".plw-thesis-copy", { opacity: 0, x: -34, y: 14 }, { x: -16, y: -12 });
        scene(".plw-thesis", ".plw-thesis-media", { opacity: 0, x: 42, scale: 1.018 }, { x: 18, y: -12, scale: .995 });
        scene(".plw-mantle", ".plw-section-head, .plw-register-primary", { opacity: 0, x: -32, y: 18 }, { x: -16, y: -12 });
        scene(".plw-mantle", ".plw-ledger article", { opacity: 0, x: 36, y: 12 }, { x: 16, y: -10 });
        scene(".plw-therapies", ".plw-ther-stage", { opacity: 0, x: -38, scale: 1.012 }, { x: -18, y: -12 });
        scene(".plw-therapies", ".plw-therapy-index li", { opacity: 0, x: 34, y: 10 }, { x: 14, y: -10 });
        scene(".plw-peak", ".plw-peak-image, .plw-peak-copy > *", { opacity: 0, y: 28, scale: 1.018 }, { y: -14, scale: 1 });
        scene(".plw-cta", ".plw-cta .cta-box", { opacity: 0, y: 30, scale: .99 }, { y: -12, scale: .997 });
      } else {
        gsap.utils.toArray(".plw-thesis-copy, .plw-thesis-media, .plw-section-head, .plw-register-primary, .plw-ledger article, .plw-ther-stage, .plw-therapy-index li, .plw-peak-copy > *, .plw-cta .cta-box", page).forEach(function (el, i) {
          gsap.from(el, { opacity: 0, x: i % 2 ? 12 : -12, y: 16, duration: .7, ease: "power2.out", clearProps: "opacity,transform", scrollTrigger: { trigger: el, start: "top 91%", once: true } });
        });
      }
      var refresh = function () { ScrollTrigger.refresh(); };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
      addEventListener("load", refresh, { once: true });
    } catch (error) { restore(); if (console) console.warn("Palliative motion restored after initialization failure.", error); }
  }
  var attempts = 0;
  function wait() { if (window.gsap && window.ScrollTrigger) init(); else if (++attempts < 80) setTimeout(wait, 50); else restore(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wait, { once: true }); else wait();
  setTimeout(function () { if (!initialized) restore(); }, 5000);
}());
