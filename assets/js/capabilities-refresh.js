/* capabilities-refresh.js — optional "Refresh to latest" for capability detail pages.
 *
 * C6 (aceengineer-website#53), epic workspace-hub#3485. Progressive enhancement ONLY:
 * the page ships with build-time-baked data (the deterministic backbone). If JS is on and
 * the visitor clicks "Refresh to latest", we re-fetch the same Hugging Face datasets-server
 * /rows endpoint client-side and re-render the table + chart in place. If the fetch fails
 * (or JS is off), the baked data stands untouched — the backbone never depends on this.
 *
 * Render logic mirrors scripts/render-capabilities.js (build time) closely enough that a
 * refresh looks identical to a rebuild. Kept dependency-free and inline-string based so it
 * needs no bundler and no CSP relaxation beyond adding the datasets-server origin to
 * connect-src (see vercel.json).
 */
(function () {
    'use strict';

    var API = 'https://datasets-server.huggingface.co';
    var FETCH_ROWS = 100;   // datasets-server /rows hard max per request; also what build materializes
    var TABLE_ROWS = 50;    // rows shown in the table (matches MAX_TABLE_ROWS at build)
    var MAX_BARS = 15;

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function isNumericDtype(dtype) {
        return /int|float|double|decimal|number/i.test(String(dtype || ''));
    }

    function fmtCell(v) {
        if (v === null || v === undefined || v === '') return '—'; // em dash
        if (typeof v === 'number') {
            return Number.isInteger(v)
                ? v.toLocaleString('en-US')
                : v.toLocaleString('en-US', { maximumFractionDigits: 2 });
        }
        return esc(v);
    }

    function fmtNum(v) {
        return Number.isInteger(v) ? v.toLocaleString('en-US') : v.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }

    // Human-friendly column headers — mirror of humanizeColumn() in
    // scripts/render-capabilities.js so a live refresh matches the baked page. Only the
    // DISPLAYED header text changes; the raw name is still used for data lookup.
    var COLUMN_LABELS = {
        npv_mm: 'NPV ($MM)',
        breakeven_wti: 'Breakeven WTI ($/bbl)',
        economics_basis: 'Basis',
        sens_mm_per_dollar: 'NPV sensitivity ($MM/$)',
        wells_count: 'Wells',
        api_gravity: 'API°',
        cum_oil_mmbbl: 'Cum oil (MMbbl)',
        eur_mmbbl: 'EUR (MMbbl)',
        avg_uptime_pct: 'Uptime %',
        uptime_pct: 'Uptime %',
        field_id: 'Field',
    };

    var COLUMN_TOKENS = {
        api: 'API', eur: 'EUR', wti: 'WTI', npv: 'NPV', id: 'ID', mbl: 'MBL',
        smys: 'SMYS', sn: 'S-N', tvd: 'TVD', hpht: 'HPHT',
        kn: 'kN', knm: 'kN·m', mpa: 'MPa', psi: 'psi', ppg: 'ppg', ft: 'ft', mm: 'MM',
    };

    function humanizeColumn(name) {
        if (name == null) return '';
        var key = String(name);
        if (Object.prototype.hasOwnProperty.call(COLUMN_LABELS, key)) return COLUMN_LABELS[key];
        return key.split('_').map(function (w) {
            if (!w) return w;
            var lower = w.toLowerCase();
            if (Object.prototype.hasOwnProperty.call(COLUMN_TOKENS, lower)) return COLUMN_TOKENS[lower];
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        }).join(' ');
    }

    // Mirror of hf-fetch.js normalize(): datasets-server /rows JSON -> { columns, rows, total_rows }.
    function normalize(apiJson) {
        var features = (apiJson && apiJson.features) || [];
        var columns = features.slice()
            .sort(function (a, b) { return a.feature_idx - b.feature_idx; })
            .map(function (f) { return { name: f.name, dtype: (f.type && f.type.dtype) || 'string' }; });
        var rows = ((apiJson && apiJson.rows) || []).map(function (r) { return r.row; });
        var total = typeof (apiJson && apiJson.num_rows_total) === 'number' ? apiJson.num_rows_total : rows.length;
        return { columns: columns, rows: rows, total_rows: total };
    }

    // highlight_columns first (declared order), then the rest — matches build orderedColumns().
    function orderColumns(columns, highlight) {
        var names = columns.map(function (c) { return c.name; });
        var hi = (highlight || []).filter(function (c) { return names.indexOf(c) !== -1; });
        var rest = names.filter(function (c) { return hi.indexOf(c) === -1; });
        return hi.concat(rest);
    }

    function tableHtml(data, highlight) {
        var cols = orderColumns(data.columns, highlight);
        var rows = data.rows || [];
        if (!rows.length || !cols.length) return '<p style="color:#777;">No rows to display.</p>';
        var shown = rows.slice(0, TABLE_ROWS);
        var head = cols.map(function (c) {
            return '<th style="text-align:left;padding:8px 12px;border-bottom:2px solid #dde1e5;white-space:nowrap;">' + esc(humanizeColumn(c)) + '</th>';
        }).join('');
        var body = shown.map(function (r) {
            return '<tr>' + cols.map(function (c) {
                return '<td style="padding:7px 12px;border-bottom:1px solid #eef1f3;">' + fmtCell(r[c]) + '</td>';
            }).join('') + '</tr>';
        }).join('\n');
        var total = data.total_rows != null ? data.total_rows : rows.length;
        var note = shown.length < total
            ? '<p style="color:#777;font-size:.85rem;margin:8px 0 0;">Showing ' + shown.length + ' of ' +
              total.toLocaleString('en-US') + ' rows — full table on Hugging Face.</p>'
            : '';
        return '<div style="overflow-x:auto;"><table style="border-collapse:collapse;width:100%;font-size:.92rem;">' +
            '<thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>' + note;
    }

    // (labelKey, valueKey): first non-numeric highlight col = label, first numeric = value.
    function pickKeys(columns, highlight) {
        var dtypeOf = function (name) {
            var col = columns.filter(function (c) { return c.name === name; })[0];
            return col && col.dtype;
        };
        var pool = (highlight && highlight.length)
            ? highlight.filter(function (c) { return columns.some(function (col) { return col.name === c; }); })
            : columns.map(function (c) { return c.name; });
        var valueKey = pool.filter(function (c) { return isNumericDtype(dtypeOf(c)); })[0];
        var labelKey = pool.filter(function (c) { return c !== valueKey && !isNumericDtype(dtypeOf(c)); })[0]
            || pool.filter(function (c) { return c !== valueKey; })[0];
        return { labelKey: labelKey, valueKey: valueKey };
    }

    function barSvg(items) {
        items = items.filter(function (d) { return typeof d.value === 'number' && !isNaN(d.value); }).slice(0, MAX_BARS);
        if (!items.length) return '';
        var max = Math.max.apply(null, items.map(function (d) { return d.value; }).concat([0])) || 1;
        var rowH = 26, gap = 8, labelW = 160, chartW = 460, pad = 8;
        var width = labelW + chartW + pad * 2;
        var height = items.length * (rowH + gap) + pad * 2;
        var bars = items.map(function (d, i) {
            var y = pad + i * (rowH + gap);
            var w = Math.max(1, Math.round((d.value / max) * chartW));
            return '<text x="' + (labelW - 6) + '" y="' + (y + rowH / 2 + 4) + '" text-anchor="end" font-size="12" fill="#333">' +
                esc(String(d.label)) + '</text>' +
                '<rect x="' + labelW + '" y="' + y + '" width="' + w + '" height="' + rowH + '" rx="3" fill="#1d4e89"></rect>' +
                '<text x="' + (labelW + w + 6) + '" y="' + (y + rowH / 2 + 4) + '" font-size="12" fill="#333">' + fmtNum(d.value) + '</text>';
        }).join('');
        return '<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" role="img" style="max-width:' + width +
            'px;height:auto;font-family:inherit;" preserveAspectRatio="xMinYMin meet">' + bars + '</svg>';
    }

    function lineSvg(items) {
        items = items.filter(function (d) { return typeof d.value === 'number' && !isNaN(d.value); });
        if (items.length < 2) return barSvg(items);
        var values = items.map(function (d) { return d.value; });
        var max = Math.max.apply(null, values), min = Math.min.apply(null, values);
        var span = (max - min) || 1;
        var w = 640, h = 220, pad = 30;
        var step = (w - pad * 2) / (items.length - 1);
        var pts = items.map(function (d, i) {
            var x = pad + i * step;
            var y = h - pad - ((d.value - min) / span) * (h - pad * 2);
            return x.toFixed(1) + ',' + y.toFixed(1);
        }).join(' ');
        return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" role="img" style="max-width:' + w +
            'px;height:auto;" preserveAspectRatio="xMinYMin meet">' +
            '<polyline fill="none" stroke="#0b6e4f" stroke-width="2" points="' + pts + '"></polyline>' +
            '<text x="' + pad + '" y="16" font-size="12" fill="#666">max ' + max.toLocaleString('en-US') + '</text></svg>';
    }

    function chartHtml(viz, data, highlight) {
        if (viz !== 'bar' && viz !== 'line') return '';
        var keys = pickKeys(data.columns, highlight);
        if (!keys.labelKey || !keys.valueKey) return '';
        var series = (data.rows || []).map(function (r) { return { label: r[keys.labelKey], value: r[keys.valueKey] }; })
            .filter(function (d) { return typeof d.value === 'number' && !isNaN(d.value); });
        if (!series.length) return '';
        if (viz === 'bar') {
            series.sort(function (a, b) { return b.value - a.value; });
            return '<div style="margin:10px 0 6px;">' + barSvg(series) + '</div>' +
                '<p style="color:#777;font-size:.82rem;margin:0 0 4px;">' + esc(keys.valueKey) + ' by ' + esc(keys.labelKey) +
                ' (top ' + Math.min(MAX_BARS, series.length) + ')</p>';
        }
        return '<div style="margin:10px 0 6px;">' + lineSvg(series) + '</div>' +
            '<p style="color:#777;font-size:.82rem;margin:0 0 4px;">' + esc(keys.valueKey) + ' across ' + esc(keys.labelKey) + '</p>';
    }

    function rowsUrl(dataset, config, split, length) {
        return API + '/rows?dataset=' + encodeURIComponent(dataset) + '&config=' + encodeURIComponent(config) +
            '&split=' + encodeURIComponent(split || 'train') + '&offset=0&length=' + Math.min(FETCH_ROWS, length || FETCH_ROWS);
    }

    function readHighlight(section) {
        try { return JSON.parse(section.getAttribute('data-highlight') || '[]'); } catch (e) { return []; }
    }

    // Re-fetch + re-render one table section. Resolves true on success, false on any failure
    // (leaving the baked markup untouched). Never throws.
    function refreshSection(section, fetchImpl) {
        var doFetch = fetchImpl || (typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : null);
        if (!doFetch) return Promise.resolve(false);
        var dataset = section.getAttribute('data-hf-dataset');
        var config = section.getAttribute('data-hf-config');
        var split = section.getAttribute('data-hf-split') || 'train';
        var viz = section.getAttribute('data-viz') || 'table';
        var highlight = readHighlight(section);
        var target = section.querySelector('[data-cap-render]');
        if (!dataset || !config || !target) return Promise.resolve(false);

        return doFetch(rowsUrl(dataset, config, split, FETCH_ROWS), { headers: { accept: 'application/json' } })
            .then(function (res) {
                if (!res || !res.ok) throw new Error('HTTP ' + (res && res.status));
                return res.json();
            })
            .then(function (json) {
                var data = normalize(json);
                if (!data.rows.length) throw new Error('empty');
                target.innerHTML = chartHtml(viz, data, highlight) + tableHtml(data, highlight);
                return true;
            })
            .catch(function () { return false; });
    }

    function setStatus(statusEl, text, tone) {
        if (!statusEl) return;
        statusEl.textContent = text;
        statusEl.style.color = tone === 'error' ? '#a15c00' : (tone === 'ok' ? '#0e7e88' : '#777');
    }

    function onRefresh(root, btn, statusEl, fetchImpl) {
        var sections = root.querySelectorAll('[data-cap-table]');
        if (!sections.length) return Promise.resolve();
        btn.disabled = true;
        setStatus(statusEl, 'Refreshing…', 'muted');
        var jobs = [];
        for (var i = 0; i < sections.length; i++) jobs.push(refreshSection(sections[i], fetchImpl));
        return Promise.all(jobs).then(function (results) {
            var ok = results.filter(Boolean).length;
            btn.disabled = false;
            if (ok === results.length) setStatus(statusEl, 'Updated just now.', 'ok');
            else if (ok === 0) setStatus(statusEl, 'Live refresh unavailable — showing baked data.', 'error');
            else setStatus(statusEl, 'Updated ' + ok + ' of ' + results.length + ' — rest showing baked data.', 'error');
        });
    }

    function init() {
        var btn = document.querySelector('[data-refresh-capabilities]');
        if (!btn) return;
        var root = document.querySelector('[data-capability-detail]') || document;
        var statusEl = document.querySelector('[data-refresh-status]');
        btn.addEventListener('click', function () { onRefresh(root, btn, statusEl); });
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();
    }

    // Exposed for unit testing (isomorphic pattern, cf. assets/js/cta-tracking.js).
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            normalize: normalize, orderColumns: orderColumns, humanizeColumn: humanizeColumn, tableHtml: tableHtml,
            pickKeys: pickKeys, chartHtml: chartHtml, rowsUrl: rowsUrl,
            refreshSection: refreshSection, onRefresh: onRefresh, init: init,
        };
    }
})();
