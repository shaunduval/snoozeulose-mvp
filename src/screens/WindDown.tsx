import { CheckIcon, FooterNote, Micro, Phone, PrimaryButton, Spacer } from '../components/ui';
import { useNow } from '../hooks';
import { lightsOut, ringsIn } from '../lib/time';
import { useGame } from '../store';

const CHECKLIST = [
  { id: 'caffeine', label: 'caffeine cutoff by 2 pm' },
  { id: 'phone', label: 'phone charging across the room' },
  { id: 'screens', label: 'screens off by 10:15' },
  { id: 'lights', label: 'lights out by 10:36' },
];

export function WindDown() {
  const { state, go, update } = useGame();
  const now = useNow();
  const bedtime = lightsOut(state.alarm.time);

  const toggle = (id: string) =>
    update((s) => ({
      ...s,
      checklistDone: s.checklistDone.includes(id)
        ? s.checklistDone.filter((x) => x !== id)
        : [...s.checklistDone, id],
    }));

  const startSleepMode = () => {
    update((s) => ({ ...s, sleepMode: true, alarm: { ...s.alarm, armed: true } }));
    go('home');
  };

  return (
    <Phone>
      <Micro>TONIGHT · LIGHTS OUT {bedtime.toUpperCase()}</Micro>
      <div style={{ fontSize: 27, letterSpacing: '-0.3px', marginTop: 6 }}>wind down, shaun.</div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--cream-60)', marginTop: 6 }}>
        in bed by {bedtime} banks ~8h before your {state.alarm.time} alarm.
      </div>

      <div style={{ background: 'var(--cream)', borderRadius: 20, padding: '16px 18px', marginTop: 16, color: 'var(--ink)' }}>
        <Micro color="var(--olive)">TONIGHT'S CHECKLIST</Micro>
        {CHECKLIST.map((item, i) => {
          const done = state.checklistDone.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: i === 0 ? 14 : 12, width: '100%' }}
            >
              {done ? (
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    background: 'var(--olive)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                  }}
                >
                  <CheckIcon />
                </span>
              ) : (
                <span style={{ width: 24, height: 24, borderRadius: 999, border: '1.5px solid rgba(38,32,25,0.35)', flex: 'none' }} />
              )}
              <div style={{ fontSize: 14, flex: 1 }}>{item.label}</div>
              <div className="mono" style={{ fontSize: 10, color: done ? 'var(--olive)' : 'rgba(38,32,25,0.5)' }}>
                +2
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ background: 'var(--blue)', borderRadius: 18, padding: '14px 16px', marginTop: 12, color: 'var(--ink)' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '1px', color: 'rgba(38,32,25,0.65)' }}>
          TOMORROW'S FIRST RING
        </div>
        <div style={{ fontSize: 18, marginTop: 6 }}>
          {state.alarm.time} · in {ringsIn(state.alarm.time, now)}
        </div>
      </div>

      <Spacer />
      <PrimaryButton onClick={startSleepMode}>i'm in bed — start sleep mode</PrimaryButton>
      <FooterNote>HYGIENE POINTS COUNT TOWARD THE WEEKLY BOARD</FooterNote>
    </Phone>
  );
}
