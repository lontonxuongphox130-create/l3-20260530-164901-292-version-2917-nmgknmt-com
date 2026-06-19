(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            menuButton.textContent = isOpen ? '×' : '☰';
        });
    }

    document.querySelectorAll('.search-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var target = form.getAttribute('data-search-target') || form.getAttribute('action') || 'search.html';
            var query = input ? input.value.trim() : '';
            if (query) {
                window.location.href = target + '?q=' + encodeURIComponent(query);
            }
        });
    });

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var prev = document.querySelector('[data-slide-prev]');
        var next = document.querySelector('[data-slide-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('active', itemIndex === index);
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
                timer = null;
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
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupPageFilter() {
        var input = document.querySelector('[data-page-filter]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var genreSelect = document.querySelector('[data-genre-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-state]');

        if (!cards.length || (!input && !yearSelect && !genreSelect)) {
            return;
        }

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var genre = genreSelect ? genreSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardGenre = card.getAttribute('data-genre') || '';
                var matched = true;

                if (query && keywords.indexOf(query) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                if (genre && cardGenre.indexOf(genre) === -1) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [input, yearSelect, genreSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }

    function renderSearch() {
        var box = document.querySelector('[data-search-results]');
        if (!box || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var titleTarget = document.querySelector('[data-search-query]');
        var empty = document.querySelector('[data-empty-state]');
        var normalized = query.toLowerCase();

        if (titleTarget) {
            titleTarget.textContent = query || '全部影片';
        }

        var items = window.SEARCH_MOVIES.filter(function (movie) {
            if (!normalized) {
                return true;
            }
            return movie.text.toLowerCase().indexOf(normalized) !== -1;
        });

        box.innerHTML = items.map(function (movie) {
            return '<article class="movie-card">' +
                '<a class="movie-poster" href="' + movie.url + '">' +
                '<img src="' + movie.image + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
                '<span class="poster-play">▶</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                '<div class="movie-card-top"><span class="pill">' + movie.genre + '</span><span class="rating">' + movie.rating + '</span></div>' +
                '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>' +
                '<p>' + movie.desc + '</p>' +
                '<div class="meta-row"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>' +
                '</div>' +
                '</article>';
        }).join('');

        if (empty) {
            empty.classList.toggle('show', items.length === 0);
        }
    }

    setupHero();
    setupPageFilter();
    renderSearch();
}());
