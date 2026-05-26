"use client";

import { useCallback } from "react";
import type { Article, Highlight, Question, UserAnswer } from "@/types";
import { QUESTION_TYPE_LABELS } from "@/types";

interface ExportButtonProps {
  article: Article;
  highlights: Highlight[];
  questions: Question[];
  answers: UserAnswer[];
  score: number;
}

export function ExportButton({
  article,
  highlights,
  questions,
  answers,
  score,
}: ExportButtonProps) {
  const handlePrint = useCallback(() => {
    const answerMap = new Map(answers.map((a) => [a.questionId, a]));

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${article.title} - 阅读笔记</title>
<style>
  body { font-family: -apple-system, 'Noto Sans SC', 'PingFang SC', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #333; line-height: 1.8; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .meta { font-size: 12px; color: #999; margin-bottom: 24px; }
  h2 { font-size: 16px; margin-top: 28px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
  .body { font-size: 14px; margin-bottom: 16px; white-space: pre-wrap; }
  .note { background: #f5f3ff; padding: 8px 12px; margin-bottom: 6px; border-radius: 6px; font-size: 12px; color: #7c3aed; }
  .note .hl { font-weight: 600; color: #333; }
  .q { margin-bottom: 14px; padding: 8px 0; }
  .q .stem { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
  .opt { margin-left: 12px; font-size: 12px; margin-bottom: 2px; }
  .opt.correct { color: #16a34a; font-weight: 600; }
  .opt.wrong { color: #dc2626; text-decoration: line-through; }
  .expl { font-size: 11px; color: #666; margin-top: 4px; font-style: italic; }
  .score { margin-top: 24px; padding: 12px; background: #f0f9ff; border-radius: 8px; text-align: center; font-size: 16px; font-weight: 700; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<h1>${article.title}</h1>
<p class="meta">来源: ${article.source} | ${article.difficulty} | ${new Date(article.publishedAt).toLocaleDateString("zh-CN")}</p>

<div class="body">${article.content}</div>

${highlights.filter((h) => h.note).length > 0 ? `<h2>批注笔记</h2>
${highlights.filter((h) => h.note).map((h) => `<div class="note"><span class="hl">「${article.content.slice(h.startOffset, h.endOffset)}」</span><br>批注: ${h.note}</div>`).join("")}` : ""}

<h2>练习题</h2>
${questions.map((q, i) => {
  const ua = answerMap.get(q.id);
  return `<div class="q">
  <p class="stem">Q${i + 1}. [${QUESTION_TYPE_LABELS[q.type] ?? q.type}] ${q.stem}</p>
  ${q.options.map((o) => {
    let cls = "opt";
    if (ua) {
      if (o.label === q.correctAnswer) cls = "opt correct";
      else if (ua.selectedOption === o.label && !ua.isCorrect) cls = "opt wrong";
    }
    return `<p class="${cls}">${o.label}. ${o.text}</p>`;
  }).join("")}
  ${ua && !ua.isCorrect ? `<p class="expl">解析: ${q.explanation}</p>` : ""}
</div>`;
}).join("")}

<div class="score">得分: ${score} / 100 (${answers.filter((a) => a.isCorrect).length}/${questions.length})</div>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    // Short delay to allow rendering before print dialog
    setTimeout(() => w.print(), 300);
  }, [article, highlights, questions, answers, score]);

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-85 border"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        color: "var(--color-text)",
      }}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      导出 PDF
    </button>
  );
}
