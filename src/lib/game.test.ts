import { describe, expect, it } from 'vitest';
import {
  beginWakeCheck,
  idleMorning,
  resumeRing,
  snooze,
  snoozePost,
  startRing,
  victoryPost,
  winMorning,
} from './game';
import type { MeScore } from './game';

const me: MeScore = { points: 68, streak: 4, bestStreak: 4 };
const T0 = 1_000_000;

describe('startRing', () => {
  it('enters the ringing phase and stamps the ring start once', () => {
    const first = startRing(idleMorning, T0);
    expect(first.phase).toBe('ringing');
    expect(first.ringStartedAt).toBe(T0);
    // a re-ring after snooze keeps the original start for the dismissed-in stat
    const again = startRing({ ...first, phase: 'aftermath' }, T0 + 600_000);
    expect(again.ringStartedAt).toBe(T0);
  });
});

describe('snooze', () => {
  it('costs 5 points and schedules the next ring 9 minutes out', () => {
    const ringing = startRing(idleMorning, T0);
    const { morning, me: after } = snooze(ringing, me, T0);
    expect(after.points).toBe(63);
    expect(morning.snoozeCount).toBe(1);
    expect(morning.phase).toBe('aftermath');
    expect(morning.nextRingAt).toBe(T0 + 9 * 60_000);
  });

  it('stacks penalties on repeat snoozes', () => {
    let morning = startRing(idleMorning, T0);
    let score = me;
    ({ morning, me: score } = snooze(morning, score, T0));
    ({ morning, me: score } = snooze(resumeRing(morning), score, T0 + 9 * 60_000));
    expect(score.points).toBe(58);
    expect(morning.snoozeCount).toBe(2);
  });
});

describe('winMorning', () => {
  it('pays +10 and extends the streak on a first-ring dismiss', () => {
    const ringing = startRing(idleMorning, T0);
    const { morning, me: after } = winMorning(beginWakeCheck(ringing), me, T0 + 41_000);
    expect(after.points).toBe(78);
    expect(after.streak).toBe(5);
    expect(after.bestStreak).toBe(5);
    expect(morning.phase).toBe('victory');
    expect(morning.dismissedInMs).toBe(41_000);
  });

  it('lets the streak survive exactly one snooze, with no bonus', () => {
    const ringing = startRing(idleMorning, T0);
    const { morning } = snooze(ringing, me, T0);
    const { me: after } = winMorning(beginWakeCheck(resumeRing(morning)), { ...me, points: 63 }, T0);
    expect(after.points).toBe(63);
    expect(after.streak).toBe(4);
  });

  it('kills the streak at two or more snoozes', () => {
    let morning = startRing(idleMorning, T0);
    ({ morning } = snooze(morning, me, T0));
    ({ morning } = snooze(resumeRing(morning), me, T0));
    const { me: after } = winMorning(beginWakeCheck(morning), me, T0);
    expect(after.streak).toBe(0);
  });

  it('never lowers bestStreak when the streak resets', () => {
    let morning = startRing(idleMorning, T0);
    ({ morning } = snooze(morning, me, T0));
    ({ morning } = snooze(resumeRing(morning), me, T0));
    const { me: after } = winMorning(beginWakeCheck(morning), me, T0);
    expect(after.bestStreak).toBe(4);
  });
});

describe('posts', () => {
  it('writes the snooze status with the running count', () => {
    expect(snoozePost(2)).toEqual({ text: 'snoozing… ×2', badge: '−5 · STILL IN BED' });
  });

  it('celebrates a first-ring win with the new streak day', () => {
    expect(victoryPost(0, 5).text).toBe('up on the first ring. day 5. good morning.');
    expect(victoryPost(0, 5).badge).toBe('+10 · FIRST RING');
  });

  it('owns up after snoozing', () => {
    expect(victoryPost(1, 4).badge).toBe('−5 · 1 SNOOZE');
    expect(victoryPost(3, 0).badge).toBe('−15 · 3 SNOOZES');
  });
});
