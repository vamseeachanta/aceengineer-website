#!/usr/bin/env node
/* Build-time helper for living articles.
 *
 * Reads the articles registry (data/articles-registry.json) and writes:
 * - the side tag after each link to an earlier article (age plus feature marks, each mark with a
 *   tooltip on the web, or words and a legend line in static channels);
 * - the "Last updated" stamp and the version history table of an article.
 *
 * Page markers it fills:
 *   <!-- living-links: 05, 02 -->   the "Earlier articles" list with tags
 *   <!-- living-stamp: 05 -->       the "Last updated" stamp
 *   <!-- living-history: 05 -->     the version history table
 *
 * Ages: the web page gets the absolute date in the HTML and the live age from
 * assets/js/living-article.js at read time. Static channels (e-mail, LinkedIn) need the send
 * time (--sent); the text is the absolute date plus the age on the day of sending.
 * No age is ever computed against a fixed date.
 *
 * CLI:
 *   node scripts/living-tags.js list --ids 05,02 --channel web
 *   node scripts/living-tags.js list --ids 05,02 --channel email --sent 2026-11-25T14:00:00Z
 *   node scripts/living-tags.js list --ids 05,02 --channel linkedin --sent 2026-11-25T14:00:00Z
 *   node scripts/living-tags.js check content/newsletter/<page>/index.html ...
 */
"use strict";

const fs = require("fs");
const path = require("path");
const LA = require("../assets/js/living-article.js");

const REGISTRY = path.join(__dirname, "..", "data", "articles-registry.json");
const SITE = "https://www.aceengineer.com";
const CHANNELS = ["web", "email", "linkedin"];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadRegistry(file) {
  return JSON.parse(fs.readFileSync(file || REGISTRY, "utf8"));
}

function byId(registry, id) {
  const entry = registry.articles.find((a) => a.id === id);
  if (!entry) throw new Error("article " + id + " is not in the registry");
  if (!entry.url) throw new Error("article " + id + " has no public URL; it cannot be linked yet");
  return entry;
}

/* Published revisions only, oldest first. */
function publishedRevisions(entry) {
  return (entry.revisions || []).filter((r) => r.published !== false);
}

/* The base a revision is "since": the first send, or the first publication if never sent. */
function revisedSinceSent(entry) {
  const base = entry.first_sent || entry.first_published;
  if (!base) return false;
  const t = new Date(base).getTime();
  return publishedRevisions(entry).some((r) => new Date(r.date).getTime() > t);
}

/* Feature marks in a fixed order: declared features plus "revised" when it applies. */
function entryFeatures(entry, registry) {
  const order = Object.keys(registry.features).filter((k) => k !== "age");
  const have = new Set(entry.features || []);
  if (revisedSinceSent(entry)) have.add("revised");
  return order.filter((k) => have.has(k));
}

function markButton(key, feature) {
  const tip = feature.tip;
  return (
    '<button type="button" class="la-mark la-' + esc(key) + '" aria-label="' + esc(tip) + '">' +
    esc(feature.label) +
    '<span class="la-tip" role="tooltip" aria-hidden="true">' + esc(tip) + "</span></button>"
  );
}

function ageButton(entry, registry, form) {
  const f = registry.features.age;
  const when = LA.formatDate(entry.last_updated);
  const tip = "updated " + when + ". " + f.tip;
  return (
    '<button type="button" class="la-mark la-age" data-la-updated="' + esc(entry.last_updated) +
    '" data-la-form="' + esc(form) + '" data-la-tip="' + esc(f.tip) + '" aria-label="' + esc(tip) + '">' +
    '<span class="la-age-text">updated ' + esc(when) + "</span>" +
    '<span class="la-tip" role="tooltip" aria-hidden="true">' + esc(tip) + "</span></button>"
  );
}

function requireSent(opts) {
  if (!opts || !opts.sentAt) {
    throw new Error("a static channel needs the send time (sentAt); ages are never taken from a fixed date");
  }
  return opts.sentAt;
}

/* One side tag for one linked article. */
function renderTag(entry, registry, opts) {
  const o = opts || {};
  const channel = o.channel || "web";
  const form = o.form || registry.default_form || "cycle";
  if (CHANNELS.indexOf(channel) < 0) throw new Error("unknown channel: " + channel);
  const keys = entryFeatures(entry, registry);
  if (channel === "web") {
    const marks = keys.map((k) => markButton(k, registry.features[k]));
    return '<span class="la-tag">' + [ageButton(entry, registry, form)].concat(marks).join("") + "</span>";
  }
  const sent = requireSent(o);
  const parts = [LA.staticAge(entry.last_updated, sent, form)].concat(keys.map((k) => registry.features[k].label));
  if (channel === "linkedin") return parts.join("; ");
  return (
    '<span class="la-tag" style="font-family:Arial,sans-serif;font-size:12px;color:#5a6b76;">' +
    parts.map(esc).join(" &middot; ") + "</span>"
  );
}

/* The legend: the same descriptions as the tooltips, in words. */
function legendText(registry, keys) {
  return keys.map((k) => registry.features[k].tip).join(" ");
}

