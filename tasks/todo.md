# snoozeulose MVP — build plan

## Microsite — "7:00:00" scroll-film (2026-07-20, branch `microsite`)

Concept picked via /mobile-microsite: the page is your first morning in the game. Kinetic Type, Lane A (pure code, no video credits). Lives at `microsite/index.html`, single self-contained file. CTA target: https://snoozeulose.pages.dev.

- [x] Build `microsite/index.html`: continuous film (tall driver + sticky stage, lerped playhead), chapters night → hours scrub → 7:00 ring → covers-drag station (snooze shame branch) → wake check → +10 victory → leaderboard → finale spring CTA. WOW kit: wind-down preloader, touch z-spawner, velocity grade, synthesized WebAudio sound (muted default), theme-color journey, haptics, premium finale bloom. Conversion law: clear hero offer, one CTA, fast-path pill, real scoring facts only, `window.__convert` stub. Dev contract: `?jump`/`?jumpp` + `window.__ready`. Reduced-motion static editorial fallback. Lenis on fine pointer only; hand-rolled tick (no GSAP needed for this chassis).
- [x] Serve via launch.json static server (port 4173) + `phone-shell.sh` preview
- [x] Verify: mshot beats, collision sweep (12 positions), jank --mobile, desktop shot, teaser MP4
- [x] Review pass at phone viewport; fix anything flat or colliding
- [x] Commit on `microsite` branch; offer deploy (separate Cloudflare Pages project)

Review: 15 phone screenshots + sweep read as a contact sheet. Fixed from evidence: covers mid-fade ghost (now rises opaque with the ring), RING row-2 stroke invisible on red (now cream), sound toggle colliding with the snooze pill (station raised to 12cqh), streak odometer clipping (align-items fought the roll), fixed HUD/pill floating over after-film content (film chrome now exits with the film), ringSub bleeding between shame toasts, hidden layers eating touches at opacity 0 (visibility gating). Jank at 4× CPU throttle: p95 10ms, 0 spikes after pre-rasterizing heavy layers behind the preloader (was 5 spikes from first-paint raster). Interactive drag + 2-snooze shame branch tested live: outcome propagates to victory copy, odometer (DAY 0 rust), HUD, board note, feed badge — the game's real rules render the ending. Events fire: station_complete/station_snooze/cta_view/film_complete. Teaser: 20s 9:16 MP4 via ffmpeg-static.

Design commitments: app palette (#14100d/#f5ecdc/#f2cf1d/#ee4623/#a9ced8), Geomini + Space Mono, tilted-tile logo lockup, real squad sim data (tiah/larry/timothy), real scoring (+10/−5/−15/+2, 45-min window).

## Iteration 2 — close the free-ride holes (2026-07-20)

Decisions: skip the snoozeulose.app custom domain. Client-side only, no backend yet.

- [x] Missed-ring outcome: no dismiss within 45 min of first ring → −15, streak resets, auto-posts "NO RESPONSE" to the squad. Works live (tab open) and retroactively (detected on next app open via lastResolvedDay tracking).
- [x] Catch-up ring: open the app within the 45-min window of an unhandled alarm → it rings late instead of silently skipping to tomorrow.
- [x] Honor sharing toggles: first-ring wins post only when enabled (snoozes stay locked on), streak milestone post every 5 days.
- [x] Wind-down pays: +2 per checked hygiene item when starting sleep mode, once per night.
- [x] Tests for prevOccurrence, assessAlarm, missMorning (44 total); build + browser QA (verified cold miss with idempotency guard, late ring, hygiene award); redeployed.

Iteration 2 review: the miss initially double-charged (−30) because strict mode fires mount effects twice; fixed by making applyMiss idempotent on lastResolvedDay. Occurrences before armedAt never count, so setting a new alarm can't retro-post a miss.

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
