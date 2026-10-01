const expected = {
  account: "stack127@proton.me",
  bingSite: "https://stack127.com/",
  searchProperty: "sc-domain:stack127.com",
  analyticsAccount: "408759499",
  analyticsProperty: "555030542",
};

for (const [name, value] of Object.entries({
  SEARCH_SERVICES_ACCOUNT_EMAIL: expected.account,
  BING_WEBMASTER_SITE_URL: expected.bingSite,
  GOOGLE_SEARCH_CONSOLE_PROPERTY: expected.searchProperty,
  GOOGLE_ANALYTICS_ACCOUNT_ID: expected.analyticsAccount,
  GOOGLE_ANALYTICS_PROPERTY_ID: expected.analyticsProperty,
})) {
  if (process.env[name] !== value) throw new Error(`${name} does not match the approved stack127 target`);
}

async function json(response, label) {
  if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`);
  return response.json();
}

async function checkBing() {
  if (!process.env.BING_WEBMASTER_API_KEY) return "pending credential";
  const url = new URL("https://ssl.bing.com/webmaster/api.svc/json/GetCrawlSettings");
  url.searchParams.set("siteUrl", expected.bingSite);
  url.searchParams.set("apikey", process.env.BING_WEBMASTER_API_KEY);
  const data = await json(await fetch(url, { signal: AbortSignal.timeout(15000) }), "Bing");
  if (!data.d) throw new Error("Bing did not return the approved site settings");
  return "verified";
}

async function googleToken() {
  const names = ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET", "GOOGLE_OAUTH_REFRESH_TOKEN"];
  if (names.some((name) => !process.env[name])) return null;
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });
  const data = await json(await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body,
    signal: AbortSignal.timeout(15000),
  }), "Google OAuth");
  if (!data.access_token) throw new Error("Google OAuth did not return an access token");
  return data.access_token;
}

async function checkGoogle(token) {
  if (!token) return { searchConsole: "pending credentials", analytics: "pending credentials" };
  const headers = { Authorization: `Bearer ${token}` };
  const site = encodeURIComponent(expected.searchProperty);
  const search = await json(await fetch(`https://www.googleapis.com/webmasters/v3/sites/${site}`, {
    headers,
    signal: AbortSignal.timeout(15000),
  }), "Search Console");
  if (search.siteUrl !== expected.searchProperty || search.permissionLevel === "siteUnverifiedUser") {
    throw new Error("Search Console access does not match the approved property");
  }
  const endDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const startDate = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  await json(await fetch(`https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ startDate, endDate, rowLimit: 1 }),
    signal: AbortSignal.timeout(15000),
  }), "Search Console reporting");
  const analytics = await json(await fetch(`https://analyticsadmin.googleapis.com/v1beta/properties/${expected.analyticsProperty}`, {
    headers,
    signal: AbortSignal.timeout(15000),
  }), "Google Analytics");
  if (analytics.name !== `properties/${expected.analyticsProperty}` ||
      analytics.account !== `accounts/${expected.analyticsAccount}`) {
    throw new Error("Analytics access does not match the approved property and account");
  }
  const report = await json(await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${expected.analyticsProperty}:runReport`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }], metrics: [{ name: "activeUsers" }], limit: 1 }),
    signal: AbortSignal.timeout(15000),
  }), "Analytics reporting");
  if (report.kind !== "analyticsData#runReport") throw new Error("Analytics reporting returned an unexpected response");
  return { searchConsole: "verified", analytics: "verified" };
}

try {
  const bing = await checkBing();
  const google = await checkGoogle(await googleToken());
  console.log(JSON.stringify({ bing, ...google }));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Search-service check failed");
  process.exitCode = 1;
}
