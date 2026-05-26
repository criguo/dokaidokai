"use client";

import type { Question, QuestionType, UserAnswer } from "@/types";
import { QUESTION_TYPE_LABELS } from "@/types";

interface AIAnalysis {
  reason: string;
  grammarVocab: string;
  correctThinking: string;
}

interface QuestionCardProps {
  index: number;
  question: Question;
  selected: string | null;
  showResult: boolean;
  onSelect: (questionId: string, option: string) => void;
  onAnalyze?: (questionId: string) => void;
  analyzing?: boolean;
  analysis?: AIAnalysis | null;
}

export function QuestionCard({
  index,
  question,
  selected,
  showResult,
  onSelect,
  onAnalyze,
  analyzing = false,
  analysis = null,
}: QuestionCardProps) {
  const isCorrect = selected === question.correctAnswer;

  let cardBg = "var(--color-surface)";
  let cardBorder = "1px solid var(--color-border)";
  if (showResult) {
    cardBg = isCorrect
      ? "rgba(139,157,131,0.08)"
      : "rgba(196,136,124,0.08)";
    cardBorder = isCorrect
      ? "1px solid var(--color-success)"
      : "1px solid var(--color-error)";
  }

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: cardBorder }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{
          backgroundColor: "var(--color-border)",
          color: "var(--color-text-muted)",
        }}>
          {QUESTION_TYPE_LABELS[question.type as QuestionType] ?? question.type}
        </span>
        <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          Q{index + 1}
        </span>
      </div>

      <p className="text-sm mb-3 leading-relaxed" style={{ color: "var(--color-text)" }}>
        {question.stem}
      </p>

      <div className="space-y-2">
        {question.options.map((opt) => {
          const isSelected = selected === opt.label;
          const isCorrectOption = opt.label === question.correctAnswer;
          let bg = "transparent";
          let border = "1px solid var(--color-border)";

          if (showResult) {
            if (isCorrectOption) {
              bg = "rgba(139,157,131,0.15)";
              border = "1px solid var(--color-success)";
            } else if (isSelected && !isCorrectOption) {
              bg = "rgba(196,136,124,0.12)";
              border = "1px solid var(--color-error)";
            } else {
              bg = "transparent";
              border = "1px solid var(--color-border)";
              return (
                <div
                  key={opt.label}
                  className="w-full text-left p-3 rounded-md text-sm opacity-50"
                  style={{ border, backgroundColor: bg, color: "var(--color-text-muted)" }}
                >
                  <span className="font-medium mr-2">{opt.label}.</span>
                  {opt.text}
                </div>
              );
            }
          } else if (isSelected) {
            bg = "rgba(139,157,131,0.1)";
            border = "1px solid var(--color-accent)";
          }

          return (
            <button
              key={opt.label}
              disabled={showResult}
              className="w-full text-left p-3 rounded-md text-sm transition-colors"
              style={{ border, backgroundColor: bg, color: "var(--color-text)" }}
              onClick={() => onSelect(question.id, opt.label)}
            >
              <span className="font-medium mr-2">{opt.label}.</span>
              {opt.text}
              {showResult && isCorrectOption && (
                <span className="ml-2" style={{ color: "var(--color-success)" }}>✓</span>
              )}
              {showResult && isSelected && !isCorrectOption && (
                <span className="ml-2" style={{ color: "var(--color-error)" }}>✗</span>
              )}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
          <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
            <span className="font-medium">解析：</span>
            {question.explanation}
          </p>

          {!analysis && onAnalyze && (
            <button
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80 flex items-center gap-1"
              style={{
                borderColor: "var(--color-accent)",
                color: "var(--color-accent)",
              }}
              disabled={analyzing}
              onClick={() => onAnalyze(question.id)}
            >
              {analyzing ? (
                <>
                  <span className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                  AI 解析中...
                </>
              ) : (
                "AI 深入解析"
              )}
            </button>
          )}

          {analysis && (
            <div className="space-y-2 mt-2">
              <div className="rounded-lg p-3 text-xs" style={{ backgroundColor: "rgba(196,136,124,0.08)", color: "var(--color-error)" }}>
                <span className="font-medium">错误原因：</span>
                {analysis.reason}
              </div>
              <div className="rounded-lg p-3 text-xs" style={{ backgroundColor: "rgba(139,157,131,0.08)", color: "var(--color-accent)" }}>
                <span className="font-medium">语法词汇：</span>
                {analysis.grammarVocab}
              </div>
              <div className="rounded-lg p-3 text-xs" style={{ backgroundColor: "rgba(139,157,131,0.08)", color: "var(--color-success)" }}>
                <span className="font-medium">正确思路：</span>
                {analysis.correctThinking}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
