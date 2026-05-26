import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MistakeRecord, AIAnalysis } from "@/types";

interface MistakeState {
  mistakes: MistakeRecord[];

  addMistake: (record: MistakeRecord) => void;
  removeMistake: (id: string) => void;
  setAnalysis: (mistakeId: string, analysis: AIAnalysis) => void;
  getByArticle: (articleId: string) => MistakeRecord[];
  clearAll: () => void;
}

export const useMistakeStore = create<MistakeState>()(
  persist(
    (set, get) => ({
      mistakes: [],

      addMistake: (record) =>
        set((s) => {
          // deduplicate: same question only stored once
          const exists = s.mistakes.find(
            (m) => m.question.id === record.question.id
          );
          if (exists) return s;
          return { mistakes: [...s.mistakes, record] };
        }),

      removeMistake: (id) =>
        set((s) => ({
          mistakes: s.mistakes.filter((m) => m.id !== id),
        })),

      setAnalysis: (mistakeId, analysis) =>
        set((s) => ({
          mistakes: s.mistakes.map((m) =>
            m.id === mistakeId ? { ...m, aiAnalysis: analysis } : m
          ),
        })),

      getByArticle: (articleId) =>
        get().mistakes.filter((m) => m.articleId === articleId),

      clearAll: () => set({ mistakes: [] }),
    }),
    { name: "mistake-store" }
  )
);
