import { NextResponse } from "next/server";
import { analyzeMistake } from "@/lib/deepseek";
import type { Language, Question } from "@/types";

export async function POST(request: Request) {
  try {
    const {
      question,
      userAnswer,
      articleExcerpt,
      language,
      apiKey,
    }: {
      question: Question;
      userAnswer: string;
      articleExcerpt: string;
      language: Language;
      apiKey?: string;
    } = await request.json();

    if (!question || !userAnswer || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const analysis = await analyzeMistake(
      question,
      userAnswer,
      articleExcerpt,
      language,
      apiKey
    );
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Mistake analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze mistake" },
      { status: 500 }
    );
  }
}
