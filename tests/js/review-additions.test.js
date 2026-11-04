// Guards for the eight market-review website additions (checks page, solver
// automation, reproducible studies, agentic workflows, offshore energy data,
// public prompts held, team roles, newsletter series).
// Every visible claim on these surfaces is in the claim register; these tests
// pin the public records and keep unbacked wording off the pages.
// Run after `npm run build` (reads dist/).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const yaml = require('js-yaml');

const dist = rel => path.join('dist', rel);
const load = rel => new JSDOM(fs.readFileSync(dist(rel), 'utf8')).window.document;
const text = doc => doc.body.textContent.replace(/\s+/g, ' ');
const visibleAndMeta = doc => [
  text(doc),
  doc.title,
  ...[...doc.querySelectorAll('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"]')].map(m => m.getAttribute('content') || ''),
  ...[...doc.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent),
].join(' ');

const NEW_PAGES = {
  checks: 'how-results-are-checked/index.html',
  solvers: 'solver-automation/index.html',
  studies: 'reproducible-studies/index.html',
};
const TOUCHED = [
  ...Object.values(NEW_PAGES),
  'ai-automation/index.html',
  'about.html',
  'newsletter/index.html',
  'engineering.html',
  'services/offshore-energy-data.html',
];

// Kept off the site by the review (section 10) and the website claims review.
const BANNED = [
  /\bverified\b/i, /\bvalidated\b/i, /\bcertified\b/i, /\bproven\b/i, /\breproduced\b/i,
  /execution-verified/i, /computer-use/i, /demonstration data/i, /action trace/i, /training data/i,
  /\bSACS\b/, /\bMOSES\b/, /\bWAMIT\b/, /Code_Aster/, /OpenFAST/,
  /\bCATIA\b/, /SolidWorks/, /\bRevit\b/, /\bTekla\b/, /HyperMesh/, /\bANSA\b/,
  /\d[\d,]*\+? (domain )?experts/i, /engineers trained/i, /partner logos?/i,
  /\bconsultancy\b/i, /cutting-edge AI/i, /revolutionary/i,
  /Main Street/,
];

describe('Review additions: pages exist with distinct metadata', () => {
  test.each(Object.values(NEW_PAGES))('%s builds with a title, h1 and a description that is not the title', rel => {
    expect(fs.existsSync(dist(rel))).toBe(true);
    const doc = load(rel);
    const title = doc.title.trim();
    const desc = doc.querySelector('meta[name="description"]').getAttribute('content').trim();
    expect(title.length).toBeGreaterThan(10);
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(desc.length).toBeGreaterThan(50);
    expect(desc.length).toBeLessThanOrEqual(160);
    expect(desc).not.toBe(title);
    expect(doc.querySelector('meta[property="og:url"]').getAttribute('content'))
      .toBe(`https://www.aceengineer.com/${rel.replace(/index\.html$/, '')}`);
  });
});

describe('Review additions: no unbacked wording on any touched surface', () => {
  test.each(TOUCHED)('%s carries none of the banned claims', rel => {
    const all = visibleAndMeta(load(rel));
    for (const re of BANNED) expect(all).not.toMatch(re);
  });

  test('Deckhand is not presented as an available service on touched pages', () => {
    for (const rel of TOUCHED) {
      const all = text(load(rel));
      expect(all).not.toMatch(/Deckhand (agent|API|service) (is|are) (available|live|offered)/i);
      expect(all).not.toMatch(/ask Deckhand|run it (from chat )?with Deckhand|use Deckhand/i);
    }
  });

  test('internal links on new pages resolve to built files', () => {
    for (const rel of Object.values(NEW_PAGES)) {
      const doc = load(rel);
      for (const a of doc.querySelectorAll('a[href]')) {
        const href = a.getAttribute('href');
        if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;
        const target = path.normalize(path.join(path.dirname(rel), href.split('#')[0]));
        const candidate = target.endsWith(path.sep) || href.endsWith('/') ? path.join(target, 'index.html') : target;
        expect([rel, href, fs.existsSync(dist(candidate))]).toEqual([rel, href, true]);
      }
    }
  });
});

