/**
 * Tiny in-memory cache with TTL. Plenty for a single-instance dev/personal app.
 * If you deploy this multi-instance, swap for Redis or KV.
 */
const TTL_MS = 60 * 60 * 1000; // 1h

class TtlCache<V> {
  private store = new Map<string, { value: V; expiresAt: number }>();

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: V): void {
    this.store.set(key, { value, expiresAt: Date.now() + TTL_MS });
  }
}

// One cache per concern so types stay clean.
import type { TavilyResponse } from "./tavily";
import type { ExtractedPrice } from "./extract";

export const searchCache = new TtlCache<TavilyResponse>();
export const extractionCache = new TtlCache<ExtractedPrice[]>();
