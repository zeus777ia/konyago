const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function loadEscapeHtml(source) {
  const match = source.match(/function escapeHtml\(value\)\s*\{[\s\S]*?\n  \}/);
  assert.ok(match, "escapeHtml helper must exist");
  const context = vm.createContext({});
  vm.runInContext(`${match[0]}; this.escapeHtml = escapeHtml;`, context);
  return context.escapeHtml;
}

test("exchange-rate metadata is encoded before the ticker HTML sink", () => {
  const source = read("assets/js/borsa.js");
  const escapeHtml = loadEscapeHtml(source);

  assert.equal(
    escapeHtml(`<img src=x onerror="alert(1)">&'`),
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;&#39;"
  );
  assert.match(source, /escapeHtml\(data\.apiTime\)/);
});

test("pharmacy names and districts are encoded at every HTML sink", () => {
  const source = read("assets/js/nobetci.js");
  const escapeHtml = loadEscapeHtml(source);

  assert.equal(escapeHtml("Güven & <Merkez>"), "Güven &amp; &lt;Merkez&gt;");
  for (const expression of [
    "escapeHtml(it.name)",
    "escapeHtml(it.ilce)",
    "escapeHtml(D.label || \"\")",
    "escapeHtml(k)",
    "escapeHtml(n)",
    "escapeHtml(D.sourceNote || \"\")"
  ]) {
    assert.ok(source.includes(expression), `${expression} must guard a sink`);
  }
});

test("privileged GitHub Actions are pinned to full commit SHAs", () => {
  for (const relativePath of [
    ".github/workflows/favicons.yml",
    ".github/workflows/pages.yml"
  ]) {
    const source = read(relativePath);
    assert.doesNotMatch(source, /^\s*-?\s*uses:\s*[^\s]+@v\d+\s*$/m);
    for (const line of source.split(/\r?\n/).filter((item) => item.includes("uses:"))) {
      assert.match(line, /@[0-9a-f]{40}(?:\s+#\s+v\d+(?:\.\d+){0,2})?\s*$/);
    }
  }

  assert.match(
    read(".github/workflows/pages.yml"),
    /persist-credentials:\s*false/
  );
});

test("Mixpanel uses an immutable bundle with browser integrity metadata", () => {
  const source = read("assets/js/mixpanel.js");

  assert.doesNotMatch(source, /mixpanel-2-latest/);
  assert.match(
    source,
    /mixpanel-browser@2\.81\.0\/dist\/mixpanel\.umd\.js/
  );
  assert.match(source, /s\.integrity\s*=\s*"sha(?:256|384|512)-[A-Za-z0-9+/=]+"/);
  assert.match(source, /s\.crossOrigin\s*=\s*"anonymous"/);
  assert.match(source, /s\.referrerPolicy\s*=\s*"no-referrer"/);
});
