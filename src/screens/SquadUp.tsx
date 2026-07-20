import { useState } from 'react';
import { Avatar, Micro, Phone, Pill, PrimaryButton, Spacer } from '../components/ui';
import { useGame } from '../store';

const MEMBERS = [
  { initial: 't', name: 'tiah s.', joined: true },
  { initial: 'l', name: 'larry w.', joined: true },
  { initial: 't', name: 'timothy s.', joined: false },
];

export function SquadUp() {
  const { state, go, update } = useGame();
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://snoozeulose.app/j/earlybirds');
    } catch {
      // clipboard unavailable: the flash still confirms the tap
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Phone>
      <div style={{ fontSize: 27, letterSpacing: '-0.3px' }}>make your squad</div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--cream-60)', marginTop: 6 }}>
        friends, family, coworkers — anyone you don't want catching you snoozing.
      </div>
      <Micro style={{ marginTop: 20 }}>SQUAD NAME</Micro>
      <input
        value={state.squadName}
        onChange={(e) => update((s) => ({ ...s, squadName: e.target.value }))}
        aria-label="squad name"
        style={{
          height: 50,
          border: '1px solid rgba(245,236,220,0.25)',
          borderRadius: 14,
          padding: '0 16px',
          fontSize: 16,
          marginTop: 8,
          background: 'transparent',
          color: 'var(--cream)',
          outline: 'none',
          width: '100%',
        }}
      />
      <div style={{ border: '1px solid var(--cream-border)', borderRadius: 18, padding: '14px 16px', marginTop: 14 }}>
        <Micro>MEMBERS · 3 OF 10</Micro>
        {MEMBERS.map((member) => (
          <div key={member.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <Avatar initial={member.initial} />
            <div style={{ fontSize: 14.5, flex: 1 }}>{member.name}</div>
            {member.joined ? (
              <Pill tone="olive" style={{ fontSize: 9.5, padding: '3px 9px' }}>
                JOINED
              </Pill>
            ) : (
              <Pill outline="rgba(245,236,220,0.35)" style={{ fontSize: 9.5, padding: '3px 9px', color: 'rgba(245,236,220,0.7)' }}>
                INVITE SENT
              </Pill>
            )}
          </div>
        ))}
      </div>
      <div
        style={{
          border: '1px dashed rgba(245,236,220,0.3)',
          borderRadius: 14,
          padding: '12px 14px',
          marginTop: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 11,
            color: 'rgba(245,236,220,0.65)',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          snoozeulose.app/j/earlybirds
        </div>
        <Pill tone="blue" onClick={copyLink} style={{ padding: '5px 11px' }}>
          {copied ? 'COPIED ✓' : 'COPY LINK'}
        </Pill>
      </div>
      <Spacer />
      <PrimaryButton onClick={() => go('alarmEditor')}>continue</PrimaryButton>
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
        SQUADS OF 2–10 WORK BEST
      </div>
    </Phone>
  );
}
