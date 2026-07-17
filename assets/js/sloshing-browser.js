(function () {
  'use strict';
  var root = document.querySelector('[data-sloshing-browser]');
  if (!root) return;
  var form = root.querySelector('[data-browser-filters]');
  var grid = root.querySelector('[data-case-grid]');
  var status = root.querySelector('[data-browser-status]');
  var error = root.querySelector('[data-browser-error]');
  var empty = root.querySelector('[data-browser-empty]');
  var count = root.querySelector('[data-result-count]');
  var identity = root.querySelector('[data-release-identity]');
  var catalog = [];

  function csv(text) {
    var rows = [], row = [], cell = '', quoted = false;
    for (var i = 0; i < text.length; i += 1) {
      var ch = text[i], next = text[i + 1];
      if (ch === '"' && quoted && next === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = !quoted;
      else if (ch === ',' && !quoted) { row.push(cell); cell = ''; }
      else if ((ch === '\n' || ch === '\r') && !quoted) {
        if (ch === '\r' && next === '\n') i += 1;
        row.push(cell); if (row.some(function (v) { return v !== ''; })) rows.push(row); row = []; cell = '';
      } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    var head = rows.shift() || [];
    return rows.map(function (values) { var item = {}; head.forEach(function (key, n) { item[key] = values[n] || ''; }); return item; });
  }
  function safe(value) { var d = document.createElement('div'); d.textContent = value == null ? '' : String(value); return d.innerHTML; }
  function title(value) { return String(value || 'not published').replace(/_/g, ' ').replace(/\b\w/g, function (m) { return m.toUpperCase(); }); }
  function option(select, value) { var o = document.createElement('option'); o.value = value; o.textContent = title(value); select.appendChild(o); }
  function unique(items, field) { return Array.from(new Set(items.map(function (x) { return x[field] || 'not_published'; }))).sort(); }
  function mediaFor(previews, id, type) { return previews.find(function (p) { return p.case_id === id && p.media_type.indexOf(type) === 0; }); }
  function qaFor(audits, c) { var audit = audits.find(function (a) { return a.case_id === c.case_id; }); return audit ? audit.qa_status : (c.status === 'accepted' ? 'accepted_summary' : c.status); }
  function depthFor(c, inputs, mesh, series, derived, image, video) {
    var hasInputs = inputs.some(function (x) { return x.case_id === c.case_id; });
    var hasMesh = mesh.some(function (x) { return x.case_id === c.case_id; });
    var hasHistory = series.some(function (x) { return x.case_id === c.case_id; });
    var hasDerived = derived.some(function (x) { return x.case_id === c.case_id; });
    if (hasInputs && hasMesh && hasHistory && hasDerived && image && video) return 'detailed';
    if (hasInputs && hasDerived && image) return 'standard';
    return 'simple';
  }
  function label(c) {
    if (c.loading_condition === 'free_decay') return 'Free-decay ' + title(c.study_axis) + ' verification';
    return 'Forced-roll response' + (c.period_s ? ' · T = ' + c.period_s + ' s' : '');
  }
  function renderCard(c) {
    var imageMarkup = c.image ? '<img loading="lazy" src="' + safe(c.assetBase + c.image.relative_path) + '" alt="' + safe(c.image.alt_text) + '">' : '<span>No selected-case field visual published</span>';
    var truth = c.image ? (c.media_truth === 'representative' ? 'Representative CFD evidence from ' + c.representative_case_id + ' — not this exact case' : 'Case-specific CFD evidence') : 'Text-only card — no visual is presented as CFD evidence';
    var period = c.period_s ? c.period_s + ' s' : (c.frequency_hz ? c.frequency_hz + ' Hz' : '—');
    var media = [c.image ? 'image' : '', c.video ? 'video' : ''].filter(Boolean).join(' + ') || 'none';
    var caseUrl = c.analysis_path || ('../sloshing-cfd-case.html?case=' + encodeURIComponent(c.case_id));
    var qaUrl = '../sloshing-cfd-analysis.html?case=' + encodeURIComponent(c.case_id);
    var links = '<a class="primary" href="' + caseUrl + '">Open case</a><a href="' + qaUrl + '">QA detail</a>';
    if (c.video) links += '<a href="' + safe(c.assetBase + c.video.relative_path) + '" aria-label="Open high-resolution retained-window video for ' + safe(c.case_id) + '">1080p video</a>';
    return '<article class="case-card"><div class="case-media' + (c.image ? '' : ' no-media') + '">' + imageMarkup + '</div><div class="case-body"><div class="badges"><span class="badge ' + c.depth + '">' + title(c.depth) + '</span><span class="badge">' + title(c.loading_condition) + '</span><span class="badge' + (c.qa.indexOf('exceed') >= 0 || c.qa.indexOf('warn') >= 0 ? ' qa-warning' : '') + '">' + title(c.qa) + '</span></div><h2>' + safe(c.title || c.case_id) + '</h2><p class="case-subtitle"><code>' + safe(c.case_id) + '</code> · ' + safe(c.summary || label(c)) + '</p><div class="case-facts"><div><span>Mesh</span><strong>' + safe(title(c.mesh)) + '</strong></div><div><span>Period / frequency</span><strong>' + safe(period) + '</strong></div><div><span>Cells</span><strong>' + safe(c.mesh_cells || '—') + '</strong></div><div><span>Media</span><strong>' + safe(media) + '</strong></div></div><p class="media-truth"><strong>' + truth + '.</strong>' + (c.video ? ' Video: 1080p retained final window; not a full-cycle field record.' : '') + '</p><div class="case-links">' + links + '</div></div></article>';
  }
  function state() { return { depth:form.depth.value, loading:form.loading.value, mesh:form.mesh.value, media:form.media.value, qa:form.qa.value, q:form.q.value.trim().toLowerCase() }; }
  function syncUrl(s) { var p = new URLSearchParams(); Object.keys(s).forEach(function (k) { if (s[k] && s[k] !== 'all') p.set(k, s[k]); }); history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p.toString() : '')); }
  function apply() {
    var s = state();
    var shown = catalog.filter(function (c) {
      var text = [c.case_id,c.loading_condition,c.mesh,c.study_axis,c.period_s,c.frequency_hz].join(' ').toLowerCase();
      var mediaOk = s.media === 'all' || (s.media === 'video' && c.video) || (s.media === 'image' && c.image) || (s.media === 'none' && !c.image && !c.video);
      return (s.depth === 'all' || c.depth === s.depth) && (s.loading === 'all' || c.loading_condition === s.loading) && (s.mesh === 'all' || c.mesh === s.mesh) && (s.qa === 'all' || c.qa === s.qa) && mediaOk && (!s.q || text.indexOf(s.q) >= 0);
    });
    grid.innerHTML = shown.map(renderCard).join(''); count.textContent = shown.length + (shown.length === 1 ? ' case' : ' cases'); empty.hidden = shown.length !== 0; syncUrl(s);
  }
  function restore() { var p = new URLSearchParams(location.search); ['depth','loading','mesh','media','qa'].forEach(function (k) { if (p.has(k) && Array.from(form[k].options).some(function (o) { return o.value === p.get(k); })) form[k].value = p.get(k); }); form.q.value = p.get('q') || ''; }
  function fetchTable(base, manifest, name) { var entry = (manifest.tables || []).find(function (t) { return t.name === name; }); return entry ? fetch(new URL(entry.file, base), { credentials:'same-origin' }).then(function (r) { if (!r.ok) throw new Error(name + ' HTTP ' + r.status); return r.text(); }).then(csv) : Promise.resolve([]); }
  var manifestUrl = new URL(root.getAttribute('data-manifest-url'), location.href);
  fetch(manifestUrl, { credentials:'same-origin' }).then(function (r) { if (!r.ok) throw new Error('Manifest HTTP ' + r.status); return r.json(); }).then(function (manifest) {
    var base = new URL('.', manifestUrl);
    return Promise.all(['cases','previews','inputs','mesh_quality','series','derived_metrics','qa_audit','case_catalog','media_metadata'].map(function (n) { return fetchTable(base, manifest, n); })).then(function (sets) { return { manifest:manifest, base:base, sets:sets }; });
  }).then(function (loaded) {
    var cases=loaded.sets[0], previews=loaded.sets[1], inputs=loaded.sets[2], mesh=loaded.sets[3], series=loaded.sets[4], derived=loaded.sets[5], audits=loaded.sets[6], caseCatalog=loaded.sets[7];
    catalog = cases.map(function (c) { var published=caseCatalog.find(function (x) { return x.case_id === c.case_id; }) || {}; var directImage=mediaFor(previews,c.case_id,'image/'); var image=directImage || (published.representative_case_id ? mediaFor(previews,published.representative_case_id,'image/') : null); var video=mediaFor(previews,c.case_id,'video/'); var mediaTruth=directImage ? 'case_specific' : (image ? 'representative' : 'none'); return Object.assign({},c,published,{image:image,video:video,media_truth:mediaTruth,depth:published.evidence_depth || depthFor(c,inputs,mesh,series,derived,image,video),qa:published.qa_summary || qaFor(audits,c),assetBase:loaded.base.href}); });
    unique(catalog,'loading_condition').forEach(function (v) { option(form.loading,v); }); unique(catalog,'mesh').forEach(function (v) { option(form.mesh,v); }); unique(catalog,'qa').forEach(function (v) { option(form.qa,v); });
    restore(); identity.textContent = 'Pinned release ' + String(loaded.manifest.release_digest || '').slice(0,12) + ' · ' + catalog.length + ' published cases'; status.textContent = 'Reviewed public catalog loaded.'; root.setAttribute('aria-busy','false'); apply();
  }).catch(function (err) { status.textContent='Catalog unavailable.'; error.hidden=false; error.textContent='The pinned sloshing release could not be loaded: ' + err.message; root.setAttribute('aria-busy','false'); });
  form.addEventListener('input', apply); form.addEventListener('change', apply); form.addEventListener('reset', function () { window.setTimeout(apply,0); });
}());
