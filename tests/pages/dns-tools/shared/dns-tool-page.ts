import { expect, test } from "playwright/test";

type DnsToolPageContract = {
  button: string;
  heading: string;
  route: string;
  sections: number;
  title: string;
};

export function testDnsToolPage(contract: DnsToolPageContract) {
  test(`${contract.title} is a published, server-readable DNS tool page`, async ({ page }, testInfo) => {
    await page.goto(contract.route);
    await expect(page.locator("[data-app-main] h1")).toHaveText(contract.heading);
    await expect(page.getByLabel("Domain or hostname")).toBeVisible();
    await expect(page.getByRole("button", { name: contract.button })).toBeVisible();
    await expect(page.locator(".dns-reference-content > section")).toHaveCount(contract.sections);
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://stack127.com${contract.route}`,
    );
    if (testInfo.project.name !== "mobile") {
      const navigation = page.getByRole("navigation", { name: "DNS tools" });
      await expect(navigation.getByRole("link")).toHaveCount(7);
      await expect(navigation.getByRole("link", { name: contract.title, exact: true })).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
    await expect(page.getByText(/health score/i)).toHaveCount(0);
    await expect(page.getByText(/globally propagated/i)).toHaveCount(0);
  });
}
