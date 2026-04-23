/* ============================================================
   CULTURE & ACTIVITIES PAGE — Standalone JS
   ============================================================ */
(function () {
  'use strict';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }

  /* ── Navigation ── */
  var navbar = $('#navbar');
  var navToggle = $('#navToggle');
  var navLinks = $('#navLinks');

  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  navToggle.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  $$('.nav-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (link.classList.contains('nav-link--dropdown') && window.innerWidth <= 1256) {
        e.preventDefault();
        var parent = link.parentElement;
        $$('.nav-dropdown.open').forEach(function (d) { if (d !== parent) d.classList.remove('open'); });
        parent.classList.toggle('open');
        return;
      }
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      $$('.nav-dropdown.open').forEach(function (d) { d.classList.remove('open'); });
    });
  });

  /* ── Scroll Reveal ── */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  /* ── Culture Data (fetched from API) ── */
  var cultureData = [];

  /* ── Render Culture (shows ALL — no card limit on dedicated page) ── */
  function renderCulture(filter) {
    var grid = $('#cultureGrid');
    if (!grid) return;
    var filtered = (!filter || filter === 'all')
      ? cultureData
      : cultureData.filter(function (t) { return t.category === filter; });

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:#64748b;">' +
        '<p style="font-size:1.15rem;margin-bottom:0.5rem;">Cultural tours & activities coming soon.</p>' +
        '<p>Contact us on <a href="https://wa.me/923465001043" style="color:#2D6A4F;font-weight:600;">WhatsApp</a> to plan a custom experience.</p>' +
      '</div>';
      return;
    }

    grid.innerHTML = filtered.map(function (item) {
      var tag = item.duration || 'Cultural Tour';
      return '<div class="top-dest-card" role="button" tabindex="0" data-name="' + item.name + '">' +
        '<img src="' + item.image + '" alt="' + item.name + ' — Gilgit Adventure Treks" loading="lazy" width="600" height="400">' +
        '<div class="top-dest-overlay">' +
          '<span class="top-dest-tag">' + tag + '</span>' +
          '<h3 class="top-dest-name">' + item.name + '</h3>' +
          '' +
          '<div class="top-dest-meta">' +
            '<span class="top-dest-rating">' +
              '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/></svg> ' +
              item.rating +
            '</span>' +
          '</div>' +
          '<a href="book.html?destination=' + item.id + '" class="top-dest-btn">Book Now</a>' +
        '</div>' +
      '</div>';
    }).join('');

    if (filtered.length > 0 && !grid.classList.contains('revealed')) {
      grid.classList.add('revealed');
    }
  }

  /* ── Filter Tabs ── */
  var cultureFilterTabs = $('#cultureFilterTabs');
  if (cultureFilterTabs) {
    cultureFilterTabs.addEventListener('click', function (e) {
      var tab = e.target.closest('.filter-tab');
      if (!tab) return;
      cultureFilterTabs.querySelectorAll('.filter-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      renderCulture(tab.dataset.culture);
    });
  }

  /* ── Fetch from API & Init ── */
  fetch('/api/destinations')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      cultureData = data.filter(function (d) { return d.category === 'heritage' || d.category === 'fort'; });
      renderCulture();
    })
    .catch(function () {
      renderCulture();
    });

  $$('.reveal-up').forEach(function (el) { revealObserver.observe(el); });

})();
