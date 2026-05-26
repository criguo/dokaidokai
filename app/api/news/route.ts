import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { generateArticle } from "@/lib/deepseek";
import type { Language, DifficultyLevel, Genre, NewsItem } from "@/types";

/**
 * Generate AI articles for the given language and difficulty.
 * Falls back to mock data if DeepSeek key is not configured.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = (searchParams.get("language") || "ja") as Language;
  const difficulty = (searchParams.get("difficulty") ||
    (language === "ja" ? "N3" : "3")) as DifficultyLevel;
  const defaultGenre: Genre = language === "ja" ? "説明文" : "설명문";

  try {
    const count = 2;
    const articles = [];

    for (let i = 0; i < count; i++) {
      try {
        const generated = await generateArticle(language, difficulty, defaultGenre);
        articles.push({
          id: `${language}-${uuid()}-${i}`,
          title: generated.title,
          content: generated.content,
          language,
          difficulty,
          genre: defaultGenre,
          translation: generated.translation,
          vocabulary: generated.vocabulary,
          source: "AI Generated",
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
      } catch {
        // Individual generation failed, try mock fallback
        continue;
      }
    }

    // If AI generation completely failed, use mock data
    if (articles.length === 0) {
      const mock =
        language === "ja"
          ? (await import("@/data/mock/ja-news")).jaMockNews
          : (await import("@/data/mock/ko-news")).koMockNews;
      const mocks = (mock as NewsItem[]).map(
        (item, idx) => ({
          id: `${language}-mock-${uuid()}-${idx}`,
          title: item.title,
          content: item.content,
          language,
          difficulty,
          genre: defaultGenre,
          source: item.source,
          publishedAt: item.publishedAt,
          createdAt: new Date().toISOString(),
        })
      );
      return NextResponse.json({ articles: mocks });
    }

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
