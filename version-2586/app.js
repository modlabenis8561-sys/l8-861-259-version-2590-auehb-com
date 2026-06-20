(function () {
  var movieIndex = Array.isArray(window.MOVIE_INDEX) ? window.MOVIE_INDEX : [];

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeText(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function textOf(item) {
    return [
      item.title,
      item.year,
      item.region,
      item.type,
      item.genre,
      item.category,
      Array.isArray(item.tags) ? item.tags.join(' ') : '',
      item.oneLine
    ].join(' ').toLowerCase();
  }

  function matchMovies(keyword, limit) {
    var term = String(keyword || '').trim().toLowerCase();
    if (!term) {
      return [];
    }
    return movieIndex
      .filter(function (item) {
        return textOf(item).indexOf(term) !== -1;
      })
      .slice(0, limit || 12);
  }

  function smallResultHtml(item) {
    return '' +
      '<a class="search-result-item" href="' + escapeText(item.url) + '">' +
        '<img src="' + escapeText(item.cover) + '" alt="' + escapeText(item.title) + '">' +
        '<span>' +
          '<strong>' + escapeText(item.title) + '</strong>' +
          '<em>' + escapeText(item.oneLine) + '</em>' +
          '<span>' + escapeText(item.region) + ' · ' + escapeText(item.year) + '</span>' +
        '</span>' +
      '</a>';
  }

  function cardResultHtml(item) {
    var tags = Array.isArray(item.tags) ? item.tags.slice(0, 3) : [];
    var tagHtml = tags.map(function (tag) {
      return '<span>' + escapeText(tag) + '</span>';
    }).join('');
    return '' +
      '<a class="movie-card" href="' + escapeText(item.url) + '">' +
        '<span class="poster-wrap">' +
          '<img src="' + escapeText(item.cover) + '" alt="' + escapeText(item.title) + '" loading="lazy">' +
          '<span class="poster-shade"></span>' +
          '<span class="play-chip">▶</span>' +
          '<span class="type-chip">' + escapeText(item.type) + '</span>' +
          '<span class="year-chip">' + escapeText(item.year) + '</span>' +
        '</span>' +
        '<span class="card-body">' +
          '<strong>' + escapeText(item.title) + '</strong>' +
          '<em>' + escapeText(item.oneLine) + '</em>' +
          '<span class="card-meta">' +
            '<span>' + escapeText(item.region) + '</span>' +
            '<span>' + escapeText(item.category) + '</span>' +
            '<span>' + escapeText(item.genre).split(/[\/,，]/)[0] + '</span>' +
          '</span>' +
          '<span class="card-tags">' + tagHtml + '</span>' +
        '</span>' +
      '</a>';
  }

  function initMobileMenu() {
    var button = qs('.mobile-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHeaderSearch() {
    qsa('.header-search, .mobile-search').forEach(function (form) {
      var input = qs('.global-search', form);
      var results = qs('.search-results', form);
      if (!input || !results) {
        return;
      }
      input.addEventListener('input', function () {
        var matches = matchMovies(input.value, 8);
        if (!matches.length) {
          results.innerHTML = '';
          results.classList.remove('open');
          return;
        }
        results.innerHTML = matches.map(smallResultHtml).join('');
        results.classList.add('open');
      });
      input.addEventListener('blur', function () {
        window.setTimeout(function () {
          results.classList.remove('open');
        }, 180);
      });
    });
  }

  function initHeroCarousel() {
    var root = qs('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initCategoryFilters() {
    qsa('[data-filter-root]').forEach(function (root) {
      var textInput = qs('[data-filter-text]', root);
      var regionSelect = qs('[data-filter-region]', root);
      var typeSelect = qs('[data-filter-type]', root);
      var yearSelect = qs('[data-filter-year]', root);
      var section = root.closest('.page-section');
      var grid = section ? qs('[data-filter-grid]', section) : null;
      var cards = grid ? qsa('.movie-card', grid) : [];
      var empty = section ? qs('[data-empty-state]', section) : null;

      function apply() {
        var term = textInput ? textInput.value.trim().toLowerCase() : '';
        var region = regionSelect ? regionSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var ok = true;
          if (term && haystack.indexOf(term) === -1) {
            ok = false;
          }
          if (region && card.getAttribute('data-region') !== region) {
            ok = false;
          }
          if (type && card.getAttribute('data-type') !== type) {
            ok = false;
          }
          if (year && card.getAttribute('data-year') !== year) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('visible', visible === 0);
        }
      }

      [textInput, regionSelect, typeSelect, yearSelect].forEach(function (field) {
        if (field) {
          field.addEventListener('input', apply);
          field.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initSearchPage() {
    var input = qs('#search-page-input');
    var output = qs('#search-page-results');
    if (!input || !output) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var term = input.value.trim();
      var matches = term ? matchMovies(term, 96) : movieIndex.slice(0, 24);
      output.innerHTML = matches.map(cardResultHtml).join('');
    }

    input.addEventListener('input', render);
    render();
  }

  function startPlayer(shell) {
    if (!shell || shell.classList.contains('is-ready')) {
      var currentVideo = shell ? qs('video', shell) : null;
      if (currentVideo && currentVideo.paused) {
        currentVideo.play().catch(function () {});
      }
      return;
    }
    var video = qs('video', shell);
    var source = shell.getAttribute('data-source');
    if (!video || !source) {
      return;
    }
    shell.classList.add('is-ready');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      video.addEventListener('ended', function () {
        hls.destroy();
      }, { once: true });
      return;
    }
    video.src = source;
    video.play().catch(function () {});
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (shell) {
      var overlay = qs('.player-overlay', shell);
      if (overlay) {
        overlay.addEventListener('click', function (event) {
          event.preventDefault();
          startPlayer(shell);
        });
      }
      shell.addEventListener('click', function (event) {
        if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
          return;
        }
        if (!shell.classList.contains('is-ready')) {
          startPlayer(shell);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeaderSearch();
    initHeroCarousel();
    initCategoryFilters();
    initSearchPage();
    initPlayers();
  });
})();
