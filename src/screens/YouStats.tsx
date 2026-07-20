import { Avatar, Micro, Phone, Pill, Spacer, TabBar } from '../components/ui';
import { useGame } from '../store';

const WEEK_BARS = [
  { height: 34, tone: 'var(--olive)' },
  { height: 40, tone: 'var(--olive)' },
  { height: 28, tone: 'var(--olive)' },
  { height: 48, tone: 'var(--rust)' },
  { height: 36, tone: 'var(--olive)' },
  { height: 12, tone: 'rgba(245,236,220,0.18)' },
  { height: 12, tone: 'rgba(245,236,220,0.18)' },
];

const SETTINGS_ROWS = [
  { label: 'social status', hint: 'CONNECTIONS', screen: 'socialStatus' },
  { label: 'sharing', hint: 'WHAT POSTS', screen: 'sharingSettings' },
  { label: 'sound', hint: 'SUNRISE KLAXON', screen: 'soundSettings' },
  { label: 'notifications', hint: 'NUDGES', screen: 'notifications' },
] as const;

export function YouStats() {
  const { state, go } = useGame();
  return (
    <Phone>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar initial="s" size={52} />
        <div>
          <div style={{ fontSize: 24, letterSpacing: '-0.3px' }}>shaun d.</div>
          <Micro style={{ fontSize: 10, letterSpacing: '1.2px', marginTop: 2 }}>
            {state.squadName.toUpperCase()} · MEMBER SINCE JUN
          </Micro>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <div style={{ flex: 1, background: 'var(--yellow)', borderRadius: 18, padding: '14px 16px', color: 'var(--ink)' }}>
          <div style={{ fontSize: 34, lineHeight: 1 }}>{state.points}</div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '1px', color: 'rgba(38,32,25,0.65)', marginTop: 8 }}>
            PTS THIS WEEK
          </div>
        </div>
        <div style={{ flex: 1, background: 'var(--cream)', borderRadius: 18, padding: '14px 16px', color: 'var(--ink)' }}>
          <div style={{ fontSize: 34, lineHeight: 1 }}>6:31</div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '1px', color: 'rgba(38,32,25,0.65)', marginTop: 8 }}>
            AVG WAKE (AM)
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <div style={{ flex: 1, border: '1px solid var(--cream-border)', borderRadius: 18, padding: '14px 16px' }}>
          <div style={{ fontSize: 34, lineHeight: 1 }}>1</div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--cream-50)', marginTop: 8 }}>
            SNOOZE THIS MONTH
          </div>
        </div>
        <div style={{ flex: 1, border: '1px solid var(--cream-border)', borderRadius: 18, padding: '14px 16px' }}>
          <div style={{ fontSize: 34, lineHeight: 1 }}>92%</div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--cream-50)', marginTop: 8 }}>
            HYGIENE SCORE
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid var(--cream-border)', borderRadius: 18, padding: '14px 16px', marginTop: 12 }}>
        <Micro>THIS WEEK'S WAKE-UPS</Micro>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 56, marginTop: 12 }}>
          {WEEK_BARS.map((bar, i) => (
            <div key={i} style={{ flex: 1, height: bar.height, background: bar.tone, borderRadius: '6px 6px 0 0' }} />
          ))}
        </div>
        <div className="mono" style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 9, color: 'var(--cream-45)' }}>
          {['m', 't', 'w', 't', 'f', 's', 's'].map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              {d}
            </div>
          ))}
        </div>
        <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.8px', color: 'var(--cream-45)', marginTop: 10 }}>
          GREEN = FIRST RING · RED = SNOOZED · BAR = MINUTES TO DISMISS
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <Pill outline="rgba(245,236,220,0.3)" style={{ padding: '6px 12px', color: 'rgba(245,236,220,0.75)' }}>
          FIRST RING CLUB ×5
        </Pill>
        <Pill outline="rgba(245,236,220,0.3)" style={{ padding: '6px 12px', color: 'rgba(245,236,220,0.75)' }}>
          NO-SNOOZE WEEK
        </Pill>
        <Pill outline="rgba(245,236,220,0.3)" style={{ padding: '6px 12px', color: 'rgba(245,236,220,0.75)' }}>
          EARLY BIRD
        </Pill>
      </div>

      <div style={{ border: '1px solid var(--cream-border)', borderRadius: 18, marginTop: 12 }}>
        {SETTINGS_ROWS.map((row, i) => (
          <div key={row.screen}>
            {i > 0 && <div className="row-line" />}
            <button
              onClick={() => go(row.screen)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', width: '100%' }}
            >
              <div style={{ fontSize: 14.5 }}>{row.label}</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--cream-45)' }}>
                {row.hint} →
              </div>
            </button>
          </div>
        ))}
      </div>

      <Spacer />
      <TabBar active="you" />
    </Phone>
  );
}
