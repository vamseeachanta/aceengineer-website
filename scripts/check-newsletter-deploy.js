const fs = require('node:fs');
const path = require('node:path');

function assertNewsletterDeployReady(html, deployCheck) {
  if (deployCheck !== '1') return;
  const token = html.match(/\[\[[^\]]+\]\]|TODO_[A-Z0-9_]+|CONTACT_EMAIL/);
  if (token) throw new Error(`Unfilled newsletter token: ${token[0]}`);
}

function assertNewsletterSourcesReady(contentRoot, deployCheck) {
  if (deployCheck !== '1') return;
  for (const page of ['newsletter/issue-001-energy-street/index.html', 'newsletter/topics/one-place-to-work/index.html']) {
    assertNewsletterDeployReady(fs.readFileSync(path.join(contentRoot, page), 'utf8'), deployCheck);
  }
}

if (require.main === module) {
  assertNewsletterSourcesReady(path.resolve(__dirname, '../content'), process.env.NEWSLETTER_DEPLOY_CHECK);
  console.log('Newsletter deploy check passed');
}

module.exports = { assertNewsletterDeployReady, assertNewsletterSourcesReady };
