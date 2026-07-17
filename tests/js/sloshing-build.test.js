const fs = require('fs');
const path = require('path');
const { validateSloshingRelease } = require('../../build');

const root = path.resolve(__dirname, '../..');

describe('sloshing report build contract', () => {
  test('validates the pinned immutable release and complete file set', () => {
    const release = validateSloshingRelease(root);
    expect(release.digest).toMatch(/^[a-f0-9]{64}$/);
    expect(release.assetPath).toBe(`assets/data/sloshing/${release.digest}`);
    expect(release.files).toEqual(expect.arrayContaining(['cases.csv', 'metrics.csv', 'manifest.json']));
  });

  test('canonical report sources use only relative local data and libraries', () => {
    for (const name of ['sloshing-cfd-case.html', 'sloshing-tank-summary.html', 'sloshing-cfd-analysis.html']) {
      const html = fs.readFileSync(path.join(root, 'content/reports', name), 'utf8');
      expect(html).toContain('{{ sloshingAssetPath }}');
      expect(html).toContain('{{ rootPath }}assets/js/plotly-2.32.0.min.js');
      expect(html).toContain('{{ rootPath }}assets/js/sloshing-reports.js');
      expect(html).toContain('{{ rootPath }}assets/css/sloshing-reports.css');
      expect(html).not.toMatch(/(?:src|href)=["']https?:\/\/(?:huggingface|cdn\.)/i);
    }
  });

  test('discovery and sitemap expose the capability, browser, validation fixture, and reports', () => {
    const cases = fs.readFileSync(path.join(root, 'content/case-studies/index.html'), 'utf8');
    const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
    expect(cases).toContain('../reports/sloshing-cfd-case.html');
    expect(cases).toContain('../reports/sloshing-tank-summary.html');
    expect(cases).toContain('../reports/sloshing-cfd-analysis.html');
    expect(cases).toContain('../reports/sloshing/');
    expect(cases).toContain('../reports/sloshing/browse.html');
    expect(cases).toContain('../reports/sloshing/validation.html');
    expect(sitemap).toContain('/reports/sloshing-cfd-case.html');
    expect(sitemap).toContain('/reports/sloshing-tank-summary.html');
    expect(sitemap).toContain('/reports/sloshing-cfd-analysis.html');
    expect(sitemap).toContain('/reports/sloshing/</loc>');
    expect(sitemap).toContain('/reports/sloshing/browse.html');
    expect(sitemap).toContain('/reports/sloshing/study.html');
    expect(sitemap).toContain('/reports/sloshing/comparison.html');
    expect(sitemap).toContain('/reports/sloshing/validation.html');
    expect(sitemap).toContain('/reports/sloshing/analysis.html');

    for (const name of ['study.html', 'comparison.html', 'validation.html', 'analysis.html']) {
      expect(fs.existsSync(path.join(root, 'content/reports/sloshing', name))).toBe(true);
    }
  });

  test('stable validation fixture pins its evidence and provides capability navigation', () => {
    const validation = fs.readFileSync(path.join(root, 'content/reports/sloshing/validation.html'), 'utf8');
    const nav = fs.readFileSync(path.join(root, 'content/partials/sloshing-capability-nav.html'), 'utf8');
    const release = JSON.parse(fs.readFileSync(path.join(root, 'config/sloshing-data-release.json'), 'utf8'));

    expect(validation).toContain('Tank Sloshing CFD Validation');
    expect(validation).toContain(release.source.revision);
    expect(validation).toContain(release.release.digest);
    expect(validation).toContain('0.758054 Hz');
    expect(validation).toContain('0.2964–0.3264%');
    expect(validation).toContain('non_asymptotic_caution');
    expect(validation).toContain('publish_with_courant_caveat');
    expect(nav).toContain('reports/sloshing/validation.html');
    expect(nav).toContain('reports/sloshing/browse.html');
    expect(nav).toContain('reports/sloshing/study.html');
    expect(nav).toContain('reports/sloshing/comparison.html');
    expect(nav).toContain('Data &amp; provenance');
  });

  test('primary sloshing page is a substantive no-JavaScript engineering summary', () => {
    const summary = fs.readFileSync(path.join(root, 'content/reports/sloshing/index.html'), 'utf8');
    expect(summary).toContain('Tank Sloshing CFD Analysis');
    expect(summary).toContain('0.2964–0.3264%');
    expect(summary).toContain('broad 22–24 second maximum');
    expect(summary).toContain('Published period sweep');
    expect(summary).toContain('Case-specific CFD evidence');
    expect(summary).toContain('Conclusions and limits');
    expect(summary).toContain('Data provenance');
    expect(summary).not.toContain('data-sloshing-browser');
  });
});
