import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "{{TOOL_NAME}}",
  description: "Standalone Version127 tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
