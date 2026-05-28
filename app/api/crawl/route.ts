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

  const translatedTitles = await translateBatch(all.map((a) => a.title));

  const ghSummaries = github
    .filter((a) => a.summary)
    .map((a) => a.summary);
  const translatedSummaries = await translateBatch(ghSummaries);

  let si = 0;
  const articles = all.map((a, i) => ({
    ...a,
    title: translatedTitles[i] || a.title,
    summary:
      a.source === "github" && a.summary
        ? translatedSummaries[si++] || a.summary
        : a.summary,
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
