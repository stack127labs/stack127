import { chromium } from "playwright";

const base = "http://127.0.0.1:3334";
const shots = [];

async function measure(page, label) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const wide = [];
    for (const el of document.querySelectorAll("main, main *")) {
      if (el.scrollWidth > doc.clientWidth + 1) {
        wide.push(`${el.tagName}.${[...el.classList].join(".")} scrollWidth=${el.scrollWidth}`);
      }
    }
    return { docScroll: doc.scrollWidth, client: doc.clientWidth, wide: wide.slice(0, 5) };
  });
  console.log(label, JSON.stringify(overflow));
}

const browser = await chromium.launch();
for (const theme of ["dark", "light"]) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.emulateMedia({ colorScheme: theme });
  await page.addInitScript((t) => {
    localStorage.setItem("stack127-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  }, theme);

  // directory
  await page.goto(`${base}/shortcuts`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `/tmp/opencode/dir-${theme}.png` });
  await measure(page, `dir-${theme}`);

  // app page
  await page.goto(`${base}/shortcuts/vscode`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `/tmp/opencode/app-${theme}.png` });
  await measure(page, `app-${theme}`);

  // generator with a selection
  await page.goto(`${base}/shortcuts-cheatsheet-generator?apps=vscode,claude-code`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `/tmp/opencode/gen-${theme}.png` });
  await measure(page, `gen-${theme}`);
  await context.close();
}

// mobile pass
const mobile = await browser.newContext({ viewport: { width: 375, height: 800 } });
const mpage = await mobile.newPage();
await mpage.goto(`${base}/shortcuts/vscode`, { waitUntil: "networkidle" });
await mpage.screenshot({ path: "/tmp/opencode/app-mobile.png", fullPage: false });
await measure(mpage, "app-mobile");
await mpage.goto(`${base}/shortcuts-cheatsheet-generator?apps=vscode`, { waitUntil: "networkidle" });
await mpage.getByRole("button", { name: "Print cheat sheet" }).click();
await mpage.waitForTimeout(300);
await mpage.screenshot({ path: "/tmp/opencode/gen-mobile.png" });
await measure(mpage, "gen-mobile");
await mobile.close();

// narrow 320 check on an app table
const tiny = await browser.newContext({ viewport: { width: 320, height: 700 } });
const tpage = await tiny.newPage();
await tpage.goto(`${base}/shortcuts/iterm2`, { waitUntil: "networkidle" });
await measure(tpage, "app-320");
await tiny.close();

await browser.close();
console.log("done", shots.length);
