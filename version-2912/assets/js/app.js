(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var links = qs('[data-nav-links]');

    if (!toggle || !links) {
      return;
    }

    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  function setupBackTop() {
    var button = qs('[data-back-top]');

    if (!button) {
      return;
    }

    window.addEventListener('scroll', function () {
      if (window.scrollY > 500) {
        button.classList.add('is-visible');
      } else {
        button.classList.remove('is-visible');
      }
    });

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');

    if (!root) {
      return;
    }

    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilter() {
    var input = qs('[data-filter-input]');
    var list = qs('[data-filter-list]');

    if (!input || !list) {
      return;
    }

    var cards = qsa('.movie-card', list);

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = card.innerText.toLowerCase();
        card.style.display = text.indexOf(keyword) >= 0 ? '' : 'none';
      });
    });
  }

  function setupPlayers() {
    qsa('.video-player').forEach(function (video) {
      var source = video.getAttribute('data-m3u8');
      var shell = video.closest('.video-shell');
      var button = shell ? qs('[data-video-play]', shell) : null;

      if (source && window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (source && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      }

      if (button) {
        button.addEventListener('click', function () {
          video.play();
        });
      }

      video.addEventListener('play', function () {
        if (shell) {
          shell.classList.add('is-playing');
        }
      });

      video.addEventListener('pause', function () {
        if (shell) {
          shell.classList.remove('is-playing');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupBackTop();
    setupHero();
    setupFilter();
    setupPlayers();
  });
})();
