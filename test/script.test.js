const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

function createClassList() {
  const classes = new Set();
  return {
    contains: (name) => classes.has(name),
    remove: (name) => classes.delete(name),
    toggle: (name) => {
      if (classes.has(name)) {
        classes.delete(name);
        return false;
      }
      classes.add(name);
      return true;
    },
  };
}

function createElement() {
  const listeners = new Map();
  const attributes = new Map();
  return {
    classList: createClassList(),
    addEventListener: (event, callback) => listeners.set(event, callback),
    dispatch: (event) => listeners.get(event)?.(),
    getAttribute: (name) => attributes.get(name),
    setAttribute: (name, value) => attributes.set(name, value),
  };
}

function setupNavigation() {
  const toggle = createElement();
  const nav = createElement();
  const links = [createElement(), createElement()];
  nav.querySelectorAll = () => links;
  vm.runInNewContext(script, {
    document: {
      querySelector: (selector) => ({ '.menu-toggle': toggle, nav })[selector] || null,
    },
  });
  return { links, nav, toggle };
}

test('menu button opens and closes navigation while updating its accessibility state', () => {
  const { nav, toggle } = setupNavigation();

  toggle.dispatch('click');
  assert.equal(nav.classList.contains('open'), true);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');

  toggle.dispatch('click');
  assert.equal(nav.classList.contains('open'), false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
});

test('selecting a navigation link closes the mobile menu', () => {
  const { links, nav, toggle } = setupNavigation();

  toggle.dispatch('click');
  links[0].dispatch('click');

  assert.equal(nav.classList.contains('open'), false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
});

test('script tolerates pages without navigation controls', () => {
  assert.doesNotThrow(() => vm.runInNewContext(script, {
    document: { querySelector: () => null },
  }));
});