describe('Item 1: how results are checked', () => {
  const doc = () => load(NEW_PAGES.checks);

  test('shows the three kinds of check and the engineer approval', () => {
    const t = text(doc());
    expect(t).toMatch(/analytical/i);
    expect(t).toMatch(/second solver/i);
    expect(t).toMatch(/standard, edition and clause/i);
    expect(t).toMatch(/approved by Vamsee Achanta, Principal Engineer/);
  });

  test('no touched surface says a deliverable is signed (owner ruling, 30 Oct)', () => {
    for (const rel of TOUCHED) {
      const all = visibleAndMeta(load(rel));
      expect([rel, /signs each deliverable|signs the deliverable|before they are signed|signed by a licensed engineer|signed by Vamsee/i.test(all)]).toEqual([rel, false]);
    }
  });

  test('the analytical-check example quotes the sloshing report, with the difference band rounded to two decimals', () => {
    const t = text(doc());
    const report = text(load('reports/sloshing/index.html'));
    for (const value of ['0.758054 Hz', '0.755807 Hz']) {
      expect(t).toContain(value);
      expect(report).toContain(value);
    }
    // The band is read from the report, not restated here; the page shows it to two decimals.
    const band = report.match(/(\d+\.\d+)–(\d+\.\d+)\s*%/);
    expect(band).not.toBeNull();
    const [lo, hi] = [band[1], band[2]].map(v => Number(v).toFixed(2));
    expect(t).toContain(`differs from the analytical value by ${lo} % to ${hi} %`);
    expect(t).not.toMatch(/analytical value by \d+\.\d{3,}/);
    expect(doc().querySelector('a[href$="reports/sloshing/"]')).not.toBeNull();
  });

  test('the module-check count matches the committed catalogue summary', () => {
    const summary = JSON.parse(fs.readFileSync('assets/data/module-catalogue-summary.json', 'utf8'));
    expect(text(doc())).toContain(`${summary.outward} of ${summary.modules} modules pass their cited checks (catalogue run ${summary.date})`);
    expect(doc().querySelector('a[href$="about.html#module-checks"]')).not.toBeNull();
  });

  test('the second-solver check states the method only while numbers are under source review', () => {
    const d = doc();
    const t = text(d);
    expect(t).not.toMatch(/OrcaWave[^.]*\d+(\.\d+)?\s*%/);
    expect(d.querySelector('a[href$="reports/diffraction/"]')).not.toBeNull();
    const h = d.querySelector('#second-solver');
    expect(h.textContent).toMatch(/method/i);
    const list = h.nextElementSibling.textContent.replace(/\s+/g, ' ');
    expect(list).toMatch(/numerical results are under source review/);
    // The page and its metadata do not promise a published example of every kind of check.
    expect(visibleAndMeta(d)).not.toMatch(/example of each/i);
  });

  test('every service page links the checks page', () => {
    for (const f of fs.readdirSync(dist('services')).filter(f => f.endsWith('.html'))) {
      const s = load(path.join('services', f));
      expect([f, !!s.querySelector('a[href$="how-results-are-checked/"]')]).toEqual([f, true]);
    }
  });
});