function renderList(ids, registry, opts) {
  const o = opts || {};
  const channel = o.channel || "web";
  const entries = ids.map((id) => byId(registry, id));
  const used = new Set();
  entries.forEach((e) => entryFeatures(e, registry).forEach((k) => used.add(k)));
  const legendKeys = ["age"].concat(Object.keys(registry.features).filter((k) => used.has(k)));
  const heading = o.heading || "Earlier articles";
  if (channel === "linkedin") {
    const lines = entries.map((e) => "- " + e.title + ": " + renderTag(e, registry, o) + "\n  " + e.url);
    return heading + "\n" + lines.join("\n") + "\n" + legendText(registry, legendKeys) + "\n";
  }
  const items = entries
    .map((e) => '<li><a href="' + esc(e.url) + '">' + esc(e.title) + "</a> " + renderTag(e, registry, o) + "</li>")
    .join("\n");
  const showLegend = channel !== "web" || o.legend === true;
  const legend = showLegend
    ? '\n<p class="la-legend"' + (channel === "email" ? ' style="font-family:Arial,sans-serif;font-size:12px;color:#5a6b76;"' : "") +
      ">" + esc(legendText(registry, legendKeys)) + "</p>"
    : "";
  return '<ul class="la-list" data-la-list>\n' + items + "\n</ul>" + legend;
}

function renderStamp(entry) {
  const pub = publishedRevisions(entry);
  const last = pub[pub.length - 1];
  const bits = ['Last updated <time datetime="' + esc(entry.last_updated) + '">' + esc(LA.formatDate(entry.last_updated)) + "</time>"];
  if (last && last.rev) bits.push("revision " + esc(last.rev));
  if (entry.first_sent) bits.push("first sent " + esc(LA.formatDate(entry.first_sent)));
  bits.push('<a href="#version-history">version history</a>');
  return '<p class="la-stamp">' + bits.join(" &middot; ") + "</p>";
}

function renderHistory(entry) {
  const rows = publishedRevisions(entry)
    .slice()
    .reverse()
    .map((r) =>
      "<tr><td>" + esc(r.rev) + '</td><td><time datetime="' + esc(r.date) + '">' + esc(LA.formatDate(r.date)) +
      "</time></td><td>" + esc(r.change) + "</td><td>" + esc(r.reason) + "</td></tr>")
    .join("\n");
  return (
    '<table class="la-history" id="version-history"><caption>Version history</caption>\n' +
    "<thead><tr><th>Revision</th><th>Date</th><th>What changed</th><th>Why</th></tr></thead>\n<tbody>\n" +
    rows + "\n</tbody></table>"
  );
}

const MARKER = /<!--\s*living-(links|stamp|history):\s*([^>]*?)\s*-->/g;

function fillPage(html, registry, opts) {
  return html.replace(MARKER, (_, kind, arg) => {
    const ids = arg.split(",").map((s) => s.trim()).filter(Boolean);
    if (kind === "links") return renderList(ids, registry, opts);
    const entry = registry.articles.find((a) => a.id === ids[0]);
    if (!entry) throw new Error("article " + ids[0] + " is not in the registry");
    return kind === "stamp" ? renderStamp(entry) : renderHistory(entry);
  });
}

function urlPath(href, pageUrl) {
  try {
    const u = new URL(href, pageUrl || SITE + "/");
    if (u.origin !== SITE) return null;
    return u.pathname.replace(/index\.html$/, "");
  } catch (e) {
    return null;
  }
}

/* Problems on a built page: unfilled markers, and links to registry articles with no side tag. */
function checkPage(html, registry, pageUrl) {
  const problems = [];
  MARKER.lastIndex = 0;
  if (MARKER.test(html)) problems.push("unfilled living-article marker");
  MARKER.lastIndex = 0;
  const paths = new Map();
  registry.articles.filter((a) => a.url).forEach((a) => paths.set(urlPath(a.url), a.id));
  const own = pageUrl ? urlPath(pageUrl) : null;
  const anchor = /<a\b[^>]*\bhref="([^"]+)"[^>]*>[\s\S]*?<\/a>(\s*<span class="la-tag"[^>]*>)?/g;
  let m;
  while ((m = anchor.exec(html)) !== null) {
    const p = urlPath(m[1], pageUrl);
    if (!p || p === own || !paths.has(p)) continue;
    if (!m[2]) problems.push("link to article " + paths.get(p) + " (" + m[1] + ") has no side tag");
  }
  return problems;
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) out[argv[i].slice(2)] = argv[++i];
    else out._.push(argv[i]);
  }
  return out;
}

function main(argv) {
  const args = parseArgs(argv);
  const registry = loadRegistry(args.registry);
  const cmd = args._[0];
  if (cmd === "list") {
    const ids = String(args.ids || "").split(",").map((s) => s.trim()).filter(Boolean);
    process.stdout.write(renderList(ids, registry, { channel: args.channel || "web", sentAt: args.sent, form: args.form, heading: args.heading }) + "\n");
    return 0;
  }
  if (cmd === "check") {
    let bad = 0;
    for (const file of args._.slice(1)) {
      const rel = path.relative(path.join(__dirname, "..", "content"), path.resolve(file)).split(path.sep).join("/");
      const pageUrl = SITE + "/" + rel.replace(/index\.html$/, "");
      for (const p of checkPage(fs.readFileSync(file, "utf8"), registry, pageUrl)) {
        bad++;
        console.error(file + ": " + p);
      }
    }
    return bad ? 1 : 0;
  }
  console.error("usage: living-tags.js list --ids a,b [--channel web|email|linkedin] [--sent ISO] | check FILES");
  return 2;
}

module.exports = {
  loadRegistry, renderTag, renderList, renderStamp, renderHistory, fillPage, checkPage,
  entryFeatures, revisedSinceSent, publishedRevisions, urlPath,
};

if (require.main === module) process.exit(main(process.argv.slice(2)));
