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
        entry.target.classList.remove('reveal-hidden');
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  /* ── Trek Data (fetched from API) ── */
  var trekData = [];

  /* ── Star Rating Generator ── */
  function generateStars(rating) {
    var full = Math.floor(rating);
    var half = rating % 1 >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;
    var html = '';
    for (var i = 0; i < full; i++) html += '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/></svg>';
    if (half) html += '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor" opacity="0.4"/></svg>';
    for (var i = 0; i < empty; i++) html += '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor" opacity="0.15"/></svg>';
    return html;
  }

  /* ── Render Treks (shows ALL — no 8-card limit on dedicated page) ── */
  function renderTreks(filter) {
    var grid = $('#treksGrid');
    if (!grid) return;
    var filtered = (!filter || filter === 'all')
      ? trekData
      : trekData.filter(function (t) { return t.difficulty === filter; });

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:#64748b;">' +
        '<p style="font-size:1.15rem;margin-bottom:0.5rem;">Trek packages coming soon.</p>' +
        '<p>Contact us on <a href="https://wa.me/923465001043" style="color:#2D6A4F;font-weight:600;">WhatsApp</a> to plan a custom trek.</p>' +
      '</div>';
      return;
    }

    grid.innerHTML = filtered.map(function (item) {
      var tag = (item.difficulty || 'Trek') + ' Trek';
      if (item.duration) tag = item.duration;
      return '<div class="top-dest-card" role="button" tabindex="0" data-id="' + (item.id || item._id) + '">' +
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
          '<a href="book.html?destination=' + (item.id || item._id) + '" class="top-dest-btn">Book Now</a>' +
        '</div>' +
      '</div>';
    }).join('');

    if (filtered.length > 0 && !grid.classList.contains('revealed')) {
      grid.classList.add('revealed');
    }
  }

  /* ── Modal ── */
  var modal = $('#destinationModal');
  var modalCloseBtn = $('#modalClose');

  function openModal(dest) {
    if (!dest) return;
    $('#modalImage').src = dest.image;
    $('#modalImage').alt = dest.name;
    $('#modalTitle').textContent = dest.name;
    $('#modalRating').innerHTML = '<span class="stars">' + generateStars(dest.rating) + '</span> ' + dest.rating + ' (' + (dest.reviews || 0).toLocaleString() + ' reviews)';
    $('#modalDescription').textContent = dest.description || '';

    // Highlights
    $('#modalHighlights').innerHTML = (dest.highlights || []).map(function (h) { return '<span class="highlight-tag">' + h + '</span>'; }).join('');

    // Tour meta
    var tourMeta = $('#modalTourMeta');
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

    // Gallery
    var gallerySection = $('#modalGallery');
    var galleryStrip = $('#modalGalleryStrip');
    if (dest.gallery && dest.gallery.length > 0) {
      galleryStrip.innerHTML = dest.gallery.map(function (url) {
        return '<img class="modal-gallery-thumb" src="' + url + '" alt="' + dest.name + ' gallery" loading="lazy">';
      }).join('');
      gallerySection.style.display = 'block';
      galleryStrip.querySelectorAll('.modal-gallery-thumb').forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          $('#modalImage').src = thumb.src;
          galleryStrip.querySelectorAll('.modal-gallery-thumb').forEach(function (t) { t.classList.remove('active'); });
          thumb.classList.add('active');
        });
      });
    } else {
      gallerySection.style.display = 'none';
      galleryStrip.innerHTML = '';
    }

    // Itinerary
    var itinSection = $('#modalItinerarySection');
    var itinList = $('#modalItineraryList');
    if (dest.itinerary && dest.itinerary.length > 0) {
      itinList.innerHTML = dest.itinerary.map(function (item) {
        return '<div class="itinerary-day">' +
          '<button class="itinerary-day-header" type="button" aria-expanded="false">' +
            '<span class="itinerary-day-badge">Day ' + item.day + '</span>' +
            '<span class="itinerary-day-title">' + item.title + '</span>' +
            '<svg class="itinerary-chevron" viewBox="0 0 24 24" width="18" height="18"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor"/></svg>' +
          '</button>' +
          '<div class="itinerary-day-body"><p>' + item.description + '</p></div>' +
        '</div>';
      }).join('');
      itinSection.style.display = 'block';
      itinList.querySelectorAll('.itinerary-day-header').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var day = btn.parentElement;
          var isOpen = day.classList.contains('open');
          itinList.querySelectorAll('.itinerary-day.open').forEach(function (d) { d.classList.remove('open'); d.querySelector('.itinerary-day-header').setAttribute('aria-expanded', 'false'); });
          if (!isOpen) { day.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
        });
      });
    } else {
      itinSection.style.display = 'none';
      itinList.innerHTML = '';
    }

    // Includes / Excludes
    var policiesSection = $('#modalPolicies');
    var incEl = $('#modalIncludes');
    var excEl = $('#modalExcludes');
    var hasInc = dest.includes && dest.includes.length > 0;
    var hasExc = dest.excludes && dest.excludes.length > 0;
    if (hasInc || hasExc) {
      incEl.innerHTML = hasInc ? dest.includes.map(function (i) {
        return '<li><svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#2D6A4F"/></svg> ' + i + '</li>';
      }).join('') : '<li style="color:#94a3b8;">Not specified</li>';
      excEl.innerHTML = hasExc ? dest.excludes.map(function (i) {
        return '<li><svg viewBox="0 0 24 24" width="14" height="14"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#dc2626"/></svg> ' + i + '</li>';
      }).join('') : '<li style="color:#94a3b8;">Not specified</li>';
      policiesSection.style.display = 'grid';
    } else {
      policiesSection.style.display = 'none';
    }

    // Footer
    $('#modalPrice').style.display = 'none';
    $('#modalBookBtn').href = 'book.html?destination=' + (dest.id || dest._id);

    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add('open'); });
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    setTimeout(function () {
      modal.hidden = true;
      document.body.style.overflow = '';
    }, 300);
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  // Card click delegation
  var treksGrid = $('#treksGrid');
  if (treksGrid) {
    treksGrid.addEventListener('click', function (e) {
      if (e.target.closest('.top-dest-btn')) return; // let Book Now link work
      var card = e.target.closest('.top-dest-card');
      if (!card) return;
      var cardId = card.dataset.id;
      var dest = trekData.find(function (d) { return String(d.id || d._id) === String(cardId); });
      if (dest) openModal(dest);
    });
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

  /* ── Fetch from API & Init ── */
  fetch('/api/destinations')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      trekData = data.filter(function (d) { return d.category === 'trek'; });
      renderTreks();
    })
    .catch(function () {
      renderTreks();
    });

  $$('.reveal-up:not(.revealed)').forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight) {
      el.classList.add('reveal-hidden');
    } else {
      el.classList.add('revealed');
    }
    revealObserver.observe(el);
  });

})();
