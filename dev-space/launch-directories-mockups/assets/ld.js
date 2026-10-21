/* Shared mockup script for launch directories: top bar, section bar, sidebar drawer,
   footer, icons, theme, option switchers, and the shared directory card.
   Page markup: <body data-section="Directory"> <div class="shell"><aside class="sidebar">…</aside>
   <div class="main"><div class="content">…</div></div></div>  */
(() => {
  const ICONS = {
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    pen: '<path d="M12 20h9"/><path d="M16.38 3.62a1 1 0 0 1 3 3L7.37 18.64a2 2 0 0 1-.86.5l-2.87.84a.5.5 0 0 1-.62-.62l.84-2.87a2 2 0 0 1 .5-.86z"/>',
    map: '<path d="M14.1 6.06a2 2 0 0 0 1.8 0l3.65-1.82A1 1 0 0 1 21 5.13v12.76a1 1 0 0 1-.55.9l-4.55 2.27a2 2 0 0 1-1.8 0l-4.2-2.1a2 2 0 0 0-1.8 0l-3.65 1.82A1 1 0 0 1 3 19.87V7.11a1 1 0 0 1 .55-.9l4.55-2.27a2 2 0 0 1 1.8 0z"/><path d="M15 5.76v15"/><path d="M9 3.24v15"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    columns: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/>',
    route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    star: '<path d="M11.5 2.3a.5.5 0 0 1 1 0l2.3 4.7 5.2.8a.5.5 0 0 1 .3.9l-3.8 3.7.9 5.2a.5.5 0 0 1-.7.5L12 15.6l-4.7 2.5a.5.5 0 0 1-.7-.5l.9-5.2-3.8-3.7a.5.5 0 0 1 .3-.9l5.2-.8z"/>',
  };
  const icon = (name, cls = "icon") =>
    `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

  // Theme: ?theme=light, then saved choice, then dark.
  const theme = new URLSearchParams(location.search).get("theme")
    || (() => { try { return localStorage.getItem("mk:theme"); } catch (e) { return null; } })() || "dark";
  document.documentElement.dataset.theme = theme;

  const SECTION = [
    ["Directory", "launch-directories.html"],
    ["Launch planner", "launch-planner.html"],
    ["Compare", "compare.html"],
  ];

  /* ---------- Helpers shared by pages ---------- */
  const DATA = () => window.LD || [];
  const CATS = () => window.LD_CATS || [];
  const catLabel = (v) => (CATS().find((c) => c[0] === v) || [, v])[1];
  const catIcon = (v) => (CATS().find((c) => c[0] === v) || [, , "grid"])[2];
  const fmtPrice = (n) => (n == null ? "" : `$${Number.isInteger(n) ? n : n.toFixed(2)}`);
  const costShort = (r) => {
    if (r.cost === "free") return "Free";
    if (r.cost === "free_and_paid") return r.price ? `Free, ${fmtPrice(r.price)}+` : "Free + paid";
    if (r.cost === "paid") return r.price ? `From ${fmtPrice(r.price)}` : "Paid";
    return null;
  };
  const LINK = { dofollow: "Dofollow", nofollow: "Nofollow", ugc: "UGC", sponsored: "Sponsored", multiple: "Mixed", varies: "Varies", estimated_nofollow: "Likely nofollow", none: "No link", unknown: null };
  const linkShort = (r) => LINK[r.link] ?? null;
  // Short free-path wait for cards, parsed from the review text. Null when the site gives no time.
  const NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, ten: 10, few: "few" };
  const UNIT = (u) => u.toLowerCase().replace(/^business days?$/, "work days").replace(/s?$/, "s");
  const waitShort = (r) => {
    const all = (r.review || "").replace(/\b(one|two|three|four|five|six|seven|ten|few)\b/gi, (w) => NUM[w.toLowerCase()]);
    if (!all || /^(Not stated|Couldn't verify|Conflicting)/i.test(all)) return null;
    // Read the free path: the part that says "free", else the first part that isn't about a paid tier.
    const parts = all.split(/;\s*|\.\s+/);
    const paid = /paid|premium|fast|skip|priority|upgrade|\bpro\b|highlight|ultimate|verified:/i;
    const free = parts.filter((x) => /free|standard|basic/i.test(x));
    const order = [...free, ...parts.filter((x) => !paid.test(x) && !free.includes(x))];
    for (const t of order) { const v = waitOf(t); if (v) return v; }
    if (/take months/i.test(all)) return "Months";
    if (/no (fixed|eta|review|set|separate|publication|approval|decision|editorial|stated|queue)|not stated|eta/i.test(all)) return "No set time";
    return null;
  };
  const plural = (n, u) => (n === "1" ? u.replace(/s$/, "") : u);
  function waitOf(t) {
    let m;
    if (/choose a launch day|pick a (launch )?day/i.test(t)) return "You pick the day";
    if (/ahead/i.test(t) && !/at least/i.test(t)) return null;
    if (/instant|immediate|60 seconds/i.test(t)) return "Instant";
    if (/few hours/i.test(t)) return "A few hours";
    if (/several (business )?days/i.test(t)) return "Several days";
    if ((m = t.match(/(\d+)\s*(hours?|days?)\s*to\s*(\d+)\s*(weeks?|months?)/i))) return `${m[1]} ${UNIT(m[2])} to ${m[3]} ${plural(m[3], UNIT(m[4]))}`;
    if ((m = t.match(/(\d+|few)\+?\s*(?:to|-|–)\s*(\d+)\s*(business days?|hours?|days?|weeks?|months?)/i))) return `${m[1] === "few" ? "Days" : m[1]}–${m[2]} ${plural(m[2], UNIT(m[3]))}`.replace("Days–1 months", "Up to a month").replace("Days–1 month", "Up to a month");
    if ((m = t.match(/(?:more than|over|at least)\s*(\d+)\s*(days?|weeks?|months?)/i)) || (m = t.match(/(\d+)\+\s*(weeks?|months?)/i))) return `${m[1]}+ ${UNIT(m[2])}`;
    if ((m = t.match(/(?:within|under|up to)\s*(\d+)\s*(hours?|days?|business days?)/i))) return `Under ${m[1]} ${UNIT(m[2])}`;
    if ((m = t.match(/(?:about|averages about|roughly)\s*(\d+)\s*(days?|weeks?|months?)/i))) return `About ${m[1]} ${plural(m[1], UNIT(m[2]))}`;
    if ((m = t.match(/(\d+)\s*(hours?|business days?|days?|weeks?|months?)/i))) return `${m[1]} ${plural(m[1], UNIT(m[2]))}`;
    if (/monday|weekly|sunday/i.test(t)) return "Weekly slot";
    return null;
  }
  const shortDate = (iso) => (iso ? new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }) : "—");
  const fact = (dt, dd, sample) => `<div><dt>${dt}</dt><dd class="${dd ? "" : "unk"}">${dd ? (sample ? `<span class="sample" title="Sample value for the mockup">${dd}</span>` : dd) : "Not stated"}</dd></div>`;
  const logo = (r, size) => `<span class="ld-logo"${size ? ` style="width:${size}px;height:${size}px"` : ""} aria-hidden="true">${r.icon ? `<img src="${r.icon}" alt="">` : r.name[0]}</span>`;

  /** The shared 3-up card. Opens the directory page; Submit is a separate link. */
  const card = (r, opts = {}) => {
    const extra = r.cats.length > 1 ? ` · +${r.cats.length - 1}` : "";
    const submit = r.subStatus === "verified" && r.submit
      ? `<a class="submit" href="${r.submit}" rel="nofollow noopener" target="_blank">Submit ${icon("arrow")}</a>`
      : `<span class="none">${r.subStatus === "unavailable" ? "Submit page down" : "No submit page"}</span>`;
    return `<article class="ld-card">
      <div class="ld-top">${logo(r)}
        <div><h3 class="ld-name"><a href="${opts.href || "directory.html?d=" + r.slug}">${r.name}</a></h3><span class="ld-cat">${catLabel(r.cats[0])}${extra}</span></div>
        <div class="ld-dr" title="Domain Rating from Ahrefs. Sample value in this mockup.">${r.dr != null ? `<b class="sample">${r.dr}</b>DR` : `<b>—</b>DR`}</div>
      </div>
      <p class="ld-desc">${r.bestFor.replace(/\.$/, "")}. ${r.summary.split(/(?<=\.)\s/)[0]}</p>
      <dl class="ld-facts">${fact("cost", costShort(r))}${fact("link", linkShort(r))}${fact("review", waitShort(r))}</dl>
      <div class="ld-actions">${opts.pick ? `<button class="ld-pick" type="button" aria-pressed="false" data-pick="${r.slug}">${icon("plus")} Compare</button>` : `<a href="${r.site}" rel="nofollow noopener" target="_blank">${new URL(r.site).hostname.replace(/^www\./, "")}</a>`}${submit}</div>
    </article>`;
  };

  window.LDUI = { icon, card, catLabel, catIcon, costShort, linkShort, waitShort, shortDate, logo, fmtPrice, fact, DATA, CATS };

  document.addEventListener("DOMContentLoaded", () => {
    const wordmark = '<img class="on-dark" src="assets/stack127-wordmark-on-dark.png" alt=""><img class="on-light" src="assets/stack127-wordmark-on-light.png" alt="">';
    const dot = '<span class="dot secondary" aria-hidden="true">·</span>';
    const current = document.body.dataset.section;
    const sectionBar = current === undefined ? "" : `<nav class="section-bar" aria-label="Launch directories pages">
      <a class="identity" href="launch-directories.html">launch directories</a>
      <div class="scroll"><ul>${SECTION.map(([l, h]) => `<li><a class="link" href="${h}"${l === current ? ' aria-current="page"' : ""}>${l}</a></li>`).join("")}</ul></div></nav>`;
    document.body.insertAdjacentHTML("afterbegin", `<header class="topbar"><nav aria-label="Main navigation">
      <a class="brand" href="index.html" aria-label="stack127 home">${wordmark}</a>
      <div class="links"><a href="#">explore</a>${dot}<a class="secondary" href="#">kdp tools</a>${dot}<a class="secondary" href="#">saas tools</a>${dot}<a class="secondary" href="#">domain tools</a>${dot}<a class="secondary" href="#">labs</a></div>
      <button class="theme-btn" type="button" data-theme-toggle aria-label="Switch theme">${icon("sun")}</button>
    </nav></header>${sectionBar}`);

    // Sidebar drawer on compact widths.
    const side = document.querySelector(".sidebar"), main = document.querySelector(".main");
    if (side && main) {
      const label = side.dataset.menu || "Filters";
      main.insertAdjacentHTML("afterbegin", `<div class="sidebar-bar"><button class="sidebar-toggle" type="button" data-drawer>${icon("list")} ${label}</button></div>`);
      side.insertAdjacentHTML("afterbegin", `<button class="drawer-close" type="button" data-drawer-close aria-label="Close">${icon("x")}</button>`);
      document.body.insertAdjacentHTML("beforeend", '<div class="backdrop" data-drawer-close></div>');
      const bd = document.querySelector(".backdrop");
      const set = (o) => { side.classList.toggle("open", o); bd.classList.toggle("open", o); };
      document.addEventListener("click", (e) => {
        if (e.target.closest("[data-drawer]")) set(true);
        else if (e.target.closest("[data-drawer-close]")) set(false);
      });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
      main.insertAdjacentHTML("beforeend", `<footer class="footer"><div class="footer-in"><span>${wordmark}</span><span class="footer-links"><a href="#">about</a><a href="#">privacy</a><a href="#">terms</a></span></div></footer>`);
    }

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-theme-toggle]")) {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem("mk:theme", next); } catch (err) {}
      }
    });
    document.querySelectorAll("form[data-mock]").forEach((f) => f.addEventListener("submit", (e) => e.preventDefault()));
    document.querySelectorAll("[data-icon]").forEach((el) => { el.outerHTML = icon(el.dataset.icon, el.getAttribute("class") || "icon"); });
  });
})();
