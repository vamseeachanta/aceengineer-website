"use strict";
/* Living-article tags: registry dates against git history, a tag on every link, tooltips that
   meet the accessibility rules, and no age computed against a fixed "today".
   Run: node --test tests/js/living-articles.test.js (needs full git history; CI checks out with fetch-depth 0). */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..", "..");
const LA = require("../../assets/js/living-article.js");
const T = require("../../scripts/living-tags.js");
const registry = T.loadRegistry();
const REPO = "aceengineer-website";

function git(...args) {
  return execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8" }).trim();
}

function utc(iso) {
  return new Date(iso).toISOString();
}

/* ---------- registry dates match git history ---------- */

test("the clone has full history (the date checks need it)", () => {
  assert.equal(git("rev-parse", "--is-shallow-repository"), "false", "fetch with fetch-depth 0");
});

for (const a of registry.articles) {
  test(`article ${a.id}: each revision's date and path match its commit`, () => {
    assert.ok(a.revisions.length > 0, "a published article has at least one revision");
    for (const r of a.revisions) {
      if (r.repo !== REPO) continue;
      const when = git("log", "-1", "--format=%aI", r.commit);
      assert.equal(utc(when), utc(r.date), `${a.id} ${r.rev}: git author date of ${r.commit.slice(0, 9)}`);
      const files = git("show", "--name-only", "--format=", r.commit).split(/\r?\n/);
      assert.ok(files.includes(r.path), `${a.id} ${r.rev}: ${r.commit.slice(0, 9)} does not touch ${r.path}`);
    }
    assert.equal(a.first_published, a.revisions[0].date, "first_published is the first revision");
    assert.equal(a.last_updated, a.revisions[a.revisions.length - 1].date, "last_updated is the last revision");
  });

  test(`article ${a.id}: every commit on its page is a revision or a listed non-content change`, () => {
    if (!a.source || a.source.repo !== REPO) return;
    const listed = new Set(a.revisions.concat(a.non_content).map((r) => r.commit));
    const commits = git("log", "--format=%H", "HEAD", "--", a.source.path).split(/\r?\n/).filter(Boolean);
    assert.ok(commits.length > 0, `${a.source.path} has history`);
    for (const h of commits) {
      assert.ok(listed.has(h), `${h.slice(0, 9)} changed ${a.source.path}: add it to the registry as a revision (with what changed and why) or as non-content`);
    }
  });
}

/* ---------- a tag on every link ---------- */

const ids = registry.articles.map((a) => a.id);
const SENT = "2026-11-25T14:00:00Z";

test("every link in the rendered list carries a side tag, on every channel", () => {
  for (const channel of ["web", "email"]) {
    const html = T.renderList(ids, registry, { channel, sentAt: SENT });
    const links = html.match(/<a\b/g) || [];
    const tags = html.match(/<\/a> <span class="la-tag"/g) || [];
    assert.equal(links.length, ids.length, channel);
    assert.equal(tags.length, links.length, `${channel}: a link without a tag`);
  }
  const text = T.renderList(ids, registry, { channel: "linkedin", sentAt: SENT });
  for (const a of registry.articles) {
    assert.ok(text.includes(`- ${a.title}: updated `), `linkedin line for ${a.id}`);
  }
});

test("checkPage finds an untagged link to a registry article and passes a filled page", () => {
  const page = '<p><a href="/newsletter/issue-002-public-data/">permits</a></p>';
  assert.equal(T.checkPage(page, registry, "https://www.aceengineer.com/newsletter/x/").length, 1);
  const filled = T.fillPage("<main><!-- living-links: 05, 01 --></main>", registry, {});
  assert.deepEqual(T.checkPage(filled, registry, "https://www.aceengineer.com/newsletter/x/"), []);
  assert.equal(T.checkPage("<!-- living-links: 05 -->", registry).length, 1, "an unfilled marker is a problem");
});

test("every site page that uses the component has a tag on every link to an earlier article", () => {
  const pages = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".html")) pages.push(p);
    }
  };
  walk(path.join(ROOT, "content"));
  for (const p of pages) {
    const html = fs.readFileSync(p, "utf8");
    if (!html.includes("living-article.css")) continue;
    const rel = path.relative(path.join(ROOT, "content"), p).split(path.sep).join("/");
    const url = "https://www.aceengineer.com/" + rel.replace(/index\.html$/, "");
    assert.deepEqual(T.checkPage(html, registry, url), [], rel);
  }
});

/* ---------- tooltips and accessibility ---------- */

