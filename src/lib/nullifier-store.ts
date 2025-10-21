import { promises as fs } from 'fs';
import path from 'path';

interface NullifierStore {
  has(hash: string): Promise<boolean>;
  add(hash: string): Promise<void>;
}

const NULLIFIER_SET_KEY = 'worldid:nullifiers';
const FALLBACK_FILE_PATH =
  process.env.NULLIFIER_STORE_FILE ?? path.join(process.cwd(), '.data', 'nullifier-hashes.json');

class FileNullifierStore implements NullifierStore {
  private cache = new Set<string>();
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(private readonly filePath: string) {}

  private async ensureLoaded() {
    if (this.initialized) {
      return;
    }

    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          const contents = await fs.readFile(this.filePath, 'utf8');
          const parsed = JSON.parse(contents) as string[];
          parsed.forEach((hash) => this.cache.add(hash));
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
          }

          // Create the directory on first write if it does not exist yet.
          await fs.mkdir(path.dirname(this.filePath), { recursive: true });
          await fs.writeFile(this.filePath, JSON.stringify([]), 'utf8');
        }
        this.initialized = true;
      })();
    }

    await this.initPromise;
  }

  private async persist() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(Array.from(this.cache)), 'utf8');
  }

  async has(hash: string): Promise<boolean> {
    await this.ensureLoaded();
    return this.cache.has(hash);
  }

  async add(hash: string): Promise<void> {
    await this.ensureLoaded();
    if (this.cache.has(hash)) {
      return;
    }
    this.cache.add(hash);
    await this.persist();
  }
}

let storeInstance: NullifierStore | null = null;
let storeInitialization: Promise<NullifierStore> | null = null;

const createStore = async (): Promise<NullifierStore> => {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({ url: redisUrl, token: redisToken });
    return {
      async has(hash: string) {
        const exists = await redis.sismember(NULLIFIER_SET_KEY, hash);
        return exists === 1 || exists === true;
      },
      async add(hash: string) {
        await redis.sadd(NULLIFIER_SET_KEY, hash);
      },
    } satisfies NullifierStore;
  }

  return new FileNullifierStore(FALLBACK_FILE_PATH);
};

const getStore = async (): Promise<NullifierStore> => {
  if (storeInstance) {
    return storeInstance;
  }
  if (!storeInitialization) {
    storeInitialization = createStore().then((store) => {
      storeInstance = store;
      return store;
    });
  }
  return storeInitialization;
};

export const nullifierStore = {
  async has(hash: string) {
    const store = await getStore();
    return store.has(hash);
  },
  async add(hash: string) {
    const store = await getStore();
    await store.add(hash);
  },
};
