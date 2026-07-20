import { describe, expect, it } from 'vitest';
import {
  fmtCountdown,
  formatClock,
  lightsOut,
  nextOccurrence,
  parseAlarm,
  ringsIn,
  weekNumber,
} from './time';

describe('parseAlarm', () => {
  it('parses 12h times with meridiem', () => {
    expect(parseAlarm('6:30 am')).toEqual({ h: 6, m: 30 });
    expect(parseAlarm('6:30 pm')).toEqual({ h: 18, m: 30 });
    expect(parseAlarm('12:00 am')).toEqual({ h: 0, m: 0 });
    expect(parseAlarm('12:15 pm')).toEqual({ h: 12, m: 15 });
  });

  it('parses bare hours and 24h times', () => {
    expect(parseAlarm('7 am')).toEqual({ h: 7, m: 0 });
    expect(parseAlarm('18:45')).toEqual({ h: 18, m: 45 });
  });

  it('rejects garbage and out-of-range values', () => {
    expect(parseAlarm('not a time')).toBeNull();
    expect(parseAlarm('25:00')).toBeNull();
    expect(parseAlarm('6:75 am')).toBeNull();
    expect(parseAlarm('13:00 pm')).toBeNull();
    expect(parseAlarm('')).toBeNull();
  });
});

describe('formatClock', () => {
  it('formats midnight and noon correctly', () => {
    expect(formatClock(0, 5)).toBe('12:05 am');
    expect(formatClock(12, 0)).toBe('12:00 pm');
    expect(formatClock(18, 30)).toBe('6:30 pm');
  });
});

describe('nextOccurrence', () => {
  // Tue Jul 21 2026, 10:48 pm
  const tueNight = new Date(2026, 6, 21, 22, 48);

  it('rolls to tomorrow when the time already passed today', () => {
    const next = nextOccurrence('6:30 am', tueNight)!;
    expect(next.getDate()).toBe(22);
    expect(next.getHours()).toBe(6);
    expect(next.getMinutes()).toBe(30);
  });

  it('fires today when the time is still ahead', () => {
    const morning = new Date(2026, 6, 21, 5, 0);
    expect(nextOccurrence('6:30 am', morning)!.getDate()).toBe(21);
  });

  it('skips to the next enabled repeat day', () => {
    // weekdays only; friday night → monday
    const friNight = new Date(2026, 6, 24, 23, 0);
    const weekdays = [true, true, true, true, true, false, false];
    const next = nextOccurrence('6:30 am', friNight, weekdays)!;
    expect(next.getDay()).toBe(1); // monday
    expect(next.getDate()).toBe(27);
  });

  it('ignores an all-false repeat mask (one-shot alarm)', () => {
    const next = nextOccurrence('6:30 am', tueNight, [false, false, false, false, false, false, false])!;
    expect(next.getDate()).toBe(22);
  });

  it('returns null for an unparseable time', () => {
    expect(nextOccurrence('nope', tueNight)).toBeNull();
  });
});

describe('ringsIn', () => {
  it('reports hours and minutes until the next ring', () => {
    const from = new Date(2026, 6, 21, 22, 48);
    expect(ringsIn('6:30 am', from)).toBe('7h 42m');
  });

  it('pads single-digit minutes', () => {
    const from = new Date(2026, 6, 21, 22, 25);
    expect(ringsIn('10:30 pm', from)).toBe('0h 05m');
  });
});

describe('lightsOut', () => {
  it('banks 8 hours before the alarm', () => {
    expect(lightsOut('6:30 am')).toBe('10:30 pm');
  });

  it('wraps across midnight without going negative', () => {
    expect(lightsOut('3:00 am')).toBe('7:00 pm');
    expect(lightsOut('11:00 pm')).toBe('3:00 pm');
  });
});

describe('weekNumber', () => {
  it('matches ISO week numbering', () => {
    expect(weekNumber(new Date(2026, 0, 1))).toBe(1);
    expect(weekNumber(new Date(2026, 6, 21))).toBe(30);
  });
});

describe('fmtCountdown', () => {
  it('formats minutes and seconds', () => {
    expect(fmtCountdown(8 * 60_000 + 42_000)).toBe('8:42');
  });

  it('clamps negative values to zero', () => {
    expect(fmtCountdown(-5000)).toBe('0:00');
  });
});
