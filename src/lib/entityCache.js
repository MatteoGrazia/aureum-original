/**
 * Simple module-level cache for rarely-changing entity data.
 * Survives re-renders and route changes; cleared on full page refresh.
 */

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function cachedFetch(key, fetchFn) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }
  const data = await fetchFn();
  cache.set(key, { data, time: Date.now() });
  return data;
}

export function invalidateCache(key) {
  cache.delete(key);
}

export function clearCache() {
  cache.clear();
}