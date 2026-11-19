/* Shared sub-page template head/nav/footer builder for Q-Life Klinik.
   Keeps every inner page visually identical to index without duplicating markup by hand. */
window.QLIFE_SHELL = {
  nav: `
<div class="topbar"><div class="wrap">
  <div class="topbar-left">Ruko Villa Bukit Mas RE-8, Jl. Abdul Wahab Siamin, Surabaya</div>
  <div class="topbar-right"><a href="tel:+628****0281">+62 816 1500 0281</a><a href="mailto:qlifeklinik@gmail.com">qlifeklinik@gmail.com</a></div>
</div></div>
<header class="nav" id="nav"><div class="wrap">
  <a href="index.html" class="nav-brand" data-magnetic><img src="assets/img/headerlogo.webp" alt="Q-Life Klinik"></a>
  <nav class="nav-links">
    <a href="medical-ozone.html">Medical Ozone</a>
    <a href="palliative.html">Palliative</a>
    <a href="anti-aging.html">Anti-Aging</a>
    <a href="dokter.html">Dokter</a>
    <a href="tentang.html">Tentang</a>
    <a href="artikel.html">Artikel</a>
  </nav>
  <div class="lang-switch" aria-label="Pilihan bahasa"><span aria-current="page">ID</span><a href="en/index.html" lang="en" hreflang="en" data-lang-link="en">EN</a></div>
  <a href="kontak.html" class="nav-cta" data-magnetic>Buat Janji Temu</a>
  <button class="nav-burger" id="burger" aria-label="Menu"><span></span><span></span></button>
</div></header>
<div class="mobile-menu" id="mobileMenu">
  <button class="mm-close" id="mmClose" aria-label="Tutup menu">✕</button>
  <a href="medical-ozone.html">Medical Ozone</a>
  <a href="palliative.html">Palliative</a>
  <a href="anti-aging.html">Anti-Aging</a>
  <a href="dokter.html">Dokter</a>
  <a href="tentang.html">Tentang</a>
  <a href="artikel.html">Artikel</a>
  <div class="lang-switch lang-switch-mobile" aria-label="Pilihan bahasa"><span aria-current="page">ID</span><a href="en/index.html" lang="en" hreflang="en" data-lang-link="en">EN</a></div>
  <a href="kontak.html" class="mm-cta">Buat Janji Temu</a>
</div>`,
  footer: `
<footer class="footer"><div class="wrap">
  <div class="foot-top">
    <div class="foot-brand"><div class="foot-logo-pill"><img src="assets/img/footer-logo-on-dark.webp?v=footer-logo3" alt="Q-Life Klinik"></div><p>Pusat Terapi Komplementer, Paliatif &amp; Medical Ozone Therapy di Surabaya sejak 2004.</p></div>
    <div class="foot-col"><h5>Layanan</h5><a href="medical-ozone.html">Medical Ozone</a><a href="palliative.html">Palliative Care</a><a href="anti-aging.html">Anti-Aging</a></div>
    <div class="foot-col"><h5>Klinik</h5><a href="tentang.html">Tentang</a><a href="dokter.html">Dokter</a><a href="artikel.html">Artikel</a><a href="assets/docs/q-life-klinik-integrative-care-2026.pdf" download="Brosur-Q-Life-Klinik-2026.pdf" aria-label="Download brosur PDF Q-Life Klinik 2026">Download Brosur</a></div>
    <div class="foot-col"><h5>Kontak</h5><p>Ruko Villa Bukit Mas RE-8, Jl. Abdul Wahab Siamin, Dukuh Pakis, Surabaya</p><a href="tel:+628****0281">+62 816 1500 0281</a><a href="mailto:qlifeklinik@gmail.com">qlifeklinik@gmail.com</a></div>
  </div>
  <div class="foot-bottom"><span>© 2026 Q-Life Klinik. All rights reserved.</span><span>Surabaya, Indonesia</span></div>
</div></footer>`
};
window.QLIFE_SHELL_EN = {
  nav: `
<div class="topbar"><div class="wrap">
  <div class="topbar-left">Villa Bukit Mas Shophouse RE-8, Jl. Abdul Wahab Siamin, Surabaya</div>
  <div class="topbar-right"><a href="tel:+628****0281">+62 816 1500 0281</a><a href="mailto:qlifeklinik@gmail.com">qlifeklinik@gmail.com</a></div>
</div></div>
<header class="nav" id="nav"><div class="wrap">
  <a href="index.html" class="nav-brand" data-magnetic><img src="../assets/img/headerlogo.webp" alt="Q-Life Klinik"></a>
  <nav class="nav-links">
    <a href="medical-ozone.html">Medical Ozone</a>
    <a href="palliative.html">Palliative</a>
    <a href="anti-aging.html">Anti-Aging</a>
    <a href="dokter.html">Doctors</a>
    <a href="tentang.html">About</a>
    <a href="artikel.html">Articles</a>
  </nav>
  <div class="lang-switch" aria-label="Language selection"><a href="../index.html" lang="id" hreflang="id" data-lang-link="id">ID</a><span aria-current="page">EN</span></div>
  <a href="kontak.html" class="nav-cta" data-magnetic>Book an Appointment</a>
  <button class="nav-burger" id="burger" aria-label="Menu"><span></span><span></span></button>
</div></header>
<div class="mobile-menu" id="mobileMenu">
  <button class="mm-close" id="mmClose" aria-label="Close menu">✕</button>
  <a href="medical-ozone.html">Medical Ozone</a>
  <a href="palliative.html">Palliative</a>
  <a href="anti-aging.html">Anti-Aging</a>
  <a href="dokter.html">Doctors</a>
  <a href="tentang.html">About</a>
  <a href="artikel.html">Articles</a>
  <div class="lang-switch lang-switch-mobile" aria-label="Language selection"><a href="../index.html" lang="id" hreflang="id" data-lang-link="id">ID</a><span aria-current="page">EN</span></div>
  <a href="kontak.html" class="mm-cta">Book an Appointment</a>
</div>`,
  footer: `
<footer class="footer"><div class="wrap">
  <div class="foot-top">
    <div class="foot-brand"><div class="foot-logo-pill"><img src="../assets/img/footer-logo-on-dark.webp?v=footer-logo3" alt="Q-Life Klinik"></div><p>Complementary Therapy, Palliative Care &amp; Medical Ozone Therapy Center in Surabaya since 2004.</p></div>
    <div class="foot-col"><h5>Services</h5><a href="medical-ozone.html">Medical Ozone</a><a href="palliative.html">Palliative Care</a><a href="anti-aging.html">Anti-Aging</a></div>
    <div class="foot-col"><h5>Clinic</h5><a href="tentang.html">About</a><a href="dokter.html">Doctors</a><a href="artikel.html">Articles</a><a href="../assets/docs/q-life-klinik-integrative-care-2026.pdf" download="Q-Life-Klinik-Brochure-2026.pdf" aria-label="Download the official Q-Life Klinik 2026 brochure in PDF format">Download Brochure</a></div>
    <div class="foot-col"><h5>Contact</h5><p>Villa Bukit Mas Shophouse RE-8, Jl. Abdul Wahab Siamin, Dukuh Pakis, Surabaya</p><a href="tel:+628****0281">+62 816 1500 0281</a><a href="mailto:qlifeklinik@gmail.com">qlifeklinik@gmail.com</a></div>
  </div>
  <div class="foot-bottom"><span>© 2026 Q-Life Klinik. All rights reserved.</span><span>Surabaya, Indonesia</span></div>
</div></footer>`
};
document.addEventListener('DOMContentLoaded', () => {
  const isEnglish = document.documentElement.lang === 'en';
  const shell = isEnglish ? window.QLIFE_SHELL_EN : window.QLIFE_SHELL;
  const n = document.getElementById('shell-nav'); if (n) n.outerHTML = shell.nav;
  const f = document.getElementById('shell-footer'); if (f) f.outerHTML = shell.footer;
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('[data-lang-link="en"]').forEach(link => { link.href = `en/${page}`; });
  document.querySelectorAll('[data-lang-link="id"]').forEach(link => { link.href = `../${page}`; });
  // Mark the active nav link (desktop + mobile) based on the current page
  const setActiveNav = () => {
    document.querySelectorAll('.nav-links a, .mobile-menu a, .nav-cta').forEach(a => {
          const href = (a.getAttribute('href') || '').toLowerCase();
          const isMatch = href === page;
          a.classList.toggle('active', isMatch);
        });
  };
  setActiveNav();
  // inject page-transition + grain overlays on sub-pages (homepage already has them inline)
  if (!document.getElementById('pt')) {    const frag = document.createElement('div');
    frag.innerHTML = `
<div class="pt" id="pt"><span></span><span></span><span></span><span></span><span></span></div>
<div class="pt-brand" id="ptBrand"><span>Q-Life</span></div>
<div class="grain"><svg xmlns="http://www.w3.org/2000/svg"><filter id="gn2"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#gn2)"/></svg></div>
<div class="cursor-dot" id="cursorDot"></div>
<div class="cursor-ring" id="cursorRing"></div>`;
    while (frag.firstChild) document.body.appendChild(frag.firstChild);
  }
});
