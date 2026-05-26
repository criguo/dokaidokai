// ============================================================
// Domain types for JLPT / TOPIK Reading Trainer
// ============================================================

export type Language = "ja" | "ko" | "en" | "de" | "fr";

export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";
export type TopikLevel = "1" | "2" | "3" | "4" | "5" | "6";
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export const JLPT_LEVELS: JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"];
export const TOPIK_LEVELS: TopikLevel[] = ["1", "2", "3", "4", "5", "6"];
export const CEFR_LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];

export type DifficultyLevel = JlptLevel | TopikLevel | CefrLevel;

export type ThemeMode = "light" | "dark" | "system";

// ---- Genre / 题材板块 ----

export type JaGenre = "情報検索" | "説明文" | "エッセイ" | "評論・論説" | "小説" | "比較読解";
export type KoGenre = "설명문" | "논술/칼럼" | "뉴스/사설" | "문학/수필" | "학술문" | "도표정보";
export type EuGenre = "news" | "opinion" | "literature" | "academic" | "practical" | "comparative";
export type Genre = JaGenre | KoGenre | EuGenre;

const JA_GENRE_LABELS: Record<JaGenre, string> = {
  "情報検索": "情報検索",
  "説明文": "説明文",
  "エッセイ": "エッセイ",
  "評論・論説": "評論・論説",
  "小説": "小説",
  "比較読解": "比較読解",
};

const KO_GENRE_LABELS: Record<KoGenre, string> = {
  "설명문": "설명문",
  "논술/칼럼": "논술/칼럼",
  "뉴스/사설": "뉴스/사설",
  "문학/수필": "문학/수필",
  "학술문": "학술문",
  "도표정보": "도표정보",
};

const EU_GENRE_LABELS: Record<Language, Record<EuGenre, string>> = {
  en: { news: "News", opinion: "Opinion", literature: "Literature", academic: "Academic", practical: "Practical", comparative: "Comparative" },
  de: { news: "Nachrichten", opinion: "Meinung", literature: "Literatur", academic: "Wissenschaft", practical: "Praktisch", comparative: "Vergleich" },
  fr: { news: "Actualités", opinion: "Opinion", literature: "Littérature", academic: "Académique", practical: "Pratique", comparative: "Comparatif" },
  ja: { news: "News", opinion: "Opinion", literature: "Literature", academic: "Academic", practical: "Practical", comparative: "Comparative" },
  ko: { news: "News", opinion: "Opinion", literature: "Literature", academic: "Academic", practical: "Practical", comparative: "Comparative" },
};

export function getGenreLabel(genre: Genre, language?: Language): string {
  if (language === "ja") return JA_GENRE_LABELS[genre as JaGenre] ?? genre;
  if (language === "ko") return KO_GENRE_LABELS[genre as KoGenre] ?? genre;
  if (language === "de" || language === "fr" || language === "en") {
    return EU_GENRE_LABELS[language][genre as EuGenre] ?? genre;
  }
  // fallback for unknown language
  const allLabels: Record<string, string> = { ...JA_GENRE_LABELS, ...KO_GENRE_LABELS, ...EU_GENRE_LABELS.en };
  return allLabels[genre] ?? genre;
}

export const JA_GENRES: { value: JaGenre; label: string; desc: string }[] = [
  { value: "情報検索", label: "情報検索", desc: "广告、宣传册、活动通知、招募启事、招聘/租房信息、时刻表、菜单等" },
  { value: "説明文", label: "説明文", desc: "日常生活话题的解说、指示文、科普小知识、社会现象短评（N3起）" },
  { value: "エッセイ", label: "エッセイ", desc: "个人感悟、生活体验、文化观察类短篇随笔" },
  { value: "評論・論説", label: "評論・論説", desc: "涉及教育、心理、传媒、社会文化等议题的观点论述（N1典型）" },
  { value: "小説", label: "小説", desc: "现代小说片段，考查人物心情、情节理解（N2/N1中长篇）" },
  { value: "比較読解", label: "比較読解", desc: "两篇短素材（如读者来信+回信、AB观点对比），要求比较整合信息" },
];

export const KO_GENRES: { value: KoGenre; label: string; desc: string }[] = [
  { value: "설명문", label: "설명문", desc: "科普常识、传统文化、生活习惯、社会现象解说" },
  { value: "논술/칼럼", label: "논술/칼럼", desc: "教育、家庭、职场伦理、环境问题、价值观讨论" },
  { value: "뉴스/사설", label: "뉴스/사설", desc: "政治、经济、社会事件的简讯或摘要（高级多见）" },
  { value: "문학/수필", label: "문학/수필", desc: "短篇小说片段、散文、诗歌赏析，问作者心境或主旨" },
  { value: "학술문", label: "학술문", desc: "人文社科或理工科论文摘要、研究报告简介（5~6级）" },
  { value: "도표정보", label: "도표정보", desc: "图表、统计资料、海报搭配简短说明，要求提取数据信息" },
];

