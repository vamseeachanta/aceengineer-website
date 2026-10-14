const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { escapeHtml } = require('./render-capabilities');
const origin = 'https://www.aceengineer.com';
const organization = { '@id': `${origin}/#organization` };
const disciplines = [
  'Asset integrity and fitness-for-service', 'Drilling riser and riser analysis',
  'Hydrodynamics and vessel motions', 'Cathodic protection design',
  'Marine installation screening', 'Offshore energy data and field analytics',
];
const description = 'Sample engineering reports prepared from public data and published standards, or from synthetic inputs where stated.';
const notice = 'The samples are prepared from public data and published standards, or from synthetic inputs where stated, and contain no client information. They are not project deliverables and do not replace project-specific engineering.';
function loadSamples(file = './config/samples.yaml') {
  return yaml.load(fs.readFileSync(file, 'utf8'));
}
function validateSamples(registry, { assetsRoot = './assets' } = {}) {
  if (!registry || !Array.isArray(registry.samples)) throw new Error('samples: expected an array');
  const slugs = new Set();
  registry.samples.forEach((entry, index) => {
    const fail = field => { throw new Error(`sample ${entry?.slug || index}: invalid ${field}`); };
    for (const field of ['slug', 'title', 'discipline', 'summary', 'revision', 'page', 'pdf', 'status']) {
      if (!entry || typeof entry[field] !== 'string' || !entry[field].trim()) fail(field);
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.slug) || slugs.has(entry.slug)) fail('slug');
    slugs.add(entry.slug);
    if (!/^[a-z0-9]+$/.test(entry.revision)) fail('revision');
    if (!['draft', 'published'].includes(entry.status)) fail('status');
    if (entry.page !== `samples/${entry.slug}.html`) fail('page');
    if (entry.pdf !== `assets/samples/${entry.slug}-${entry.revision}.pdf`) fail('pdf');
    if (!disciplines.includes(entry.discipline)) fail('discipline');
    if (!/^[^.!?]+\.$/.test(entry.summary)) fail('summary');
    if (entry.status === 'published') {
      const file = path.join(assetsRoot, entry.pdf.slice('assets/'.length));
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) fail('pdf');
    }
  });
  return registry;
}
function publishedSamples(registry) {
  return registry.samples.filter(entry => entry.status === 'published');
}
function sampleLocals(registry) {
  const published = publishedSamples(registry);
  return {
    samplesPublished: published.length > 0,
    sampleHomeRows: published.slice(0, 4).map(entry => `<tr><td>${escapeHtml(entry.title)}</td><td>${escapeHtml(entry.summary)}</td><td><a href="${escapeHtml(entry.page)}">{{ copy.home.work.open }}</a></td></tr>`).join('\n'),
  };
}
function jsonLd(nodes) {
  return `<script type="application/ld+json">${JSON.stringify(nodes).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')}</script>`;
}
function breadcrumb(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) };
}
function document(title, summary, url, type, schemas, body) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(summary)}">
<meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(summary)}">
<meta property="og:type" content="${type}"><meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:image" content="${origin}/assets/img/logo.png">
<include src="partials/head-common.html"></include>${jsonLd(schemas)}</head>
<body class="theme-page"><include src="partials/nav.html"></include>
<main id="main" class="samples-page"><section class="container">${body}</section></main>
<include src="partials/footer.html"></include></body></html>`;
}
function samplesIndexDocument(published) {
  const title = 'Selected work | AceEngineer'; const url = `${origin}/samples/`;
  const rows = published.map(entry => `<tr><td><a href="${escapeHtml(entry.slug)}.html">${escapeHtml(entry.title)}</a></td><td>${escapeHtml(entry.discipline)}</td><td>${escapeHtml(entry.summary)}</td></tr>`).join('\n');
  return document(title, description, url, 'website', [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url, publisher: organization },
    breadcrumb([['Home', `${origin}/`], ['Selected work', url]]),
  ], `<h1>Selected work</h1><p>${notice}</p><h2>Samples</h2><div class="samples-table-wrap"><table class="samples-table"><thead><tr><th>Sample</th><th>Discipline</th><th>What it demonstrates</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}
function sampleDocument(entry) {
  const title = `${entry.title} | AceEngineer`; const url = `${origin}/${entry.page}`;
  return document(title, entry.summary, url, 'article', [
    { '@context': 'https://schema.org', '@type': 'Report', name: title, description: entry.summary, url, publisher: organization, encoding: { '@type': 'MediaObject', contentUrl: `${origin}/${entry.pdf}`, encodingFormat: 'application/pdf' } },
    breadcrumb([['Home', `${origin}/`], ['Selected work', `${origin}/samples/`], [entry.title, url]]),
  ], `<p class="kicker">${escapeHtml(entry.discipline)}</p><h1>${escapeHtml(entry.title)}</h1><p>${escapeHtml(entry.summary)}</p><h2>Report</h2><p><a href="../${escapeHtml(entry.pdf)}">Open the report (PDF, ${entry.pdfKb} KB)</a></p><p>${notice}</p><p><a href="index.html">All samples</a></p>`);
}
async function buildSamplePages(registry, { distDir, assetsRoot, renderHtml }) {
  validateSamples(registry, { assetsRoot });
  const published = publishedSamples(registry);
  if (!published.length) return 0;
  const { loadCopy, canonicalUrlFor } = require('../build');
  const pages = [['samples/index.html', samplesIndexDocument(published)], ...published.map(entry => {
    const pdfKb = Math.round(fs.statSync(path.join(assetsRoot, entry.pdf.slice('assets/'.length))).size / 1024);
    return [entry.page, sampleDocument({ ...entry, pdfKb })];
  })];
  fs.mkdirSync(path.join(distDir, 'samples'), { recursive: true });
  for (const [file, source] of pages) {
    const html = await renderHtml(source, { rootPath: '../', copy: loadCopy(), canonicalUrl: canonicalUrlFor(file), metadataExcluded: false, ...sampleLocals(registry) });
    fs.writeFileSync(path.join(distDir, file), html);
  }
  return pages.length;
}
module.exports = { loadSamples, validateSamples, publishedSamples, sampleLocals, samplesIndexDocument, sampleDocument, buildSamplePages };
