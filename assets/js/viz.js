/* Visualisations: hero ensemble-forecast schematic and compound-event explainer.
   Both use synthetic data generated in the browser and are labelled as such. */
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const minus = (x, d = 1) => (x < 0 ? "−" : "") + Math.abs(x).toFixed(d);

  function rng(seed) { // mulberry32
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function setupCanvas(cv) {
    const r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: r.width, h: r.height };
  }

  /* =========================================================
     1. Ensemble streamflow forecast (schematic)
     ========================================================= */
  const fc = document.getElementById("forecast-canvas");
  if (fc) {
    const PAST = 70, FUT = 30, N = PAST + FUT, M = 30;
    let model, progress = 0, showTruth = false, raf = null;

    function rain(r) { return r() < 0.24 ? -Math.log(1 - r()) * 9 : 0; }
    function run(rainSeries, state) {
      let { f, s } = state; const q = [];
      for (const p of rainSeries) {
        f += 0.62 * p; s += 0.38 * p;
        const qf = 0.34 * f, qs = 0.035 * s; f -= qf; s -= qs;
        q.push(qf + qs + 1.5);
      }
      return { q, state: { f, s } };
    }
    function build(seed) {
      const r = rng(seed);
      const rTrue = Array.from({ length: N }, () => rain(r));
      const past = run(rTrue.slice(0, PAST), { f: 4, s: 60 });
      const truth = run(rTrue.slice(PAST), past.state).q;
      const members = [];
      for (let m = 0; m < M; m++) {
        const rm = rng(seed * 31 + m * 977 + 7);
        const rr = rTrue.slice(PAST).map((v, i) => {
          const w = Math.exp(-(i + 1) / 5.5);
          const noisy = v * Math.exp((rm() - 0.5) * 0.9);
          return w * noisy + (1 - w) * rain(rm);
        });
        members.push(run(rr, past.state).q);
      }
      const q = (arr, p) => { const s = arr.slice().sort((a, b) => a - b); const i = (s.length - 1) * p; const lo = Math.floor(i); return s[lo] + (s[Math.ceil(i)] - s[lo]) * (i - lo); };
      const lo = [], hi = [], med = [];
      for (let t = 0; t < FUT; t++) { const c = members.map((mm) => mm[t]); lo.push(q(c, 0.1)); hi.push(q(c, 0.9)); med.push(q(c, 0.5)); }
      let inside = 0; truth.forEach((v, t) => { if (v >= lo[t] && v <= hi[t]) inside++; });
      const ymax = Math.max(...past.q, ...hi, ...truth) * 1.25; // members above this are clipped
      return { obs: past.q, truth, members, lo, hi, med, ymax, inside };
    }

    function draw() {
      const { ctx, w, h } = setupCanvas(fc);
      const C = { ink: css("--ink"), ink2: css("--ink-2"), ink3: css("--ink-3"), line: css("--line"), cyan: css("--cyan"), teal: css("--teal"), basin: css("--basin") };
      const narrow = w < 640, T0 = narrow ? PAST - 36 : 0;
      const pad = { l: 8, r: 10, t: narrow ? 34 : 22, b: 30 };
      const X = (t) => pad.l + ((t - T0) / (N - 1 - T0)) * (w - pad.l - pad.r);
      const Y = (v) => h - pad.b - (v / model.ymax) * (h - pad.t - pad.b);
      ctx.clearRect(0, 0, w, h);
      ctx.font = `500 11px ${css("--sans")}`; ctx.textBaseline = "alphabetic";

      // grid + ticks
      ctx.strokeStyle = C.line; ctx.lineWidth = 1;
      for (let d = narrow ? -30 : -60; d <= 30; d += 10) {
        const x = Math.round(X(PAST - 1 + d)) + 0.5;
        ctx.globalAlpha = d === 0 ? 0 : 0.6; ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, h - pad.b); ctx.stroke();
        ctx.globalAlpha = 1; ctx.fillStyle = C.ink2; ctx.textAlign = d === 30 ? "right" : "center";
        const lbl = d === 0 ? "" : (d > 0 ? "+" : "−") + Math.abs(d) + " d";
        ctx.fillText(lbl, d === 30 ? x + 2 : x, h - 10);
      }
      ctx.beginPath(); ctx.moveTo(pad.l, h - pad.b + 0.5); ctx.lineTo(w - pad.r, h - pad.b + 0.5); ctx.stroke();

      const pObs = Math.min(1, progress / 0.45), pFan = Math.max(0, (progress - 0.45) / 0.55);

      // observed
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.beginPath();
      const nObs = Math.max(T0 + 1, Math.round(T0 + pObs * (PAST - T0)));
      for (let t = T0; t < nObs; t++) { const x = X(t), y = Y(model.obs[t]); t > T0 ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();

      // issue line
      const x0 = X(PAST - 1);
      ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.ink3; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(Math.round(x0) + 0.5, pad.t - 8); ctx.lineTo(Math.round(x0) + 0.5, h - pad.b); ctx.stroke(); ctx.restore();
      ctx.fillStyle = C.ink; ctx.font = `600 11.5px ${css("--sans")}`;
      ctx.textAlign = narrow ? "right" : "left";
      ctx.fillText("Forecast issued", narrow ? x0 - 6 : x0 + 6, pad.t - 6);
      ctx.fillStyle = C.ink2; ctx.font = `500 11px ${css("--sans")}`;
      if (!narrow) { ctx.textAlign = "right"; ctx.fillText("Lead time →", w - pad.r, pad.t - 6); }
      ctx.textAlign = "left"; ctx.fillText("Discharge", pad.l + 2, narrow ? pad.t - 22 : pad.t - 6);

      if (pFan > 0) {
        const nF = Math.max(1, Math.round(pFan * FUT));
        const start = model.obs[PAST - 1];
        // band
        ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.2; ctx.beginPath(); ctx.moveTo(x0, Y(start));
        for (let t = 0; t < nF; t++) ctx.lineTo(X(PAST + t), Y(model.hi[t]));
        for (let t = nF - 1; t >= 0; t--) ctx.lineTo(X(PAST + t), Y(model.lo[t]));
        ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
        // members (clipped to the plot area)
        ctx.save(); ctx.beginPath(); ctx.rect(pad.l, pad.t, w - pad.l - pad.r, h - pad.t - pad.b); ctx.clip();
        ctx.strokeStyle = C.cyan; ctx.lineWidth = 1; ctx.globalAlpha = 0.55;
        model.members.forEach((m) => {
          ctx.beginPath(); ctx.moveTo(x0, Y(start));
          for (let t = 0; t < nF; t++) ctx.lineTo(X(PAST + t), Y(m[t]));
          ctx.stroke();
        });
        ctx.globalAlpha = 1; ctx.restore();
        // median
        ctx.strokeStyle = C.teal; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, Y(start));
        for (let t = 0; t < nF; t++) ctx.lineTo(X(PAST + t), Y(model.med[t]));
        ctx.stroke();
      }
      if (showTruth && progress >= 1) {
        ctx.save(); ctx.setLineDash([6, 4]); ctx.strokeStyle = C.basin; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(x0, Y(model.obs[PAST - 1]));
        model.truth.forEach((v, t) => ctx.lineTo(X(PAST + t), Y(v)));
        ctx.stroke(); ctx.restore();
        ctx.fillStyle = C.basin; ctx.font = `600 11.5px ${css("--sans")}`; ctx.textAlign = "right";
        ctx.fillText(narrow ? `In range ${model.inside}/${FUT} days` : `Inside the 10–90% range on ${model.inside} of ${FUT} days`, w - pad.r, narrow ? pad.t - 22 : pad.t + 12);
      }
    }

    function animate() {
      cancelAnimationFrame(raf);
      if (reduceMotion) { progress = 1; draw(); return; }
      const t0 = performance.now(), dur = 1900;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        progress = 1 - Math.pow(1 - k, 3); draw();
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    function issue(seed) { model = build(seed); showTruth = false; truthBtn.setAttribute("aria-pressed", "false"); truthBtn.textContent = "Show what happened"; animate(); }

    const truthBtn = document.getElementById("fc-truth");
    document.getElementById("fc-new").addEventListener("click", () => issue((Math.random() * 1e9) | 0));
    truthBtn.addEventListener("click", () => {
      showTruth = !showTruth; progress = 1; cancelAnimationFrame(raf);
      truthBtn.setAttribute("aria-pressed", String(showTruth));
      truthBtn.textContent = showTruth ? "Hide what happened" : "Show what happened";
      draw();
    });
    const start = () => issue(20261);
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
    let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => model && draw(), 80); }).observe(fc);
  }

  /* =========================================================
     2. Compound dry–hot explainer (synthetic)
     ========================================================= */
  const cv = document.getElementById("cdhe-canvas");
  if (cv) {
    const n = 780, r = rng(1958);
    const gauss = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const z1 = Array.from({ length: n }, gauss), z2 = Array.from({ length: n }, gauss);
    const el = (id) => document.getElementById(id);
    const rs = el("r-spi"), rt = el("r-sti"), rr = el("r-rho");

    function render() {
      const a = +rs.value, b = +rt.value, rho = +rr.value;
      el("o-spi").textContent = "SPI ≤ " + minus(a);
      el("o-sti").textContent = "STI ≥ " + minus(b);
      el("o-rho").textContent = "ρ = " + minus(rho);
      const k = Math.sqrt(1 - rho * rho);
      const pts = z1.map((x, i) => [x, rho * x + k * z2[i]]);
      let dry = 0, hot = 0, both = 0;
      pts.forEach(([x, y]) => { const d = x <= a, hh = y >= b; dry += d; hot += hh; both += d && hh; });
      const expct = (dry * hot) / n;
      el("s-obs").textContent = both;
      el("s-ind").textContent = expct.toFixed(1);
      el("s-amp").textContent = expct > 0 ? "×" + (both / expct).toFixed(1) : "–";

      const { ctx, w, h } = setupCanvas(cv);
      const C = { ink: css("--ink"), ink2: css("--ink-2"), ink3: css("--ink-3"), line: css("--line"), cyan: css("--cyan"), teal: css("--teal") };
      const pad = { l: 40, r: 12, t: 14, b: 40 }, D = 3.4;
      const X = (v) => pad.l + ((v + D) / (2 * D)) * (w - pad.l - pad.r);
      const Y = (v) => h - pad.b - ((v + D) / (2 * D)) * (h - pad.t - pad.b);
      ctx.clearRect(0, 0, w, h);
      // compound quadrant
      ctx.fillStyle = C.cyan; ctx.globalAlpha = 0.14;
      ctx.fillRect(X(-D), Y(D), X(a) - X(-D), Y(b) - Y(D)); ctx.globalAlpha = 1;
      // axes
      ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.font = `500 11px ${css("--sans")}`; ctx.fillStyle = C.ink2;
      for (let v = -3; v <= 3; v++) {
        ctx.beginPath(); ctx.moveTo(X(v), pad.t); ctx.lineTo(X(v), h - pad.b); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(w - pad.r, Y(v)); ctx.stroke();
        ctx.textAlign = "center"; ctx.fillText(minus(v, 0).replace("−0", "0"), X(v), h - pad.b + 15);
        ctx.textAlign = "right"; ctx.fillText(minus(v, 0).replace("−0", "0"), pad.l - 8, Y(v) + 4);
      }
      ctx.fillStyle = C.ink; ctx.font = `600 11.5px ${css("--sans")}`; ctx.textAlign = "center";
      ctx.fillText("← drier     SPI (precipitation)     wetter →", (pad.l + w - pad.r) / 2, h - 8);
      ctx.save(); ctx.translate(12, (pad.t + h - pad.b) / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText("STI (temperature)   hotter →", 0, 0); ctx.restore();
      // thresholds
      ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.teal; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(X(a), pad.t); ctx.lineTo(X(a), h - pad.b); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad.l, Y(b)); ctx.lineTo(w - pad.r, Y(b)); ctx.stroke(); ctx.restore();
      // points
      pts.forEach(([x, y]) => {
        const c = x <= a && y >= b;
        ctx.globalAlpha = c ? 0.95 : 0.35; ctx.fillStyle = c ? C.teal : C.ink3;
        ctx.beginPath(); ctx.arc(X(Math.max(-D, Math.min(D, x))), Y(Math.max(-D, Math.min(D, y))), c ? 3 : 2, 0, 7); ctx.fill();
      });
      ctx.globalAlpha = 1; ctx.fillStyle = C.teal; ctx.font = `600 12px ${css("--sans")}`; ctx.textAlign = "left";
      ctx.fillText("Compound dry–hot", X(-D) + 8, Y(D) + 16);
    }
    [rs, rt, rr].forEach((i) => i.addEventListener("input", render));
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(render);
    let t; new ResizeObserver(() => { clearTimeout(t); t = setTimeout(render, 80); }).observe(cv);
  }
})();
