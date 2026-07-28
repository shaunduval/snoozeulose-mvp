# snoozeulose

Snoozeulose is a social alarm clock: set a time, add a squad (friends, family, coworkers, whoever), and every morning posts itself, first ring, snooze, or slept through, all of it scored. Wake on time or the whole squad finds out; that's the whole pitch. I built the mechanics behind it too: 16 screens, a real scoring engine with tests, live at snoozeulose.pages.dev.

The core build, all 16 screens, the engine, the microsite, took 1 day: July 20. Everything since has been real iteration: fixes, a new squad member, and on July 28, a live wire so one squad member reacts to your actual morning through Claude instead of a script. First backend code in this repo, first LLM call too.

## What's an MVP?

MVP means minimum viable product: the smallest real version of an idea, built to prove it works before investing more in it. This is one. Every screen is built and the scoring engine is real, not a mockup. What's still standing in is the squad: for now, squad members are simulated client-side (scripted against the clock), not real accounts other people log into. The alarm engine, scoring, streaks, and wake check are all real.

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
- No dismiss within 45 minutes: -15, streak resets, and "NO RESPONSE" posts to the squad. Detected live or retroactively on your next app open
- Open the app within the 45-minute window of a ring you weren't there for and it rings late instead of skipping to tomorrow
- Wake check: 3 math sprints before you're officially up
- Wind-down checklist pays +2 per item when you start sleep mode, once per night
- Streak milestones post every 5 days (toggle in sharing). First-ring win posts respect the sharing toggle; snoozes and misses always post

## QA helpers

- `?ring=1` fires the alarm immediately on load
- `?screen=<name>` deep-links any screen (splash, home, squad, you, firstRing, wakeCheck, snoozeAftermath, victory, weeklyRecap, windDown, alarmEditor, squadUp, socialStatus, sharingSettings, soundSettings, notifications)

State persists in localStorage under `snoozeulose:v1`. Clear it to replay onboarding.

## Microsite

`microsite/` is the scroll-film landing page ("7:00:00" — one continuous morning, scrubbed by scroll), live at https://snoozeulose-site.pages.dev. Single self-contained `index.html`; `phone.html` frames it in an iPhone shell for desktop demos. Serve locally with any static server on the `microsite/` dir (`.claude/launch.json` has a `microsite` entry, port 4173).

- QA: `?jump=<px>` or `?jumpp=<0..1>` lands pre-scrolled and settled, `?debug=1` logs a jank meter
- Deploy: `bunx wrangler pages deploy microsite --project-name snoozeulose-site --branch main`
