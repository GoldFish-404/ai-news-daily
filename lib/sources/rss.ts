import Parser from "rss-parser";
import { Article } from "./types";

const parser = new Parser();

const FEEDS = [
  { url: "https://openai.com/blog/rss.xml", name: "OpenAI Blog" },
  { url: "https://www.anthropic.com/blog/rss.xml", name: "Anthropic Blog" },
  {
    url: "https://deepmind.google/blog/feed.xml",
    name: "Google DeepMind Blog",
  },
  { url: "https://ai.meta.com/blog/feed/rss/", name: "Meta AI Blog" },
];

export async function fetchRSS(): Promise<Article[]> {
  try {
    const results = await Promise.allSettled(
      FEEDS.map((feed) =>
        parser.parseURL(feed.url).then((parsed) => ({ feed, parsed }))
      )
    );

    const articles: Article[] = [];

    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      const { feed, parsed } = result.value;

      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      for (const item of parsed.items || []) {
        if (!item.title || !item.link) continue;
        const pubDate = item.isoDate ? new Date(item.isoDate).getTime() : 0;
        if (pubDate && pubDate < sevenDaysAgo) continue;

        articles.push({
          title: item.title,
          url: item.link,
          summary: (item.contentSnippet || item.content || "").slice(0, 300),
          source: "rss",
          source_name: feed.name,
          published_at: item.isoDate || item.pubDate || null,
        });
      }
    }

    return articles;
  } catch {
    return [];
  }
}
