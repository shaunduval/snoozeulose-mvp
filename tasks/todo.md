# snoozeulose MVP — build plan

Source of truth: claude.ai/design project `e8805c54` → `snoozeulose.dc.html` (16 screens).

## Decisions

- Stack: Vite + React 19 + TypeScript, bun. No router lib (state-based nav), no CSS framework (design tokens as CSS vars, shared components).
- It's a PWA per the design copy ("runs in your browser", "push via PWA install"): manifest + minimal service worker for installability. Real push needs a server, out of MVP scope.
- Squad is simulated client-side (tiah, larry, timothy from the design script). Their morning statuses derive from the real clock vs their alarm times.
- Alarm actually fires: interval engine + WebAudio klaxon. Snooze = -5 and posts to feed, dismiss = wake check (math sprint) then victory (+10 first ring, streak +1). 2+ snoozes kills the streak.
- QA helpers: `?ring=1` fires the alarm on load, `?screen=<name>` deep-links a screen.
- Dev server pinned to port 3000 (matches the /dev skill).

## Todo

- [x] Read full design doc (16 screens + props script)
- [x] git init, scaffold on main, feature branch
- [x] Vite/TS/PWA scaffold + design tokens (styles.css)
- [x] Shared components: Phone, Micro, Pill, Toggle, Avatar, TabBar, PrimaryButton
- [x] Core logic: time utils, game transitions, wake-check generator, klaxon sound
- [x] Store: context + localStorage persistence
- [x] Screens 01-16 wired: splash → squad up → alarm editor → home; tabs alarm/squad/you; ring → wake check → victory; snooze → aftermath loop; settings screens off the You tab
- [x] Vitest: time utils, scoring/streak transitions, wake check (31 tests)
- [x] bun install, typecheck, build, tests green
- [x] Browser QA: walked every screen, verified ring → wake check → victory end to end
- [x] Review section below

## Review

- All 16 design screens implemented and verified in the browser at mobile size. Geomini loads from Google Fonts; palette and copy match the design doc.
- The game is real, not a mockup: the alarm fires on schedule, the klaxon is synthesized (no audio assets), wake check is playable, scoring/streaks update the board and feed, state persists in localStorage.
- Squad members are simulated client-side per the design script; their statuses derive from the clock (timothy flips to "finally up" after 8 am).
- Found and fixed during QA: the home alarm card was a button wrapping the no-snooze toggle button (invalid nested buttons, misrouted taps). Restructured so the card is a div and only the alarm area is a button.
- QA note: the embedded browser replays prior clicks after each page load, which ghost-walked the morning flow during testing (streak inflated to 8 in the demo state). App logic is unaffected; unit tests cover the transitions. Clear localStorage to reset the demo.
- Deviations from the doc, all additive: a settings list on the You tab so screens 10-12 and 15 are reachable, snooze hidden when no-snooze mode is on, victory screen has -5/streak-lost variants for snoozed mornings.
- Not built (needs a backend): real squads/accounts, actual social posting, web push. The PWA is installable with a minimal service worker.
- Deployed to Cloudflare Pages: https://snoozeulose.pages.dev (project `snoozeulose`, production branch main). Redeploy with `bun run build && bunx wrangler pages deploy dist --project-name snoozeulose --branch main`.
