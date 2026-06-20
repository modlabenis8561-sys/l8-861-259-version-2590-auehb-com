(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function advance(step) {
      showSlide(active + step);
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        advance(1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        advance(-1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        advance(1);
        startTimer();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);

    if (slides.length > 1) {
      startTimer();
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var year = scope.querySelector('[data-year-filter]');
    var genre = scope.querySelector('[data-genre-filter]');
    var list = scope.parentElement ? scope.parentElement.querySelector('[data-card-list]') : null;
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
    var empty = scope.querySelector('[data-empty-message]');

    function norm(value) {
      return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
      var keyword = norm(input ? input.value : '');
      var yearValue = norm(year ? year.value : '');
      var genreValue = norm(genre ? genre.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = norm([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' '));
        var cardYear = norm(card.getAttribute('data-year'));
        var cardGenre = norm(card.getAttribute('data-genre'));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesYear = !yearValue || cardYear === yearValue;
        var matchesGenre = !genreValue || cardGenre.indexOf(genreValue) !== -1;
        var show = matchesKeyword && matchesYear && matchesGenre;

        card.classList.toggle('hidden', !show);

        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [input, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('.play-overlay');
    var instance = null;

    function getUrl() {
      return video ? video.getAttribute('data-video-url') : '';
    }

    function attachSource(url) {
      if (!video || !url || video.dataset.ready === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        instance.loadSource(url);
        instance.attachMedia(video);
      } else {
        video.src = url;
      }

      video.dataset.ready = '1';
    }

    function beginPlayback() {
      if (!video) {
        return;
      }

      attachSource(getUrl());
      frame.classList.add('is-playing');

      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          frame.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', beginPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          beginPlayback();
        }
      });
      video.addEventListener('play', function () {
        frame.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        frame.classList.toggle('is-playing', video.currentTime > 0 && !video.paused);
      });
      video.addEventListener('ended', function () {
        frame.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (instance) {
        instance.destroy();
      }
    });
  });
})();
