export interface Article {
  title: string;
  url: string;
  summary: string;
  source: "arxiv" | "hackernews" | "rss" | "github";
  source_name: string;
  published_at: string | null;
}
