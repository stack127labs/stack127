import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Shantell_Sans, Space_Grotesk } from "next/font/google";
import { getUmamiConfig } from "@/lib/analytics";
import { getGoogleAnalyticsConfig } from "@/lib/google-analytics";
import { absoluteUrl, defaultDescription, siteName, siteUrl } from "@/lib/seo";
import { GoogleAnalyticsConsent } from "./ui/site/google-analytics-consent";
import { JsonLd } from "./ui/site/json-ld";
import { SiteNav } from "./ui/site/site-nav";
import "./globals.css";

export const dynamic = "force-dynamic";

// handwritten font used only inside marker art figures
const markerFont = Shantell_Sans({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-marker",
  weight: ["500", "700"],
});

// display font for headings and titles
const displayFont = Space_Grotesk({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "700"],
});

// body font for everything else
const bodyFont = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "600"],
});

// mono font for data, metadata, and code
const monoFont = IBM_Plex_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "600"],
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

const siteStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description: defaultDescription,
    name: siteName,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: absoluteUrl("/"),
    },
    url: absoluteUrl("/"),
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    email: "stack127@proton.me",
    logo: absoluteUrl("/android-chrome-512x512.png"),
    name: siteName,
    url: absoluteUrl("/"),
  },
];

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
        <JsonLd data={siteStructuredData} />
        <SiteNav />
        {children}
        {googleAnalytics ? (
          <GoogleAnalyticsConsent measurementId={googleAnalytics.measurementId} />
        ) : null}
      </body>
    </html>
  );
}
