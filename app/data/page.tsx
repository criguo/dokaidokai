"use client";

import { useMemo } from "react";
import { useUserStore } from "@/stores/user-store";
import { useArticleStore } from "@/stores/article-store";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { formatDate } from "@/lib/utils";

export default function DataPage() {
  const stats = useUserStore((s) => s.stats);
  const articles = useArticleStore((s) => s.articles);
  const results = useArticleStore((s) => s.results);

  const accuracy =
    stats.totalQuestionsAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestionsAnswered) * 100)
      : 0;

  const jaCount = articles.filter((a) => a.language === "ja").length;
  const koCount = articles.filter((a) => a.language === "ko").length;
  const enCount = articles.filter((a) => a.language === "en").length;
  const deCount = articles.filter((a) => a.language === "de").length;
  const frCount = articles.filter((a) => a.language === "fr").length;

  const resultList = useMemo(() => {
    return Object.values(results).sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }, [results]);

  const cardStyle = {
    backgroundColor: "var(--color-surface)",
    borderColor: "var(--color-border)",
  } as const;

  const statCards = [
    { value: stats.totalQuestionsAnswered, label: "做题总数", color: "var(--color-accent)" },
    { value: `${accuracy}%`, label: "正确率", color: "var(--color-success)" },
    { value: stats.currentStreak, label: "连续天数", color: "var(--color-warning)" },
  ];

  return (
    <div className="min-h-screen pb-16 md:pb-0" style={{ backgroundColor: "var(--color-bg)" }}>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-lg font-bold mb-6" style={{ color: "var(--color-text)" }}>
          📊 学习数据
        </h1>

        {/* Stats cards */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-muted)" }}>
            总体统计
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {statCards.map((item) => (
              <div key={item.label} className="rounded-xl border p-4 text-center" style={cardStyle}>
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Language distribution */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-muted)" }}>
            语言分布
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {([
              { lang: "en", flag: "🇬🇧", label: "English", color: "var(--color-info)", count: enCount },
              { lang: "ja", flag: "🇯🇵", label: "日本語", color: "var(--color-error)", count: jaCount },
              { lang: "ko", flag: "🇰🇷", label: "한국어", color: "var(--color-accent)", count: koCount },
              { lang: "de", flag: "🇩🇪", label: "Deutsch", color: "var(--color-warning)", count: deCount },
              { lang: "fr", flag: "🇫🇷", label: "Français", color: "var(--color-success)", count: frCount },
            ]).map(({ lang, flag, label, color, count }) => (
              <div key={lang} className="rounded-xl border p-4" style={cardStyle}>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--color-text)" }}>{flag} {label}</span>
                  <span className="text-xl font-bold" style={{ color }}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Practice history */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-muted)" }}>
            练习记录
          </h2>
          {resultList.length === 0 ? (
            <div className="rounded-xl border p-8 text-center" style={cardStyle}>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>暂无练习记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {resultList.map((r) => {
                const article = articles.find((a) => a.id === r.articleId);
                return (
                  <div key={r.id} className="rounded-xl border p-4 flex items-center justify-between" style={cardStyle}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>
                        {article?.title ?? "已删除的文章"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                        {formatDate(r.completedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
                        {r.score}分
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {r.correctCount}/{r.totalCount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
