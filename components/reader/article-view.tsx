"use client";

import { useHighlight } from "@/hooks/use-highlight";
import { HighlightLayer } from "./highlight-layer";
import { getGenreLabel } from "@/types";
import type { Language, DifficultyLevel, Genre } from "@/types";
import { difficultyLabel } from "@/lib/utils";

const LANG_NAMES: Record<string, string> = {
  ja: "日本語", ko: "한국어", en: "English", de: "Deutsch", fr: "Français",
};

interface ArticleViewProps {
  articleId: string;
  title: string;
  content: string;
  source: string;
  language: Language;
  difficulty: DifficultyLevel;
  genre: Genre;
  fontSize?: string;
  hideSource?: boolean;
}

export function ArticleView({
  articleId,
  title,
  content,
  source,
  language,
  difficulty,
  genre,
  fontSize = "text-base",
  hideSource = false,
}: ArticleViewProps) {
  const { containerRef, captureSelection } = useHighlight(articleId);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-1" style={{ color: "var(--color-text)" }}>
          {title}
        </h1>
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="text-xs font-medium px-2 py-0.5 rounded" style={{
            backgroundColor: "rgba(196,136,124,0.12)",
            color: "var(--color-error)",
          }}>
            {LANG_NAMES[language] ?? language}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded" style={{
            backgroundColor: "rgba(139,157,131,0.12)",
            color: "var(--color-accent)",
          }}>
            {difficultyLabel(difficulty)}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded" style={{
            backgroundColor: "rgba(196,168,130,0.15)",
            color: "#b8956a",
          }}>
            {getGenreLabel(genre, language)}
          </span>
        </div>
        {!hideSource && (
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            来源：{source}
          </p>
        )}
      </div>

      <div className="rounded-xl border p-6" style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}>
        <HighlightLayer
          articleId={articleId}
          text={content}
          containerRef={containerRef}
          onCaptureHighlight={captureSelection}
          fontSize={fontSize}
        />
      </div>

      <p className="text-xs mt-2 text-center" style={{ color: "var(--color-text-muted)" }}>
        选中文字即可高亮，点击高亮区域可添加批注
      </p>
    </div>
  );
}
