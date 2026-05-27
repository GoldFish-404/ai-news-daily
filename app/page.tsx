import { supabase } from "@/lib/supabase";
import { NewsPage } from "./news-page";

export interface ArticleRow {
  id: string;
  title: string;
  url: string;
  summary: string;
  source: string;
  source_name: string;
  published_at: string;
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(200);

  const articles = (data || []) as ArticleRow[];

  return <NewsPage articles={articles} />;
}
