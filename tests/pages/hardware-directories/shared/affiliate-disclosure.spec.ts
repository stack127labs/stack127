import { expect, test } from "playwright/test";

test("About explains affiliate income without restoring the global footer statement", async ({ page }, testInfo) => {
  expect((await page.goto("/about"))?.status()).toBe(200);
  const section = page.locator("#how-we-earn-money");
  await expect(section).toContainText("As an Amazon Associate I earn from qualifying purchases.");
  await expect(section).toContainText("rankings or placement");
  await expect(page.locator("footer")).not.toContainText("Amazon Associate");
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["dark", "light"]) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      await section.scrollIntoViewIfNeeded();
      await section.screenshot({ path: testInfo.outputPath(`${theme}-${width}-about.png`), animations: "disabled", caret: "initial" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    }
  }
});

for (const [slug, model] of [["zigbee-devices", "81825"], ["zigbee-coordinators", "BN-600052"], ["local-security-cameras", "ASH42-W"]]) {
  test(`${slug} discloses linked cards and labels the purchase link`, async ({ page }, testInfo) => {
    expect((await page.goto(`/${slug}?q=${encodeURIComponent(model)}`))?.status()).toBe(200);
    const note = page.locator("#affiliate-disclosure");
    await expect(note).toContainText("Some of the links on this page are affiliate links.");
    await expect(note).toContainText("no extra cost to you");
    const cards = page.locator(".directory-card-grid");
    expect(await note.evaluate((el) => Boolean(document.querySelector(".directory-card-grid")?.compareDocumentPosition(el)! & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ["dark", "light"]) {
        await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
        await note.scrollIntoViewIfNeeded();
        await note.screenshot({ path: testInfo.outputPath(`${theme}-${width}-disclosure.png`), animations: "disabled", caret: "initial" });
      }
      await cards.getByRole("button", { name: new RegExp(model) }).first().click();
      const purchase = page.getByRole("dialog").getByRole("link", { name: "Check price on Amazon", exact: true });
      await expect(purchase).toBeVisible();
      await expect(purchase).toHaveAttribute("rel", /sponsored/);
      expect(await purchase.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
      await purchase.screenshot({ path: testInfo.outputPath(`${width}-purchase.png`), animations: "disabled", caret: "initial" });
      await page.getByRole("button", { name: "Close device details", exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    }
    await note.getByRole("link", { name: "How we earn money" }).click();
    await expect(page).toHaveURL(/\/about#how-we-earn-money$/);
    await page.goto(`/${slug}?q=stack127-no-such-device-disclosure-test`);
    await expect(page.locator("#affiliate-disclosure")).toHaveCount(0);
  });
}

test("unrelated pages and directories without affiliate links have no disclosure", async ({ page }) => {
  for (const slug of ["", "dns-tools", "matter-devices", "nut-compatible-ups", "z-wave-devices"]) {
    await page.goto(`/${slug}`);
    await expect(page.locator("#affiliate-disclosure")).toHaveCount(0);
  }
});
