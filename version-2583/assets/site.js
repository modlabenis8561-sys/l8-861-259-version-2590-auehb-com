(function () {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const next = hero.querySelector('[data-hero-next]');
    const prev = hero.querySelector('[data-hero-prev]');
    let index = 0;
    let timer = null;

    const show = function (target) {
      if (!slides.length) {
        return;
      }

      index = (target + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    const schedule = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        schedule();
      });
    });

    show(0);
    schedule();
  }

  const searchInput = document.getElementById('movie-search');
  const regionSelect = document.getElementById('filter-region');
  const yearSelect = document.getElementById('filter-year');
  const typeSelect = document.getElementById('filter-type');
  const categorySelect = document.getElementById('filter-category');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const emptyMessage = document.querySelector('[data-empty-message]');

  if (cards.length && searchInput) {
    const fillSelect = function (select, values) {
      if (!select) {
        return;
      }

      values.forEach(function (value) {
        if (!value || Array.from(select.options).some(function (option) { return option.value === value; })) {
          return;
        }

        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    };

    const unique = function (name) {
      return Array.from(new Set(cards.map(function (card) { return card.dataset[name] || ''; }).filter(Boolean))).sort(function (a, b) {
        return a.localeCompare(b, 'zh-Hans-CN');
      });
    };

    fillSelect(regionSelect, unique('region'));
    fillSelect(yearSelect, unique('year').reverse());
    fillSelect(typeSelect, unique('type'));

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query) {
      searchInput.value = query;
    }

    const normalize = function (value) {
      return (value || '').toString().trim().toLowerCase();
    };

    const apply = function () {
      const keyword = normalize(searchInput.value);
      const region = regionSelect ? regionSelect.value : 'all';
      const year = yearSelect ? yearSelect.value : 'all';
      const type = typeSelect ? typeSelect.value : 'all';
      const category = categorySelect ? categorySelect.value : 'all';
      let visible = 0;

      cards.forEach(function (card) {
        const text = normalize(card.dataset.text);
        const matched =
          (!keyword || text.includes(keyword)) &&
          (region === 'all' || card.dataset.region === region) &&
          (year === 'all' || card.dataset.year === year) &&
          (type === 'all' || card.dataset.type === type) &&
          (category === 'all' || card.dataset.category === category);

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (emptyMessage) {
        emptyMessage.hidden = visible !== 0;
      }
    };

    [searchInput, regionSelect, yearSelect, typeSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }
})();
