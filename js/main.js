/* ============================================================
   THE JOURNEY TEAM — MAIN JAVASCRIPT
   ============================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------------
     DATA — loaded from API (fallbacks to empty arrays)
  -------------------------------------------------------- */
  let destinations = [];
  let destMap = {};  // id -> destination lookup for O(1) access
  let reviews = [];

  let videos = [];
  let galleryImages = [];
  let teamMembers = [];

  /* --------------------------------------------------------
     STATIC DATA — Treks, Safaris, Culture
  -------------------------------------------------------- */
  const trekData = [
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

  const safariData = [
    { name: 'Hunza Valley Safari', image: 'https://images.unsplash.com/photo-1597074866923-dc0589150a53?w=600&h=400&fit=crop', rating: 4.8, description: 'Drive along the Karakoram Highway through Hunza, visiting Karimabad, Passu, and Khunjerab Pass.' },
    { name: 'Skardu Valley Safari', image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&h=400&fit=crop', rating: 4.7, description: 'Explore Skardu\'s stunning lakes, forts, and desert landscapes by 4x4 jeep.' },
    { name: 'Deosai Jeep Safari', image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=600&h=400&fit=crop', rating: 4.9, description: 'Traverse the world\'s second-highest plateau — home to Himalayan brown bears and wildflowers.' },
    { name: 'Off-Road Adventures', image: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=600&h=400&fit=crop', rating: 4.5, description: 'Thrilling 4x4 jeep rides through rugged mountain passes and remote valleys.' },
    { name: 'Kalash Valley Safari', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop', rating: 4.6, description: 'Visit the unique Kalash people, their ancient festivals, and the beautiful valleys of Chitral.' }
  ];

  const cultureData = [
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

  /* --------------------------------------------------------
     UTILITIES
  -------------------------------------------------------- */
  function $(selector, context = document) {
    return context.querySelector(selector);
  }

  function $$(selector, context = document) {
    return [...context.querySelectorAll(selector)];
  }

  function createEl(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'className') el.className = val;
      else if (key === 'innerHTML') el.innerHTML = val;
      else if (key === 'textContent') el.textContent = val;
      else if (key.startsWith('data')) el.setAttribute(key.replace(/([A-Z])/g, '-$1').toLowerCase(), val);
      else el.setAttribute(key, val);
    }
    children.forEach(child => {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else el.appendChild(child);
    });
    return el;
  }

  function generateStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let html = '';
    for (let i = 0; i < full; i++) html += '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/></svg>';
    if (half) html += '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor" opacity="0.4"/></svg>';
    for (let i = 0; i < empty; i++) html += '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor" opacity="0.15"/></svg>';
    return html;
  }

  function formatPKR(amount) {
    return 'PKR ' + amount.toLocaleString('en-PK');
  }

  /* --------------------------------------------------------
     NAVIGATION
  -------------------------------------------------------- */
  const navbar = $('#navbar');
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  $$('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      // On mobile, toggle dropdown instead of closing menu
      if (link.classList.contains('nav-link--dropdown') && window.innerWidth <= 1256) {
        e.preventDefault();
        const parent = link.parentElement;
        // Close other open dropdowns on mobile
        $$('.nav-dropdown.open').forEach(d => { if (d !== parent) d.classList.remove('open'); });
        parent.classList.toggle('open');
        return;
      }
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      // Close any open dropdowns
      $$('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
    });
  });

  /* --------------------------------------------------------
     HERO CAROUSEL
  -------------------------------------------------------- */
  const heroSlides = $$('.hero-slide');
  const heroDots = $$('.carousel-dot');
  let currentSlide = 0;
  let heroInterval;

  function setHeroSlide(index) {
    heroSlides[currentSlide].classList.remove('active');
    heroDots[currentSlide].classList.remove('active');
    heroDots[currentSlide].setAttribute('aria-selected', 'false');
    currentSlide = index;
    heroSlides[currentSlide].classList.add('active');
    heroDots[currentSlide].classList.add('active');
    heroDots[currentSlide].setAttribute('aria-selected', 'true');
  }

  function nextHeroSlide() {
    setHeroSlide((currentSlide + 1) % heroSlides.length);
  }

  heroInterval = setInterval(nextHeroSlide, 6000);

  heroDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(heroInterval);
      setHeroSlide(i);
      heroInterval = setInterval(nextHeroSlide, 6000);
    });
  });

  /* --------------------------------------------------------
     STAT COUNTER ANIMATION
  -------------------------------------------------------- */
  function animateCounters() {
    $$('.stat-number').forEach(el => {
      const target = parseFloat(el.dataset.target);
      const isDecimal = target % 1 !== 0;
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;
        el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    });
  }

  /* --------------------------------------------------------
     SCROLL REVEAL (IntersectionObserver)
  -------------------------------------------------------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  // NOTE: .reveal-up observers are started inside init() AFTER applySiteSettings()
  // to prevent flash of old hardcoded content before dynamic settings are applied.

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  /* --------------------------------------------------------
     DESTINATION CARDS
  -------------------------------------------------------- */
  var topDestShowAll = false;
  var DEST_INITIAL_COUNT = 8;

  function renderTopDestinations(regionFilter) {
    const topGrid = $('#topDestGrid');
    if (!topGrid) return;
    var filtered = (!regionFilter || regionFilter === 'all')
      ? destinations
      : destinations.filter(d => d.country && d.country.toLowerCase().includes(regionFilter.toLowerCase()));
    var visible = topDestShowAll ? filtered : filtered.slice(0, DEST_INITIAL_COUNT);
    // Build all cards as a single HTML string (1 reflow instead of N)
    var html = visible.map(dest => `
      <div class="top-dest-card" role="button" tabindex="0" data-dest-id="${dest.id}">
        <img src="${dest.image}" alt="${dest.name} — top destination in ${dest.country} | Gilgit Adventure Treks" loading="lazy" width="600" height="400">
        <div class="top-dest-overlay">
          <span class="top-dest-tag">Top Destination</span>
          <h3 class="top-dest-name">${dest.name}</h3>
          <p class="top-dest-region">${dest.country}</p>
          <div class="top-dest-meta">
            <span class="top-dest-rating">
              <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/></svg>
              ${dest.rating}
            </span>
          </div>
          <button class="top-dest-btn" data-id="${dest.id}">Explore</button>
        </div>
      </div>
    `).join('');
    topGrid.innerHTML = html;
    // See More / Show Less button
    var existingBtn = document.getElementById('destSeeMoreBtn');
    if (existingBtn) existingBtn.remove();
    if (filtered.length > DEST_INITIAL_COUNT) {
      var btn = document.createElement('div');
      btn.id = 'destSeeMoreBtn';
      btn.style.cssText = 'text-align:center; margin-top:2rem;';
      btn.innerHTML = '<button class="btn btn-primary" style="padding:0.75rem 2.5rem; font-size:1rem;">' +
        (topDestShowAll ? 'Show Less' : 'See More (' + (filtered.length - DEST_INITIAL_COUNT) + ' more)') + '</button>';
      topGrid.parentNode.insertBefore(btn, topGrid.nextSibling);
      btn.querySelector('button').addEventListener('click', function() {
        topDestShowAll = !topDestShowAll;
        renderTopDestinations(regionFilter);
        if (!topDestShowAll) topGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    // Ensure grid is visible immediately after cards are rendered
    if (visible.length > 0 && !topGrid.classList.contains('revealed')) {
      topGrid.classList.add('revealed');
    }
  }

  // Event delegation for destination cards (1 listener instead of N)
  (function() {
    const topGrid = $('#topDestGrid');
    if (!topGrid) return;
    topGrid.addEventListener('click', function(e) {
      const card = e.target.closest('.top-dest-card');
      if (card) openModal(Number(card.dataset.destId));
    });
    topGrid.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.top-dest-card');
        if (card) { e.preventDefault(); openModal(Number(card.dataset.destId)); }
      }
    });
  })();

  // Destination filter tabs
  const destFilterTabs = $('#destFilterTabs');
  if (destFilterTabs) {
    destFilterTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      destFilterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      topDestShowAll = false;  // Reset to first 8 when switching filter
      renderTopDestinations(tab.dataset.region);
    });
  }

  /* --------------------------------------------------------
     TREKS, SAFARIS, CULTURE SECTIONS
  -------------------------------------------------------- */
  var treksShowAll = false;
  var safarisShowAll = false;
  var cultureShowAll = false;
  var SECTION_INITIAL_COUNT = 8;

  function renderTreks(filter) {
    var grid = $('#treksGrid');
    if (!grid) return;
    var filtered = (!filter || filter === 'all')
      ? trekData
      : trekData.filter(function(t) { return t.type === filter; });
    var visible = treksShowAll ? filtered : filtered.slice(0, SECTION_INITIAL_COUNT);
    grid.innerHTML = visible.map(function(item) {
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
          '<button class="top-dest-btn">Explore</button>' +
        '</div>' +
      '</div>';
    }).join('');
    // See More / Show Less
    var existingBtn = document.getElementById('treksSeeMoreBtn');
    if (existingBtn) existingBtn.remove();
    if (filtered.length > SECTION_INITIAL_COUNT) {
      var btn = document.createElement('div');
      btn.id = 'treksSeeMoreBtn';
      btn.style.cssText = 'text-align:center; margin-top:2rem;';
      btn.innerHTML = '<button class="btn btn-primary" style="padding:0.75rem 2.5rem; font-size:1rem;">' +
        (treksShowAll ? 'Show Less' : 'See More (' + (filtered.length - SECTION_INITIAL_COUNT) + ' more)') + '</button>';
      grid.parentNode.insertBefore(btn, grid.nextSibling);
      btn.querySelector('button').addEventListener('click', function() {
        treksShowAll = !treksShowAll;
        renderTreks(filter);
        if (!treksShowAll) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    if (visible.length > 0 && !grid.classList.contains('revealed')) {
      grid.classList.add('revealed');
    }
  }

  function renderSafaris() {
    var grid = $('#safarisGrid');
    if (!grid) return;
    grid.innerHTML = safariData.map(function(item) {
      return '<div class="top-dest-card" role="button" tabindex="0" data-name="' + item.name + '">' +
        '<img src="' + item.image + '" alt="' + item.name + ' — Gilgit Adventure Treks" loading="lazy" width="600" height="400">' +
        '<div class="top-dest-overlay">' +
          '<span class="top-dest-tag">Safari</span>' +
          '<h3 class="top-dest-name">' + item.name + '</h3>' +
          '<p class="top-dest-region">' + item.description + '</p>' +
          '<div class="top-dest-meta">' +
            '<span class="top-dest-rating">' +
              '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/></svg> ' +
              item.rating +
            '</span>' +
          '</div>' +
          '<button class="top-dest-btn">Explore</button>' +
        '</div>' +
      '</div>';
    }).join('');
    if (safariData.length > 0 && !grid.classList.contains('revealed')) {
      grid.classList.add('revealed');
    }
  }

  function renderCulture(filter) {
    var grid = $('#cultureGrid');
    if (!grid) return;
    var filtered = (!filter || filter === 'all')
      ? cultureData
      : cultureData.filter(function(c) { return c.type === filter; });
    var visible = cultureShowAll ? filtered : filtered.slice(0, SECTION_INITIAL_COUNT);
    grid.innerHTML = visible.map(function(item) {
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
          '<button class="top-dest-btn">Explore</button>' +
        '</div>' +
      '</div>';
    }).join('');
    // See More / Show Less
    var existingBtn = document.getElementById('cultureSeeMoreBtn');
    if (existingBtn) existingBtn.remove();
    if (filtered.length > SECTION_INITIAL_COUNT) {
      var btn = document.createElement('div');
      btn.id = 'cultureSeeMoreBtn';
      btn.style.cssText = 'text-align:center; margin-top:2rem;';
      btn.innerHTML = '<button class="btn btn-primary" style="padding:0.75rem 2.5rem; font-size:1rem;">' +
        (cultureShowAll ? 'Show Less' : 'See More (' + (filtered.length - SECTION_INITIAL_COUNT) + ' more)') + '</button>';
      grid.parentNode.insertBefore(btn, grid.nextSibling);
      btn.querySelector('button').addEventListener('click', function() {
        cultureShowAll = !cultureShowAll;
        renderCulture(filter);
        if (!cultureShowAll) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    if (visible.length > 0 && !grid.classList.contains('revealed')) {
      grid.classList.add('revealed');
    }
  }

  // Event delegation for treks/safaris/culture grids — open modal if matching destination
  ['treksGrid', 'safarisGrid', 'cultureGrid'].forEach(function(gridId) {
    var grid = document.getElementById(gridId);
    if (!grid) return;
    grid.addEventListener('click', function(e) {
      var card = e.target.closest('.top-dest-card');
      if (!card) return;
      var name = card.dataset.name;
      var dest = destinations.find(function(d) { return d.name === name; });
      if (dest) openModal(dest.id);
    });
    grid.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        var card = e.target.closest('.top-dest-card');
        if (!card) return;
        e.preventDefault();
        var name = card.dataset.name;
        var dest = destinations.find(function(d) { return d.name === name; });
        if (dest) openModal(dest.id);
      }
    });
  });

  // Treks filter tabs
  var treksFilterTabs = $('#treksFilterTabs');
  if (treksFilterTabs) {
    treksFilterTabs.addEventListener('click', function(e) {
      var tab = e.target.closest('.filter-tab');
      if (!tab) return;
      treksFilterTabs.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      treksShowAll = false;
      renderTreks(tab.dataset.trek);
    });
  }

  // Culture filter tabs
  var cultureFilterTabs = $('#cultureFilterTabs');
  if (cultureFilterTabs) {
    cultureFilterTabs.addEventListener('click', function(e) {
      var tab = e.target.closest('.filter-tab');
      if (!tab) return;
      cultureFilterTabs.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      cultureShowAll = false;
      renderCulture(tab.dataset.culture);
    });
  }

  function renderMapList() {
    const mapDestList = $('#mapDestList');
    if (!mapDestList) return;
    mapDestList.innerHTML = destinations.map(dest => `
      <div class="map-dest-item" role="button" tabindex="0" data-dest-id="${dest.id}">
        <div class="map-dest-pin">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/></svg>
        </div>
        <div class="map-dest-info">
          <div class="map-dest-name">${dest.name}</div>
          <div class="map-dest-detail">${dest.country}</div>
        </div>
      </div>
    `).join('');
    // Event delegation for map list
    mapDestList.addEventListener('click', function(e) {
      const item = e.target.closest('.map-dest-item');
      if (item) openModal(Number(item.dataset.destId));
    });
    mapDestList.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        const item = e.target.closest('.map-dest-item');
        if (item) { e.preventDefault(); openModal(Number(item.dataset.destId)); }
      }
    });
  }

  /* --------------------------------------------------------
     DESTINATION MODAL
  -------------------------------------------------------- */
  const modal = $('#destinationModal');
  const modalClose = $('#modalClose');

  function openModal(id) {
    const dest = destMap[id] || destinations.find(d => d.id === id);
    if (!dest) return;

    $('#modalImage').src = dest.image;
    $('#modalImage').alt = dest.name;
    $('#modalTitle').textContent = dest.name;
    $('#modalRating').innerHTML = `<span class="stars">${generateStars(dest.rating)}</span> ${dest.rating} (${dest.reviews.toLocaleString()} reviews)`;
    $('#modalDescription').textContent = dest.description;
    $('#modalHighlights').innerHTML = dest.highlights.map(h => `<span class="highlight-tag">${h}</span>`).join('');

    // Tour-specific meta
    const tourMeta = $('#modalTourMeta');
    if (tourMeta) {
      if (dest.category === 'tour' && dest.duration) {
        tourMeta.style.display = 'block';
        $('#metaDuration').textContent = dest.duration || '';
        $('#metaPrice').textContent = dest.priceUSD || '';
        $('#metaGroup').textContent = dest.groupSize || '';
        $('#metaDifficulty').textContent = dest.difficulty || '';
        $('#metaSeason').textContent = dest.bestSeason || '';
        $('#metaRoute').textContent = dest.route ? dest.route.join(' → ') : '';
        $('#metaRouteWrap').style.display = dest.route ? 'block' : 'none';
        $('#modalPrice').style.display = 'inline';
        $('#modalPrice').textContent = dest.priceUSD;
      } else {
        tourMeta.style.display = 'none';
        $('#modalPrice').style.display = 'none';
      }
    } else {
      $('#modalPrice').style.display = 'none';
    }

    $('#modalBookBtn').href = 'book.html?destination=' + dest.id;

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    setTimeout(() => {
      modal.hidden = true;
      document.body.style.overflow = '';
    }, 300);
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  /* --------------------------------------------------------
     REVIEWS CAROUSEL
  -------------------------------------------------------- */
  const reviewsTrack = $('#reviewsTrack');
  const reviewsPrev = $('#reviewsPrev');
  const reviewsNext = $('#reviewsNext');
  const reviewsDots = $('#reviewsDots');
  let reviewIndex = 0;

  function renderReviews() {
    reviewsTrack.innerHTML = '';
    reviews.forEach(rev => {
      const card = createEl('div', { className: 'review-card' });
      card.innerHTML = `
        <div class="review-card-header">
          <img class="review-avatar" src="${rev.avatar}" alt="${rev.name}" loading="lazy">
          <div>
            <div class="review-author">${rev.name}</div>
            <div class="review-meta">
              ${rev.location}
              ${rev.verified ? '<span class="verified-badge"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg> Verified</span>' : ''}
            </div>
          </div>
        </div>
        <div class="review-stars">${generateStars(rev.rating)}</div>
        <p class="review-text">"${rev.text}"</p>
        <span class="review-destination">${rev.destination}</span>
      `;
      reviewsTrack.appendChild(card);
    });
    reviewIndex = 0;
    updateReviewsCarousel();
  }

  function getReviewsPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function getMaxReviewIndex() {
    return Math.max(0, reviews.length - getReviewsPerView());
  }

  function updateReviewsCarousel() {
    const cardWidth = reviewsTrack.children[0]?.offsetWidth || 300;
    const gap = 24;
    reviewsTrack.style.transform = `translateX(-${reviewIndex * (cardWidth + gap)}px)`;

    const totalDots = getMaxReviewIndex() + 1;
    reviewsDots.innerHTML = '';
    for (let i = 0; i < totalDots; i++) {
      const dot = createEl('button', {
        className: `carousel-dot${i === reviewIndex ? ' active' : ''}`,
        'aria-label': `Review group ${i + 1}`
      });
      dot.addEventListener('click', () => {
        reviewIndex = i;
        updateReviewsCarousel();
      });
      reviewsDots.appendChild(dot);
    }
  }

  reviewsPrev.addEventListener('click', () => {
    reviewIndex = Math.max(0, reviewIndex - 1);
    updateReviewsCarousel();
  });

  reviewsNext.addEventListener('click', () => {
    reviewIndex = Math.min(getMaxReviewIndex(), reviewIndex + 1);
    updateReviewsCarousel();
  });

  window.addEventListener('resize', () => {
    reviewIndex = Math.min(reviewIndex, getMaxReviewIndex());
    updateReviewsCarousel();
  });

  /* --------------------------------------------------------
     NEWSLETTER — POST to API
  -------------------------------------------------------- */
  const newsletterForm = $('#newsletterForm');
  const newsletterSuccess = $('#newsletterSuccess');

  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#newsletterEmail').value;
    const nameInput = $('#newsletterName');
    const name = nameInput ? nameInput.value : '';
    if (email) {
      try {
        await fetch('/api/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name })
        });
      } catch (err) {
        // Silently fail — UI still shows success
      }
      newsletterForm.style.display = 'none';
      newsletterSuccess.hidden = false;
    }
  });

  /* --------------------------------------------------------
     GALLERY SEE MORE
  -------------------------------------------------------- */
  const gallerySeeMore = $('#gallerySeeMore');
  const galleryGrid = $('#galleryGrid');

  if (gallerySeeMore && galleryGrid) {
    gallerySeeMore.addEventListener('click', () => {
      const expanded = galleryGrid.classList.toggle('expanded');
      gallerySeeMore.classList.toggle('active', expanded);
      gallerySeeMore.innerHTML = expanded
        ? 'See Less <svg viewBox="0 0 24 24" width="18" height="18"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor"/></svg>'
        : 'See More <svg viewBox="0 0 24 24" width="18" height="18"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor"/></svg>';
    });
  }

  /* --------------------------------------------------------
     GALLERY LIGHTBOX
  -------------------------------------------------------- */
  const lightbox = $('#galleryLightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxCounter = $('#lightboxCounter');
  let galleryItems = [];
  let lightboxIndex = 0;

  function getGalleryImageUrl(el) {
    const bg = el.style.backgroundImage;
    return bg.replace(/url\(['"]?/, '').replace(/['"]?\)/, '').replace('w=400', 'w=1200');
  }

  function openLightbox(index) {
    lightboxIndex = index;
    const url = getGalleryImageUrl(galleryItems[index]);
    lightboxImg.src = url;
    lightboxCounter.textContent = `${index + 1} / ${galleryItems.length}`;
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    setTimeout(() => {
      lightbox.hidden = true;
      lightboxImg.src = '';
      document.body.style.overflow = '';
    }, 300);
  }

  function lightboxNav(dir) {
    lightboxIndex = (lightboxIndex + dir + galleryItems.length) % galleryItems.length;
    lightboxImg.src = getGalleryImageUrl(galleryItems[lightboxIndex]);
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${galleryItems.length}`;
  }

  function initLightboxBindings() {
    galleryItems = $$('.gallery-item');
    galleryItems.forEach((item, i) => {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', `View photo ${i + 1}`);
      item.addEventListener('click', () => openLightbox(i));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });
    });
  }

  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightboxPrev').addEventListener('click', () => lightboxNav(-1));
  $('#lightboxNext').addEventListener('click', () => lightboxNav(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  });

  function renderGallery() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    galleryImages.forEach(img => {
      const item = createEl('div', {
        className: img.hidden ? 'gallery-item gallery-hidden' : 'gallery-item'
      });
      item.style.backgroundImage = `url('${img.imageUrl}')`;
      // Hidden img tag for SEO crawlability (background-image isn't indexed)
      const seoImg = createEl('img', {
        src: img.imageUrl,
        alt: img.altText || 'Northern Pakistan adventure photo — Gilgit Adventure Treks',
        loading: 'lazy',
        width: '400',
        height: '300',
        style: 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);'
      });
      item.appendChild(seoImg);
      galleryGrid.appendChild(item);
    });

    initLightboxBindings();
  }

  function renderTeam() {
    const teamGrid = $('#teamGrid');
    if (!teamGrid) return;
    teamGrid.innerHTML = '';

    teamMembers.forEach(m => {
      const card = createEl('div', { className: 'team-card' });
      card.innerHTML = `
        <div class="team-card-img">
          <img src="${m.image}" alt="${m.name} — ${m.role} at Gilgit Adventure Treks" loading="lazy" width="300" height="300">
        </div>
        <div class="team-card-body">
          <h3 class="team-card-name">${m.name}</h3>
          <span class="team-card-role">${m.role}</span>
          <p class="team-card-bio">${m.bio}</p>
        </div>
      `;
      teamGrid.appendChild(card);
    });
  }

  /* --------------------------------------------------------
     VIDEO SHOWCASE
  -------------------------------------------------------- */

  // Preload thumbnails/videos when section is approaching (before user reaches it)
  const videoSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Preload all video cards (thumbnails + videos)
        $$('.video-card').forEach(card => {
          // Preload thumbnail images
          const img = card.querySelector('img');
          if (img && img.loading === 'lazy') {
            img.loading = 'eager'; // Force immediate loading
          }

          // Preload video previews (for cards without thumbnails)
          const vid = card.querySelector('video');
          const src = card.dataset.video;
          if (vid && src && !vid.src) {
            vid.src = src;
            vid.load(); // Preload video metadata and first frame
          }
        });
        // Stop observing once preloaded
        videoSectionObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '300px' }); // Trigger 300px before section enters viewport (earlier for better preloading)

  // Autoplay muted previews on cards when visible
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const card = entry.target;
      const vid = card.querySelector('video');
      const src = card.dataset.video;
      if (!vid || !src) return;

      if (entry.isIntersecting) {
        if (!vid.src || vid.src === '') vid.src = src;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, { threshold: 0.3 });

  /* ── Reels-Style Fullscreen Viewer ── */
  const reelsViewer = $('#reelsViewer');
  const reelsTrack = $('#reelsTrack');
  const reelsClose = $('#reelsClose');
  const reelsCounter = $('#reelsCounter');
  let reelsObserver = null;

  function openReels(startIndex) {
    if (!reelsViewer || videos.length === 0) return;

    reelsTrack.innerHTML = '';
    videos.forEach((v, i) => {
      const slide = document.createElement('div');
      slide.className = 'reel-slide' + (i !== startIndex ? ' paused' : '');
      slide.dataset.index = i;

      const video = document.createElement('video');
      video.playsInline = true;
      video.loop = true;
      video.preload = 'none';
      video.src = v.videoUrl;

      video.addEventListener('click', () => {
        if (video.paused) {
          video.play().catch(() => {});
          slide.classList.remove('paused');
        } else {
          video.pause();
          slide.classList.add('paused');
        }
      });

      const playBtn = document.createElement('div');
      playBtn.className = 'reel-play-btn';
      playBtn.innerHTML = '<svg viewBox="0 0 48 48" width="48" height="48"><path d="M19 15v18l15-9z" fill="white"/></svg>';

      const info = document.createElement('div');
      info.className = 'reel-info';
      info.innerHTML = '<h3>' + v.title + '</h3><p>' + v.description + '</p>';

      slide.appendChild(video);
      slide.appendChild(playBtn);
      slide.appendChild(info);
      reelsTrack.appendChild(slide);
    });

    reelsViewer.hidden = false;
    requestAnimationFrame(() => reelsViewer.classList.add('open'));
    document.body.style.overflow = 'hidden';

    const targetSlide = reelsTrack.children[startIndex];
    if (targetSlide) targetSlide.scrollIntoView({ behavior: 'instant' });

    updateReelsCounter(startIndex);

    const initialVideo = targetSlide?.querySelector('video');
    if (initialVideo) {
      initialVideo.play().catch(() => {});
      targetSlide.classList.remove('paused');
    }

    reelsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const slide = entry.target;
        const vid = slide.querySelector('video');
        if (!vid) return;
        if (entry.isIntersecting) {
          vid.play().catch(() => {});
          slide.classList.remove('paused');
          updateReelsCounter(parseInt(slide.dataset.index, 10));
        } else {
          vid.pause();
          slide.classList.add('paused');
        }
      });
    }, { root: reelsTrack, threshold: 0.7 });

    reelsTrack.querySelectorAll('.reel-slide').forEach(s => reelsObserver.observe(s));
  }

  function updateReelsCounter(index) {
    if (reelsCounter) reelsCounter.textContent = (index + 1) + ' / ' + videos.length;
  }

  function closeReels() {
    if (!reelsViewer) return;
    reelsTrack.querySelectorAll('video').forEach(v => { v.pause(); v.src = ''; });
    if (reelsObserver) { reelsObserver.disconnect(); reelsObserver = null; }
    reelsViewer.classList.remove('open');
    setTimeout(() => {
      reelsViewer.hidden = true;
      reelsTrack.innerHTML = '';
      document.body.style.overflow = '';
    }, 300);
  }

  if (reelsClose) reelsClose.addEventListener('click', closeReels);
  if (reelsViewer) {
    document.addEventListener('keydown', (e) => {
      if (!reelsViewer.hidden && e.key === 'Escape') closeReels();
    });
  }

  function renderVideos() {
    const videoGrid = $('#videoGrid');
    if (!videoGrid) return;
    videoGrid.innerHTML = '';

    videos.forEach((v, index) => {
      const tagClass = v.tag === 'Client Story' ? 'video-card-tag video-card-tag--client' : 'video-card-tag';
      const card = createEl('div', {
        className: 'video-card',
        role: 'button',
        tabindex: '0',
        'data-video': v.videoUrl
      });

      // Use thumbnail image for fast loading, fallback to video preview
      if (v.thumbnailUrl) {
        card.innerHTML = `
          <img src="${v.thumbnailUrl}" alt="${v.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
          <div class="video-card-overlay">
            <span class="${tagClass}">${v.tag}</span>
            <h3 class="video-card-title">${v.title}</h3>
            <p class="video-card-desc">${v.description}</p>
          </div>
        `;
      } else {
        card.innerHTML = `
          <video muted loop playsinline preload="none"></video>
          <div class="video-card-overlay">
            <span class="${tagClass}">${v.tag}</span>
            <h3 class="video-card-title">${v.title}</h3>
            <p class="video-card-desc">${v.description}</p>
          </div>
        `;
      }

      card.addEventListener('click', () => openReels(index));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReels(index); }
      });
      videoGrid.appendChild(card);
    });

    // Re-observe video cards for autoplay
    $$('.video-card', videoGrid).forEach(card => videoObserver.observe(card));

    // Observe videos section for preloading before user reaches it
    const videosSection = $('#videos');
    if (videosSection) {
      videoSectionObserver.observe(videosSection);
    }
  }

  /* --------------------------------------------------------
     ASYNC INIT — Fetch data from API, then render
  -------------------------------------------------------- */
  /* --------------------------------------------------------
     NAVBAR AUTH — login / user info toggle
  -------------------------------------------------------- */
  function updateNavAuth() {
    const container = document.getElementById('navAuthLinks');
    if (!container) return;

    const token = localStorage.getItem('user_token');
    const name = localStorage.getItem('user_name');

    if (token && name) {
      var avatar = localStorage.getItem('user_avatar');
      var avatarSrc = avatar || '';
      container.innerHTML =
        '<a href="profile.html" class="nav-link" style="display:inline-flex;align-items:center;padding:0.25rem;" title="' + name + '">' +
          (avatarSrc
            ? '<img src="' + avatarSrc + '" alt="' + name + '" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.4);" onerror="this.outerHTML=\'<svg viewBox=\\\'0 0 24 24\\\' width=\\\'24\\\' height=\\\'24\\\' style=\\\'fill:currentColor\\\'><path d=\\\'M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z\\\'/></svg>\'">'
            : '<svg viewBox="0 0 24 24" width="24" height="24" style="fill:currentColor;"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>') +
        '</a>';
    } else {
      container.innerHTML =
        '<a href="login.html" class="nav-link" style="display:inline-flex;align-items:center;padding:0.25rem;" title="Login">' +
          '<svg viewBox="0 0 24 24" width="24" height="24" style="fill:currentColor;"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>' +
        '</a>';
    }
  }

  /* --------------------------------------------------------
     SEO — Inject destination-level TouristAttraction schema
  -------------------------------------------------------- */
  function injectDestinationSchema() {
    if (!destinations.length && !reviews.length) return;
    const items = destinations.map(d => ({
      '@type': 'TouristAttraction',
      'name': d.name,
      'description': d.description,
      'image': d.image,
      'address': { '@type': 'PostalAddress', 'addressRegion': d.country, 'addressCountry': 'PK' },
      'isAccessibleForFree': false,
      'touristType': d.category,
      'offers': {
        '@type': 'Offer',
        'price': d.price,
        'priceCurrency': 'PKR',
        'availability': 'https://schema.org/InStock'
      }
    }));
    // Aggregate rating from reviews
    if (reviews.length > 0) {
      const avg = reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length;
      items.push({
        '@type': 'TravelAgency',
        'name': 'Gilgit Adventure Treks',
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': avg.toFixed(1),
          'reviewCount': reviews.length,
          'bestRating': '5',
          'worstRating': '1'
        }
      });
    }
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': items });
    document.head.appendChild(script);
  }

  /* --------------------------------------------------------
     APPLY SITE SETTINGS — Dynamic content from developer panel
  -------------------------------------------------------- */
  function applySiteSettings(s) {
    if (!s) return;

    // Branding
    if (s.branding) {
      const b = s.branding;
      if (b.logoUrl) {
        $$('.logo-img').forEach(img => {
          img.src = b.logoUrl;
          img.alt = b.companyName || '';
          if (b.logoSize) { img.style.width = b.logoSize + 'px'; img.style.height = b.logoSize + 'px'; }
          if (b.logoBorderRadius != null) img.style.borderRadius = b.logoBorderRadius + '%';
        });
      }
      if (b.companyName) {
        const logoSpan = $('.nav-logo span');
        if (logoSpan) logoSpan.textContent = b.companyName;
        document.title = b.companyName;
      }
      if (b.faviconUrl) {
        // Apply border-radius by rendering favicon through canvas
        if (b.faviconBorderRadius > 0) {
          const fImg = new Image();
          fImg.crossOrigin = 'anonymous';
          fImg.onload = function() {
            const size = 64;
            const c = document.createElement('canvas');
            c.width = size; c.height = size;
            const ctx = c.getContext('2d');
            const r = (b.faviconBorderRadius / 100) * (size / 2);
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(size - r, 0);
            ctx.quadraticCurveTo(size, 0, size, r);
            ctx.lineTo(size, size - r);
            ctx.quadraticCurveTo(size, size, size - r, size);
            ctx.lineTo(r, size);
            ctx.quadraticCurveTo(0, size, 0, size - r);
            ctx.lineTo(0, r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(fImg, 0, 0, size, size);
            const favicon = $('link[rel="icon"]');
            if (favicon) favicon.href = c.toDataURL('image/png');
          };
          fImg.src = b.faviconUrl;
        } else {
          const favicon = $('link[rel="icon"]');
          if (favicon) favicon.href = b.faviconUrl;
        }
      }
      if (b.companyShortName) {
        const footerLogoSpan = $('.footer-brand .nav-logo span');
        if (footerLogoSpan) footerLogoSpan.textContent = b.companyShortName;
      }
    }

    // Hero text
    if (s.hero) {
      const h = s.hero;
      const heroSubtitle = $('.hero-subtitle');
      const heroTitle = $('.hero-title');
      const heroDesc = $('.hero-description');
      if (heroSubtitle && h.subtitle) heroSubtitle.textContent = h.subtitle;
      if (heroTitle && h.title) heroTitle.innerHTML = h.title;
      if (heroDesc && h.description) heroDesc.textContent = h.description;
    }

    // Section headers
    if (s.sectionHeaders) {
      const sectionMap = {
        gallery: '#gallery',
        videos: '#videos',
        team: '#team',
        topDestinations: '#top-destinations',
        map: '#map',
        reviews: '#reviews'
      };
      for (const [key, selector] of Object.entries(sectionMap)) {
        const section = s.sectionHeaders[key];
        if (!section) continue;
        const el = $(selector);
        if (!el) continue;
        const tag = $('.section-tag', el);
        const title = $('.section-title', el);
        const desc = $('.section-description', el);
        if (tag && section.tag) tag.textContent = section.tag;
        if (title && section.title) title.textContent = section.title;
        if (desc && section.description) desc.textContent = section.description;
      }
    }

    // Footer
    if (s.footer) {
      const f = s.footer;
      const footerDesc = $('.footer-brand > p');
      if (footerDesc && f.description) footerDesc.textContent = f.description;
      const copyright = $('.footer-bottom p');
      if (copyright && f.copyrightText) copyright.innerHTML = f.copyrightText;
      // Update social links from SEO social profiles
      if (s.seo && s.seo.socialProfiles) {
        const sp = s.seo.socialProfiles;
        const socialLinks = $$('.social-links .social-link');
        const socialMap = ['facebook', 'instagram', 'whatsapp', 'youtube'];
        socialLinks.forEach((link, i) => {
          const platform = socialMap[i];
          if (platform === 'whatsapp' && s.contact && s.contact.whatsappUrl) {
            link.href = s.contact.whatsappUrl;
            link.setAttribute('rel', 'noopener noreferrer');
            link.setAttribute('target', '_blank');
          } else if (sp[platform]) {
            link.href = sp[platform];
            link.setAttribute('rel', 'noopener noreferrer');
            link.setAttribute('target', '_blank');
          }
        });
      }
    }

    // Newsletter
    if (s.newsletter) {
      const n = s.newsletter;
      const nlHeading = $('.newsletter-content h2');
      const nlDesc = $('.newsletter-content > p');
      const nlNote = $('.newsletter-note');
      if (nlHeading && n.heading) nlHeading.textContent = n.heading;
      if (nlDesc && n.description) nlDesc.textContent = n.description;
      if (nlNote && n.subscriberNote) nlNote.textContent = n.subscriberNote;
    }

    // Loading screen - DISABLED (always use default from index.html)
    // if (s.loadingScreen) {
    //   const lt = $('.loading-title');
    //   const ltxt = $('.loading-text');
    //   if (lt && s.loadingScreen.title) lt.textContent = s.loadingScreen.title;
    //   if (ltxt && s.loadingScreen.text) ltxt.textContent = s.loadingScreen.text;
    // }

    // SEO: Update meta tags from settings
    if (s.seo) {
      const seo = s.seo;
      if (seo.siteTitle) document.title = seo.siteTitle;
      const setMeta = (attr, val, content) => {
        const el = document.querySelector('meta[' + attr + '="' + val + '"]');
        if (el && content) el.setAttribute('content', content);
      };
      if (seo.metaDescription) setMeta('name', 'description', seo.metaDescription);
      if (seo.keywords) setMeta('name', 'keywords', seo.keywords);
      if (seo.canonicalUrl) {
        const canon = document.querySelector('link[rel="canonical"]');
        if (canon) canon.href = seo.canonicalUrl + '/';
        setMeta('property', 'og:url', seo.canonicalUrl + '/');
      }
      if (seo.siteTitle) {
        setMeta('property', 'og:title', seo.siteTitle);
        setMeta('name', 'twitter:title', seo.siteTitle);
      }
      if (seo.metaDescription) {
        setMeta('property', 'og:description', seo.metaDescription);
        setMeta('name', 'twitter:description', seo.metaDescription);
      }
      if (seo.ogImage) {
        const baseUrl = seo.canonicalUrl || '';
        const imgUrl = seo.ogImage.startsWith('http') ? seo.ogImage : baseUrl + '/' + seo.ogImage;
        setMeta('property', 'og:image', imgUrl);
        setMeta('name', 'twitter:image', imgUrl);
      }
      if (seo.geoLatitude && seo.geoLongitude) {
        setMeta('name', 'geo.position', seo.geoLatitude + ';' + seo.geoLongitude);
        setMeta('name', 'ICBM', seo.geoLatitude + ', ' + seo.geoLongitude);
      }

      // Update JSON-LD schema with dynamic SEO values
      const ldScript = document.querySelector('script[type="application/ld+json"]');
      if (ldScript) {
        try {
          const schema = JSON.parse(ldScript.textContent);
          const org = schema['@graph'] && schema['@graph'].find(n => n['@type'] === 'TravelAgency');
          if (org) {
            if (seo.founderName) org.founder = { '@type': 'Person', 'name': seo.founderName };
            if (seo.foundingYear) org.foundingDate = seo.foundingYear;
            if (seo.priceRange) org.priceRange = seo.priceRange;
            if (seo.officeAddress) org.address.streetAddress = seo.officeAddress;
            if (seo.geoLatitude) org.geo.latitude = seo.geoLatitude;
            if (seo.geoLongitude) org.geo.longitude = seo.geoLongitude;
            // Social profiles
            const profiles = seo.socialProfiles || {};
            const sameAs = Object.values(profiles).filter(v => v && v.trim());
            if (sameAs.length > 0) org.sameAs = sameAs;
            if (s.contact && s.contact.phone) org.telephone = s.contact.phone;
            if (s.contact && s.contact.email) org.email = s.contact.email;
          }
          ldScript.textContent = JSON.stringify(schema);
        } catch (e) { /* schema parse error — keep static version */ }
      }

      // Inject analytics & tracking scripts
      if (seo.ga4MeasurementId) {
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + seo.ga4MeasurementId;
        document.head.appendChild(gaScript);
        const gaInit = document.createElement('script');
        gaInit.textContent = 'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","' + seo.ga4MeasurementId + '");';
        document.head.appendChild(gaInit);
      }
      if (seo.gtmContainerId) {
        const gtmScript = document.createElement('script');
        gtmScript.textContent = "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','" + seo.gtmContainerId + "');";
        document.head.appendChild(gtmScript);
      }
      if (seo.fbPixelId) {
        const fbScript = document.createElement('script');
        fbScript.textContent = "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','" + seo.fbPixelId + "');fbq('track','PageView');";
        document.head.appendChild(fbScript);
      }
      if (seo.clarityId) {
        const clarityScript = document.createElement('script');
        clarityScript.textContent = "(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,'clarity','script','" + seo.clarityId + "');";
        document.head.appendChild(clarityScript);
      }

      // Inject verification meta tags
      if (seo.googleVerification) {
        const gvMeta = document.createElement('meta');
        gvMeta.name = 'google-site-verification';
        gvMeta.content = seo.googleVerification;
        document.head.appendChild(gvMeta);
      }
      if (seo.bingVerification) {
        const bvMeta = document.createElement('meta');
        bvMeta.name = 'msvalidate.01';
        bvMeta.content = seo.bingVerification;
        document.head.appendChild(bvMeta);
      }
    }
  }

  /* --------------------------------------------------------
     BOOKING WIZARD
  -------------------------------------------------------- */
  let currentStep = 1;
  const maxSteps = 5;
  const bookingData = {
    destination: '',
    destinationName: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    infants: 0
  };

  function initBookingWizard() {
    const nextBtn = $('#wizardNext');
    const prevBtn = $('#wizardPrev');

    if (!nextBtn || !prevBtn) return;

    // Next button
    nextBtn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        if (currentStep < maxSteps) {
          if (currentStep === 4) {
            submitBooking();
          } else {
            goToStep(currentStep + 1);
          }
        }
      }
    });

    // Previous button
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        goToStep(currentStep - 1);
      }
    });

    // Counter buttons
    $$('.counter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        const isPlus = btn.classList.contains('plus');
        const countEl = $(`#${target}Count`);
        let count = parseInt(countEl.textContent);

        if (isPlus) {
          count++;
        } else if (count > 0) {
          count--;
        }

        countEl.textContent = count;
        bookingData[target] = count;
      });
    });

    // Render destination cards
    renderBookingDestinations();
  }

  function goToStep(step) {
    // Update panels
    $$('.wizard-panel').forEach(panel => panel.classList.remove('active'));
    $(`.wizard-panel[data-panel="${step}"]`)?.classList.add('active');

    // Update step indicators
    $$('.wizard-step').forEach((s, i) => {
      const stepNum = i + 1;
      s.classList.remove('active');
      if (stepNum < step) {
        s.classList.add('completed');
      } else {
        s.classList.remove('completed');
      }
      if (stepNum === step) {
        s.classList.add('active');
      }
    });

    // Update connectors
    $$('.wizard-connector').forEach((c, i) => {
      if (i < step - 1) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    currentStep = step;

    // Update buttons
    const prevBtn = $('#wizardPrev');
    const nextBtn = $('#wizardNext');

    if (prevBtn) prevBtn.disabled = (step === 1);
    if (nextBtn) {
      if (step === 4) {
        nextBtn.textContent = 'Confirm Booking';
      } else if (step === 5) {
        nextBtn.textContent = 'Start New Booking';
        nextBtn.onclick = () => window.location.reload();
      } else {
        nextBtn.textContent = 'Continue';
      }
    }

    // Update review if on step 4
    if (step === 4) {
      updateReview();
    }
  }

  function validateStep(step) {
    if (step === 1) {
      if (!bookingData.destination) {
        alert('Please select a service');
        return false;
      }
    } else if (step === 2) {
      const checkIn = $('#bookingCheckIn')?.value;
      const checkOut = $('#bookingCheckOut')?.value;
      if (!checkIn || !checkOut) {
        alert('Please select start and end dates');
        return false;
      }
      if (new Date(checkIn) >= new Date(checkOut)) {
        alert('End date must be after start date');
        return false;
      }
      bookingData.checkIn = checkIn;
      bookingData.checkOut = checkOut;
    }
    return true;
  }

  function renderBookingDestinations() {
    const container = $('#bookingDestinations');
    if (!container || destinations.length === 0) return;

    container.innerHTML = destinations.map(d => `
      <div class="booking-dest-card" data-id="${d.id}" data-name="${d.name}">
        <img src="${d.image}" alt="${d.name}" loading="lazy">
        <div class="booking-dest-info">
          <h4>${d.name}</h4>
          <p>${d.country}</p>
        </div>
      </div>
    `).join('');

    // Click handlers
    $$('.booking-dest-card').forEach(card => {
      card.addEventListener('click', () => {
        $$('.booking-dest-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        bookingData.destination = card.dataset.id;
        bookingData.destinationName = card.dataset.name;
      });
    });
  }

  function updateReview() {
    const reviewEl = $('#bookingReview');
    if (!reviewEl) return;

    const nights = Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24));

    reviewEl.innerHTML = `
      <div class="review-item">
        <span class="review-label">Service:</span>
        <span class="review-value">${bookingData.destinationName}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Start Date:</span>
        <span class="review-value">${new Date(bookingData.checkIn).toLocaleDateString()}</span>
      </div>
      <div class="review-item">
        <span class="review-label">End Date:</span>
        <span class="review-value">${new Date(bookingData.checkOut).toLocaleDateString()}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Duration:</span>
        <span class="review-value">${nights} day${nights > 1 ? 's' : ''}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Crew Members:</span>
        <span class="review-value">${bookingData.adults}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Cameras:</span>
        <span class="review-value">${bookingData.children}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Editing Hours:</span>
        <span class="review-value">${bookingData.infants}</span>
      </div>
    `;
  }

  async function submitBooking() {
    const user = localStorage.getItem('user_token');
    if (!user) {
      alert('Please login to complete booking');
      window.location.href = '/login.html';
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user}`
        },
        body: JSON.stringify({
          destination: bookingData.destinationName,
          checkInDate: bookingData.checkIn,
          checkOutDate: bookingData.checkOut,
          adults: bookingData.adults,
          children: bookingData.children,
          infants: bookingData.infants,
          totalPrice: 0,
          status: 'pending'
        })
      });

      const data = await response.json();

      if (response.ok) {
        $('#bookingRef').textContent = data._id?.slice(-8).toUpperCase() || 'CONFIRMED';
        goToStep(5);
      } else {
        alert(data.message || 'Booking failed');
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('Failed to submit booking. Please try again.');
    }
  }

  /* --------------------------------------------------------
     AI TRIP/PROJECT PLANNER
  -------------------------------------------------------- */
  let selectedInterests = ['valleys'];

  function initAIPlanner() {
    const generateBtn = $('#plannerGenerate');
    const chatSendBtn = $('#plannerChatSendBtn');
    const chatInput = $('#plannerChatInput');
    const interestTags = $$('.planner-tag');

    if (!generateBtn) return;

    // Interest tag selection
    interestTags.forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.preventDefault();
        tag.classList.toggle('active');
        const interest = tag.dataset.interest;
        if (tag.classList.contains('active')) {
          if (!selectedInterests.includes(interest)) {
            selectedInterests.push(interest);
          }
        } else {
          selectedInterests = selectedInterests.filter(i => i !== interest);
        }
      });
    });

    // Generate plan button
    generateBtn.addEventListener('click', async () => {
      const budget = $('#plannerBudget')?.value || 'mid';
      const duration = $('#plannerDuration')?.value || 'week';
      const style = $('#plannerStyle')?.value || 'couple';

      if (selectedInterests.length === 0) {
        addChatMessage('ai', 'Please select at least one interest to generate a trek plan.');
        return;
      }

      // Show loading message
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<span style="opacity:0.7">Generating...</span>';
      addChatMessage('user', `Generate a ${budget} budget ${duration} trek plan for: ${selectedInterests.join(', ')}`);

      try {
        const response = await fetch('/api/ai/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            budget,
            duration,
            interests: selectedInterests,
            style
          })
        });

        const data = await response.json();

        if (response.ok) {
          addChatMessage('ai', data.plan);
        } else {
          addChatMessage('ai', 'Sorry, I couldn\'t generate a plan right now. Please try again.');
        }
      } catch (err) {
        console.error('Plan generation error:', err);
        addChatMessage('ai', 'Sorry, there was an error. Please try again.');
      } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 15l-4-4 1.41-1.41L11 14.17l5.59-5.59L18 10l-7 7z" fill="currentColor"/></svg> Generate My Trek';
      }
    });

    // Chat send button
    if (chatSendBtn && chatInput) {
      const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        addChatMessage('user', message);
        chatInput.value = '';

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
          });

          const data = await response.json();

          if (response.ok) {
            addChatMessage('ai', data.reply);
          } else {
            addChatMessage('ai', 'Sorry, I couldn\'t respond right now. Please try again.');
          }
        } catch (err) {
          console.error('Chat error:', err);
          addChatMessage('ai', 'Sorry, there was an error. Please try again.');
        }
      };

      chatSendBtn.addEventListener('click', sendMessage);
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
      });
    }
  }

  function addChatMessage(type, text) {
    const chatMessages = $('#plannerChatMessages');
    if (!chatMessages) return;

    const messageDiv = createEl('div', { className: `chat-message ${type}` });
    messageDiv.innerHTML = `
      <div class="chat-avatar">${type === 'ai' ? 'AI' : 'You'}</div>
      <div class="chat-bubble">
        <p>${text.replace(/\n/g, '<br>')}</p>
      </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function init() {
    try {
      // Reuse pre-fetched data (now includes videos & gallery for background loading)
      const data = (window.__publicDataPromise && await window.__publicDataPromise) || await fetch('/api/page-data?need=destinations,reviews,team,videos,gallery').then(r => r.json());
      delete window.__publicDataPromise;
      destinations = data.destinations || [];
      // Build O(1) lookup map
      destMap = {};
      destinations.forEach(d => { destMap[d.id] = d; });
      reviews = data.reviews || [];

      teamMembers = data.team || [];
      videos = data.videos || [];
      galleryImages = data.gallery || [];

      // Apply site settings before rendering
      if (data.settings) {
        applySiteSettings(data.settings);
      }
    } catch (err) {
      console.warn('API not available, site will show empty sections:', err.message);
    }

    // Render all sections immediately (videos & gallery load in background during page load)
    renderTopDestinations();
    renderTreks();
    renderSafaris();
    renderCulture();
    renderMapList();
    renderReviews();

    renderTeam();
    renderVideos();
    renderGallery();
    initBookingWizard();
    initAIPlanner();
    updateNavAuth();
    injectDestinationSchema();

    // Start reveal animations
    $$('.reveal-up').forEach(el => revealObserver.observe(el));
    const heroStats = $('.hero-stats');
    if (heroStats) statsObserver.observe(heroStats);

    // Hide loading screen fast
    const loader = document.getElementById('loadingScreen');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 600);
    }
  }

  init();

})();
