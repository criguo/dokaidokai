import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ArticleWithMeta, Highlight, PracticeResult, Question } from "@/types";

interface ArticleState {
  articles: ArticleWithMeta[];
  highlights: Record<string, Highlight[]>;
  results: Record<string, PracticeResult>;

  setArticles: (articles: ArticleWithMeta[]) => void;
  removeArticle: (articleId: string) => void;
  clearArticles: () => void;
  updateArticleQuestions: (articleId: string, questions: Question[]) => void;

  addHighlight: (articleId: string, highlight: Highlight) => void;
  removeHighlight: (articleId: string, highlightId: string) => void;
  updateAnnotation: (articleId: string, highlightId: string, note: string) => void;
  getHighlights: (articleId: string) => Highlight[];

  saveResult: (result: PracticeResult) => void;
  getResult: (articleId: string) => PracticeResult | undefined;
  clearResults: () => void;
}

export const useArticleStore = create<ArticleState>()(
  persist(
    (set, get) => ({
      articles: [],
      highlights: {},
      results: {},

      setArticles: (articles) => set({ articles }),

      removeArticle: (articleId) =>
        set((s) => ({
          articles: s.articles.filter((a) => a.id !== articleId),
          highlights: (() => {
            const { [articleId]: _, ...rest } = s.highlights;
            return rest;
          })(),
          results: (() => {
            const { [articleId]: _, ...rest } = s.results;
            return rest;
          })(),
        })),

      clearArticles: () => set({ articles: [], highlights: {}, results: {} }),

      updateArticleQuestions: (articleId, questions) =>
        set((s) => ({
          articles: s.articles.map((a) =>
            a.id === articleId
              ? { ...a, questions, questionCount: questions.length }
              : a
          ),
        })),

      addHighlight: (articleId, highlight) =>
        set((s) => ({
          highlights: {
            ...s.highlights,
            [articleId]: [...(s.highlights[articleId] || []), highlight],
          },
        })),

      removeHighlight: (articleId, highlightId) =>
        set((s) => ({
          highlights: {
            ...s.highlights,
            [articleId]: (s.highlights[articleId] || []).filter(
              (h) => h.id !== highlightId
            ),
          },
        })),

      updateAnnotation: (articleId, highlightId, note) =>
        set((s) => ({
          highlights: {
            ...s.highlights,
            [articleId]: (s.highlights[articleId] || []).map((h) =>
              h.id === highlightId ? { ...h, note } : h
            ),
          },
        })),

      getHighlights: (articleId) => get().highlights[articleId] || [],

      saveResult: (result) =>
        set((s) => ({
          results: { ...s.results, [result.id]: result },
        })),

      getResult: (articleId) => {
        const all = Object.values(get().results);
        return all.find((r) => r.articleId === articleId);
      },

      clearResults: () => set({ results: {} }),
    }),
    { name: "article-store" }
  )
);
