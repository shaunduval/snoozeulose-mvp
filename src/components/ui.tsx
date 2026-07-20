import type { CSSProperties, ReactNode } from 'react';
import { useGame } from '../store';

type Surface = 'dark' | 'cream';

/** Full-height mobile screen, centered at phone width on desktop. */
export function Phone({
  bg = 'var(--screen)',
  color = 'var(--cream)',
  pad = 22,
  children,
}: {
  bg?: string;
  color?: string;
  pad?: number;
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: '100dvh', background: bg }}>
      <div
        style={{
          minHeight: '100dvh',
          maxWidth: 446,
          margin: '0 auto',
          background: bg,
          color,
          display: 'flex',
          flexDirection: 'column',
          padding: `calc(env(safe-area-inset-top, 0px) + 40px) ${pad}px calc(env(safe-area-inset-bottom, 0px) + 10px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Micro({
  children,
  color = 'var(--cream-50)',
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div className="micro" style={{ color, ...style }}>
      {children}
    </div>
  );
}

const TONES: Record<string, CSSProperties> = {
  olive: { background: 'var(--olive)', color: 'var(--cream)' },
  rust: { background: 'var(--rust)', color: 'var(--cream)' },
  blue: { background: 'var(--blue)', color: 'var(--ink)' },
  yellow: { background: 'var(--yellow)', color: 'var(--ink)' },
  cream: { background: 'var(--cream)', color: 'var(--ink)' },
  ink: { background: 'var(--ink)', color: 'var(--cream)' },
};

export function Pill({
  tone,
  outline,
  children,
  style,
  onClick,
}: {
  tone?: keyof typeof TONES;
  outline?: string;
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  const base: CSSProperties = tone
    ? TONES[tone]
    : { border: `1px solid ${outline ?? 'rgba(245,236,220,0.3)'}` };
  const El = onClick ? 'button' : 'div';
  return (
    <El className="pill" style={{ ...base, ...style }} onClick={onClick}>
      {children}
    </El>
  );
}

export function Toggle({
  on,
  onToggle,
  locked,
  surface = 'dark',
  label,
}: {
  on: boolean;
  onToggle?: () => void;
  locked?: boolean;
  surface?: Surface;
  label: string;
}) {
  const offBg = surface === 'dark' ? 'rgba(245,236,220,0.18)' : 'rgba(38,32,25,0.18)';
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={locked}
      onClick={onToggle}
      style={{
        width: 46,
        height: 28,
        borderRadius: 999,
        background: on ? 'var(--olive)' : offBg,
        position: 'relative',
        flex: 'none',
        opacity: locked ? 0.55 : 1,
        cursor: locked ? 'default' : 'pointer',
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          background: 'var(--cream)',
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          transition: 'left .15s',
        }}
      />
    </button>
  );
}

export function Radio({ selected, surface = 'dark' }: { selected: boolean; surface?: Surface }) {
  const active = surface === 'dark' ? 'var(--yellow)' : 'var(--olive)';
  const idle = surface === 'dark' ? 'rgba(245,236,220,0.35)' : 'rgba(38,32,25,0.35)';
  return (
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: 999,
        border: `1.5px solid ${selected ? active : idle}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
    >
      {selected && <span style={{ width: 10, height: 10, borderRadius: 999, background: active }} />}
    </span>
  );
}

/** Hatched placeholder avatar from the design ("drop in real photos later"). */
export function Avatar({
  initial,
  size = 34,
  surface = 'dark',
}: {
  initial?: string;
  size?: number;
  surface?: Surface;
}) {
  const line = surface === 'dark' ? '245,236,220' : '38,32,25';
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        border: `1px dashed rgba(${line},0.4)`,
        background: `repeating-linear-gradient(45deg, rgba(${line},0.15) 0px, rgba(${line},0.15) 3px, rgba(${line},0.03) 3px, rgba(${line},0.03) 6px)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: Math.max(10, Math.round(size / 4.3)),
        color: `rgba(${line},0.7)`,
        flex: 'none',
      }}
    >
      {initial}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  bg = 'var(--yellow)',
  color = 'var(--ink)',
  height = 54,
}: {
  children: ReactNode;
  onClick?: () => void;
  bg?: string;
  color?: string;
  height?: number;
}) {
  return (
    <button
      className="btn-primary"
      style={{ background: bg, color, height, fontSize: height >= 60 ? 20 : height >= 56 ? 18 : 17, borderRadius: height >= 60 ? 22 : 999 }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function TabBar({ active }: { active: 'alarm' | 'squad' | 'you' }) {
  const { go } = useGame();
  const tabs = [
    { id: 'alarm' as const, screen: 'home' as const },
    { id: 'squad' as const, screen: 'squad' as const },
    { id: 'you' as const, screen: 'you' as const },
  ];
  return (
    <div style={{ borderTop: '1px solid rgba(245,236,220,0.14)', height: 58, display: 'flex', flex: 'none' }}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => go(tab.screen)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              color: isActive ? 'var(--yellow)' : 'var(--cream-50)',
              fontSize: 13,
            }}
          >
            {isActive && <span style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--yellow)' }} />}
            {tab.id}
          </button>
        );
      })}
    </div>
  );
}

export function Spacer() {
  return <div style={{ flex: 1, minHeight: 16 }} />;
}

export function FooterNote({ children, color = 'var(--cream-40)' }: { children: ReactNode; color?: string }) {
  return (
    <div
      className="mono"
      style={{ fontSize: 10, letterSpacing: '1.4px', color, textAlign: 'center', margin: '12px 0 8px', flex: 'none' }}
    >
      {children}
    </div>
  );
}

export function CheckIcon({ size = 12, stroke = 'var(--cream)' }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
