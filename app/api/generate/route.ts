import { NextResponse } from "next/server";
import { generateArticle } from "@/lib/deepseek";
import type { Language, DifficultyLevel, Genre } from "@/types";

export async function POST(request: Request) {
  try {
    const {
      language,
      difficulty,
      genre,
      apiKey,
    }: { language: Language; difficulty: DifficultyLevel; genre: Genre; apiKey?: string } =
      await request.json();

    if (!language || !difficulty || !genre) {
      return NextResponse.json(
        { error: "Missing language, difficulty, or genre" },
        { status: 400 }
      );
    }

    const article = await generateArticle(language, difficulty, genre, apiKey);
    return NextResponse.json({ article });
  } catch (error) {
    console.error("Article generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate article" },
      { status: 500 }
    );
  }
}
