/* ---------- futureña.com / script ----------
   - Loads modules from content.json
   - Renders the grid
   - Live search over title/excerpt/tags/source
   - Filter pills (all / essay / signal)
   - ES/EN language toggle
   Everything is client-side. No build step.
-------------------------------------------------- */

(() => {
  const I18N = {
    es: {
      title: "Observatorio de futuros latinoamericanos.",
      sub: "Micro ensayos y señales curadas sobre cómo la región imagina, escribe y construye lo que viene.",
      filter_all: "Todo",
      filter_bite: "Señales",
      filter_microensayo: "Microensayos",
      search_label: "Buscar",
      search_placeholder: "buscar por título, etiqueta o fuente…",
      empty: "Sin resultados. Probá con otra palabra.",
      footer_about:
        "Futureña es un proyecto independiente de Malex Salamanqués. Sin afiliación ni algoritmo.",
      footer_email: "Escribir",
      footer_year: "MMXXVI",
      type_microensayo: "Microensayo",
      type_bite: "Señal",
      count_one: "1 módulo",
      count_many: "{n} módulos",
    },
    en: {
      title: "Observatory of Latin American futures.",
      sub: "Micro essays and curated signals on how the region imagines, writes and builds what comes next.",
      filter_all: "All",
      filter_bite: "Bites",
      filter_microensayo: "Microessays",
      search_label: "Search",
      search_placeholder: "search title, tag or source…",
      empty: "No results. Try a different word.",
      footer_about:
        "Futureña is an independent project by Malex Salamanqués. No affiliation, no algorithm.",
      footer_email: "Write",
      footer_year: "MMXXVI",
      type_microensayo: "Microessay",
      type_bite: "Bite",
      count_one: "1 module",
      count_many: "{n} modules",
    },
  };

  const state = {
    lang: (localStorage.getItem("futurena.lang") || "es"),
    filter: "all",
    query: "",
    modules: [],
  };

  // ---------- DOM refs ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const gridEl = $("#grid");
  const emptyEl = $("[data-empty]");
  const searchInput = $("#search-input");
  const searchCount = $("[data-search-count]");

  // ---------- Boot ----------
  init();

  async function init() {
    applyLang(state.lang, { skipRender: true });

    try {
      const res = await fetch("content.json", { cache: "no-store" });
      if (!res.ok) throw new Error("content.json " + res.status);
      const data = await res.json();
      state.modules = Array.isArray(data.modules) ? data.modules : [];
    } catch (err) {
      console.error("Could not load content.json:", err);
      state.modules = [];
    }

    bindEvents();
    render();
  }

  // ---------- Events ----------
  function bindEvents() {
    // Language toggle
    $("[data-lang-switch]").addEventListener("click", () => {
      const next = state.lang === "es" ? "en" : "es";
      applyLang(next);
    });

    // Filter pills
    $$(".filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.filter = btn.dataset.filter;
        $$(".filter").forEach((b) => {
          const active = b === btn;
          b.classList.toggle("active", active);
          b.setAttribute("aria-selected", active ? "true" : "false");
        });
        render();
      });
    });

    // Search
    searchInput.addEventListener("input", (e) => {
      state.query = e.target.value.trim().toLowerCase();
      render();
    });

    // Keyboard: '/' focuses search
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchInput) {
        searchInput.value = "";
        state.query = "";
        render();
      }
    });
  }

  // ---------- Language ----------
  function applyLang(lang, { skipRender = false } = {}) {
    state.lang = lang;
    localStorage.setItem("futurena.lang", lang);
    document.documentElement.lang = lang;

    // Swap text-content nodes
    $$("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (I18N[lang][key] != null) el.textContent = I18N[lang][key];
    });

    // Swap attribute-bound copy (e.g. placeholder)
    $$("[data-i18n-attr]").forEach((el) => {
      const pairs = el.dataset.i18nAttr.split(",");
      pairs.forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        if (attr && key && I18N[lang][key] != null) {
          el.setAttribute(attr, I18N[lang][key]);
        }
      });
    });

    // Update the toggle chip
    const current = $("[data-current-lang]");
    const other = $("[data-other-lang]");
    if (current && other) {
      current.textContent = lang.toUpperCase();
      other.textContent = (lang === "es" ? "en" : "es").toUpperCase();
    }

    if (!skipRender) render();
  }

  // ---------- Render ----------
  function render() {
    if (!gridEl) return;

    const t = I18N[state.lang];
    const visible = state.modules.filter(matches);

    gridEl.innerHTML = visible.map(tileHTML).join("");

    if (visible.length === 0) {
      emptyEl.hidden = false;
      searchCount.textContent = "";
    } else {
      emptyEl.hidden = true;
      const tmpl = visible.length === 1 ? t.count_one : t.count_many;
      searchCount.textContent = tmpl.replace("{n}", visible.length);
    }
  }

  function matches(m) {
    if (state.filter !== "all" && m.type !== state.filter) return false;
    if (!state.query) return true;

    const fields = [
      m.title?.es,
      m.title?.en,
      m.essay?.es,
      m.essay?.en,
      m.source,
      (m.tags || []).join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return fields.includes(state.query);
  }

  function tileHTML(m) {
    const t = I18N[state.lang];
    const lang = state.lang;
    const title = (m.title && m.title[lang]) || m.title?.es || "";
    const essay = (m.essay && m.essay[lang]) || m.essay?.es || "";
    const altText =
      (m.thumbnail_alt && m.thumbnail_alt[lang]) ||
      m.thumbnail_alt?.es ||
      title ||
      "";
    const typeLabel = m.type === "microensayo" ? t.type_microensayo : t.type_bite;
    const sizeClass = m.size === "wide" ? "is-wide" : "";
    const num = String(m.id || "").slice(0, 6);

    const dateStr = m.date
      ? new Date(m.date).toLocaleDateString(lang === "es" ? "es" : "en", {
          year: "numeric",
          month: "short",
        })
      : "";

    const thumb = m.thumbnail
      ? `<div class="tile-thumb">
           <img src="${escapeAttr(m.thumbnail)}" alt="${escapeAttr(altText)}" loading="lazy" />
         </div>`
      : `<div class="tile-thumb is-empty" aria-hidden="true"></div>`;

    const tags =
      Array.isArray(m.tags) && m.tags.length
        ? `<div class="tile-tags">${m.tags
            .map((tag) => `<span class="tile-tag">${escapeHTML(tag)}</span>`)
            .join("")}</div>`
        : "";

    // Multi-source list (essays only). Renders inside the tile-body.
    const sourcesLabel = lang === "es" ? "Fuentes" : "Sources";
    const sourcesList =
      m.type === "microensayo" && Array.isArray(m.sources) && m.sources.length
        ? `<ul class="tile-sources" aria-label="${sourcesLabel}">
             ${m.sources
               .map(
                 (s) =>
                   `<li><a href="${escapeAttr(s.url)}" target="_blank" rel="noopener">
                      <span>${escapeHTML(s.name || s.url)}</span>
                      <span class="tile-sources-arrow" aria-hidden="true">↗</span>
                    </a></li>`
               )
               .join("")}
           </ul>`
        : "";

    const footer = `
      <div class="tile-footer">
        <span class="tile-source">${escapeHTML(m.source || dateStr || "")}</span>
        <span class="tile-arrow" aria-hidden="true">${m.url ? "↗" : "·"}</span>
      </div>
    `;

    const body = `
      ${thumb}
      <div class="tile-body">
        <div class="tile-meta">
          <span class="tile-number">№ ${escapeHTML(num)}</span>
          <span class="tile-type">${escapeHTML(typeLabel)}</span>
        </div>
        <h2 class="tile-title">${escapeHTML(title)}</h2>
        ${tags}
        <p class="tile-excerpt">${escapeHTML(essay)}</p>
        ${sourcesList}
        ${footer}
      </div>
    `;

    // Essays with multiple sources: tile is NOT a single link
    // (each source row is its own link inside).
    const isMultiSourceEssay =
      m.type === "microensayo" && Array.isArray(m.sources) && m.sources.length > 0;

    if (m.url && !isMultiSourceEssay) {
      return `
        <article class="tile ${sizeClass}" data-type="${escapeAttr(m.type)}">
          <a class="tile-link" href="${escapeAttr(m.url)}" target="_blank" rel="noopener">
            ${body}
          </a>
        </article>
      `;
    }

    return `
      <article class="tile ${sizeClass}" data-type="${escapeAttr(m.type)}">
        ${body}
      </article>
    `;
  }

  // ---------- Helpers ----------
  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function escapeAttr(s) {
    return escapeHTML(s);
  }
})();
