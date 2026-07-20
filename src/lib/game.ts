import { dayKey, prevOccurrence } from './time';

export const SNOOZE_PENALTY = 5;
export const FIRST_RING_BONUS = 10;
export const SNOOZE_MINUTES = 9;
export const MISS_PENALTY = 15;
export const MISS_GRACE_MINUTES = 45;

export type MorningPhase = 'idle' | 'ringing' | 'aftermath' | 'wakecheck' | 'victory';

export interface MorningState {
  phase: MorningPhase;
  snoozeCount: number;
  ringStartedAt: number | null;
  nextRingAt: number | null;
  dismissedInMs: number | null;
}

export interface MeScore {
  points: number;
  streak: number;
  bestStreak: number;
}

export const idleMorning: MorningState = {
  phase: 'idle',
  snoozeCount: 0,
  ringStartedAt: null,
  nextRingAt: null,
  dismissedInMs: null,
};

export function startRing(morning: MorningState, now: number): MorningState {
  return {
    ...morning,
    phase: 'ringing',
    ringStartedAt: morning.ringStartedAt ?? now,
    nextRingAt: null,
  };
}

export function snooze(
  morning: MorningState,
  me: MeScore,
  now: number
): { morning: MorningState; me: MeScore } {
  return {
    morning: {
      ...morning,
      phase: 'aftermath',
      snoozeCount: morning.snoozeCount + 1,
      nextRingAt: now + SNOOZE_MINUTES * 60_000,
    },
    me: { ...me, points: me.points - SNOOZE_PENALTY },
  };
}

export function beginWakeCheck(morning: MorningState): MorningState {
  return { ...morning, phase: 'wakecheck' };
}

/** Wake check stalled or was abandoned: the alarm resumes. */
export function resumeRing(morning: MorningState): MorningState {
  return { ...morning, phase: 'ringing' };
}

/**
 * Wake check passed. First ring pays +10 and extends the streak;
 * one snooze leaves the streak intact; two or more reset it.
 */
export function winMorning(
  morning: MorningState,
  me: MeScore,
  now: number
): { morning: MorningState; me: MeScore } {
  const firstRing = morning.snoozeCount === 0;
  const streak = firstRing ? me.streak + 1 : morning.snoozeCount === 1 ? me.streak : 0;
  return {
    morning: {
      ...morning,
      phase: 'victory',
      dismissedInMs: morning.ringStartedAt === null ? null : now - morning.ringStartedAt,
    },
    me: {
      ...me,
      points: me.points + (firstRing ? FIRST_RING_BONUS : 0),
      streak,
      bestStreak: Math.max(me.bestStreak, streak),
    },
  };
}

export function resetMorning(): MorningState {
  return { ...idleMorning };
}

/**
 * Never dismissed within the grace window: the harshest outcome.
 * Sleeping through costs more than any snooze and the streak dies.
 */
export function missMorning(me: MeScore): MeScore {
  return { ...me, points: me.points - MISS_PENALTY, streak: 0 };
}

export type AlarmCatchUp =
  | { kind: 'none' }
  | { kind: 'ring' }
  | { kind: 'missed'; occurredAt: number };

/**
 * On app open, decide what the last scheduled ring demands: nothing
 * (handled, disarmed, or predates arming), a late ring (still inside the
 * grace window), or a retroactive miss.
 */
export function assessAlarm(opts: {
  time: string;
  repeat: boolean[];
  armed: boolean;
  armedAt: number;
  lastResolvedDay: string | null;
  now: Date;
}): AlarmCatchUp {
  if (!opts.armed) return { kind: 'none' };
  const prev = prevOccurrence(opts.time, opts.now, opts.repeat);
  if (!prev || prev.getTime() <= opts.armedAt) return { kind: 'none' };
  if (dayKey(prev) === opts.lastResolvedDay) return { kind: 'none' };
  if (opts.now.getTime() - prev.getTime() > MISS_GRACE_MINUTES * 60_000) {
    return { kind: 'missed', occurredAt: prev.getTime() };
  }
  return { kind: 'ring' };
}

export function missedPost(): { text: string; badge: string } {
  return {
    text: 'no response. slept through it. someone go knock.',
    badge: `−${MISS_PENALTY} · NO RESPONSE`,
  };
}

export function snoozePost(count: number): { text: string; badge: string } {
  return { text: `snoozing… ×${count}`, badge: `−${SNOOZE_PENALTY} · STILL IN BED` };
}

export function victoryPost(snoozeCount: number, streak: number): { text: string; badge: string } {
  if (snoozeCount === 0) {
    return { text: `up on the first ring. day ${streak}. good morning.`, badge: '+10 · FIRST RING' };
  }
  if (snoozeCount === 1) {
    return { text: 'ok fine, ONE snooze. i\'m up now.', badge: '−5 · 1 SNOOZE' };
  }
  return {
    text: 'finally up. do not perceive me.',
    badge: `−${snoozeCount * SNOOZE_PENALTY} · ${snoozeCount} SNOOZES`,
  };
}
