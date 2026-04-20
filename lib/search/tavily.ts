/**
 * Thin wrapper around the Tavily search API.
 * Tavily is purpose-built for LLM agents — fast, returns clean snippets,
 * has a free tier. Docs: https://docs.tavily.com/
 */
import { searchCache } from "./cache";

export type TavilyResult = {
  title: string;
  url: string;
  content: string;
  score?: number;
};

export type TavilyResponse = {
  query: string;
  results: TavilyResult[];
};

export function hasLiveSearchKeys(): boolean {
  return !!(process.env.TAVILY_API_KEY && process.env.ANTHROPIC_API_KEY);
}

export async function tavilySearch(
  query: string,
  opts: { maxResults?: number; topic?: "general" | "news" } = {},
): Promise<TavilyResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not set");
  }
  const cached = searchCache.get(query);
  if (cached) return cached;

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: opts.maxResults ?? 8,
      topic: opts.topic ?? "general",
      search_depth: "basic",
      include_answer: false,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Tavily ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as TavilyResponse;
  searchCache.set(query, json);
  return json;
}
