import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeLabHQ",
  description: "Discover practical self-hosted apps for your home lab.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
try {
  const storedTheme = window.localStorage.getItem("homelabhq-theme");
  const theme = storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
} catch (_) {}
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
