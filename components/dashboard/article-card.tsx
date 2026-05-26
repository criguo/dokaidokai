"use client";

import Link from "next/link";
import type { ArticleWithMeta } from "@/types";
import { getGenreLabel } from "@/types";
import { difficultyLabel, truncate } from "@/lib/utils";

interface ArticleCardProps {
  article: ArticleWithMeta;
}

const GENRE_COLOR: Record<string, { bg: string; color: string }> = {
  ja: { bg: "rgba(196,168,130,0.18)", color: "#b8956a" },
  ko: { bg: "rgba(196,168,130,0.18)", color: "#b8956a" },
};

const LANG_BADGE: Record<string, { bg: string; color: string; text: string }> = {
  ja: { bg: "rgba(196,136,124,0.15)", color: "var(--color-error)", text: "日本語" },
  ko: { bg: "rgba(139,157,131,0.15)", color: "var(--color-accent)", text: "한국어" },
  en: { bg: "rgba(100,140,180,0.15)", color: "#6b8cad", text: "English" },
  de: { bg: "rgba(180,140,100,0.15)", color: "#b8946e", text: "Deutsch" },
  fr: { bg: "rgba(160,120,160,0.15)", color: "#9b7ea8", text: "Français" },
};

export function ArticleCard({ article }: ArticleCardProps) {
  const langBadge = LANG_BADGE[article.language] ?? LANG_BADGE.en;

  const genreColors = GENRE_COLOR[article.language] ?? GENRE_COLOR.ja;

  return (
    <Link
      href={`/read/${article.id}`}
      className="block rounded-xl border p-5 transition-all hover:shadow-md"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-semibold line-clamp-2 flex-1" style={{ color: "var(--color-text)" }}>
          {article.title}
        </h3>
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{ backgroundColor: genreColors.bg, color: genreColors.color }}
          >
            {getGenreLabel(article.genre, article.language)}
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{ backgroundColor: langBadge.bg, color: langBadge.color }}
          >
            {langBadge.text}
          </span>
        </div>
      </div>

      <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--color-text-muted)" }}>
        {truncate(article.content, 120)}
      </p>

      <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
        <span>{difficultyLabel(article.difficulty)}</span>
        <span>{article.source}</span>
      </div>
    </Link>
  );
}