describe('Item 2: solver automation', () => {
  const doc = () => load(NEW_PAGES.solvers);

  test('names each solver with a public code link', () => {
    const d = doc();
    const t = text(d);
    for (const name of ['OrcaFlex', 'OrcaWave', 'AQWA', 'OpenFOAM', 'ANSYS']) expect(t).toContain(name);
    const hrefs = [...d.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
    for (const p of [
      'src/digitalmodel/solvers/orcaflex',
      'tests/workflows/test_orcaflex_batch_contract.py',
      'src/digitalmodel/solvers/orcawave',
      'src/digitalmodel/hydrodynamics/aqwa',
      'src/digitalmodel/solvers/openfoam',
      'src/digitalmodel/ansys/apdl_generator.py',
    ]) expect(hrefs.some(h => h.startsWith('https://github.com/vamseeachanta/digitalmodel/') && h.includes(p))).toBe(true);
  });

  test('ANSYS is described as input generation and batch scripts, not as checked results', () => {
    const d = doc();
    const t = text(d);
    expect(t).toMatch(/APDL input files are generated/i);
    const row = [...d.querySelectorAll('tr')].find(r => /ANSYS/.test(r.textContent));
    expect(row.textContent.replace(/\s+/g, ' ')).toMatch(/no checked ANSYS results are published/i);
    expect(d.querySelector('#checks').nextElementSibling.textContent.replace(/\s+/g, ' ')).toMatch(/except ANSYS/);
    for (const all of [visibleAndMeta(d), visibleAndMeta(load('engineering.html'))]) {
      expect(all).not.toMatch(/ANSYS[^.]*(results are checked|checked results)/i);
    }
    // Every "results are checked" sentence on these surfaces carries the ANSYS exception,
    // except the generic definition on the checks page, which names no solver.
    for (const rel of [NEW_PAGES.solvers, 'engineering.html']) {
      const sentences = visibleAndMeta(load(rel)).split(/(?<=\.)\s/).filter(x => /\bare checked against\b/i.test(x));
      expect(sentences.length).toBeGreaterThan(0);
      for (const x of sentences) expect([rel, x, /except ANSYS/.test(x)]).toEqual([rel, x, true]);
    }
  });

  test('the FAIL verdict is claimed for OrcaFlex batches only', () => {
    for (const rel of [NEW_PAGES.solvers, 'engineering.html']) {
      const sentences = visibleAndMeta(load(rel)).split(/(?<=\.)\s/).filter(x => /FAIL verdict/.test(x));
      expect(sentences.length).toBeGreaterThan(0);
      for (const x of sentences) {
        expect([rel, x, /OrcaFlex/.test(x)]).toEqual([rel, x, true]);
        // No other solver shares the FAIL contract.
        expect([rel, x, /OrcaWave|AQWA|OpenFOAM|ANSYS/.test(x)]).toEqual([rel, x, false]);
      }
    }
  });

  test('engineering.html links the solver automation page and the checks page', () => {
    const e = load('engineering.html');
    expect(e.querySelector('#solver-automation a[href$="solver-automation/"]')).not.toBeNull();
    expect(e.querySelector('#solver-automation a[href$="how-results-are-checked/"]')).not.toBeNull();
  });
});

describe('Item 3: reproducible studies hub', () => {
  const doc = () => load(NEW_PAGES.studies);

  test('lists every case study and the sloshing report', () => {
    const d = doc();
    const hrefs = [...d.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
    const studies = fs.readdirSync('content/case-studies').filter(f => f.endsWith('.html') && f !== 'index.html');
    for (const f of studies) expect([f, hrefs.some(h => h.endsWith(`case-studies/${f}`))]).toEqual([f, true]);
    expect(hrefs.some(h => h.endsWith('reports/sloshing/'))).toBe(true);
  });

  test('the sloshing data release is linked by its committed manifest', () => {
    const pointer = JSON.parse(fs.readFileSync('config/sloshing-data-release.json', 'utf8'));
    const hrefs = [...doc().querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
    expect(hrefs.some(h => h.endsWith(pointer.release.manifest))).toBe(true);
  });

  test('synthetic inputs are named as synthetic', () => {
    const row = [...doc().querySelectorAll('tr')].find(r => r.querySelector('a[href$="bsee-field-economics.html"]'));
    expect(row).toBeDefined();
    expect(row.textContent).toMatch(/synthetic/i);
  });

  test('the case-studies index links the hub', () => {
    expect(load('case-studies/index.html').querySelector('a[href$="reproducible-studies/"]')).not.toBeNull();
  });
});

describe('Item 3: data sets are described as what they are', () => {
  test('marine safety rests on third-party public records, not a frozen release', () => {
    const d = load(NEW_PAGES.studies);
    const row = [...d.querySelectorAll('tr')].find(r => /Marine safety/.test(r.textContent));
    expect(row.textContent.replace(/\s+/g, ' ')).toMatch(/no frozen snapshot/);
    expect(d.querySelector('#with-data').textContent).toMatch(/public data/i);
    // The introduction and the descriptions say "data set or public data source", not a data set for every study.
    for (const x of [d.querySelector('h1').nextElementSibling.textContent, d.querySelector('meta[name="description"]').getAttribute('content')]) {
      expect(x).toMatch(/data set or public data source/);
    }
  });
});

describe('Item 4: agentic engineering workflows', () => {
  test('ai-automation describes the job steps, what the engineer approves, and keeps the agreed-scope line', () => {
    const d = load('ai-automation/index.html');
    const t = text(d);
    expect(d.querySelector('#agentic-job')).not.toBeNull();
    expect(t).toMatch(/separately agreed scope/i);
    expect(t).toMatch(/engineer sets the acceptance criteria/i);
    expect(t).toMatch(/approves the deliverable/i);
    expect(d.querySelector('#agentic-job a[href$="solver-automation/"]')).not.toBeNull();
    expect(d.querySelector('#agentic-job a[href$="how-results-are-checked/"]')).not.toBeNull();
    // The workflow standard and review scripts carry internal wording; they are not linked from the page.
    expect([...d.querySelectorAll('#agentic-job a[href]')].some(a => a.getAttribute('href').startsWith('https://github.com/vamseeachanta/workspace-hub/'))).toBe(false);
  });
});

describe('Item 5: offshore energy data pipeline', () => {
  test('the service page lists the pipeline steps and links the public BSEE code', () => {
    const d = load('services/offshore-energy-data.html');
    expect(d.querySelectorAll('[data-pipeline] li').length).toBeGreaterThanOrEqual(3);
    expect(text(d)).toMatch(/Bureau of Safety and Environmental Enforcement \(BSEE\)/);
    expect(d.querySelector('a[href="https://github.com/vamseeachanta/worldenergydata/tree/main/packages/worldenergydata-bsee"]')).not.toBeNull();
  });

  test('regions other than the Gulf of Mexico are not named on the service page', () => {
    const t = text(load('services/offshore-energy-data.html'));
    for (const re of [/North Sea/i, /\bSODIR\b/, /\bUKCS\b/, /Brazil/i, /Texas RRC|Railroad Commission/i]) expect(t).not.toMatch(re);
  });

  test('only the energy-data service carries a pipeline list', () => {
    const copy = yaml.load(fs.readFileSync('brand/copy.yaml', 'utf8'));
    copy.service_details.forEach((s, i) => expect([i, !!s.pipeline, !!s.code_link]).toEqual([i, i === 5, i === 5]));
  });
});

describe('Item 6: public prompts are held', () => {
  test('no page publishes a rerun prompt yet', () => {
    for (const rel of TOUCHED) expect(text(load(rel))).not.toMatch(/How to repeat this analysis/);
  });
});

describe('Item 7: the team section on About', () => {
  test('roles are named by profession plus Deckhand, never "(agent)", with the approver', () => {
    const d = load('about.html');
    const section = d.querySelector('#team');
    expect(section).not.toBeNull();
    const roles = [...section.querySelectorAll('[data-role]')].map(li => li.textContent.replace(/\s+/g, ' ').trim());
    expect(roles.length).toBeGreaterThanOrEqual(5);
    for (const r of roles) expect(r).toMatch(/^[A-Z][a-z]+( [a-z]+)? Deckhand: /);
    for (const name of ['Naval architect Deckhand', 'Riser engineer Deckhand', 'Corrosion Deckhand', 'Analyst Deckhand', 'Editor Deckhand']) {
      expect(roles.some(r => r.startsWith(name + ':'))).toBe(true);
    }
    const t = section.textContent.replace(/\s+/g, ' ');
    expect(t).not.toMatch(/\(agent\)|Checker/);
    expect(t).toMatch(/Vamsee Achanta, Principal Engineer, approves each deliverable\./);
    // Owner ruling, 30 Oct: no licence wording and no AI wording in the body copy.
    expect(t).not.toMatch(/P\.E\.|licensed|specialist agents|\bagents?\b|\bAI\b/);
  });
});

describe('Item 8: newsletter series', () => {
  test('the series line is the approved fixed line and the issue archive stays', () => {
    const d = load('newsletter/index.html');
    const series = d.querySelector('#series');
    expect(series).not.toBeNull();
    expect(series.textContent.replace(/\s+/g, ' ')).toContain('Is engineering cooked? Find out on the Deckhand journey. On the way, we aim to make engineering enjoyable again.');
    expect(series.textContent).toMatch(/Energy Street/);
    expect(d.querySelector('a[href="issue-001-energy-street/"]')).not.toBeNull();
  });
});

describe('keyword tracking', () => {
  test('review keywords are tracked and held keywords are not added', () => {
    const k = yaml.load(fs.readFileSync('config/keywords.yaml', 'utf8')).keywords;
    const all = [...k.primary, ...k.secondary, ...k.long_tail].map(s => s.toLowerCase());
    for (const kw of ['offshore engineering analysis', 'agentic engineering workflows', 'orcaflex batch runs', 'checked engineering calculations', 'reproducible engineering study', 'bsee data analysis']) {
      expect(all).toContain(kw);
    }
    for (const held of ['reproduced engineering study', 'engineering analysis prompt', 'main street newsletter']) expect(all).not.toContain(held);
  });
});
