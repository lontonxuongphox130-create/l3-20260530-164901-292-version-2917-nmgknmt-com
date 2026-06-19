(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function createSearchCard(movie) {
    var card = document.createElement("article");
    card.className = "movie-card";

    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    card.innerHTML = "" +
      "<a class=\"poster-frame\" href=\"" + escapeAttribute(movie.url) + "\" aria-label=\"观看 " + escapeAttribute(movie.title) + "\">" +
      "<img src=\"" + escapeAttribute(movie.cover) + "\" alt=\"" + escapeAttribute(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-badge\">" + escapeHtml(String(movie.year || "精选")) + "</span>" +
      "<span class=\"play-chip\">播放</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<h3><a href=\"" + escapeAttribute(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.line) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>";

    var image = card.querySelector("img");
    image.addEventListener("error", function () {
      image.remove();
    });

    return card;
  }

  function setupSearchPage() {
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    var status = document.getElementById("search-status");
    if (!input || !results || !status || !window.SiteSearchIndex) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;
    run(initialQuery);

    input.addEventListener("input", function () {
      run(input.value);
    });

    function run(query) {
      var keyword = query.trim().toLowerCase();
      results.innerHTML = "";
      if (!keyword) {
        status.textContent = "输入关键词开始搜索";
        window.SiteSearchIndex.slice(0, 12).forEach(function (movie) {
          results.appendChild(createSearchCard(movie));
        });
        return;
      }

      var words = keyword.split(/\s+/).filter(Boolean);
      var matches = window.SiteSearchIndex.filter(function (movie) {
        return words.every(function (word) {
          return movie.searchText.indexOf(word) !== -1;
        });
      }).slice(0, 80);

      if (!matches.length) {
        status.textContent = "没有找到匹配内容，换个关键词试试";
        return;
      }

      status.textContent = "相关影片";
      matches.forEach(function (movie) {
        results.appendChild(createSearchCard(movie));
      });
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchPage();
  });
})();
