/**
 * commercial-copy.test.js — the site states no prices, no free offers and no turnaround
 * promises (maintainer ruling; a plain "contact us for help" line is the call to action).
 *
 * Reads the rendered pages in dist/ (run `npm run build` first): visible body text, the
 * title, the description metadata and every JSON-LD string. Engineering economics (NPV,
 * field costs, savings in a worked example) and physical uses of "free" (free span, free
 * decay, free surface) are not commercial copy, so the patterns below name commercial
 * wording only. The fixture tests at the end prove each pattern fires, and that ordinary
 * engineering wording passes.
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { builtPages, SITEMAP_EXCLUDE } = require('../../build');

const distDir = path.join(__dirname, '..', '..', 'dist');

const RULES = {
  price: [
    /\$\s?\d[\d,.]*\s?[kKmM]?\s?\/\s?(?:hr|hour|month|year|yr)\b/,          // rates and fees per period
    /\$\s?\d[\d,.]*\s?[kKmM]?\s+flat\b/i,                                    // flat fees
    /@\s?\$\s?\d/,                                                          // "@ $500/hr"
    /\bmarginal cost\s*\(\s*\$/i,                                            // "at marginal cost ($3K ...)"
    /\b(?:fixed[- ]price|volume[- ]based pricing|request pricing|custom quote|see pricing|pricing tiers?)\b/i,
    /\bengagements?\s+(?:run|cost|start)s?\s+(?:at\s+|from\s+)?\$/i,
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
    /\b\d+[- ]?(?:hours?|hr|days?)[- ](?:turnaround|response|custom run|delivery)\b/i,
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
  const hits = [];
  for (const [rule, patterns] of Object.entries(RULES)) {
    for (const pattern of patterns) {
      const m = text.match(pattern);
      if (m) hits.push(`${rule}: "${text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 30).trim()}"`);
    }
  }
  return hits;
}

test('no built page states a price, a free offer or a turnaround promise', () => {
  if (!fs.existsSync(distDir)) throw new Error('dist/ is absent; run npm run build first');
  const pages = builtPages(distDir).filter(page => !(page in SITEMAP_EXCLUDE));
  expect(pages.length).toBeGreaterThan(100);
  const failures = [];
  for (const page of pages) {
    for (const hit of findings(renderedCopy(fs.readFileSync(path.join(distDir, page), 'utf8')), page)) {
      failures.push(`${page} — ${hit}`);
    }
  }
  expect(failures).toEqual([]);
});

test('every economics exception still matches its page, so stale entries are removed', () => {
  for (const [page, snippets] of Object.entries(ECONOMICS)) {
    const text = renderedCopy(fs.readFileSync(path.join(distDir, page), 'utf8'));
    for (const snippet of snippets) expect({ page, snippet, present: text.includes(snippet) })
      .toEqual({ page, snippet, present: true });
  }
});

test.each([
  ['price', 'Traditional cost (@ $500/hr) $50,000'],
  ['price', 'Riser fatigue study $15,000 flat'],
  ['price', 'Annual retainer $120,000/year'],
  ['price', 'later requested 30 configurations at marginal cost ($3K vs $30K)'],
  ['price', 'Screening engagements run $5K to $15K.'],
  ['price', 'Request Pricing'],
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
])('the %s rule catches "%s"', (rule, sample) => {
  expect(findings(sample).some(hit => hit.startsWith(`${rule}:`))).toBe(true);
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
])('engineering wording passes: "%s"', sample => {
  expect(findings(sample)).toEqual([]);
});

test('code samples are not read as copy', () => {
  const html = '<html><head><title>t</title></head><body><p>Sample data:</p>'
    + "<pre><code>'deadline': 'Within 7 days'</code></pre></body></html>";
  expect(findings(renderedCopy(html))).toEqual([]);
});
