import { Micro, Phone, PrimaryButton, Spacer } from '../components/ui';
import { useGame } from '../store';

const STEPS = [
  {
    title: 'squad up',
    body: "make a squad and set your alarms. everyone sees tomorrow's lineup.",
  },
  {
    title: 'beat the first ring',
    body: 'wake on time for +10. every snooze is −5, and posts your status to the squad.',
  },
  {
    title: 'keep the streak',
    body: 'climb the weekly board, build no-snooze streaks, and actually get to bed on time.',
  },
];

export function Splash() {
  const { go, update } = useGame();
  const skipToHome = () => {
    update((s) => ({ ...s, onboarded: true }));
    go('home');
  };
  return (
    <Phone pad={24}>
      <div style={{ display: 'flex', gap: 14, marginTop: 22 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'var(--yellow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-6deg)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              fill="none"
              stroke="#26201a"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'var(--blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(4deg)',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 26 26">
            <circle cx="13" cy="13" r="10.5" fill="none" stroke="#26201a" strokeWidth="2.2" />
            <path d="M13 7.5v6l4 2.6" fill="none" stroke="#26201a" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
        <div
          className="mono"
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'var(--alarm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-3deg)',
            fontSize: 14,
            color: 'var(--ink)',
            letterSpacing: 1,
          }}
        >
          zzz
        </div>
      </div>
      <div style={{ fontSize: 46, lineHeight: 1.02, letterSpacing: '-0.8px', marginTop: 30 }}>
        snooze<span style={{ color: 'var(--alarm)' }}>u</span>lose
      </div>
      <Micro color="var(--yellow)" style={{ letterSpacing: '2px', marginTop: 12 }}>
        THE SOCIAL ALARM GAME
      </Micro>
      <div style={{ fontSize: 15, lineHeight: 1.55, color: 'rgba(245,236,220,0.68)', marginTop: 14 }}>
        wake up on the first ring — or your whole squad finds out. better mornings, played with
        friends, family and coworkers.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 28 }}>
        {STEPS.map((step, i) => (
          <div key={step.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div
              className="mono"
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                border: '1px solid rgba(245,236,220,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                flex: 'none',
              }}
            >
              {i + 1}
            </div>
            <div>
              <div style={{ fontSize: 16 }}>{step.title}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--cream-60)', marginTop: 3 }}>
                {step.body}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Spacer />
      <PrimaryButton onClick={() => go('squadUp')}>start playing</PrimaryButton>
      <button className="link-under" onClick={skipToHome}>
        already in a squad? sign in
      </button>
      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: '1.4px',
          color: 'var(--cream-40)',
          textAlign: 'center',
          margin: '6px 0 16px',
        }}
      >
        FREE · RUNS IN YOUR BROWSER
      </div>
    </Phone>
  );
}
