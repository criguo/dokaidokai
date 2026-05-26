"use client";

import { useUserStore } from "@/stores/user-store";

export function StatsOverview() {
  const stats = useUserStore((s) => s.stats);

  const accuracy =
    stats.totalQuestionsAnswered > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestionsAnswered) * 100)
      : 0;

  const cardStyle = {
    backgroundColor: "var(--color-surface)",
    borderColor: "var(--color-border)",
  } as const;

  const items = [
    { value: stats.totalQuestionsAnswered, label: "做题总数", color: "var(--color-accent)" },
    { value: `${accuracy}%`, label: "正确率", color: "var(--color-success)" },
    { value: stats.currentStreak, label: "连续天数", color: "var(--color-warning)" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border p-4 text-center"
          style={cardStyle}
        >
          <p className="text-2xl font-bold" style={{ color: item.color }}>
            {item.value}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
