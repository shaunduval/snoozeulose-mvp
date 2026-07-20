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
- [ ] git init, scaffold on main, feature branch
- [ ] Vite/TS/PWA scaffold + design tokens (styles.css)
- [ ] Shared components: Phone, Micro, Pill, Toggle, Avatar, TabBar, PrimaryButton
- [ ] Core logic: time utils, game transitions, wake-check generator, klaxon sound
- [ ] Store: context + localStorage persistence
- [ ] Screens 01-16 wired: splash → squad up → alarm editor → home; tabs alarm/squad/you; ring → wake check → victory; snooze → aftermath loop; settings screens off the You tab
- [ ] Vitest: time utils, scoring/streak transitions, wake check
- [ ] bun install, typecheck, build, tests green
- [ ] Browser QA: walk every screen, screenshot key flows
- [ ] Review section below

## Review

(pending)
