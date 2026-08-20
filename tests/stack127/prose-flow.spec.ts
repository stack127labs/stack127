import { expect, test } from "playwright/test";

const readingSurfaces = [
  {
    heading: "Can you run it, change it, and host it for others?",
    path: "/software-licenses-for-self-hosting",
  },
  {
    heading: "Why would anyone do this?",
    path: "/self-hosting-for-beginners",
  },
  {
    heading: "Is WHOIS still a thing?",
    path: "/domain-tools",
  },
] as const;

for (const surface of readingSurfaces) {
  test(`${surface.path} uses the shared prose rhythm`, async ({ page }) => {
    await page.goto(surface.path);

    const heading = page.getByRole("heading", { name: surface.heading, exact: true });
    const rhythm = await heading.evaluate((element) => {
      const container = element.parentElement;
      const next = element.nextElementSibling;
      const headingBox = element.getBoundingClientRect();
      const nextBox = next?.getBoundingClientRect();
      const styles = container ? getComputedStyle(container) : null;

      return {
        display: styles?.display ?? null,
        gapAfterHeading: nextBox ? nextBox.top - headingBox.bottom : null,
        rowGap: styles?.rowGap ?? null,
      };
    });

    expect(rhythm.display).toBe("grid");
    expect(rhythm.rowGap).toBe("12px");
    expect(rhythm.gapAfterHeading).not.toBeNull();
    expect(rhythm.gapAfterHeading!).toBeGreaterThanOrEqual(12);
  });
}

test("later course headings get a stronger section break", async ({ page }) => {
  await page.goto("/self-hosting-for-beginners");

  const heading = page.getByRole("heading", {
    name: "Is this going to be complicated?",
    exact: true,
  });
  const gapBeforeHeading = await heading.evaluate((element) => {
    const previous = element.previousElementSibling;
    if (!previous) return null;
    return element.getBoundingClientRect().top - previous.getBoundingClientRect().bottom;
  });

  expect(gapBeforeHeading).not.toBeNull();
  expect(gapBeforeHeading!).toBeGreaterThanOrEqual(30);
});
