const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA = 'content/data/case-study-summaries.json';
const PARTIAL = 'content/partials/case-study-summary.html';

function loadStudies(root = ROOT) {
  return JSON.parse(fs.readFileSync(path.join(root, DATA), 'utf8'));
}

function escapeText(value) {
  // Braces are encoded because this partial is expanded before PostHTML expressions.
  return String(value).replace(/[&<>"'{}]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    '{': '&#123;', '}': '&#125;',
  })[char]);
}

// Only paths actually published by the build count as internal destinations.
function siteFile(url, root) {
  if (typeof url !== 'string' || !/^\/[a-zA-Z0-9_./-]+$/.test(url)) return null;
  if (url.startsWith('//') || url.split('/').some(part => part.startsWith('.'))) return null;
  const relative = url.slice('/'.length);
  const published = relative.startsWith('assets/')
    ? path.join(root, relative)
    : path.join(root, 'content', relative.endsWith('/') ? `${relative}index.html` : relative);
  if (!relative.startsWith('assets/') && (!published.endsWith('.html') || relative.startsWith('partials/'))) return null;
  if (!fs.existsSync(published) || !fs.statSync(published).isFile()) return null;
  const real = fs.realpathSync(published);
  if (!real.startsWith(`${fs.realpathSync(root)}${path.sep}`)) return null;
  return published;
}

function reportHref(report, root = ROOT) {
  if (!report || typeof report.url !== 'string') return null;
  if (siteFile(report.url, root)) return report.url;
  // External reports must be immutable public repository files with a matching
  // recorded, read-only existence check. The build never requests remote URLs.
  if (!/^https:\/\/github\.com\/[^/?#]+\/[^/?#]+\/blob\/[a-f\d]+\/[^?#]+$/.test(report.url)) return null;
  const check = report.verification;
  if (!check || check.url !== report.url || check.publicFile !== true ||
    typeof check.checkedAt !== 'string' || !Number.isFinite(Date.parse(check.checkedAt))) return null;
  return report.url;
}

function renderWorkflow(workflow, root) {
  const fields = ['method', 'toolLabel', 'toolUrl', 'action', 'output', 'limitation'];
  if (!workflow || !Array.isArray(workflow.inputs) || !workflow.inputs.length ||
    !workflow.inputs.every(input => typeof input === 'string' && input.trim()) ||
    !fields.every(field => typeof workflow[field] === 'string' && workflow[field].trim()) ||
    !siteFile(workflow.toolUrl, root)) {
    return '<p>Not yet available as a public workflow</p>';
  }
  return `<p><strong>Inputs:</strong></p><ul>${workflow.inputs.map(input => `<li>${escapeText(input)}</li>`).join('')}</ul>
        <p><strong>Method:</strong> ${escapeText(workflow.method)}</p>
        <p data-workflow-tool><strong>Public tool:</strong> <a href="${escapeText(workflow.toolUrl)}">${escapeText(workflow.toolLabel)}</a></p>
        <p><strong>Run:</strong> ${escapeText(workflow.action)}</p>
        <p><strong>Expected output:</strong> ${escapeText(workflow.output)}</p>
        <p><strong>Limits:</strong> ${escapeText(workflow.limitation)}</p>`;
}

function renderSummary(study, root = ROOT) {
  const values = {};
  for (const field of ['what', 'inputs', 'result', 'basis']) {
    if (!study.summary || typeof study.summary[field] !== 'string' || !study.summary[field].trim()) {
      throw new Error(`Missing case-study summary field: ${field}`);
    }
    values[field] = escapeText(study.summary[field]);
  }
  if (!Array.isArray(study.evidence) || !study.evidence.length ||
    !study.evidence.every(item => typeof item.path === 'string' &&
      item.path.startsWith('content/') && !item.path.split('/').includes('..') &&
      typeof item.section === 'string' && item.section.trim() &&
      fs.existsSync(path.join(root, item.path)) &&
      fs.readFileSync(path.join(root, item.path), 'utf8').includes(item.section))) {
    throw new Error('Case-study source evidence must name an existing public page section');
  }
  const href = reportHref(study.report, root);
  values.report = href
    ? `<p><a data-full-report-link href="${escapeText(href)}">See the full report</a></p>`
    : '<p>No public full report yet</p>';
  values.workflow = renderWorkflow(study.workflow, root);
  // A deliberately small slot renderer: all text slots are escaped above and only
  // the report/workflow functions produce markup. No script or style is added.
  return fs.readFileSync(path.join(root, PARTIAL), 'utf8')
    .replace(/{{ (\w+) }}/g, (_, field) => {
      if (!(field in values)) throw new Error(`Unknown case-study partial slot: ${field}`);
      return values[field];
    }).trimEnd();
}

function addCaseStudyBlocks(content, relativePath, root = ROOT) {
  const relative = relativePath.split(path.sep).join('/');
  if (!relative.startsWith('case-studies/') || !relative.endsWith('.html')) return content;
  if (content.includes('data-case-study-overview') || content.includes('data-case-study-summary-link')) {
    throw new Error('Case-study blocks already present');
  }
  const studies = loadStudies(root);
  if (relative === 'case-studies/index.html') {
    const linked = new Set();
    const enriched = content.replace(/<article\b[^>]*>[\s\S]*?<\/article>/g, card => {
      const page = Object.keys(studies).find(name => card.includes(`href="${name}"`));
      if (!page) return card;
      linked.add(page);
      return card.replace('</article>', `<p data-case-study-summary-link><a href="${escapeText(page)}#case-study-summary">Read the summary</a></p>\n</article>`);
    });
    if (linked.size !== Object.keys(studies).length) throw new Error('Missing case-study index card');
    return enriched;
  }
  const page = relative.slice('case-studies/'.length);
  if (!Object.hasOwn(studies, page)) throw new Error('New case study must register summary data');
  if (!/<h1\b[^>]*>[\s\S]*?<\/h1>/.test(content)) throw new Error('Case-study heading missing');
  return content.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/, heading => `${heading}\n${renderSummary(studies[page], root)}\n`);
}

module.exports = { addCaseStudyBlocks, renderSummary, reportHref, loadStudies };
