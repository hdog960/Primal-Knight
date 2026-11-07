# Alpha 0.15.7 — Expedition Readiness & Tier III Earned Routes

The existing 0.15.6 run demonstrated First Watch Chapter V through genuine tier switching, but it did not examine equipment/runes and the next legitimately unlocked realm.

**Playable improvement:** The Battle tier lobby reveals a compact, collapsible Expedition Readiness board only after the *actual claimed* Fifth First Watch chapter. It uses current inventory, equipped slots, unused owned runes, pending equipment/rune reserves, real Field Quartermaster training quotes, and Tier III unlock state. Buttons open existing Equipment, Rune Workshop and Training panels or safely prepare legitimately unlocked Tier III. The board never purchases, equips, sockets, grants currency, manufactures wave clears or starts combat. No new character-save fields and no changed balance/combat/reward mechanics. Artwork remains the original game's bronze and charcoal UI, responsive to one column on iPhone with 44px minimum tap targets.

**Test:** `tests/first-watch-expedition.js` uses a *clearly labelled synthetic fixture* exclusively to test the visibility and costs of the board, not as evidence that chapter five has been earned. It separately runs real, deterministic engine-backed multi-territory cohorts: two seeds × two post-V routing policies × 12 genuine sieges each, with original-price permanent spending, real Tier I→II→III unlocks, finite chapter/Sigil accounting, and original character save/reload. After genuinely earning Chapter V, each character equips their *original earned* Chapter III gear and sockets the *original earned* Chapter V Frost Rune through actual UI actions before comparing holding Tier II against trying Tier III. No manufactured resources, free item grants or fabricated timers. Results may differ by seeded policy; never call this a guaranteed win.

**QA:** 76 mandatory checks including JavaScript syntax (75 preserved). CI on PR, merge, repeat main-branch CI, verify GitHub Pages. The 750-minute full Watch, mid/endgame economy, 1,250-hour target and physical iPhone acceptance remain open; as requested, manual iPhone acceptance happens only after the locked Alpha 0.15 development work is complete.

## CI-confirmed earned Tier III findings (not synthetic)
The passed 76-check PR run executed two RNG seeds × two post-Chapter-V policies × **twelve real consecutive engine-backed sieges each** (48 total). Each character earned the Fifth First Watch chapter and legally unlocked Tier III through Tier II wave 20. Both policies used the same original paid early permanent training, equipped their **genuinely earned** Chapter III equipment reward and socketed the original **genuinely earned** Tier-2 Frost Rune from Chapter V using live game actions. Only the final two siege destinations differed: continue Tier II or switch to newly unlocked Tier III.

| Seed | Route | Genuine total distinct wave clears | First Watch chapters | Active minutes | Tier I / II / III earned best | Ending Essence |
|---|---|---:|---:|---:|---|---:|
| 15411 | Hold Tier II | 66 | 5 | 110.37 | 33 / 33 / 0 | 3,493 |
| 15411 | Enter Tier III | 97 | 6 | 108.78 | 33 / 32 / 32 | 4,093 |
| 15423 | Hold Tier II | 66 | 5 | 108.80 | 33 / 33 / 0 | 3,513 |
| 15423 | Enter Tier III | 98 | 6 | 107.61 | 33 / 32 / 33 | 4,337 |

The sixth First Watch chapter threshold is 53 active minutes **and** 80 unique first-time cleared waves. Both Tier III policies crossed that clear threshold, whereas both Tier II-only routes repeated already cleared waves and remained at 66 total first clears. The engine awarded each chapter and finite milestone Sigil once, and all selected tier, socket, equipment, active-combat time and First Watch data survived original-format reload. No live rewards or prices were adjusted.

**Scope and limitations:** These are scripted deterministic policies, two seeds, twelve attempts, and the existing fixed spending order, not a general promise that Tier III will always be easier. The observed extra chapters are from real new first-cleared waves; gear and rune were selected in *both* groups, so this comparison does **not** isolate or quantify the effect of individual gear/rune choices. Money balances are observed outcomes, not a verified complete economy. Mid/late-game affordability, the full 750-minute First Watch and 1,250-active-hour completion are unverified. Physical iPhone visual and endurance acceptance stays deferred at player request.
