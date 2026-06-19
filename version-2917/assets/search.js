(function () {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  var movies = window.MOVIE_INDEX || [];

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card">' +
        '<a class="poster" href="' + escapeAttr(movie.url) + '">' +
          '<img src="./' + escapeAttr(movie.cover) + '" alt="' + escapeAttr(movie.title) + '">' +
          '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<div class="meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '<h3><a href="' + escapeAttr(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
          '<a class="card-link" href="' + escapeAttr(movie.url) + '">立即观看</a>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function search(keyword) {
    var q = String(keyword || '').trim().toLowerCase();
    var list = movies.filter(function (movie) {
      if (!q) {
        return true;
      }
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();
      return haystack.indexOf(q) !== -1;
    }).slice(0, 120);

    results.innerHTML = list.map(createCard).join('');
  }

  if (input) {
    input.value = initial;
    input.addEventListener('input', function () {
      search(input.value);
    });
  }

  search(initial);
})();
