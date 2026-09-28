/**
 * In-memory TTL cache with LRU eviction, namespace partitioning, and single-flight deduplication.
 *
 * Free tiers are metered in requests per day, so a repeated request is the most
 * expensive avoidable mistake. Protections:
 *   - identical inputs reuse a result instead of spending a provider request
 *   - concurrent identical inputs share one in-flight call
 *   - namespace partitioning prevents high-frequency weather calls from evicting crop diagnoses
 *   - true LRU eviction keeps active cache keys alive
 */

import { createHash } from 'node:crypto';

const DEFAULT_TTL_MS = 30 * 60 * 1000;
const MAX_ENTRIES_PER_NAMESPACE = 100;

interface Entry<T> {
  value: T;
  expiresAt: number;
}

// Partitioned stores: namespace -> Map<key, Entry>
const namespaces = new Map<string, Map<string, Entry<unknown>>>();
const inFlight = new Map<string, Promise<unknown>>();

function getNamespaceStore(namespace: string): Map<string, Entry<unknown>> {
  let store = namespaces.get(namespace);
  if (!store) {
    store = new Map<string, Entry<unknown>>();
    namespaces.set(namespace, store);
  }
  return store;
}

/** Stable key from arbitrary inputs. Images are hashed with SHA-256, never stored. */
export function cacheKey(namespace: string, parts: Array<string | number | undefined>): string {
  const hash = createHash('sha256');
  hash.update(namespace);
  for (const part of parts) {
    hash.update('\u0000');
    hash.update(String(part ?? ''));
  }
  // Full 64-hex digest prevents hash collisions
  return `${namespace}:${hash.digest('hex')}`;
}

function parseNamespace(key: string): string {
  const colon = key.indexOf(':');
  return colon === -1 ? 'default' : key.slice(0, colon);
}

function evictIfNeeded(store: Map<string, Entry<unknown>>): void {
  if (store.size <= MAX_ENTRIES_PER_NAMESPACE) return;
  // Map preserves insertion/re-insertion order. Oldest accessed key is first.
  const oldest = store.keys().next();
  if (!oldest.done) store.delete(oldest.value);
}

/**
 * Returns a cached value, joins an identical in-flight call, or runs `work`.
 * Failures are never cached: a transient provider outage must not poison the key.
 */
export async function cached<T>(
  key: string,
  work: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<{ value: T; hit: boolean }> {
  const ns = parseNamespace(key);
  const store = getNamespaceStore(ns);

  const existing = store.get(key);
  if (existing && existing.expiresAt > Date.now()) {
    // LRU touch: re-insert to move to the end of the Map
    store.delete(key);
    store.set(key, existing);
    return { value: existing.value as T, hit: true };
  }
  if (existing) store.delete(key);

  const pending = inFlight.get(key);
  if (pending) return { value: (await pending) as T, hit: true };

  const promise = work();
  inFlight.set(key, promise);

  try {
    const value = await promise;
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
    evictIfNeeded(store);
    return { value, hit: false };
  } finally {
    inFlight.delete(key);
  }
}

/** Test/rehearsal helper: clears all partitions and in-flight operations. */
export function clearCache(): void {
  namespaces.clear();
  inFlight.clear();
}
