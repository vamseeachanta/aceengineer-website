/**
 * brand-assets.test.js — one wordmark, one palette (#100).
 *
 * The audit found three brand artifacts sharing no colour: logo.svg (navy+teal),
 * logo.png (a raster of it) and favicon.svg (#b84315, a Bootswatch United orange that
 * appeared in no other brand file and no design token). The browser tab was a different
 * company from the page.
 *
 * The wordmark itself was also unreadable: a 640x160 viewBox rendered at width:100px is
 * a 0.156 scale, so "AceEngineer" at font-size 46 came out around 7px and the tagline
 * around 2px.
 *
 * These assertions are what stop both from coming back. Source files only — no build
 * required.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const IMG = path.join(ROOT, 'assets', 'img');

// The house palette, taken from the Deckhand wordmark this one is a sibling of
// (aceengineer-strategy/strategy/deckhand/release/assets/deckhand-logo.svg:
//  "Deck"=#0B3D91 "hand"=#2BB2A6, Montserrat wght=600, outlines only).
const NAVY = '#0B3D91';
const TEAL = '#2BB2A6';
const WHITE = '#FFFFFF';
const PALETTE = new Set([NAVY, TEAL, WHITE].map(c => c.toLowerCase()));

// The orange that used to be the favicon. Named so a future reintroduction fails with
// an explanation rather than a bare colour mismatch.
const RETIRED = '#b84315';

const read = p => fs.readFileSync(p, 'utf8');

// Colours that actually render. Comments are stripped first: the provenance headers
// legitimately name other hexes (the navbar background these are checked against, for
// one), and a documented colour is not a used one.
const hexes = s => ((s.replace(/<!--[\s\S]*?-->/g, '').match(/#[0-9a-fA-F]{6}\b/g)) || [])
  .map(h => h.toLowerCase());

const LIGHT = path.join(IMG, 'logo.svg');
const INVERSE = path.join(IMG, 'logo-inverse.svg');
const FAVICON = path.join(ROOT, 'assets', 'favicon.svg');

describe('brand assets', () => {
  test('both wordmark variants exist', () => {
    for (const p of [LIGHT, INVERSE, FAVICON]) {
      expect(`${path.relative(ROOT, p)} exists`).toBe(fs.existsSync(p)
        ? `${path.relative(ROOT, p)} exists` : 'missing');
    }
  });

  test('every brand artifact is well-formed XML', () => {
    // A `--` inside an XML comment makes the file unparseable and browsers render
    // nothing — which happened while generating these, and which no geometry check
    // would have caught.
    const { JSDOM } = require('jsdom');
    for (const p of [LIGHT, INVERSE, FAVICON]) {
      const src = read(p);
      const comments = src.match(/<!--[\s\S]*?-->/g) || [];
      for (const c of comments) {
        expect(`${path.basename(p)} comment has no double hyphen`)
          .toBe(/-{2,}/.test(c.slice(4, -3)) ? `${path.basename(p)} BAD: ${c.slice(0, 60)}` :
            `${path.basename(p)} comment has no double hyphen`);
      }
      // Balanced, parseable markup: jsdom's XML mode surfaces a parsererror element.
      const doc = new JSDOM(src, { contentType: 'image/svg+xml' }).window.document;
      expect(doc.querySelector('parsererror')).toBeNull();
      expect(doc.documentElement.tagName.toLowerCase()).toBe('svg');
    }
  });

  test('the two variants differ only in fill, never in geometry', () => {
    // If they drift apart, the dark-background logo stops being the same mark.
    const strip = s => s.replace(/fill="[^"]*"/g, 'fill=""').replace(/<!--[\s\S]*?-->/g, '');
    expect(strip(read(INVERSE))).toBe(strip(read(LIGHT)));
  });

  test('the light variant leads navy, the inverse leads white; both close teal', () => {
    const light = hexes(read(LIGHT));
    const inverse = hexes(read(INVERSE));
    expect(light).toContain(NAVY.toLowerCase());
    expect(light).toContain(TEAL.toLowerCase());
    expect(inverse).toContain(WHITE.toLowerCase());
    expect(inverse).toContain(TEAL.toLowerCase());
    // Navy on the dark navbar (--navy #0b3d5c) is navy-on-navy — the reason the
    // inverse variant exists at all.
    expect(inverse).not.toContain(NAVY.toLowerCase());
  });

  test('no brand artifact uses a colour outside the house palette', () => {
    const bad = [];
    for (const p of [LIGHT, INVERSE, FAVICON]) {
      for (const h of hexes(read(p))) if (!PALETTE.has(h)) bad.push([path.basename(p), h]);
    }
    expect(bad).toEqual([]);
  });

  test('the retired Bootswatch orange is gone from every brand artifact', () => {
    const bad = [LIGHT, INVERSE, FAVICON]
      .filter(p => read(p).toLowerCase().includes(RETIRED))
      .map(p => path.basename(p));
    expect(bad).toEqual([]);
  });

  test('the wordmark is a pure wordmark — outlines only, no <text>, no icon', () => {
    // <text> would make rendering depend on a font the visitor may not have; the point
    // of converting to outlines is that it looks identical everywhere.
    const src = read(LIGHT);
    expect(src).not.toMatch(/<text[\s>]/);
    expect(src).not.toMatch(/<image[\s>]/);
    expect((src.match(/<path/g) || []).length).toBeGreaterThan(5);
  });

  test('the navbar uses the inverse variant against its dark background', () => {
    const nav = read(path.join(ROOT, 'content', 'partials', 'nav.html'));
    expect(nav).toMatch(/assets\/img\/logo-inverse\.svg/);
    expect(nav).not.toMatch(/assets\/img\/logo\.svg/);
  });

  test('the navbar logo is wide enough to be legible', () => {
    // At the previous 100px against a 4:1 viewBox the wordmark rendered around 7px.
    // Guarding the smallest breakpoint is enough — the others only go up.
    const css = read(path.join(ROOT, 'assets', 'css', 'responsive.css'));
    const widths = [...css.matchAll(/\.navbar-logo\s*\{[^}]*?width:\s*(\d+)px/gs)].map(m => +m[1]);
    expect(widths.length).toBeGreaterThan(0);
    expect(Math.min(...widths)).toBeGreaterThanOrEqual(130);
  });

  test('the alt text matches what the artwork actually says', () => {
    // It read "AceEngineer — made deterministically simple" while the artwork carried a
    // tagline nobody could resolve. The tagline is gone; the alt text must not claim it.
    const nav = read(path.join(ROOT, 'content', 'partials', 'nav.html'));
    const alt = (nav.match(/class="navbar-logo"[^>]*alt="([^"]*)"/) ||
                 nav.match(/alt="([^"]*)"[^>]*class="navbar-logo"/) || [])[1];
    expect(alt).toBe('AceEngineer');
  });

  test('the raster logo used for schema.org is regenerated from the wordmark', () => {
    // logo.png feeds Organization.logo and the blog publisher logo on 8 pages. It must
    // track the SVG's aspect ratio, or structured data shows the retired mark.
    const png = fs.readFileSync(path.join(IMG, 'logo.png'));
    expect(png.slice(1, 4).toString()).toBe('PNG');
    const w = png.readUInt32BE(16);
    const h = png.readUInt32BE(20);

    const vb = read(LIGHT).match(/viewBox="([-\d. ]+)"/)[1].trim().split(/\s+/).map(Number);
    const svgRatio = vb[2] / vb[3];
    expect(Math.abs(w / h - svgRatio) / svgRatio).toBeLessThan(0.02);
    expect(w).toBeGreaterThanOrEqual(512);   // Google wants a logo it can render large
  });
});
