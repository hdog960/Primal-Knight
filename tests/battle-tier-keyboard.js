'use strict';
// Exercise the production inline tier-grid handler, not a copied algorithm.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
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
