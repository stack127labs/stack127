import { expect, test } from "playwright/test";

const route = "/nfs-firewall-rules";

test.beforeEach(async ({ page }) => {
  await page.goto(route);
});

test("plans a source-scoped NFSv4.1 server listener", async ({ page }) => {
  await page.getByLabel("Active firewalld zone").fill("home");
  await page.getByRole("button", { name: "Plan firewall rules" }).click();
  await expect(page.getByRole("heading", { name: "Allow 1 listener rule on the NFS server." })).toBeVisible();
  await expect(page.locator("td code").filter({ hasText: /^nfs$/ })).toBeVisible();
  await expect(page.locator("pre")).toContainText("--zone=home");
  await expect(page.locator("pre")).toContainText('source address="192.0.2.0/24"');
});

test("withholds commands until NFSv3 helper ports are verified", async ({ page }) => {
  await page.getByLabel("NFSv3").check();
  await page.getByRole("button", { name: "Plan firewall rules" }).click();
  await expect(page.getByText("Incomplete plan", { exact: true })).toBeVisible();
  await expect(page.locator("td code").filter({ hasText: /^rpcbind$/ })).toBeVisible();
  await expect(page.locator("td code").filter({ hasText: /^nfs$/ })).toBeVisible();
  await expect(page.locator("pre")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Copy plan" })).toHaveCount(0);
  await expect(page.getByLabel("mountd port")).toBeFocused();
});

test("plans exact server NFSv3 TCP listeners and clears stale output", async ({ page }) => {
  await page.getByLabel("NFSv3").check();
  await page.getByLabel("UFW").check();
  await page.getByLabel("mountd port").fill("20048");
  await page.getByLabel("statd port").fill("32765");
  await page.getByLabel("lockd TCP port").fill("32766");
  await page.getByRole("button", { name: "Plan firewall rules" }).click();
  await expect(page.getByRole("heading", { name: "Allow 5 listener rules on the NFS server." })).toBeVisible();
  await expect(page.getByRole("region", { name: "Listener plan" }).locator("tbody tr")).toHaveCount(5);
  await expect(page.locator("pre")).toContainText("ufw allow in proto tcp from 192.0.2.0/24");
  await page.getByLabel("mountd port").fill("20049");
  await expect(page.getByText("Listener plan", { exact: true })).toHaveCount(0);
});

test("distinguishes the NFSv4.1 client no-listener branch", async ({ page }) => {
  await page.getByLabel("NFS client").check();
  await page.getByRole("button", { name: "Plan firewall rules" }).click();
  await expect(page.getByRole("heading", { name: /No new inbound callback listener/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "Listener plan" })).toHaveCount(0);
  await expect(page.locator("pre")).toHaveCount(0);
});

test("keeps a neutral result but requests firewalld context", async ({ page }) => {
  await page.getByRole("button", { name: "Plan firewall rules" }).click();
  await expect(page.getByRole("heading", { name: "Allow 1 listener rule on the NFS server." })).toBeVisible();
  await expect(page.getByText("Enter the active firewalld zone to create review commands.")).toBeVisible();
  await expect(page.getByLabel("Active firewalld zone")).toBeFocused();
  await expect(page.getByRole("button", { name: "Copy plan" })).toHaveCount(0);
});

test("shows simultaneous field errors and no plausible result", async ({ page }) => {
  await page.getByLabel("Allowed client CIDR").fill("192.0.2.999/24");
  await page.getByLabel("Active firewalld zone").fill("home; id");
  await page.getByRole("button", { name: "Plan firewall rules" }).click();
  await expect(page.getByLabel("Allowed client CIDR")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Active firewalld zone")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Allowed client CIDR")).toBeFocused();
  await expect(page.getByRole("heading", { name: "Fix the marked input" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Listener plan" })).toHaveCount(0);
  await expect(page.locator("pre")).toHaveCount(0);
});

test("reflows the longest plan without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByLabel("NFSv3").check();
  await page.getByLabel("IPv6").check();
  await page.getByLabel("nftables").check();
  await page.getByLabel("TCP + legacy UDP").check();
  await page.getByLabel("mountd port").fill("20048");
  await page.getByLabel("statd port").fill("32765");
  await page.getByLabel("lockd TCP port").fill("32766");
  await page.getByLabel("lockd UDP port").fill("32767");
  await page.getByLabel("Include a verified remote quota listener").check();
  await page.getByLabel("rquotad port").fill("875");
  await page.getByRole("button", { name: "Plan firewall rules" }).click();
  await expect(page.getByRole("region", { name: "Listener plan" }).locator("tbody tr")).toHaveCount(12);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  for (const button of await page.locator("section[aria-label='NFS firewall rule inputs and result'] button").all()) expect((await button.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
});

test("reset restores clean defaults", async ({ page }) => {
  await page.getByLabel("NFSv3").check();
  await page.getByLabel("mountd port").fill("20048");
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByLabel("NFSv3")).toBeFocused();
  await expect(page.getByLabel("NFSv4.1+")).toBeChecked();
  await expect(page.getByLabel("Allowed client CIDR")).toHaveValue("192.0.2.0/24");
  await expect(page.getByLabel("mountd port")).toHaveCount(0);
});
