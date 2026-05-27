import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Daily News",
  description: "Daily AI news aggregated from arXiv, Hacker News, RSS and GitHub Trending",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-50 font-sans">{children}</body>
    </html>
  );
}
