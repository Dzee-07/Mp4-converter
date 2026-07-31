/**
 * Small in-memory TTL cache keyed by string. Good enough for a single
 * instance; swap the internals for Redis (ioredis) if you scale to
 * multiple processes/instances — the get/set/has interface stays the same.
 */
export class TtlCache {
  constructor({ ttlMs = 5 * 60 * 1000, maxEntries = 500 } = {}) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.store = new Map();
  }

  _isExpired(entry) {
    return Date.now() - entry.setAt > this.ttlMs;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (this._isExpired(entry)) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value) {
    if (this.store.size >= this.maxEntries) {
      // evict oldest entry (simple FIFO eviction)
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
    }
    this.store.set(key, { value, setAt: Date.now() });
  }

  has(key) {
    return this.get(key) !== undefined;
  }
}
