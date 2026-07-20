import { Avatar, FooterNote, Phone, Pill, PrimaryButton, Spacer, Toggle } from '../components/ui';
import { useGame } from '../store';

export function SocialStatus() {
  const { state, go, update } = useGame();
  const timeLabel = state.alarm.time.toUpperCase();

  return (
    <Phone>
      <div style={{ fontSize: 27, letterSpacing: '-0.3px' }}>your status, everywhere</div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--cream-60)', marginTop: 6 }}>
        the moment you dismiss — or snooze — snoozeulose posts your wake-up status where your people
        will see it.
      </div>

      <div style={{ background: 'var(--cream)', borderRadius: 20, padding: '14px 16px', marginTop: 16, color: 'var(--ink)' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '1.2px', color: 'var(--ink-55)' }}>
          PREVIEW
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
          <Avatar size={30} surface="cream" />
          <div style={{ fontSize: 14, flex: 1 }}>shaun d.</div>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(38,32,25,0.5)' }}>
            via snoozeulose
          </div>
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.45, marginTop: 10 }}>
          up on the first ring. day {state.streak}. good morning.
        </div>
        <Pill tone="olive" style={{ marginTop: 10 }}>
          +10 · FIRST RING{state.sharing.exactWakeTime ? ` · ${timeLabel}` : ''}
        </Pill>
      </div>

      <div style={{ border: '1px solid var(--cream-border)', borderRadius: 18, marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
          <div>
            <div style={{ fontSize: 14.5 }}>squad feed</div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.8px', color: 'var(--cream-45)', marginTop: 2 }}>
              ALWAYS ON — IT'S THE GAME
            </div>
          </div>
          <Toggle on locked label="squad feed" />
        </div>
        <div className="row-line" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
          <div>
            <div style={{ fontSize: 14.5 }}>work chat status</div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.8px', color: 'var(--cream-45)', marginTop: 2 }}>
              "UP SINCE {timeLabel}" BY YOUR NAME
            </div>
          </div>
          <Toggle
            on={state.sharing.workChat}
            label="work chat status"
            onToggle={() => update((s) => ({ ...s, sharing: { ...s.sharing, workChat: !s.sharing.workChat } }))}
          />
        </div>
        <div className="row-line" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
          <div>
            <div style={{ fontSize: 14.5 }}>story auto-post</div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.8px', color: 'var(--cream-45)', marginTop: 2 }}>
              DAILY WAKE CARD TO YOUR STORY
            </div>
          </div>
          <Toggle
            on={state.sharing.storyAutoPost}
            label="story auto-post"
            onToggle={() => update((s) => ({ ...s, sharing: { ...s.sharing, storyAutoPost: !s.sharing.storyAutoPost } }))}
          />
        </div>
      </div>

      <Spacer />
      <PrimaryButton
        onClick={() => {
          update((s) => ({ ...s, accountsConnected: true }));
          go('you');
        }}
      >
        {state.accountsConnected ? 'accounts connected ✓' : 'connect accounts'}
      </PrimaryButton>
      <FooterNote>SNOOZES POST TOO. THAT'S THE POINT.</FooterNote>
    </Phone>
  );
}
