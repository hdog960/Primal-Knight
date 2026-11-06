# Alpha 0.12.27 — Tactical Contrast Lens

## Real playable implementation
Players can tap **LENS** directly beside the existing FPS button during a siege or before starting a tier. The default **OFF** state preserves the existing region-painted backgrounds, boss staging, native banners, detailed weather and original enemy HP markers exactly as in Alpha 0.12.26.

The optional **ON** mode uses a single static `rgba(9,17,27,.34)` rectangle behind the moving enemies and in front of the painted battlefield/weather/boss stage. Enemy sprite and fortress art order remains unchanged. Actual living-enemy HP bars gain larger width, six-pixel instead of four-pixel height, an almost-black bar base and brighter role-specific health colors; they still accurately represent the same `e.hp / e.max` without altering stats. Specialist telegraphs, boss charge warnings and the cast/wall focus beacons remain visible. No extra animated particles, new frames, network assets, enemy spawns or added combat complexity.

The 44px touch-friendly control reports its state via `aria-pressed`, labels itself `LENS` or `LENS ON`, and can toggle instantly at any time. Preference persists only in `primal_knight_onslaught_clarity_lens_v1`, distinct from both the existing visual-quality preset and permanent character save `primal_knight_onslaught_save_v1`. A disabled or invalid preference restores the original illustrated game. No paid functionality, permanent costs, buffs, wave/reward/economy changes or offline dependencies.

## Automated acceptance and remaining device work
`tests/tactical-contrast-lens.js` runs the actual `game.js` in a Node VM. It verifies the untouched default canvas, one background-only wash when enabled, exactly enlarged/colored bars for real living unit roles, no new image allocations, instant reversal, keyboard/touch accessibility, save isolation, reload persistence and version-consistent iPhone assets. The full CI suite includes **52 mandatory checks including JS syntax**.

Physical iPhone art comparison is **not completed**. Please compare **LENS OFF** and **LENS ON** in portrait and landscape during crowded battles and use the existing 30-minute FPS/endurance panel if feasible. Browser scripts cannot certify the contrast on an OLED screen, true GPU FPS, battery draw or temperature. Alpha 0.12 remains open; locked Alpha 0.13–0.15 and the original ~1,250-hour design target are unchanged.
