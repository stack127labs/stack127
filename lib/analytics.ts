type AnalyticsEnvironment = {
  UMAMI_URL?: string;
  UMAMI_WEBSITE_ID?: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getUmamiBaseUrl(urlValue?: string) {
  if (!urlValue) {
    return null;
  }

  try {
    const url = new URL(urlValue.trim());

    if (url.protocol !== "https:") {
      return null;
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export function getUmamiProxyRewrites(
  environment: Pick<AnalyticsEnvironment, "UMAMI_URL"> = {
    UMAMI_URL: process.env.UMAMI_URL,
  },
) {
  const baseUrl = getUmamiBaseUrl(environment.UMAMI_URL);

  if (!baseUrl) {
    return [];
  }

  return [
    {
      destination: `${baseUrl}/script.js`,
      source: "/vitals/core.js",
    },
    {
      destination: `${baseUrl}/api/send`,
      source: "/vitals/api/send",
    },
  ];
}

export function getUmamiConfig(
  environment: AnalyticsEnvironment = {
    UMAMI_URL: process.env.UMAMI_URL,
    UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID,
  },
) {
  const baseUrl = getUmamiBaseUrl(environment.UMAMI_URL);
  const websiteId = environment.UMAMI_WEBSITE_ID?.trim();

  if (!baseUrl || !websiteId || !uuidPattern.test(websiteId)) {
    return null;
  }

  return {
    scriptUrl: "/vitals/core.js",
    websiteId,
  };
}
