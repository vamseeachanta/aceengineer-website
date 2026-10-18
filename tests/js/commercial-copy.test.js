/**
 * commercial-copy.test.js — the site states no prices, no free offers and no turnaround
 * promises (maintainer ruling; a plain "contact us for help" line is the call to action).
 *
 * Reads the rendered pages in dist/ (run `npm run build` first): visible body text, the
 * title, the description metadata and every JSON-LD string. Also scans HTML outside
 * content/ so stale checked-in copies cannot retain withdrawn offers. Engineering economics (NPV,
 * field costs, savings in a worked example) and physical uses of "free" (free span, free
 * decay, free surface) are not commercial copy, so the patterns below name commercial
 * wording only. The fixture tests at the end prove each pattern fires, and that ordinary
 * engineering wording passes.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { JSDOM } = require('jsdom');
const { builtPages, SITEMAP_EXCLUDE } = require('../../build');

const distDir = path.join(__dirname, '..', '..', 'dist');
const repoDir = path.join(__dirname, '..', '..');

const RULES = {
  price: [
    /\$\s?\d[\d,.]*\s?[kKmM]?\s?\/\s?(?:hr|hour|month|year|yr)\b/,          // rates and fees per period
    /\$\s?\d[\d,.]*\s?[kKmM]?\s+flat\b/i,                                    // flat fees
    /@\s?\$\s?\d/,                                                          // "@ $500/hr"
    /\bmarginal cost\s*\(\s*\$/i,                                            // "at marginal cost ($3K ...)"
    /\b(?:fixed[- ]price|volume[- ]based pricing|request pricing|custom quote|see pricing|pricing tiers?)\b/i,
    /\bengagements?\s+(?:run|cost|start)s?\s+(?:at\s+|from\s+)?\$/i,
    // what a consultant or a traditional engagement would charge: "consulting ... cost $150K-250K"
    /\bconsult(?:ing|ants?|ancy)\b[^.]{0,80}\$\s?\d/i,
  ],
  freeOffer: [
    /\bfree\s+(?:assessment|consultation|pilot|trial|of charge|quote)\b/i,
    // "Free S-N curve calculator", "Free interactive tools"; not free span, surface or decay
    /\bfree\s+(?!span|spanning|surface|decay|fall|board|corrosion|field|stream|water|end)(?:[\w/-]+\s+){0,5}(?:calculators?|tools?|signature screen)\b/i,
    /\b(?:try|use)\s+(?:it\s+|our\s+|the\s+|this\s+)?free\b/i,
    /\bfree\s+to\s+(?:explore|use|try)\b/i,
    /\bfree\s+for\s+the\s+first\b/i,
    /\bno\s+(?:commitment|obligation)\b/i,
  ],
  turnaround: [
    /\bwithin\s+\d+\s+(?:business\s+)?(?:hours?|days?)\b/i,
    // "48hr custom runs", "48-hour parametric run", "the 48-hour screening", "48-hour project
    // run", "48-hour SOP": a period of hours or days in front of a deliverable, up to two words apart
    /\b\d+[- ]?(?:hours?|hrs?|days?)[- ](?:[\w-]+\s+){0,2}(?:turnaround|response|runs?|screenings?|sweeps?|memos?|deliver(?:y|ables?)|SOP|engagements?)\b/i,
    // "decision-grade memo in 48": a deliverable promised within a period
    /\b(?:memos?|deliverables?)\s+(?:with)?in\s+(?:under\s+)?\d+\b/i,
    // "results in 2 business days", "results in 24 hours": what the reader receives, and when.
    // A before-and-after outcome ("results in 3 days instead of 3 weeks") is history and passes.
    /\b(?:results?|answers?|reports?)\s+(?:with)?in\s+(?:under\s+)?\d+\s+(?:business\s+|working\s+)?(?:hours?|days?)\b(?!\s+instead\b)/i,
    // business or working days are a service interval, never a run time
    /\b\d+(?:\s*(?:-|–|to)\s*\d+)?\s+(?:business|working)\s+(?:days?|hours?)\b/i,
    // "same-day turnaround", "next-day results"
    /\b(?:same|next)[- ]day\s+(?:[\w-]+\s+)?(?:turnaround|response|results?|answers?|delivery|deliverables?|screenings?|service|memos?|reports?)\b/i,
    // "Overnight screening", "screening overnight", "Installation Screening, Overnight.": overnight
    // tied to a screening, a result or a turnaround. "Runs overnight on eight cores" is a run time.
    /\bovernight\s+(?:screenings?|screens?|turnaround|results?|answers?|memos?|reports?|deliver(?:y|ables?))\b/i,
    /\b(?:screenings?|screens?|turnaround|results?|answers?|memos?|reports?|deliver(?:y|ables?))\s*[,:–—-]?\s*overnight\b/i,
    /\bresponse\s+guarantee\b/i,
    /\b\d+\s?(?:hr|hours?)\s+response\b/i,
    /\bby\s+morning\b/i,
    /\b(?:get|receive|have)\b[^.]{0,60}\bby\s+\d{1,2}(?::\d\d)?\s?(?:am|pm)\b/i,      // "you get results by 8 AM"
    /\b(?:receive|get|deliver(?:ed|s)?|return(?:ed|s)?)\b[^.]{0,80}\bovernight\b/i,
    /\bwhat\s+used\s+to\s+take\b[^.]*\bnow\s+takes?\b/i,
  ],
};

// Engineering economics in worked examples, not prices: each entry names the page, the exact
// text and why it is not a commercial statement.
const ECONOMICS = {
  'blog/energy-data-automation-pipelines.html': [
    '$100,800/year',   // the yearly cost of manual data collection in the worked example
    'FTE @ $120k',     // the analyst salary assumed in that example
    '$2M/year',        // a field optimisation opportunity in the same example
  ],
  'case-studies/subsea-fea-automation.html': [
    '@ $85/hr',        // the client's labour rate in a savings estimate, not a fee
  ],
};

// The reviewed newsletter describes a contractor's possible goal, not a service
// promise. Match the whole qualified sentence on this one page only.
const NEWSLETTER_GOAL_PAGE = 'newsletter/issue-001/index.html';
const NEWSLETTER_GOAL = 'Speed: an installation contractor could set a goal of running its own installation analysis in-house within 24 hours.';

function jsonStrings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach(v => jsonStrings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach(v => jsonStrings(v, out));
  return out;
}

function renderedCopy(html) {
  const doc = new JSDOM(html).window.document;
  const parts = [doc.title];
  for (const sel of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]',
    'meta[property="og:title"]', 'meta[name="twitter:title"]']) {
    const m = doc.querySelector(sel);
    if (m) parts.push(m.getAttribute('content') || '');
  }
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    parts.push(...jsonStrings(JSON.parse(script.textContent)));
  }
  const body = doc.body.cloneNode(true);
  // Code samples are not copy: a regulation deadline in sample data is not a promise.
  body.querySelectorAll('script, style, noscript, template, pre, code, .code-example, .code-block, .method-code')
    .forEach(n => n.remove());
  parts.push(body.textContent);
  return parts.join('\n').replace(/\s+/g, ' ');
}

function findings(text, page) {
  for (const allowed of ECONOMICS[page] || []) text = text.split(allowed).join(' ');
  if (page === NEWSLETTER_GOAL_PAGE) text = text.split(NEWSLETTER_GOAL).join(' ');
  const hits = [];
  for (const [rule, patterns] of Object.entries(RULES)) {
    for (const pattern of patterns) {
      const m = text.match(pattern);
      if (m) hits.push(`${rule}: "${text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 30).trim()}"`);
    }
  }
  return hits;
}

// Every built page, including those left out of the sitemap (404, redirect stubs): leaving a
// page out of the sitemap does not keep it off the site.
function scan(dir, pages = builtPages(dir)) {
  const failures = [];
  for (const page of pages) {
    for (const hit of findings(renderedCopy(fs.readFileSync(path.join(dir, page), 'utf8')), page)) {
      failures.push(`${page} — ${hit}`);
    }
  }
  return failures;
}

function outsideContentPages(root, dir = root) {
  const pages = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules', '.venv'].includes(entry.name)) continue;
      const parts = path.relative(root, file).split(path.sep);
      if (parts[0] === 'tests' && ['fixtures', '__fixtures__'].includes(entry.name)) continue;
      if (dir === root && ['content', 'dist'].includes(entry.name)) continue;
      pages.push(...outsideContentPages(root, file));
    } else if (/\.html$/i.test(entry.name)) {
      pages.push(path.relative(root, file).split(path.sep).join('/'));
    }
  }
  return pages.sort();
}

test('no HTML outside content states a price, a free offer or a turnaround promise', () => {
  expect(scan(repoDir, outsideContentPages(repoDir))).toEqual([]);
});

test('the outside-content scan catches root and nested copies and excludes build output and fixtures', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'commercial-copy-outside-'));
  try {
    const files = {
      'index.html': '<p>Studies from $500/hr.</p>',
      'blog/old.html': '<meta name="description" content="Free consultation">',
      'scripts/templates/old.html': '<script type="application/ld+json">{"description":"Results in 2 business days"}</script>',
      'demos/engineering.html': '<p>Free-span analysis; contact us for help.</p>',
      'assets/fixtures/offer.HTML': '<p>Free trial</p>',
      'content/index.html': '<p>Free consultation</p>',
      'dist/index.html': '<p>Free consultation</p>',
      'node_modules/example/index.html': '<p>Free consultation</p>',
      'tests/fixtures/offers.html': '<p>Free consultation</p>',
      'tests/__fixtures__/offers.html': '<p>Free consultation</p>',
    };
    for (const [file, html] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      fs.writeFileSync(path.join(dir, file), html);
    }
    const pages = outsideContentPages(dir);
    expect(pages).toEqual(['assets/fixtures/offer.HTML', 'blog/old.html', 'demos/engineering.html', 'index.html', 'scripts/templates/old.html']);
    const failures = scan(dir, pages);
    expect(failures.some(f => f.startsWith('index.html — price:'))).toBe(true);
    expect(failures.some(f => f.startsWith('blog/old.html — freeOffer:'))).toBe(true);
    expect(failures.some(f => f.startsWith('scripts/templates/old.html — turnaround:'))).toBe(true);
    expect(failures.some(f => f.startsWith('assets/fixtures/offer.HTML — freeOffer:'))).toBe(true);
    expect(failures.some(f => f.startsWith('demos/engineering.html'))).toBe(false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('no built page states a price, a free offer or a turnaround promise', () => {
  if (!fs.existsSync(distDir)) throw new Error('dist/ is absent; run npm run build first');
  const pages = builtPages(distDir);
  expect(pages.length).toBeGreaterThan(100);
  expect(pages).toEqual(expect.arrayContaining(Object.keys(SITEMAP_EXCLUDE)));
  expect(scan(distDir)).toEqual([]);
});

test('the scan reads pages left out of the sitemap', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'commercial-copy-'));
  try {
    const page = body => `<html><head><title>t</title></head><body>${body}</body></html>`;
    fs.mkdirSync(path.join(dir, 'reports', 'diffraction'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), page('<p>Contact us for help.</p>'));
    fs.writeFileSync(path.join(dir, '404.html'), page('<p>Page not found. Studies from $500/hr.</p>'));
    fs.writeFileSync(path.join(dir, 'reports', 'diffraction', 'aqwa-analysis.html'),
      page('<p>Moved. Free consultation available.</p>'));
    const failures = scan(dir);
    expect(failures.some(f => f.startsWith('404.html — price:'))).toBe(true);
    expect(failures.some(f => f.startsWith('reports/diffraction/aqwa-analysis.html — freeOffer:'))).toBe(true);
    expect(failures.some(f => f.startsWith('index.html'))).toBe(false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('every economics exception still matches its page, so stale entries are removed', () => {
  for (const [page, snippets] of Object.entries(ECONOMICS)) {
    const text = renderedCopy(fs.readFileSync(path.join(distDir, page), 'utf8'));
    for (const snippet of snippets) expect({ page, snippet, present: text.includes(snippet) })
      .toEqual({ page, snippet, present: true });
  }
});

test('the reviewed newsletter goal is retained and scoped to its page', () => {
  const text = renderedCopy(fs.readFileSync(path.join(distDir, NEWSLETTER_GOAL_PAGE), 'utf8'));
  expect(text).toContain(NEWSLETTER_GOAL);
  expect(findings(NEWSLETTER_GOAL, NEWSLETTER_GOAL_PAGE)).toEqual([]);
  expect(findings(NEWSLETTER_GOAL, 'index.html')).not.toEqual([]);
});

test('the newsletter goal exception cannot hide an unqualified promise', () => {
  expect(findings(NEWSLETTER_GOAL.replace('could set a goal of running', 'runs'), NEWSLETTER_GOAL_PAGE))
    .not.toEqual([]);
  expect(findings(`${NEWSLETTER_GOAL} We respond within 24 hours.`, NEWSLETTER_GOAL_PAGE))
    .not.toEqual([]);
});

test.each([
  ['price', 'Traditional cost (@ $500/hr) $50,000'],
  ['price', 'Riser fatigue study $15,000 flat'],
  ['price', 'Annual retainer $120,000/year'],
  ['price', 'later requested 30 configurations at marginal cost ($3K vs $30K)'],
  ['price', 'Screening engagements run $5K to $15K.'],
  ['price', 'Request Pricing'],
  ['price', 'Traditional consulting approaches would require 8-12 weeks and cost $150K-250K.'],
  ['freeOffer', 'Get a free assessment of how automation can help.'],
  ['freeOffer', 'Free interactive tools for fatigue assessment.'],
  ['freeOffer', 'Free Arps decline curve and EUR calculator.'],
  ['freeOffer', 'Try free calculator'],
  ['freeOffer', 'Every capability is free to explore.'],
  ['freeOffer', 'Response within 24 hours · No commitment required'],
  ['turnaround', 'We will respond within 24 hours.'],
  ['turnaround', 'How a 48-hour custom run works'],
  ['turnaround', 'Our Response Guarantee'],
  ['turnaround', '24hr Response Time'],
  ['turnaround', 'Get hundreds of validated results by morning.'],
  ['turnaround', 'You get validated results by 8 AM.'],
  ['turnaround', 'Send a design matrix and receive validated results overnight.'],
  ['turnaround', 'What used to take 3 weeks of manual iteration now takes 3 days.'],
  ['turnaround', 'Overnight screening, P.E.-stamped, 48hr custom runs.'],
  ['turnaround', 'Quickest path to a 48-hour parametric run on your data.'],
  ['turnaround', 'ACE then runs the 48-hour screening using RAFT + MoorPy.'],
  ['turnaround', 'Per-prospect numbers are produced by the 48-hour project run.'],
  ['turnaround', 'Following the same 48-hour SOP used for the other demos.'],
  ['turnaround', 'A 72 hr parametric sweep on your matrix.'],
  ['turnaround', '~120 screened cases, decision-grade memo in 48.'],
  ['turnaround', 'Overnight screening, P.E.-stamped, custom runs on your data.'],
  ['turnaround', 'Parametric installation screening overnight.'],
  ['turnaround', 'Installation Screening, Overnight. P.E.-Stamped, Code-Ready.'],
  ['turnaround', 'You receive results in 2 business days.'],
  ['turnaround', 'Results in 24 hours on your data.'],
  ['turnaround', 'Allow 3-5 working days for the memo.'],
  ['turnaround', 'Same-day turnaround on screening requests.'],
  ['turnaround', 'Next-day results for standard matrices.'],
])('the %s rule catches "%s"', (rule, sample) => {
  expect(findings(sample).some(hit => hit.startsWith(`${rule}:`))).toBe(true);
});

// The same wording as it sits in a built page: description metadata, JSON-LD, body text,
// a table cell and a figure-and-label pair.
const PAGE = (head, body) => `<html><head><title>Vessel screening</title>${head}</head><body>${body}</body></html>`;
test.each([
  ['description metadata', PAGE('<meta name="description" content="Overnight screening, P.E.-stamped, 48hr custom runs.">', '')],
  ['JSON-LD', PAGE('<script type="application/ld+json">{"@type":"WebPage","description":"P.E.-stamped, 48hr custom runs."}</script>', '')],
  ['a lead paragraph', PAGE('', '<p class="lead">Quickest path to a 48-hour parametric run on your data: email us.</p>')],
  ['screening copy', PAGE('', '<p>ACE then runs the 48-hour\n  screening using RAFT + MoorPy.</p>')],
  ['a note', PAGE('', '<div class="illustrative-note">Produced by the 48-hour project run on submission.</div>')],
  ['a table cell', PAGE('', '<table><tr><td>Weeks of setup</td><td>~120 cases, decision-grade memo in 48</td></tr></table>')],
  ['a figure and label', PAGE('', '<div class="hero-kpi">\n<span class="number">&lt; 8 hrs</span>\n<span class="label">Overnight turnaround</span>\n</div>')],
  ['a consulting charge', PAGE('', '<p>Traditional consulting approaches would require 8-12 weeks and cost $150K-250K.</p>')],
  ['overnight in description metadata', PAGE('<meta name="description" content="Heavy-lift, pipelay, PLSV, FOWT. Overnight screening, P.E.-stamped.">', '')],
  ['overnight in JSON-LD', PAGE('<script type="application/ld+json">{"@type":"WebPage","description":"FOWT. Overnight screening, P.E.-stamped."}</script>', '')],
  ['overnight in og:description', PAGE('<meta property="og:description" content="Parametric installation screening overnight. P.E.-stamped.">', '')],
  ['overnight in a heading', PAGE('', '<section><h1>Installation Screening, Overnight. P.E.-Stamped, Code-Ready.</h1></section>')],
  ['business days in body text', PAGE('', '<p>Send the matrix; results in 2 business days.</p>')],
  ['same-day in a figure and label', PAGE('', '<div class="hero-kpi">\n<span class="number">Same-day</span>\n<span class="label">turnaround</span>\n</div>')],
])('rendered pages are caught: %s', (_where, html) => {
  expect(findings(renderedCopy(html))).not.toEqual([]);
});

test.each([
  'Free-span VIV screening to DNV-RP-F105 and free-decay validation of the free surface.',
  'Field NPV at a $65 oil price and a 10% discount rate; life-to-date pretax NPV of $2.9 billion.',
  'The library runs the parametric sweep overnight on eight cores.',
  'Missing a weather window costs $500K/day of vessel time.',
  'Query response time: under 1 minute, against hours by manual search.',
  'All simulations completed by 6 AM with no failures.',
  'Delivered the final report by 2 PM on day 3.',
  'Contact us for help: support@aceengineer.com',
  'A real engagement starts with a 1-hour intake to capture the floater concept.',
  'Results Extraction (50 configs x 30 min) 25 hours Report Compilation 10 hours',
  'Run the 3-hour storm simulation for each sea state.',
  'Field development cost $1.2B over a 25-year life.',
  'Compute time per demo batch: under 8 hrs.',
  'Composite of the five shipped overnight runs.',
  'Parametric tools that run hundreds of cases overnight.',
  'All 50 simulations queued and executed overnight on 8 parallel cores.',
  'Delivered complete results in 3 days instead of 3 weeks.',
  'Perfect match: same day, same location.',
])('engineering wording passes: "%s"', sample => {
  expect(findings(sample)).toEqual([]);
});

test('code samples are not read as copy', () => {
  const html = '<html><head><title>t</title></head><body><p>Sample data:</p>'
    + "<pre><code>'deadline': 'Within 7 days'</code></pre></body></html>";
  expect(findings(renderedCopy(html))).toEqual([]);
});
