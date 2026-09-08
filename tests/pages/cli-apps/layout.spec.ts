import { expect, test } from "playwright/test";

test("cli app cards use the intended desktop and compact breakpoints", async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1280 });
  await page.goto("/cli-apps");

  const grid = page.locator(".cli-card-grid");
  await expect(grid).toBeVisible();
  await expect
    .poll(() => grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length))
    .toBe(3);

  await page.setViewportSize({ height: 900, width: 1024 });
  await expect
    .poll(() => grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length))
    .toBe(2);

  await page.setViewportSize({ height: 900, width: 640 });
  await expect
    .poll(() => grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length))
    .toBe(1);
});

test("the mobile layout exposes the filter drawer and readable cards", async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 390 });
  await page.goto("/cli-apps");

  await expect(page.getByRole("button", { name: "Filters" })).toBeVisible();
  await expect(page.locator("[data-app-main] h1")).toBeVisible();

  const firstCard = page.locator(".cli-card").first();
  await expect(firstCard).toBeVisible();
  const box = await firstCard.boundingBox();
  expect(box?.width ?? 0).toBeLessThanOrEqual(390);
});

test("cards open a contextual details panel instead of exposing raw links", async ({ page }) => {
  await page.goto("/cli-apps");

  const firstCard = page.locator(".cli-card").first();
  await expect(firstCard.locator("a")).toHaveCount(0);
  await expect(firstCard.locator("[data-card-facts] > div")).toHaveCount(6);
  await expect(firstCard.locator("[data-card-facts]")).toContainText("License");
  await firstCard.click();

  const panel = page.getByRole("dialog");
  await expect(panel).toBeVisible();
  await expect(panel.getByText("pricing", { exact: true })).toBeVisible();
  await expect(panel.getByText("source model", { exact: true })).toBeVisible();
  await expect(panel.locator("a").first()).toBeVisible();
});

test("cards and details show cached app icons", async ({ page }) => {
  const onePixelPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );
  await page.route(
    /https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/stack127-media\/directories\/cli-apps\/icons\/.+/,
    (route) => route.fulfill({ body: onePixelPng, contentType: "image/png", status: 200 }),
  );
  await page.goto("/cli-apps");

  const icons = page.locator(".cli-card .directory-card-icon");
  await expect(icons).not.toHaveCount(0);

  for (const icon of await icons.all()) {
    await icon.scrollIntoViewIfNeeded();
    await expect(icon).toHaveAttribute("data-image-loaded", "true");
    const image = icon.locator("img");
    await expect(image).toHaveAttribute(
      "src",
      /\/storage\/v1\/object\/public\/stack127-media\/directories\/cli-apps\/icons\/[a-z0-9._-]+-[0-9a-f]{16}\.(png|jpg|webp|avif|gif)$/,
    );
    await expect(image).toHaveCSS("opacity", "1");
    expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  }

  await page.locator(".cli-card").first().click();
  const detailIcon = page.getByRole("dialog").locator(".app-detail-icon");
  await expect(detailIcon).toHaveAttribute("data-image-loaded", "true");
  await expect(detailIcon.locator("img")).toHaveCSS("opacity", "1");
});
