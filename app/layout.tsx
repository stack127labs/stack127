import type { Metadata } from "next";
import {
  Atkinson_Hyperlegible,
  Atkinson_Hyperlegible_Mono,
} from "next/font/google";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  display: "swap",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-atkinson",
  weight: ["400", "700"],
});

const atkinsonMono = Atkinson_Hyperlegible_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-atkinson-mono",
});

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
    <html
      className={`${atkinson.variable} ${atkinsonMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
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
