import { FooterNote, Micro, Phone, Radio, Spacer, TabBar, Toggle } from '../components/ui';
import { useGame } from '../store';
import type { SharingSettings as Sharing } from '../store';

const AUDIENCES: { id: Sharing['audience']; label: string; note?: string }[] = [
  { id: 'squad', label: 'squad only', note: '4 PEOPLE' },
  { id: 'connected', label: 'squad + connected accounts' },
  { id: 'public', label: 'public profile', note: 'BRAVE' },
];

export function SharingSettingsScreen() {
  const { state, update } = useGame();
  const set = (patch: Partial<Sharing>) =>
    update((s) => ({ ...s, sharing: { ...s.sharing, ...patch } }));

  return (
    <Phone>
      <Micro>SETTINGS · SHARING</Micro>
      <div style={{ fontSize: 27, letterSpacing: '-0.3px', marginTop: 6 }}>what gets shared</div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--cream-60)', marginTop: 6 }}>
        choose what your statuses say. accountability works best with everything on.
      </div>

      <div style={{ border: '1px solid var(--cream-border)', borderRadius: 18, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px' }}>
          <div>
            <div style={{ fontSize: 14.5 }}>first-ring wins</div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.8px', color: 'var(--cream-45)', marginTop: 2 }}>
              "+10 · FIRST RING" POSTS
            </div>
          </div>
          <Toggle
            on={state.sharing.firstRingWins}
            label="first-ring wins"
            onToggle={() => set({ firstRingWins: !state.sharing.firstRingWins })}
          />
        </div>
        <div className="row-line" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px' }}>
          <div>
            <div style={{ fontSize: 14.5 }}>snoozes</div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.8px', color: 'var(--rust)', marginTop: 2 }}>
              LOCKED ON — IT'S THE GAME
            </div>
          </div>
          <Toggle on locked label="snoozes" />
        </div>
        <div className="row-line" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px' }}>
          <div>
            <div style={{ fontSize: 14.5 }}>streak milestones</div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.8px', color: 'var(--cream-45)', marginTop: 2 }}>
              EVERY 5 DAYS
            </div>
          </div>
          <Toggle
            on={state.sharing.streakMilestones}
            label="streak milestones"
            onToggle={() => set({ streakMilestones: !state.sharing.streakMilestones })}
          />
        </div>
        <div className="row-line" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px' }}>
          <div>
            <div style={{ fontSize: 14.5 }}>exact wake time</div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.8px', color: 'var(--cream-45)', marginTop: 2 }}>
              OFF POSTS "THIS MORNING" INSTEAD
            </div>
          </div>
          <Toggle
            on={state.sharing.exactWakeTime}
            label="exact wake time"
            onToggle={() => set({ exactWakeTime: !state.sharing.exactWakeTime })}
          />
        </div>
      </div>

      <Micro style={{ marginTop: 18 }}>WHO SEES IT</Micro>
      <div style={{ border: '1px solid var(--cream-border)', borderRadius: 18, marginTop: 10 }}>
        {AUDIENCES.map((audience, i) => (
          <div key={audience.id}>
            {i > 0 && <div className="row-line" />}
            <button
              onClick={() => set({ audience: audience.id })}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', width: '100%' }}
            >
              <Radio selected={state.sharing.audience === audience.id} />
              <div style={{ fontSize: 14.5, flex: 1 }}>{audience.label}</div>
              {audience.note && (
                <div className="mono" style={{ fontSize: 10, color: 'var(--cream-45)' }}>
                  {audience.note}
                </div>
              )}
            </button>
          </div>
        ))}
      </div>

      <Spacer />
      <FooterNote>YOU CAN'T MUTE YOUR OWN SNOOZES</FooterNote>
      <TabBar active="you" />
    </Phone>
  );
}