const EU_GENRE_DESCS: Record<Language, Record<EuGenre, string>> = {
  en: {
    news: "News reports, current events, social affairs",
    opinion: "Argumentative essays, op-eds on education, tech, and culture",
    literature: "Short fiction excerpts, prose, personal essays",
    academic: "Humanities or science abstracts, research summaries",
    practical: "Advertisements, manuals, notices, guides, emails",
    comparative: "Two short texts for comparison and synthesis",
  },
  de: {
    news: "Nachrichten, aktuelle Ereignisse, Gesellschaft",
    opinion: "Argumentative Essays, Kolumnen zu Bildung, Technik, Kultur",
    literature: "Kurzgeschichten, Prosa, Essays",
    academic: "Geistes- oder naturwissenschaftliche Abstracts",
    practical: "Anzeigen, Handbücher, Mitteilungen, Leitfäden, E-Mails",
    comparative: "Zwei kurze Texte zum Vergleich und zur Synthese",
  },
  fr: {
    news: "Actualités, événements, faits de société",
    opinion: "Essais argumentatifs, chroniques sur l'éducation, la technologie, la culture",
    literature: "Extraits de fiction courte, prose, essais personnels",
    academic: "Résumés en sciences humaines ou naturelles",
    practical: "Annonces, manuels, avis, guides, courriels",
    comparative: "Deux textes courts à comparer et synthétiser",
  },
  ja: {
    news: "News reports, current events, social affairs",
    opinion: "Argumentative essays, op-eds on education, tech, and culture",
    literature: "Short fiction excerpts, prose, personal essays",
    academic: "Humanities or science abstracts, research summaries",
    practical: "Advertisements, manuals, notices, guides, emails",
    comparative: "Two short texts for comparison and synthesis",
  },
  ko: {
    news: "News reports, current events, social affairs",
    opinion: "Argumentative essays, op-eds on education, tech, and culture",
    literature: "Short fiction excerpts, prose, personal essays",
    academic: "Humanities or science abstracts, research summaries",
    practical: "Advertisements, manuals, notices, guides, emails",
    comparative: "Two short texts for comparison and synthesis",
  },
};

export function getEuGenres(language: Language): { value: EuGenre; label: string; desc: string }[] {
  const labels = EU_GENRE_LABELS[language] ?? EU_GENRE_LABELS.en;
  const descs = EU_GENRE_DESCS[language] ?? EU_GENRE_DESCS.en;
  return (Object.keys(labels) as EuGenre[]).map((key) => ({
    value: key,
    label: labels[key],
    desc: descs[key],
  }));
}

// ---- Article ----

export interface VocabItem {
  word: string;
  reading?: string;
  meaning: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  language: Language;
  difficulty: DifficultyLevel;
  genre: Genre;
  source: string;
  sourceUrl?: string;
  publishedAt: string;
  createdAt: string;
  translation?: string;
  vocabulary?: VocabItem[];
}

export interface ArticleWithMeta extends Article {
  questions: Question[];
  questionCount: number;
}

// ---- Highlight & Annotation ----

export interface Highlight {
  id: string;
  articleId: string;
  startOffset: number;
  endOffset: number;
  color: HighlightColor;
  note: string;
  createdAt: string;
}

export type HighlightColor = "underline";

export const HIGHLIGHT_COLORS: { value: HighlightColor; label: string; bg: string; darkBg: string }[] = [
  { value: "underline", label: "波浪线", bg: "", darkBg: "" },
];

// ---- Questions ----

export type QuestionType =
  | "main-idea"
  | "detail"
  | "inference"
  | "vocabulary"
  | "grammar";

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  "main-idea": "主旨题",
  "detail": "细节题",
  "inference": "推理题",
  "vocabulary": "词汇题",
  "grammar": "语法题",
};

export interface QuestionOption {
  label: string;
  text: string;
}

export interface Question {
  id: string;
  articleId: string;
  type: QuestionType;
  stem: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
}

// ---- User answers & results ----

export interface UserAnswer {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  answeredAt: string;
  aiAnalysis?: AIAnalysis;
}

export interface PracticeResult {
  id: string;
  articleId: string;
  answers: UserAnswer[];
  score: number;
  correctCount: number;
  totalCount: number;
  completedAt: string;
}

// ---- Mistakes ----

export interface MistakeRecord {
  id: string;
  articleId: string;
  articleTitle: string;
  question: Question;
  userAnswer: string;
  answeredAt: string;
  aiAnalysis?: AIAnalysis;
}

export interface AIAnalysis {
  reason: string;
  grammarVocab: string;
  correctThinking: string;
  analyzedAt: string;
}

// ---- User stats & preferences ----

export interface UserStats {
  totalQuestionsAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  lastPracticeDate: string | null;
}

export interface UserPreferences {
  targetLanguage: Language;
  difficulty: DifficultyLevel;
}

// ---- News source ----

export interface NewsItem {
  title: string;
  content: string;
  source: string;
  sourceUrl?: string;
  publishedAt: string;
  language: Language;
}
