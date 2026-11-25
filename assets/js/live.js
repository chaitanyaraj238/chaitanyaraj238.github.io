/* Live river forecast console (homepage).
   Data: GloFAS v4 ensemble forecasts (Copernicus EMS) via the Open-Meteo Flood API, CC BY 4.0.
   If the service cannot be reached, a clearly labelled synthetic schematic is shown instead. */
(function () {
  "use strict";
  const S = window.SITE, rivers = S.rivers || [];
  const cv = document.getElementById("live-canvas");
  if (!cv || !rivers.length) return;

  const API = "https://flood-api.open-meteo.com/v1/flood";
  const PAST = 40, FUT = 30;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const fmt = (v) => v == null || isNaN(v) ? "–" : v >= 100 ? Math.round(v).toLocaleString("en-GB") : v >= 10 ? v.toFixed(1) : v.toFixed(2);
  const dfmt = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  const today = new Date().toISOString().slice(0, 10);

  let current = null, model = null, hoverIdx = null, reveal = 1, raf = null, firstDraw = true;

  /* ---------- data ---------- */
  async function getJSON(url) {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 10000);
    try {
      const r = await fetch(url, { signal: ctl.signal });
      const j = await r.json();
      if (!r.ok || j.error) throw new Error(j.reason || "HTTP " + r.status);
      return j;
    } finally { clearTimeout(t); }
  }
  async function pickCell(rv) {
    const lat = rv.candidates.map((c) => c[0]).join(","), lon = rv.candidates.map((c) => c[1]).join(",");
    const j = await getJSON(`${API}?latitude=${lat}&longitude=${lon}&daily=river_discharge&past_days=14&forecast_days=1&cell_selection=nearest`);
    const list = Array.isArray(j) ? j : [j];
    let best = null, bestMean = -1;
    list.forEach((loc, i) => {
      const v = (loc.daily && loc.daily.river_discharge || []).filter((x) => x != null);
      const m = v.length ? v.reduce((a, b) => a + b, 0) / v.length : -1;
      if (m > bestMean) { bestMean = m; best = rv.candidates[i]; }
    });
    if (!best) throw new Error("No river cell found");
    return best;
  }
  const quant = (arr, p) => { const s = arr.slice().sort((a, b) => a - b); if (!s.length) return null; const i = (s.length - 1) * p, lo = Math.floor(i); return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo); };

  function buildModel(j, rv, cell) {
    const d = j.daily, dates = d.time;
    let t0 = dates.findIndex((x) => x >= today); if (t0 < 0) t0 = dates.length - 1;
    const memberKeys = Object.keys(d).filter((k) => /^river_discharge(_member\d+)?$/.test(k));
    const past = dates.slice(0, t0 + 1).map((_, i) => d.river_discharge[i]);
    const n = dates.length - t0;
    const q = { p10: [], p25: [], p50: [], p75: [], p90: [] }, members = [];
    if (memberKeys.length > 3) {
      memberKeys.forEach((k) => members.push(d[k].slice(t0)));
      for (let t = 0; t < n; t++) {
        const c = members.map((m) => m[t]).filter((v) => v != null);
        q.p10.push(quant(c, .1)); q.p25.push(quant(c, .25)); q.p50.push(quant(c, .5)); q.p75.push(quant(c, .75)); q.p90.push(quant(c, .9));
      }
    } else if (d.river_discharge_median) {
      const sl = (k) => d[k].slice(t0);
      q.p10 = sl("river_discharge_min"); q.p25 = sl("river_discharge_p25"); q.p50 = sl("river_discharge_median");
      q.p75 = sl("river_discharge_p75"); q.p90 = sl("river_discharge_max");
    } else throw new Error("No ensemble data in response");
    return { rv, cell, dates, t0, past, members, q, nMembers: members.length, minmax: !members.length, synthetic: false };
  }

  async function load(rv) {
    const key = "glofas:" + rv.id + ":" + today;
    try { const c = sessionStorage.getItem(key); if (c) return JSON.parse(c); } catch (e) {}
    const cell = await pickCell(rv);
    let j;
    try {
      j = await getJSON(`${API}?latitude=${cell[0]}&longitude=${cell[1]}&daily=river_discharge&ensemble=true&past_days=${PAST}&forecast_days=${FUT}&cell_selection=nearest`);
      if (!Object.keys(j.daily).some((k) => /member/.test(k))) throw new Error("no members");
    } catch (e) {
      j = await getJSON(`${API}?latitude=${cell[0]}&longitude=${cell[1]}&daily=river_discharge,river_discharge_median,river_discharge_p25,river_discharge_p75,river_discharge_min,river_discharge_max&past_days=${PAST}&forecast_days=${FUT}&cell_selection=nearest`);
    }
    const m = buildModel(j, rv, cell);
    try { sessionStorage.setItem(key, JSON.stringify(m)); } catch (e) {}
    return m;
  }

  /* synthetic fallback, shaped like the real model */
  function synthetic(rv) {
    let seed = 20261; const r = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const rain = (g) => (g() < 0.24 ? -Math.log(1 - g()) * 9 : 0);
    const run = (rs, st) => { let { f, s } = st; const q = rs.map((p) => { f += .62 * p; s += .38 * p; const a = .34 * f, b = .035 * s; f -= a; s -= b; return (a + b + 1.5) * 10; }); return { q, st: { f, s } }; };
    const rt = Array.from({ length: PAST + FUT }, () => rain(r));
    const p = run(rt.slice(0, PAST), { f: 4, s: 60 });
    const members = [];
    for (let k = 0; k < 30; k++) {
      const rr = rt.slice(PAST).map((v, i) => { const w = Math.exp(-(i + 1) / 5.5); return w * v * Math.exp((r() - .5) * .9) + (1 - w) * rain(r); });
      members.push([p.q[PAST - 1]].concat(run(rr, p.st).q));
    }
    const dates = Array.from({ length: PAST + FUT }, (_, i) => new Date(Date.now() + (i - PAST + 1) * 864e5).toISOString().slice(0, 10));
    const q = { p10: [], p25: [], p50: [], p75: [], p90: [] };
    for (let t = 0; t <= FUT; t++) { const c = members.map((m) => m[t]); q.p10.push(quant(c, .1)); q.p25.push(quant(c, .25)); q.p50.push(quant(c, .5)); q.p75.push(quant(c, .75)); q.p90.push(quant(c, .9)); }
    return { rv, cell: null, dates, t0: PAST - 1, past: p.q, members, q, nMembers: 30, minmax: false, synthetic: true };
  }

  /* ---------- drawing ---------- */
  function niceMax(v) { const e = Math.pow(10, Math.floor(Math.log10(v))); const f = v / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e; }

  function draw() {
    if (!model) return;
    const rect = cv.getBoundingClientRect(), w = rect.width, h = rect.height, dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    const narrow = w < 560;
    const { dates, t0, past, q, members } = model, N = dates.length;
    const start = narrow ? Math.max(0, t0 - 20) : 0;
    const pad = { l: 46, r: 12, t: 16, b: 26 };
    const vals = past.slice(start).concat(q.p90).filter((v) => v != null);
    const ymax = niceMax(Math.max(...vals) * 1.08);
    const X = (i) => pad.l + ((i - start) / (N - 1 - start)) * (w - pad.l - pad.r);
    const Y = (v) => h - pad.b - (v / ymax) * (h - pad.t - pad.b);
    const sans = getComputedStyle(document.documentElement).getPropertyValue("--sans");
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--mono");

    // grid & axes
    ctx.font = `400 10.5px ${mono}`; ctx.textBaseline = "middle";
    for (let k = 0; k <= 4; k++) {
      const v = (ymax / 4) * k, y = Math.round(Y(v)) + .5;
      ctx.strokeStyle = "rgba(169,189,201,.12)"; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.fillStyle = "#8FA6B3"; ctx.textAlign = "right"; ctx.fillText(ymax >= 8 ? Math.round(v).toLocaleString("en-GB") : v.toFixed(ymax >= 0.8 ? 1 : 2), pad.l - 8, y);
    }
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.font = `500 10.5px ${sans}`;
    const step = narrow ? 10 : 7;
    for (let i = t0 % step; i < N; i += step) if (i >= start && Math.abs(i - t0) > 2 && X(i) > pad.l + 18 && X(i) < w - pad.r - 22) { ctx.fillStyle = "#8FA6B3"; ctx.fillText(dfmt(dates[i]), X(i), h - 8); }

    // today line
    const xt = Math.round(X(t0)) + .5;
    ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = "rgba(230,238,242,.45)"; ctx.beginPath(); ctx.moveTo(xt, pad.t); ctx.lineTo(xt, h - pad.b); ctx.stroke(); ctx.restore();
    ctx.fillStyle = "#E6EEF2"; ctx.font = `600 11px ${sans}`; ctx.fillText("Today", xt, h - 8);

    // past simulated discharge
    ctx.strokeStyle = "#E6EEF2"; ctx.lineWidth = 1.8; ctx.lineJoin = "round"; ctx.beginPath();
    let moved = false;
    for (let i = start; i <= t0; i++) { const v = past[i]; if (v == null) continue; moved ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)); moved = true; }
    ctx.stroke();

    // forecast
    const nF = Math.max(1, Math.round(reveal * (N - t0)));
    const band = (lo, hi, col) => { ctx.fillStyle = col; ctx.beginPath(); for (let t = 0; t < nF; t++) ctx.lineTo(X(t0 + t), Y(hi[t])); for (let t = nF - 1; t >= 0; t--) ctx.lineTo(X(t0 + t), Y(lo[t])); ctx.closePath(); ctx.fill(); };
    ctx.save(); ctx.beginPath(); ctx.rect(pad.l, pad.t - 4, w - pad.l - pad.r, h - pad.t - pad.b + 4); ctx.clip();
    band(q.p10, q.p90, "rgba(61,176,194,.13)");
    band(q.p25, q.p75, "rgba(61,176,194,.26)");
    ctx.strokeStyle = "rgba(95,208,219,.22)"; ctx.lineWidth = 1;
    members.forEach((m) => { ctx.beginPath(); let mv = false; for (let t = 0; t < nF; t++) { const v = m[t]; if (v == null) continue; mv ? ctx.lineTo(X(t0 + t), Y(v)) : ctx.moveTo(X(t0 + t), Y(v)); mv = true; } ctx.stroke(); });
    ctx.strokeStyle = "#5FD0DB"; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let t = 0; t < nF; t++) t ? ctx.lineTo(X(t0 + t), Y(q.p50[t])) : ctx.moveTo(X(t0), Y(q.p50[0]));
    ctx.stroke(); ctx.restore();

    // hover readout
    if (hoverIdx != null && hoverIdx >= start) {
      const i = hoverIdx, x = X(i), f = i - t0;
      ctx.strokeStyle = "rgba(230,238,242,.35)"; ctx.beginPath(); ctx.moveTo(Math.round(x) + .5, pad.t); ctx.lineTo(Math.round(x) + .5, h - pad.b); ctx.stroke();
      const lines = [dfmt(dates[i]) + (f > 0 ? `  (+${f} d)` : f === 0 ? "  (today)" : "")];
      if (f <= 0) lines.push(`Simulated: ${fmt(past[i])} m³/s`);
      if (f >= 0) { lines.push(`Median: ${fmt(q.p50[f])} m³/s`); lines.push(`50% range: ${fmt(q.p25[f])}–${fmt(q.p75[f])}`); lines.push(`${model.minmax ? "Min–max" : "80% range"}: ${fmt(q.p10[f])}–${fmt(q.p90[f])}`); }
      ctx.font = `500 11.5px ${sans}`;
      const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 20, bh = lines.length * 17 + 12;
      let bx = x + 12; if (bx + bw > w - 4) bx = x - bw - 12; const by = pad.t + 4;
      ctx.fillStyle = "rgba(6,18,28,.92)"; ctx.strokeStyle = "rgba(95,208,219,.4)"; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 6) : ctx.rect(bx, by, bw, bh); ctx.fill(); ctx.stroke();
      ctx.textAlign = "left"; lines.forEach((l, k) => { ctx.fillStyle = k ? "#C9D7DF" : "#FFFFFF"; ctx.font = `${k ? 500 : 600} 11.5px ${sans}`; ctx.fillText(l, bx + 10, by + 20 + k * 17); });
      if (f >= 0) { ctx.fillStyle = "#5FD0DB"; ctx.beginPath(); ctx.arc(x, Y(q.p50[f]), 3.5, 0, 7); ctx.fill(); }
      else if (past[i] != null) { ctx.fillStyle = "#E6EEF2"; ctx.beginPath(); ctx.arc(x, Y(past[i]), 3.5, 0, 7); ctx.fill(); }
    }
  }

  function readouts() {
    const m = model, q = m.q, at = (t) => Math.min(t, q.p50.length - 1);
    const d10 = at(10), dEnd = q.p50.length - 1;
    const iqr = (t) => (q.p75[t] - q.p25[t]);
    const growth = iqr(1) > 0 ? iqr(dEnd) / iqr(1) : null;
    $("rd-now").textContent = fmt(m.past[m.t0] != null ? m.past[m.t0] : q.p50[0]);
    $("rd-d10").textContent = fmt(q.p50[d10]);
    $("rd-d10-sub").textContent = `50% range ${fmt(q.p25[d10])}–${fmt(q.p75[d10])}`;
    $("rd-spread").textContent = growth ? "×" + growth.toFixed(growth < 10 ? 1 : 0) : "–";
    $("rd-spread-sub").textContent = `Width of the 50% range, day 1 → day ${dEnd}`;
    $("rd-members").textContent = m.minmax ? "Stats" : m.nMembers;
    const status = $("live-status");
    if (m.synthetic) {
      status.className = "live-status off"; status.textContent = "Schematic";
      $("live-src").innerHTML = "Live data could not be loaded, so this shows a <strong>synthetic schematic</strong>, not a real forecast. Reload to try again.";
    } else {
      status.className = "live-status on"; status.textContent = "Live";
      $("live-src").innerHTML = `GloFAS v4 ensemble forecast issued ${dfmt(m.dates[m.t0])}, grid cell ${m.cell[0].toFixed(2)}° N, ${m.cell[1].toFixed(2)}° E. Simulated discharge from the <a href="https://www.globalfloods.eu" target="_blank" rel="noopener">Copernicus Global Flood Awareness System</a>, served by <a href="https://open-meteo.com/en/docs/flood-api" target="_blank" rel="noopener">Open-Meteo</a> (CC BY 4.0). Not my model; shown to illustrate the forecasting problem I work on.`;
    }
    cv.setAttribute("aria-label", `${m.synthetic ? "Synthetic schematic" : "Live ensemble forecast"} of discharge for the ${m.rv.river} at ${m.rv.place}. Median forecast in ${d10} days: ${fmt(q.p50[d10])} cubic metres per second, with a 50% range of ${fmt(q.p25[d10])} to ${fmt(q.p75[d10])}.`);
  }

  function animate() {
    cancelAnimationFrame(raf);
    if (reduceMotion || !firstDraw) { reveal = 1; draw(); return; }
    firstDraw = false;
    const t0 = performance.now(), dur = 1100;
    const step = (now) => { const k = Math.min(1, (now - t0) / dur); reveal = 1 - Math.pow(1 - k, 3); draw(); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }

  async function select(rv) {
    current = rv; hoverIdx = null;
    document.querySelectorAll(".river-tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.id === rv.id)));
    $("live-place").textContent = `${rv.river} at ${rv.place}`;
    $("live-why").textContent = rv.link;
    const stage = $("live-stage"); stage.classList.add("loading");
    let m;
    try { m = await load(rv); } catch (e) { console.warn("Live forecast unavailable:", e.message); m = synthetic(rv); }
    if (current !== rv) return;
    model = m; stage.classList.remove("loading");
    readouts(); animate();
  }

  /* ---------- UI ---------- */
  const tabs = $("river-tabs");
  tabs.innerHTML = rivers.map((r, i) => `<button type="button" role="tab" class="river-tab" data-id="${r.id}" aria-selected="${i === 0}">${r.river}<span>${r.place.split(",")[0]}</span></button>`).join("");
  tabs.addEventListener("click", (e) => { const b = e.target.closest(".river-tab"); if (b) select(rivers.find((r) => r.id === b.dataset.id)); });
  tabs.addEventListener("keydown", (e) => {
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return;
    const bs = [...tabs.querySelectorAll(".river-tab")], i = bs.findIndex((b) => b.dataset.id === current.id);
    const n = bs[(i + k + bs.length) % bs.length]; n.focus(); n.click();
  });

  cv.addEventListener("pointermove", (e) => {
    if (!model) return;
    const r = cv.getBoundingClientRect(), narrow = r.width < 560;
    const start = narrow ? Math.max(0, model.t0 - 20) : 0, N = model.dates.length;
    const i = Math.round(start + ((e.clientX - r.left - 46) / (r.width - 58)) * (N - 1 - start));
    hoverIdx = Math.max(start, Math.min(N - 1, i)); reveal = 1; draw();
  });
  cv.addEventListener("pointerleave", () => { hoverIdx = null; draw(); });

  let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(draw, 80); }).observe(cv);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => select(rivers[0]));
})();
