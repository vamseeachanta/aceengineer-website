const fs = require('node:fs');
const path = require('node:path');

function assertNewsletterDeployReady(html, deployCheck) {
  if (deployCheck !== '1') return;
  for (const token of ['[[SEND DATE]]', 'TODO_ARTICLE_URL_A1', 'TODO_DUAL_TANK_URL']) {
    if (html.includes(token)) throw new Error(`Unfilled newsletter token: ${token}`);
  }
}

if (require.main === module) {
  const issue = path.resolve(__dirname, '../content/newsletter/issue-001-energy-street/index.html');
  assertNewsletterDeployReady(fs.readFileSync(issue, 'utf8'), process.env.NEWSLETTER_DEPLOY_CHECK);
  console.log('Newsletter deploy check passed');
}

module.exports = { assertNewsletterDeployReady };
