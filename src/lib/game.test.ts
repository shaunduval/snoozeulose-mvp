import { describe, expect, it } from 'vitest';
import {
  assessAlarm,
  beginWakeCheck,
  idleMorning,
  missedPost,
  missMorning,
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

describe('missMorning', () => {
  it('costs 15 points and kills the streak, keeping bestStreak', () => {
    const after = missMorning(me);
    expect(after.points).toBe(53);
    expect(after.streak).toBe(0);
    expect(after.bestStreak).toBe(4);
  });
});

describe('assessAlarm', () => {
  // weekday 6:30 alarm, armed friday evening
  const weekdays = [true, true, true, true, true, false, false];
  const armedAt = new Date(2026, 6, 17, 20, 0).getTime(); // fri 8 pm
  const base = { time: '6:30 am', repeat: weekdays, armed: true, armedAt, lastResolvedDay: null };

  it('does nothing while disarmed', () => {
    const now = new Date(2026, 6, 20, 9, 0);
    expect(assessAlarm({ ...base, armed: false, now })).toEqual({ kind: 'none' });
  });

  it('ignores occurrences from before the alarm was armed', () => {
    // armed monday 7 am, checked monday 9 am: monday 6:30 predates arming
    const now = new Date(2026, 6, 20, 9, 0);
    const lateArm = new Date(2026, 6, 20, 7, 0).getTime();
    expect(assessAlarm({ ...base, armedAt: lateArm, now })).toEqual({ kind: 'none' });
  });

  it('rings late inside the 45-minute grace window', () => {
    const now = new Date(2026, 6, 20, 6, 50); // 20 min after monday's 6:30
    expect(assessAlarm({ ...base, now })).toEqual({ kind: 'ring' });
  });

  it('books a miss once the grace window closes', () => {
    const now = new Date(2026, 6, 20, 9, 0);
    const verdict = assessAlarm({ ...base, now });
    expect(verdict.kind).toBe('missed');
    if (verdict.kind === 'missed') {
      expect(new Date(verdict.occurredAt).getHours()).toBe(6);
      expect(new Date(verdict.occurredAt).getDate()).toBe(20);
    }
  });

  it('stays quiet when the morning was already resolved', () => {
    const now = new Date(2026, 6, 20, 9, 0);
    expect(assessAlarm({ ...base, lastResolvedDay: '2026-07-20', now })).toEqual({ kind: 'none' });
  });

  it('reports a stale weekend-skipped miss from days ago', () => {
    // armed thursday night, friday was slept through, opened sunday
    const now = new Date(2026, 6, 19, 15, 0);
    const thuNight = new Date(2026, 6, 16, 22, 0).getTime();
    const verdict = assessAlarm({ ...base, armedAt: thuNight, lastResolvedDay: '2026-07-16', now });
    expect(verdict.kind).toBe('missed');
    if (verdict.kind === 'missed') expect(new Date(verdict.occurredAt).getDate()).toBe(17);
  });
});

describe('posts', () => {
  it('posts the no-response status with the miss penalty', () => {
    expect(missedPost()).toEqual({
      text: 'no response. slept through it. someone go knock.',
      badge: '−15 · NO RESPONSE',
    });
  });

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
