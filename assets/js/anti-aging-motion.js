/* Q-Life Anti-Aging — page-scoped motion choreography. */
(function () {
  "use strict";

  var page = document.querySelector(".aa-page");
  if (!page) return;

  var targets = ".aa-page .aaw-hero-copy > *, .aa-page .aaw-hero-main, .aa-page .aaw-hero-inset, .aa-page .aaw-philosophy-title, .aa-page .aaw-manifesto, .aa-page .aaw-team, .aa-page .aaw-section-head, .aa-page .aaw-feature, .aa-page .aaw-record, .aa-page .aaw-assessment-media, .aa-page .aaw-assessment-copy, .aa-page .aaw-peak-image, .aa-page .aaw-peak-inner > *, .aa-page .aaw-cta .cta-box";
  var initialized = false;

  function restore() {
    page.classList.remove("aaw-motion-ready");
    page.querySelectorAll(targets.replace(/\.aa-page /g, "")).forEach(function (el) {
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      el.style.removeProperty("visibility");
      el.style.removeProperty("will-change");
    });
  }

  function desktopScene(trigger, items, fromVars, exitVars) {
    var elements = gsap.utils.toArray(items, page);
    if (!elements.length) return;
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: "top 88%",
        end: "bottom 8%",
        scrub: 0.85,
        invalidateOnRefresh: true
      }
    });
    tl.fromTo(elements, fromVars, {
      opacity: 1, x: 0, y: 0, scale: 1,
      duration: 0.3, stagger: 0.035, ease: "power2.out"
    }).to({}, { duration: 0.48 }).to(elements, Object.assign({
      opacity: 0.58, duration: 0.22, stagger: 0.018, ease: "power1.inOut"
    }, exitVars));
  }

  function init() {
    if (initialized) return;
    if (!window.gsap || !window.ScrollTrigger) { restore(); return; }
    initialized = true;

    try {
      gsap.registerPlugin(ScrollTrigger);
      page.querySelectorAll("[data-pg-reveal]").forEach(function (el) {
        el.removeAttribute("data-pg-reveal");
        gsap.killTweensOf(el);
      });

      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) { restore(); ScrollTrigger.refresh(); return; }

      var touch = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
      var desktop = window.innerWidth >= 821 && !touch;

      if (desktop) {
        page.classList.add("aaw-motion-ready");
        var heroCopy = gsap.utils.toArray(".aaw-hero-copy > *", page);
        gsap.timeline({ defaults: { ease: "power3.out" } })
          .from(heroCopy, { opacity: 0, y: 28, duration: 0.82, stagger: 0.075, clearProps: "opacity,transform" }, 0.12)
          .from(".aaw-hero-main", { opacity: 0, scale: 1.045, duration: 1.25, clearProps: "opacity,transform" }, 0.18)
          .from(".aaw-hero-inset", { opacity: 0, x: 34, y: 20, duration: 0.9, clearProps: "opacity,transform" }, 0.72);

        desktopScene(".aaw-philosophy", ".aaw-philosophy-title, .aaw-manifesto", { opacity: 0, x: -30, y: 16 }, { x: -18, y: -12 });
        desktopScene(".aaw-philosophy", ".aaw-team", { opacity: 0, y: 42, scale: 1.018 }, { y: -22, scale: 0.992 });
        desktopScene(".aaw-treatments", ".aaw-section-head", { opacity: 0, x: 34, y: 10 }, { x: -16, y: -12 });
        desktopScene(".aaw-treatments", ".aaw-feature", { opacity: 0, x: -38, y: 22, scale: 1.012 }, { x: -18, y: -18, scale: 0.994 });
        desktopScene(".aaw-treatments", ".aaw-record", { opacity: 0, x: 34, y: 18 }, { x: 16, y: -16 });
        desktopScene(".aaw-assessment", ".aaw-assessment-media", { opacity: 0, x: -44, scale: 1.018 }, { x: -20, y: -10, scale: 0.994 });
        desktopScene(".aaw-assessment", ".aaw-assessment-copy", { opacity: 0, x: 42, y: 12 }, { x: 18, y: -14 });
        desktopScene(".aaw-peak", ".aaw-peak-image", { opacity: 0, x: 46, scale: 1.025 }, { x: 18, scale: 1.005 });
        desktopScene(".aaw-peak", ".aaw-peak-inner > *", { opacity: 0, x: -30, y: 14 }, { x: -18, y: -12 });
        desktopScene(".aaw-cta", ".aaw-cta .cta-box", { opacity: 0, y: 34, scale: 0.988 }, { y: -14, scale: 0.996 });
      } else {
        gsap.utils.toArray(".aaw-philosophy-title, .aaw-manifesto, .aaw-team, .aaw-section-head, .aaw-feature, .aaw-record, .aaw-assessment-media, .aaw-assessment-copy, .aaw-peak-image, .aaw-peak-inner > *, .aaw-cta .cta-box", page).forEach(function (el, index) {
          gsap.from(el, {
            opacity: 0,
            x: index % 2 ? 14 : -14,
            y: 16,
            duration: 0.72,
            ease: "power2.out",
            clearProps: "opacity,transform",
            scrollTrigger: { trigger: el, start: "top 90%", once: true }
          });
        });
      }

      var refresh = function () { ScrollTrigger.refresh(); };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
      window.addEventListener("load", refresh, { once: true });
    } catch (error) {
      restore();
      if (window.console) console.warn("Anti-aging motion restored after initialization failure.", error);
    }
  }

  var attempts = 0;
  function waitForMotion() {
    if (window.gsap && window.ScrollTrigger) { init(); return; }
    if (++attempts < 80) window.setTimeout(waitForMotion, 50);
    else restore();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", waitForMotion, { once: true });
  else waitForMotion();
  window.setTimeout(function () { if (!initialized) restore(); }, 5000);
}());
