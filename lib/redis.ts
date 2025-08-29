interface SimpleRedis {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
}

class MemoryRedis implements SimpleRedis {
  private store = new Map<string, { value: number; expire?: number }>();

  async incr(key: string): Promise<number> {
    const now = Date.now();
    const entry = this.store.get(key);
    if (entry && entry.expire && entry.expire < now) {
      this.store.delete(key);
      return this.incr(key);
    }
    const val = (entry?.value ?? 0) + 1;
    this.store.set(key, { value: val, expire: entry?.expire });
    return val;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return 0;
    entry.expire = Date.now() + seconds * 1000;
    this.store.set(key, entry);
    return 1;
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expire && entry.expire < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return String(entry.value);
    }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }
}

let client: SimpleRedis;

if (process.env.REDIS_URL) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const Redis = require('ioredis');
    client = new Redis(process.env.REDIS_URL);
  } catch {
    console.warn('ioredis not installed; falling back to in-memory store');
    client = new MemoryRedis();
  }
} else {
  client = new MemoryRedis();
}

export const redis = client;
