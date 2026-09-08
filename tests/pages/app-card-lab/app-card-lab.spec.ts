import { expect, test } from "playwright/test";
import { samples, thirdSample } from "../../../app/(site)/app-card-lab/card-data";

test("card options are readable, linked, and excluded from indexing", async ({ page, request }, testInfo) => {
  const response = await page.goto("/app-card-lab");
  if (process.env.STACK127_TEST_SERVER === "production") {
    expect(response?.status()).toBe(404);
    return;
  }
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "App cards", exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator("[data-card-design]")).toHaveCount(10);
  await expect(page.locator("[data-sample-card]")).toHaveCount(21);
  await expect(page.locator('#design-3 [data-sample-card]')).toHaveCount(3);
  const factRows = page.locator("#design-3");
  await expect(factRows.getByText("Self-hosted app", { exact: true })).toHaveCount(0);
  await expect(factRows.getByText("AI agent", { exact: true })).toHaveCount(0);
  await expect(factRows.locator('[data-sample-name="Gemini CLI"] [data-card-category]')).toContainText("AI");
  await expect(factRows.locator('[data-sample-name="Gemini CLI"] [data-category-more]')).toContainText("+1");
  await expect(factRows.locator('[data-sample-name="Gemini CLI"] [data-category-more]')).toHaveAttribute("title", "Development");
  await expect(factRows.locator('[data-sample-name="Home Assistant"] [data-category-more]')).toHaveCount(0);
  await expect(factRows.getByRole("list", { name: "Categories" })).toHaveCount(0);
  for (const label of await factRows.locator("dt").all()) {
    await expect(label.locator('svg[aria-hidden="true"]')).toHaveCount(1);
  }
  for (const design of await page.locator("[data-card-design]").all()) {
    const selfHost = design.locator('[data-sample-card="self-host"]');
    const cli = design.locator('[data-sample-card="cli"]').first();
    for (const label of ["Source", "Pricing", "RAM", "Storage", "Last update"]) {
      await expect(selfHost.locator("dt", { hasText: new RegExp(`^${label}$`) })).toHaveCount(1);
    }
    for (const label of ["Stars", "Pricing", "License", "Platforms", "Version", "Last commit"]) {
      await expect(cli.locator("dt", { hasText: new RegExp(`^${label}$`) })).toHaveCount(1);
    }
    for (const logo of await design.locator("img").all()) {
      await expect(logo).toHaveAttribute("src", /^https:\/\//);
      await logo.scrollIntoViewIfNeeded();
      await expect.poll(() => logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(await logo.evaluate((img) => getComputedStyle(img).filter)).toBe("none");
    }
  }
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/app-card-lab");

  for (const theme of ["dark", "light"] as const) {
    await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
    for (const width of [1600, 1280, 1255, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.locator("[data-sample-card]").evaluateAll((cards) =>
        cards.filter((card) => card.scrollWidth > card.clientWidth + 1).length);
      expect(overflow, `${theme} cards at ${width}px`).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      if (width >= 1024) {
        await expect(page.getByRole("complementary", { name: "Card design navigation" })).toBeVisible();
        for (const design of await page.locator("[data-card-design]").all()) {
          const cards = await design.locator("[data-sample-card]").all();
          const left = await cards[0].boundingBox();
          const right = await cards[1].boundingBox();
          expect(Math.abs(left!.y - right!.y)).toBeLessThan(2);
          if (await design.getAttribute("id") === "design-3" && width >= 1255) {
            const third = await cards[2].boundingBox();
            expect(Math.abs(left!.y - third!.y)).toBeLessThan(2);
            expect(third!.x).toBeGreaterThan(right!.x);
          }
        }
      }
      if (width === 1600 || width === 390) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}.png`), fullPage: true });
      }
      if (width === 390) {
        for (const design of ["design-3", "design-8"]) {
          await page.locator(`#${design}`).screenshot({ path: testInfo.outputPath(`${theme}-${design}-mobile.png`) });
        }
      }
      if (width === 1600 || width === 1255) {
        await page.locator("#design-3").screenshot({ path: testInfo.outputPath(`${theme}-fact-rows-${width}.png`) });
      }
    }
  }

  const first = page.locator("[data-sample-card]").first();
  await first.focus();
  await expect(first).toBeFocused();
  expect(await first.evaluate((node) => getComputedStyle(node).boxShadow)).not.toBe("none");
  await expect(first).toHaveAttribute("href", /home-assistant\.io/);
  await expect(first).toHaveAttribute("target", "_blank");
  expect(await page.locator("[data-sample-card]").evaluateAll((cards) => cards.every((card) =>
    card.querySelectorAll("a, button, input, select").length === 0))).toBe(true);
  await page.getByRole("button", { name: "Designs", exact: true }).click();
  await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
  await page.getByRole("navigation", { name: "Card designs", exact: true }).getByRole("link", { name: "Balanced" }).click();
  await expect(page.getByRole("button", { name: "Designs", exact: true })).toHaveAttribute("aria-expanded", "false");
});

test("every design keeps the complete published card snapshot", async ({ page }) => {
  test.skip(process.env.STACK127_TEST_SERVER === "production", "The comparison lab is development-only.");
  await page.goto("/app-card-lab");
  for (const sample of [...samples, thirdSample]) {
    const cards = page.locator(`[data-sample-name="${sample.name}"]`);
    await expect(cards).toHaveCount(sample === thirdSample ? 1 : 10);
    for (const card of await cards.all()) {
      await expect(card.locator("p")).toHaveText(sample.summary);
      await expect(card.locator("img")).toHaveAttribute("src", sample.image);
      await expect(card.locator("dd")).toHaveCount(sample.facts.length);
      for (const fact of sample.facts) {
        await expect(card.locator(`[data-fact="${fact.label}"] dd`)).toHaveText(fact.value);
      }
    }
  }
});
