'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { assetVersionAtLeast } = require('./asset-version.js');
const html = fs.readFileSync('index.html', 'utf8');
assert(html.includes('ALPHA 0.15.27'), 'Release banner is still Alpha 0.15.27');
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
console.log('PASS: shared Home Screen asset-version floor, newer suffixes, invalid/stale cache keys');
