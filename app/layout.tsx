import type { Metadata } from "next";
import { SiteNav } from "./site-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "version127",
  description:
    "Discover practical open-source apps, technical guides, automation ideas, and useful tools for builders.",
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
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
