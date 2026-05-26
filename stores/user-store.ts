import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language, DifficultyLevel, ThemeMode, UserStats, UserPreferences } from "@/types";

interface UserState {
  preferences: UserPreferences;
  stats: UserStats;
  apiKey: string;
  theme: ThemeMode;

  setLanguage: (lang: Language) => void;
  setDifficulty: (diff: DifficultyLevel) => void;
  setApiKey: (key: string) => void;
  setTheme: (theme: ThemeMode) => void;
  recordPractice: (correct: number, total: number) => void;
  clearStats: () => void;
}

const today = () => new Date().toISOString().split("T")[0];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      preferences: { targetLanguage: "en", difficulty: "B1" },
      stats: {
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        currentStreak: 0,
        lastPracticeDate: null,
      },
      apiKey: "sk-aba5c19c1c4846c3b648761bd3422894",
      theme: "system",

      setLanguage: (lang) =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            targetLanguage: lang,
            difficulty:
              lang === "ja" ? "N3" :
              lang === "ko" ? "3" : "B1",
          },
        })),

      setDifficulty: (diff) =>
        set((s) => ({ preferences: { ...s.preferences, difficulty: diff } })),

      setApiKey: (apiKey) => set({ apiKey }),
      setTheme: (theme) => set({ theme }),

      recordPractice: (correct, total) =>
        set((s) => {
          const todayStr = today();
          const lastDate = s.stats.lastPracticeDate;
          let newStreak = s.stats.currentStreak;
          if (lastDate !== todayStr) {
            newStreak = lastDate === yesterday() ? newStreak + 1 : 1;
          }
          return {
            stats: {
              totalQuestionsAnswered: s.stats.totalQuestionsAnswered + total,
              totalCorrect: s.stats.totalCorrect + correct,
              currentStreak: newStreak,
              lastPracticeDate: todayStr,
            },
          };
        }),

      clearStats: () =>
        set({
          stats: {
            totalQuestionsAnswered: 0,
            totalCorrect: 0,
            currentStreak: 0,
            lastPracticeDate: null,
          },
        }),
    }),
    { name: "user-store" }
  )
);

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
