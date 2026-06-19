
(function () {
  "use strict";

  const movies = window.MOVIES_DATA || [];

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function posterSeed(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  function wrapTitle(title, maxChars = 8, maxLines = 3) {
    const chars = Array.from(title);
    const lines = [];
    while (chars.length && lines.length < maxLines) {
      lines.push(chars.splice(0, maxChars).join(""));
    }
    if (chars.length && lines.length) {
      lines[lines.length - 1] += "…";
    }
    return lines;
  }

  function makePosterDataUri(title, idx, region, type, genre, year, w = 480, h = 640) {
    const seed = posterSeed(title + idx);
    const hue1 = seed % 360;
    const hue2 = (hue1 + 46) % 360;
    const hue3 = (hue1 + 180) % 360;
    const lines = wrapTitle(title, 8, 3);
    const y0 = 250 - 36 * (lines.length - 1);
    const textLines = lines
      .map((line, i) =>
        `<text x="48" y="${y0 + i * 42}" fill="#ffffff" font-size="34" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(line)}</text>`
      )
      .join("");
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue1},82%,52%)"/>
      <stop offset="52%" stop-color="hsl(${hue2},82%,30%)"/>
      <stop offset="100%" stop-color="hsl(${hue3},75%,18%)"/>
    </linearGradient>
    <filter id="b"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>
  <rect width="100%" height="100%" rx="36" fill="url(#g)"/>
  <circle cx="${Math.round(w * 0.82)}" cy="${Math.round(h * 0.2)}" r="110" fill="rgba(255,255,255,0.12)" filter="url(#b)"/>
  <circle cx="${Math.round(w * 0.18)}" cy="${Math.round(h * 0.78)}" r="130" fill="rgba(255,255,255,0.08)" filter="url(#b)"/>
  <rect x="36" y="36" width="${w - 72}" height="${h - 72}" rx="28" fill="none" stroke="rgba(255,255,255,0.16)"/>
  <text x="48" y="92" fill="rgba(255,255,255,0.8)" font-size="22" font-weight="600" font-family="Inter, PingFang SC, Microsoft YaHei, sans-serif">NO.${String(idx).padStart(4, "0")}</text>
  <text x="48" y="160" fill="rgba(255,255,255,0.92)" font-size="22" font-weight="600" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(region)} · ${escapeXml(type)}</text>
  ${textLines}
  <text x="48" y="${h - 80}" fill="rgba(255,255,255,0.82)" font-size="20" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml((genre || "精品推荐").slice(0, 18))}</text>
  <text x="${w - 48}" y="${h - 80}" text-anchor="end" fill="rgba(255,255,255,0.8)" font-size="20" font-family="Inter, PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(String(year || ""))}</text>
