/* =====================================================================
   Q-LIFE KLINIK — SUB-PAGE signature interactions.
   Lightweight, no deps beyond what main.js already provides.
   ===================================================================== */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function reveals() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-pg-reveal]"));
    if (!els.length) return;
    if (reduced) { els.forEach(function (e) { e.style.opacity = 1; }); return; }
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      els.forEach(function (el) {
        gsap.set(el, { opacity: 0, y: 30 });
        ScrollTrigger.create({
          trigger: el, start: "top 90%", once: true,
          onEnter: function () { gsap.to(el, { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" }); }
        });
      });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.style.transition = "opacity .7s,transform .7s"; e.target.style.opacity = 1; e.target.style.transform = "none"; io.unobserve(e.target); }
        });
      }, { threshold: 0.1 });
      els.forEach(function (el) { el.style.opacity = 0; el.style.transform = "translateY(30px)"; io.observe(el); });
    }
  }

  // ambient dust field for palliative + anti-aging heroes (simple dots, cheap)
  function dust(canvas, opts) {
    if (!canvas || reduced) return;
    var ctx = canvas.getContext("2d");
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, pts = [];
    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var n = Math.min(Math.round(W * H / 9000), 40);
      pts = [];
      for (var i = 0; i < n; i++) pts.push(spawn());
    }
    function spawn() {
      return { x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2.4,
        vy: -(0.1 + Math.random() * 0.4), a: 0.08 + Math.random() * 0.22, ph: Math.random() * Math.PI * 2 };
    }
    var raf;
    function tick(t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.y += p.vy; p.ph += 0.02;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        ctx.beginPath();
        ctx.fillStyle = opts.color;
        ctx.globalAlpha = p.a * (0.7 + 0.3 * Math.sin(p.ph));
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }
    resize();
    window.addEventListener("resize", resize);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(tick); }
        else { if (raf) { cancelAnimationFrame(raf); raf = null; } }
      });
    }, { threshold: 0 });
    io.observe(canvas);
  }

  function boot() {
    dust(document.getElementById("palDust"), { color: "rgba(183,121,31,.8)" });
    dust(document.getElementById("aaDust"), { color: "rgba(194,75,107,.7)" });
    reveals();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();