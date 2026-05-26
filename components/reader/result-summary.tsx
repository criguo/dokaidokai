"use client";

import type { PracticeResult } from "@/types";

interface ResultSummaryProps {
  result: PracticeResult;
  onBack: () => void;
}

export function ResultSummary({ result, onBack }: ResultSummaryProps) {
  const percentage = result.score;
  const isPass = percentage >= 60;
  const wrongCount = result.totalCount - result.correctCount;

  const circleColor = isPass ? "var(--color-success)" : "var(--color-error)";

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Score circle */}
      <div
        className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
        style={{ border: `4px solid ${circleColor}`, color: circleColor }}
      >
        <div className="text-center">
          <span className="text-3xl font-bold">{percentage}</span>
          <span className="text-lg">分</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-text)" }}>
        {isPass ? "做得好！" : "继续加油！"}
      </h3>

      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        {[
          { value: result.totalCount, label: "总题数", color: "var(--color-text)" },
          { value: result.correctCount, label: "正确", color: "var(--color-success)" },
          { value: wrongCount, label: "错误", color: "var(--color-error)" },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-2xl font-bold" style={{ color: item.color }}>
              {item.value}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <button
        className="px-6 py-2 rounded-lg font-medium text-sm transition-opacity hover:opacity-85"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "var(--color-accent-text)",
        }}
        onClick={onBack}
      >
        返回首页
      </button>
    </div>
  );
}
