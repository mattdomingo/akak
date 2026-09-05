const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor() {
    this.listeners = {};
    this.attributes = {};
    this.classList = {
      values: new Set(),
      toggle: (name) => {
        const hasClass = this.classList.values.has(name);
        if (hasClass) this.classList.values.delete(name);
        else this.classList.values.add(name);
        return !hasClass;
      },
      remove: (name) => this.classList.values.delete(name),
      contains: (name) => this.classList.values.has(name)
    };
  }

  addEventListener(type, listener) { this.listeners[type] = listener; }
  setAttribute(name, value) { this.attributes[name] = value; }
  click() { this.listeners.click(); }
}

function loadMenuScript() {
  const toggle = new Element();
  const nav = new Element();
  const links = [new Element(), new Element()];
  nav.querySelectorAll = () => links;
  const document = {
    querySelector: (selector) => (selector === '.menu-toggle' ? toggle : nav)
  };
  vm.runInNewContext(fs.readFileSync('script.js', 'utf8'), { document });
  return { toggle, nav, links };
}

test('menu button opens navigation and updates its expanded state', () => {
  const { toggle, nav } = loadMenuScript();

  toggle.click();

  assert.equal(nav.classList.contains('open'), true);
  assert.equal(toggle.attributes['aria-expanded'], 'true');
});

test('selecting a navigation link closes an open menu', () => {
  const { toggle, nav, links } = loadMenuScript();
  toggle.click();

  links[0].click();

  assert.equal(nav.classList.contains('open'), false);
  assert.equal(toggle.attributes['aria-expanded'], 'false');
});
