const fs = require('fs');
const path = require('path');
const posthtml = require('posthtml');
const { builtPages, canonicalUrlFor, SITEMAP_EXCLUDE } = require('../build');

function measureAgentReadable(dir) {
  const read = file => fs.existsSync(path.join(dir, file)) ? fs.readFileSync(path.join(dir, file), 'utf8') : '';
  const sitemap = read('sitemap.xml');
  const llms = read('llms.txt');
  const pages = builtPages(dir).filter(page => !Object.hasOwn(SITEMAP_EXCLUDE, page));
  function descriptions(prefix, includeIndex) {
    const selected = pages.filter(page => page.startsWith(prefix) && (includeIndex || !page.endsWith('index.html')));
    return { total: selected.length, described: selected.filter(page => llms.split('\n')
      .some(line => line.includes(`](${canonicalUrlFor(page)}): `))).length };
  }
  const jsonLdPages = pages.filter(page => {
    const tree = posthtml().process(read(page), { sync: true, lowerCaseTags: true, lowerCaseAttributeNames: true }).tree;
    let found = false;
    function visit(nodes) {
      for (const node of nodes) {
        if (!node || typeof node !== 'object') continue;
        if (node.tag === 'script' && node.attrs?.type === 'application/ld+json') found = true;
        if (node.content) visit(node.content);
      }
    }
    visit(tree);
    return found;
  }).length;
  return {
    indexedPages: pages.length,
    llmsPresent: fs.existsSync(path.join(dir, 'llms.txt')),
    fullTextPresent: fs.existsSync(path.join(dir, 'llms-full.txt')),
    sitemapUrls: (sitemap.match(/<loc>/g) || []).length,
    sitemapLastmod: (sitemap.match(/<lastmod>/g) || []).length,
    caseStudies: descriptions('case-studies/', false),
    dataPages: descriptions('data/', true),
    reportsIndexPresent: fs.existsSync(path.join(dir, 'reports/index.html')),
    jsonLdPages,
    robotsRules: read('robots.txt').split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#')),
  };
}

if (require.main === module) console.log(JSON.stringify(measureAgentReadable(process.argv[2] || 'dist'), null, 2));
module.exports = { measureAgentReadable };
