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
const buttons = Array.from({length: 3}, (_, i) => ({
  name: 'tier-' + i,
  focus() { active = this; },
  scrollIntoView() { scrolls++; }
}));
const grid = {
  addEventListener(type, fn) { handlers[type] = fn; },
  querySelectorAll() { return buttons; }
};
const document = {
  getElementById(id) { return id === 'tierGrid' ? grid : null; },
  querySelector() { return null; }
};
vm.runInNewContext(inline, {document, location: {hash: ''}, history: {replaceState() {}}});
assert.equal(typeof handlers.keydown, 'function');
function key(k, target = active) {
  handlers.keydown.call(grid, {key:k, target, preventDefault() { prevented++; }});
}
active = buttons[0];
key('ArrowRight'); assert.equal(active, buttons[1]);
key('ArrowDown'); assert.equal(active, buttons[2]);
key('ArrowRight'); assert.equal(active, buttons[2], 'boundary clamps');
key('Home'); assert.equal(active, buttons[0]);
key('End'); assert.equal(active, buttons[2]);
key('ArrowLeft'); assert.equal(active, buttons[1]);
const before = prevented;
key('Enter'); assert.equal(prevented, before, 'native activation is preserved');
key('ArrowRight', {name:'unrelated'}); assert.equal(prevented, before, 'unrelated targets ignored');
assert.equal(scrolls, 6);
console.log('PASS: keyboard tier focus moves among enabled territories without selecting or launching.');
