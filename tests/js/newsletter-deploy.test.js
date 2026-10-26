const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = typeof jest === 'undefined' ? require('node:test') : global.test;
const { assertNewsletterDeployReady } = require('../../scripts/check-newsletter-deploy');

const issue = path.resolve(__dirname, '../../content/newsletter/issue-001-energy-street/index.html');
const topic = path.resolve(__dirname, '../../content/newsletter/topics/one-place-to-work/index.html');
const deployScript = path.resolve(__dirname, '../../scripts/check-newsletter-deploy.js');
const pages = ['newsletter/issue-001-energy-street/index.html', 'newsletter/topics/one-place-to-work/index.html'];
const tokens = ['[[SEND DATE]]', 'TODO_ARTICLE_URL_A1', 'TODO_DUAL_TANK_URL', '[[ANOTHER DATE]]', 'TODO_NEW_LINK_2', 'CONTACT_EMAIL'];

for (const token of tokens) {
  for (const html of [`<a href="${token}">Read</a>`, `<p id="send-date">${token}</p>`]) {
    test(`deploy check rejects ${token} in ${html.startsWith('<a') ? 'href' : 'masthead'}`, () => {
      assert.throws(() => assertNewsletterDeployReady(html, '1'), /Unfilled newsletter token/);
      assert.doesNotThrow(() => assertNewsletterDeployReady(html, undefined));
      assert.doesNotThrow(() => assertNewsletterDeployReady(html, '0'));
    });
  }
}

for (const page of pages) {
  test(`deploy command rejects CONTACT_EMAIL in ${page}`, () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'newsletter-deploy-'));
    const script = path.join(fixture, 'scripts/check-newsletter-deploy.js');
    fs.mkdirSync(path.dirname(script), { recursive: true });
    fs.copyFileSync(deployScript, script);
    for (const file of pages) {
      const target = path.join(fixture, 'content', file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, file === page ? '<p>CONTACT_EMAIL</p>' : '<p>Ready</p>');
    }
    const result = spawnSync(process.execPath, [script], {
      cwd: fixture,
      env: { ...process.env, NEWSLETTER_DEPLOY_CHECK: '1' },
      encoding: 'utf8',
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unfilled newsletter token: CONTACT_EMAIL/);
  });
}

test('the filled pages pass the deploy command', () => {
  const result = spawnSync(process.execPath, [deployScript], {
    env: { ...process.env, NEWSLETTER_DEPLOY_CHECK: '1' },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Newsletter deploy check passed/);
});

test('the issue and topic retain all five filled contact locations', () => {
  const contact = ['support', 'aceengineer.com'].join('@');
  for (const [file, address, count] of [[issue, contact, 4], [topic, contact.replace('@', '&#64;'), 1]]) {
    const html = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(html, /CONTACT_EMAIL/);
    assert.equal(html.split(address).length - 1, count);
    assert.doesNotThrow(() => assertNewsletterDeployReady(html, '1'));
  }
});

test('the filled issue passes the deploy check with and without the flag', () => {
  const html = fs.readFileSync(issue, 'utf8');
  assert.doesNotThrow(() => assertNewsletterDeployReady(html, '1'));
  assert.doesNotThrow(() => assertNewsletterDeployReady(html, process.env.NEWSLETTER_DEPLOY_CHECK));
  assert.match(html, /<title>The Deckhand Chronicles: Energy Street, Issue 1<\/title>/);
  assert.match(html, /id="send-date"[^>]*>October 27, 2026 · Launch issue/);
  const schemas = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schemas.find(schema => schema['@type'] === 'Article').datePublished, '2026-10-27');
});

test('the issue retains the approved article bytes and ten links', () => {
  const html = fs.readFileSync(issue, 'utf8');
  const article = html.match(/<article id="newsletter-edition">([\s\S]*?)<\/article>/)[1];
  assert.equal(crypto.createHash('sha256').update(article).digest('hex'),
    '5ae623aba73bc6c7c6170e2569919d396ce6720d79e808d01c1ab866b36cfabb');
  assert.equal((article.match(/<a\b/g) || []).length, 10);
});
