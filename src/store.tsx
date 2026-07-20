import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { idleMorning, type MorningState } from './lib/game';

export type Screen =
  | 'splash'
  | 'squadUp'
  | 'alarmEditor'
  | 'home'
  | 'squad'
  | 'you'
  | 'windDown'
  | 'weeklyRecap'
  | 'socialStatus'
  | 'sharingSettings'
  | 'soundSettings'
  | 'notifications'
  | 'firstRing'
  | 'wakeCheck'
  | 'snoozeAftermath'
  | 'victory';

export type SoundId = 'sunrise-klaxon' | 'rooster-mode' | 'gentle-rise' | 'squad-voice-note';

export const SOUND_NAMES: Record<SoundId, string> = {
  'sunrise-klaxon': 'SUNRISE KLAXON',
  'rooster-mode': 'ROOSTER MODE',
  'gentle-rise': 'GENTLE RISE',
  'squad-voice-note': 'SQUAD VOICE NOTE',
};

export interface AlarmSettings {
  time: string;
  /** monday-first */
  repeat: boolean[];
  armed: boolean;
  /** when the alarm was last armed; occurrences before this never count as missed */
  armedAt: number;
  noSnooze: boolean;
  wakeCheckRounds: number;
  sound: SoundId;
  volume: number;
  louderEverySnooze: boolean;
  vibration: boolean;
  quietHours: boolean;
}

export interface SharingSettings {
  firstRingWins: boolean;
  streakMilestones: boolean;
  exactWakeTime: boolean;
  audience: 'squad' | 'connected' | 'public';
  workChat: boolean;
  storyAutoPost: boolean;
}

export interface MyPost {
  id: string;
  text: string;
  time: string;
  badge: string;
  tone: 'olive' | 'rust' | 'blue' | 'yellow';
}

export interface GameState {
  onboarded: boolean;
  squadName: string;
  alarm: AlarmSettings;
  sharing: SharingSettings;
  accountsConnected: boolean;
  points: number;
  streak: number;
  bestStreak: number;
  /** local day key of the last morning that reached an outcome (win or miss) */
  lastResolvedDay: string | null;
  checklistDone: string[];
  sleepMode: boolean;
  /** local day key when hygiene points were last granted */
  hygieneAwardedDay: string | null;
  myPosts: MyPost[];
  reactions: Record<string, boolean>;
  morning: MorningState;
}

export const initialState: GameState = {
  onboarded: false,
  squadName: 'the early birds',
  alarm: {
    time: '6:30 am',
    repeat: [true, true, true, true, true, false, false],
    armed: true,
    armedAt: Date.now(),
    noSnooze: true,
    wakeCheckRounds: 3,
    sound: 'sunrise-klaxon',
    volume: 0.7,
    louderEverySnooze: true,
    vibration: true,
    quietHours: false,
  },
  sharing: {
    firstRingWins: true,
    streakMilestones: true,
    exactWakeTime: false,
    audience: 'squad',
    workChat: true,
    storyAutoPost: false,
  },
  accountsConnected: false,
  points: 68,
  streak: 4,
  bestStreak: 4,
  lastResolvedDay: null,
  checklistDone: ['caffeine', 'phone'],
  sleepMode: false,
  hygieneAwardedDay: null,
  myPosts: [],
  reactions: {},
  morning: idleMorning,
};

const STORAGE_KEY = 'snoozeulose:v1';

function load(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const saved = JSON.parse(raw) as Partial<GameState>;
    return {
      ...initialState,
      ...saved,
      alarm: { ...initialState.alarm, ...saved.alarm },
      sharing: { ...initialState.sharing, ...saved.sharing },
      morning: idleMorning, // the morning flow never survives a reload
    };
  } catch {
    return initialState;
  }
}

interface Store {
  state: GameState;
  screen: Screen;
  go: (screen: Screen) => void;
  update: (patch: (state: GameState) => GameState) => void;
}

const StoreContext = createContext<Store | null>(null);

function initialScreen(onboarded: boolean): Screen {
  const wanted = new URLSearchParams(location.search).get('screen') as Screen | null;
  if (wanted) return wanted;
  return onboarded ? 'home' : 'splash';
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(load);
  const [screen, setScreen] = useState<Screen>(() => initialScreen(load().onboarded));
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const { morning: _transient, ...persisted } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  }, [state]);

  const store = useMemo<Store>(
    () => ({
      state,
      screen,
      go: setScreen,
      update: (patch) => setState((s) => patch(s)),
    }),
    [state, screen]
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useGame(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useGame outside StoreProvider');
  return store;
}
