import { NextResponse } from "next/server";
import { fetchArxiv } from "@/lib/sources/arxiv";
import { fetchHackerNews } from "@/lib/sources/hackernews";
import { fetchRSS } from "@/lib/sources/rss";
import { fetchGitHubTrending } from "@/lib/sources/github";
import { saveArticles } from "@/lib/dedup";
import { translateBatch } from "@/lib/translate";

export async function GET() {
  const [arxiv, hn, rss, github] = await Promise.all([
    fetchArxiv(),
    fetchHackerNews(),
    fetchRSS(),
    fetchGitHubTrending(),
  ]);

  const all = [...arxiv, ...hn, ...rss, ...github];

  const translated = await translateBatch(all.map((a) => a.title));

  const articles = all.map((a, i) => ({
    ...a,
    title: translated[i] || a.title,
  }));

  const saved = await saveArticles(articles);

  return NextResponse.json({
    ok: true,
    crawled: {
      arxiv: arxiv.length,
      hackernews: hn.length,
      rss: rss.length,
      github: github.length,
    },
    saved,
  });
}
