import { NextResponse } from "next/server";
import { generateQuestions } from "@/lib/deepseek";
import type { Language, DifficultyLevel } from "@/types";

export async function POST(request: Request) {
  try {
    const {
      articleText,
      language,
      difficulty,
      apiKey,
    }: {
      articleText: string;
      language: Language;
      difficulty: DifficultyLevel;
      apiKey?: string;
    } = await request.json();

    if (!articleText || !language || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const questions = await generateQuestions(
      articleText,
      language,
      difficulty,
      apiKey
    );
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Question generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
