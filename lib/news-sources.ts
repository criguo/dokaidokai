import type { NewsItem, Language } from "@/types";

// RSS feed URLs for Japanese and Korean news sources
const RSS_SOURCES: Record<Language, string[]> = {
  ja: [
    "https://www3.nhk.or.jp/rss/news/cat0.xml",
    "https://rss.asahi.com/rss/asahi/newsheadlines.rdf",
  ],
  ko: [
    "https://www.yonhapnewstv.co.kr/browse/feed/",
  ],
  en: [],
  de: [],
  fr: [],
};

interface RSSItem {
  title?: string;
  contentSnippet?: string;
  link?: string;
  pubDate?: string;
}

/**
 * Fetch and parse news from RSS feeds.
 * Falls back to mock data when RSS is unreachable (CORS, network issues).
 */
export async function fetchNews(
  language: Language,
): Promise<NewsItem[]> {
  const sources = RSS_SOURCES[language];

  try {
    const { default: Parser } = await import("rss-parser");
    const parser = new Parser();

    const allItems: NewsItem[] = [];

    for (const url of sources) {
      try {
        const feed = await parser.parseURL(url);
        const sourceName = feed.title ?? url;

        const items: NewsItem[] = (feed.items ?? [])
          .filter((item: RSSItem) => (item.contentSnippet ?? item.title ?? "").length > 80)
          .slice(0, 3)
          .map((item: RSSItem) => ({
            title: item.title ?? "無題",
            content:
              item.contentSnippet?.replace(/\s+/g, " ").trim() ??
              item.title ??
              "",
            source: sourceName,
            sourceUrl: item.link,
            publishedAt: item.pubDate
              ? new Date(item.pubDate).toISOString()
              : new Date().toISOString(),
            language,
          }));

        allItems.push(...items);
      } catch {
        // individual feed failed, try next one
        continue;
      }
    }

    if (allItems.length > 0) return allItems;
  } catch {
    // rss-parser import or parse failure
  }

  // Fallback to mock data
  if (language === "ja") {
    return (await import("@/data/mock/ja-news")).jaMockNews as NewsItem[];
  }
  if (language === "ko") {
    return (await import("@/data/mock/ko-news")).koMockNews as NewsItem[];
  }
  return [];
}
