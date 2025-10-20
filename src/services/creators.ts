export interface CreatorSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  description: string;
  subscribers: number;
  subscriptionPrice: number;
}

export interface CreatorProfile extends CreatorSummary {
  posts: number;
  categories: string[];
  tippingOptions: number[];
}

const CREATORS_ENDPOINT = '/api/creators';

const fallbackCreators: CreatorProfile[] = [
  {
    id: 'creator-1',
    name: 'World Builder',
    description: 'Arquitecto de experiencias inmersivas en WorldFans.',
    subscribers: 1280,
    subscriptionPrice: 12,
    posts: 42,
    categories: ['VR', 'Música'],
    tippingOptions: [1, 5, 10],
  },
  {
    id: 'creator-2',
    name: 'Pioneer',
    description: 'Contenido premium de lifestyle y creatividad colectiva.',
    subscribers: 820,
    subscriptionPrice: 8,
    posts: 31,
    categories: ['Lifestyle', 'Arte'],
    tippingOptions: [2, 4, 8],
  },
];

async function withFallback<T>(request: () => Promise<T>, fallback: T) {
  try {
    return await request();
  } catch (error) {
    console.warn('Falling back to placeholder data for creators', error);
    return fallback;
  }
}

export async function listCreators(): Promise<CreatorSummary[]> {
  return withFallback(
    async () => {
      const response = await fetch(CREATORS_ENDPOINT, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to load creators');
      }
      const body = (await response.json()) as { creators: CreatorSummary[] };
      return body.creators;
    },
    fallbackCreators,
  );
}

export async function getCreator(id: string): Promise<CreatorProfile | null> {
  return withFallback(
    async () => {
      const response = await fetch(`${CREATORS_ENDPOINT}/${id}`, {
        cache: 'no-store',
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to load creator');
      }

      const body = (await response.json()) as { creator: CreatorProfile };
      return body.creator;
    },
    fallbackCreators.find((creator) => creator.id === id) ?? null,
  );
}

export async function subscribe(
  id: string,
  price: number,
): Promise<{ success: boolean }>{
  return withFallback(
    async () => {
      const response = await fetch(`${CREATORS_ENDPOINT}/${id}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      return (await response.json()) as { success: boolean };
    },
    { success: true },
  );
}

export async function tip(
  id: string,
  amount: number,
): Promise<{ success: boolean }>{
  return withFallback(
    async () => {
      const response = await fetch(`${CREATORS_ENDPOINT}/${id}/tip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error('Failed to send tip');
      }

      return (await response.json()) as { success: boolean };
    },
    { success: true },
  );
}
