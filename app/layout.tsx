import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 每日资讯",
  description: "聚合 arXiv、Hacker News、官方博客等 AI 资讯，每日自动更新",
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
