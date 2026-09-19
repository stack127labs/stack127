import { expect, test } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/mqtt-discovery-checker");
  await expect(page.getByLabel("Discovery topic")).toBeVisible();
});

test("accepts the example without an empty findings table", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1, name: "Home Assistant MQTT discovery checker" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Read the discovery result" })).toBeVisible();
  await page.getByRole("button", { name: "Load example" }).click();
  await page.getByRole("button", { name: "Check discovery" }).click();
  await expect(page.getByLabel("MQTT discovery result")).toBeFocused();
  await expect(page.getByText("Valid sensor discovery.")).toBeVisible();
  await expect(page.getByRole("table", { name: "MQTT discovery findings" })).toHaveCount(0);
  await page.getByRole("button", { name: "Copy report" }).click();
  await expect(page.getByRole("button", { name: "Report copied" })).toBeVisible();
});

test("marks and focuses the payload when a sensor lacks state_topic", async ({ page }) => {
  await page.getByLabel("Discovery topic").fill("homeassistant/sensor/demo/config");
  await page.getByLabel("JSON payload").fill('{"name":"Demo"}');
  await page.getByRole("button", { name: "Check discovery" }).click();
  await expect(page.getByLabel("JSON payload")).toBeFocused();
  await expect(page.getByLabel("JSON payload")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText(/needs state_topic or stat_t/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Fix input" })).toHaveCount(0);
  await expect(page.getByLabel("MQTT discovery result")).toHaveCount(0);
});

test("labels unchecked component profiles as partial", async ({ page }) => {
  await page.getByLabel("Discovery topic").fill("homeassistant/camera/demo/config");
  await page.getByLabel("JSON payload").fill('{"name":"Camera","topic":"camera/image"}');
  await page.getByRole("button", { name: "Check discovery" }).click();
  await expect(page.getByText("Partial camera discovery.")).toBeVisible();
  await expect(page.getByText(/only common fields checked/)).toBeVisible();
});
