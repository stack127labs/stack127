"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  buildAnalyticsPageLocation,
  buildAnalyticsPageReferrer,
  isGoogleAnalyticsCookieName,
  parseAnalyticsConsent,
  serializeAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/google-analytics";
import styles from "./google-analytics-consent.module.css";

const openSettingsEvent = "stack127:open-analytics-settings";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: Gtag;
  }
}

function getGtag() {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? ((...args: unknown[]) => window.dataLayer?.push(args));
  return window.gtag;
}

function setAnalyticsDisabled(measurementId: string, disabled: boolean) {
  const target = window as unknown as Record<string, unknown>;
  target[`ga-disable-${measurementId}`] = disabled;
}

function clearGoogleAnalyticsCookies() {
  const cookieNames = document.cookie
    .split(";")
    .map((part) => part.trim().split("=", 1)[0])
    .filter(isGoogleAnalyticsCookieName);
  const cookieDomains = new Set([window.location.hostname]);

  if (
    window.location.hostname === "stack127.com" ||
    window.location.hostname.endsWith(".stack127.com")
  ) {
    cookieDomains.add("stack127.com");
  }

  for (const name of cookieNames) {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    for (const domain of cookieDomains) {
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}; SameSite=Lax`;
    }
  }
}

function storeConsent(choice: AnalyticsConsent) {
  try {
    window.localStorage.setItem(
      ANALYTICS_CONSENT_STORAGE_KEY,
      serializeAnalyticsConsent(choice),
    );
  } catch {
    // The choice still applies for this page when storage is unavailable.
  }
}

export function AnalyticsSettingsButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(openSettingsEvent))}
      type="button"
    >
      analytics settings
    </button>
  );
}

export function GoogleAnalyticsConsent({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const [choice, setChoice] = useState<AnalyticsConsent | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shouldLoadTag, setShouldLoadTag] = useState(false);
  const initialized = useRef(false);
  const lastTrackedPath = useRef<string | null>(null);
  const lastTrackedLocation = useRef<string | null>(null);
  const settingsHeading = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let savedChoice: AnalyticsConsent | null = null;

    try {
      savedChoice = parseAnalyticsConsent(
        window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY),
      );
    } catch {
      savedChoice = null;
    }

    setChoice(savedChoice);
    setAnalyticsDisabled(measurementId, savedChoice !== "granted");
    setHydrated(true);
  }, [measurementId]);

  useEffect(() => {
    function openSettings() {
      setSettingsOpen(true);
      window.requestAnimationFrame(() => settingsHeading.current?.focus());
    }

    window.addEventListener(openSettingsEvent, openSettings);
    return () => window.removeEventListener(openSettingsEvent, openSettings);
  }, []);

  useEffect(() => {
    if (choice !== "granted") {
      return;
    }

    const pageLocation = buildAnalyticsPageLocation(window.location.origin, pathname);

    if (!pageLocation) {
      return;
    }

    const gtag = getGtag();
    const pageReferrer = lastTrackedLocation.current
      ?? buildAnalyticsPageReferrer(document.referrer);
    setAnalyticsDisabled(measurementId, false);

    if (!initialized.current) {
      gtag("consent", "default", {
        ad_personalization: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        analytics_storage: "granted",
      });
      gtag("set", "ads_data_redaction", true);
      gtag("js", new Date());
      initialized.current = true;
      setShouldLoadTag(true);
    } else {
      gtag("consent", "update", {
        ad_personalization: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        analytics_storage: "granted",
      });
    }

    gtag("set", {
      page_location: pageLocation,
      page_referrer: pageReferrer,
    });
    gtag("config", measurementId, {
      allow_ad_personalization_signals: false,
      allow_google_signals: false,
      page_location: pageLocation,
      page_referrer: pageReferrer,
      send_page_view: false,
    });

    if (lastTrackedPath.current !== pathname) {
      gtag("event", "page_view", {
        page_location: pageLocation,
        page_path: pathname,
        page_referrer: pageReferrer,
        page_title: document.title,
      });
      lastTrackedPath.current = pathname;
      lastTrackedLocation.current = pageLocation;
    }
  }, [choice, measurementId, pathname]);

  function allowAnalytics() {
    storeConsent("granted");
    setChoice("granted");
    setSettingsOpen(false);
  }

  function declineAnalytics() {
    if (initialized.current) {
      getGtag()("consent", "update", {
        ad_personalization: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        analytics_storage: "denied",
      });
    }

    storeConsent("denied");
    setAnalyticsDisabled(measurementId, true);
    clearGoogleAnalyticsCookies();
    setChoice("denied");
    setSettingsOpen(false);
  }

  const showConsent = hydrated && (choice === null || settingsOpen);

  return (
    <>
      {shouldLoadTag ? (
        <Script
          data-stack127-analytics="google"
          id="stack127-google-analytics"
          src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
          strategy="afterInteractive"
        />
      ) : null}

      {showConsent ? (
        <section aria-label="Analytics consent" className={styles.banner}>
          <div className={styles.copy}>
            <p
              className={styles.title}
              ref={settingsHeading}
              tabIndex={settingsOpen ? -1 : undefined}
            >
              {settingsOpen ? "Analytics settings" : "Choose whether to share analytics"}
            </p>
            <p>
              Google Analytics sets a first-party cookie and sends page, device, and approximate
              location data to Google. The page view leaves out tool inputs and query strings.
              Read the <Link href="/privacy">privacy policy</Link>.
            </p>
          </div>
          <div className={styles.actions}>
            <button className={styles.secondary} onClick={declineAnalytics} type="button">
              No thanks
            </button>
            <button className={styles.primary} onClick={allowAnalytics} type="button">
              Allow analytics
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
