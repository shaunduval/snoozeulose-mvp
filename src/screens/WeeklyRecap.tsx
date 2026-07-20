import { Micro, Phone, Pill, PrimaryButton, Spacer } from '../components/ui';
import { useNow } from '../hooks';
import { weekNumber } from '../lib/time';
import { SQUAD } from '../lib/squad';
import { useGame } from '../store';

export function WeeklyRecap() {
  const { state, go } = useGame();
  const now = useNow();

  const rows = [
    ...SQUAD.map((m) => ({ name: m.name, score: m.score })),
    { name: 'shaun d.', score: state.points },
  ].sort((a, b) => b.score - a.score);
  const winner = rows[0].name.split(' ')[0];

  return (
    <Phone bg="var(--yellow)" color="var(--ink)" pad={24}>
      <Micro color="rgba(38,32,25,0.65)" style={{ letterSpacing: '1.6px' }}>
        SUN · WEEK {weekNumber(now)} RECAP
      </Micro>
      <div style={{ fontSize: 40, lineHeight: 1.08, letterSpacing: '-0.8px', marginTop: 14 }}>
        {winner} takes week {weekNumber(now)}.
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.5, color: 'rgba(38,32,25,0.75)', marginTop: 10 }}>
        {state.squadName} woke on the first ring 18 of 28 times. timothy… we believe in you.
      </div>

      <div style={{ background: 'var(--ink)', borderRadius: 20, padding: '6px 0', marginTop: 20, color: 'var(--cream)' }}>
        {rows.map((row, i) => (
          <div key={row.name}>
            {i > 0 && <div className="row-line" />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px' }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--cream-50)', width: 14 }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 15, flex: 1 }}>{row.name}</div>
              {i === 0 && (
                <Pill tone="yellow" style={{ fontSize: 9.5, padding: '3px 9px' }}>
                  WINNER
                </Pill>
              )}
              <div style={{ fontSize: 18 }}>{row.score}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <Pill outline="rgba(38,32,25,0.4)" style={{ padding: '6px 12px' }}>
          BEST STREAK: TIAH ×7
        </Pill>
        <Pill outline="rgba(38,32,25,0.4)" style={{ padding: '6px 12px' }}>
          MOST SNOOZES: TIMOTHY ×9
        </Pill>
      </div>

      <Spacer />
      <PrimaryButton bg="var(--ink)" color="var(--cream)" onClick={() => go('squad')}>
        rematch — arm next week
      </PrimaryButton>
      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: '1.4px',
          color: 'rgba(38,32,25,0.6)',
          textAlign: 'center',
          margin: '12px 0 8px',
        }}
      >
        POINTS RESET AT MIDNIGHT · LOSER BUYS COFFEE
      </div>
    </Phone>
  );
}
