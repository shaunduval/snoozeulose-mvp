# snoozeulose

The social alarm game. Wake on the first ring, or the whole squad finds out.

MVP web app built from the claude.ai/design mockup (16 screens, dark mode, Geomini). Squad members are simulated client-side; the alarm engine, scoring, streaks, and wake check are real.

## Run it

```
bun install
bun dev        # http://localhost:3000
bun test       # vitest
bun run build  # typecheck + production build
```

## How scoring works

- +10 for dismissing on the first ring, streak +1
- -5 per snooze, and it posts "snoozing…" to your squad
- 1 snooze: streak survives. 2+: streak resets
- Wake check: 3 math sprints before you're officially up

## QA helpers

- `?ring=1` fires the alarm immediately on load
- `?screen=<name>` deep-links any screen (splash, home, squad, you, firstRing, wakeCheck, snoozeAftermath, victory, weeklyRecap, windDown, alarmEditor, squadUp, socialStatus, sharingSettings, soundSettings, notifications)

State persists in localStorage under `snoozeulose:v1`. Clear it to replay onboarding.
