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
  function renderGallery(filter) {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    var filtered = (!filter || filter === 'all')
      ? galleryImages
      : galleryImages.filter(function(img) { return img.category === filter; });

    filtered.forEach(function (img) {
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

  /* ── Gallery Filter Tabs ── */
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

  /* ── Video Observers (preload + autoplay, matching index page) ── */
  var videoSectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        $$('.video-card').forEach(function (card) {
          var img = card.querySelector('img');
          if (img && img.loading === 'lazy') img.loading = 'eager';
          var vid = card.querySelector('video');
          var src = card.dataset.video;
          if (vid && src && !vid.src) { vid.src = src; vid.load(); }
        });
        videoSectionObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '300px' });

  var videoObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var card = entry.target;
      var vid = card.querySelector('video');
      var src = card.dataset.video;
      if (!vid || !src) return;
      if (entry.isIntersecting) {
        if (!vid.src || vid.src === '') vid.src = src;
        vid.play().catch(function () {});
      } else {
        vid.pause();
      }
    });
  }, { threshold: 0.3 });

  /* ── Reels-Style Fullscreen Viewer (matching index page) ── */
  var reelsViewer = $('#reelsViewer');
  var reelsTrack = $('#reelsTrack');
  var reelsCounter = $('#reelsCounter');
  var reelsClose = $('#reelsClose');
  var reelsObserver = null;

  function openReels(startIndex) {
    if (!reelsViewer || videos.length === 0) return;

    reelsTrack.innerHTML = '';
    videos.forEach(function (v, i) {
      var slide = document.createElement('div');
      slide.className = 'reel-slide' + (i !== startIndex ? ' paused' : '');
      slide.dataset.index = i;

      var video = document.createElement('video');
      video.playsInline = true;
      video.loop = true;
      video.preload = 'none';
      video.src = v.videoUrl;

      video.addEventListener('click', function () {
        if (video.paused) {
          video.play().catch(function () {});
          slide.classList.remove('paused');
        } else {
          video.pause();
          slide.classList.add('paused');
        }
      });

      var playBtn = document.createElement('div');
      playBtn.className = 'reel-play-btn';
      playBtn.innerHTML = '<svg viewBox="0 0 48 48" width="48" height="48"><path d="M19 15v18l15-9z" fill="white"/></svg>';

      var info = document.createElement('div');
      info.className = 'reel-info';
      info.innerHTML = '<h3>' + v.title + '</h3><p>' + (v.description || '') + '</p>';

      slide.appendChild(video);
      slide.appendChild(playBtn);
      slide.appendChild(info);
      reelsTrack.appendChild(slide);
    });

    reelsViewer.hidden = false;
    requestAnimationFrame(function () { reelsViewer.classList.add('open'); });
    document.body.style.overflow = 'hidden';

    var targetSlide = reelsTrack.children[startIndex];
    if (targetSlide) targetSlide.scrollIntoView({ behavior: 'instant' });

    updateReelsCounter(startIndex);

    var initialVideo = targetSlide ? targetSlide.querySelector('video') : null;
    if (initialVideo) {
      initialVideo.play().catch(function () {});
      targetSlide.classList.remove('paused');
    }

    reelsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var slide = entry.target;
        var vid = slide.querySelector('video');
        if (!vid) return;
        if (entry.isIntersecting) {
          vid.play().catch(function () {});
          slide.classList.remove('paused');
          updateReelsCounter(parseInt(slide.dataset.index, 10));
        } else {
          vid.pause();
          slide.classList.add('paused');
        }
      });
    }, { root: reelsTrack, threshold: 0.7 });

    reelsTrack.querySelectorAll('.reel-slide').forEach(function (s) { reelsObserver.observe(s); });
  }

  function updateReelsCounter(index) {
    if (reelsCounter) reelsCounter.textContent = (index + 1) + ' / ' + videos.length;
  }

  function closeReels() {
    if (!reelsViewer) return;
    reelsTrack.querySelectorAll('video').forEach(function (v) { v.pause(); v.src = ''; });
    if (reelsObserver) { reelsObserver.disconnect(); reelsObserver = null; }
    reelsViewer.classList.remove('open');
    setTimeout(function () {
      reelsViewer.hidden = true;
      reelsTrack.innerHTML = '';
      document.body.style.overflow = '';
    }, 300);
  }

  if (reelsClose) reelsClose.addEventListener('click', closeReels);
  if (reelsViewer) {
    document.addEventListener('keydown', function (e) {
      if (!reelsViewer.hidden && e.key === 'Escape') closeReels();
    });
  }

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

    // Observe video cards for autoplay
    $$('.video-card', videoGrid).forEach(function (card) { videoObserver.observe(card); });

    // Observe videos section for preloading before user reaches it
    var videosSection = $('#videos');
    if (videosSection) videoSectionObserver.observe(videosSection);
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

    // Start reveal animations after rendering
    $$('.reveal-up').forEach(function (el) { revealObserver.observe(el); });

    // Hide loading screen
    if (window.__hideLoader) window.__hideLoader();
  }

  init();

})();
