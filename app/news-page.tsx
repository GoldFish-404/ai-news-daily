"use client";

import { useState } from "react";
import { ArticleRow } from "./page";

const SOURCE_OPTIONS = [
  { value: "all", label: "全部来源" },
  { value: "arxiv", label: "arXiv 论文" },
  { value: "hackernews", label: "Hacker News" },
  { value: "rss", label: "官方博客" },
  { value: "github", label: "GitHub 热门" },
];

const sourceBadge = (source: string) => {
  const map: Record<string, string> = {
    arxiv: "bg-red-100 text-red-700",
    hackernews: "bg-orange-100 text-orange-700",
    rss: "bg-blue-100 text-blue-700",
    github: "bg-purple-100 text-purple-700",
  };
  return map[source] || "bg-zinc-100 text-zinc-700";
};

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function NewsPage({ articles }: { articles: ArticleRow[] }) {
  const [filter, setFilter] = useState("all");

  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const filtered =
    filter === "all"
      ? articles
      : articles.filter((a) => a.source === filter);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        AI 每日资讯
      </h1>
      <p className="mt-1 text-sm text-zinc-500">{today}</p>

      <div className="mt-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-20 text-center text-zinc-400">
          <p className="text-lg">暂无文章</p>
          <p className="mt-1 text-sm">
            每天早上 9:00 自动抓取后更新
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${sourceBadge(article.source)}`}
                >
                  {article.source_name}
                </span>
                <span className="text-xs text-zinc-400">
                  {formatDate(article.published_at)}
                </span>
              </div>
              <h2 className="mt-2 font-medium text-zinc-900 leading-snug">
                {article.title}
              </h2>
              {article.summary && (
                <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
                  {article.summary}
                </p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
