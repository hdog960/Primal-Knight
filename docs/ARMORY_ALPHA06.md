# Primal KnIght – Onslaught | Alpha 0.6: Forge & Armory

## Delivered

- Replaced the old card list with an illustrated hero equipment layout. Weapon is positioned to the left, armor to the right, and charm below the lone defender. All three slots show their current item, rarity and enhancement rank, or an empty placeholder.
- Each equipment slot opens a dedicated category-filtered inventory screen, while **Open Full Inventory** shows every item. Inventory is organized by rarity, highest tier first, then enhancement rank.
- Every inventory item has Equip, Upgrade, and Sell actions. Equipped items cannot be sold, including during bulk selling. Unequip from a category screen to empty its slot.
- Salvage counter shows checkboxes for all nine rarities and selects any number of them. **Sell selected rarities** applies across all equipment categories, displays the count and total Gold before selling, and asks for confirmation.
- Individual sales pay Gold immediately; enhanced or high-rarity items request confirmation. Undo Last Sale restores the immediately preceding sale if sufficient Gold and inventory space remain.
- Gold proceeds are based on item rarity and a partial refund for enhancements. Existing local save key is unchanged. All upgrades, battles, rune sockets and tier progression remain available.
- No external runtime dependencies or paid services.

## Safety and implementation

Equipped items are protected both by disabled buttons and server-independent game logic checking `p.equipped`. Bulk sales inspect the full inventory and exclude equipped items. The item removal and currency grant are persisted together via the existing local save mechanism. Existing save files load without migrations.

## Tests

Run `node tests/smoke.js` and `python tests/browser_armory.py` (browser script uses installed Playwright/Chromium). Visual browser coverage includes desktop, iPhone landscape and iPhone portrait; interaction checks cover category drawer, rarity sorting, individual sales, multi-category bulk sales, undo, empty slots and equipping.
