export type AnalyticsConsent = "denied" | "granted";

type GoogleAnalyticsEnvironment = {
  GOOGLE_ANALYTICS_ID?: string;
};

type StoredAnalyticsConsent = {
  choice: AnalyticsConsent;
  version: 1;
};

export const ANALYTICS_CONSENT_STORAGE_KEY = "stack127.analytics-consent";

const measurementIdPattern = /^G-[A-Z0-9]+$/;

export function getGoogleAnalyticsConfig(
  environment: GoogleAnalyticsEnvironment = {
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
  },
) {
  const measurementId = environment.GOOGLE_ANALYTICS_ID?.trim();

  if (!measurementId || !measurementIdPattern.test(measurementId)) {
    return null;
  }

  return { measurementId };
}

export function buildAnalyticsPageLocation(origin: string, pathname: string) {
  if (!pathname.startsWith("/")) {
    return null;
  }

  try {
    const parsedOrigin = new URL(origin);

    if (
      (parsedOrigin.protocol !== "https:" && parsedOrigin.protocol !== "http:") ||
      parsedOrigin.username ||
      parsedOrigin.password
    ) {
      return null;
    }

    const cleanPathname = pathname.split(/[?#]/u, 1)[0] || "/";
    return new URL(cleanPathname, parsedOrigin.origin).toString();
  } catch {
    return null;
  }
}

export function buildAnalyticsPageReferrer(referrer: string) {
  if (!referrer) {
    return "";
  }

  try {
    const parsedReferrer = new URL(referrer);

    if (
      (parsedReferrer.protocol !== "https:" && parsedReferrer.protocol !== "http:") ||
      parsedReferrer.username ||
      parsedReferrer.password
    ) {
      return "";
    }

    return `${parsedReferrer.origin}${parsedReferrer.pathname}`;
  } catch {
    return "";
  }
}

export function parseAnalyticsConsent(value: string | null): AnalyticsConsent | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("version" in parsed) ||
      parsed.version !== 1 ||
      !("choice" in parsed) ||
      (parsed.choice !== "granted" && parsed.choice !== "denied")
    ) {
      return null;
    }

    return parsed.choice;
  } catch {
    return null;
  }
}

export function serializeAnalyticsConsent(choice: AnalyticsConsent) {
  const value: StoredAnalyticsConsent = { choice, version: 1 };
  return JSON.stringify(value);
}

export function isGoogleAnalyticsCookieName(name: string) {
  return name === "_ga"
    || name.startsWith("_ga_")
    || name === "_gid"
    || name === "_gat"
    || name.startsWith("_gat_");
}
