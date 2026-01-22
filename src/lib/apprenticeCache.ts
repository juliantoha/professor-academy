import { supabase } from './supabase';

interface CachedApprentice {
  id: string;
  name: string;
  email: string;
  dashboardToken: string;
  skillsChecklist?: Record<string, boolean>;
}

interface CacheEntry {
  data: CachedApprentice;
  timestamp: number;
}

// Simple in-memory cache with 5-minute TTL
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Prefetch queue to avoid duplicate requests
const prefetchingTokens = new Set<string>();

export const apprenticeCache = {
  // Get from cache if valid
  get(dashboardToken: string): CachedApprentice | null {
    const entry = cache.get(dashboardToken);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > CACHE_TTL;
    if (isExpired) {
      cache.delete(dashboardToken);
      return null;
    }

    return entry.data;
  },

  // Set cache entry
  set(dashboardToken: string, data: CachedApprentice): void {
    cache.set(dashboardToken, {
      data,
      timestamp: Date.now()
    });
  },

  // Prefetch apprentice data (called on hover)
  async prefetch(dashboardToken: string): Promise<void> {
    // Skip if already cached or currently prefetching
    if (cache.has(dashboardToken) || prefetchingTokens.has(dashboardToken)) {
      return;
    }

    prefetchingTokens.add(dashboardToken);

    try {
      const { data, error } = await supabase
        .from('apprentices')
        .select('id, name, email, dashboardToken, skillsChecklist')
        .eq('dashboardToken', dashboardToken)
        .single();

      if (!error && data) {
        this.set(dashboardToken, data);
      }
    } catch (err) {
      // Silent fail for prefetch
      console.debug('[Cache] Prefetch failed:', err);
    } finally {
      prefetchingTokens.delete(dashboardToken);
    }
  },

  // Clear cache (useful for testing or forced refresh)
  clear(): void {
    cache.clear();
  },

  // Update cache entry (e.g., after saving skills)
  update(dashboardToken: string, updates: Partial<CachedApprentice>): void {
    const entry = cache.get(dashboardToken);
    if (entry) {
      cache.set(dashboardToken, {
        data: { ...entry.data, ...updates },
        timestamp: Date.now()
      });
    }
  }
};
