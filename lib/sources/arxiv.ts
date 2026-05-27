import { Article } from "./types";

export async function fetchArxiv(): Promise<Article[]> {
  try {
    const query = "cat:cs.AI";
    const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&sortBy=submittedDate&start=0&max_results=15`;

    const res = await fetch(url);
    const xml = await res.text();

    const articles: Article[] = [];
    const entries = xml.split("<entry>").slice(1);

    for (const entry of entries) {
      const title = extractTag(entry, "title");
      const link = extractTag(entry, "id");
      const summary = extractTag(entry, "summary");
      const published = extractTag(entry, "published");

      if (!title || !link) continue;

      articles.push({
        title: title.replace(/\s+/g, " ").trim(),
        url: link,
        summary: summary
          ? summary.replace(/\s+/g, " ").trim().slice(0, 300)
          : "",
        source: "arxiv",
        source_name: "arXiv cs.AI",
        published_at: published || null,
      });
    }

    return articles;
  } catch {
    return [];
  }
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match?.[1]?.replace(/<[^>]+>/g, "").trim() || "";
}
