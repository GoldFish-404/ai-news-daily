import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { translateBatch } from "@/lib/translate";

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export async function GET() {
  const { data: articles } = await supabaseAdmin
    .from("articles")
    .select("id, title, summary, source")
    .order("crawled_at", { ascending: false })
    .limit(200);

  if (!articles || articles.length === 0) {
    return NextResponse.json({ ok: true, translated: 0 });
  }

  const chunks = chunk(articles, 30);
  let count = 0;

  for (const batch of chunks) {
    const texts = batch.map((a: { title: string }) => a.title);
    const translated = await translateBatch(texts);

    for (let i = 0; i < batch.length; i++) {
      if (translated[i] && translated[i] !== batch[i].title) {
        await supabaseAdmin
          .from("articles")
          .update({ title: translated[i] })
          .eq("id", batch[i].id);
        count++;
      }
    }
  }

  const githubArticles = articles.filter(
    (a: { source: string; summary: string }) =>
      a.source === "github" && a.summary
  );

  if (githubArticles.length > 0) {
    const ghChunks = chunk(githubArticles, 30);
    for (const batch of ghChunks) {
      const summaries = batch.map((a: { summary: string }) => a.summary);
      const translated = await translateBatch(summaries);

      for (let i = 0; i < batch.length; i++) {
        if (translated[i] && translated[i] !== batch[i].summary) {
          await supabaseAdmin
            .from("articles")
            .update({ summary: translated[i] })
            .eq("id", batch[i].id);
          count++;
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    translated: count,
    total: articles.length,
    githubSummaries: githubArticles.length,
  });
}
