import { parseAlarm } from './time';

export type MemberOutcome = 'first-ring' | 'snoozed-1' | 'snoozing-3';

export interface SquadMember {
  id: string;
  name: string;
  initial: string;
  alarm: string;
  score: number;
  outcome: MemberOutcome;
  /** when their morning resolves (post appears), 24h clock */
  postAt: { h: number; m: number };
  postTime: string;
  postText: string;
  postBadge: string;
  badgeTone: 'olive' | 'rust' | 'blue';
  boardTag: string;
  boardTagTone: 'olive' | 'rust' | 'muted';
}

/**
 * The squad is simulated client-side for the MVP. Each member follows the
 * script from the design doc; whether their post shows yet derives from the
 * real clock vs. their alarm time.
 */
export const SQUAD: SquadMember[] = [
  {
    id: 'tiah',
    name: 'tiah s.',
    initial: 't',
    alarm: '6:00 am',
    score: 96,
    outcome: 'first-ring',
    postAt: { h: 6, m: 2 },
    postTime: '6:02 AM',
    postText: 'first ring. barely. coffee is happening.',
    postBadge: '+10 · FIRST RING',
    badgeTone: 'olive',
    boardTag: '5-DAY STREAK',
    boardTagTone: 'olive',
  },
  {
    id: 'larry',
    name: 'larry w.',
    initial: 'l',
    alarm: '6:45 am',
    score: 74,
    outcome: 'snoozed-1',
    postAt: { h: 7, m: 15 },
    postTime: '7:15 AM',
    postText: 'ok fine, ONE snooze. it was raining.',
    postBadge: '−5 · 1 SNOOZE',
    badgeTone: 'rust',
    boardTag: '1 SNOOZE THIS WEEK',
    boardTagTone: 'muted',
  },
  {
    id: 'timothy',
    name: 'timothy s.',
    initial: 't',
    alarm: '7:00 am',
    score: 41,
    outcome: 'snoozing-3',
    postAt: { h: 7, m: 0 },
    postTime: '7:00 AM',
    postText: 'still snoozing… ×3. someone go knock.',
    postBadge: '−15 · STILL IN BED',
    badgeTone: 'blue',
    boardTag: '3 SNOOZES TODAY',
    boardTagTone: 'rust',
  },
];

/** timothy finally drags himself up at 8:00 am. */
export function timothyAwake(now: Date): boolean {
  return now.getHours() >= 8;
}

export function memberPostVisible(member: SquadMember, now: Date): boolean {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= member.postAt.h * 60 + member.postAt.m;
}

export function memberPost(member: SquadMember, now: Date) {
  if (member.id === 'timothy' && timothyAwake(now)) {
    return {
      text: 'finally up. do not perceive me.',
      badge: '−15 · 3 SNOOZES',
      tone: 'rust' as const,
    };
  }
  return { text: member.postText, badge: member.postBadge, tone: member.badgeTone };
}

export function alarmShort(member: SquadMember): string {
  const clock = parseAlarm(member.alarm);
  if (!clock) return member.alarm;
  const h = clock.h % 12 === 0 ? 12 : clock.h % 12;
  return `${h}:${String(clock.m).padStart(2, '0')}`;
}
