"use client";

import { useState, useMemo } from "react";
import { useMistakeStore } from "@/stores/mistake-store";
import type { MistakeRecord } from "@/types";
import { QUESTION_TYPE_LABELS } from "@/types";
import { formatDate } from "@/lib/utils";
import { AIAnalysisDialog } from "@/components/mistakes/ai-analysis-dialog";

export function MistakeList() {
  const mistakes = useMistakeStore((s) => s.mistakes);
  const removeMistake = useMistakeStore((s) => s.removeMistake);
  const [selected, setSelected] = useState<MistakeRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, MistakeRecord[]>();
    for (const m of mistakes) {
      const key = m.articleId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries());
  }, [mistakes]);

  if (mistakes.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">📝</p>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          还没有错题记录
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          完成练习后，答错的题目会自动出现在这里
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {grouped.map(([articleId, items]) => (
          <div
            key={articleId}
            className="rounded-xl border overflow-hidden"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="px-4 py-3"
              style={{
                backgroundColor: "var(--color-bg)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                {items[0].articleTitle}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {items.length} 道错题 · {formatDate(items[0].answeredAt)}
              </p>
            </div>

            <div>
              {items.map((m, i) => (
                <div
                  key={m.id}
                  className="px-4 py-3 flex items-center justify-between"
                  style={{
                    borderTop: i > 0 ? "1px solid rgba(128,128,128,0.12)" : "none",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{
                        backgroundColor: "var(--color-border)",
                        color: "var(--color-text-muted)",
                      }}>
                        {QUESTION_TYPE_LABELS[m.question.type]}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-error)" }}>
                        你的答案: {m.userAnswer}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-success)" }}>
                        正确: {m.question.correctAnswer}
                      </span>
                    </div>
                    <p className="text-sm truncate" style={{ color: "var(--color-text)" }}>
                      {m.question.stem}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-3">
                    <button
                      className="text-xs px-2 py-1 rounded hover:underline"
                      style={{ color: "var(--color-accent)" }}
                      onClick={() => { setSelected(m); setDialogOpen(true); }}
                    >
                      AI 解析
                    </button>
                    <button
                      className="text-xs px-2 py-1 rounded hover:opacity-70"
                      style={{ color: "var(--color-text-muted)" }}
                      onClick={() => removeMistake(m.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <AIAnalysisDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          mistake={selected}
        />
      )}
    </>
  );
}
