(function () {
  var button = document.querySelector('[data-menu-button]');
  var panel = document.querySelector('[data-menu-panel]');
  if (button && panel) {
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    startHero();
  }

  if (slides.length) {
    showSlide(0);
    startHero();
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        restartHero();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartHero();
      });
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var regionSelect = document.querySelector('[data-region-filter]');
  var typeSelect = document.querySelector('[data-type-filter]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var items = Array.prototype.slice.call(document.querySelectorAll('.search-item'));

  function matchValue(item, attr, value) {
    if (!value) {
      return true;
    }
    return (item.getAttribute(attr) || '') === value;
  }

  function applyFilters() {
    if (!items.length) {
      return;
    }
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var region = regionSelect ? regionSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    items.forEach(function (item) {
      var searchText = item.getAttribute('data-search') || '';
      var ok = (!q || searchText.indexOf(q) !== -1) &&
        matchValue(item, 'data-region', region) &&
        matchValue(item, 'data-type', type) &&
        matchValue(item, 'data-year', year);
      item.style.display = ok ? '' : 'none';
    });
  }

  [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (el) {
    if (el) {
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    }
  });
})();
