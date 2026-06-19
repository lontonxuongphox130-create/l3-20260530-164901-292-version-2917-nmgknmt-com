
(function () {
  function initHeroSlider() {
    const track = document.querySelector('[data-hero-track]');
    if (!track) return;
    const slides = Array.from(track.children);
    const prev = document.querySelector('[data-hero-prev]');
    const next = document.querySelector('[data-hero-next]');
    let index = 0;

    function render() {
      track.style.transform = `translateX(${-index * 100}%)`;
    }

    function go(step) {
      index = (index + step + slides.length) % slides.length;
      render();
    }

    prev && prev.addEventListener('click', () => go(-1));
    next && next.addEventListener('click', () => go(1));
    setInterval(() => go(1), 6000);
  }

  function initFilters() {
    const input = document.querySelector('[data-search-input]');
    const chips = Array.from(document.querySelectorAll('[data-filter-chip]'));
    const cards = Array.from(document.querySelectorAll('[data-filter-card]'));
    if (!input && !chips.length) return;

    function apply() {
      const q = (input?.value || '').trim().toLowerCase();
      const active = document.querySelector('[data-filter-chip].is-active');
      const filter = active ? active.getAttribute('data-filter-chip') : 'all';
      let visible = 0;
      cards.forEach(card => {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const region = (card.getAttribute('data-region') || '').toLowerCase();
        const type = (card.getAttribute('data-type') || '').toLowerCase();
        const tags = (card.getAttribute('data-tags') || '').toLowerCase();
        const year = (card.getAttribute('data-year') || '').toLowerCase();
        const matchQuery = !q || [title, region, type, tags, year].join(' ').includes(q);
        const matchFilter = filter === 'all' || [title, region, type, tags, year].join(' ').includes(filter.toLowerCase());
        const show = matchQuery && matchFilter;
        card.classList.toggle('hidden', !show);
        if (show) visible += 1;
      });
      const counter = document.querySelector('[data-result-count]');
      if (counter) counter.textContent = String(visible);
    }

    input && input.addEventListener('input', apply);
    chips.forEach(chip => chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      apply();
    }));
    apply();
  }

  function initScrollHint() {
    const el = document.querySelector('[data-scroll-hint]');
    if (!el) return;
    let target = document.querySelector(el.getAttribute('href'));
    if (target) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  initHeroSlider();
  initFilters();
  initScrollHint();
})();
