(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = $("[data-menu-toggle]");
    var panel = $("[data-mobile-panel]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = $("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = $$("[data-hero-slide]", hero);
    var dots = $$("[data-hero-dot]", hero);
    var prev = $("[data-hero-prev]", hero);
    var next = $("[data-hero-next]", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });

      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function initFilters() {
    var searchInput = $("[data-filter-search]");
    var typeSelect = $("[data-filter-type]");
    var regionSelect = $("[data-filter-region]");
    var yearSelect = $("[data-filter-year]");
    var cards = $$("[data-search-card]");

    if (!searchInput || cards.length === 0) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q) {
      searchInput.value = q;
    }

    function valueOf(select) {
      return select ? select.value : "";
    }

    function apply() {
      var text = searchInput.value.trim().toLowerCase();
      var type = valueOf(typeSelect);
      var region = valueOf(regionSelect);
      var year = valueOf(yearSelect);

      cards.forEach(function (card) {
        var cardText = card.textContent.toLowerCase();
        var matchText = text === "" || cardText.indexOf(text) !== -1;
        var matchType = type === "" || card.getAttribute("data-type") === type;
        var matchRegion = region === "" || card.getAttribute("data-region") === region;
        var matchYear = year === "" || card.getAttribute("data-year") === year;
        card.classList.toggle("is-hidden", !(matchText && matchType && matchRegion && matchYear));
      });
    }

    [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (item) {
      if (item) {
        item.addEventListener("input", apply);
        item.addEventListener("change", apply);
      }
    });

    apply();
  }

  window.bindMoviePlayer = function (videoId, source) {
    var video = document.getElementById(videoId);
    var cover = document.querySelector('[data-player="' + videoId + '"]');
    var hls = null;
    var ready = false;

    if (!video || !cover || !source) {
      return;
    }

    function begin() {
      cover.classList.add("is-hidden");

      if (ready) {
        video.play().catch(function () {
          cover.classList.remove("is-hidden");
        });
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        ready = true;
        video.play().catch(function () {
          cover.classList.remove("is-hidden");
        });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          video.play().catch(function () {
            cover.classList.remove("is-hidden");
          });
        });
        return;
      }

      video.src = source;
      ready = true;
      video.play().catch(function () {
        cover.classList.remove("is-hidden");
      });
    }

    cover.addEventListener("click", begin);
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
  });
}());
