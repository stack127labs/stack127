import type { Metadata } from "next";
import localFont from "next/font/local";
import { getUmamiConfig } from "@/lib/analytics";
import { getGoogleAnalyticsConfig } from "@/lib/google-analytics";
import { absoluteUrl, defaultDescription, siteName, siteUrl } from "@/lib/seo";
import { GoogleAnalyticsConsent } from "./ui/site/google-analytics-consent";
import { SiteNav } from "./ui/site/site-nav";
import "./globals.css";

// handwritten font used only inside marker art figures
const markerFont = localFont({
  src: "./fonts/shantell.woff2",
  display: "swap",
  preload: false,
  variable: "--font-marker",
  weight: "500 700",
});

// display font for headings and titles
const displayFont = localFont({
  src: "./fonts/space.woff2",
  display: "swap",
  variable: "--font-space-grotesk",
  weight: "500 700",
});

// body font for everything else
const bodyFont = localFont({
  src: "./fonts/inter.woff2",
  display: "swap",
  variable: "--font-inter",
  weight: "400 600",
});

// mono font for data, metadata, and code
const monoFont = localFont({
  src: [
    { path: "./fonts/plex-400.woff2", weight: "400" },
    { path: "./fonts/plex-600.woff2", weight: "600" },
  ],
  display: "swap",
  preload: false,
  variable: "--font-ibm-plex-mono",
});

const fontVariables = [
  markerFont.variable,
  displayFont.variable,
  bodyFont.variable,
  monoFont.variable,
].join(" ");

function baseMetadata(): Metadata {
  return {
    metadataBase: siteUrl,
    applicationName: siteName,
    icons: {
      apple: "/apple-touch-icon.png",
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    },
  };
}

export const metadata: Metadata = baseMetadata();

function AppIcons() {
  return (
    <>
      <link href="/apple-touch-icon.png" rel="apple-touch-icon" />
      <link href="/favicon.ico" rel="icon" sizes="any" />
      <link href="/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />
      <link href="/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png" />
      <link href="/android-chrome-192x192.png" rel="icon" sizes="192x192" type="image/png" />
      <link href="/android-chrome-512x512.png" rel="icon" sizes="512x512" type="image/png" />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const umami = getUmamiConfig();
  const googleAnalytics = getGoogleAnalyticsConfig();

  return (
    <html
      className={fontVariables}
      data-theme="dark"
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <AppIcons />
        {umami ? (
          <script
            data-domains="stack127.com,www.stack127.com"
            data-exclude-search="true"
            data-website-id={umami.websiteId}
            defer
            src={umami.scriptUrl}
          />
        ) : null}
      </head>
      <body>
        <SiteNav />
        {children}
        {googleAnalytics ? (
          <GoogleAnalyticsConsent measurementId={googleAnalytics.measurementId} />
        ) : null}
      </body>
    </html>
  );
}
