#!/usr/bin/env node
/**
 * build-wordmark.js — regenerate assets/img/logo.svg from Montserrat outlines (#100).
 *
 * This is a build *tool*, not part of `npm run build`. The wordmark changes when the
 * brand changes, not when the site rebuilds, so the SVG is committed and this script
 * exists to make that SVG reproducible rather than a mystery artifact.
 *
 * The Deckhand wordmark it matches was produced by an uncommitted one-off; nobody can
 * now regenerate it without reverse-engineering the result. Not repeating that.
 *
 *   node scripts/build-wordmark.js            # writes assets/img/logo.svg
 *   node scripts/build-wordmark.js --check    # exits non-zero if the committed file is stale
 *
 * Requires a Montserrat variable TTF; pass with --font=<path>. Not vendored — it is
 * only needed to regenerate, and a 700KB font in the repo to support an occasional
 * rebuild is a bad trade.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'assets', 'img');

// --- house style, lifted from the Deckhand wordmark ------------------------
// aceengineer-strategy/strategy/deckhand/release/assets/deckhand-logo.svg:
//   "W2 wordmark 'Deckhand' | Montserrat — SIL Open Font License 1.1 (Google Fonts),
//    variable instance wght=600 | 'Deck'=#0B3D91 'hand'=#2BB2A6 | text converted to
//    outlines (paths only)"
// Floorhand's pamphlet CSS states the same idiom as `.wm` + `.wm span`: one compound
// word, split into two colour halves, navy then teal.
const WORD = 'AceEngineer';
const SPLIT = 3;              // "Ace" | "Engineer" — the same compound-word split as Deck|hand
const NAVY = '#0B3D91';
const TEAL = '#2BB2A6';
const WEIGHT = 600;

// Two variants, because the site's navbar is dark. `.navbar-inverse.theme-nav` is
// `var(--navy)` = #0b3d5c, and the house navy #0B3D91 on that is navy-on-navy — the
// "Ace" half all but disappears. Deckhand ships the same answer (deckhand-logo-alt.svg
// carries a #FFFFFF fill alongside the navy and teal), so this follows the family
// rather than inventing a one-off.
const VARIANTS = [
  { file: 'logo.svg',         lead: NAVY,      tail: TEAL, on: 'light backgrounds' },
  { file: 'logo-inverse.svg', lead: '#FFFFFF', tail: TEAL, on: 'the dark navbar (navy #0b3d5c)' },
];

// Deckhand's glyph scale, so the two marks sit at the same optical size side by side.
const SCALE = 0.214286;       // font units -> user units (1000 upem -> 214.286)
const BASELINE = 185;
const PAD = 28;               // uniform padding around the ink

// The viewBox is computed from the real ink bounds rather than hard-coded to Deckhand's
// `0 0 1197.7 220`. "Deckhand" has no descender; "AceEngineer" has a g, and reusing the
// fixed box clipped its tail at y=228 in a 220-high box. Deriving the box means a future
// word with an ascender, a descender or neither is framed correctly without anyone
// remembering to check.

function die(msg) { console.error(`build-wordmark: ${msg}`); process.exit(1); }

const args = process.argv.slice(2);
const check = args.includes('--check');
const fontArg = args.find(a => a.startsWith('--font='));
const font = fontArg ? fontArg.slice('--font='.length) : process.env.MONTSERRAT_TTF;
if (!font) die('need a Montserrat variable TTF: --font=<path> or MONTSERRAT_TTF=<path>');
if (!fs.existsSync(font)) die(`font not found: ${font}`);

// Glyph outlines come from fontTools — shaping a variable font by hand in JS would be
// a worse version of a solved problem. uv pulls it in on demand; nothing is installed
// into the repo's dependency tree for a script that runs a few times a year.
const PY = `
import sys, json
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

font = TTFont(sys.argv[1])
inst = instantiateVariableFont(font, {"wght": ${WEIGHT}}, inplace=False)
glyphs, cmap, hmtx = inst.getGlyphSet(), inst.getBestCmap(), inst["hmtx"]

def outline(f, ch):
    gs, name = f.getGlyphSet(), f.getBestCmap()[ord(ch)]
    pen = SVGPathPen(gs)
    gs[name].draw(pen)
    return pen.getCommands(), f["hmtx"][name][0]

out = []
for ch in ${JSON.stringify(WORD)}:
    d, adv = outline(inst, ch)
    bp = BoundsPen(glyphs)
    glyphs[cmap[ord(ch)]].draw(bp)
    out.append({"char": ch, "d": d, "adv": adv, "bounds": bp.bounds})

# The instanced font keeps the variable font's DEFAULT name (Montserrat Thin at
# wght=100), so the name table cannot confirm the weight took. Compare a glyph against
# the untouched default instead: if instancing silently no-ops, we would ship hairline
# outlines under a comment claiming wght=600.
base_d, base_adv = outline(TTFont(sys.argv[1]), "A")
inst_d, inst_adv = outline(inst, "A")
if ${WEIGHT} != 100 and (inst_d == base_d or inst_adv == base_adv):
    sys.exit("instancing did not change the outlines — wght=${WEIGHT} was not applied")

name = inst["name"]
print(json.dumps({
    "upem": inst["head"].unitsPerEm,
    "license": name.getDebugName(13),
    # ID 16 is the typographic family ("Montserrat"); ID 1 is the default subfamily's
    # marketing name ("Montserrat Thin") and would be a lie in the header comment.
    "family": name.getDebugName(16) or name.getDebugName(1),
    "glyphs": out,
}))
`;

let data;
try {
  const raw = execFileSync('uv', ['run', '--with', 'fonttools', 'python', '-c', PY, font],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  data = JSON.parse(raw);
} catch (err) {
  die(`could not extract outlines — is uv available?\n${err.stderr || err.message}`);
}

if (data.upem !== 1000) die(`expected a 1000 upem font, got ${data.upem}`);

// Lay the glyphs out on the baseline. Each path is emitted in font units and flipped by
// the per-glyph transform, exactly as the Deckhand file does it, so the two files are
// diffable against each other.
let x = 0;
const lead = [];
const tail = [];
const ink = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
data.glyphs.forEach((g, i) => {
  if (g.d) {
    (i < SPLIT ? lead : tail).push(
      `<path transform="translate(${x.toFixed(3)},${BASELINE}) scale(${SCALE},-${SCALE})" d="${g.d}"/>`);
  }
  if (g.bounds) {
    const [bx0, by0, bx1, by1] = g.bounds;
    ink.x0 = Math.min(ink.x0, x + bx0 * SCALE);
    ink.x1 = Math.max(ink.x1, x + bx1 * SCALE);
    ink.y0 = Math.min(ink.y0, BASELINE - by1 * SCALE);   // y flips
    ink.y1 = Math.max(ink.y1, BASELINE - by0 * SCALE);
  }
  x += g.adv * SCALE;
});

const vb = {
  x: +(ink.x0 - PAD).toFixed(2),
  y: +(ink.y0 - PAD).toFixed(2),
  w: +(ink.x1 - ink.x0 + 2 * PAD).toFixed(2),
  h: +(ink.y1 - ink.y0 + 2 * PAD).toFixed(2),
};
// XML forbids `--` inside a comment. Interpolating colour names and CSS custom
// properties into the provenance header makes that easy to hit by accident — it has
// happened twice while writing this script (`--font=` then `--navy`). Normalise once
// here so no caller has to remember; the well-formedness check below is the backstop,
// not the primary defence.
const comment = s => String(s).replace(/-{2,}/g, '–');

function render(v) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" role="img" aria-label="${WORD}">
<!-- ${comment(`${WORD} wordmark | ${data.family} — SIL Open Font License 1.1 (Google Fonts), variable instance wght=${WEIGHT} | "${WORD.slice(0, SPLIT)}"=${v.lead} "${WORD.slice(SPLIT)}"=${v.tail} | for ${v.on} | text converted to outlines (paths only)`)} -->
<!-- Regenerate with scripts/build-wordmark.js (see that file for the font argument). Note: XML comments cannot contain a double hyphen, so the flag is not spelled out here. -->
<title>${WORD}</title>
<g fill="${v.lead}">
${lead.join('\n')}
</g>
<g fill="${v.tail}">
${tail.join('\n')}
</g>
</svg>
`;
}

// Parse what we are about to write. The first version of this script emitted a usage
// hint containing "--font=" inside an XML comment; a double hyphen is illegal there, so
// the file was not well-formed and browsers refused to render it — while every numeric
// check on the geometry still passed. A generator that can emit an unparseable file
// must prove otherwise before writing it.
let stale = false;
for (const v of VARIANTS) {
  const svg = render(v);
  const out = path.join(IMG, v.file);

  try {
    execFileSync('uv', ['run', 'python', '-c',
      'import sys,xml.etree.ElementTree as ET; ET.fromstring(sys.stdin.read())'],
    { input: svg, stdio: ['pipe', 'ignore', 'pipe'] });
  } catch (err) {
    die(`${v.file} is not well-formed XML:\n${(err.stderr || '').toString().trim()}`);
  }

  if (check) {
    const current = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
    if (current !== svg) { console.error(`build-wordmark: ${v.file} is stale`); stale = true; }
    continue;
  }

  fs.writeFileSync(out, svg);
  console.log(`build-wordmark: wrote ${v.file} — ${vb.w}x${vb.h}, "${WORD.slice(0, SPLIT)}"=${v.lead} for ${v.on}`);
}

if (check) {
  if (stale) die('re-run without --check to regenerate');
  console.log('build-wordmark: all variants up to date');
  process.exit(0);
}
console.log(`  ${data.glyphs.length} glyphs, ${data.family} wght=${WEIGHT}`);
console.log(`  license: ${(data.license || '').split('.')[0]}.`);
