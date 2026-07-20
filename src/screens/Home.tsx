import { Avatar, Micro, Phone, Spacer, TabBar, Toggle } from '../components/ui';
import { useNow } from '../hooks';
import { lightsOut, parseAlarm, ringsIn, fmtShortDate, fmtTimeOfDay } from '../lib/time';
import { SQUAD, alarmShort } from '../lib/squad';
import { useGame } from '../store';

function greeting(hour: number): string {
  if (hour >= 18 || hour < 4) return 'good night';
  if (hour < 12) return 'good morning';
  return 'good afternoon';
}

export function Home() {
  const { state, go, update } = useGame();
  const now = useNow();
  const myAlarm = parseAlarm(state.alarm.time);
  const myShort = myAlarm
    ? `${myAlarm.h % 12 === 0 ? 12 : myAlarm.h % 12}:${String(myAlarm.m).padStart(2, '0')}`
    : state.alarm.time;

  const lineup = [
    ...SQUAD.map((m) => ({ id: m.id, initial: m.initial, name: m.name, time: alarmShort(m), mine: false, sort: sortKey(m.alarm) })),
    { id: 'me', initial: 's', name: 'shaun d.', time: myShort, mine: true, sort: sortKey(state.alarm.time) },
  ].sort((a, b) => a.sort - b.sort);

  return (
    <Phone>
      <Micro>
        {fmtShortDate(now)} · {fmtTimeOfDay(now)}
      </Micro>
      <div style={{ fontSize: 27, letterSpacing: '-0.3px', marginTop: 6 }}>{greeting(now.getHours())}, shaun d.</div>

      {/* not a <button>: the toggle inside would nest buttons (invalid HTML, misroutes taps) */}
      <div style={{ background: 'var(--cream)', borderRadius: 20, padding: '18px 20px 16px', marginTop: 18, color: 'var(--ink)' }}>
        <button onClick={() => go('alarmEditor')} aria-label="edit alarm" style={{ display: 'block', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Micro color="var(--olive)">NEXT ALARM</Micro>
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: '1.2px',
                background: state.alarm.armed ? 'var(--olive)' : 'rgba(38,32,25,0.18)',
                color: state.alarm.armed ? 'var(--cream)' : 'var(--ink-55)',
                borderRadius: 999,
                padding: '4px 10px',
              }}
            >
              {state.alarm.armed ? 'ARMED' : 'OFF'}
            </div>
          </div>
          <div style={{ fontSize: 54, lineHeight: 1.05, letterSpacing: '-1px', marginTop: 8 }}>{state.alarm.time}</div>
          <div style={{ fontSize: 14, color: 'var(--ink-65)', marginTop: 4 }}>
            first ring in {ringsIn(state.alarm.time, now, state.alarm.repeat)}
          </div>
        </button>
        <div style={{ height: 1, background: 'rgba(38,32,25,0.12)', margin: '14px 0 12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13.5 }}>no-snooze mode</div>
          <Toggle
            on={state.alarm.noSnooze}
            surface="cream"
            label="no-snooze mode"
            onToggle={() => update((s) => ({ ...s, alarm: { ...s.alarm, noSnooze: !s.alarm.noSnooze } }))}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <div style={{ flex: 1, background: 'var(--yellow)', borderRadius: 18, padding: '14px 16px', color: 'var(--ink)' }}>
          <div style={{ fontSize: 38, lineHeight: 1 }}>{state.streak}</div>
          <div style={{ fontSize: 13, marginTop: 2 }}>day streak</div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '1px', color: 'rgba(38,32,25,0.65)', marginTop: 10 }}>
            +10 ON FIRST RING
          </div>
        </div>
        <button
          onClick={() => go('windDown')}
          style={{ flex: 1, background: 'var(--blue)', borderRadius: 18, padding: '14px 16px', color: 'var(--ink)' }}
        >
          <div className="mono" style={{ fontSize: 10, letterSpacing: '1px', color: 'rgba(38,32,25,0.65)' }}>
            WIND-DOWN
          </div>
          <div style={{ fontSize: 18, marginTop: 8 }}>
            lights out <span style={{ whiteSpace: 'nowrap' }}>{lightsOut(state.alarm.time)}</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(38,32,25,0.7)', marginTop: 4 }}>banks ~8h before your alarm</div>
        </button>
      </div>

      <div style={{ border: '1px solid var(--cream-border)', borderRadius: 18, padding: 16, marginTop: 12 }}>
        <Micro>THE SQUAD TONIGHT</Micro>
        <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
          {lineup.map((member) => (
            <div key={member.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
              <Avatar initial={member.initial} size={40} />
              <div style={{ fontSize: 11.5, whiteSpace: 'nowrap' }}>{member.name}</div>
              <div className="mono" style={{ fontSize: 10, color: member.mine ? 'var(--yellow)' : 'var(--cream-50)' }}>
                {member.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Spacer />
      <TabBar active="alarm" />
    </Phone>
  );
}

function sortKey(alarm: string): number {
  const clock = parseAlarm(alarm);
  return clock ? clock.h * 60 + clock.m : 0;
}
