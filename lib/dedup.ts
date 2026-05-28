import { supabaseAdmin } from "./supabase";
import { Article } from "./sources/types";

export async function saveArticles(articles: Article[]): Promise<number> {
  if (articles.length === 0) return 0;

  const { error } = await supabaseAdmin.from("articles").upsert(
    articles,
    { onConflict: "url" }
  );

  if (error) {
    console.error("Failed to save articles:", error);
    return 0;
  }

  return articles.length;
}
