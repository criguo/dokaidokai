"use client";

import { useState, useCallback, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { useUserStore } from "@/stores/user-store";
import { useArticleStore } from "@/stores/article-store";
import { useMistakeStore } from "@/stores/mistake-store";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ArticleCard } from "@/components/dashboard/article-card";
import type { ArticleWithMeta, Language, DifficultyLevel, Genre } from "@/types";
import { JLPT_LEVELS, TOPIK_LEVELS, CEFR_LEVELS, JA_GENRES, KO_GENRES, getEuGenres } from "@/types";
import { difficultyLabel } from "@/lib/utils";

type FilterMode = "all" | Language;

export default function HomePage() {
  const preferences = useUserStore((s) => s.preferences);
  const setLanguage = useUserStore((s) => s.setLanguage);
  const setDifficulty = useUserStore((s) => s.setDifficulty);
  const apiKey = useUserStore((s) => s.apiKey);

  const articles = useArticleStore((s) => s.articles);
  const setArticles = useArticleStore((s) => s.setArticles);
  const removeArticle = useArticleStore((s) => s.removeArticle);
  const clearArticles = useArticleStore((s) => s.clearArticles);

  const clearMistakes = useMistakeStore((s) => s.clearAll);
  const clearStats = useUserStore((s) => s.clearStats);

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [genre, setGenre] = useState<Genre>("説明文");
  const [filter, setFilter] = useState<FilterMode>("all");

  const lang = preferences?.targetLanguage ?? "ja";
  const diff = preferences?.difficulty ?? "N3";
  const levels =
    lang === "ja" ? JLPT_LEVELS :
    lang === "ko" ? TOPIK_LEVELS :
    CEFR_LEVELS;
  const genres =
    lang === "ja" ? JA_GENRES :
    lang === "ko" ? KO_GENRES :
    getEuGenres(lang);

  useEffect(() => {
    setGenre(
      lang === "ja" ? "説明文" :
      lang === "ko" ? "설명문" : "news"
    );
  }, [lang]);

  // All articles sorted by creation time (newest first)
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Apply filter
  const displayedArticles =
    filter === "all"
      ? sortedArticles
      : sortedArticles.filter((a) => a.language === filter);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: lang,
          difficulty: diff,
          genre,
          apiKey: apiKey || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "生成失败");
      }

      const data = await res.json();
      const article: ArticleWithMeta = {
        id: `${lang}-${uuid()}`,
        title: data.article.title,
        content: data.article.content,
        language: lang,
        difficulty: diff,
        genre,
        source: "AI Generated",
        translation: data.article.translation,
        vocabulary: data.article.vocabulary,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        questions: [],
        questionCount: 0,
      };

      setArticles([article, ...articles]);
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : "生成失败");
    } finally {
      setGenerating(false);
    }
  }, [lang, diff, genre, apiKey, articles, setArticles]);

  const handleClearAll = () => {
    if (confirm("确定要清空所有文章、批注、做题记录和错题吗？此操作不可撤销。")) {
      clearArticles();
      clearMistakes();
      clearStats();
    }
  };

  const handleDeleteArticle = (id: string) => {
    removeArticle(id);
  };

  const filterBtnStyle = (mode: FilterMode) =>
    `text-xs px-3 py-1.5 rounded-lg border transition-colors ${
      filter === mode ? "font-semibold" : ""
    }`;

  return (
    <div className="min-h-screen pb-16 md:pb-0" style={{ backgroundColor: "var(--color-bg)" }}>
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* AI Generate row */}
        <section className="mb-6">
          <div className="rounded-xl border p-4" style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--color-text-muted)" }}>
              AI 生成文章
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {/* Language selector */}
              <select
                className="text-xs rounded-lg border px-2 py-2 min-h-[36px] appearance-none cursor-pointer"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
                value={lang}
                onChange={(e) => setLanguage(e.target.value as Language)}
              >
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
              </select>

              {/* Level selector */}
              <select
                className="text-xs rounded-lg border px-2 py-2 min-h-[36px] appearance-none cursor-pointer"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
                value={diff}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lang === "ja" ? `JLPT ${lvl}` : lang === "ko" ? `TOPIK ${lvl}` : `CEFR ${lvl}`}
                  </option>
                ))}
              </select>

              {/* Genre selector */}
              <select
                className="text-xs rounded-lg border px-2 py-2 min-h-[36px] appearance-none cursor-pointer"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
                value={genre}
                onChange={(e) => setGenre(e.target.value as Genre)}
              >
                {genres.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>

              {/* Generate button */}
              <button
                disabled={generating}
                className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-85 disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-accent-text)",
                }}
                onClick={handleGenerate}
              >
                {generating ? (
                  <>
                    <span className="animate-spin w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
                    生成中...
                  </>
                ) : (
                  "✨ 生成"
                )}
              </button>
            </div>

            {genError && (
              <p className="text-xs mt-2" style={{ color: "var(--color-error)" }}>
                {genError}
                {!apiKey && " — 请点击右上角 ⚙️ 设置 API Key"}
              </p>
            )}
          </div>
        </section>

        {/* Articles section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              阅读文章
            </h2>

            <div className="flex items-center gap-2">
              {/* Filter tabs - desktop */}
              <div className="hidden md:flex items-center rounded-lg border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
                {([
                  ["all", "全部"],
                  ["en", "English"],
                  ["ja", "日本語"],
                  ["ko", "한국어"],
                  ["de", "Deutsch"],
                  ["fr", "Français"],
                ] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    onClick={() => setFilter(mode)}
                    className="text-xs px-2.5 py-1.5 transition-colors"
                    style={{
                      backgroundColor: filter === mode ? "var(--color-accent)" : "transparent",
                      color: filter === mode ? "var(--color-accent-text)" : "var(--color-text-muted)",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Filter dropdown - mobile */}
              <select
                className="md:hidden text-xs rounded-lg border px-2 py-1.5 appearance-none cursor-pointer"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterMode)}
              >
                <option value="all">全部</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
              </select>

              {/* Clear button */}
              {articles.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs px-2.5 py-1.5 rounded-lg border active:scale-95 transition-transform"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-error)",
                  }}
                >
                  清空全部
                </button>
              )}
            </div>
          </div>

          {/* Generating placeholder */}
          {generating && (
            <div className="mb-4 rounded-xl border p-8 animate-pulse" style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}>
              <div className="h-5 rounded w-3/4 mb-3" style={{ backgroundColor: "var(--color-border)" }} />
              <div className="h-4 rounded w-full mb-2" style={{ backgroundColor: "var(--color-border)" }} />
              <div className="h-4 rounded w-2/3" style={{ backgroundColor: "var(--color-border)" }} />
              <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)" }}>
                AI 正在根据 {difficultyLabel(diff)} 难度创作{
                  lang === "ja" ? "日语" :
                  lang === "ko" ? "韩语" :
                  lang === "de" ? "德语" :
                  lang === "fr" ? "法语" : "英语"
                }文章...
              </p>
            </div>
          )}

          {/* Empty state */}
          {!generating && displayedArticles.length === 0 && (
            <div className="text-center py-16 rounded-xl border" style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}>
              <p className="text-4xl mb-3">📄</p>
              <p className="text-sm mb-1" style={{ color: "var(--color-text)" }}>
                还没有文章
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                选择语言和等级，点击「✨ 生成」让 AI 为你创作阅读文章
              </p>
            </div>
          )}

          {/* Article list */}
          {!generating && displayedArticles.length > 0 && (
            <div className="space-y-3">
              {displayedArticles.map((article) => (
                <div key={article.id} className="relative group">
                  <ArticleCard article={article} />
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteArticle(article.id);
                    }}
                    className="absolute top-3 right-3 text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity active:opacity-100"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text-muted)",
                    }}
                    title="删除"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
