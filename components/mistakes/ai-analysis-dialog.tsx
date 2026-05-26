"use client";

import { useEffect, useState } from "react";
import { useMistakeStore } from "@/stores/mistake-store";
import { useUserStore } from "@/stores/user-store";
import type { MistakeRecord, AIAnalysis, Language } from "@/types";

interface AIAnalysisDialogProps {
  open: boolean;
  onClose: () => void;
  mistake: MistakeRecord;
}

export function AIAnalysisDialog({ open, onClose, mistake }: AIAnalysisDialogProps) {
  const setAnalysis = useMistakeStore((s) => s.setAnalysis);
  const apiKey = useUserStore((s) => s.apiKey);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysisState] = useState<AIAnalysis | null>(
    mistake.aiAnalysis ?? null
  );

  useEffect(() => {
    setAnalysisState(mistake.aiAnalysis ?? null);
  }, [mistake]);

  if (!open) return null;

  const lang: Language =
    mistake.question.articleId.startsWith("ja") ? "ja" : "ko";

  const fetchAnalysis = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: mistake.question,
          userAnswer: mistake.userAnswer,
          articleExcerpt: "",
          language: lang,
          apiKey: apiKey || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const result: AIAnalysis = {
        ...data.analysis,
        analyzedAt: new Date().toISOString(),
      };
      setAnalysisState(result);
      setAnalysis(mistake.id, result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "AI 分析请求失败");
    } finally {
      setLoading(false);
    }
  };

  const sectionTitle = (title: string, color: string) => (
    <h4 className="text-sm font-semibold mb-1" style={{ color }}>{title}</h4>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className="rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
            AI 错题解析
          </h3>
          <button
            className="text-lg leading-none hover:opacity-70"
            style={{ color: "var(--color-text-muted)" }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: "var(--color-bg)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
              {mistake.question.stem}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
              你的答案:{" "}
              <span className="font-medium" style={{ color: "var(--color-error)" }}>
                {mistake.userAnswer}
              </span>
              {" · "}
              正确答案:{" "}
              <span className="font-medium" style={{ color: "var(--color-success)" }}>
                {mistake.question.correctAnswer}
              </span>
            </p>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full mx-auto mb-3" style={{ borderColor: "var(--color-accent)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>AI 分析中...</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg text-sm mb-4" style={{ backgroundColor: "rgba(196,136,124,0.1)", color: "var(--color-error)" }}>
              {error}
              <button className="ml-2 underline" onClick={fetchAnalysis}>重试</button>
            </div>
          )}

          {!loading && analysis && (
            <div className="space-y-4">
              <div>
                {sectionTitle("错误原因", "var(--color-error)")}
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>{analysis.reason}</p>
              </div>
              <div>
                {sectionTitle("语法 / 词汇讲解", "var(--color-accent)")}
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>{analysis.grammarVocab}</p>
              </div>
              <div>
                {sectionTitle("正确思路", "var(--color-success)")}
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>{analysis.correctThinking}</p>
              </div>
            </div>
          )}

          {!loading && !analysis && !error && (
            <div className="text-center py-6">
              <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
                获取 AI 深度解析，了解错题原因和学习要点
              </p>
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-85"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-accent-text)",
                }}
                onClick={fetchAnalysis}
              >
                {apiKey ? "开始分析" : "开始分析（需要先设置 API Key）"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
