const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = typeof jest === 'undefined' ? require('node:test') : global.test;
const { assertNewsletterDeployReady } = require('../../scripts/check-newsletter-deploy');

const issue = path.resolve(__dirname, '../../content/newsletter/issue-001-energy-street/index.html');
const tokens = ['[[SEND DATE]]', 'TODO_ARTICLE_URL_A1', 'TODO_DUAL_TANK_URL', '[[ANOTHER DATE]]', 'TODO_NEW_LINK_2'];

for (const token of tokens) {
  for (const html of [`<a href="${token}">Read</a>`, `<p id="send-date">${token}</p>`]) {
    test(`deploy check rejects ${token} in ${html.startsWith('<a') ? 'href' : 'masthead'}`, () => {
      assert.throws(() => assertNewsletterDeployReady(html, '1'), /Unfilled newsletter token/);
      assert.doesNotThrow(() => assertNewsletterDeployReady(html, undefined));
      assert.doesNotThrow(() => assertNewsletterDeployReady(html, '0'));
    });
  }
}

test('the filled issue passes the deploy check with and without the flag', () => {
  const html = fs.readFileSync(issue, 'utf8');
  assert.doesNotThrow(() => assertNewsletterDeployReady(html, '1'));
  assert.doesNotThrow(() => assertNewsletterDeployReady(html, process.env.NEWSLETTER_DEPLOY_CHECK));
  assert.match(html, /<title>The Deckhand Chronicles: Energy Street, Issue 1<\/title>/);
  assert.match(html, /id="send-date"[^>]*>October 27, 2026 · Launch issue/);
  const schemas = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schemas.find(schema => schema['@type'] === 'Article').datePublished, '2026-10-27');
});

test('the issue retains the approved article bytes and nine links', () => {
  const html = fs.readFileSync(issue, 'utf8');
  const article = html.match(/<article id="newsletter-edition">([\s\S]*?)<\/article>/)[1];
  assert.equal(crypto.createHash('sha256').update(article).digest('hex'),
    '9453da77d71f4c655586cf8c80e4cdae03bed2a918b89a96b84c8fd9125e7ae8');
  assert.equal((article.match(/<a\b/g) || []).length, 9);
});
