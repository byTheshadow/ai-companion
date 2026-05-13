// localStorage封装

const PREFIX = 'acp_'

export const local = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  },

  set<T>(key: string, value: T): void {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  },

  remove(key: string): void {
    localStorage.removeItem(PREFIX + key)
  },

  keys(): string[] {
    const result: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(PREFIX)) result.push(k.slice(PREFIX.length))
    }
    return result
  },

  clear(): void {
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(PREFIX)) toRemove.push(k)
    }
    toRemove.forEach(k => localStorage.removeItem(k))
  },

  exportAll(): Record<string, unknown> {
    const data: Record<string, unknown> = {}
    this.keys().forEach(k => {
      data[k] = this.get(k, null)
    })
    return data
  },

  importAll(data: Record<string, unknown>): void {
    Object.entries(data).forEach(([k, v]) => {
      this.set(k, v)
    })
  },
}
