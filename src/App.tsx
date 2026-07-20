import { useEffect, useRef } from 'react';
import { useGame } from './store';
import type { GameState, Screen } from './store';
import { assessAlarm, missMorning, missedPost, resetMorning, startRing, MISS_GRACE_MINUTES } from './lib/game';
import { dayKey, fmtTimeOfDay, nextOccurrence } from './lib/time';
import { startKlaxon, stopKlaxon } from './lib/sound';
import { Splash } from './screens/Splash';
import { SquadUp } from './screens/SquadUp';
import { AlarmEditor } from './screens/AlarmEditor';
import { Home } from './screens/Home';
import { SquadBoard } from './screens/SquadBoard';
import { YouStats } from './screens/YouStats';
import { WindDown } from './screens/WindDown';
import { WeeklyRecap } from './screens/WeeklyRecap';
import { SocialStatus } from './screens/SocialStatus';
import { SharingSettingsScreen } from './screens/SharingSettings';
import { SoundSettings } from './screens/SoundSettings';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { FirstRing, SnoozeAftermath, Victory, WakeCheck } from './screens/morning';

const SCREENS: Record<Screen, () => React.JSX.Element> = {
  splash: Splash,
  squadUp: SquadUp,
  alarmEditor: AlarmEditor,
  home: Home,
  squad: SquadBoard,
  you: YouStats,
  windDown: WindDown,
  weeklyRecap: WeeklyRecap,
  socialStatus: SocialStatus,
  sharingSettings: SharingSettingsScreen,
  soundSettings: SoundSettings,
  notifications: NotificationsScreen,
  firstRing: FirstRing,
  wakeCheck: WakeCheck,
  snoozeAftermath: SnoozeAftermath,
  victory: Victory,
};

export default function App() {
  const { state, screen, go, update } = useGame();
  const fireAtRef = useRef<number | null>(null);

  const idle = state.morning.phase === 'idle';

  // schedule the next fire time whenever the alarm settings change or a morning wraps up
  useEffect(() => {
    fireAtRef.current = state.alarm.armed
      ? (nextOccurrence(state.alarm.time, new Date(), state.alarm.repeat)?.getTime() ?? null)
      : null;
  }, [state.alarm.time, state.alarm.armed, state.alarm.repeat, idle]);

  // On open: fire the QA ring, ring late if inside the grace window, or
  // book the miss for an alarm that came and went while the app was closed.
  useEffect(() => {
    if (new URLSearchParams(location.search).get('ring')) {
      update((s) => ({ ...s, onboarded: true, morning: startRing(s.morning, Date.now()) }));
      go('firstRing');
      return;
    }
    const now = new Date();
    const verdict = assessAlarm({ ...stateSnapshotForAssess(state), now });
    if (verdict.kind === 'ring') {
      update((s) => ({ ...s, morning: startRing(s.morning, Date.now()) }));
      go('firstRing');
    } else if (verdict.kind === 'missed') {
      const postedAt = new Date(verdict.occurredAt + MISS_GRACE_MINUTES * 60_000);
      update((s) => applyMiss(s, new Date(verdict.occurredAt), postedAt));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the engine: fire on schedule, re-fire when a snooze runs out, and
  // book the miss when nobody dismisses inside the grace window
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const { phase, nextRingAt, ringStartedAt } = state.morning;
      const graceOver =
        ringStartedAt !== null && now - ringStartedAt > MISS_GRACE_MINUTES * 60_000;
      if (phase === 'idle' && fireAtRef.current !== null && now >= fireAtRef.current) {
        update((s) => ({ ...s, morning: startRing(s.morning, now) }));
        go('firstRing');
      } else if ((phase === 'ringing' || phase === 'aftermath') && graceOver) {
        const at = new Date(now);
        update((s) => applyMiss(s, at, at));
        go('home');
      } else if (phase === 'aftermath' && nextRingAt !== null && now >= nextRingAt) {
        update((s) => ({ ...s, morning: startRing(s.morning, now) }));
        go('firstRing');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [state.morning, update, go]);

  // klaxon follows the ringing phase, louder per snooze if enabled
  useEffect(() => {
    if (state.morning.phase !== 'ringing') {
      stopKlaxon();
      return;
    }
    const volume = Math.min(
      1,
      state.alarm.volume + (state.alarm.louderEverySnooze ? state.morning.snoozeCount * 0.1 : 0)
    );
    startKlaxon(volume);
    return stopKlaxon;
  }, [state.morning.phase, state.morning.snoozeCount, state.alarm.volume, state.alarm.louderEverySnooze]);

  const Current = SCREENS[screen] ?? Home;
  return <Current />;
}

function stateSnapshotForAssess(s: GameState) {
  return {
    time: s.alarm.time,
    repeat: s.alarm.repeat,
    armed: s.alarm.armed,
    armedAt: s.alarm.armedAt,
    lastResolvedDay: s.lastResolvedDay,
  };
}

/** Book a slept-through morning: −15, streak dead, and the squad hears about it. */
function applyMiss(s: GameState, occurred: Date, postedAt: Date): GameState {
  // idempotent: strict-mode double effects and repeat ticks must not double-charge
  if (s.lastResolvedDay === dayKey(occurred)) return s;
  const scored = missMorning({ points: s.points, streak: s.streak, bestStreak: s.bestStreak });
  const post = missedPost();
  return {
    ...s,
    ...scored,
    morning: resetMorning(),
    lastResolvedDay: dayKey(occurred),
    myPosts: [
      ...s.myPosts,
      { id: `me-${postedAt.getTime()}`, text: post.text, badge: post.badge, tone: 'blue' as const, time: fmtTimeOfDay(postedAt) },
    ],
  };
}
