import { expect, test } from "playwright/test";

const readingSurfaces = [
  {
    heading: "Compare software licenses",
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
    expect(rhythm.rowGap).toBe("16px");
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
  expect(gapBeforeHeading!).toBeGreaterThanOrEqual(31);
  expect(gapBeforeHeading!).toBeLessThanOrEqual(33);
});

test("section wrappers use one 40px break instead of stacking layout gaps", async ({ page }) => {
  await page.goto("/about");

  const heading = page.getByRole("heading", { name: "Why stack127?", exact: true });
  const gapBeforeHeading = await heading.evaluate((element) => {
    const section = element.parentElement;
    const previousSection = section?.previousElementSibling;
    if (!previousSection) return null;
    return element.getBoundingClientRect().top - previousSection.getBoundingClientRect().bottom;
  });

  expect(gapBeforeHeading).not.toBeNull();
  expect(gapBeforeHeading!).toBeGreaterThanOrEqual(39);
  expect(gapBeforeHeading!).toBeLessThanOrEqual(41);
});

test("nested h3 headings keep a subordinate 24px break", async ({ page }) => {
  await page.goto("/raid-calculator");

  const heading = page.getByRole("heading", {
    name: "How much usable space do four 4 TB drives give in RAID 5?",
    exact: true,
  });
  const gapBeforeHeading = await heading.evaluate((element) => {
    const previous = element.previousElementSibling;
    if (!previous) return null;
    return element.getBoundingClientRect().top - previous.getBoundingClientRect().bottom;
  });

  expect(gapBeforeHeading).not.toBeNull();
  expect(gapBeforeHeading!).toBeGreaterThanOrEqual(23);
  expect(gapBeforeHeading!).toBeLessThanOrEqual(25);
});
