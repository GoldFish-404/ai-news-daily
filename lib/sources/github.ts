import * as cheerio from "cheerio";
import { Article } from "./types";

export async function fetchGitHubTrending(): Promise<Article[]> {
  try {
    const res = await fetch("https://github.com/trending?since=daily", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html",
      },
    });

    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);

    const articles: Article[] = [];

    $("article.Box-row").each((_i, el) => {
      const $el = $(el);
      const repo =
        $el.find("h2 a").attr("href")?.replace("/", "").trim() || "";
      const description = $el.find("p").text().trim();

      if (!repo) return;

      articles.push({
        title: repo,
        url: `https://github.com/${repo}`,
        summary: description || `${repo} — trending on GitHub today`,
        source: "github",
        source_name: "GitHub Trending",
        published_at: new Date().toISOString(),
      });
    });

    return articles;
  } catch {
    return [];
  }
}
