/* Code section: lists public GitHub repositories (live, via the public GitHub API).
   Hidden until at least one repository qualifies. Settings: SITE.code in data.js. */
(function () {
  "use strict";
  const C = (window.SITE || {}).code;
  const sec = document.getElementById("code"), list = document.getElementById("repo-list");
  if (!C || !sec || !list) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const key = "gh-repos:" + C.githubUser;

  async function getRepos() {
    try { const c = JSON.parse(sessionStorage.getItem(key) || "null"); if (c && Date.now() - c.t < 36e5) return c.r; } catch (e) {}
    const r = await fetch(`https://api.github.com/users/${C.githubUser}/repos?per_page=100&sort=updated`, { headers: { Accept: "application/vnd.github+json" } });
    if (!r.ok) throw new Error("GitHub " + r.status);
    const repos = await r.json();
    try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), r: repos })); } catch (e) {}
    return repos;
  }

  getRepos().then((repos) => {
    const ex = (C.exclude || []).map((x) => x.toLowerCase()), pin = (C.pinned || []).map((x) => x.toLowerCase());
    let shown = repos.filter((r) => !r.private && !r.archived && (C.showForks || !r.fork) && !ex.includes(r.name.toLowerCase()));
    if (!shown.length) return; // nothing to show yet: keep the section hidden
    shown.sort((a, b) => {
      const pa = pin.indexOf(a.name.toLowerCase()), pb = pin.indexOf(b.name.toLowerCase());
      if (pa !== pb) return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb);
      return new Date(b.pushed_at) - new Date(a.pushed_at);
    });
    list.innerHTML = shown.map((r) => `
      <article class="repo">
        <h3><a href="${esc(r.html_url)}" target="_blank" rel="noopener">${esc(r.name)}</a></h3>
        ${r.description ? `<p>${esc(r.description)}</p>` : ""}
        ${r.topics && r.topics.length ? `<ul class="repo-topics">${r.topics.slice(0, 6).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        <p class="repo-meta">
          ${r.language ? `<span class="lang">${esc(r.language)}</span>` : ""}
          ${r.stargazers_count ? `<span>${r.stargazers_count} star${r.stargazers_count > 1 ? "s" : ""}</span>` : ""}
          ${r.license && r.license.spdx_id && r.license.spdx_id !== "NOASSERTION" ? `<span>${esc(r.license.spdx_id)} licence</span>` : ""}
          <span>Updated ${new Date(r.pushed_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
        </p>
      </article>`).join("");
    sec.hidden = false;
    const nav = document.getElementById("nav-code"); if (nav) nav.hidden = false;
  }).catch((e) => console.warn("Code section not shown:", e.message));
})();
