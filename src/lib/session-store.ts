import { promises as fs } from 'fs';
import path from 'path';

interface SessionRecord {
  worldNullifier: string;
  walletAddress: string | null;
  createdAt: string;
  expiresAt: string;
}

interface SessionStore {
  save(record: SessionRecord): Promise<void>;
}

const STORAGE_KEY = 'worldid:sessions';
const FALLBACK_FILE_PATH =
  process.env.SESSION_STORE_FILE ?? path.join(process.cwd(), '.data', 'worldid-sessions.json');

class FileSessionStore implements SessionStore {
  private cache = new Map<string, SessionRecord>();
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
          const parsed = JSON.parse(contents) as SessionRecord[];
          parsed.forEach((record) => {
            if (record?.worldNullifier) {
              this.cache.set(record.worldNullifier, record);
            }
          });
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
          }

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
    await fs.writeFile(
      this.filePath,
      JSON.stringify(Array.from(this.cache.values()), null, 2),
      'utf8',
    );
  }

  async save(record: SessionRecord): Promise<void> {
    await this.ensureLoaded();
    this.cache.set(record.worldNullifier, record);
    await this.persist();
  }
}

let storeInstance: SessionStore | null = null;
let storeInitialization: Promise<SessionStore> | null = null;

const createStore = async (): Promise<SessionStore> => {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({ url: redisUrl, token: redisToken });

    return {
      async save(record) {
        await redis.hset(STORAGE_KEY, {
          [record.worldNullifier]: JSON.stringify(record),
        });
      },
    } satisfies SessionStore;
  }

  return new FileSessionStore(FALLBACK_FILE_PATH);
};

const getStore = async (): Promise<SessionStore> => {
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

export const sessionStore = {
  async save(record: SessionRecord) {
    const store = await getStore();
    await store.save(record);
  },
};
