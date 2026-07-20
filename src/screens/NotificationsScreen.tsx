import { FooterNote, Micro, Phone, Pill, Spacer, TabBar } from '../components/ui';
import { useGame } from '../store';

export function NotificationsScreen() {
  const { state, update } = useGame();
  const reacted = (id: string) => state.reactions[id];
  const react = (id: string) => update((s) => ({ ...s, reactions: { ...s.reactions, [id]: true } }));

  return (
    <Phone>
      <div style={{ fontSize: 27, letterSpacing: '-0.3px' }}>notifications</div>

      <Micro style={{ marginTop: 14 }}>THIS MORNING</Micro>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        <Note dot="var(--olive)" time="6:02 AM">
          tiah s. beat the first ring. +10
        </Note>
        <Note dot="var(--yellow)" time="6:31 AM">
          you're on the board — day {state.streak} locked in
        </Note>
        <div style={{ background: 'var(--card-dark)', border: '1px solid var(--cream-line)', borderRadius: 16, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--rust)', marginTop: 6, flex: 'none' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, lineHeight: 1.4 }}>larry w. snoozed once. react?</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {reacted('larry') ? (
                <Pill tone="olive" style={{ padding: '6px 12px' }}>
                  SENT ✓
                </Pill>
              ) : (
                <>
                  <Pill outline="rgba(245,236,220,0.3)" style={{ padding: '6px 12px', color: 'rgba(245,236,220,0.75)' }} onClick={() => react('larry')}>
                    HIGH-FIVE
                  </Pill>
                  <Pill outline="rgba(245,236,220,0.3)" style={{ padding: '6px 12px', color: 'rgba(245,236,220,0.75)' }} onClick={() => react('larry')}>
                    CLOWN HIM
                  </Pill>
                </>
              )}
            </div>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--cream-45)', marginTop: 8 }}>
              7:18 AM
            </div>
          </div>
        </div>
        <div style={{ background: 'var(--card-dark)', border: '1px solid var(--cream-line)', borderRadius: 16, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--blue)', marginTop: 6, flex: 'none' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, lineHeight: 1.4 }}>timothy s. is STILL snoozing ×3</div>
            <Pill tone={reacted('timothy') ? 'olive' : 'yellow'} style={{ padding: '6px 12px', marginTop: 8 }} onClick={() => react('timothy')}>
              {reacted('timothy') ? 'NUDGE SENT ✓' : 'SEND NUDGE →'}
            </Pill>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--cream-45)', marginTop: 8 }}>
              7:24 AM
            </div>
          </div>
        </div>
      </div>

      <Micro style={{ marginTop: 14 }}>TONIGHT</Micro>
      <div style={{ background: 'var(--card-dark)', border: '1px solid var(--cream-line)', borderRadius: 16, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--cream-40)', marginTop: 6, flex: 'none' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, lineHeight: 1.4 }}>
            wind-down starts 10:15 — alarm arms for {state.alarm.time}
          </div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--cream-45)', marginTop: 3 }}>
            SCHEDULED
          </div>
        </div>
      </div>
      <Spacer />
      <FooterNote>PUSH VIA PWA INSTALL — WORKS WITH THE TAB CLOSED</FooterNote>
      <TabBar active="you" />
    </Phone>
  );
}

function Note({ dot, time, children }: { dot: string; time: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--card-dark)', border: '1px solid var(--cream-line)', borderRadius: 16, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: dot, marginTop: 6, flex: 'none' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, lineHeight: 1.4 }}>{children}</div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--cream-45)', marginTop: 3 }}>
          {time}
        </div>
      </div>
    </div>
  );
}
