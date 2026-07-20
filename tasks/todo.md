# snoozeulose mockup MVP — todo

Plan: ~/.claude/plans/create-a-mobile-mockup-snoopy-boot.md

- [x] git init + feature branch `feat/mockup-mvp`
- [x] Build index.html: shell, tokens, tab switching
- [x] State object + crew renderers (leaderboard + feed from ledger data)
- [x] Splash / how-to-play screen
- [x] Home screen (alarm card, wind-down, ticker, demo trigger, reset)
- [x] Alarm overlay: ringing state, snooze branch, hold-to-rise branch, result states
- [x] You tab (profile, badges, sleep hygiene, wake chart, wind-down toggle)
- [x] Motion + microcopy polish
- [x] Browser verification at 375 and 430 widths (checklist in plan)
- [x] Commit

## Review

Shipped as a single self-contained index.html (~840 lines), zero dependencies.
Verified in the browser at 375px and 430px, no console errors:

- Splash explains the 4 rules and transitions into the app.
- Leaderboard and feed render from one state object, so the demo alarm's
  outcomes stay consistent everywhere (tested both branches).
- Snooze: −20 pts, streak broken, shame post auto-tops the feed, shaun
  drops to 5 pts. Rise (press-and-hold 1.2s, early release cancels): +15
  pts, streak 4, shaun overtakes timothy at 40 pts. Reset demo restores
  the seeded week.
- Reaction chips, crew segmented control, wind-down toggle all work.
- All avatars/illustrations are blank gray shapes. Brand lowercase
  everywhere. No emojis in UI copy.

Known mockup shortcuts (intentional): alarm "edit" is a dead affordance,
state resets on page reload, "rings in 5 min" is static fiction.
