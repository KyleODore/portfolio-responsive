const assert = require("node:assert/strict");
const { readFileSync, readdirSync, statSync } = require("node:fs");
const { join, relative } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const root = join(__dirname, "..");
const dist = join(root, "dist");
const scriptSource = readFileSync(join(dist, "js", "main.js"), "utf8");

function htmlFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory()
      ? htmlFiles(path)
      : path.endsWith(".html")
        ? [path]
        : [];
  });
}

function createElement() {
  const classes = new Set();
  return {
    attributes: {},
    listeners: {},
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    addEventListener(name, callback) {
      this.listeners[name] = callback;
    },
  };
}

function loadBrowser({ rejectClipboard = false } = {}) {
  const elements = {
    menuBtn: createElement(),
    menu: createElement(),
    menuBranding: createElement(),
    menuNav: createElement(),
    copyPopup: createElement(),
    copyHeading: createElement(),
  };
  const selectors = new Map([
    [".menu-btn", elements.menuBtn],
    [".menu", elements.menu],
    [".menu-branding", elements.menuBranding],
    [".menu-nav", elements.menuNav],
    ["#copy-popup", elements.copyPopup],
    ["#copy-popup-h3", elements.copyHeading],
  ]);
  const ids = new Map([
    ["copy-popup", elements.copyPopup],
    ["copy-popup-h3", elements.copyHeading],
  ]);
  const context = {
    document: {
      querySelector: (selector) => selectors.get(selector),
      querySelectorAll: () => [],
      getElementById: (id) => ids.get(id),
    },
    navigator: {
      clipboard: {
        writeText: () => rejectClipboard
          ? Promise.reject(new Error("Clipboard unavailable"))
          : Promise.resolve(),
      },
    },
    setTimeout: () => {},
  };
  vm.runInNewContext(scriptSource, context);
  return { context, elements };
}

test("clipboard failure marks the message heading and displays the error", async () => {
  const { context, elements } = loadBrowser({ rejectClipboard: true });
  context.copyToClipboard("email");
  await Promise.resolve();
  await Promise.resolve();

  assert.equal(elements.copyHeading.classList.contains("failed"), true);
  assert.equal(elements.copyPopup.classList.contains("failed"), false);
  assert.equal(elements.copyPopup.classList.contains("hidden"), false);
  assert.equal(elements.copyHeading.innerText, "Couldn't copy the text. Please try again");
});

test("clipboard success clears a previous error state", async () => {
  const { context, elements } = loadBrowser();
  elements.copyHeading.classList.add("failed");
  context.copyToClipboard("email");
  await Promise.resolve();
  await Promise.resolve();

  assert.equal(elements.copyHeading.classList.contains("failed"), false);
  assert.equal(elements.copyHeading.innerText, "Copied: kyleodore@gmail.com");
});

test("menu button exposes its expanded state", () => {
  const { elements } = loadBrowser();
  elements.menuBtn.listeners.click();
  assert.equal(elements.menuBtn.attributes["aria-expanded"], "true");
  elements.menuBtn.listeners.click();
  assert.equal(elements.menuBtn.attributes["aria-expanded"], "false");
});

for (const path of htmlFiles(dist)) {
  const name = relative(dist, path);
  const html = readFileSync(path, "utf8");

  test(`${name}: navigation is keyboard and screen-reader accessible`, () => {
    assert.match(
      html,
      /<button class="menu-btn" type="button" aria-label="Toggle navigation" aria-controls="primary-navigation" aria-expanded="false">/,
    );
    assert.match(html, /<nav class="menu" id="primary-navigation" aria-label="Primary">/);
    assert.equal((html.match(/<span class="btn-line"><\/span>/g) || []).length, 3);
    assert.doesNotMatch(html, /<div class="btn-line">/);

    const currentLink = html.match(/<li class="nav-item current">\s*<a\s+([^>]+)>/);
    assert.ok(currentLink, "current navigation item should exist");
    assert.match(currentLink[1], /aria-current="page"/);
  });

  test(`${name}: new-window destinations prevent opener access`, () => {
    const targets = html.match(/<(?:a|form)\b[^>]*target="_blank"[^>]*>/g) || [];
    for (const target of targets) {
      assert.match(target, /rel="noopener noreferrer"/);
    }
  });

  test(`${name}: footer copyright is current`, () => {
    assert.match(html, /Copyright &copy; 2026/);
  });
}

test("social icon links have accessible names", () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  assert.match(html, /<a href="https:\/\/www\.linkedin\.com\/in\/kodore\/" aria-label="LinkedIn">/);
  assert.match(html, /<a href="https:\/\/github\.com\/KyleODore\/" aria-label="GitHub">/);
});
