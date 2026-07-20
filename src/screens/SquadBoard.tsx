import { Avatar, Micro, Phone, Pill, Spacer, TabBar } from '../components/ui';
import { useNow } from '../hooks';
import { weekNumber } from '../lib/time';
import { SQUAD, memberPost, memberPostVisible, timothyAwake } from '../lib/squad';
import { useGame } from '../store';

interface BoardRow {
  id: string;
  name: string;
  initial: string;
  score: number;
  tag: string;
  tagTone: 'olive' | 'rust' | 'muted';
  you?: boolean;
}

export function SquadBoard() {
  const { state, go } = useGame();
  const now = useNow();

  const rows: BoardRow[] = [
    ...SQUAD.map((m) => ({
      id: m.id,
      name: m.name,
      initial: m.initial,
      score: m.score,
      tag: m.id === 'timothy' && timothyAwake(now) ? 'FINALLY UP TODAY' : m.boardTag,
      tagTone: (m.id === 'timothy' && timothyAwake(now) ? 'muted' : m.boardTagTone) as BoardRow['tagTone'],
    })),
    {
      id: 'me',
      name: 'shaun d.',
      initial: 's',
      score: state.points,
      tag: `${state.streak}-DAY STREAK`,
      tagTone: 'olive' as const,
      you: true,
    },
  ].sort((a, b) => b.score - a.score);

  const tagColor = (tone: BoardRow['tagTone']) =>
    tone === 'olive' ? 'var(--olive)' : tone === 'rust' ? 'var(--rust)' : 'rgba(38,32,25,0.55)';

  const feed = [
    ...SQUAD.filter((m) => memberPostVisible(m, now)).map((m) => {
      const post = memberPost(m, now);
      return { id: m.id, name: m.name, initial: m.initial, time: m.postTime, ...post };
    }),
    ...state.myPosts.map((p) => ({ id: p.id, name: 'shaun d.', initial: 's', time: p.time, text: p.text, badge: p.badge, tone: p.tone })),
  ];

  return (
    <Phone>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 27, letterSpacing: '-0.3px' }}>{state.squadName}</div>
        <button className="mono" onClick={() => go('weeklyRecap')} style={{ flex: 'none', marginLeft: 10 }}>
          <Micro style={{ fontSize: 10, letterSpacing: '1.2px', whiteSpace: 'nowrap' }}>
            WEEK {weekNumber(now)} · RESETS SUN
          </Micro>
        </button>
      </div>

      <div style={{ background: 'var(--cream)', borderRadius: 20, marginTop: 10, color: 'var(--ink)', padding: '4px 0' }}>
        {rows.map((row, i) => (
          <div key={row.id}>
            {i > 0 && <div style={{ height: 1, background: 'var(--ink-line)', margin: '0 16px' }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px' }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-55)', width: 14 }}>
                {i + 1}
              </div>
              <Avatar initial={row.initial} surface="cream" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 15 }}>{row.name}</div>
                  {row.you && (
                    <Pill tone="yellow" style={{ fontSize: 9, letterSpacing: '0.8px', padding: '2px 7px' }}>
                      YOU
                    </Pill>
                  )}
                </div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.8px', color: tagColor(row.tagTone), marginTop: 2 }}>
                  {row.tag}
                </div>
              </div>
              <div style={{ fontSize: 20 }}>{row.score}</div>
            </div>
          </div>
        ))}
      </div>

      <Micro style={{ marginTop: 12 }}>THIS MORNING</Micro>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {feed.length === 0 && (
          <div style={{ fontSize: 13.5, color: 'var(--cream-45)', padding: '10px 2px' }}>
            quiet so far. first alarm is tiah's at 6:00.
          </div>
        )}
        {feed.map((post) => (
          <div
            key={post.id + post.time}
            style={{ background: 'var(--card-dark)', border: '1px solid var(--cream-line)', borderRadius: 16, padding: '10px 12px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar initial={post.initial} size={28} />
              <div style={{ fontSize: 13.5, flex: 1 }}>{post.name}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--cream-45)' }}>
                {post.time}
              </div>
            </div>
            <div style={{ fontSize: 14.5, lineHeight: 1.45, color: 'var(--cream-88)', marginTop: 8 }}>{post.text}</div>
            <Pill tone={post.tone} style={{ marginTop: 10 }}>
              {post.badge}
            </Pill>
          </div>
        ))}
      </div>

      <Spacer />
      <TabBar active="squad" />
    </Phone>
  );
}
