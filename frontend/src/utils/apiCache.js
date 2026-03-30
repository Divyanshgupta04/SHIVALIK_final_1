/**
 * apiCache.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight in-memory cache for axios GET requests.
 *
 * Features:
 *  • TTL-based expiry (default 5 minutes)
 *  • Request deduplication — concurrent callers for the same URL share one
 *    in-flight promise instead of firing N parallel requests.
 *  • Zero dependencies beyond axios.
 *
 * Usage:
 *   import { cachedGet } from '../utils/apiCache';
 *   const data = await cachedGet(axios, '/api/categories');
 */

const cache = new Map(); // url → { data, expiresAt }
const inFlight = new Map(); // url → Promise<data>

/**
 * @param {import('axios').AxiosInstance} axiosInstance
 * @param {string} url  Full URL to GET
 * @param {object} [options]
 * @param {number} [options.ttlMs=300_000]  Cache TTL in milliseconds (default 5 min)
 * @param {object} [options.params]         Axios params (appended to URL for cache key)
 * @returns {Promise<any>}  Resolved response data
 */
export async function cachedGet(axiosInstance, url, options = {}) {
  const { ttlMs = 5 * 60 * 1000, params } = options;

  // Build a deterministic cache key that includes query params
  const key = params ? `${url}?${new URLSearchParams(params).toString()}` : url;

  const now = Date.now();
  const cached = cache.get(key);

  // Return cached data if still fresh
  if (cached && now < cached.expiresAt) {
    return cached.data;
  }

  // If a request for this key is already in flight, return the same promise
  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  // Fire the request and track it
  const promise = axiosInstance
    .get(url, params ? { params } : undefined)
    .then((res) => {
      cache.set(key, { data: res.data, expiresAt: now + ttlMs });
      inFlight.delete(key);
      return res.data;
    })
    .catch((err) => {
      inFlight.delete(key); // don't cache errors
      throw err;
    });

  inFlight.set(key, promise);
  return promise;
}

/**
 * Manually invalidate a cached URL (e.g. after a write operation).
 * @param {string} url
 */
export function invalidateCache(url) {
  // Delete all keys that start with this url
  for (const key of cache.keys()) {
    if (key === url || key.startsWith(url + '?')) {
      cache.delete(key);
    }
  }
}

/**
 * Clear the entire cache (e.g. on logout).
 */
export function clearCache() {
  cache.clear();
  inFlight.clear();
}
