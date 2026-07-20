import { useRef } from 'react';
import { FooterNote, Micro, Phone, Radio, Spacer, TabBar, Toggle } from '../components/ui';
import { previewKlaxon } from '../lib/sound';
import { useGame } from '../store';
import type { SoundId } from '../store';

const SOUNDS: { id: SoundId; label: string; note?: string }[] = [
  { id: 'sunrise-klaxon', label: 'sunrise klaxon' },
  { id: 'rooster-mode', label: 'rooster mode' },
  { id: 'gentle-rise', label: 'gentle rise' },
  { id: 'squad-voice-note', label: 'squad voice note', note: 'RECORDED BY TIAH' },
];

export function SoundSettings() {
  const { state, update } = useGame();
  const trackRef = useRef<HTMLDivElement>(null);
  const volumePct = Math.round(state.alarm.volume * 100);

  const setVolumeFromPointer = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const volume = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    update((s) => ({ ...s, alarm: { ...s.alarm, volume: Math.round(volume * 20) / 20 } }));
  };

  return (
    <Phone>
      <Micro>SETTINGS · SOUND</Micro>
      <div style={{ fontSize: 27, letterSpacing: '-0.3px', marginTop: 6 }}>sound</div>

      <div style={{ background: 'var(--cream)', borderRadius: 20, padding: '4px 0', marginTop: 16, color: 'var(--ink)' }}>
        {SOUNDS.map((sound, i) => {
          const selected = state.alarm.sound === sound.id;
          return (
            <div key={sound.id}>
              {i > 0 && <div style={{ height: 1, background: 'var(--ink-line)', margin: '0 16px' }} />}
              <button
                onClick={() => update((s) => ({ ...s, alarm: { ...s.alarm, sound: sound.id } }))}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', width: '100%' }}
              >
                <Radio selected={selected} surface="cream" />
                <div style={{ fontSize: 14.5, flex: 1 }}>{sound.label}</div>
                {sound.note ? (
                  <div className="mono" style={{ fontSize: 9.5, letterSpacing: '1px', color: 'var(--rust)' }}>
                    {sound.note}
                  </div>
                ) : selected ? (
                  <span
                    className="pill"
                    role="button"
                    style={{ fontSize: 9.5, background: 'var(--olive)', color: 'var(--cream)', padding: '3px 9px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      previewKlaxon(state.alarm.volume);
                    }}
                  >
                    ▸ PREVIEW
                  </span>
                ) : (
                  <div className="mono" style={{ fontSize: 9.5, letterSpacing: '1px', color: 'rgba(38,32,25,0.5)' }}>
                    ▸
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ border: '1px solid var(--cream-border)', borderRadius: 18, padding: '14px 16px', marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Micro>VOLUME</Micro>
          <div className="mono" style={{ fontSize: 10, color: 'var(--cream-45)' }}>
            {volumePct}%
          </div>
        </div>
        <div
          ref={trackRef}
          role="slider"
          aria-label="volume"
          aria-valuenow={volumePct}
          aria-valuemin={0}
          aria-valuemax={100}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setVolumeFromPointer(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.buttons > 0) setVolumeFromPointer(e.clientX);
          }}
          style={{ height: 8, borderRadius: 999, background: 'rgba(245,236,220,0.15)', marginTop: 12, position: 'relative', cursor: 'pointer', touchAction: 'none' }}
        >
          <div style={{ width: `${volumePct}%`, height: 8, borderRadius: 999, background: 'var(--yellow)' }} />
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              background: 'var(--cream)',
              position: 'absolute',
              top: -7,
              left: `calc(${volumePct}% - 11px)`,
            }}
          />
        </div>
        <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.8px', color: 'var(--cream-45)', marginTop: 12 }}>
          RAMPS UP UNTIL YOU'RE VERTICAL
        </div>
      </div>

      <div style={{ border: '1px solid var(--cream-border)', borderRadius: 18, marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px' }}>
          <div style={{ fontSize: 14.5 }}>vibration</div>
          <Toggle
            on={state.alarm.vibration}
            label="vibration"
            onToggle={() => update((s) => ({ ...s, alarm: { ...s.alarm, vibration: !s.alarm.vibration } }))}
          />
        </div>
        <div className="row-line" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px' }}>
          <div>
            <div style={{ fontSize: 14.5 }}>louder every snooze</div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.8px', color: 'var(--cream-45)', marginTop: 2 }}>
              +10% PER SNOOZE
            </div>
          </div>
          <Toggle
            on={state.alarm.louderEverySnooze}
            label="louder every snooze"
            onToggle={() => update((s) => ({ ...s, alarm: { ...s.alarm, louderEverySnooze: !s.alarm.louderEverySnooze } }))}
          />
        </div>
        <div className="row-line" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px' }}>
          <div>
            <div style={{ fontSize: 14.5 }}>quiet hours</div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.8px', color: 'var(--cream-45)', marginTop: 2 }}>
              NO PREVIEWS 10 PM – {state.alarm.time.toUpperCase()}
            </div>
          </div>
          <Toggle
            on={state.alarm.quietHours}
            label="quiet hours"
            onToggle={() => update((s) => ({ ...s, alarm: { ...s.alarm, quietHours: !s.alarm.quietHours } }))}
          />
        </div>
      </div>

      <Spacer />
      <FooterNote>VOICE NOTES: LET THE SQUAD RECORD YOUR ALARM</FooterNote>
      <TabBar active="you" />
    </Phone>
  );
}
