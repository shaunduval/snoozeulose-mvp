import { useEffect, useMemo, useState } from 'react';
import { Avatar, Micro, Phone, Pill, PrimaryButton, Spacer } from '../components/ui';
import { useNow } from '../hooks';
import { snoozePost, victoryPost, SNOOZE_PENALTY } from '../lib/game';
import * as game from '../lib/game';
import { answerFor, makeProblems, WAKE_CHECK_STALL_SECONDS } from '../lib/wakeCheck';
import type { Problem } from '../lib/wakeCheck';
import { dayKey, fmtCountdown, fmtShortDate, fmtTimeOfDay } from '../lib/time';
import { useGame } from '../store';
import type { MyPost } from '../store';

function newPost(text: string, badge: string, tone: MyPost['tone']): MyPost {
  return { id: `me-${Date.now()}`, text, badge, tone, time: fmtTimeOfDay(new Date()) };
}

// ---------- 03 · first ring ----------

export function FirstRing() {
  const { state, go, update } = useGame();
  const now = useNow(1000);

  const snoozeNow = () => {
    update((s) => {
      const { morning, me } = game.snooze(s.morning, meOf(s), Date.now());
      const post = snoozePost(morning.snoozeCount);
      return {
        ...s,
        ...me,
        morning,
        myPosts: [...s.myPosts, newPost(post.text, post.badge, 'blue')],
      };
    });
    go('snoozeAftermath');
  };

  const dismiss = () => {
    update((s) => ({ ...s, morning: game.beginWakeCheck(s.morning) }));
    go('wakeCheck');
  };

  return (
    <Phone bg="var(--alarm)" color="var(--ink)" pad={24}>
      <Micro color="rgba(38,32,25,0.75)" style={{ letterSpacing: '1.6px', marginTop: 14 }}>
        {fmtShortDate(now)} · {state.morning.snoozeCount === 0 ? 'FIRST RING' : `RING ×${state.morning.snoozeCount + 1}`}
      </Micro>
      <div style={{ fontSize: 78, lineHeight: 1, letterSpacing: '-2px', marginTop: 22, animation: 'ringPulse 1s ease-in-out infinite' }}>
        {state.alarm.time}
      </div>
      <div style={{ fontSize: 27, letterSpacing: '-0.3px', marginTop: 10 }}>wake up, shaun.</div>
      <div style={{ fontSize: 14.5, lineHeight: 1.5, color: 'rgba(38,32,25,0.78)', marginTop: 10 }}>
        the squad can see this. day {state.streak} of your streak is on the line.
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
        <Pill tone="cream" style={{ fontSize: 10.5, padding: '6px 12px' }}>
          +10 FIRST RING
        </Pill>
        <Pill outline="rgba(38,32,25,0.45)" style={{ fontSize: 10.5, padding: '6px 12px' }}>
          −5 PER SNOOZE
        </Pill>
      </div>
      <Spacer />
      <PrimaryButton bg="var(--cream)" height={64} onClick={dismiss}>
        i'm up →
      </PrimaryButton>
      {state.alarm.noSnooze ? (
        <div
          style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'rgba(38,32,25,0.6)' }}
        >
          no-snooze mode is on. no way out but up.
        </div>
      ) : (
        <button
          className="link-under"
          style={{ height: 48, fontSize: 13, color: 'rgba(38,32,25,0.78)', fontFamily: 'var(--font-sans)' }}
          onClick={snoozeNow}
        >
          snooze — −5, posts "snoozing…" to your squad
        </button>
      )}
      <div
        className="mono"
        style={{ fontSize: 10, letterSpacing: '1.4px', color: 'rgba(38,32,25,0.6)', textAlign: 'center', margin: '4px 0 16px' }}
      >
        STATUS AUTO-POSTS WHEN YOU DISMISS
      </div>
    </Phone>
  );
}

// ---------- 13 · wake check ----------

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'DEL'];

