type AnalyticsEnvironment = {
  UMAMI_URL?: string;
  UMAMI_WEBSITE_ID?: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getUmamiConfig(
  environment: AnalyticsEnvironment = {
    UMAMI_URL: process.env.UMAMI_URL,
    UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID,
  },
) {
  const urlValue = environment.UMAMI_URL?.trim();
  const websiteId = environment.UMAMI_WEBSITE_ID?.trim();

  if (!urlValue || !websiteId || !uuidPattern.test(websiteId)) {
    return null;
  }

  try {
    const url = new URL(urlValue);

    if (url.protocol !== "https:") {
      return null;
    }

    return {
      scriptUrl: `${url.toString().replace(/\/+$/, "")}/script.js`,
      websiteId,
    };
  } catch {
    return null;
  }
}
