# Alpha 0.12.21 — Native Territorial Vanguards

## Live gameplay update
All thirty territories now field a unique **named native vanguard** in ordinary vanguard waves starting at wave 35. Each region replaces two normal troop spawn slots (indices 2 and 8) with existing enemy roles. The actual battle controller applies the current caster/specialist caps and can replace a capped specialist with a normal skeleton. This changes tactical matchups without expanding the 24-enemy battlefield or introducing new stat multipliers.

Regional native enemies carry a small golden crest painted above the original sprite. The existing Battle lobby identifies its native guard and gives a true counter (sapper fuse, frost rite, thorn ward, blink, shield guard, shaman heal, banner aura or rush attack). A native vanguard encounter has a recognizable live ribbon and name. There are no new image files, external network services, or altered save keys.

## Preserved design
Original early tutorial, 30 tiers × 10,000 waves, ten rotating factions, boss rounds and treasuries, wave rewards, the 1,144 finite milestone economy, equipment and rune ownership, and local key `primal_knight_onslaught_save_v1` remain unchanged. No paid features. Long-term 1,250-hour completion remains an unverified design target.

## QA
`tests/native-vanguards.js` checks 30 native regions, genuine nonboss vanguard replacement, specialty caps, live battlefield text, correct unit marking, no save mutation, and new mobile asset versions. Release gate now requires **46 checks including syntax**. Physical iPhone Safari/Home Screen artwork, gestures and extended battery/thermal acceptance are still outstanding; the locked 0.13–0.15 roadmap has not been advanced.
