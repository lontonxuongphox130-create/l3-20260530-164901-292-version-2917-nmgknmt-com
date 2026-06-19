
(function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let heroIndex = 0;
  let heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  function nextHero() {
    showHero(heroIndex + 1);
  }

  if (slides.length) {
    const prev = document.querySelector('.hero-prev');
    const next = document.querySelector('.hero-next');
    if (prev) {
      prev.addEventListener('click', function() {
        showHero(heroIndex - 1);
      });
    }
    if (next) {
      next.addEventListener('click', nextHero);
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        showHero(i);
      });
    });
    heroTimer = setInterval(nextHero, 5200);
    document.addEventListener('visibilitychange', function() {
      if (document.hidden && heroTimer) {
        clearInterval(heroTimer);
        heroTimer = null;
      } else if (!document.hidden && !heroTimer) {
        heroTimer = setInterval(nextHero, 5200);
      }
    });
  }

  const filterInput = document.querySelector('.page-filter-input');
  const filterSelect = document.querySelector('.page-filter-select');
  const filterItems = Array.from(document.querySelectorAll('.filter-item'));

  function applyPageFilter() {
    const keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    const typeValue = filterSelect ? filterSelect.value : '';
    filterItems.forEach(function(item) {
      const title = (item.getAttribute('data-title') || '').toLowerCase();
      const type = item.getAttribute('data-type') || '';
      const matchedKeyword = !keyword || title.indexOf(keyword) !== -1;
      const matchedType = !typeValue || type.indexOf(typeValue) !== -1;
      item.style.display = matchedKeyword && matchedType ? '' : 'none';
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyPageFilter);
  }
  if (filterSelect) {
    filterSelect.addEventListener('change', applyPageFilter);
  }

  const searchInput = document.getElementById('searchInput');
  const typeFilter = document.getElementById('typeFilter');
  const yearFilter = document.getElementById('yearFilter');
  const results = document.getElementById('searchResults');

  function createCard(movie) {
    const article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = [
      '<a class="poster-link" href="' + movie.href + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '</a>',
      '<div class="card-body">',
      '<div class="card-badges">',
      '<a href="' + movie.categoryHref + '">' + escapeHtml(movie.category) + '</a>',
      '<span>' + escapeHtml(movie.type) + '</span>',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '</div>',
      '<h3><a href="' + movie.href + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '</div>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fillYears() {
    if (!yearFilter || !window.SITE_MOVIES) {
      return;
    }
    const years = Array.from(new Set(window.SITE_MOVIES.map(function(movie) {
      return movie.year;
    }).filter(Boolean))).sort(function(a, b) {
      return Number(b) - Number(a);
    });
    years.forEach(function(year) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });
  }

  function renderSearch() {
    if (!results || !window.SITE_MOVIES) {
      return;
    }
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const typeValue = typeFilter ? typeFilter.value : '';
    const yearValue = yearFilter ? yearFilter.value : '';
    results.innerHTML = '';
    if (!keyword && !typeValue && !yearValue) {
      return;
    }
    const matches = window.SITE_MOVIES.filter(function(movie) {
      const haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
      const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const matchedType = !typeValue || movie.type.indexOf(typeValue) !== -1;
      const matchedYear = !yearValue || movie.year === yearValue;
      return matchedKeyword && matchedType && matchedYear;
    }).slice(0, 120);
    if (!matches.length) {
      const empty = document.createElement('div');
      empty.className = 'no-results';
      empty.textContent = '没有找到匹配影片';
      results.appendChild(empty);
      return;
    }
    matches.forEach(function(movie) {
      results.appendChild(createCard(movie));
    });
  }

  if (results && window.SITE_MOVIES) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    fillYears();
    if (searchInput) {
      searchInput.value = q;
      searchInput.addEventListener('input', renderSearch);
    }
    if (typeFilter) {
      typeFilter.addEventListener('change', renderSearch);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', renderSearch);
    }
    renderSearch();
  }
}());
