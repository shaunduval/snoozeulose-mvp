export interface ClockTime {
  h: number;
  m: number;
}

export function parseAlarm(t: string): ClockTime | null {
  const match = String(t)
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;
  let h = Number(match[1]);
  const m = Number(match[2] ?? 0);
  const meridiem = match[3];
  if (m > 59) return null;
  if (meridiem) {
    if (h < 1 || h > 12) return null;
    h = h % 12;
    if (meridiem === 'pm') h += 12;
  } else if (h > 23) {
    return null;
  }
  return { h, m };
}

export function formatClock(h: number, m: number): string {
  const meridiem = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${meridiem}`;
}

/** Next fire time for an alarm, honoring repeat days (index 0 = monday). */
export function nextOccurrence(t: string, from: Date, repeat?: boolean[]): Date | null {
  const clock = parseAlarm(t);
  if (!clock) return null;
  const next = new Date(from);
  next.setHours(clock.h, clock.m, 0, 0);
  if (next.getTime() <= from.getTime()) next.setDate(next.getDate() + 1);
  if (repeat && repeat.some(Boolean)) {
    for (let i = 0; i < 7; i++) {
      const mondayFirst = (next.getDay() + 6) % 7;
      if (repeat[mondayFirst]) return next;
      next.setDate(next.getDate() + 1);
    }
  }
  return next;
}

export function ringsIn(t: string, from = new Date(), repeat?: boolean[]): string {
  const next = nextOccurrence(t, from, repeat);
  if (!next) return 'a few hours';
  const minutes = Math.round((next.getTime() - from.getTime()) / 60000);
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

/** Bedtime that banks `hours` of sleep before the alarm. */
export function lightsOut(t: string, hours = 8): string {
  const clock = parseAlarm(t);
  if (!clock) return '10:30 pm';
  const h = (((clock.h - hours) % 24) + 24) % 24;
  return formatClock(h, clock.m);
}

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function fmtShortDate(d: Date): string {
  return `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function fmtTimeOfDay(d: Date): string {
  const meridiem = d.getHours() >= 12 ? 'PM' : 'AM';
  const hour = d.getHours() % 12 === 0 ? 12 : d.getHours() % 12;
  return `${hour}:${String(d.getMinutes()).padStart(2, '0')} ${meridiem}`;
}

export function weekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function fmtCountdown(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
