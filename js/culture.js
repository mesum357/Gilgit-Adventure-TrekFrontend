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

  /* ── Culture Data (same as main.js) ── */
  var cultureData = [
    { name: 'Village Tours', type: 'cultural', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=400&fit=crop', rating: 4.6, description: 'Visit traditional mountain villages and experience the daily life of local communities.' },
    { name: 'Heritage Walks', type: 'cultural', image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&h=400&fit=crop', rating: 4.5, description: 'Walk through ancient forts, sacred sites, and centuries-old settlements of Gilgit-Baltistan.' },
    { name: 'Festivals & Events', type: 'cultural', image: 'https://images.unsplash.com/photo-1533669955142-6a73332af4db?w=600&h=400&fit=crop', rating: 4.8, description: 'Experience vibrant local festivals — from Shandur Polo to Harvest celebrations and Navroz.' },
    { name: 'Local Food Tours', type: 'cultural', image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&h=400&fit=crop', rating: 4.7, description: 'Taste authentic Northern Pakistani cuisine — from chapshoro to apricot dishes and local teas.' },
    { name: 'Handicraft Workshops', type: 'cultural', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop', rating: 4.4, description: 'Learn traditional crafts — gemstone cutting, wool weaving, and woodwork from local artisans.' },
    { name: 'Southern Pakistan Tours', type: 'cultural', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&h=400&fit=crop', rating: 4.5, description: 'Explore Lahore, Multan, and Mohenjo-daro — the rich cultural heritage of southern Pakistan.' },
    { name: 'Camping', type: 'adventure', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop', rating: 4.7, description: 'Camp under the stars in pristine mountain meadows with full gear and guided setups.' },
    { name: 'Photography Tours', type: 'adventure', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop', rating: 4.8, description: 'Capture stunning landscapes with expert photography guides at the best viewpoints.' },
    { name: 'Bird Watching', type: 'adventure', image: 'https://images.unsplash.com/photo-1470114716159-e389f8712fda?w=600&h=400&fit=crop', rating: 4.3, description: 'Spot rare Himalayan birds — golden eagles, snow cocks, and lammergeiers in their habitat.' },
    { name: 'Fishing Trips', type: 'adventure', image: 'https://images.unsplash.com/photo-1440778303588-435521a205bc?w=600&h=400&fit=crop', rating: 4.4, description: 'Fish for brown and rainbow trout in the crystal-clear rivers and streams of Gilgit-Baltistan.' },
    { name: 'Family Adventures', type: 'adventure', image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600&h=400&fit=crop', rating: 4.6, description: 'Kid-friendly adventures with easy hikes, boat rides, and nature walks for the whole family.' }
  ];

  /* ── Render Culture (shows ALL — no card limit on dedicated page) ── */
  function renderCulture(filter) {
    var grid = $('#cultureGrid');
    if (!grid) return;
    var filtered = (!filter || filter === 'all')
      ? cultureData
      : cultureData.filter(function (t) { return t.type === filter; });

    grid.innerHTML = filtered.map(function (item) {
      var tag = item.type === 'cultural' ? 'Cultural Tour' : 'Adventure Activity';
      return '<div class="top-dest-card" role="button" tabindex="0" data-name="' + item.name + '">' +
        '<img src="' + item.image + '" alt="' + item.name + ' — Gilgit Adventure Treks" loading="lazy" width="600" height="400">' +
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

  /* ── Init ── */
  renderCulture();
  $$('.reveal-up').forEach(function (el) { revealObserver.observe(el); });

  // Hide loading screen
  if (window.__hideLoader) window.__hideLoader();

})();
