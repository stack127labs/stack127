import type { Metadata } from "next";
import { Shantell_Sans } from "next/font/google";
import { getUmamiConfig } from "@/lib/analytics";
import { absoluteUrl, defaultDescription, siteName, siteUrl } from "@/lib/seo";
import { JsonLd } from "./json-ld";
import { SiteNav } from "./site-nav";
import "./globals.css";

export const dynamic = "force-dynamic";

// handwritten font used only inside marker art figures
const markerFont = Shantell_Sans({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-marker",
  weight: ["500", "700"],
});

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
    email: "version127@proton.me",
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

  return (
    <html
      className={markerFont.variable}
      data-theme="dark"
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <AppIcons />
        {umami ? (
          <script
            data-domains="version127.com,www.version127.com"
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
      </body>
    </html>
  );
}
