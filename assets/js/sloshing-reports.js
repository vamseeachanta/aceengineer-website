/* Interactive sloshing reports. Dependency-free except for the vendored Plotly global. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SloshingReports = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var STATE_KEYS = ['v', 'case', 'curves', 'theme', 'lines', 'markers', 'density', 'sections'];
  var ENUMS = {
    theme: ['light', 'contrast'], lines: ['normal', 'heavy'], markers: ['on', 'off'],
    density: ['comfortable', 'compact']
  };

  function selectableCases(cases) {
    return (cases || []).filter(function (c) {
      return c.status === 'accepted' && (c.evidence_type === 'cfd_validation' || c.evidence_type === 'cfd_forced_roll');
    });
  }

  function defaultState(cases) {
    var first = selectableCases(cases)[0];
    return { v: '1', case: first ? first.case_id : '', curves: [], theme: 'light', lines: 'normal', markers: 'on', density: 'comfortable', sections: ['overview', 'plots', 'data'], uirevision: first ? 'case:' + first.case_id : 'case:none' };
  }

  function currentCase(cases, state) {
    return selectableCases(cases).filter(function (c) { return c.case_id === state.case; })[0] || null;
  }

  function unique(values) {
    return values.filter(function (v, i) { return v !== '' && values.indexOf(v) === i; });
  }

  function caseValue(record, field) {
    if (field === 'period') return record.period_s != null && record.period_s !== '' ? record.period_s : record.period;
    return record[field];
  }

  function optionsFor(cases, state, field) {
    var accepted = selectableCases(cases);
    var selected = currentCase(cases, state);
    if (field === 'case') return accepted.map(function (c) { return c.case_id; });
    var fields = ['evidence_type', 'loading_condition', 'period', 'mesh'];
    var index = fields.indexOf(field);
    return unique(accepted.filter(function (c) {
      return fields.slice(0, index).every(function (prior) { return !selected || c[prior] === selected[prior]; });
    }).map(function (c) { var value = caseValue(c, field); return String(value == null ? '' : value); }));
  }

  function reduceState(state, action, cases) {
    var next = Object.assign({}, state);
    if (action.type === 'RESET') return defaultState(cases);
    if (action.type === 'STYLE' && ENUMS[action.field] && ENUMS[action.field].indexOf(action.value) >= 0) next[action.field] = action.value;
    if (action.type === 'CURVES') next.curves = unique((action.value || []).slice()).sort();
    if (action.type === 'SECTIONS') next.sections = unique((action.value || []).slice()).sort();
    if (action.type === 'CASE' && selectableCases(cases).some(function (c) { return c.case_id === action.value; })) {
      next.case = action.value;
      next.uirevision = 'case:' + action.value;
    }
    if (action.type === 'SELECT') {
      var selected = currentCase(cases, state);
      var candidates = selectableCases(cases).filter(function (c) {
        if (String(caseValue(c, action.field)) !== String(action.value)) return false;
        if (action.field === 'loading_condition') return true;
        return !selected || c.loading_condition === selected.loading_condition;
      });
      if (candidates[0]) {
        next.case = candidates[0].case_id;
        next.uirevision = 'case:' + next.case;
      }
    }
    return next;
  }

  function serializeState(state) {
    var values = {
      v: '1', case: state.case || '', curves: (state.curves || []).slice().sort().join(','),
      theme: state.theme, lines: state.lines, markers: state.markers, density: state.density,
      sections: (state.sections || []).slice().sort().join(',')
    };
    return STATE_KEYS.map(function (key) { return encodeURIComponent(key) + '=' + encodeURIComponent(values[key] || ''); }).join('&');
  }

  function parseState(query, cases) {
    var fallback = defaultState(cases);
    var raw = String(query || '').replace(/^\?/, '');
    if (!raw || raw.length > 2048) return { state: fallback, normalized: !!raw };
    var params = new URLSearchParams(raw);
    var candidate = Object.assign({}, fallback);
    var valid = params.get('v') === '1';
    var caseId = params.get('case');
    valid = valid && selectableCases(cases).some(function (c) { return c.case_id === caseId; });
    ['theme', 'lines', 'markers', 'density'].forEach(function (key) {
      var value = params.get(key);
      if (ENUMS[key].indexOf(value) < 0) valid = false;
      else candidate[key] = value;
    });
    if (!valid) return { state: fallback, normalized: true };
    candidate.case = caseId;
    candidate.uirevision = 'case:' + caseId;
    candidate.curves = unique((params.get('curves') || '').split(',').filter(Boolean)).sort();
    candidate.sections = unique((params.get('sections') || '').split(',').filter(Boolean)).sort();
    return { state: candidate, normalized: serializeState(candidate) !== raw };
  }

  function parseCsv(text) {
    var rows = [], row = [], cell = '', quoted = false;
    text = String(text || '').replace(/^\uFEFF/, '');
    for (var i = 0; i < text.length; i += 1) {
      var ch = text[i];
      if (quoted && ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = !quoted;
      else if (!quoted && ch === ',') { row.push(cell); cell = ''; }
      else if (!quoted && (ch === '\n' || ch === '\r')) {
        if (ch === '\r' && text[i + 1] === '\n') i += 1;
        row.push(cell); cell = ''; if (row.some(function (v) { return v !== ''; })) rows.push(row); row = [];
      } else cell += ch;
    }
    if (quoted) throw new Error('Unclosed quoted CSV field');
    if (cell || row.length) { row.push(cell); rows.push(row); }
    if (!rows.length) return [];
    var headers = rows.shift();
    if (unique(headers).length !== headers.length) throw new Error('Duplicate CSV header');
    return rows.map(function (values) {
      if (values.length !== headers.length) throw new Error('CSV column count mismatch');
      var out = {}; headers.forEach(function (header, n) { out[header] = values[n]; }); return out;
    });
  }

  function createLoadGate(commitFn) {
    var generation = 0;
    return {
      begin: function () { generation += 1; return generation; },
      commit: function (token, value) { if (token !== generation) return false; commitFn(value); return true; }
    };
  }

  function createLegendSync() {
    var active = false;
    return { consume: function (fn) { if (active) return false; active = true; try { fn(); return true; } finally { active = false; } } };
  }

  function tableRows(root, selected, data) {
    var body = root.querySelector('[data-accessible-table] tbody');
    if (!body) return;
    var metrics = (data.metrics || []).concat(data.derived_metrics || []).filter(function (m) { return m.case_id === selected.case_id; });
    body.textContent = '';
    var values = metrics.length ? metrics : [{ quantity: 'Published case', value: selected.case_id, unit: '—' }];
    values.forEach(function (metric) {
      var tr = document.createElement('tr');
      ['quantity', 'value', 'unit'].forEach(function (key) { var td = document.createElement('td'); td.textContent = metric[key] == null ? '—' : metric[key]; tr.appendChild(td); });
      body.appendChild(tr);
    });
  }

  function tracesFor(selected, data, state) {
    var series = (data.series || []).filter(function (s) { return !s.case_id || s.case_id === selected.case_id; });
    return series.map(function (seriesRow) {
      var samples = (data.samples || []).filter(function (s) { return s.series_id === seriesRow.series_id; });
      return { x: samples.map(function (s) { return Number(s.x); }), y: samples.map(function (s) { return Number(s.y); }), name: seriesRow.label || seriesRow.quantity || seriesRow.series_id, mode: state.markers === 'on' ? 'lines+markers' : 'lines', line: { width: state.lines === 'heavy' ? 4 : 2, dash: seriesRow.line_dash || 'solid' } };
    });
  }

  function detailedTraceGroups(selected, data, state) {
    var groups = { pressure: [], force: [], moment: [], other: [] };
    tracesFor(selected, data, state).forEach(function (trace, index) {
      var row = (data.series || []).filter(function (s) { return (!s.case_id || s.case_id === selected.case_id); })[index];
      var quantity = row ? row.quantity : '';
      if (quantity === 'wall_pressure') groups.pressure.push(trace);
      else if (/^aggregate_force_/.test(quantity)) groups.force.push(trace);
      else if (/^aggregate_moment_/.test(quantity)) groups.moment.push(trace);
      else groups.other.push(trace);
    });
    return groups;
  }

  function pressureEnvelopeTraces(selected, data) {
    var rows = (data.pressure_envelopes || []).filter(function (row) { return row.case_id === selected.case_id && row.window === 'last_cycle'; });
    var traces = [];
    unique(rows.map(function (row) { return row.wall_location; })).sort().forEach(function (location) {
      var points = rows.filter(function (row) { return row.wall_location === location; }).sort(function (a, b) { return Number(a.z_over_height) - Number(b.z_over_height); });
      [['maximum_Pa', 'maximum', 'solid'], ['p99_Pa', 'p99', 'dash'], ['harmonic_amplitude_Pa', 'harmonic amplitude', 'dot']].forEach(function (spec) {
        traces.push({ x: points.map(function (row) { return Number(row[spec[0]]); }), y: points.map(function (row) { return Number(row.z_over_height); }), name: location + ' ' + spec[1], mode: 'lines+markers', line: { dash: spec[2] } });
      });
    });
    return traces;
  }

  function qaViewModel(selected, data) {
    function item(label, value, unit) { return { label: label, value: value == null || value === '' ? 'Not published' : String(value), unit: unit || '' }; }
    var input = (data.inputs || []).filter(function (r) { return r.case_id === selected.case_id; })[0] || {};
    var mesh = (data.mesh_quality || []).filter(function (r) { return r.case_id === selected.case_id; })[0] || {};
    var audit = (data.qa_audit || []).filter(function (r) { return r.case_id === selected.case_id; })[0] || {};
    var results = (data.metrics || []).concat(data.derived_metrics || []).filter(function (m) { return m.case_id === selected.case_id; }).map(function (m) { return { quantity: m.quantity, value: m.value, unit: m.unit, statistic: m.statistic, status: m.qa_status }; });
    Object.keys(audit).filter(function (key) { return key !== 'case_id'; }).forEach(function (key) { results.push({ quantity: key, value: audit[key], unit: '', statistic: 'independent_audit', status: key === 'qa_status' ? audit[key] : (key === 'observed_max_courant' && audit.courant_target_exceeded === 'true' ? 'configured_limit_exceeded' : 'audited') }); });
    var previews = (data.previews || []).filter(function (p) { return p.case_id === selected.case_id && p.status === 'published' && /^(image\/(png|webp|gif)|video\/mp4)$/.test(p.media_type || '') && p.relative_path && !/(^|\/)\.\.(\/|$)|^[a-z]+:|^\//i.test(p.relative_path); });
    return {
      inputs: [item('Loading condition', selected.loading_condition), item('Forcing period', input.forcing_period_s || caseValue(selected, 'period'), 's'), item('Forcing amplitude', input.forcing_amplitude_deg, 'deg'), item('Cycles', input.simulated_cycles || selected.cycles), item('Solver', input.solver_family || selected.solver_class), item('Solver version', input.solver_version), item('Liquid density', input.liquid_density_kg_m3, 'kg/m³'), item('Liquid kinematic viscosity', input.liquid_kinematic_viscosity_m2_s, 'm²/s'), item('Surface tension', input.surface_tension_N_m, 'N/m'), item('Time step', input.maximum_timestep_s || selected.timestep_s, 's')],
      mesh: [item('Mesh level', selected.mesh), item('Mesh cells', mesh.mesh_cells || selected.mesh_cells), item('Mesh points', mesh.mesh_points), item('Mesh check', mesh.mesh_check), item('Maximum aspect ratio', mesh.max_aspect_ratio), item('Maximum non-orthogonality', mesh.max_non_orthogonality_deg, 'deg'), item('Maximum skewness', mesh.max_skewness), item('Minimum determinant', mesh.minimum_cell_determinant), item('Configured max Courant', input.configured_max_courant || selected.configured_max_courant), item('Evaluated state', mesh.evaluated_state)],
      results: results,
      preview: previews[0] || null,
      previews: previews
    };
  }

  function fillDefinitionList(host, items) {
    if (!host) return; host.textContent = '';
    items.forEach(function (item) { var wrapper = document.createElement('div'); var dt = document.createElement('dt'); var dd = document.createElement('dd'); dt.textContent = item.label; dd.textContent = item.value + (item.unit ? ' ' + item.unit : ''); wrapper.appendChild(dt); wrapper.appendChild(dd); host.appendChild(wrapper); });
  }

  function metricFor(data, caseId, quantity) {
    return (data.metrics || []).concat(data.derived_metrics || []).filter(function (metric) { return metric.case_id === caseId && metric.quantity === quantity; })[0] || null;
  }

  function studyViewModel(data, selected) {
    var cases = selectableCases(data.cases); var forced = cases.filter(function (c) { return c.loading_condition === 'forced_roll'; }); var decay = cases.filter(function (c) { return c.loading_condition === 'free_decay'; });
    var errors = (data.metrics || []).filter(function (m) { return m.quantity === 'relative_frequency_error'; }).map(function (m) { return Number(m.value); }).filter(Number.isFinite);
    var response = (data.derived_metrics || []).filter(function (m) { return m.quantity === 'level_amplitude_per_roll_degree'; }).map(function (m) { var c = cases.filter(function (row) { return row.case_id === m.case_id; })[0]; return { value: Number(m.value), period: c && Number(c.period_s), caseId: m.case_id }; }).filter(function (row) { return Number.isFinite(row.value); }).sort(function (a, b) { return b.value - a.value; });
    var peak = response[0] || {}; var audit = (data.qa_audit || []).filter(function (row) { return row.case_id === selected.case_id; })[0] || {}; var selectedMetric = metricFor(data, selected.case_id, 'level_amplitude_per_roll_degree');
    var maximumError = errors.length ? Math.max.apply(null, errors) : null; var minimumError = errors.length ? Math.min.apply(null, errors) : null;
    return {
      kpis: [
        { value: String(cases.length), label: 'accepted CFD cases' },
        { value: forced.length + ' / ' + decay.length, label: 'forced-roll / free-decay cases' },
        { value: minimumError == null ? '—' : minimumError.toFixed(3) + '%', label: 'best frequency error vs theory' },
        { value: peak.period ? peak.period.toFixed(0) + ' s' : '—', label: 'peak normalized level-response period' }
      ],
      verdict: peak.period && maximumError != null ? 'The free-decay series remains within ' + maximumError.toFixed(3) + '% of the analytical frequency target. In the forced-roll sweep, normalized liquid-level response rises toward a broad maximum at approximately ' + peak.period.toFixed(0) + ' s, then reduces; this identifies the strongest published loading region, not a vessel-level anti-roll benefit.' : 'The selected release does not contain enough evidence for a combined verification and peak-period conclusion.',
      findings: [
        { title: 'Verification', text: minimumError == null ? 'No analytical comparison is published.' : 'Measured first-mode frequency differs from the analytical target by ' + minimumError.toFixed(3) + '–' + maximumError.toFixed(3) + '% across the published mesh and timestep cases.' },
        { title: 'Response', text: peak.period ? 'The largest published level response per roll degree is ' + peak.value.toFixed(3) + ' m/deg at ' + peak.period.toFixed(0) + ' s (' + peak.caseId + ').' : 'No normalized forced-roll curve is published.' },
        { title: 'Numerical caution', text: audit.courant_target_exceeded === 'true' ? 'The selected case exceeded its configured Courant target; completion and cycle convergence do not erase that QA exception.' : 'No configured Courant-target exceedance is recorded for the selected case.' }
      ],
      selectedKpis: [
        { value: selected.period_s ? selected.period_s + ' s' : (selected.frequency_hz ? selected.frequency_hz + ' Hz' : 'Free decay'), label: 'forcing period / measured frequency' },
        { value: selected.mesh_cells || '—', label: 'published mesh cells' },
        { value: selected.cycles || '—', label: 'simulated cycles' },
        { value: selectedMetric ? Number(selectedMetric.value).toFixed(3) + ' m/deg' : '—', label: 'level response per roll degree' }
      ],
      selectedVerdict: selected.loading_condition === 'forced_roll' ? 'This accepted forced-roll case supports comparison of aggregate response and published histories at ' + selected.period_s + ' s. ' + (audit.courant_target_exceeded === 'true' ? 'Use with a visible numerical caveat: observed Courant number exceeded the configured target.' : 'No configured Courant-target exception is published for this case.') : 'This accepted free-decay case supports numerical verification of the first-mode frequency against the analytical target; it is not a forced-roll load case.'
    };
  }

  function fillKpis(host, items) {
    if (!host) return; host.textContent = '';
    items.forEach(function (item) { var box = document.createElement('div'); var value = document.createElement('strong'); var label = document.createElement('span'); value.textContent = item.value; label.textContent = item.label; box.appendChild(value); box.appendChild(label); host.appendChild(box); });
  }

  function renderEngineeringNarrative(root, data, selected) {
    var vm = studyViewModel(data, selected); fillKpis(root.querySelector('[data-study-kpis]'), vm.kpis); fillKpis(root.querySelector('[data-case-kpis]'), vm.selectedKpis);
    var verdict = root.querySelector('[data-study-verdict]'); if (verdict) { verdict.textContent = ''; var lead = document.createElement('strong'); lead.textContent = 'Engineering verdict. '; verdict.appendChild(lead); verdict.appendChild(document.createTextNode(vm.verdict)); }
    var caseVerdict = root.querySelector('[data-case-verdict]'); if (caseVerdict) { caseVerdict.textContent = ''; var caseLead = document.createElement('strong'); caseLead.textContent = root.getAttribute('data-report-kind') === 'analysis' ? 'QA verdict. ' : 'Case verdict. '; caseVerdict.appendChild(caseLead); caseVerdict.appendChild(document.createTextNode(vm.selectedVerdict)); }
    var findings = root.querySelector('[data-study-findings]'); if (findings) { findings.textContent = ''; vm.findings.forEach(function (finding) { var box = document.createElement('div'); var title = document.createElement('h3'); var copy = document.createElement('p'); title.textContent = finding.title; copy.textContent = finding.text; box.appendChild(title); box.appendChild(copy); findings.appendChild(box); }); }
  }

  function renderQa(root, selected, data) {
    var qa = qaViewModel(selected, data); fillDefinitionList(root.querySelector('[data-qa-inputs]'), qa.inputs); fillDefinitionList(root.querySelector('[data-qa-mesh]'), qa.mesh);
    var body = root.querySelector('[data-qa-results] tbody'); if (body) { body.textContent = ''; qa.results.forEach(function (result) { var tr = document.createElement('tr'); [result.quantity, result.value, result.unit, result.statistic, result.status].forEach(function (value) { var td = document.createElement('td'); td.textContent = value || '—'; tr.appendChild(td); }); if (result.status === 'configured_limit_exceeded') tr.className = 'qa-warning'; body.appendChild(tr); }); }
    var previewHost = root.querySelector('[data-qa-preview]'); if (previewHost) { previewHost.textContent = ''; if (!qa.previews.length) { var notice = document.createElement('p'); notice.textContent = 'No reviewed animation preview is published for this case.'; previewHost.appendChild(notice); } else qa.previews.forEach(function (preview) { var figure = document.createElement('figure'); var media = document.createElement(preview.media_type === 'video/mp4' ? 'video' : 'img'); media.src = new URL(preview.relative_path, data.assetBase || window.location.href).href; if (media.tagName === 'VIDEO') { media.controls = true; media.preload = 'metadata'; media.setAttribute('aria-label', preview.alt_text); } else media.alt = preview.alt_text; figure.appendChild(media); var caption = document.createElement('figcaption'); caption.textContent = preview.alt_text + ' · SHA-256 ' + preview.sha256; figure.appendChild(caption); previewHost.appendChild(figure); }); }
  }

  function summaryTraces(data, state) {
    var byId = {}; (data.cases || []).forEach(function (c) { byId[c.case_id] = c; }); var groups = {};
    (data.metrics || []).forEach(function (m) {
      var c = byId[m.case_id]; if (!c) return;
      var allowed = (c.loading_condition === 'forced_roll' && ['level_difference_amplitude', 'roll_moment_amplitude'].indexOf(m.quantity) >= 0) || (c.loading_condition === 'free_decay' && ['measured_frequency', 'analytical_frequency'].indexOf(m.quantity) >= 0);
      if (!allowed) return; var id = c.loading_condition + ':' + m.quantity + ':' + m.unit;
      if (!groups[id]) groups[id] = { id: id, quantity: m.quantity, unit: m.unit, points: [] };
      groups[id].points.push({ x: c.loading_condition === 'forced_roll' ? Number(c.period_s) : Number(c.mesh_cells || c.timestep_s), y: Number(m.value), case_id: c.case_id });
    });
    (data.derived_metrics || []).forEach(function (m) {
      var c = byId[m.case_id]; if (!c || c.loading_condition !== 'forced_roll' || !/_per_roll_degree$/.test(m.quantity)) return;
      var id = 'normalized:' + m.quantity + ':' + m.unit;
      if (!groups[id]) groups[id] = { id: id, quantity: m.quantity, unit: m.unit, points: [] };
      groups[id].points.push({ x: Number(c.period_s), y: Number(m.value), case_id: c.case_id });
    });
    var enabled = state.curves && state.curves.length ? state.curves : Object.keys(groups);
    return Object.keys(groups).sort().filter(function (id) { return enabled.indexOf(id) >= 0; }).map(function (id) { var g = groups[id]; g.points.sort(function (a, b) { return a.x - b.x; }); return { x: g.points.map(function (p) { return p.x; }), y: g.points.map(function (p) { return p.y; }), text: g.points.map(function (p) { return p.case_id; }), name: g.quantity.replace(/_/g, ' ') + ' (' + g.unit + ')', mode: state.markers === 'on' ? 'lines+markers' : 'lines', line: { width: state.lines === 'heavy' ? 4 : 2, dash: g.quantity === 'analytical_frequency' ? 'dash' : 'solid' }, meta: { curveId: id } }; });
  }

  function renderCurveControls(root, allTraces, state) {
    var host = root.querySelector('[data-curve-controls]'); if (!host) return; host.textContent = '';
    allTraces.forEach(function (trace) { var label = document.createElement('label'); var box = document.createElement('input'); box.type = 'checkbox'; box.checked = !state.curves.length || state.curves.indexOf(trace.meta.curveId) >= 0; box.setAttribute('data-curve', trace.meta.curveId); label.appendChild(box); label.appendChild(document.createTextNode(' ' + trace.name)); host.appendChild(label); });
  }

  function render(root, data, state, Plotly) {
    var selected = currentCase(data.cases, state);
    if (!selected) throw new Error('No accepted published case');
    root.dataset.theme = state.theme; root.dataset.density = state.density;
    root.querySelectorAll('[data-report-section]').forEach(function (section) { section.toggleAttribute('data-print-excluded', state.sections.indexOf(section.getAttribute('data-report-section')) < 0); });
    var caseSelect = root.querySelector('[data-state-field="case"]');
    if (caseSelect) {
      caseSelect.textContent = '';
      selectableCases(data.cases).forEach(function (c) { var option = document.createElement('option'); option.value = c.case_id; option.textContent = c.case_id; caseSelect.appendChild(option); });
      caseSelect.value = state.case;
    }
    ['loading_condition', 'period', 'mesh'].forEach(function (field) {
      var control = root.querySelector('[data-state-field="' + field + '"]');
      if (!control) return;
      control.textContent = '';
      optionsFor(data.cases, state, field).forEach(function (value) { var option = document.createElement('option'); option.value = value; option.textContent = value; control.appendChild(option); });
      control.value = String(caseValue(selected, field) == null ? '' : caseValue(selected, field));
      control.disabled = control.options.length < 2;
    });
    tableRows(root, selected, data);
    var kind = root.getAttribute('data-report-kind'); var plot = root.querySelector('[data-plot]'); var isSummary = kind === 'summary'; var traces = isSummary ? summaryTraces(data, state) : tracesFor(selected, data, state);
    if (isSummary) renderCurveControls(root, summaryTraces(data, Object.assign({}, state, { curves: [] })), state);
    if (kind === 'case' && root.querySelector('[data-plot-group]') && Plotly && Plotly.react) {
      var groups = detailedTraceGroups(selected, data, state); var configs = { pressure: ['Pressure histories', 'Pressure (Pa)'], force: ['Aggregate force histories', 'Force (N)'], moment: ['Aggregate moment histories', 'Moment (N·m)'] };
      Object.keys(configs).forEach(function (group) { var target = root.querySelector('[data-plot-group="' + group + '"]'); var empty = root.querySelector('[data-series-empty="' + group + '"]'); if (!target) return; target.hidden = !groups[group].length; if (empty) empty.hidden = !!groups[group].length; if (groups[group].length) Plotly.react(target, groups[group], { uirevision: state.uirevision, template: state.theme === 'contrast' ? 'plotly_dark' : 'plotly_white', title: configs[group][0], xaxis: { title: 'Time (s)' }, yaxis: { title: configs[group][1] } }, { responsive: true, displaylogo: false, modeBarButtonsToAdd: ['toImage'] }); });
      var envelope = pressureEnvelopeTraces(selected, data); var envelopeTarget = root.querySelector('[data-plot-envelope]'); var envelopeEmpty = root.querySelector('[data-envelope-empty]');
      if (envelopeTarget) { envelopeTarget.hidden = !envelope.length; if (envelope.length) Plotly.react(envelopeTarget, envelope, { uirevision: state.uirevision, template: state.theme === 'contrast' ? 'plotly_dark' : 'plotly_white', title: 'Last-cycle wall-pressure envelope', xaxis: { title: 'Pressure (Pa)' }, yaxis: { title: 'Normalized height, z/H', range: [0, 1] } }, { responsive: true, displaylogo: false, modeBarButtonsToAdd: ['toImage'] }); }
      if (envelopeEmpty) envelopeEmpty.hidden = !!envelope.length;
    } else if (plot && Plotly && Plotly.react) Plotly.react(plot, traces, { uirevision: state.uirevision, template: state.theme === 'contrast' ? 'plotly_dark' : 'plotly_white', title: isSummary ? 'Published CFD and analytical comparison' : 'Published sloshing response' }, { responsive: true, displaylogo: false, modeBarButtonsToAdd: ['toImage'] });
    if (kind === 'analysis') renderQa(root, selected, data);
    renderEngineeringNarrative(root, data, selected);
    var status = root.querySelector('[data-report-status]');
    if (status) status.textContent = 'Showing published case ' + selected.case_id + '.';
  }

  function bindPrintLifecycle(root, Plotly, win) {
    function resize() { if (!Plotly || !Plotly.Plots || !Plotly.Plots.resize) return; root.querySelectorAll('[data-plot],[data-plot-group],[data-plot-envelope]').forEach(function (plot) { if (!plot.hidden) Plotly.Plots.resize(plot); }); }
    win.addEventListener('beforeprint', resize); win.addEventListener('afterprint', resize);
    return function () { win.removeEventListener('beforeprint', resize); win.removeEventListener('afterprint', resize); };
  }

  function mount(root, data, deps) {
    deps = deps || {}; var Plotly = deps.Plotly || window.Plotly; var history = deps.history || window.history;
    root.setAttribute('aria-busy', 'true');
    var parsed = parseState(window.location.search, data.cases); var state = parsed.state;
    render(root, data, state, Plotly); root.setAttribute('aria-busy', 'false');
    if (parsed.normalized && history && history.replaceState) history.replaceState(null, '', '?' + serializeState(state));
    root.addEventListener('change', function (event) {
      if (event.target.hasAttribute('data-curve')) { var checked = Array.prototype.map.call(root.querySelectorAll('[data-curve]:checked'), function (box) { return box.getAttribute('data-curve'); }); state = reduceState(state, { type: 'CURVES', value: checked }, data.cases); render(root, data, state, Plotly); if (history && history.pushState) history.pushState(null, '', '?' + serializeState(state)); return; }
      var field = event.target.getAttribute('data-state-field'); if (!field) return;
      state = field === 'case' ? reduceState(state, { type: 'CASE', value: event.target.value }, data.cases) : (['loading_condition', 'period', 'mesh'].indexOf(field) >= 0 ? reduceState(state, { type: 'SELECT', field: field, value: event.target.value }, data.cases) : reduceState(state, { type: 'STYLE', field: field, value: event.target.value }, data.cases));
      render(root, data, state, Plotly); if (history && history.pushState) history.pushState(null, '', '?' + serializeState(state));
    });
    root.addEventListener('click', function (event) {
      var format = event.target.getAttribute('data-export');
      if (format && (format === 'png' || format === 'svg') && Plotly && Plotly.downloadImage) Plotly.downloadImage(root.querySelector('[data-plot]') || root.querySelector('[data-plot-group]:not([hidden])'), { format: format, filename: 'tank-sloshing-report' });
      if (event.target.hasAttribute('data-reset')) { state = defaultState(data.cases); render(root, data, state, Plotly); if (history && history.pushState) history.pushState(null, '', '?' + serializeState(state)); }
    });
    function restore() { state = parseState(window.location.search, data.cases).state; render(root, data, state, Plotly); }
    window.addEventListener('popstate', restore);
    bindPrintLifecycle(root, Plotly, window);
    return { getState: function () { return state; } };
  }

  function manifestEntries(manifest) {
    var tables = manifest.tables || manifest.files || {};
    if (Array.isArray(tables)) return tables.map(function (t) { return [t.name || t.table, t.path || t.file]; });
    return Object.keys(tables).map(function (name) { var v = tables[name]; return [name, typeof v === 'string' ? v : (v.path || v.file)]; });
  }

  function load(root, fetchImpl) {
    var fetcher = fetchImpl || window.fetch.bind(window); var url = root.getAttribute('data-manifest-url'); var assetBase = '';
    root.setAttribute('aria-busy', 'true');
    return fetcher(url, { credentials: 'same-origin' }).then(function (response) { if (!response.ok) throw new Error('Manifest HTTP ' + response.status); return response.json(); }).then(function (manifest) {
      var base = new URL('.', new URL(url, window.location.href)); assetBase = base.href; var entries = manifestEntries(manifest);
      return Promise.all(entries.map(function (entry) { return fetcher(new URL(entry[1], base).href, { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error(entry[0] + ' HTTP ' + r.status); return r.text(); }).then(function (csv) { return [entry[0], parseCsv(csv)]; }); }));
    }).then(function (tables) { var data = { assetBase: assetBase }; tables.forEach(function (pair) { data[pair[0]] = pair[1]; }); return mount(root, data, {}); }).catch(function (error) {
      root.setAttribute('aria-busy', 'false'); var target = root.querySelector('[data-report-error]'); if (target) { target.hidden = false; target.textContent = 'Published report data could not be loaded. The methodology and provenance below remain available.'; } throw error;
    });
  }

  function boot() { document.querySelectorAll('[data-sloshing-report]').forEach(function (report) { load(report).catch(function () {}); }); }
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else setTimeout(boot, 0); }

  return { selectableCases: selectableCases, defaultState: defaultState, optionsFor: optionsFor, reduceState: reduceState, serializeState: serializeState, parseState: parseState, parseCsv: parseCsv, createLoadGate: createLoadGate, createLegendSync: createLegendSync, bindPrintLifecycle: bindPrintLifecycle, detailedTraceGroups: detailedTraceGroups, pressureEnvelopeTraces: pressureEnvelopeTraces, qaViewModel: qaViewModel, studyViewModel: studyViewModel, summaryTraces: summaryTraces, mount: mount, load: load, render: render };
}));
