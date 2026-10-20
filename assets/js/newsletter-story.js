/* Count an issue's tagged story once on a page visit; never send arbitrary query text. */
(function () {
  'use strict';
  var issue = 'issue-001';
  var query = new URLSearchParams(window.location.search);
  var story = query.get('utm_content');
  if (query.get('utm_campaign') !== issue || !story || !document.getElementById(story)) return;
  if (typeof window.gtag === 'function') window.gtag('event', 'newsletter_story', { issue: issue, story: story });
}());
