const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor() {
    this.listeners = {};
    this.attributes = {};
    this.classList = {
      open: false,
      toggle: (name) => (this.classList[name] = !this.classList[name]),
      remove: (name) => { this.classList[name] = false; }
    };
  }

  addEventListener(event, handler) {
    this.listeners[event] = handler;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  click() {
    this.listeners.click();
  }
}

function loadNavigation() {
  const toggle = new Element();
  const nav = new Element();
  const link = new Element();
  nav.querySelectorAll = () => [link];

  vm.runInNewContext(fs.readFileSync('script.js', 'utf8'), {
    document: {
      querySelector: (selector) => selector === '.menu-toggle' ? toggle : nav
    }
  });

  return { link, nav, toggle };
}

test('menu toggle opens and closes navigation while updating aria-expanded', () => {
  const { nav, toggle } = loadNavigation();

  toggle.click();
  assert.equal(nav.classList.open, true);
  assert.equal(toggle.attributes['aria-expanded'], 'true');

  toggle.click();
  assert.equal(nav.classList.open, false);
  assert.equal(toggle.attributes['aria-expanded'], 'false');
});

test('following a navigation link closes the mobile menu', () => {
  const { link, nav, toggle } = loadNavigation();
  nav.classList.open = true;
  toggle.attributes['aria-expanded'] = 'true';

  link.click();

  assert.equal(nav.classList.open, false);
  assert.equal(toggle.attributes['aria-expanded'], 'false');
});
