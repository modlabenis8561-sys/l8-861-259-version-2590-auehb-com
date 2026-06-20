(function () {
  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.hasAttribute("hidden");
      if (open) {
        menu.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
        button.textContent = "×";
      } else {
        menu.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
        button.textContent = "☰";
      }
    });
  }

  function initSlider() {
    var slider = document.querySelector("[data-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var previous = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
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

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var inputs = document.querySelectorAll(".card-filter");
    inputs.forEach(function (input) {
      var container = input.closest(".content-section");
      if (!container) {
        return;
      }
      var scope = container.querySelector(".filter-scope");
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-card"));
      var typeSelect = container.querySelector(".type-filter");
      var regionSelect = container.querySelector(".region-filter");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial) {
        input.value = initial;
      }

      function apply() {
        var q = normalize(input.value);
        var type = normalize(typeSelect && typeSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-category"),
            card.textContent
          ].join(" "));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var ok = (!q || text.indexOf(q) !== -1) && (!type || cardType.indexOf(type) !== -1) && (!region || cardRegion.indexOf(region) !== -1);
          card.classList.toggle("is-filtered-out", !ok);
        });
      }

      input.addEventListener("input", apply);
      if (typeSelect) {
        typeSelect.addEventListener("change", apply);
      }
      if (regionSelect) {
        regionSelect.addEventListener("change", apply);
      }
      apply();
    });
  }

  function playVideo(video) {
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  function loadPlayer(video, src, overlay) {
    if (!video || !src) {
      return;
    }
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hls) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo(video);
        });
        video._hls = hls;
      } else {
        playVideo(video);
      }
    } else {
      if (!video.getAttribute("src")) {
        video.src = src;
      }
      playVideo(video);
    }
  }

  window.MovieSitePlayer = {
    init: function (videoId, src) {
      var video = document.getElementById(videoId);
      if (!video) {
        return;
      }
      var box = video.closest(".player-box");
      var overlay = box ? box.querySelector(".player-cover") : null;
      if (overlay) {
        overlay.addEventListener("click", function () {
          loadPlayer(video, src, overlay);
        });
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          loadPlayer(video, src, overlay);
        }
      });
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initSlider();
    initFilters();
  });
})();
