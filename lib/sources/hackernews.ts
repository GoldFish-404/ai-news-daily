import { Article } from "./types";

const AI_KEYWORDS = [
  "ai", "artificial intelligence", "llm", "gpt", "claude", "chatgpt",
  "openai", "anthropic", "deepmind", "machine learning", "neural",
  "transformer", "diffusion", "stable diffusion", "midjourney",
  "copilot", "gemini", "deepseek", "mistral", "langchain", "rag",
  "agent", "reinforcement learning", "rlhf", "fine-tun",
];

export async function fetchHackerNews(): Promise<Article[]> {
  try {
    const topIds: number[] = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    ).then((r) => r.json());

    const top100 = topIds.slice(0, 100);

    const items = await Promise.all(
      top100.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
          (r) => r.json()
        )
      )
    );

    const articles: Article[] = [];

    for (const item of items) {
      if (!item || !item.title) continue;
      const text = `${item.title} ${item.url || ""}`.toLowerCase();
      const matches =
        AI_KEYWORDS.some(
          (kw) =>
            text.includes(` ${kw}`) ||
            text.includes(`-${kw}`) ||
            text.startsWith(kw)
        ) ||
        (item.score || 0) >= 200;

      if (!matches) continue;

      articles.push({
        title: item.title,
        url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        summary: `${item.score || 0} points · ${item.descendants || 0} comments${item.by ? ` · by ${item.by}` : ""}`,
        source: "hackernews",
        source_name: "Hacker News",
        published_at: new Date(item.time * 1000).toISOString(),
      });
    }

    return articles;
  } catch {
    return [];
  }
}