</svg>`;
    return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
  }

  function escapeXml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function initNav() {
    const toggle = qs("[data-nav-toggle]");
    const nav = qs("[data-site-nav]");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
    qsa("[data-nav-navlink]", nav).forEach((link) => {
      link.addEventListener("click", () => nav.classList.remove("open"));
    });
  }

  function initHeroCarousel() {
    const root = qs("[data-hero-carousel]");
    if (!root) return;
    const slides = qsa("[data-hero-slide]", root);
    if (slides.length < 2) return;
    let index = 0;
    const setActive = (next) => {
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === next));
      index = next;
    };
    setActive(0);
    const tick = () => setActive((index + 1) % slides.length);
    window.setInterval(tick, 5000);
    qsa("[data-hero-dot]", root).forEach((dot, i) => dot.addEventListener("click", () => setActive(i)));
  }

  function initSearchPage() {
    const shell = qs("[data-search-page]");
    if (!shell) return;

    const form = qs("[data-search-form]", shell);
    const queryFields = qsa("[data-search-query]", shell);
    const input = queryFields[0];
    const typeSelect = qs("[name='type']", shell);
    const regionSelect = qs("[name='region']", shell);
    const yearSelect = qs("[name='year']", shell);
    const sortSelect = qs("[name='sort']", shell);
    const resultWrap = qs("[data-search-results]", shell);
    const countNode = qs("[data-result-count]", shell);
    const pager = qs("[data-pagination]", shell);

    const params = new URLSearchParams(window.location.search);
    queryFields.forEach((field) => field.value = params.get("q") || "");
    typeSelect.value = params.get("type") || "";
    regionSelect.value = params.get("region") || "";
    yearSelect.value = params.get("year") || "";
    sortSelect.value = params.get("sort") || "hot";

    let page = Math.max(1, parseInt(params.get("page") || "1", 10));
    const pageSize = 48;

    function applyFilters() {
      const q = input.value.trim().toLowerCase();
      const type = typeSelect.value.trim();
      const region = regionSelect.value.trim();
      const year = yearSelect.value.trim();
      const sort = sortSelect.value.trim() || "hot";

      let data = movies.filter((m) => {
        const hay = [m.title, m.region, m.type, m.genre, m.tags, m.one_line, m.summary, m.review].join(" ").toLowerCase();
        if (q && !hay.includes(q)) return false;
        if (type && m.type !== type) return false;
        if (region && m.region !== region) return false;
        if (year && String(m.year) !== year) return false;
        return true;
      });

      if (sort === "year") {
        data.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0) || a.title.localeCompare(b.title, "zh"));
      } else if (sort === "alpha") {
        data.sort((a, b) => a.title.localeCompare(b.title, "zh"));
      } else {
        data.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0) || a.title.localeCompare(b.title, "zh"));
      }

      const total = data.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      page = Math.min(page, totalPages);
      const start = (page - 1) * pageSize;
      const items = data.slice(start, start + pageSize);

      countNode.textContent = `共 ${total} 部`;
      resultWrap.innerHTML = items.map(renderCard).join("") || renderEmpty();
      pager.innerHTML = renderPager(totalPages, page);

      qsa("button[data-page]", pager).forEach((btn) => {
        btn.addEventListener("click", () => {
          page = Number(btn.dataset.page);
          syncUrl();
          applyFilters();
          window.scrollTo({ top: resultWrap.offsetTop - 84, behavior: "smooth" });
        });
      });

      qsa("a[data-card-link]", resultWrap).forEach((link) => {
        link.setAttribute("aria-label", link.dataset.title || "影片详情");
      });
    }

    function syncUrl() {
      const next = new URL(window.location.href);
      next.searchParams.set("q", input.value.trim());
      if (typeSelect.value) next.searchParams.set("type", typeSelect.value); else next.searchParams.delete("type");
      if (regionSelect.value) next.searchParams.set("region", regionSelect.value); else next.searchParams.delete("region");
      if (yearSelect.value) next.searchParams.set("year", yearSelect.value); else next.searchParams.delete("year");
      if (sortSelect.value) next.searchParams.set("sort", sortSelect.value); else next.searchParams.delete("sort");
      next.searchParams.set("page", String(page));
      history.replaceState(null, "", next.toString());
    }

    function syncQueryFields(value) {
      queryFields.forEach((field) => {
        if (field !== document.activeElement) {
          field.value = value;
        }
      });
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      page = 1;
      syncUrl();
      applyFilters();
    });

    [typeSelect, regionSelect, yearSelect, sortSelect].forEach((el) =>
      el.addEventListener("change", () => {
        page = 1;
        syncUrl();
        applyFilters();
      })
    );

    queryFields.forEach((field) => {
      field.addEventListener("input", debounce(() => {
        syncQueryFields(field.value);
        page = 1;
        syncUrl();
        applyFilters();
      }, 220));
    });

    applyFilters();
  }

  function renderCard(m) {
    const poster = makePosterDataUri(m.title, m.id, m.region, m.type, m.genre, m.year, 420, 560);
    const desc = m.one_line || m.summary || m.review || "";
    const tags = [m.year, m.region].filter(Boolean).join(" · ");
    return `
      <article class="movie-card">
        <a class="movie-poster" data-card-link data-title="${escapeAttr(m.title)}" href="${m.url}" style="background-image:url('${poster}')">
          <span class="movie-badges">
            <span class="badge">${escapeHtml(m.type || "影片")}</span>
            <span class="badge">${escapeHtml(m.category_name || "")}</span>
          </span>
          <span class="movie-play">立即查看详情</span>
        </a>
        <div class="movie-body">
          <h3><a href="${m.url}">${escapeHtml(m.title)}</a></h3>
          <p>${escapeHtml(desc)}</p>
          <div class="movie-meta">
            <span>${escapeHtml(tags)}</span>
            <span class="year">${escapeHtml(m.genre || "")}</span>
          </div>
        </div>
      </article>`;
  }

  function renderEmpty() {
    return `
      <div class="panel" style="grid-column:1/-1">
        没有找到匹配内容，请尝试更换关键词或筛选条件。
      </div>`;
  }

  function renderPager(totalPages, page) {
    const pages = [];
    const pushBtn = (p, label = String(p), active = false) => {
      pages.push(`<button type="button" data-page="${p}" class="${active ? "active" : ""}">${label}</button>`);
    };
    if (totalPages <= 8) {
      for (let i = 1; i <= totalPages; i++) pushBtn(i, String(i), i === page);
    } else {
      pushBtn(1, "1", page === 1);
      if (page > 4) pages.push(`<span class="small" style="align-self:center">…</span>`);
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pushBtn(i, String(i), i === page);
      if (page < totalPages - 3) pages.push(`<span class="small" style="align-self:center">…</span>`);
      pushBtn(totalPages, String(totalPages), page === totalPages);
    }
    return pages.join("");
  }

  function initSimpleFilters() {
    qsa("[data-filter-group]").forEach((group) => {
      const chips = qsa("[data-filter-chip]", group);
      const items = qsa("[data-filter-item]", group);
      if (!chips.length || !items.length) return;
      chips.forEach((chip) => chip.addEventListener("click", () => {
        const value = chip.dataset.filterChip;
        chips.forEach((c) => c.classList.toggle("active", c === chip));
        items.forEach((item) => {
          const ok = value === "all" || item.dataset.filterValues.split(",").includes(value);
          item.classList.toggle("hidden", !ok);
        });
      }));
    });
  }

  function initPlayer() {
    const player = qs("[data-player]");
    if (!player) return;
    const video = qs("video", player);
    const overlay = qs(".player-overlay", player);
    if (!video) return;
    const start = () => {
      overlay && overlay.classList.add("hidden");
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    };
    if (overlay) overlay.addEventListener("click", start);
    video.addEventListener("play", () => overlay && overlay.classList.add("hidden"));

    const src = video.getAttribute("data-src") || video.getAttribute("src");
    if (src && src.endsWith(".m3u8") && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => start());
    }
  }

  function debounce(fn, wait) {
    let t = null;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function escapeAttr(text) {
    return escapeHtml(text).replace(/"/g, "&quot;");
  }

  function initQuickSearch() {
    const form = qs("[data-quick-search]");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = qs("input[name='q']", form);
      const select = qs("select[name='type']", form);
      const q = encodeURIComponent((input && input.value.trim()) || "");
      const type = encodeURIComponent((select && select.value) || "");
      const url = new URL("search.html", window.location.href);
      if (q) url.searchParams.set("q", decodeURIComponent(q));
      if (type) url.searchParams.set("type", decodeURIComponent(type));
      window.location.href = url.toString();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initHeroCarousel();
    initSearchPage();
    initSimpleFilters();
    initPlayer();
    initQuickSearch();
  });
})();