export function WakeCheck() {
  const { state, go, update } = useGame();
  const rounds = state.alarm.wakeCheckRounds;
  const problems = useMemo<Problem[]>(() => makeProblems(rounds), [rounds]);
  const [round, setRound] = useState(0);
  const [input, setInput] = useState('');
  const [stallLeft, setStallLeft] = useState(WAKE_CHECK_STALL_SECONDS);

  // stall timer: freeze too long and the alarm resumes
  useEffect(() => {
    setStallLeft(WAKE_CHECK_STALL_SECONDS);
    const id = setInterval(() => setStallLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [round]);

  useEffect(() => {
    if (stallLeft > 0) return;
    update((s) => ({ ...s, morning: game.resumeRing(s.morning) }));
    go('firstRing');
  }, [stallLeft, go, update]);

  const problem = problems[round];
  const target = String(answerFor(problem));

  const press = (key: string) => {
    if (key === 'CLR') return setInput('');
    if (key === 'DEL') return setInput((v) => v.slice(0, -1));
    const next = (input + key).slice(0, target.length);
    if (next.length < target.length) return setInput(next);
    if (next === target) {
      if (round + 1 >= rounds) {
        update((s) => {
          const { morning, me } = game.winMorning(s.morning, meOf(s), Date.now());
          const posts = [...s.myPosts];
          // snooze-tinged posts are locked on (it's the game); clean wins respect the toggle
          if (s.morning.snoozeCount > 0 || s.sharing.firstRingWins) {
            const post = victoryPost(s.morning.snoozeCount, me.streak);
            posts.push(newPost(post.text, post.badge, s.morning.snoozeCount === 0 ? 'olive' : 'rust'));
          }
          if (s.sharing.streakMilestones && me.streak > 0 && me.streak % 5 === 0) {
            posts.push(newPost(`day ${me.streak}. that's a milestone.`, `STREAK ×${me.streak}`, 'yellow'));
          }
          return { ...s, ...me, morning, lastResolvedDay: dayKey(new Date()), myPosts: posts };
        });
        go('victory');
      } else {
        setRound((r) => r + 1);
        setInput('');
      }
    } else {
      setInput('');
    }
  };

  return (
    <Phone bg="var(--alarm)" color="var(--ink)" pad={24}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Micro color="rgba(38,32,25,0.75)" style={{ letterSpacing: '1.6px' }}>
          WAKE CHECK · {round + 1} OF {rounds}
        </Micro>
        <div style={{ display: 'flex', gap: 6 }}>
          {problems.map((_, i) => (
            <span
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: i <= round ? 'var(--ink)' : 'transparent',
                border: i <= round ? 'none' : '1.5px solid rgba(38,32,25,0.5)',
              }}
            />
          ))}
        </div>
      </div>
      <Micro color="rgba(38,32,25,0.6)" style={{ fontSize: 10, letterSpacing: '1.2px', marginTop: 10 }}>
        ALARM RESUMES IN {fmtCountdown(stallLeft * 1000)} IF YOU STALL
      </Micro>
      <div style={{ fontSize: 64, lineHeight: 1, letterSpacing: '-1.5px', marginTop: 26, textAlign: 'center' }}>
        {problem.a} + {problem.b}
      </div>
      <div
        style={{
          height: 56,
          borderRadius: 16,
          background: 'rgba(38,32,25,0.12)',
          border: '1.5px solid rgba(38,32,25,0.4)',
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          letterSpacing: 2,
        }}
      >
        {input}
        <span style={{ opacity: 0.4 }}>_</span>
      </div>
      <Spacer />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {KEYS.map((key) =>
          key === 'CLR' || key === 'DEL' ? (
            <button
              key={key}
              onClick={() => press(key)}
              className="mono"
              style={{
                height: 58,
                borderRadius: 16,
                border: '1.5px solid rgba(38,32,25,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                letterSpacing: 1,
              }}
            >
              {key}
            </button>
          ) : (
            <button
              key={key}
              onClick={() => press(key)}
              style={{
                height: 58,
                borderRadius: 16,
                background: 'var(--cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}
            >
              {key}
            </button>
          )
        )}
      </div>
      <div
        className="mono"
        style={{ fontSize: 10, letterSpacing: '1.4px', color: 'rgba(38,32,25,0.6)', textAlign: 'center', margin: '14px 0 8px' }}
      >
        {rounds} RIGHT ANSWERS = OFFICIALLY AWAKE
      </div>
    </Phone>
  );
}

// ---------- 14 · snooze aftermath ----------

export function SnoozeAftermath() {
  const { state, go, update } = useGame();
  const now = useNow(1000);
  const count = state.morning.snoozeCount;
  const nextRingMs = (state.morning.nextRingAt ?? Date.now()) - now.getTime();
  const volumePct = Math.min(100, Math.round(state.alarm.volume * 100) + (state.alarm.louderEverySnooze ? count * 10 : 0));
  const apologized = state.myPosts.some((p) => p.text.startsWith('sorry'));

  const getUp = () => {
    update((s) => ({ ...s, morning: game.beginWakeCheck(s.morning) }));
    go('wakeCheck');
  };

  const apologize = () =>
    update((s) => ({
      ...s,
      myPosts: [...s.myPosts, newPost('sorry sorry sorry. getting up.', 'APOLOGY ON RECORD', 'blue')],
    }));

  return (
    <Phone pad={24}>
      <Micro style={{ letterSpacing: '1.6px' }}>
        {fmtTimeOfDay(now)} · SNOOZE ×{count}
      </Micro>
      <div style={{ fontSize: 34, letterSpacing: '-0.5px', marginTop: 12 }}>that cost you.</div>
      <div style={{ fontSize: 72, lineHeight: 1, letterSpacing: '-2px', color: 'var(--alarm)', marginTop: 14 }}>
        −{count * SNOOZE_PENALTY}
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.5, color: 'rgba(245,236,220,0.65)', marginTop: 12 }}>
        {count === 1
          ? `day ${state.streak} of your streak survives — barely. snooze again and it's gone, and the alarm gets louder.`
          : `the streak is done for today. get vertical before it gets worse.`}
      </div>

      <div style={{ background: 'var(--cream)', borderRadius: 20, padding: '14px 16px', marginTop: 20, color: 'var(--ink)' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '1.2px', color: 'var(--ink-55)' }}>
          POSTED TO {state.squadName.toUpperCase()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
          <Avatar size={30} surface="cream" />
          <div style={{ fontSize: 14, flex: 1 }}>shaun d.</div>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(38,32,25,0.5)' }}>
            JUST NOW
          </div>
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.45, marginTop: 10 }}>snoozing… ×{count}</div>
        <Pill tone="blue" style={{ marginTop: 10 }}>
          −{SNOOZE_PENALTY} · STILL IN BED
        </Pill>
      </div>

      <Spacer />
      <PrimaryButton bg="var(--cream)" height={58} onClick={getUp}>
        get up now — save the streak
      </PrimaryButton>
      <button className="link-under" onClick={apologize}>
        {apologized ? 'apology sent to the squad ✓' : 'send the squad an apology'}
      </button>
      <div
        className="mono"
        style={{ fontSize: 10, letterSpacing: '1.4px', color: 'var(--cream-40)', textAlign: 'center', margin: '4px 0 8px' }}
      >
        NEXT RING IN {fmtCountdown(nextRingMs)} · {volumePct}% VOLUME
      </div>
    </Phone>
  );
}

