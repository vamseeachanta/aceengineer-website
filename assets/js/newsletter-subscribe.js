(() => {
  const form = document.querySelector('form[action="/api/subscribe"]');
  if (!form) return;
  const params = new URLSearchParams(window.location.search);
  const clean = value => value.replace(/[^a-z0-9-]/g, '').slice(0, 40);
  form.elements.source.value = clean(params.get('utm_source') || 'website');
  form.elements.campaign.value = clean(params.get('utm_campaign') || '');
  document.getElementById('subscribe-error').hidden = params.get('error') !== '1';
})();
