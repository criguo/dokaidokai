"use client";

import { useState, useCallback } from "react";
import type { Question, UserAnswer } from "@/types";
import { QuestionCard } from "./question-card";

interface QuestionPanelProps {
  questions: Question[];
  onComplete: (answers: UserAnswer[]) => void;
}

export function QuestionPanel({ questions, onComplete }: QuestionPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = useCallback((questionId: string, option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }, [submitted]);

  const allAnswered = questions.every((q) => answers[q.id]);

  const handleSubmit = () => {
    if (!allAnswered || submitted) return;
    setSubmitted(true);
    const userAnswers: UserAnswer[] = questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id],
      isCorrect: answers[q.id] === q.correctAnswer,
      answeredAt: new Date().toISOString(),
    }));
    onComplete(userAnswers);
  };

  const correctCount = questions.filter(
    (q) => answers[q.id] === q.correctAnswer
  ).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
          练习题 ({questions.length}题)
        </h2>
        {submitted && (
          <span className="text-sm font-medium" style={{ color: "var(--color-accent)" }}>
            得分: {correctCount}/{questions.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            index={i}
            question={q}
            selected={answers[q.id] ?? null}
            showResult={submitted}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {!submitted && (
        <div className="pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
          <button
            className={`w-full py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-85 ${
              allAnswered ? "" : "opacity-40 pointer-events-none"
            }`}
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-accent-text)",
            }}
            disabled={!allAnswered}
            onClick={handleSubmit}
          >
            {allAnswered ? "提交答案" : `请完成全部题目 (${Object.keys(answers).length}/${questions.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
