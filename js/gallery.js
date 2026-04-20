/* ============================================================
   GALLERY PAGE — Standalone JS
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

  /* ── Gallery Variables ── */
  var galleryGrid = $('#galleryGrid');
  var galleryImages = [];

  /* ── Lightbox ── */
  var lightbox = $('#galleryLightbox');
  var lightboxImg = $('#lightboxImg');
  var lightboxCounter = $('#lightboxCounter');
  var galleryItems = [];
  var lightboxIndex = 0;

  function getGalleryImageUrl(el) {
    var bg = el.style.backgroundImage;
    return bg.replace(/url\(['"]?/, '').replace(/['"]?\)/, '').replace('w=400', 'w=1200');
  }

  function openLightbox(index) {
    lightboxIndex = index;
    var url = getGalleryImageUrl(galleryItems[index]);
    lightboxImg.src = url;
    lightboxCounter.textContent = (index + 1) + ' / ' + galleryItems.length;
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add('open'); });
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    setTimeout(function () {
      lightbox.hidden = true;
      lightboxImg.src = '';
      document.body.style.overflow = '';
    }, 300);
  }

  function lightboxNav(dir) {
    lightboxIndex = (lightboxIndex + dir + galleryItems.length) % galleryItems.length;
    lightboxImg.src = getGalleryImageUrl(galleryItems[lightboxIndex]);
    lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + galleryItems.length;
  }

  function initLightboxBindings() {
    galleryItems = $$('.gallery-item');
    galleryItems.forEach(function (item, i) {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', 'View photo ' + (i + 1));
      item.addEventListener('click', function () { openLightbox(i); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });
    });
  }

  $('#lightboxClose').addEventListener('click', closeLightbox);
  $('#lightboxPrev').addEventListener('click', function () { lightboxNav(-1); });
  $('#lightboxNext').addEventListener('click', function () { lightboxNav(1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  });

  /* ── Render Gallery ── */
  function renderGallery() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    galleryImages.forEach(function (img) {
      var item = document.createElement('div');
      item.className = img.hidden ? 'gallery-item gallery-hidden' : 'gallery-item';
      item.style.backgroundImage = "url('" + img.imageUrl + "')";
      var seoImg = document.createElement('img');
      seoImg.src = img.imageUrl;
      seoImg.alt = img.altText || 'Northern Pakistan adventure photo — Gilgit Adventure Treks';
      seoImg.loading = 'lazy';
      seoImg.width = 400;
      seoImg.height = 300;
      seoImg.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
      item.appendChild(seoImg);
      galleryGrid.appendChild(item);
    });

    initLightboxBindings();
  }

  /* ── Gallery See More (show all on dedicated page) ── */
  var gallerySeeMore = $('#gallerySeeMore');
  if (gallerySeeMore && galleryGrid) {
    // Auto-expand on dedicated page
    galleryGrid.classList.add('expanded');
    gallerySeeMore.classList.add('active');
    gallerySeeMore.innerHTML = 'See Less <svg viewBox="0 0 24 24" width="18" height="18"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor"/></svg>';

    gallerySeeMore.addEventListener('click', function () {
      var expanded = galleryGrid.classList.toggle('expanded');
      gallerySeeMore.classList.toggle('active', expanded);
      gallerySeeMore.innerHTML = expanded
        ? 'See Less <svg viewBox="0 0 24 24" width="18" height="18"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor"/></svg>'
        : 'See More <svg viewBox="0 0 24 24" width="18" height="18"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor"/></svg>';
    });
  }

  /* ── Video Variables ── */
  var videoGrid = $('#videoGrid');
  var videos = [];

  /* ── Reels Viewer ── */
  var reelsViewer = $('#reelsViewer');
  var reelsTrack = $('#reelsTrack');
  var reelsCounter = $('#reelsCounter');
  var reelsClose = $('#reelsClose');

  function openReels(index) {
    if (!reelsViewer || !reelsTrack) return;
    reelsTrack.innerHTML = '';

    videos.forEach(function (v, i) {
      var slide = document.createElement('div');
      slide.className = 'reels-slide' + (i === index ? ' active' : '');
      slide.innerHTML = '<video src="' + v.videoUrl + '" controls playsinline' + (i === index ? ' autoplay' : '') + '></video>' +
        '<div class="reels-info"><h3>' + v.title + '</h3><p>' + (v.description || '') + '</p></div>';
      reelsTrack.appendChild(slide);
    });

    reelsCounter.textContent = (index + 1) + ' / ' + videos.length;
    reelsViewer.hidden = false;
    requestAnimationFrame(function () { reelsViewer.classList.add('open'); });
    document.body.style.overflow = 'hidden';
  }

  function closeReels() {
    if (!reelsViewer) return;
    reelsViewer.classList.remove('open');
    reelsTrack.querySelectorAll('video').forEach(function (v) { v.pause(); });
    setTimeout(function () {
      reelsViewer.hidden = true;
      reelsTrack.innerHTML = '';
      document.body.style.overflow = '';
    }, 300);
  }

  if (reelsClose) reelsClose.addEventListener('click', closeReels);

  /* ── Render Videos ── */
  function renderVideos() {
    if (!videoGrid) return;
    videoGrid.innerHTML = '';

    videos.forEach(function (v, index) {
      var tagClass = v.tag === 'Client Story' ? 'video-card-tag video-card-tag--client' : 'video-card-tag';
      var card = document.createElement('div');
      card.className = 'video-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.dataset.video = v.videoUrl;

      if (v.thumbnailUrl) {
        card.innerHTML = '<img src="' + v.thumbnailUrl + '" alt="' + v.title + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;">' +
          '<div class="video-card-overlay">' +
            '<span class="' + tagClass + '">' + v.tag + '</span>' +
            '<h3 class="video-card-title">' + v.title + '</h3>' +
            '<p class="video-card-desc">' + v.description + '</p>' +
          '</div>';
      } else {
        card.innerHTML = '<video muted loop playsinline preload="none"></video>' +
          '<div class="video-card-overlay">' +
            '<span class="' + tagClass + '">' + v.tag + '</span>' +
            '<h3 class="video-card-title">' + v.title + '</h3>' +
            '<p class="video-card-desc">' + v.description + '</p>' +
          '</div>';
      }

      card.addEventListener('click', function () { openReels(index); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReels(index); }
      });
      videoGrid.appendChild(card);
    });
  }

  /* ── Init — Fetch from API ── */
  async function init() {
    try {
      var data = await (window.__pageDataPromise || fetch('/api/page-data?need=gallery,videos').then(function(r){return r.json()}));
      if (!data) data = {};

      galleryImages = data.gallery || [];
      videos = data.videos || [];

      renderGallery();
      renderVideos();
    } catch (err) {
      console.warn('Failed to load gallery data:', err.message);
    }

    // Hide loading screen
    if (window.__hideLoader) window.__hideLoader();
  }

  init();
  $$('.reveal-up').forEach(function (el) { revealObserver.observe(el); });

})();
