# Alpha 0.13.1 — Secret Guardians and Heirloom Bonds

## Secret encounter depth
The four existing optional Lost Signal waves now feature distinct *actual* unit mechanics rather than four copies of a guardian. Wave 47: Wayfinder Sentinel (shielding Guardian). Wave 147: Star-Map Courier (dash Raider). Wave 347: Reliquary Howler (fast Warg). Wave 747: Crownless Colossus (heavily armored Ogre, existing siege toughness). The four encounters keep one marked final enemy replacing one ordinary encounter spawn slot; no additional entities, new movement loops or role-cap exceptions. Each has a custom profile, colored field sigil, personal objective banner and a tactical label in the explorer chart. They are still rare, opt-in, tier-specific and one-time upon successful completion.

## Unique tier-matched heirloom identity
The four pieces earned in each territory are now a genuine one-territory set when *equipped*: at two matching pieces +4% hero damage, three pieces additionally +4% wall maximum health, four additionally +8% Knowledge from cleared waves. Only the most complete one of 30 sets can apply; switching to a piece from another tier breaks the matching threshold. All bonuses are derived from existing equipped and owned gear IDs, so no new progression/save fields exist. Battle preparation and Royal Armory show current set progress. Rewards from Alpha 0.13.0 automatically qualify.

All claimed, uniquely identified Explorer heirlooms are permanently protected from individual and bulk sales, even when unequipped. This prevents a permanent loss of gear whose source cannot be replay-farmed. Ordinary equipment may still be bought, sold and enhanced normally; the existing Gear Vault handles future full-inventory unique rewards.

## QA and remaining roadmap
New mandatory `tests/secret-guardians-bonds.js` runs real engine spawns for each of the four role archetypes, real reward claims, heirloom protection and import, cross-tier non-stacking, and actual combat damage, max-wall and cleared-wave Knowledge multipliers. The repository gate is 55 total mandatory checks including JavaScript syntax, preserving the 54 older suites.

More Alpha 0.13 optional challenges, deep discoverables, finite milestone variety and replay incentives remain planned. By the user's express instruction, no hands-on testing, screenshots or iPhone endurance review is requested until the entire locked roadmap is completed at Alpha 0.15.