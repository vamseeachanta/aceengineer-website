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

  test('discovery and sitemap expose both reports', () => {
    const cases = fs.readFileSync(path.join(root, 'content/case-studies/index.html'), 'utf8');
    const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
    expect(cases).toContain('../reports/sloshing-cfd-case.html');
    expect(cases).toContain('../reports/sloshing-tank-summary.html');
    expect(cases).toContain('../reports/sloshing-cfd-analysis.html');
    expect(sitemap).toContain('/reports/sloshing-cfd-case.html');
    expect(sitemap).toContain('/reports/sloshing-tank-summary.html');
    expect(sitemap).toContain('/reports/sloshing-cfd-analysis.html');
  });
});
