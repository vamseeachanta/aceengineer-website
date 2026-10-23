const fs = require('node:fs');
const path = require('node:path');

function assertNewsletterDeployReady(html, deployCheck) {
  if (deployCheck !== '1') return;
  const token = html.match(/\[\[[^\]]+\]\]|TODO_[A-Z0-9_]+/);
  if (token) throw new Error(`Unfilled newsletter token: ${token[0]}`);
}

if (require.main === module) {
  const issue = path.resolve(__dirname, '../content/newsletter/issue-001-energy-street/index.html');
  assertNewsletterDeployReady(fs.readFileSync(issue, 'utf8'), process.env.NEWSLETTER_DEPLOY_CHECK);
  console.log('Newsletter deploy check passed');
}

module.exports = { assertNewsletterDeployReady };
