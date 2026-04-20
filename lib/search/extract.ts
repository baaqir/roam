/**
 * Use Claude Haiku to extract structured price data from raw search snippets.
 * Haiku is fast + cheap; structured output via JSON-only system prompt.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { TavilyResult } from "./tavily";
import { extractionCache } from "./cache";

export type ExtractedPrice = {
  price: number;
  /** Brief human label, e.g. "JFK→SAN economy round-trip on Delta" */
  label: string;
  source: string;
  url: string;
  /** 1-5 confidence in this number being a real, current quote */
  confidence: number;
};

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (_client) return _client;
  _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

/**
 * Pulls price quotes out of search results.
 *
 * @param what - what we're looking for, e.g. "round-trip flight from JFK to SAN, April 20-23 2026, economy"
 * @param results - raw Tavily search results
 * @returns up to 5 price quotes, sorted by confidence × low-price
 */
export async function extractPrices(
  what: string,
  results: TavilyResult[],
): Promise<ExtractedPrice[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (results.length === 0) return [];

  const cacheKey = `${what}::${results.map((r) => r.url).join("|")}`;
  const cached = extractionCache.get(cacheKey);
  if (cached) return cached;

  const snippets = results
    .map(
      (r, i) =>
        `[${i}] TITLE: ${r.title}\nURL: ${r.url}\nSNIPPET: ${r.content.slice(0, 600)}`,
    )
    .join("\n\n");

  const system = `You extract concrete USD price quotes from web search snippets. ONLY return prices that appear in the snippets, with their source URL. Return JSON ONLY — an array of {price: number, label: string, source: string, url: string, confidence: 1-5}. Confidence 5 = explicit current quote with date; 1 = vague "starts at" advertising. Skip results that don't contain a real price. Max 5 quotes. No prose, no markdown fences.`;

  const user = `What I'm pricing: ${what}\n\nSearch results:\n\n${snippets}\n\nReturn the JSON array now.`;

  const resp = await client().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = resp.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("");

  const parsed = parseJsonArray(text);
  const valid = parsed
    .filter((p) => typeof p.price === "number" && p.price > 0 && p.url)
    .sort((a, b) => b.confidence * 1000 - a.confidence * 1000 + (a.price - b.price))
    .slice(0, 5);

  extractionCache.set(cacheKey, valid);
  return valid;
}

function parseJsonArray(text: string): ExtractedPrice[] {
  // Tolerate accidental ```json fences or leading prose.
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return [];
  try {
    const arr = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(arr)) return [];
    return arr as ExtractedPrice[];
  } catch {
    return [];
  }
}
