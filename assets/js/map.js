/* Research network map. Data: SITE.places in data.js.
   Land: Natural Earth 110m (coastlines only, no political boundaries). */
(function () {
  "use strict";
  const S = window.SITE;
  const stage = document.getElementById("map-stage");
  if (!stage) return;
  const canvas = document.getElementById("map-canvas"), svg = document.getElementById("map-svg");
  const markersEl = document.getElementById("map-markers"), panel = document.getElementById("map-panel");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const KINDS = {
    home: { label: "Current PhD", order: 0 },
    research: { label: "Research positions", order: 1 },
    coauthor: { label: "Co-authors", order: 2 },
    event: { label: "Conferences and training", order: 3 },
    study: { label: "Study regions and field work", order: 4 }
  };
  // Chronological path of research positions (place names must match data.js)
  const PATH = ["Goa, India", "Gandhinagar, India", "Bhopal, India", "Jodhpur, India", "Hyderabad, India", "Prague, Czechia"];

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const visible = Object.fromEntries(Object.keys(KINDS).map((k) => [k, true]));
  let view = "world", showPath = true, selected = null, drawnOnce = false, started = false;

  if (!window.d3 || !window.d3.geoPath || !window.topojson || !window.LAND_110M) {
    stage.insertAdjacentHTML("beforeend", '<p class="map-msg">The map could not load. All places are listed in the panel.</p>');
  }
  const hasMap = !!(window.d3 && window.d3.geoPath && window.topojson && window.LAND_110M);
  const land = hasMap ? topojson.feature(LAND_110M, LAND_110M.objects.land) : null;

  /* legend */
  const legend = document.getElementById("map-legend");
  const count = (k) => S.places.filter((p) => p.entries.some((e) => e.kind === k)).length;
  legend.innerHTML = Object.entries(KINDS).map(([k, v]) =>
    `<button type="button" class="lgd" data-k="${k}" aria-pressed="true"><span class="sw sw-${k}"></span>${v.label} <span aria-hidden="true">(${count(k)})</span></button>`).join("");
  legend.addEventListener("click", (e) => {
    const b = e.target.closest(".lgd"); if (!b) return;
    visible[b.dataset.k] = !visible[b.dataset.k];
    b.setAttribute("aria-pressed", String(visible[b.dataset.k]));
    render();
  });
  document.querySelectorAll(".seg-btn").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  document.getElementById("path-toggle").addEventListener("change", (e) => { showPath = e.target.checked; render(); });

  function setView(v) {
    view = v; selected = null;
    document.querySelectorAll(".seg-btn").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.view === v)));
    render(); showDefault();
  }

  function projection(w, h) {
    const pad = 22;
    if (view === "india") {
      const box = { type: "MultiPoint", coordinates: [[66.5, 7.5], [89, 32.5]] };
      return d3.geoMercator().fitExtent([[pad, pad], [w - pad, h - pad]], box);
    }
    const box = { type: "MultiPoint", coordinates: [[-80, 8], [92, 8], [-80, 58], [92, 58], [10, 62]] };
    return d3.geoNaturalEarth1().fitExtent([[pad, pad], [w - pad, h - pad]], box);
  }

  function visibleEntries(p) { return p.entries.filter((e) => visible[e.kind]); }
  function primary(entries) { return entries.map((e) => e.kind).sort((a, b) => KINDS[a].order - KINDS[b].order)[0]; }

  function render() {
    const r = stage.getBoundingClientRect(), w = r.width, h = r.height;
    if (!w || !h) return;
    markersEl.innerHTML = ""; svg.innerHTML = "";
    if (!hasMap) { renderPanelList(); return; }
    const proj = projection(w, h);

    /* land as dot matrix */
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const off = document.createElement("canvas"); off.width = Math.round(w); off.height = Math.round(h);
    const octx = off.getContext("2d"); octx.fillStyle = "#000";
    octx.beginPath(); d3.geoPath(proj, octx)(land); octx.fill();
    const data = octx.getImageData(0, 0, off.width, off.height).data;
    const step = view === "india" ? 7 : (w < 600 ? 5 : 6);
    ctx.clearRect(0, 0, w, h);
    // graticule
    ctx.strokeStyle = "rgba(169,189,201,.08)"; ctx.lineWidth = 1; ctx.beginPath();
    d3.geoPath(proj, ctx)(d3.geoGraticule10()); ctx.stroke();
    ctx.fillStyle = "rgba(169,189,201,.38)";
    for (let y = step / 2; y < h; y += step) {
      for (let x = step / 2; x < w; x += step) {
        const i = (Math.floor(y) * off.width + Math.floor(x)) * 4 + 3;
        if (data[i] > 0) { ctx.beginPath(); ctx.arc(x, y, view === "india" ? 1.5 : 1.15, 0, 7); ctx.fill(); }
      }
    }

    /* research path */
    if (showPath) {
      const pts = PATH.map((n) => S.places.find((p) => p.name === n)).filter(Boolean).map((p) => proj([p.lon, p.lat]));
      const NS = "http://www.w3.org/2000/svg";
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
        const bend = 0.22, cx = mx - dy * bend, cy = my + dx * bend;
        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`);
        path.setAttribute("class", "arc");
        svg.appendChild(path);
        if (!drawnOnce && !reduceMotion) {
          const L = path.getTotalLength();
          path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
          path.style.transition = `stroke-dashoffset 700ms ease ${i * 450}ms`;
          requestAnimationFrame(() => requestAnimationFrame(() => (path.style.strokeDashoffset = 0)));
        }
      }
    }

    /* markers with simple clustering */
    const items = S.places.map((p) => ({ p, e: visibleEntries(p) })).filter((x) => x.e.length)
      .map((x) => ({ ...x, kind: primary(x.e), xy: proj([x.p.lon, x.p.lat]) }))
      .filter((x) => x.xy && x.xy[0] > -10 && x.xy[0] < w + 10 && x.xy[1] > -10 && x.xy[1] < h + 10)
      .sort((a, b) => KINDS[a.kind].order - KINDS[b.kind].order);
    const R = view === "india" ? 13 : 16, clusters = [];
    items.forEach((it) => {
      const c = clusters.find((c) => Math.hypot(c.xy[0] - it.xy[0], c.xy[1] - it.xy[1]) < R);
      if (c) c.items.push(it); else clusters.push({ xy: it.xy, items: [it] });
    });
    clusters.forEach((c) => {
      const b = document.createElement("button");
      b.type = "button";
      const single = c.items.length === 1, it = c.items[0];
      const name = single ? it.p.name
        : c.items.every((x) => x.p.lon > 60 && x.p.lon < 95) && view === "world" ? "India"
        : c.items.map((x) => x.p.name.split(",")[0]).join(" and ");
      b.className = `mk mk-${it.kind}` + (selected === name ? " sel" : "");
      b.style.left = c.xy[0] + "px"; b.style.top = c.xy[1] + "px";
      const n = c.items.reduce((s, x) => s + x.e.length, 0);
      b.setAttribute("aria-label", single ? `${name}: ${n} item${n > 1 ? "s" : ""}` : `${name}: ${c.items.length} places`);
      b.innerHTML = `<i></i>${single ? "" : `<span class="mk-n">${c.items.length}</span>`}<span class="mk-label">${esc(name)}</span>`;
      b.addEventListener("click", () => { selected = name; markersEl.querySelectorAll(".mk").forEach((m) => m.classList.toggle("sel", m === b)); showPlaces(name, c.items); });
      markersEl.appendChild(b);
    });
    drawnOnce = drawnOnce || showPath;
  }

  function entryList(entries) {
    return `<ul>${entries.map((e) => `<li><span class="sw sw-${e.kind}"></span><span><span class="k">${KINDS[e.kind].label}</span><span class="t">${esc(e.text)}</span></span></li>`).join("")}</ul>`;
  }
  function showPlaces(name, items) {
    if (items.length === 1) { panel.innerHTML = `<h3>${esc(name)}</h3>${entryList(items[0].e)}`; return; }
    const zoom = view === "world" && name === "India" ? `<p class="sum"><button type="button" class="seg-btn" style="border:1px solid var(--night-line)" id="zoom-india">Zoom to India</button></p>` : "";
    panel.innerHTML = `<h3>${esc(name)}</h3>${zoom}` + items.map((it) => `<p style="margin:1rem 0 .2rem;color:var(--night-ink);font-weight:600">${esc(it.p.name)}</p>${entryList(it.e)}`).join("");
    const z = document.getElementById("zoom-india"); if (z) z.addEventListener("click", () => setView("india"));
  }
  function showDefault() {
    const n = S.places.length;
    panel.innerHTML = `<h3>${n} places</h3><p>Select a marker to see what happened there. Numbered markers group nearby places${view === "world" ? "; switch to the India view to separate them" : ""}.</p>
      <p class="sum">The gold line traces my research positions in order: Goa, Gandhinagar, Bhopal, Jodhpur, Hyderabad and Prague.</p>`;
  }
  function renderPanelList() {
    panel.innerHTML = S.places.map((p) => `<h3 style="font-size:1.05rem;margin-top:1rem">${esc(p.name)}</h3>${entryList(p.entries)}`).join("");
  }

  showDefault();
  // draw when the section first approaches the viewport so the path animation is seen
  const start = () => { started = true; render(); };
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: "0px 0px -25% 0px" });
    io.observe(stage);
  } else start();
  let t; new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => { if (started) render(); }, 120); }).observe(stage);
})();
