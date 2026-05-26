"use client";

import { useEffect, useState, useCallback, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { v4 as uuid } from "uuid";
import { useArticleStore } from "@/stores/article-store";
import { useMistakeStore } from "@/stores/mistake-store";
import { useUserStore } from "@/stores/user-store";
import { useResponsive } from "@/hooks/use-responsive";
import { ArticleView } from "@/components/reader/article-view";
import { QuestionPanel } from "@/components/reader/question-panel";
import { QuestionCard } from "@/components/reader/question-card";
import { ResultSummary } from "@/components/reader/result-summary";
import { ExportButton } from "@/components/reader/export-button";
import type { Question, UserAnswer, PracticeResult } from "@/types";
import { computeResult } from "@/lib/utils";

type PageState = "loading" | "ready" | "submitted";
type FontSize = "small" | "medium" | "large";

const FONT_SIZE_CLASS: Record<FontSize, string> = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
};

const FONT_SIZE_LABEL: Record<FontSize, string> = {
  small: "小",
  medium: "中",
  large: "大",
};

export default function ReadPage({ params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = use(params);
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const order: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
    const idx = order.indexOf((theme as typeof order[number]) ?? "system");
    setTheme(order[(idx + 1) % 3]);
  };

  const articles = useArticleStore((s) => s.articles);
  const highlightsRaw = useArticleStore((s) => s.highlights[articleId]);
  const highlights = useMemo(() => highlightsRaw ?? [], [highlightsRaw]);
  const saveResult = useArticleStore((s) => s.saveResult);
  const updateArticleQuestions = useArticleStore((s) => s.updateArticleQuestions);
  const addMistake = useMistakeStore((s) => s.addMistake);
  const recordPractice = useUserStore((s) => s.recordPractice);
  const apiKey = useUserStore((s) => s.apiKey);

  const article = articles.find((a) => a.id === articleId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [analyzing, setAnalyzing] = useState<Record<string, boolean>>({});
  const [analyses, setAnalyses] = useState<Record<string, { reason: string; grammarVocab: string; correctThinking: string }>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isMobile) {
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
        const ratio = (clientY / window.innerHeight) * 100;
        setSplitRatio(Math.min(Math.max(ratio, 20), 70));
      } else {
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const ratio = (clientX / window.innerWidth) * 100;
        setSplitRatio(Math.min(Math.max(ratio, 25), 75));
      }
    };
    const handleEnd = () => setDragging(false);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleEnd);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [dragging, isMobile]);

  useEffect(() => {
    setSplitRatio(isMobile ? 45 : 50);
  }, [isMobile]);

  useEffect(() => {
    if (!article) return;

    if (article.questions && article.questions.length > 0) {
      setQuestions(article.questions);
      setPageState("ready");
    } else {
      fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleText: article.content,
          language: article.language,
          difficulty: article.difficulty,
          apiKey: apiKey || undefined,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const qs = (data.questions ?? []).map((q: Question) => ({
            ...q,
            articleId,
          }));
          setQuestions(qs);
          updateArticleQuestions(articleId, qs);
          setPageState("ready");
        })
        .catch(() => setPageState("ready"));
    }
  }, [article, articleId, apiKey]);

  const handleComplete = useCallback(
    (answers: UserAnswer[]) => {
      if (!article) return;
      setUserAnswers(answers);
      const practiceResult = computeResult(article, questions, answers);
      setResult(practiceResult);
      saveResult(practiceResult);
      setPageState("submitted");
      recordPractice(practiceResult.correctCount, practiceResult.totalCount);

      answers
        .filter((a) => !a.isCorrect)
        .forEach((a) => {
          const question = questions.find((q) => q.id === a.questionId);
          if (!question) return;
          addMistake({
            id: uuid(),
            articleId: article.id,
            articleTitle: article.title,
            question,
            userAnswer: a.selectedOption,
            answeredAt: new Date().toISOString(),
          });
        });
    },
    [article, questions, saveResult, recordPractice, addMistake]
  );

  const handleAnalyze = useCallback(
    async (questionId: string) => {
      if (!article || !result) return;
      const question = questions.find((q) => q.id === questionId);
      if (!question) return;
      const answer = userAnswers.find((a) => a.questionId === questionId);
      if (!answer) return;

      setAnalyzing((prev) => ({ ...prev, [questionId]: true }));
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            userAnswer: answer.selectedOption,
            articleExcerpt: article.content,
            language: article.language,
            apiKey: apiKey || undefined,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAnalyses((prev) => ({ ...prev, [questionId]: data.analysis }));
          // Persist analysis into result's UserAnswer
          const updatedAnswers = result.answers.map((a) =>
            a.questionId === questionId
              ? { ...a, aiAnalysis: data.analysis }
              : a
          );
          const updatedResult = { ...result, answers: updatedAnswers };
          setResult(updatedResult);
          saveResult(updatedResult);
        }
      } catch {
        // analysis failed silently
      } finally {
        setAnalyzing((prev) => ({ ...prev, [questionId]: false }));
      }
    },
    [article, questions, userAnswers, apiKey, result, saveResult]
  );

  const handleBack = useCallback(() => router.push("/"), [router]);

  const cycleFontSize = () => {
    const sizes: FontSize[] = ["small", "medium", "large"];
    const idx = sizes.indexOf(fontSize);
    setFontSize(sizes[(idx + 1) % 3]);
  };

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: "var(--color-text-muted)" }}>文章未找到</p>
          <button className="underline" style={{ color: "var(--color-accent)" }} onClick={handleBack}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const bgColor = { backgroundColor: "var(--color-bg)" };
  const borderColor = "1px solid var(--color-border)";

  const THEME_ICONS: Record<string, string> = { light: "☀️", dark: "🌙", system: "💻" };

  // Font size toggle
  const fontSizeToggle = (
    <button
      onClick={cycleFontSize}
      className="text-sm px-3 py-2 rounded border transition-opacity hover:opacity-80"
      style={{
        borderColor: "var(--color-border)",
        color: "var(--color-text-muted)",
        backgroundColor: "var(--color-surface)",
      }}
      title={`字号: ${FONT_SIZE_LABEL[fontSize]}`}
    >
      A<sup>{FONT_SIZE_LABEL[fontSize]}</sup>
    </button>
  );

  const backButton = (
    <button
      onClick={handleBack}
      className="text-sm px-3 py-2 rounded border transition-opacity hover:opacity-80 flex items-center gap-1"
      style={{
        borderColor: "var(--color-border)",
        color: "var(--color-text-muted)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      ← 返回
    </button>
  );

  const themeToggle = (
    <button
      onClick={cycleTheme}
      className="text-sm min-w-[40px] min-h-[40px] flex items-center justify-center rounded border transition-opacity hover:opacity-80"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
      title="切换主题"
    >
      {THEME_ICONS[theme ?? "system"]}
    </button>
  );

  const fullscreenToggle = (
    <button
      onClick={toggleFullscreen}
      className="text-sm min-w-[40px] min-h-[40px] flex items-center justify-center rounded border transition-opacity hover:opacity-80"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
      title={isFullscreen ? "退出全屏" : "全屏"}
    >
      {isFullscreen ? "⛷" : "⛶"}
    </button>
  );

  // Shared question review section shown after submission
  const questionReview = result && (
    <div className="space-y-4">
      <ResultSummary result={result} onBack={handleBack} />
      {questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          index={i}
          question={q}
          selected={userAnswers.find((a) => a.questionId === q.id)?.selectedOption ?? null}
          showResult={true}
          onSelect={() => {}}
          onAnalyze={handleAnalyze}
          analyzing={analyzing[q.id] ?? false}
          analysis={analyses[q.id] ?? null}
        />
      ))}

      {/* Full translation */}
      {article.translation && (
        <div className="rounded-xl border p-5" style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
          borderLeft: "3px solid var(--color-accent)",
        }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            全文翻译
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {article.translation}
          </p>
        </div>
      )}

      {/* Key vocabulary */}
      {article.vocabulary && article.vocabulary.length > 0 && (
        <div className="rounded-xl border p-5" style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>
            重点词汇语法
          </h3>
          <div className="space-y-2">
            {article.vocabulary.map((v, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 px-3 rounded-lg text-sm"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderBottom: i < article.vocabulary!.length - 1 ? "1px solid rgba(128,128,128,0.1)" : "none",
                }}
              >
                <span className="font-medium" style={{ color: "var(--color-accent)" }}>
                  {v.word}
                </span>
                {v.reading && (
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {v.reading}
                  </span>
                )}
                <span className="flex-1 text-right text-xs" style={{ color: "var(--color-text)" }}>
                  {v.meaning}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center pt-2">
        <ExportButton
          article={article}
          highlights={highlights}
          questions={questions}
          answers={userAnswers}
          score={result.score}
        />
      </div>
    </div>
  );

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen" style={bgColor}>
        <div className="overflow-y-auto px-4 pt-4" style={{ height: `${splitRatio}%` }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {backButton}
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {article.source}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {fullscreenToggle}
              {themeToggle}
              {fontSizeToggle}
            </div>
          </div>
          <ArticleView
            articleId={article.id}
            title={article.title}
            content={article.content}
            source={article.source}
            language={article.language}
            difficulty={article.difficulty}
            genre={article.genre}
            fontSize={FONT_SIZE_CLASS[fontSize]}
            hideSource
          />
        </div>
        <div
          className="h-5 flex-shrink-0 cursor-row-resize flex items-center justify-center"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="h-px w-full rounded" style={{ backgroundColor: dragging ? "var(--color-accent)" : "var(--color-border)" }} />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {pageState === "loading" ? (
            <div className="flex items-center justify-center h-full">
              <p style={{ color: "var(--color-text-muted)" }}>正在生成题目...</p>
            </div>
          ) : pageState === "submitted" && result ? (
            questionReview
          ) : (
            <QuestionPanel questions={questions} onComplete={handleComplete} />
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex h-screen" style={bgColor}>
      <div className="overflow-y-auto px-6 py-6" style={{ width: `${splitRatio}%` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {backButton}
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {article.source}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {fullscreenToggle}
            {themeToggle}
            {fontSizeToggle}
          </div>
        </div>
        <ArticleView
          articleId={article.id}
          title={article.title}
          content={article.content}
          source={article.source}
          language={article.language}
          difficulty={article.difficulty}
          genre={article.genre}
          fontSize={FONT_SIZE_CLASS[fontSize]}
          hideSource
        />
      </div>

      <div
        className="w-5 flex-shrink-0 cursor-col-resize flex items-center justify-center mr-1"
        onMouseDown={handleDragStart}
      >
        <div className="w-px h-full rounded" style={{ backgroundColor: dragging ? "var(--color-accent)" : "var(--color-border)" }} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {pageState === "loading" ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: "var(--color-accent)" }} />
              <p style={{ color: "var(--color-text-muted)" }}>正在生成题目...</p>
            </div>
          </div>
        ) : pageState === "submitted" && result ? (
          questionReview
        ) : (
          <QuestionPanel questions={questions} onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
}
