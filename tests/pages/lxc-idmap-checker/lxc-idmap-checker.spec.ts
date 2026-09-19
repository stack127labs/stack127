import { expect, test } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/lxc-idmap-checker");
  await expect(page.getByLabel("UID map")).toBeVisible();
});

test("maps the example and checks the selected grant source", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1, name: "LXC ID mapping checker" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Read the mapping result" })).toBeVisible();
  await page.getByRole("button", { name: "Load example" }).click();
  await page.getByRole("button", { name: "Check mapping" }).click();
  await expect(page.getByLabel("LXC mapping result")).toBeFocused();
  await expect(page.getByText("UID 1000 maps to host 101000.")).toBeVisible();
  await expect(page.getByText("Grant status: covered")).toBeVisible();
  await page.getByRole("button", { name: "Copy diagnosis" }).click();
  await expect(page.getByRole("button", { name: "Diagnosis copied" })).toBeVisible();
});

test("marks and focuses an invalid GID map", async ({ page }) => {
  await page.getByRole("button", { name: "Load example" }).click();
  await page.getByLabel("GID map").fill("g 0 100000");
  await page.getByRole("button", { name: "Check mapping" }).click();
  await expect(page.getByLabel("GID map")).toBeFocused();
  await expect(page.getByLabel("GID map")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Fix input" })).toHaveCount(0);
  await expect(page.getByLabel("LXC mapping result")).toHaveCount(0);
});

test("keeps all grant controls usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.getByRole("button", { name: "Load example" }).click();
  await expect(page.getByLabel("Grant owner")).toBeVisible();
  await expect(page.getByLabel("UID grants")).toBeVisible();
  await expect(page.getByLabel("GID grants")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
});
