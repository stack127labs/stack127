/* Shared mockup script: top bar, footer, icons, theme. */
(() => {
  const ICONS = {
    network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
    search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
    megaphone: '<path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/><path d="M8 6v8"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M10 14h4"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    shapes: '<path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/>',
    chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  };
  const icon = (name, cls = "icon") =>
    `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

  const theme = new URLSearchParams(location.search).get("theme")
    || (() => { try { return localStorage.getItem("mk:theme"); } catch (e) { return null; } })() || "dark";
  document.documentElement.dataset.theme = theme;
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-theme-toggle]")) return;
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("mk:theme", next); } catch (err) {}
  });

  const wordmark = '<img class="on-dark" src="assets/stack127-wordmark-on-dark.png" alt=""><img class="on-light" src="assets/stack127-wordmark-on-light.png" alt="">';
  const dot = '<span class="dot secondary" aria-hidden="true">·</span>';

  document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("page");
    document.body.insertAdjacentHTML("afterbegin", `<header class="topbar"><nav aria-label="Main navigation">
      <a class="brand" href="#" aria-label="stack127 home">${wordmark}</a>
      <div class="links"><a href="#">explore</a>${dot}<a class="secondary" href="#">kdp tools</a>${dot}<a class="secondary" href="#">saas tools</a>${dot}<a class="secondary" href="#">domain tools</a>${dot}<a class="secondary" href="#">labs</a></div>
      <button class="theme-btn" type="button" data-theme-toggle aria-label="Switch theme">${icon("sun")}</button>
    </nav></header>`);
    // Optional section bar: <body data-section-current="Directory">.
    const current = document.body.dataset.sectionCurrent;
    if (current) {
      const items = ["Directory", "Niches", "Stats", "Checker"];
      document.querySelector(".topbar").insertAdjacentHTML("afterend", `<nav class="section-bar" aria-label="ad networks pages">
        <a class="identity" href="ad-networks.html">ad networks</a>
        <div class="scroll"><ul>${items.map((i) => `<li><a class="link" href="${{ Directory: "ad-networks.html", Niches: "niches.html", Stats: "stats.html" }[i] || "#"}"${i === current ? ' aria-current="page"' : ""}>${i}</a></li>`).join("")}</ul></div>
      </nav>`);
    }
    content.insertAdjacentHTML("beforeend", `<footer class="footer"><div class="footer-in"><span>${wordmark}</span>
      <span class="footer-links"><a href="#">about</a><a href="#">privacy</a><a href="#">terms</a></span></div></footer>`);
    // "/" jumps to the search box, like the site's other search fields.
    document.addEventListener("keydown", (e) => {
      const box = document.querySelector("[data-search]");
      if (e.key !== "/" || !box || /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
      e.preventDefault(); box.focus();
    });
    document.querySelectorAll("form[data-mock]").forEach((f) => f.addEventListener("submit", (e) => e.preventDefault()));
    document.querySelectorAll("[data-icon]").forEach((el) => { el.outerHTML = icon(el.dataset.icon, el.getAttribute("class") || "icon"); });
  });
})();
