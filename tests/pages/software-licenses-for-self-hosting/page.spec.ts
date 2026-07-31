import { expect, test } from "playwright/test";

const route = "/software-licenses-for-self-hosting";

test("the license reference renders its complete, stable index", async ({ page }) => {
  const response = await page.goto(route);

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".license-verdict-table tbody tr")).toHaveCount(32);
  await expect(page.locator(".license-card")).toHaveCount(32);
  await expect(page.locator(".license-page figure")).toHaveCount(1);
  await expect(page.locator("#license-families").getByRole("img")).toHaveCount(1);
  await expect(page.locator("#copyleft-trigger").getByRole("img")).toHaveCount(0);
  const mitCard = page.locator("#mit");
  await expect(mitCard.locator(".license-card-summary")).toBeVisible();
  await expect(mitCard.locator(".license-conditions")).toHaveCount(0);
  await expect(mitCard.locator(".license-card-audience")).toHaveCount(0);
  await expect(mitCard.getByRole("link", { name: /Browse [\d,]+ apps/ })).toHaveAttribute(
    "href",
    "/self-host-apps?license=mit",
  );

  const verdictDefinitionColors = await page.evaluate(() =>
    Object.fromEntries(
      ["yes", "careful", "depends", "no"].map((verdict) => {
        const tableValue = document.querySelector(
          `.license-verdict-table .license-verdict-${verdict}`,
        );
        const definition = document.querySelector(
          `.license-value-definitions .license-verdict-${verdict}`,
        );
        return [
          verdict,
          {
            definition: definition ? getComputedStyle(definition).color : null,
            table: tableValue ? getComputedStyle(tableValue).color : null,
          },
        ];
      }),
    ),
  );
  for (const colors of Object.values(verdictDefinitionColors)) {
    expect(colors.definition).not.toBeNull();
    expect(colors.definition).toBe(colors.table);
  }

  const ids = await page.locator("[id]").evaluateAll((elements) =>
    elements.map((element) => element.id).filter(Boolean),
  );
  expect(new Set(ids).size).toBe(ids.length);

  const overflows = await page.evaluate(() => ({
    body: document.body.scrollWidth > document.body.clientWidth,
    document: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  expect(overflows).toEqual({ body: false, document: false });

  await page.locator('.license-verdict-table a[href="#mit"]').click();
  await expect(page.locator("#mit")).toBeInViewport();
  expect(new URL(page.url()).hash).toBe("#mit");
});

test("the mobile table scrolls without making the page overflow and the license drawer navigates", async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 1280) > 960, "compact layout only");
  await page.goto(route);

  const tableScroller = page.locator(".license-table-scroll");
  await expect(tableScroller).toBeVisible();
  await expect
    .poll(() =>
      tableScroller.evaluate((element) => element.scrollWidth > element.clientWidth),
    )
    .toBe(true);

  const overflows = await page.evaluate(() => ({
    body: document.body.scrollWidth > document.body.clientWidth,
    document: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  expect(overflows).toEqual({ body: false, document: false });

  const toggle = page.getByRole("button", { name: "Licenses" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("complementary", { name: "Software licenses sidebar" })).toBeVisible();

  await page
    .getByRole("complementary", { name: "Software licenses sidebar" })
    .getByRole("link", { name: "MIT", exact: true })
    .click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(new URL(page.url()).hash).toBe("#mit");
  await expect(page.locator("#mit")).toBeInViewport();
});

test("license cards use three desktop columns, two tablet columns, and one mobile column", async ({
  page,
}) => {
  const cardGrid = page.locator(".license-card-grid").first();
  const columnCount = () =>
    cardGrid.evaluate(
      (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
    );

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(route);
  await expect.poll(columnCount).toBe(3);

  await page.setViewportSize({ width: 800, height: 900 });
  await expect.poll(columnCount).toBe(2);

  await page.setViewportSize({ width: 480, height: 900 });
  await expect.poll(columnCount).toBe(1);

  const overflows = await page.evaluate(() => ({
    body: document.body.scrollWidth > document.body.clientWidth,
    document: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  expect(overflows).toEqual({ body: false, document: false });
});
