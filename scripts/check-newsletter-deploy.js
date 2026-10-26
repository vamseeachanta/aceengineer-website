const fs = require('node:fs');
const path = require('node:path');

function assertNewsletterDeployReady(html, deployCheck) {
  if (deployCheck !== '1') return;
  const token = html.match(/\[\[[^\]]+\]\]|TODO_[A-Z0-9_]+|CONTACT_EMAIL/);
  if (token) throw new Error(`Unfilled newsletter token: ${token[0]}`);
  const decoded = html.replace(/&#(x[0-9a-f]+|[0-9]+);|&(commat|period);/gi, (entity, numeric, named) => {
    if (named) return named.toLowerCase() === 'commat' ? '@' : '.';
    const code = numeric[0].toLowerCase() === 'x' ? parseInt(numeric.slice(1), 16) : Number(numeric);
    return code <= 0x10ffff ? String.fromCodePoint(code) : entity;
  });
  const contacts = decoded.match(/(?:"[^"\r\n]+"|[a-z0-9.!#$%&'*+/=?^_`{|}~-]+)@(?:[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z0-9-]+|\[[a-z0-9:.]+\])/gi) || [];
  const allowed = ['support', 'aceengineer.com'].join('@');
  if (contacts.some(contact => contact !== allowed)) throw new Error('Unapproved newsletter contact address');
}

function assertNewsletterSourcesReady(contentRoot, deployCheck) {
  if (deployCheck !== '1') return;
  for (const page of ['newsletter/issue-001-energy-street/index.html', 'newsletter/topics/one-place-to-work/index.html', 'newsletter/index.html', 'newsletter/feed.xml']) {
    assertNewsletterDeployReady(fs.readFileSync(path.join(contentRoot, page), 'utf8'), deployCheck);
  }
}

if (require.main === module) {
  assertNewsletterSourcesReady(path.resolve(__dirname, '../content'), process.env.NEWSLETTER_DEPLOY_CHECK);
  console.log('Newsletter deploy check passed');
}

module.exports = { assertNewsletterDeployReady, assertNewsletterSourcesReady };
