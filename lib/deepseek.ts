import OpenAI from "openai";
import type { Language, DifficultyLevel, Genre, Question, VocabItem } from "@/types";
import {
  REWRITE_SYSTEM_PROMPT,
  QUESTIONS_SYSTEM_PROMPT,
  ANALYSIS_SYSTEM_PROMPT,
  GENERATE_ARTICLE_SYSTEM_PROMPT,
} from "./prompts";

type ChatModel = "deepseek-chat";
const MODEL: ChatModel = "deepseek-chat";

function getClient(apiKey?: string) {
  const key = apiKey || process.env.DEEPSEEK_API_KEY || "";
  return new OpenAI({ apiKey: key, baseURL: "https://api.deepseek.com" });
}

/** Generate an original article at a specific difficulty level and genre */
export async function generateArticle(
  language: Language,
  difficulty: DifficultyLevel,
  genre: Genre,
  apiKey?: string
): Promise<{ title: string; content: string; translation: string; vocabulary: VocabItem[] }> {
  const LANG_NAMES: Record<string, string> = {
    ja: "日语", ko: "韩语", en: "英语", de: "德语", fr: "法语",
  };
  const langName = LANG_NAMES[language] ?? "英语";

  const levelLabel =
    language === "ja" ? `JLPT ${difficulty}` :
    language === "ko" ? `TOPIK ${difficulty}` :
    `CEFR ${difficulty}`;

  const genreGuides: Record<string, string> = {
    "情報検索": "请撰写一篇实用信息类文章，如广告、宣传册、活动通知、招募启事、招聘/租房信息、时刻表、菜单等，模拟真实信息载体的格式和语体",
    "説明文": "请撰写一篇生活说明文，内容可以是日常生活话题的解说、指示文、科普小知识或社会现象短评",
    "エッセイ": "请撰写一篇随笔散文，表达个人感悟、生活体验或文化观察",
    "評論・論説": "请撰写一篇评论文/社说，针对教育、心理、传媒、社会文化等议题进行观点论述",
    "小説": "请撰写一段现代小说片段，注重人物心情和情节描写",
    "比較読解": "请撰写两篇短素材用于对比阅读（如读者来信+回信、AB观点对比），用【文章A】和【文章B】分隔两篇",
    "설명문": "请撰写一篇说明文，内容可以是科普常识、传统文化、生活习惯或社会现象解说",
    "논술/칼럼": "请撰写一篇议论文/专栏，讨论教育、家庭、职场伦理、环境问题或价值观",
    "뉴스/사설": "请撰写一篇新闻报道或社论摘要，涉及政治、经济或社会事件",
    "문학/수필": "请撰写一段文学或散文节选，可以是短篇小说片段、散文或诗歌赏析",
    "학술문": "请撰写一篇学术/专业短文，为人文社科或理工科论文摘要或研究报告简介风格",
    "도표정보": "请撰写一篇图文信息类短文，包含图表数据描述或海报信息，需有可量化的数据点",
    "news": "请撰写一篇新闻报道或时事文章",
    "opinion": "请撰写一篇观点论述文，针对教育、科技、文化、社会等议题进行议论文写作",
    "literature": "请撰写一段文学节选，可以是短篇小说片段或散文随笔",
    "academic": "请撰写一篇学术短文，为人文社科或自然科学摘要风格",
    "practical": "请撰写一篇实用信息类文章，如广告、说明书、通知、指南、邮件等实用文体",
    "comparative": "请撰写两篇短素材用于对比阅读（观点对比、来信回复等），用【Text A】和【Text B】分隔两篇",
  };

  const genreGuide = genreGuides[genre] || "";

  const userPrompt = `请用${langName}写一篇${levelLabel}难度的阅读文章。

题材要求：${genreGuide}
- 词汇和句式严格匹配${levelLabel}难度标准
- 长度300-700字（比較読解题材两篇合计）
- 适合出阅读理解题
- 提供全文中文翻译和重点词汇语法解析（5-10个重点词汇）
- 输出严格的JSON格式，不要包含markdown代码块标记：
{"title": "文章标题（用${langName}写）", "content": "文章正文（用${langName}写）", "translation": "全文中文翻译", "vocabulary": [{"word": "单词", "reading": "读音（日语用平假名，韩语用韩文）", "meaning": "中文释义"}]}`;

  const client = getClient(apiKey);
  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: GENERATE_ARTICLE_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const raw = res.choices[0]?.message?.content?.trim() ?? "{}";
  try {
    const parsed = JSON.parse(raw);
    return {
      title: parsed.title ?? "生成失败",
      content: parsed.content ?? raw.slice(0, 500),
      translation: parsed.translation ?? "",
      vocabulary: Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [],
    };
  } catch {
    console.error("Failed to parse generated article:", raw);
    return { title: "生成失败", content: raw.slice(0, 500), translation: "", vocabulary: [] };
  }
}

