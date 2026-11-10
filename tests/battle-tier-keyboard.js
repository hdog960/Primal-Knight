'use strict';
// Exercise the production inline tier-grid handler, not a copied algorithm.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
assert(html.includes('style.css?v=0.15.30-footer-clearance'), 'iPhone must fetch refreshed Battle layout CSS');
assert(/@media \(orientation:landscape\) and \(max-height:460px\)[\s\S]*?\.tier-lobby \.lobby-footer\s*\{[^}]*padding:7px max\(10px,env\(safe-area-inset-right\)\) max\(10px,env\(safe-area-inset-bottom\)\) max\(10px,env\(safe-area-inset-left\)\)/.test(css), 'landscape launch footer must clear the iPhone bottom safe area');
assert(/\.tier-lobby:not\(\[hidden\]\) \.lobby-content\s*\{[^}]*padding-bottom:calc\(76px \+ env\(safe-area-inset-bottom\)\)/s.test(css), 'touch scrolling must leave room below the final Battle controls');
const landscapeDetail = css.slice(css.indexOf('short-landscape Battle detail containment'));
assert(landscapeDetail.includes('max-height:460px') && landscapeDetail.includes('max-width:950px'), 'landscape containment is scoped to short mobile viewports');
assert(/\.tier-vista-card\s*\{[^}]*overflow:hidden;[^}]*isolation:isolate;/s.test(landscapeDetail), 'landscape territory artwork must not overlap adjacent content');
assert(/\.siege-guard-buttons\s*\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s.test(landscapeDetail), 'landscape rest controls have two bounded columns');
assert(html.includes('style.css?v=0.15.30-footer-clearance'), 'new stylesheet must reach Home Screen installs');
const inline = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
assert(inline.includes("getElementById('tierGrid')?.addEventListener('keydown'"));
const handlers = {};
let active = null, scrolls = 0, prevented = 0;
const buttons = Array.from({length: 6}, (_, i) => ({
  name: 'tier-' + i,
  focus() { active = this; },
  scrollIntoView() { scrolls++; },
  closest() { return null; },
  hidden: false
}));
const grid = {
  addEventListener(type, fn) { handlers[type] = fn; },
  querySelectorAll() { return buttons; }
};
const document = {
  getElementById(id) { return id === 'tierGrid' ? grid : null; },
  querySelector() { return null; }
};
vm.runInNewContext(inline, {document, getComputedStyle() { return {gridTemplateColumns: '100px 100px 100px'}; }, location: {hash: ''}, history: {replaceState() {}}});
assert.equal(typeof handlers.keydown, 'function');
function key(k, target = active, modifiers = {}) {
  handlers.keydown.call(grid, {key:k, target, ...modifiers, preventDefault() { prevented++; }});
}
active = buttons[0];
key('ArrowRight'); assert.equal(active, buttons[1]);
key('ArrowDown'); assert.equal(active, buttons[4], 'down follows three-column grid');
key('ArrowUp'); assert.equal(active, buttons[1], 'up returns to same column');
key('ArrowLeft'); assert.equal(active, buttons[0]);
key('Home'); assert.equal(active, buttons[0]);
key('End'); assert.equal(active, buttons[5]);
key('ArrowRight'); assert.equal(active, buttons[5], 'boundary clamps');
key('ArrowUp'); assert.equal(active, buttons[2]);
const before = prevented;
key('Enter'); assert.equal(prevented, before, 'native activation is preserved');
key('ArrowRight', {name:'unrelated'}); assert.equal(prevented, before, 'unrelated targets ignored');
assert.equal(scrolls, 8);
for (const modifier of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey']) {
  const previous = active, count = prevented;
  key('ArrowRight', active, {[modifier]: true});
  assert.equal(active, previous, modifier + ' preserves browser shortcut');
  assert.equal(prevented, count);
}
buttons[1].hidden = true;
active = buttons[0];
key('ArrowRight'); assert.equal(active, buttons[2], 'hidden tier skipped');
buttons[1].hidden = false;
console.log('PASS: keyboard tier focus moves among enabled territories without selecting or launching.');
