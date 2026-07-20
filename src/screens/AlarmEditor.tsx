import { useState } from 'react';
import { Micro, Phone, PrimaryButton, Spacer, Toggle } from '../components/ui';
import { useNow } from '../hooks';
import { formatClock, parseAlarm, ringsIn } from '../lib/time';
import { SOUND_NAMES, useGame } from '../store';

const DAY_LABELS = ['m', 't', 'w', 't', 'f', 's', 's'];

export function AlarmEditor() {
  const { state, go, update } = useGame();
  const now = useNow();
  const [editing, setEditing] = useState(false);
  const clock = parseAlarm(state.alarm.time);

  const setTime = (value: string) => {
    // native time input gives "HH:MM" 24h
    const [h, m] = value.split(':').map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) {
      update((s) => ({ ...s, alarm: { ...s.alarm, time: formatClock(h, m) } }));
    }
  };

  const toggleDay = (i: number) =>
    update((s) => ({
      ...s,
      alarm: { ...s.alarm, repeat: s.alarm.repeat.map((on, idx) => (idx === i ? !on : on)) },
    }));

  const cycleWakeCheck = () =>
    update((s) => ({
      ...s,
      alarm: { ...s.alarm, wakeCheckRounds: s.alarm.wakeCheckRounds === 3 ? 5 : s.alarm.wakeCheckRounds === 5 ? 1 : 3 },
    }));

  const save = () => {
    update((s) => ({ ...s, onboarded: true, alarm: { ...s.alarm, armed: true, armedAt: Date.now() } }));
    go('home');
  };

  return (
    <Phone>
      <div style={{ fontSize: 27, letterSpacing: '-0.3px' }}>set your alarm</div>

      <div style={{ background: 'var(--cream)', borderRadius: 20, padding: '18px 20px', marginTop: 16, color: 'var(--ink)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Micro color="var(--olive)">FIRST RING</Micro>
          <button
            className="mono"
            onClick={() => setEditing((e) => !e)}
            style={{
              fontSize: 10,
              letterSpacing: '1px',
              color: 'var(--ink-55)',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            {editing ? 'DONE' : 'EDIT'}
          </button>
        </div>
        {editing ? (
          <input
            type="time"
            aria-label="alarm time"
            value={clock ? `${String(clock.h).padStart(2, '0')}:${String(clock.m).padStart(2, '0')}` : '06:30'}
            onChange={(e) => setTime(e.target.value)}
            style={{
              fontSize: 44,
              letterSpacing: '-1px',
              marginTop: 8,
              border: 'none',
              background: 'transparent',
              color: 'var(--ink)',
              width: '100%',
              padding: 0,
            }}
          />
        ) : (
          <div style={{ fontSize: 54, lineHeight: 1.05, letterSpacing: '-1px', marginTop: 8 }}>{state.alarm.time}</div>
        )}
        <div style={{ fontSize: 13.5, color: 'var(--ink-65)', marginTop: 4 }}>
          rings again tomorrow · in {ringsIn(state.alarm.time, now)}
        </div>
      </div>

      <Micro style={{ marginTop: 18 }}>REPEATS</Micro>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {DAY_LABELS.map((label, i) => {
          const on = state.alarm.repeat[i];
          return (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              aria-pressed={on}
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                background: on ? 'var(--yellow)' : 'transparent',
                border: on ? 'none' : '1px solid rgba(245,236,220,0.3)',
                color: on ? 'var(--ink)' : 'rgba(245,236,220,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ border: '1px solid var(--cream-border)', borderRadius: 18, marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
          <div style={{ fontSize: 14.5 }}>no-snooze mode</div>
          <Toggle
            on={state.alarm.noSnooze}
            label="no-snooze mode"
            onToggle={() => update((s) => ({ ...s, alarm: { ...s.alarm, noSnooze: !s.alarm.noSnooze } }))}
          />
        </div>
        <div className="row-line" />
        <button
          onClick={cycleWakeCheck}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', width: '100%' }}
        >
          <div style={{ fontSize: 14.5 }}>wake check</div>
          <div className="mono" style={{ fontSize: 11, color: 'rgba(245,236,220,0.55)' }}>
            MATH SPRINT ×{state.alarm.wakeCheckRounds} →
          </div>
        </button>
        <div className="row-line" />
        <button
          onClick={() => go('soundSettings')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', width: '100%' }}
        >
          <div style={{ fontSize: 14.5 }}>sound</div>
          <div className="mono" style={{ fontSize: 11, color: 'rgba(245,236,220,0.55)' }}>
            {SOUND_NAMES[state.alarm.sound]} →
          </div>
        </button>
        <div className="row-line" />
        <button
          onClick={() => go('sharingSettings')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', width: '100%' }}
        >
          <div style={{ fontSize: 14.5 }}>stakes</div>
          <div className="mono" style={{ fontSize: 11, color: 'rgba(245,236,220,0.55)' }}>
            −5 PER SNOOZE →
          </div>
        </button>
      </div>

      <Spacer />
      <PrimaryButton onClick={save}>save alarm</PrimaryButton>
      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: '1.4px',
          color: 'var(--cream-40)',
          textAlign: 'center',
          margin: '12px 0 8px',
        }}
      >
        THE SQUAD SEES YOUR ALARM TIME, NOT YOUR EXCUSES
      </div>
    </Phone>
  );
}
