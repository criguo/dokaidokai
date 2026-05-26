"use client";

import { useState, useMemo } from "react";
import { useArticleStore } from "@/stores/article-store";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuestionCard } from "@/components/reader/question-card";
import type { PracticeResult, Genre, Language } from "@/types";
import { getGenreLabel } from "@/types";
import { formatDate, difficultyLabel } from "@/lib/utils";

const LANG_NAMES: Record<string, string> = {
  ja: "日本語", ko: "한국어", en: "English", de: "Deutsch", fr: "Français",
};

function InfoTags({ language, difficulty, genre }: { language?: Language; difficulty?: string; genre?: Genre }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-1">
      {language && (
        <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{
          backgroundColor: "rgba(196,136,124,0.1)",
          color: "var(--color-error)",
        }}>
          {LANG_NAMES[language] ?? language}
        </span>
      )}
      {difficulty && (
        <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{
          backgroundColor: "rgba(139,157,131,0.1)",
          color: "var(--color-accent)",
        }}>
          {difficultyLabel(difficulty)}
        </span>
      )}
      {genre && (
        <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{
          backgroundColor: "rgba(196,168,130,0.12)",
          color: "#b8956a",
        }}>
          {getGenreLabel(genre, language)}
        </span>
      )}
    </div>
  );
}

export default function PracticeRecordsPage() {
  const articles = useArticleStore((s) => s.articles);
  const results = useArticleStore((s) => s.results);

  const [selectedResult, setSelectedResult] = useState<PracticeResult | null>(null);

  const resultList = useMemo(() => {
    return Object.values(results).sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }, [results]);

  const selectedArticle = selectedResult
    ? articles.find((a) => a.id === selectedResult.articleId)
    : null;

  const selectedQuestions = selectedArticle?.questions ?? [];

  const cardStyle = {
    backgroundColor: "var(--color-surface)",
    borderColor: "var(--color-border)",
  } as const;

  return (
    <div className="min-h-screen pb-16 md:pb-0" style={{ backgroundColor: "var(--color-bg)" }}>
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-lg font-bold mb-6" style={{ color: "var(--color-text)" }}>
          做题记录
        </h1>

        {resultList.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📝</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              还没有做题记录
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
              完成练习后，做题记录会自动出现在这里
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {resultList.map((r) => {
              const article = articles.find((a) => a.id === r.articleId);
              return (
                <button
                  key={r.id}
                  className="w-full text-left rounded-xl border p-4 transition-all hover:shadow-sm"
                  style={cardStyle}
                  onClick={() => setSelectedResult(r)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>
                        {article?.title ?? "已删除的文章"}
                      </p>
                      {article && (
                        <InfoTags language={article.language} difficulty={article.difficulty} genre={article.genre} />
                      )}
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                        {formatDate(r.completedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: r.score >= 60 ? "var(--color-success)" : "var(--color-error)" }}
                      >
                        {r.score}分
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {r.correctCount}/{r.totalCount}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <MobileNav />

      {/* Review dialog */}
      {selectedResult && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/30"
            onClick={() => setSelectedResult(null)}
          />
          <div
            className="fixed inset-4 z-50 max-h-[90vh] overflow-y-auto rounded-2xl mx-auto max-w-3xl"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b" style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}>
              <h2 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                练习回顾
              </h2>
              <button
                className="text-sm px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-muted)",
                  backgroundColor: "var(--color-surface)",
                }}
                onClick={() => setSelectedResult(null)}
              >
                关闭
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Score */}
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    border: `3px solid ${selectedResult.score >= 60 ? "var(--color-success)" : "var(--color-error)"}`,
                    color: selectedResult.score >= 60 ? "var(--color-success)" : "var(--color-error)",
                  }}
                >
                  <span className="text-lg font-bold">{selectedResult.score}</span>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    {selectedArticle?.title ?? "未知文章"}
                  </p>
                  {selectedArticle && (
                    <InfoTags language={selectedArticle.language} difficulty={selectedArticle.difficulty} genre={selectedArticle.genre} />
                  )}
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    正确 {selectedResult.correctCount}/{selectedResult.totalCount} · {formatDate(selectedResult.completedAt)}
                  </p>
                </div>
              </div>

              {/* Article content (read-only) */}
              {selectedArticle && (
                <div className="rounded-xl border p-4" style={cardStyle}>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-muted)" }}>
                    文章原文
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--color-text)" }}>
                    {selectedArticle.content}
                  </p>
                </div>
              )}

              {/* Questions */}
              {selectedQuestions.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-muted)" }}>
                    题目回顾
                  </h3>
                  <div className="space-y-3">
                    {selectedQuestions.map((q, i) => {
                      const answer = selectedResult.answers.find((a) => a.questionId === q.id);
                      return (
                        <QuestionCard
                          key={q.id}
                          index={i}
                          question={q}
                          selected={answer?.selectedOption ?? null}
                          showResult={true}
                          onSelect={() => {}}
                          analysis={answer?.aiAnalysis ?? null}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Translation */}
              {selectedArticle?.translation && (
                <div className="rounded-xl border p-4" style={{
                  ...cardStyle,
                  borderLeft: "3px solid var(--color-accent)",
                }}>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-muted)" }}>
                    全文翻译
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {selectedArticle.translation}
                  </p>
                </div>
              )}

              {/* Vocabulary */}
              {selectedArticle?.vocabulary && selectedArticle.vocabulary.length > 0 && (
                <div className="rounded-xl border p-4" style={cardStyle}>
                  <h3 className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-muted)" }}>
                    重点词汇语法
                  </h3>
                  <div className="space-y-1">
                    {selectedArticle.vocabulary.map((v, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm"
                        style={{
                          backgroundColor: "var(--color-bg)",
                          borderBottom: i < selectedArticle.vocabulary!.length - 1 ? "1px solid rgba(128,128,128,0.1)" : "none",
                        }}
                      >
                        <span className="font-medium" style={{ color: "var(--color-accent)" }}>{v.word}</span>
                        {v.reading && (
                          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{v.reading}</span>
                        )}
                        <span className="flex-1 text-right text-xs" style={{ color: "var(--color-text)" }}>{v.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-4" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
