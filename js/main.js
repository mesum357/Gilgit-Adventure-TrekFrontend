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
  // These are populated from database destinations by category (see init())
  let trekData = [];
  let safariData = [];
  let cultureData = [];

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
        entry.target.classList.remove('reveal-hidden');
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
    var tourDests = destinations.filter(d => d.category === 'tour');
    var filtered = (!regionFilter || regionFilter === 'all')
      ? tourDests
      : tourDests.filter(d => d.country && d.country.toLowerCase().includes(regionFilter.toLowerCase()));
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
      : trekData.filter(function(t) { return t.category === filter; });
    var visible = treksShowAll ? filtered : filtered.slice(0, SECTION_INITIAL_COUNT);
    grid.innerHTML = visible.map(function(item) {
      var tag = item.category === 'trek' ? 'Trek' : (item.category === 'meadow' ? 'Meadow' : 'Glacier');
      return '<div class="top-dest-card" role="button" tabindex="0" data-name="' + item.name + '">' +
        '<img src="' + item.image + '" alt="' + item.name + ' trek — Gilgit Adventure Treks" loading="lazy" width="600" height="400">' +
        '<div class="top-dest-overlay">' +
          '<span class="top-dest-tag">' + tag + '</span>' +
          '<h3 class="top-dest-name">' + item.name + '</h3>' +
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
          '<span class="top-dest-tag">Tour</span>' +
          '<h3 class="top-dest-name">' + item.name + '</h3>' +
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
      : cultureData.filter(function(c) { return c.category === filter; });
    var visible = cultureShowAll ? filtered : filtered.slice(0, SECTION_INITIAL_COUNT);
    grid.innerHTML = visible.map(function(item) {
      var tag = item.category === 'heritage' ? 'Heritage' : 'Fort';
      return '<div class="top-dest-card" role="button" tabindex="0" data-name="' + item.name + '">' +
        '<img src="' + item.image + '" alt="' + item.name + ' — Gilgit Adventure Treks" loading="lazy" width="600" height="400">' +
        '<div class="top-dest-overlay">' +
          '<span class="top-dest-tag">' + tag + '</span>' +
          '<h3 class="top-dest-name">' + item.name + '</h3>' +
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

  // Gallery filter tabs
  var galleryFilterTabs = $('#galleryFilterTabs');
  if (galleryFilterTabs) {
    galleryFilterTabs.addEventListener('click', function(e) {
      var tab = e.target.closest('.filter-tab');
      if (!tab) return;
      galleryFilterTabs.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      if (galleryGrid) galleryGrid.classList.remove('expanded');
      if (gallerySeeMore) {
        gallerySeeMore.classList.remove('active');
        gallerySeeMore.innerHTML = 'See More <svg viewBox="0 0 24 24" width="18" height="18"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor"/></svg>';
      }
      renderGallery(tab.dataset.gallery);
    });
  }

  var mapListShowAll = false;
  var MAP_LIST_INITIAL = 8;

  function renderMapList() {
    const mapDestList = $('#mapDestList');
    if (!mapDestList) return;
    var visible = mapListShowAll ? destinations : destinations.slice(0, MAP_LIST_INITIAL);
    mapDestList.innerHTML = visible.map(dest => `
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
    // See More / Show Less button
    var existingBtn = document.getElementById('mapListSeeMoreBtn');
    if (existingBtn) existingBtn.remove();
    if (destinations.length > MAP_LIST_INITIAL) {
      var btn = document.createElement('div');
      btn.id = 'mapListSeeMoreBtn';
      btn.style.cssText = 'text-align:center; padding:0.75rem 0;';
      btn.innerHTML = '<button class="btn btn-primary" style="padding:0.5rem 1.5rem; font-size:0.85rem;">' +
        (mapListShowAll ? 'Show Less' : 'See More (' + (destinations.length - MAP_LIST_INITIAL) + ' more)') + '</button>';
      mapDestList.parentNode.insertBefore(btn, mapDestList.nextSibling);
      btn.querySelector('button').addEventListener('click', function() {
        mapListShowAll = !mapListShowAll;
        renderMapList();
        if (!mapListShowAll) mapDestList.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
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
      if (dest.duration) {
        tourMeta.style.display = 'block';
        $('#metaDuration').textContent = dest.duration || '';
        $('#metaGroup').textContent = dest.groupSize || '';
        $('#metaDifficulty').textContent = dest.difficulty || '';
        $('#metaSeason').textContent = dest.bestSeason || '';
        $('#metaRoute').textContent = dest.route ? dest.route.join(' \u2192 ') : '';
        $('#metaRouteWrap').style.display = dest.route ? 'block' : 'none';
      } else {
        tourMeta.style.display = 'none';
      }
    }

    // Gallery thumbnails
    var gallerySection = $('#modalGallery');
    var galleryStrip = $('#modalGalleryStrip');
    if (gallerySection && galleryStrip) {
      if (dest.gallery && dest.gallery.length > 0) {
        galleryStrip.innerHTML = dest.gallery.map(function(url) {
          return '<img class="modal-gallery-thumb" src="' + url + '" alt="' + dest.name + ' gallery" loading="lazy">';
        }).join('');
        gallerySection.style.display = 'block';
        // Click thumbnail to swap main image
        galleryStrip.querySelectorAll('.modal-gallery-thumb').forEach(function(thumb) {
          thumb.addEventListener('click', function() {
            $('#modalImage').src = thumb.src;
            galleryStrip.querySelectorAll('.modal-gallery-thumb').forEach(function(t) { t.classList.remove('active'); });
            thumb.classList.add('active');
          });
        });
      } else {
        gallerySection.style.display = 'none';
        galleryStrip.innerHTML = '';
      }
    }

    // Day-by-Day Itinerary
    var itinerarySection = $('#modalItinerary');
    var itineraryList = $('#modalItineraryList');
    if (itinerarySection && itineraryList) {
      if (dest.itinerary && dest.itinerary.length > 0) {
        itineraryList.innerHTML = dest.itinerary.map(function(item) {
          return '<div class="itinerary-day">' +
            '<button class="itinerary-day-header" type="button" aria-expanded="false">' +
              '<span class="itinerary-day-badge">Day ' + item.day + '</span>' +
              '<span class="itinerary-day-title">' + item.title + '</span>' +
              '<svg class="itinerary-chevron" viewBox="0 0 24 24" width="18" height="18"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor"/></svg>' +
            '</button>' +
            '<div class="itinerary-day-body">' +
              '<p>' + item.description + '</p>' +
            '</div>' +
          '</div>';
        }).join('');
        itinerarySection.style.display = 'block';
        // Accordion toggle
        itineraryList.querySelectorAll('.itinerary-day-header').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var day = btn.parentElement;
            var isOpen = day.classList.contains('open');
            // Close all others
            itineraryList.querySelectorAll('.itinerary-day.open').forEach(function(d) { d.classList.remove('open'); d.querySelector('.itinerary-day-header').setAttribute('aria-expanded', 'false'); });
            if (!isOpen) {
              day.classList.add('open');
              btn.setAttribute('aria-expanded', 'true');
            }
          });
        });
      } else {
        itinerarySection.style.display = 'none';
        itineraryList.innerHTML = '';
      }
    }

    // Includes / Excludes
    var policiesSection = $('#modalPolicies');
    var includesList = $('#modalIncludes');
    var excludesList = $('#modalExcludes');
    if (policiesSection && includesList && excludesList) {
      var hasIncludes = dest.includes && dest.includes.length > 0;
      var hasExcludes = dest.excludes && dest.excludes.length > 0;
      if (hasIncludes || hasExcludes) {
        includesList.innerHTML = hasIncludes ? dest.includes.map(function(item) {
          return '<li><svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#2D6A4F"/></svg> ' + item + '</li>';
        }).join('') : '<li style="color:#94a3b8;">Not specified</li>';
        excludesList.innerHTML = hasExcludes ? dest.excludes.map(function(item) {
          return '<li><svg viewBox="0 0 24 24" width="14" height="14"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#dc2626"/></svg> ' + item + '</li>';
        }).join('') : '<li style="color:#94a3b8;">Not specified</li>';
        policiesSection.style.display = 'grid';
      } else {
        policiesSection.style.display = 'none';
        includesList.innerHTML = '';
        excludesList.innerHTML = '';
      }
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
    var defaultAvatarSvg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2394a3b8"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>');
    reviews.forEach(rev => {
      const card = createEl('div', { className: 'review-card' });
      const avatarSrc = rev.avatar || defaultAvatarSvg;
      card.innerHTML = `
        <div class="review-card-header">
          <img class="review-avatar" src="${avatarSrc}" alt="${rev.name}" loading="lazy">
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
    var bg = el.style.backgroundImage;
    return bg.replace(/url\(['"]?/, '').replace(/['"]?\)/, '');
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

  function renderGallery(filter) {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    var filtered = (!filter || filter === 'all')
      ? galleryImages
      : galleryImages.filter(function(img) { return img.category === filter; });

    filtered.forEach(function(img, index) {
      const item = createEl('div', {
        className: (index >= 11) ? 'gallery-item gallery-hidden' : 'gallery-item'
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
      card.addEventListener('click', () => openTeamModal(m));
      teamGrid.appendChild(card);
    });
  }

  function openTeamModal(m) {
    const overlay = $('#teamModal');
    if (!overlay) return;
    $('#teamModalImg').src = m.image;
    $('#teamModalImg').alt = m.name;
    $('#teamModalName').textContent = m.name;
    $('#teamModalRole').textContent = m.role;
    $('#teamModalBio').textContent = m.bio;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeTeamModal() {
    const overlay = $('#teamModal');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', e => {
    if (e.target.id === 'teamModalClose') closeTeamModal();
    if (e.target.id === 'teamModal') closeTeamModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeTeamModal();
  });

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

      const spinner = document.createElement('div');
      spinner.className = 'reel-spinner';
      spinner.innerHTML = '<div class="spinner-ring"></div>';

      video.addEventListener('waiting', () => { spinner.style.display = 'flex'; });
      video.addEventListener('canplay', () => { spinner.style.display = 'none'; });
      video.addEventListener('playing', () => { spinner.style.display = 'none'; });
      video.addEventListener('error', () => { spinner.style.display = 'none'; });

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
      slide.appendChild(spinner);
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

  const reelsUp = $('#reelsUp');
  const reelsDown = $('#reelsDown');
  if (reelsUp) {
    reelsUp.addEventListener('click', () => {
      const slides = reelsTrack.querySelectorAll('.reel-slide');
      const currentIndex = Math.round(reelsTrack.scrollTop / window.innerHeight);
      if (currentIndex > 0) slides[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (reelsDown) {
    reelsDown.addEventListener('click', () => {
      const slides = reelsTrack.querySelectorAll('.reel-slide');
      const currentIndex = Math.round(reelsTrack.scrollTop / window.innerHeight);
      if (currentIndex < slides.length - 1) slides[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
    });
  }

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
      'touristType': d.category
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
            // priceRange removed
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
  const maxSteps = 6;
  const bookingData = {
    destination: '',
    destinationName: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  };

  function initBookingWizard() {
    const nextBtn = $('#wizardNext');
    const prevBtn = $('#wizardPrev');

    if (!nextBtn || !prevBtn) return;

    // Next button
    nextBtn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        if (currentStep < maxSteps) {
          if (currentStep === 5) {
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

    // Date pickers
    var bookingCheckIn = $('#bookingCheckIn');
    var bookingCheckOut = $('#bookingCheckOut');
    if (bookingCheckIn && bookingCheckOut) {
      var today = new Date().toISOString().split('T')[0];
      bookingCheckIn.min = today;
      bookingCheckOut.min = today;

      bookingCheckIn.addEventListener('change', function() {
        bookingCheckOut.min = bookingCheckIn.value;
        updateDateSummary();
      });
      bookingCheckOut.addEventListener('change', updateDateSummary);

      function updateDateSummary() {
        var ci = bookingCheckIn.value;
        var co = bookingCheckOut.value;
        var summaryEl = $('#dateSummary');
        if (ci && co) {
          var days = Math.ceil((new Date(co) - new Date(ci)) / (1000 * 60 * 60 * 24));
          if (days > 0) {
            summaryEl.textContent = days + ' day' + (days > 1 ? 's' : '') + ' / ' + (days - 1) + ' night' + (days - 1 > 1 ? 's' : '') + ' trek';
            bookingData.checkIn = ci;
            bookingData.checkOut = co;
          } else {
            summaryEl.textContent = 'End date must be after start date';
          }
        }
      }
    }

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
      if (step === 5) {
        nextBtn.textContent = 'Confirm Booking';
      } else if (step === 6) {
        nextBtn.textContent = 'Start New Booking';
        nextBtn.onclick = () => window.location.reload();
      } else {
        nextBtn.textContent = 'Continue';
      }
    }

    // Update review if on step 5
    if (step === 5) {
      updateReview();
    }
  }

  function validateStep(step) {
    if (step === 1) {
      if (!bookingData.destination) {
        alert('Please select a destination');
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
    } else if (step === 4) {
      var name = $('#customerName')?.value?.trim();
      var email = $('#customerEmail')?.value?.trim();
      var phone = $('#customerPhone')?.value?.trim();
      var errorEl = $('#customerInfoError');
      if (!name || !email || !phone) {
        if (errorEl) { errorEl.textContent = 'Please fill in all fields.'; errorEl.style.display = 'block'; }
        return false;
      }
      if (errorEl) errorEl.style.display = 'none';
      bookingData.customerName = name;
      bookingData.customerEmail = email;
      bookingData.customerPhone = phone;
    }
    return true;
  }

  var bookingDestShowAll = false;
  var BOOKING_DEST_INITIAL = 6;

  function renderBookingDestinations() {
    const container = $('#bookingDestinations');
    if (!container || destinations.length === 0) return;

    var visible = bookingDestShowAll ? destinations : destinations.slice(0, BOOKING_DEST_INITIAL);

    container.innerHTML = visible.map(d => `
      <div class="booking-dest-card" data-id="${d.id}" data-name="${d.name}">
        <img src="${d.image}" alt="${d.name}" loading="lazy">
        <div class="booking-dest-info">
          <h4>${d.name}</h4>
          <p>${d.country}</p>
        </div>
      </div>
    `).join('');

    // See More / Show Less button
    var existingBtn = document.getElementById('bookingDestSeeMoreBtn');
    if (existingBtn) existingBtn.remove();
    if (destinations.length > BOOKING_DEST_INITIAL) {
      var btn = document.createElement('div');
      btn.id = 'bookingDestSeeMoreBtn';
      btn.style.cssText = 'text-align:center; margin-top:1rem;';
      btn.innerHTML = '<button class="btn btn-primary" style="padding:0.5rem 1.5rem; font-size:0.9rem;">' +
        (bookingDestShowAll ? 'Show Less' : 'See More (' + (destinations.length - BOOKING_DEST_INITIAL) + ' more)') + '</button>';
      container.parentNode.insertBefore(btn, container.nextSibling);
      btn.querySelector('button').addEventListener('click', function() {
        bookingDestShowAll = !bookingDestShowAll;
        renderBookingDestinations();
        if (!bookingDestShowAll) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // Click handlers — select and auto-advance to step 2
    $$('.booking-dest-card').forEach(card => {
      card.addEventListener('click', () => {
        $$('.booking-dest-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        bookingData.destination = card.dataset.id;
        bookingData.destinationName = card.dataset.name;
        goToStep(2);
      });
    });
  }

  function updateReview() {
    const reviewEl = $('#bookingReview');
    if (!reviewEl) return;

    const nights = Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24));

    reviewEl.innerHTML = `
      <div class="review-item">
        <span class="review-label">Name:</span>
        <span class="review-value">${bookingData.customerName}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Email:</span>
        <span class="review-value">${bookingData.customerEmail}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Phone:</span>
        <span class="review-value">${bookingData.customerPhone}</span>
      </div>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:0.75rem 0;">
      <div class="review-item">
        <span class="review-label">Destination:</span>
        <span class="review-value">${bookingData.destinationName}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Dates:</span>
        <span class="review-value">${new Date(bookingData.checkIn).toLocaleDateString()} &rarr; ${new Date(bookingData.checkOut).toLocaleDateString()}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Duration:</span>
        <span class="review-value">${nights} day${nights > 1 ? 's' : ''}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Travelers:</span>
        <span class="review-value">${bookingData.adults} adult${bookingData.adults > 1 ? 's' : ''}${bookingData.children > 0 ? ', ' + bookingData.children + ' child' + (bookingData.children > 1 ? 'ren' : '') : ''}</span>
      </div>
    `;
  }

  async function submitBooking() {
    var reference = 'TJT-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    try {
      var headers = { 'Content-Type': 'application/json' };
      var token = localStorage.getItem('user_token');
      if (token) headers['Authorization'] = 'Bearer ' + token;

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          reference: reference,
          destination: bookingData.destinationName,
          region: 'Pakistan',
          checkIn: bookingData.checkIn || null,
          checkOut: bookingData.checkOut || null,
          adults: bookingData.adults,
          children: bookingData.children,
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          customerPhone: bookingData.customerPhone
        })
      });

      if (!response.ok) throw new Error('Booking failed');
    } catch (err) {
      console.error('Booking error:', err);
    }

    $('#bookingRef').textContent = reference;
    goToStep(6);
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

  // --- localStorage cache helpers ---
  var CACHE_KEY = 'gat_pageData';
  var CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  function getCachedData() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var cached = JSON.parse(raw);
      if (Date.now() - cached.ts > CACHE_TTL) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return cached.data;
    } catch (e) { return null; }
  }

  function setCachedData(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data }));
    } catch (e) { /* quota exceeded — ignore */ }
  }

  function applyData(data) {
    destinations = data.destinations || [];
    destMap = {};
    destinations.forEach(function(d) { destMap[d.id] = d; });
    trekData = destinations.filter(function(d) { return d.category === 'trek' || d.category === 'meadow' || d.category === 'glacier'; });
    safariData = destinations.filter(function(d) { return d.category === 'safari'; });
    cultureData = destinations.filter(function(d) { return d.category === 'heritage' || d.category === 'fort'; });
    reviews = data.reviews || [];
    teamMembers = data.team || [
      { name: 'Nasir Ahmed', role: 'CEO, Gilgit Adventure Treks', bio: 'Nasir Ahmed is the founder and CEO of Gilgit Adventure Treks, bringing over 20 years of professional experience in trekking, mountaineering, and cultural tourism. Born and raised in the breathtaking mountains of Gilgit-Baltistan, he developed a deep passion for adventure and exploration from an early age. With international exposure, including professional training and guiding experience in Europe, Nasir Ahmed has led numerous successful expeditions across the Karakoram, Himalaya, and Hindu Kush ranges. Known for his strong leadership, attention to safety, and commitment to quality service, he has earned the trust of travelers from around the world.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' }
    ];
    videos = data.videos || [];
    galleryImages = data.gallery || [];
    if (data.settings) { applySiteSettings(data.settings); }
  }

  function renderAll() {
    var renders = [
      renderTopDestinations, renderTreks, renderSafaris, renderCulture,
      renderMapList, renderReviews, renderTeam, renderVideos, renderGallery,
      initBookingWizard, initAIPlanner, updateNavAuth, injectDestinationSchema
    ];
    renders.forEach(function(fn) {
      try { fn(); } catch (e) { console.error('Render error in ' + fn.name + ':', e); }
    });
  }

  function startRevealObservers() {
    try {
      $$('.reveal-up:not(.revealed)').forEach(function(el) {
        var rect = el.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
          // Only hide elements below the viewport — they animate on scroll
          el.classList.add('reveal-hidden');
        } else {
          // Elements already in viewport — mark as revealed immediately
          el.classList.add('revealed');
        }
        revealObserver.observe(el);
      });
      var heroStats = $('.hero-stats');
      if (heroStats) statsObserver.observe(heroStats);
    } catch (e) {
      console.error('Reveal observer error:', e);
    }
  }

  async function init() {
    var cached = getCachedData();

    // Start reveal observers immediately so sections animate as user scrolls
    startRevealObservers();

    // Instant render from cache if available
    if (cached) {
      applyData(cached);
      renderAll();
    }

    // Fetch fresh data from API
    try {
      var data = (window.__publicDataPromise && await window.__publicDataPromise) || await fetch('/api/page-data?need=destinations,reviews,team,videos,gallery').then(function(r) { return r.json(); });
      delete window.__publicDataPromise;

      // Save to cache for next visit
      setCachedData(data);

      // Re-render with fresh data (always, to pick up any changes)
      applyData(data);
      renderAll();
      // Re-observe any new elements added by renderAll
      startRevealObservers();
    } catch (err) {
      if (!cached) {
        console.warn('API not available, site will show empty sections:', err.message);
      }
    }
  }

  // Show auth icon immediately (no need to wait for API)
  updateNavAuth();

  init();

})();
