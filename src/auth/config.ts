const rawMin = Number.parseInt(process.env.NEXT_PUBLIC_SESSION_MIN_MINUTES ?? '15', 10);
const rawMax = Number.parseInt(process.env.NEXT_PUBLIC_SESSION_MAX_MINUTES ?? '240', 10);

const FALLBACK_MIN = 15;
const FALLBACK_MAX = 240;

const minLimit = Number.isFinite(rawMin) ? Math.max(FALLBACK_MIN, rawMin) : FALLBACK_MIN;
const maxLimit = Number.isFinite(rawMax)
  ? Math.min(FALLBACK_MAX, Math.max(rawMax, minLimit))
  : Math.max(minLimit, FALLBACK_MAX);

export const SESSION_LIMITS = {
  min: minLimit,
  max: maxLimit,
} as const;

export const LOGIN_ACTION_ID = process.env.NEXT_PUBLIC_LOGIN_ACTION_ID ?? 'wfans-login';

export const clampSessionDuration = (minutes: number) =>
  Math.min(SESSION_LIMITS.max, Math.max(SESSION_LIMITS.min, minutes));

export const isSessionDurationValid = (minutes: number) =>
  minutes >= SESSION_LIMITS.min && minutes <= SESSION_LIMITS.max;
