/* ============================================================
   TREKS PAGE — Standalone JS
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

  /* ── Trek Data (same as main.js) ── */
  var trekData = [
    { name: 'Fairy Meadows', type: 'easy', image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&h=400&fit=crop', rating: 4.8, description: 'A lush green meadow with a stunning view of Nanga Parbat, the 9th highest mountain in the world.' },
    { name: 'Rakaposhi BC', type: 'easy', image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&h=400&fit=crop', rating: 4.7, description: 'Trek to the base camp of Rakaposhi (7,788m) through beautiful alpine meadows and glaciers.' },
    { name: 'Naltar Lakes', type: 'easy', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop', rating: 4.6, description: 'Crystal-clear lakes surrounded by pine forests at an altitude of 3,200m in Naltar Valley.' },
    { name: 'Rush Lake', type: 'easy', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop', rating: 4.5, description: 'One of the highest alpine lakes in the world at 4,694m, offering breathtaking panoramic views.' },
    { name: 'Borith Lake', type: 'easy', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop', rating: 4.4, description: 'A serene lake near Passu with views of Passu Cones and surrounding glaciers.' },
    { name: 'Patundas', type: 'easy', image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&h=400&fit=crop', rating: 4.5, description: 'A hidden meadow trek above Passu offering panoramic views of the Karakoram range.' },
    { name: 'Passu Glacier', type: 'easy', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop', rating: 4.6, description: 'Walk across the spectacular Passu Glacier and explore its dramatic ice formations.' },
    { name: 'K2 Base Camp', type: 'advanced', image: 'https://images.unsplash.com/photo-1585409677983-0f6c41128c4b?w=600&h=400&fit=crop', rating: 4.9, description: 'The ultimate trekking experience to the base of the world\'s second highest mountain (8,611m).' },
    { name: 'Nanga Parbat BC', type: 'advanced', image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&h=400&fit=crop', rating: 4.8, description: 'Trek to the base camp of the "Killer Mountain" — one of the most dramatic peaks on Earth.' },
    { name: 'Snow Lake', type: 'advanced', image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600&h=400&fit=crop', rating: 4.7, description: 'A vast glacial basin at 4,843m, one of the largest glacial systems outside the polar regions.' },
    { name: 'Gondogoro La', type: 'advanced', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=400&fit=crop', rating: 4.8, description: 'Cross the legendary 5,585m pass with views of K2, Broad Peak, and the Gasherbrum group.' },
    { name: 'Spantik BC', type: 'advanced', image: 'https://images.unsplash.com/photo-1515876305430-f06edab8282a?w=600&h=400&fit=crop', rating: 4.6, description: 'Trek to the base of the "Golden Peak" (7,027m) through stunning glacial valleys.' },
    { name: 'Biafo-Hispar', type: 'advanced', image: 'https://images.unsplash.com/photo-1491904768633-2b7e3e7fede5?w=600&h=400&fit=crop', rating: 4.7, description: 'Traverse two of the world\'s longest glaciers in an epic 7-day high-altitude crossing.' }
  ];

  /* ── Render Treks (shows ALL — no 8-card limit on dedicated page) ── */
  function renderTreks(filter) {
    var grid = $('#treksGrid');
    if (!grid) return;
    var filtered = (!filter || filter === 'all')
      ? trekData
      : trekData.filter(function (t) { return t.type === filter; });

    grid.innerHTML = filtered.map(function (item) {
      var tag = item.type === 'easy' ? 'Easy Trek' : 'Advanced Trek';
      return '<div class="top-dest-card" role="button" tabindex="0" data-name="' + item.name + '">' +
        '<img src="' + item.image + '" alt="' + item.name + ' trek — Gilgit Adventure Treks" loading="lazy" width="600" height="400">' +
        '<div class="top-dest-overlay">' +
          '<span class="top-dest-tag">' + tag + '</span>' +
          '<h3 class="top-dest-name">' + item.name + '</h3>' +
          '<p class="top-dest-region">' + item.description + '</p>' +
          '<div class="top-dest-meta">' +
            '<span class="top-dest-rating">' +
              '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/></svg> ' +
              item.rating +
            '</span>' +
          '</div>' +
          '<a href="book.html" class="top-dest-btn">Book Now</a>' +
        '</div>' +
      '</div>';
    }).join('');

    if (filtered.length > 0 && !grid.classList.contains('revealed')) {
      grid.classList.add('revealed');
    }
  }

  /* ── Filter Tabs ── */
  var treksFilterTabs = $('#treksFilterTabs');
  if (treksFilterTabs) {
    treksFilterTabs.addEventListener('click', function (e) {
      var tab = e.target.closest('.filter-tab');
      if (!tab) return;
      treksFilterTabs.querySelectorAll('.filter-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      renderTreks(tab.dataset.trek);
    });
  }

  /* ── Init ── */
  renderTreks();
  $$('.reveal-up').forEach(function (el) { revealObserver.observe(el); });

  // Hide loading screen
  if (window.__hideLoader) window.__hideLoader();

})();
