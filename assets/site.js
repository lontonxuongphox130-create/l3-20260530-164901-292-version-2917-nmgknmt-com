(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mainNav = document.querySelector('.main-nav');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filters = Array.prototype.slice.call(document.querySelectorAll('.local-filter'));
  filters.forEach(function (input) {
    var target = document.getElementById(input.getAttribute('data-filter-target'));
    if (!target) {
      return;
    }

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      Array.prototype.slice.call(target.querySelectorAll('.movie-card')).forEach(function (card) {
        var haystack = card.textContent.toLowerCase();
        card.style.display = haystack.indexOf(keyword) === -1 ? 'none' : '';
      });
    });
  });

  var sorts = Array.prototype.slice.call(document.querySelectorAll('.sort-select'));
  sorts.forEach(function (select) {
    var target = document.getElementById(select.getAttribute('data-sort-target'));
    if (!target) {
      return;
    }

    select.addEventListener('change', function () {
      var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));
      var value = select.value;

      cards.sort(function (a, b) {
        if (value === 'year-desc') {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        }
        if (value === 'year-asc') {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        }
        if (value === 'title') {
          return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'), 'zh-Hans-CN');
        }
        return 0;
      });

      cards.forEach(function (card) {
        target.appendChild(card);
      });
    });
  });
})();
