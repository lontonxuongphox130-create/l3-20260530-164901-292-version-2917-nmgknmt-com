(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll(".cover-image").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-hidden");
      });
    });

    document.querySelectorAll(".js-hero").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var active = 0;
      var timer;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(active - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(active + 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-scroll-left], [data-scroll-right]").forEach(function (button) {
      button.addEventListener("click", function () {
        var targetId = button.getAttribute("data-target");
        var rail = document.getElementById(targetId);
        if (!rail) {
          return;
        }
        var direction = button.hasAttribute("data-scroll-left") ? -1 : 1;
        rail.scrollBy({ left: direction * 420, behavior: "smooth" });
      });
    });

    document.querySelectorAll(".js-hero-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";
        var url = "./search.html";
        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });

    document.querySelectorAll(".js-filter-form").forEach(function (form) {
      var scope = document;
      var input = form.querySelector(".js-page-search");
      var selects = Array.prototype.slice.call(form.querySelectorAll(".js-filter-select"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .mini-card"));
      var empty = scope.querySelector(".empty-state");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      if (input && initial) {
        input.value = initial;
      }

      function applyFilters() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var activeFilters = {};
        selects.forEach(function (select) {
          var key = select.getAttribute("data-filter");
          if (key && select.value) {
            activeFilters[key] = select.value;
          }
        });
        var visible = 0;
        cards.forEach(function (card) {
          var hay = (card.getAttribute("data-search") || "").toLowerCase();
          var ok = !query || hay.indexOf(query) !== -1;
          Object.keys(activeFilters).forEach(function (key) {
            var attr = card.getAttribute("data-" + key) || "";
            if (attr !== activeFilters[key]) {
              ok = false;
            }
          });
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilters);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
      });
      applyFilters();
    });

    document.querySelectorAll(".player-card").forEach(function (card) {
      var video = card.querySelector("video");
      var button = card.querySelector(".player-start");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream") || "";
      var initialized = false;

      function init() {
        if (initialized || !stream) {
          return;
        }
        initialized = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        init();
        card.classList.add("is-playing");
        var action = video.play();
        if (action && action.catch) {
          action.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }
      card.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        play();
      });
      video.addEventListener("play", function () {
        card.classList.add("is-playing");
      });
    });
  });
})();
