export type Activity = {
  id: string;
  type: 'claim' | 'tip' | 'subscribe' | 'unlock' | 'referral';
  amount?: number;
  meta?: string;
  ts: number;
};

let activities: Activity[] = [];

export async function getActivity() {
  return activities.sort((a, b) => b.ts - a.ts);
}

export async function recordActivity(a: Activity) {
  const next = { ...a, id: crypto.randomUUID(), ts: Date.now() };
  activities = [next, ...activities].slice(0, 50);
}

export async function claimDaily(amount = 100) {
  await recordActivity({ type: 'claim', amount, ts: Date.now(), id: '' } as Activity);
  return { ok: true, amount };
}

export async function buyWFANS(amount: number) {
  await recordActivity({ type: 'referral', amount, meta: 'buy_wfans', ts: Date.now(), id: '' } as Activity);
  return { ok: true, amount };
}
