const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
}

const slides = Array.from(document.querySelectorAll('.hero-slide'));
const dots = Array.from(document.querySelectorAll('.hero-dot'));
let heroIndex = 0;
let heroTimer = null;

function setHeroSlide(index) {
  if (!slides.length) {
    return;
  }

  heroIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, current) => {
    slide.classList.toggle('active', current === heroIndex);
  });
  dots.forEach((dot, current) => {
    dot.classList.toggle('active', current === heroIndex);
  });
}

function startHero() {
  if (slides.length < 2) {
    return;
  }

  clearInterval(heroTimer);
  heroTimer = setInterval(() => setHeroSlide(heroIndex + 1), 5200);
}

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    setHeroSlide(index);
    startHero();
  });
});

startHero();

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function applyPageFilter(input, scope) {
  const value = normalizeText(input.value);
  const cards = Array.from(scope.querySelectorAll('.movie-card'));

  cards.forEach(card => {
    const text = normalizeText(card.dataset.search || card.textContent);
    card.classList.toggle('hidden-by-filter', value && !text.includes(value));
  });
}

const pageFilter = document.querySelector('.page-filter');
const pageGrid = document.querySelector('.searchable-grid');

if (pageFilter && pageGrid) {
  pageFilter.addEventListener('input', () => applyPageFilter(pageFilter, pageGrid));
}

const searchInput = document.querySelector('#site-search');
const regionFilter = document.querySelector('#region-filter');
const typeFilter = document.querySelector('#type-filter');
const yearFilter = document.querySelector('#year-filter');
const searchResults = document.querySelector('#search-results');

function applySearchFilters() {
  if (!searchResults) {
    return;
  }

  const keyword = normalizeText(searchInput ? searchInput.value : '');
  const region = normalizeText(regionFilter ? regionFilter.value : '');
  const type = normalizeText(typeFilter ? typeFilter.value : '');
  const year = normalizeText(yearFilter ? yearFilter.value : '');
  const cards = Array.from(searchResults.querySelectorAll('.movie-card'));

  cards.forEach(card => {
    const text = normalizeText(card.dataset.search || card.textContent);
    const cardRegion = normalizeText(card.dataset.region);
    const cardType = normalizeText(card.dataset.type);
    const cardYear = normalizeText(card.dataset.year);
    const matched =
      (!keyword || text.includes(keyword)) &&
      (!region || cardRegion.includes(region)) &&
      (!type || cardType.includes(type)) &&
      (!year || cardYear === year);

    card.classList.toggle('hidden-by-filter', !matched);
  });
}

if (searchResults) {
  const params = new URLSearchParams(window.location.search);
  const keyword = params.get('q');

  if (keyword && searchInput) {
    searchInput.value = keyword;
  }

  [searchInput, regionFilter, typeFilter, yearFilter].forEach(control => {
    if (control) {
      control.addEventListener('input', applySearchFilters);
      control.addEventListener('change', applySearchFilters);
    }
  });

  applySearchFilters();
}

if (document.querySelector('.player-panel')) {
  import('./player.js').then(module => {
    module.mountPlayer();
  });
}
