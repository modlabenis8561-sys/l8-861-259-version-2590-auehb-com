(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
      button.textContent = nav.classList.contains("open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 4600);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    start();
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var grid = document.querySelector("[data-local-grid]");
    if (!input || !grid) {
      return;
    }
    var empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "没有找到匹配影片";
    function apply() {
      var value = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var match = !value || text.indexOf(value) !== -1;
        card.classList.toggle("is-filtered-out", !match);
        if (match) {
          visible += 1;
        }
      });
      if (visible === 0) {
        if (!empty.parentNode) {
          grid.appendChild(empty);
        }
      } else if (empty.parentNode) {
        empty.parentNode.removeChild(empty);
      }
    }
    input.addEventListener("input", apply);
    apply();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        """: "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function createCard(movie) {
    var a = document.createElement("a");
    a.className = "movie-card";
    a.href = movie.link;
    a.setAttribute("data-movie-card", "");
    a.setAttribute("data-search", movie.search);
    a.innerHTML = [
      '<span class="poster-wrap">',
      '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-badge">▶</span>',
      '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '<span class="rating-badge">★ ' + escapeHtml(movie.rating) + '</span>',
      '</span>',
      '<span class="card-title">' + escapeHtml(movie.title) + '</span>',
      '<span class="card-meta">' + escapeHtml(movie.genre) + '</span>'
    ].join("");
    return a;
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var note = document.querySelector("[data-search-note]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var lower = query.toLowerCase();
    var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      return movie.search.toLowerCase().indexOf(lower) !== -1;
    }).slice(0, 120);
    results.innerHTML = "";
    if (title) {
      title.textContent = "搜索结果";
    }
    if (note) {
      note.textContent = matches.length ? "以下影片与“" + query + "”相关" : "没有找到匹配影片";
    }
    if (!matches.length) {
      var empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "没有找到匹配影片";
      results.appendChild(empty);
      return;
    }
    matches.forEach(function (movie) {
      results.appendChild(createCard(movie));
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });
})();
