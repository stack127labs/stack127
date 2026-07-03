import type { Metadata } from "next";
import { absoluteUrl, defaultDescription, siteName, siteUrl } from "@/lib/seo";
import { JsonLd } from "./json-ld";
import { SiteNav } from "./site-nav";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: siteName,
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  alternates: {
    canonical: "/",
  },
  robots: {
    follow: true,
    index: true,
  },
  openGraph: {
    description: defaultDescription,
    images: [
      {
        alt: siteName,
        height: 512,
        url: "/android-chrome-512x512.png",
        width: 512,
      },
    ],
    siteName,
    title: siteName,
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary",
    description: defaultDescription,
    images: ["/android-chrome-512x512.png"],
    title: siteName,
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      data-theme="dark"
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
try {
  const storedTheme = window.localStorage.getItem("version127-theme");
  const theme = storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : "dark";
  document.documentElement.dataset.theme = theme;
} catch (_) {}
            `,
          }}
        />
        <JsonLd data={siteStructuredData} />
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
