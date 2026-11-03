# Alpha 0.9.0 — The Thirty-Tier Expansion

## Release objective
**Target:** approximately 1,250 hours for a dedicated player to finish all 30 territories, claim their 10,000-wave victories, complete the finite masteries, and collect the new Dominion seals. This is a **design target**, not an experimentally established completion-time measurement.

Existing players keep the same save key: `primal_knight_onslaught_save_v1`. Existing training, research, legacy, equipment, cosmetics, milestones, and progress are retained. If Tier XVI wave 20 was already beaten in an old save, Tier XVII unlocks automatically.

## Progression structure
- **30 tiers**, 10,000 waves each, for 300,000 potential wave victories.
- **Tiers I–XVI** retain wave-20 next-tier unlocks. The original milestone rewards remain.
- **Tiers XVII–XX** unlock the next tier at wave 100.
- **Tiers XXI–XXIV** unlock at wave 150.
- **Tiers XXV–XXIX** unlock at wave 250.
- Tier XXX is the last territory. Every tier still has its separate wave 10,000 victory and cosmetic banner.
- Base tiers: 33 milestones each, including eight added early milestones; Outer Dominions: 44 each, including eleven extra unique Trial milestones. **1,144 one-time tier milestones** across the game.
- Original Waystones and new 9,000 checkpoint reduce frustration on re-entry. Milestone Sigils are rewarded only once per tier; checkpoints cannot re-award skipped milestones.

## First Watch — first 12.5 active hours
The goal is deliberately frequent *early* wins, with a smoothly widening gap between permanent reward chapters. A chapter requires both elapsed **active combat time** and a minimum number of **first-time wave victories**; leaving the game idle or replaying an easy checkpoint does not advance the chapter alone.

| Chapter | Active minutes | Chapter | Active minutes |
|---|---:|---|---:|
| First Blood | 3 | Banner of the Dawn | 108 |
| The First Standard | 7 | Unyielding | 147 |
| A Warrior Awakens | 13 | The Iron Promise | 195 |
| Bastion Keeper | 22 | The First Citadel | 253 |
| The Spoils of Courage | 35 | Bearer of the Standard | 322 |
| A Rising Star | 53 | Veteran of the March | 403 |
| The Dawn Vanguard | 77 | Oath of the Defender | 498 |
| — | — | Before the Long Road | 609 |
| — | — | The First Watch Complete | 750 |

The first rewards include Gold, Essence, skill points, rune upgrades, equipment, Sigils and collectible banners. The intervals (3, 4, 6, 9, 13, 18, 24, 31, 39, 48, 58, 69, 81, 95, 111, 141 minutes) never shrink.

## Fourteen Outer Dominion Trials and Crests
Each new territory has its own name, Trial lore, enemy trait (armored, swift, elite, or crushing), and four-stage permanent Crest earned at waves 250, 1,000, 5,000, and 10,000. A Crest has a distinct stat bonus; in addition each earned seal grants **3% global damage** and **1% fortress health** through Dominion Resonance. A maximum of 56 seals supports the true endgame. Each Crest also appears in the new Power → Training archive.

| Tier | Territory | Crest |
|---|---|---|
| XVII | Bloodglass Frontier | Glassheart |
| XVIII | Moonveil Catacombs | Moonveil |
| XIX | Sunforged Divide | Sunforged |
| XX | Thorned Crown | Thorncrown |
| XXI | Gloamwater Depths | Gloamwater |
| XXII | Shattered Zenith | Zenith |
| XXIII | Dreadroot Wilds | Dreadroot |
| XXIV | The Hollow Star | Hollow Star |
| XXV | Obsidian Choir | Obsidian |
| XXVI | Thundergrave Expanse | Thundergrave |
| XXVII | The Golden Abyss | Abyssal Gold |
| XXVIII | The Fallen Pantheon | Pantheon |
| XXIX | Worldscar Dominion | Worldscar |
| XXX | The Origin Gate | Origin |

## Permanent Sovereign Oaths
Four additional 58-rank Sigil-funded progression routes open after specific Outer Dominion milestones:
- **Sovereign Blade:** Tier XVII wave 250; +1.5% hero damage per rank.
- **Sovereign Aegis:** Tier XX wave 1,000; +1.5% fortress HP per rank.
- **Sovereign Tribute:** Tier XXIV wave 2,500; +1.25% Gold, Essence and Knowledge income per rank.
- **Sovereign Judgment:** Tier XXVIII wave 5,000; +2% boss and station attack damage per rank.

These appear as a self-contained Sovereign Chamber in Power → Training. Existing Ascension and Legacy paths remain available.

## Economy analysis
The deterministic economy audit in `tests/balance.js` reports approximately:
- **189,210** one-time Sigils earned by claiming every milestone in all 30 tiers.
- **142,694** total Sigil cost for the four Sovereign Oaths.
- **31,151** for all Ascension routes.
- **5,257** for original Legacy paths.
- **179,102** total capped Sigil expenditure; about **10,108 Sigils** remain across the entire 30-tier achievement ladder.

This is intentionally much tighter than the earlier version. New permanent powers are earned by engaging with new territories rather than simply waiting for currency inflation.

## Combat validation and limitations
The deterministic Node combat suite loads `game.js` and runs real `tick` battles. It verifies:
- A representative midgame build clears Tier XIII wave 20 but falls at Tier I wave 10,000.
- A fully developed old-era build clears Tier I and Tier XVI wave 10,000 but **falls** at Tier XXX wave 10,000 without new Crest progression.
- The same advanced build, with earned Crest progression (and *without* Tier XXX's last, not-yet-earned seal), wins Tier XXX wave 10,000 across four deterministic random seeds.
- Enemy, projectile, particle, float and rune-inventory caps stay bounded for iPhone.
- Smoke tests check new milestone gates, first-time rewards, one-time claim protection, Sovereign costs/effects/caps, save migration, and all major old features.

At 2× speed, the mathematical spawn/intermission timing floor for 300,000 wave clears is about **315 active hours**. The 1,250-hour design target therefore assumes roughly **3.97×** that floor from enemy combat, retries, management, upgrading and exploring different tiers. Real-world total completion time **has not been measured** with full-length progression simulations or human playtests, and future balancing may adjust this target.

## Next QA priorities
Observe the first 5, 20, 100, 250, and 1,000 waves on real iPhone hardware; assess whether first-watch rewards feel celebrated, not intrusive; check Tier XVII transition and Sovereign Oath costs; monitor the pacing of last 3,000 waves in high-tier runs. Keep performance caps intact.
