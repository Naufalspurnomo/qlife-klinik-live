/* =====================================================================
   Q-LIFE KLINIK — MEDICAL OZONE PAGE
   Signature interactions:
   1. Hero atmosphere: drifting O3 molecules on canvas (three-atom bodies).
   2. Mechanism canvas: oxygen particles rising / being absorbed.
   3. Nine-route explorer: click/hover a route -> stage panel swaps.
   4. Dose meter fill + scroll reveals.
   All guarded by prefers-reduced-motion and viewport width.
   ===================================================================== */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- O3 molecule field (hero + mechanism share a builder) ---------------- */
  function molecule(ctx, x, y, r, ang, alpha, color, glow) {
    // an ozone molecule: a central atom + two bonded atoms at ~117deg
    var bond = r * 1.7;
    var a1 = ang - 1.02, a2 = ang + 1.02;
    var cx = x, cy = y;
    var x1 = cx + Math.cos(a1) * bond, y1 = cy + Math.sin(a1) * bond;
    var x2 = cx + Math.cos(a2) * bond, y2 = cy + Math.sin(a2) * bond;
    ctx.save();
    ctx.globalAlpha = alpha;
    // bonds
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, r * 0.34);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x1, y1); ctx.moveTo(cx, cy); ctx.lineTo(x2, y2); ctx.stroke();
    // atoms
    function atom(ax, ay, ar) {
      if (glow) { ctx.shadowColor = color; ctx.shadowBlur = ar * 2.4; }
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(ax, ay, ar, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    atom(cx, cy, r);
    atom(x1, y1, r * 0.86);
    atom(x2, y2, r * 0.86);
    ctx.restore();
  }

  function fieldCanvas(canvas, opts) {
    if (!canvas || reduced) return;
    var ctx = canvas.getContext("2d");
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, mols = [];
    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var target = Math.round((W * H) / opts.density);
      target = Math.min(target, opts.max);
      mols = [];
      for (var i = 0; i < target; i++) mols.push(spawn());
    }
    function spawn() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: opts.rMin + Math.random() * (opts.rMax - opts.rMin),
        ang: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.006,
        vx: (Math.random() - 0.5) * opts.speed,
        vy: (opts.rise ? -(0.15 + Math.random() * opts.speed) : (Math.random() - 0.5) * opts.speed),
        a: opts.aMin + Math.random() * (opts.aMax - opts.aMin),
        ap: Math.random() * Math.PI * 2
      };
    }
    var raf;
    function tick(t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < mols.length; i++) {
        var m = mols[i];
        m.x += m.vx; m.y += m.vy; m.ang += m.spin; m.ap += 0.01;
        if (m.x < -30) m.x = W + 30; if (m.x > W + 30) m.x = -30;
        if (opts.rise) { if (m.y < -30) { m.y = H + 30; m.x = Math.random() * W; } }
        else { if (m.y < -30) m.y = H + 30; if (m.y > H + 30) m.y = -30; }
        var breath = m.a * (0.7 + 0.3 * Math.sin(m.ap));
        molecule(ctx, m.x, m.y, m.r, m.ang, breath, opts.color, opts.glow);
      }
      raf = requestAnimationFrame(tick);
    }
    resize();
    window.addEventListener("resize", resize);
    // only animate while visible
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(tick); }
        else { if (raf) { cancelAnimationFrame(raf); raf = null; } }
      });
    }, { threshold: 0 });
    io.observe(canvas);
  }

  /* ---------------- Nine-route explorer ---------------- */
  function explorer() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".ox-route-item"));
    var panels = Array.prototype.slice.call(document.querySelectorAll(".ox-route-panel"));
    if (!items.length || !panels.length) return;
    function select(idx) {
      items.forEach(function (it, i) { it.classList.toggle("is-active", i === idx); });
      panels.forEach(function (p, i) { p.classList.toggle("is-shown", i === idx); });
    }
    items.forEach(function (it, i) {
      var btn = it.querySelector(".ox-route-btn");
      if (!btn) return;
      btn.addEventListener("click", function () { select(i); });
      btn.addEventListener("mouseenter", function () { if (window.innerWidth > 1040) select(i); });
      btn.addEventListener("focus", function () { select(i); });
    });
    select(0);
  }

  /* ---------------- Dose meter fill ---------------- */
  function doseMeter() {
    var fill = document.querySelector(".ox-dose-fill");
    if (!fill) return;
    // fill maps 0.05%-0.5% within a 0-1% scale visual band
    var run = function () { fill.style.transition = "width 1.6s cubic-bezier(.22,1,.36,1)"; fill.style.width = "42%"; };
    if (reduced) { fill.style.width = "42%"; return; }
    setTimeout(run, 600);
  }

  /* ---------------- Scroll reveals (GSAP if present, else IO fallback) ---------------- */
  function reveals() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-ox-reveal]"));
    if (!els.length) return;
    if (reduced) { els.forEach(function (e) { e.style.opacity = 1; }); return; }
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      els.forEach(function (el) {
        gsap.set(el, { opacity: 0, y: 34 });
        ScrollTrigger.create({
          trigger: el, start: "top 88%", once: true,
          onEnter: function () { gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }); }
        });
      });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.style.transition = "opacity .8s,transform .8s"; e.target.style.opacity = 1; e.target.style.transform = "none"; io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      els.forEach(function (el) { el.style.opacity = 0; el.style.transform = "translateY(34px)"; io.observe(el); });
    }
  }

  function boot() {
    fieldCanvas(document.getElementById("oxAtmos"), {
      density: 26000, max: 26, rMin: 2.4, rMax: 5, speed: 0.22,
      aMin: 0.05, aMax: 0.16, color: "#1f6b5e", glow: false, rise: false
    });
    fieldCanvas(document.getElementById("oxMechCanvas"), {
      density: 15000, max: 46, rMin: 2, rMax: 4.6, speed: 0.3,
      aMin: 0.12, aMax: 0.4, color: "#7fe8db", glow: true, rise: true
    });
    explorer();
    doseMeter();
    reveals();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();