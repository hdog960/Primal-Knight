'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { assetVersionAtLeast } = require('./asset-version.js');
const html = fs.readFileSync('index.html', 'utf8');
assert(html.includes('ALPHA 0.15.27'), 'Release banner is still Alpha 0.15.27');
const viewport = /<meta\s+name="viewport"\s+content="([^"]+)"/.exec(html);
assert(viewport, 'mobile viewport metadata exists');
assert(/(?:^|,)\s*viewport-fit=cover(?:,|$)/.test(viewport[1]), 'safe-area layout retained');
assert(!/(?:^|,)\s*(?:user-scalable\s*=\s*no|maximum-scale\s*=)/i.test(viewport[1]), 'browser zoom is not disabled for accessibility');
for (const asset of ['game.js', 'style.css']) {
  assert(assetVersionAtLeast(html, asset, '0.15.27'), asset + ' uses a valid, up-to-date cache key');
  for (const version of ['0.15.26', '0.14.999', 'broken', '0.15.29-!bad', '0.15.27.1']) {
    const tag = asset === 'game.js' ? 'src' : 'href';
    assert(!assetVersionAtLeast('<script ' + tag + '="' + asset + '?v=' + version + '">', asset, '0.15.27'), 'reject ' + asset + ' ' + version);
  }
  const tag = asset === 'game.js' ? 'src' : 'href';
  assert(assetVersionAtLeast('<script ' + tag + '="' + asset + '?v=0.15.29-focus-skip">', asset, '0.15.27'));
  assert(assetVersionAtLeast('<script ' + tag + '="' + asset + '?v=0.15.27">', asset, '0.15.27'));
  assert(!assetVersionAtLeast('<script ' + tag + '="' + asset + '">', asset, '0.15.27'));
  const good = '<script ' + tag + '="' + asset + '?v=0.15.29-focus-skip">';
  const stale = '<script ' + tag + '="' + asset + '?v=0.15.26">';
  assert(!assetVersionAtLeast(good + stale, asset, '0.15.27'), 'reject later stale duplicate ' + asset);
  assert(!assetVersionAtLeast(stale + good, asset, '0.15.27'), 'reject earlier stale duplicate ' + asset);
  assert(assetVersionAtLeast(good + good, asset, '0.15.27'), 'allow valid duplicate ' + asset);
}
// Battle territory selection must remain navigable without a pointer.
assert(/id="tierGrid"[^>]*role="group"[^>]*aria-label="Choose an unlocked territory tier"/.test(html), 'tier picker has a named accessible group');
assert(/id="tierHeading"[^>]*aria-live="polite"[^>]*aria-atomic="true"/.test(html), 'tier changes are announced once');
assert(/id="milestoneList"[^>]*role="region"[^>]*aria-label="Selected territory milestone rewards"[^>]*tabindex="0"/.test(html), 'milestone list can be focused and scrolled by keyboard');
// A long 30-tier list must offer a direct path to the selected territory details.
assert(/id="jumpToTierDetails"[^>]*aria-controls="tierHeading"/.test(html), 'Battle provides a direct details jump');
assert(/id="tierHeading"[^>]*tabindex="-1"/.test(html), 'selected territory heading accepts programmatic focus');
assert(/getElementById\('jumpToTierDetails'\)\?\.addEventListener\('click'/.test(html), 'jump button has a click handler');
assert(/heading\.focus\(\{preventScroll:true\}\)/.test(html) && /heading\.scrollIntoView\(\{block:'start'/.test(html), 'jump focuses and reveals the selected territory');
console.log('PASS: shared Home Screen asset-version floor, newer suffixes, invalid/stale cache keys');
