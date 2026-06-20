(function () {
  var header = document.querySelector('.site-header');
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  function setHeaderState() {
    if (!header) {
      return;
    }
    if (window.scrollY > 16) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('is-open');
      mobilePanel.setAttribute('aria-hidden', String(!isOpen));
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function activateHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activateHero(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activateHero(current + 1);
      }, 5200);
    }
  }

  var searchPanels = Array.prototype.slice.call(document.querySelectorAll('.search-panel'));
  searchPanels.forEach(function (panel) {
    var input = panel.querySelector('.search-input');
    var clear = panel.querySelector('.search-clear');
    if (!input) {
      return;
    }

    var scope = panel.closest('main') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    function applySearch() {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-title') || card.textContent || '').toLowerCase();
        card.classList.toggle('is-hidden-card', keyword.length > 0 && haystack.indexOf(keyword) === -1);
      });
    }

    input.addEventListener('input', applySearch);
    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        applySearch();
        input.focus();
      });
    }
  });

  Array.prototype.slice.call(document.querySelectorAll('.back-to-top')).forEach(function (button) {
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  function startVideo(player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    if (!source) {
      return;
    }

    if (!video.dataset.ready) {
      video.dataset.ready = 'true';

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      }
    }

    video.controls = true;
    if (cover) {
      cover.classList.add('is-hidden');
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');

    if (cover) {
      cover.addEventListener('click', function () {
        startVideo(player);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo(player);
        } else {
          video.pause();
        }
      });
      video.addEventListener('pause', function () {
        if (cover && video.currentTime === 0) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  });
})();
