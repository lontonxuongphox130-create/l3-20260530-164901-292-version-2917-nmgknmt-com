(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-control.prev');
  var next = document.querySelector('.hero-control.next');
  var index = 0;
  var timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === index);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === index);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(index - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(index + 1);
      startHero();
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var localSearch = document.querySelector('[data-local-filter]');
  var sortableGrid = document.querySelector('[data-sortable-grid]');
  var emptyState = document.querySelector('[data-empty-state]');

  function filterCards() {
    if (!localSearch || !sortableGrid) {
      return;
    }

    var query = localSearch.value.trim().toLowerCase();
    var shown = 0;
    var cards = Array.prototype.slice.call(sortableGrid.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var matched = !query || text.indexOf(query) !== -1;
      card.classList.toggle('hidden-card', !matched);

      if (matched) {
        shown += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = shown ? 'none' : 'block';
    }
  }

  if (localSearch) {
    localSearch.addEventListener('input', filterCards);
  }

  var sortButtons = Array.prototype.slice.call(document.querySelectorAll('[data-sort-mode]'));

  sortButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (!sortableGrid) {
        return;
      }

      var mode = button.getAttribute('data-sort-mode');
      var cards = Array.prototype.slice.call(sortableGrid.querySelectorAll('.movie-card'));

      cards.sort(function (a, b) {
        if (mode === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }

        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      });

      cards.forEach(function (card) {
        sortableGrid.appendChild(card);
      });

      sortButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });

      filterCards();
    });
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');

  if (query && localSearch) {
    localSearch.value = query;
    filterCards();
  } else {
    filterCards();
  }
})();
