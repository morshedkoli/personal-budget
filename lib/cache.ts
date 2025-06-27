class SimpleCache {
  private cache = new Map<string, { data: any; expiry: number }>()

  set(key: string, data: any, ttlMs = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item || Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    return item.data
  }

  clear() {
    this.cache.clear()
  }
}

export const cache = new SimpleCache()