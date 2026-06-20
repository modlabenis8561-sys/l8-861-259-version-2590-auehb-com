(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var links = document.querySelector('[data-nav-links]');

    if (toggle && links) {
        toggle.addEventListener('click', function () {
            links.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        show(0);
        restart();
    }

    var input = document.querySelector('[data-search-input]');
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));
    var status = document.querySelector('[data-search-status]');

    if (input && items.length) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        input.value = query;

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function filter() {
            var keyword = normalize(input.value);
            var visible = 0;

            items.forEach(function (item) {
                var text = normalize(item.getAttribute('data-search-text'));
                var matched = !keyword || text.indexOf(keyword) !== -1;

                item.classList.toggle('is-hidden', !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (status) {
                status.textContent = keyword ? '搜索结果：' + visible : '热门内容';
            }
        }

        input.addEventListener('input', filter);
        filter();
    }
})();