test("each web mark is a button whose aria-label equals its tooltip text; no title attribute", () => {
  const html = T.renderList(ids, registry, { channel: "web" });
  assert.ok(!/\btitle="/.test(html), "the native title attribute is not used");
  const marks = [...html.matchAll(/<button type="button" class="la-mark[^"]*"[^>]*aria-label="([^"]+)">[\s\S]*?<span class="la-tip" role="tooltip" aria-hidden="true">([^<]+)<\/span><\/button>/g)];
  assert.ok(marks.length >= ids.length, "one age mark per link at least");
  for (const m of marks) assert.equal(m[1], m[2]);
  for (const k of ["prompt", "data", "revised"]) {
    assert.ok(html.includes(`class="la-mark la-${k}"`), `mark ${k} appears on the seeded list`);
  }
});

test("static channels carry a legend line with the same descriptions as the tooltips", () => {
  const html = T.renderList(["01", "05"], registry, { channel: "email", sentAt: SENT });
  assert.match(html, /<p class="la-legend"/);
  for (const k of ["age", "prompt", "data", "revised"]) {
    assert.ok(html.includes(registry.features[k].tip), `legend carries the ${k} description`);
  }
  assert.ok(!/<button/.test(html), "no buttons in e-mail");
});

test("every mark carries a word, never colour alone", () => {
  for (const [k, f] of Object.entries(registry.features)) {
    assert.match(f.label, /[a-z]/, k);
    assert.ok(f.tip.length > 20 && !/\?/.test(f.tip), `${k}: a plain statement`);
  }
  const css = fs.readFileSync(path.join(ROOT, "assets/css/living-article.css"), "utf8");
  assert.match(css, /\.la-mark:focus-visible > \.la-tip/, "opens on keyboard focus");
  assert.match(css, /\.la-mark:hover > \.la-tip/, "opens on hover");
  assert.match(css, /\[aria-expanded="true"\] > \.la-tip/, "opens on tap");
});

/* ---------- no fixed "today" ---------- */

test("the age code holds no date literal and no fixed today", () => {
  for (const f of ["assets/js/living-article.js", "scripts/living-tags.js"]) {
    const src = fs.readFileSync(path.join(ROOT, f), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    assert.ok(!/\b20\d\d-\d\d-\d\d/.test(src), `${f}: a date literal`);
    assert.ok(!/Date\.UTC\(\s*\d|new Date\(\s*\d|new Date\(\s*["']/.test(src), `${f}: a fixed date`);
  }
  const keys = JSON.stringify(registry.articles);
  assert.ok(!/"(age|age_days|days_ago|today)"/.test(keys), "the registry stores no age");
});

test("ages need an explicit now or send time", () => {
  assert.throws(() => LA.ageDays("2026-11-12T18:46:13Z"), /now is required/);
  const a = registry.articles.find((x) => x.id === "01");
  assert.throws(() => T.renderTag(a, registry, { channel: "email" }), /send time/);
  assert.equal(LA.staticAge(a.last_updated, "2026-11-15T09:00:00Z"), "updated 12 Nov 2026 (3 d before sending)");
  assert.equal(LA.staticAge(a.last_updated, "2026-12-12T09:00:00Z"), "updated 12 Nov 2026 (30 d before sending)");
});

test("the three tag forms", () => {
  assert.equal(LA.formatAge(3, "words"), "updated 3 d ago");
  assert.equal(LA.formatAge(1000, "tminus"), "T−1,000");
  assert.equal(LA.formatAge(10, "cycle"), "↻ 10 d");
  assert.equal(LA.formatAge(0), "updated today");
  assert.equal(LA.spokenAge(1), "updated 1 day ago");
  assert.throws(() => LA.formatAge(3, "other"));
});

/* A small stand-in for the DOM: enough for enhance(). */
function fakeDom(html) {
  const marks = [];
  const re = /<button type="button" class="(la-mark[^"]*)"([^>]*)>([\s\S]*?)<\/button>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = {};
    for (const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g)) attrs[a[1]] = a[2].replace(/&amp;/g, "&");
    const kids = {
      ".la-age-text": /la-age-text/.test(m[3]) ? { textContent: "" } : null,
      ".la-tip": { textContent: "" },
    };
    marks.push({
      className: m[1],
      attrs,
      handlers: {},
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      setAttribute(k, v) { this.attrs[k] = String(v); },
      querySelector(s) { return kids[s]; },
      addEventListener(t, f) { this.handlers[t] = f; },
      kids,
    });
  }
  const doc = {
    querySelectorAll(sel) {
      if (sel === ".la-mark[data-la-updated]") return marks.filter((x) => x.getAttribute("data-la-updated"));
      if (sel === ".la-mark") return marks;
      if (sel === '.la-mark[aria-expanded="true"]') return marks.filter((x) => x.getAttribute("aria-expanded") === "true");
      return [];
    },
  };
  return { doc, marks };
}

test("enhance computes the live age from the reader's now, and taps toggle the tooltip", () => {
  const html = T.renderList(["01"], registry, { channel: "web" });
  const a = fakeDom(html);
  LA.enhance(a.doc, new Date("2026-11-15T12:00:00Z"));
  const age = a.marks.find((x) => x.getAttribute("data-la-updated"));
  assert.equal(age.kids[".la-age-text"].textContent, "updated 3 d ago");
  assert.equal(age.getAttribute("aria-label"), age.kids[".la-tip"].textContent);
  const b = fakeDom(html);
  LA.enhance(b.doc, new Date("2029-08-08T12:00:00Z"));
  assert.equal(b.marks.find((x) => x.getAttribute("data-la-updated")).kids[".la-age-text"].textContent, "updated 1,000 d ago");
  const tap = a.marks[1];
  tap.handlers.click({ preventDefault() {} });
  assert.equal(tap.getAttribute("aria-expanded"), "true");
  tap.handlers.keydown({ key: "Escape" });
  assert.equal(tap.getAttribute("aria-expanded"), "false");
});
