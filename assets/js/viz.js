/* Compound-event explainer. Uses synthetic data generated in the browser, labelled as such on the page. */
(function () {
  "use strict";
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
     Compound dry–hot explainer (synthetic)
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
    window.addEventListener("themechange", render);
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(render);
    let t; new ResizeObserver(() => { clearTimeout(t); t = setTimeout(render, 80); }).observe(cv);
  }
})();
