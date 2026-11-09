'use strict';
// Keyboard-focus containment regression for the actual inline World Atlas handler.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const inline = [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/g)].map(m => m[1]).join('\n');
assert(inline.includes("getElementById('worldAtlas')"), 'Production Atlas focus handler exists');
const handlers = {};
let active = null, prevented = 0;
function button(name) {
  return { name, getClientRects: () => [1], closest: () => null, focus() { active = this; } };
}
const first = button('close'), middle = button('previous'), last = button('next');
const atlas = {
  hidden: false,
  addEventListener(type, fn) { handlers[type] = fn; },
  querySelectorAll() { return [first, middle, last]; },
  contains(el) { return [first, middle, last].includes(el); },
  focus() { active = this; }
};
const document = {
  getElementById(id) { return id === 'worldAtlas' ? atlas : null; },
  querySelector() { return null; },
  get activeElement() { return active; }
};
vm.runInNewContext(inline, {document, Array, location: {hash: ''}, history: {replaceState() {}}});
assert.equal(typeof handlers.keydown, 'function');
function tab(shiftKey = false) {
  const e = {key: 'Tab', shiftKey, preventDefault() { prevented++; }};
  handlers.keydown.call(atlas, e);
}
active = last; tab(); assert.equal(active, first, 'Tab wraps last to first');
active = first; tab(true); assert.equal(active, last, 'Shift+Tab wraps first to last');
active = middle; tab(); assert.equal(active, middle, 'Middle focus remains native');
active = null; tab(); assert.equal(active, first, 'Focus outside returns to first');
atlas.hidden = true; active = last; tab(); assert.equal(active, last, 'Hidden modal does not intercept focus');
assert.equal(prevented, 3);
console.log('PASS: World Atlas modal keyboard focus wraps without trapping focus while closed.');
