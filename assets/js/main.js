/* Page behaviour and rendering of content from data.js */
(function () {
  "use strict";
  const S = window.SITE;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ext = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`;

  /* ---------- header, menu, active section ---------- */
  const header = $(".site-header");
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 8);
    if (window.scrollY < 300) $$("#nav a.active").forEach((a) => a.classList.remove("active"));
  };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  const nav = $("#nav"), menuBtn = $(".menu-btn");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
  });
  $$("#nav a").forEach((a) => a.addEventListener("click", () => {
    if (nav.classList.contains("open")) menuBtn.click();
  }));

  const navLinks = $$('#nav a[href^="#"]');
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => io.observe(s));
  }

  $("#year").textContent = new Date().getFullYear();
  $("#updated").textContent = S.lastUpdated;
  $("#scholar-link").href = S.links.scholar;

  /* ---------- PhD details (only shown once filled in data.js) ---------- */
  (function renderPhd() {
    const p = S.phd, box = $("#phd-details");
    if (p.title) $("#phd-title").textContent = p.title;
    const parts = [];
    if (p.questions && p.questions.length) parts.push(`<h4>Research questions</h4><ul>${p.questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>`);
    if (p.studyDomain) parts.push(`<h4>Study domain</h4><p>${esc(p.studyDomain)}</p>`);
    if (p.models && p.models.length) parts.push(`<h4>Models and data</h4><p>${p.models.map(esc).join(", ")}</p>`);
    if (p.funding) parts.push(`<h4>Funding</h4><p>${esc(p.funding)}</p>`);
    box.innerHTML = parts.length
      ? `<div class="phd-detail">${parts.join("")}</div>`
      : `<p class="phd-detail">Project details, research questions and first results will be added here as the work develops.</p>`;
  })();

  /* ---------- projects ---------- */
  const THEME_NAMES = {
    forecasting: "Forecasting", modelling: "Modelling", extremes: "Extremes",
    impacts: "Climate & water", geospatial: "Geospatial", uncertainty: "Uncertainty"
  };
  const projList = $("#project-list"), projFilters = $("#project-filters");
  projList.innerHTML = S.projects.map((p) => {
    const rows = [
      ["Question", p.question], ["Data and methods", p.data], ["Outcome", p.outcome],
      ["Supervisor", p.supervisor], ["My role", p.role],
      ["Outputs", p.outputs && p.outputs.length ? `<ul>${p.outputs.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>` : null, true],
      ["Coverage", p.press && p.press.length ? p.press.map((x) => ext(x.url, esc(x.label))).join(", ") : null, true]
    ].filter((r) => r[1]);
    const missing = !p.question && !p.outcome;
    return `<details class="project" data-themes="${p.themes.join(" ")}" id="p-${p.id}">
      <summary>
        <span class="p-when">${esc(p.period)}</span>
        <span><span class="p-title">${esc(p.title)}</span><span class="p-where">${esc(p.place)}</span></span>
        <span class="p-status ${p.status === "Ongoing" ? "ongoing" : ""}">${esc(p.status)}</span>
      </summary>
      <div class="p-body">
        <p>${esc(p.overview)}</p>
        <dl class="p-dl">${rows.map(([k, v, html]) => `<dt>${k}</dt><dd>${html ? v : esc(v)}</dd>`).join("")}</dl>
        ${missing && p.status !== "Ongoing" ? `<p class="p-pending">Findings from this project are not yet published.</p>` : ""}
      </div>
    </details>`;
  }).join("");

  const usedThemes = [...new Set(S.projects.flatMap((p) => p.themes))];
  projFilters.innerHTML = [`<button class="chip" type="button" data-f="all" aria-pressed="true">All projects</button>`]
    .concat(usedThemes.map((t) => `<button class="chip" type="button" data-f="${t}" aria-pressed="false">${THEME_NAMES[t] || t}</button>`)).join("");

  function filterProjects(theme) {
    $$(".chip", projFilters).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.f === theme)));
    $$(".project", projList).forEach((el) => {
      el.hidden = theme !== "all" && !el.dataset.themes.split(" ").includes(theme);
    });
  }
  projFilters.addEventListener("click", (e) => { const b = e.target.closest("[data-f]"); if (b) filterProjects(b.dataset.f); });

  /* research themes link to the projects behind them */
  const hint = $("#theme-hint");
  $$(".theme").forEach((row) => {
    row.tabIndex = 0; row.setAttribute("role", "button"); row.setAttribute("aria-pressed", "false");
    const activate = () => {
      const t = row.dataset.theme;
      const matches = S.projects.filter((p) => p.themes.includes(t));
      $$(".theme").forEach((r) => r.setAttribute("aria-pressed", String(r === row)));
      if (!matches.length) {
        hint.innerHTML = "No completed project sits under this theme yet. It describes a direction I’m developing.";
        return;
      }
      hint.innerHTML = `Projects behind this theme: ${matches.map((p) => `<a href="#p-${p.id}" data-open="${p.id}">${esc(p.title)}</a>`).join(", ")}.`;
    };
    row.addEventListener("click", activate);
    row.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); } });
  });
  hint.addEventListener("click", (e) => {
    const a = e.target.closest("[data-open]"); if (!a) return;
    filterProjects("all");
    const d = $("#p-" + a.dataset.open); if (d) d.open = true;
  });

  /* ---------- publications ---------- */
  const TYPE = { journal: "Journal article", chapter: "Book chapter", review: "Under review", conference: "Conference contribution" };
  const ORDER = { journal: 0, chapter: 1, review: 2, conference: 3 };
  const pubs = S.publications.slice().sort((a, b) => (b.featured - a.featured) || (ORDER[a.type] - ORDER[b.type]) || (b.year - a.year));
  const boldMe = (s) => esc(s).replace(/Raj, C\./g, "<b>Raj, C.</b>");
  const citation = (p) => `${p.authors} (${p.year}). ${p.title}. ${p.venue}${p.details ? ", " + p.details : ""}.${p.doi ? " https://doi.org/" + p.doi : ""}`;

  $("#pub-list").innerHTML = pubs.map((p, i) => `
    <article class="pub ${p.featured ? "featured" : ""}" data-type="${p.type}">
      <div class="pub-yr">${p.year}</div>
      <div>
        <span class="pub-type ${p.type === "review" ? "rev" : ""}">${TYPE[p.type]}</span>
        <h3>${esc(p.title)}</h3>
        <p class="pub-au">${boldMe(p.authors)}</p>
        <p class="pub-venue"><i>${esc(p.venue)}</i>${p.details ? ", " + esc(p.details) : ""}</p>
        ${p.summary ? `<p class="pub-sum">${esc(p.summary)}</p>` : ""}
        <div class="pub-act">
          ${p.doi ? `<a class="doi" href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">doi:${esc(p.doi)}</a>` : ""}
          ${p.url ? `<a class="pub-link" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.urlLabel || "Link")}</a>` : ""}
          ${p.doi ? `<button class="copy" type="button" data-i="${i}">Copy citation</button>` : ""}
        </div>
      </div>
    </article>`).join("");

  $("#pub-list").addEventListener("click", async (e) => {
    const b = e.target.closest(".copy"); if (!b) return;
    const text = citation(pubs[+b.dataset.i]);
    try { await navigator.clipboard.writeText(text); b.textContent = "Citation copied"; }
    catch { window.prompt("Copy the citation:", text); }
    setTimeout(() => (b.textContent = "Copy citation"), 2000);
  });

  const types = Object.keys(TYPE).filter((t) => pubs.some((p) => p.type === t));
  const pubFilters = $("#pub-filters");
  pubFilters.innerHTML = [`<button class="chip" type="button" data-f="all" aria-pressed="true">All (${pubs.length})</button>`]
    .concat(types.map((t) => `<button class="chip" type="button" data-f="${t}" aria-pressed="false">${TYPE[t]} (${pubs.filter((p) => p.type === t).length})</button>`)).join("");
  pubFilters.addEventListener("click", (e) => {
    const b = e.target.closest("[data-f]"); if (!b) return;
    $$(".chip", pubFilters).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    $$(".pub").forEach((el) => (el.hidden = b.dataset.f !== "all" && el.dataset.type !== b.dataset.f));
  });

  /* ---------- people ---------- */
  const GROUPS = [
    ["supervision", "Supervision and mentorship", "Supervisors of my PhD, fellowships, thesis and internships."],
    ["coauthor", "Co-authors", "Research collaborators on published and submitted work."],
    ["lab", "AQUARIUS colleagues", "PhD researchers in my current lab."]
  ];
  const countWith = (m) => S.publications.filter((p) => p.authors.includes(m) && p.authors.includes("Raj, C.")).length;
  $("#people").innerHTML = GROUPS.map(([g, title, desc]) => {
    const list = S.people.filter((p) => p.group === g);
    if (!list.length) return "";
    return `<div><h3>${title}</h3><p class="pg-d">${desc}</p><ul>${list.map((p) => {
      const n = p.match ? countWith(p.match) : 0;
      const role = p.match && n ? `${p.role} on ${n} output${n > 1 ? "s" : ""}` : p.role;
      return `<li><span class="nm">${p.url ? ext(p.url, esc(p.name)) : esc(p.name)}</span><span class="rl">${esc(role)}, ${esc(p.org)}</span></li>`;
    }).join("")}</ul></div>`;
  }).join("");

  /* ---------- timeline ---------- */
  const KIND = { position: "Position", education: "Education", talk: "Talk", publication: "Publication", training: "Workshop / field work" };
  const tl = S.timeline.slice().sort((a, b) => b.date.localeCompare(a.date));
  $("#timeline").innerHTML = tl.map((t) => `
    <li class="tl tl-${t.kind}" data-kind="${t.kind}" ${t.kind === "training" ? "hidden" : ""}>
      <span class="tl-date">${esc(t.label)}</span>
      <span class="tl-mark" aria-hidden="true"></span>
      <span><span class="tl-t">${esc(t.title)}</span><span class="tl-k">${KIND[t.kind]}</span><span class="tl-o">${esc(t.org)}</span></span>
    </li>`).join("");
  $("#training-toggle").addEventListener("change", (e) => {
    $$('.tl[data-kind="training"]').forEach((el) => (el.hidden = !e.target.checked));
  });

  /* ---------- workflow ---------- */
  const FLOW = [
    { t: "Acquire data", d: "Station and gridded climate records, satellite imagery and the indices derived from them.", tools: ["Precipitation and temperature records", "Sentinel-2", "Landsat 8", "Google Earth Engine"] },
    { t: "Process and clean", d: "Reproducible scripts to clean, subset, regrid and combine datasets, from single sites to national scale.", tools: ["Python", "R", "MATLAB", "Google Earth Engine", "SNAP", "ENVI", "Linux"] },
    { t: "Analyse", d: "Standardized indices, joint probabilities and trend analysis to characterise extremes and how they change.", tools: ["SPI", "STI", "Bivariate empirical probability", "Trend analysis", "DSAS shoreline statistics", "JASP"] },
    { t: "Model", d: "Process-based hydrological models alongside data-driven, machine-learning approaches.", tools: ["VIC", "SWAT", "LSTM", "Random forest", "KNN"] },
    { t: "Predict", d: "Forecasts at seasonal to subseasonal lead times, and in my PhD, hydrological forecasts for early warning.", tools: ["Seasonal-to-subseasonal forecasts", "Hydrological forecasting (PhD)"] },
    { t: "Interpret and share", d: "Maps, figures and papers that turn results into evidence for adaptation and water management.", tools: ["QGIS", "ArcGIS", "LaTeX", "Journal papers", "AGU and IAHS talks", "Teaching (Google Earth Engine)"] }
  ];
  const flowBtns = $$("#flow button"), flowPanel = $("#flow-panel");
  function showStep(i) {
    flowBtns.forEach((b, j) => { b.setAttribute("aria-selected", String(i === j)); b.tabIndex = i === j ? 0 : -1; });
    const s = FLOW[i];
    flowPanel.setAttribute("aria-labelledby", "flow-" + i);
    flowPanel.innerHTML = `<h3>${s.t}</h3><p>${s.d}</p><ul class="tools">${s.tools.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
  }
  flowBtns.forEach((b, i) => {
    b.addEventListener("click", () => showStep(i));
    b.addEventListener("keydown", (e) => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return;
      const n = (i + k + flowBtns.length) % flowBtns.length; showStep(n); flowBtns[n].focus();
    });
  });
  showStep(0);

  /* ---------- contact profiles ---------- */
  const L = S.links;
  $("#profiles").innerHTML = [
    ["Google Scholar", L.scholar], ["ORCID", L.orcid], ["LinkedIn", L.linkedin],
    ["ResearchGate", L.researchgate], ["GitHub", L.github]
  ].filter((x) => x[1]).map(([n, u]) => ext(u, n)).join("");
})();
