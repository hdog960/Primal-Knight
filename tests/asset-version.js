'use strict';
// Shared cache-version contract for the site's Home Screen assets.
// Compare numeric release components, allowing descriptive cache-bust suffixes.
function versionParts(value) {
  const match = typeof value === 'string' && /^(\d+)\.(\d+)\.(\d+)(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?$/i.exec(value);
  return match ? match.slice(1, 4).map(Number) : null;
}
function assetVersionAtLeast(html, asset, floor) {
  if (typeof html !== 'string' || !['game.js', 'style.css'].includes(asset)) return false;
  const min = versionParts(floor);
  if (!min) return false;
  const urls = html.matchAll(/(?:href|src)="([^"]+)"/g);
  let seen = false;
  for (const found of urls) {
    const prefix = asset + '?v=';
    if (!found[1].startsWith(prefix)) continue;
    seen = true;
    const actual = versionParts(found[1].slice(prefix.length));
    if (!actual || !(actual[0] > min[0] ||
      (actual[0] === min[0] && (actual[1] > min[1] ||
        (actual[1] === min[1] && actual[2] >= min[2]))))) return false;
  }
  return seen;
}
module.exports = { assetVersionAtLeast };
