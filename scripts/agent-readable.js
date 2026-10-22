const fs = require('fs');
const path = require('path');
const posthtml = require('posthtml');

// Local extraction policy: publish the main landmark's static text in document
// order. This is not a browser layout or JavaScript execution. Heading levels are
// HTML h1–h6 (WHATWG HTML, sections, 2026):
// https://html.spec.whatwg.org/multipage/sections.html#the-h1,-h2,-h3,-h4,-h5,-and-h6-elements
function mainText(html) {
  const tree = posthtml().process(html, {
    sync: true, decodeEntities: true, lowerCaseTags: true, lowerCaseAttributeNames: true,
  }).tree;
  const omitted = new Set(['script', 'style', 'template', 'nav', 'footer']);
  const blocks = new Set(['p', 'div', 'section', 'article', 'header', 'aside',
    'figure', 'figcaption', 'dl', 'dt', 'dd', 'blockquote', 'table', 'ul', 'ol', 'pre']);
  function hidden(node) {
    return node.attrs && (Object.hasOwn(node.attrs, 'hidden') || node.attrs['aria-hidden'] === 'true');
  }
  function findMain(nodes) {
    for (const node of nodes) {
      if (!node || typeof node !== 'object' || omitted.has(node.tag) || hidden(node)) continue;
      if (node.tag === 'main' || node.attrs?.role === 'main') return node;
      const main = findMain(node.content || []);
      if (main) return main;
    }
    return null;
  }
  function text(node) {
    if (typeof node === 'string') return node.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ');
    if (!node || omitted.has(node.tag) || hidden(node)) return '';
    const content = (node.content || []).map(text).join('');
    if (/^h[1-6]$/.test(node.tag)) return `\n\n${'#'.repeat(Number(node.tag.slice(1)))} ${content.trim()}\n\n`;
    if (node.tag === 'br') return '\n';
    if (node.tag === 'td' || node.tag === 'th') return `${content.trim()} `;
    if (node.tag === 'li' || node.tag === 'tr') return `${content.trim()}\n`;
    return blocks.has(node.tag) ? `\n\n${content.trim()}\n\n` : content;
  }
  const main = findMain(tree);
  if (!main) throw new Error('llms-full.txt: missing main content');
  return (main.content || []).map(text).join('')
    .split('\n').map(line => line.replace(/[\t \u00a0]+/g, ' ').trim()).join('\n')
    .replace(/\n\n\n+/g, '\n\n').trim();
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// The register is an explicit public allowlist, not a scan of the reports root.
// Dates use W3C's complete date (1997), as permitted by sitemap protocol 0.9:
// https://www.w3.org/TR/NOTE-datetime#Formats
function renderReportRows(reports) {
  if (!Array.isArray(reports)) throw new Error('Public reports must be an array');
  const seen = new Set();
  return reports.map(report => {
    const { title, date, format, href } = report;
    if (report.public !== true || ![title, date, format, href].every(value => typeof value === 'string' && value.trim())) {
      throw new Error('Public report requires a title, date, format, link and explicit publication flag');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().split('T')[0] !== date) throw new Error('Invalid public report date');
    if (!/^\/reports\/(?:[a-z0-9-]+\/)*(?:[a-z0-9-]+\.html)?$/.test(href)) {
      throw new Error('Public report link must be a local report destination');
    }
    if (href === '/reports/' || href === '/reports/index.html') throw new Error('Report index cannot list itself');
    if (seen.has(href)) throw new Error('Duplicate public report link');
    seen.add(href);
    return `<tr><td><a href="${escapeHtml(href)}">${escapeHtml(title)}</a></td>` +
      `<td><time datetime="${date}">${date}</time></td><td>${escapeHtml(format)}</td></tr>`;
  }).join('\n');
}

function validateReportTargets(reports, destDir, exclusions) {
  renderReportRows(reports);
  for (const report of reports) {
    const rel = report.href.slice(1) + (report.href.endsWith('/') ? 'index.html' : '');
    if (Object.hasOwn(exclusions, rel)) throw new Error(`Public report target is excluded: ${rel}`);
    if (!fs.existsSync(path.join(destDir, rel))) throw new Error(`Public report target is missing: ${rel}`);
  }
}

module.exports = { mainText, renderReportRows, validateReportTargets };