/** Generate 5-8 reading comprehension questions */
export async function generateQuestions(
  articleText: string,
  language: Language,
  difficulty: DifficultyLevel,
  apiKey?: string
): Promise<Question[]> {
  const LANG_NAMES_Q: Record<string, string> = {
    ja: "日语", ko: "韩语", en: "英语", de: "德语", fr: "法语",
  };
  const langName = LANG_NAMES_Q[language] ?? "英语";
  const levelLabel =
    language === "ja" ? `JLPT ${difficulty}` :
    language === "ko" ? `TOPIK ${difficulty}` :
    `CEFR ${difficulty}`;

  const userPrompt = `请根据以下${langName}${levelLabel}难度的阅读文章，生成5-8道阅读理解选择题。

要求：
- 题型分布：主旨题、细节题、推理题、词汇题、语法题各至少1题
- 每题4个选项（A/B/C/D），只有1个正确答案
- 题目难度严格匹配${levelLabel}
- 输出严格的JSON格式，不要包含markdown代码块标记

输出格式（包装在对象中）：
{"questions": [
  {
    "type": "main-idea|detail|inference|vocabulary|grammar",
    "stem": "题目文字",
    "options": [
      {"label": "A", "text": "选项A"},
      {"label": "B", "text": "选项B"},
      {"label": "C", "text": "选项C"},
      {"label": "D", "text": "选项D"}
    ],
    "correctAnswer": "A",
    "explanation": "答案解释"
  }
]}

文章：
${articleText}`;

  const client = getClient(apiKey);
  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: QUESTIONS_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const raw = res.choices[0]?.message?.content?.trim() ?? "{}";
  try {
    const json = JSON.parse(raw);
    const questions: Question[] = Array.isArray(json)
      ? json
      : json.questions ?? json.data ?? [];
    return questions.map((q, i) => ({
      ...q,
      id: `q-${Date.now()}-${i}`,
      articleId: "",
    }));
  } catch {
    console.error("Failed to parse questions JSON:", raw);
    return [];
  }
}

/** Analyze a wrong answer */
export async function analyzeMistake(
  question: Question,
  userAnswer: string,
  articleExcerpt: string,
  language: Language,
  apiKey?: string
): Promise<{ reason: string; grammarVocab: string; correctThinking: string }> {
  const LANG_NAMES_A: Record<string, string> = {
    ja: "日语", ko: "韩语", en: "英语", de: "德语", fr: "法语",
  };
  const langName = LANG_NAMES_A[language] ?? "英语";
  const prompt = `请分析以下${langName}阅读错题：

【文章片段】
${articleExcerpt.slice(0, 800)}

【题目】
${question.stem}

【选项】
${question.options.map((o) => `${o.label}. ${o.text}`).join("\n")}

【正确答案】${question.correctAnswer}
【用户答案】${userAnswer}

请分析并以JSON格式输出：
{"reason": "错误原因分析...", "grammarVocab": "语法/词汇讲解...", "correctThinking": "正确思路说明..."}`;

  const client = getClient(apiKey);
  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });

  const raw = res.choices[0]?.message?.content?.trim() ?? "{}";
  try {
    return JSON.parse(raw);
  } catch {
    return {
      reason: "分析暂时不可用",
      grammarVocab: "分析暂时不可用",
      correctThinking: "分析暂时不可用",
    };
  }
}
