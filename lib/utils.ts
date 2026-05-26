import type { Article, Question, UserAnswer, PracticeResult } from "@/types";

export function formatDate(isoStr: string, locale: string = "zh-CN"): string {
  return new Date(isoStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function computeResult(
  article: Article,
  questions: Question[],
  answers: UserAnswer[]
): PracticeResult {
  const total = questions.length || answers.length || 1;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  return {
    id: `${article.id}-${Date.now()}`,
    articleId: article.id,
    answers,
    score: Math.round((correctCount / total) * 100),
    correctCount,
    totalCount: total,
    completedAt: new Date().toISOString(),
  };
}

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

export function difficultyLabel(diff?: string): string {
  if (!diff) return "";
  if (diff.startsWith("N")) return `JLPT ${diff}`;
  if (/^\d$/.test(diff)) return `TOPIK ${diff}`;
  if (/^[ABC][12]$/.test(diff)) return `CEFR ${diff}`;
  return diff;
}
