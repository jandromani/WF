export type Activity = {
  id: string;
  type: 'claim' | 'tip' | 'subscribe' | 'unlock' | 'referral';
  amount?: number;
  meta?: string;
  ts: number;
};

let _balance = 1250.5;
let _activity: Activity[] = [];

export async function getBalance() {
  return _balance;
}

export async function getActivity() {
  return _activity.sort((a, b) => b.ts - a.ts);
}

export async function recordActivity(a: Activity) {
  _activity = [{ ...a, id: crypto.randomUUID(), ts: Date.now() }, ..._activity];
}

export async function claimDaily(amount = 100) {
  _balance += amount;
  await recordActivity({ type: 'claim', amount, ts: Date.now(), id: '' } as Activity);
  return { ok: true, newBalance: _balance, amount };
}

export async function buyWFANS(amount: number) {
  await recordActivity({ type: 'referral', amount, meta: 'buy_wfans', ts: Date.now(), id: '' } as Activity);
  return { ok: true, amount };
}
