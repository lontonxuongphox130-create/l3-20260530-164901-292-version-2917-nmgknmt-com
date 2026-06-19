(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        var button = document.querySelector(".menu-button");
        var mobile = document.querySelector(".mobile-nav");
        if (!button || !mobile) {
            return;
        }
        button.addEventListener("click", function () {
            mobile.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("active", current === index);
            });
        }
        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                show(current);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupFilters() {
        var input = document.querySelector(".movie-search");
        var year = document.querySelector(".year-filter");
        var type = document.querySelector(".type-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-card"));
        var empty = document.querySelector(".empty-state");
        if (!input && !year && !type) {
            return;
        }
        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            var selectedType = type ? type.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }
                if (selectedType && cardType.indexOf(selectedType) === -1) {
                    matched = false;
                }
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }
        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function initPlayer(options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var cover = document.getElementById(options.coverId);
        if (!video || !button || !cover || !options.source) {
            return;
        }
        var started = false;
        var hls = null;
        function start() {
            if (!started) {
                started = true;
                cover.classList.add("hidden");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = options.source;
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(options.source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    return;
                }
                video.src = options.source;
            }
            video.play().catch(function () {});
        }
        button.addEventListener("click", start);
        cover.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });

    window.MovieSitePlayer = {
        init: initPlayer
    };
})();
