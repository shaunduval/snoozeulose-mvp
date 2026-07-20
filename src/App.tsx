import { useEffect, useRef } from 'react';
import { useGame } from './store';
import type { Screen } from './store';
import { startRing } from './lib/game';
import { nextOccurrence } from './lib/time';
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

  // QA helper: ?ring=1 fires the alarm immediately
  useEffect(() => {
    if (new URLSearchParams(location.search).get('ring')) {
      update((s) => ({ ...s, onboarded: true, morning: startRing(s.morning, Date.now()) }));
      go('firstRing');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the engine: fire on schedule, and re-fire when a snooze runs out
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      if (state.morning.phase === 'idle' && fireAtRef.current !== null && now >= fireAtRef.current) {
        update((s) => ({ ...s, morning: startRing(s.morning, now) }));
        go('firstRing');
      } else if (
        state.morning.phase === 'aftermath' &&
        state.morning.nextRingAt !== null &&
        now >= state.morning.nextRingAt
      ) {
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