// ---------- 16 · victory ----------

export function Victory() {
  const { state, go, update } = useGame();
  const now = useNow();
  const firstRing = state.morning.snoozeCount === 0;
  const dismissedIn = state.morning.dismissedInMs;
  // the wake-up status itself, skipping any milestone post stacked after it
  const wakePost = [...state.myPosts].reverse().find((p) => !p.badge.startsWith('STREAK'));

  const done = () => {
    update((s) => ({ ...s, morning: game.resetMorning(), sleepMode: false }));
    go('squad');
  };

  return (
    <Phone bg="var(--blue)" color="var(--ink)" pad={24}>
      <Micro color="rgba(38,32,25,0.65)" style={{ letterSpacing: '1.6px' }}>
        {fmtShortDate(now).split(' ')[0]} · {state.alarm.time.toUpperCase()}
        {dismissedIn !== null ? ` · DISMISSED IN ${fmtCountdown(dismissedIn)}` : ''}
      </Micro>
      <div style={{ fontSize: 40, letterSpacing: '-0.8px', marginTop: 14 }}>you're up.</div>
      <div
        style={{
          fontSize: 88,
          lineHeight: 1,
          letterSpacing: '-2.5px',
          color: firstRing ? 'var(--olive)' : 'var(--rust)',
          marginTop: 12,
        }}
      >
        {firstRing ? '+10' : `−${state.morning.snoozeCount * SNOOZE_PENALTY}`}
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.5, color: 'rgba(38,32,25,0.75)', marginTop: 12 }}>
        {firstRing
          ? `first ring, no mercy. your streak moves to day ${state.streak}.`
          : state.morning.snoozeCount === 1
            ? `one snooze. the streak holds at day ${state.streak}, but the squad saw everything.`
            : 'the streak is gone. tomorrow is a rematch.'}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
        <Pill tone="ink" style={{ padding: '6px 12px' }}>
          DAY {state.streak} STREAK
        </Pill>
        <Pill outline="rgba(38,32,25,0.4)" style={{ padding: '6px 12px' }}>
          3RD ON THE BOARD
        </Pill>
      </div>

      <div style={{ background: 'var(--cream)', borderRadius: 20, padding: '14px 16px', marginTop: 20 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '1.2px', color: 'var(--ink-55)' }}>
          POSTED TO {state.squadName.toUpperCase()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
          <Avatar size={30} surface="cream" />
          <div style={{ fontSize: 14, flex: 1 }}>shaun d.</div>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(38,32,25,0.5)' }}>
            JUST NOW
          </div>
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.45, marginTop: 10 }}>
          {wakePost ? wakePost.text : 'up. good morning.'}
        </div>
        <Pill tone={firstRing ? 'olive' : 'rust'} style={{ marginTop: 10 }}>
          {wakePost ? wakePost.badge : '+10 · FIRST RING'}
        </Pill>
      </div>

      <Spacer />
      <PrimaryButton bg="var(--ink)" color="var(--cream)" height={56} onClick={done}>
        see the squad board →
      </PrimaryButton>
      <div
        className="mono"
        style={{ fontSize: 10, letterSpacing: '1.4px', color: 'rgba(38,32,25,0.6)', textAlign: 'center', margin: '14px 0 8px' }}
      >
        TIAH IS ALREADY UP · LARRY'S ALARM IN 15 MIN
      </div>
    </Phone>
  );
}

function meOf(s: { points: number; streak: number; bestStreak: number }) {
  return { points: s.points, streak: s.streak, bestStreak: s.bestStreak };
}
