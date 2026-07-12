#!/usr/bin/env node
/**
 * validate-capabilities.js — offline structural validation of config/capabilities.yaml.
 *
 * The registry is the SSOT for the HF-backed capability pages (docs/capabilities-registry.md,
 * epic workspace-hub#3485). This gate catches malformed entries before build/CI:
 *   - required fields present, correct types
 *   - `domain`, `status`, and each table `viz` are within their allowed enums
 *   - `id`s are unique and kebab-case
 *   - each capability has at least one table, and `primary_config` names a real table
 *   - no `highlight_columns` entry is also in `withheld_columns` (would leak a held column)
 *
 * It does NOT hit the network. Online resolution (dataset/config exist via the
 * datasets-server /splits API; no withheld column reaches rendered output) is the
 * CI gate in C7 (aceengineer-website#54).
 *
 *   node scripts/validate-capabilities.js     # or: npm run validate:capabilities
 *
 * Exit 0 = valid ("validate:capabilities PASS"), exit 1 = errors printed.
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const repoRoot = path.resolve(__dirname, '..');
const DEFAULT_REGISTRY = path.join(repoRoot, 'config', 'capabilities.yaml');

const DOMAINS = ['worldenergy', 'digitalmodel'];
const STATUSES = ['live', 'pending', 'withheld'];
const VIZ = ['table', 'bar', 'line', 'map'];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Load + parse the registry. Returns the parsed object (throws on unreadable/invalid YAML).
function loadRegistry(registryFile = DEFAULT_REGISTRY) {
  const raw = fs.readFileSync(registryFile, 'utf8');
  return yaml.load(raw) || {};
}

// Validate a parsed registry object. Returns an array of human-readable error strings
// (empty === valid). Pure/offline so build.js and tests can reuse it.
function validateRegistry(registry) {
  const errors = [];
  if (!registry || typeof registry !== 'object') {
    return ['registry is empty or not an object'];
  }
  if (registry.version !== 1) {
    errors.push(`version must be 1 (got ${JSON.stringify(registry.version)})`);
  }
  const caps = registry.capabilities;
  if (!Array.isArray(caps) || caps.length === 0) {
    errors.push('capabilities must be a non-empty array');
    return errors;
  }

  const seenIds = new Set();
  caps.forEach((cap, i) => {
    const where = `capabilities[${i}]${cap && cap.id ? ` (${cap.id})` : ''}`;
    const req = (field, type = 'string') => {
      const v = cap[field];
      if (v === undefined || v === null || (type === 'string' && String(v).trim() === '')) {
        errors.push(`${where}: missing required field '${field}'`);
        return false;
      }
      return true;
    };

    if (req('id')) {
      if (!KEBAB.test(cap.id)) errors.push(`${where}: id must be kebab-case`);
      if (seenIds.has(cap.id)) errors.push(`${where}: duplicate id '${cap.id}'`);
      seenIds.add(cap.id);
    }
    req('title');
    req('summary');
    req('hf_dataset');
    req('provenance_url');
    req('data_limits');

    if (req('domain') && !DOMAINS.includes(cap.domain)) {
      errors.push(`${where}: domain must be one of ${DOMAINS.join('|')} (got '${cap.domain}')`);
    }
    if (req('status') && !STATUSES.includes(cap.status)) {
      errors.push(`${where}: status must be one of ${STATUSES.join('|')} (got '${cap.status}')`);
    }

    const withheld = new Set(Array.isArray(cap.withheld_columns) ? cap.withheld_columns : []);

    const tables = cap.tables;
    if (!Array.isArray(tables) || tables.length === 0) {
      errors.push(`${where}: 'tables' must be a non-empty array`);
    } else {
      const configNames = new Set();
      tables.forEach((t, j) => {
        const tw = `${where}.tables[${j}]`;
        if (!t || typeof t !== 'object') { errors.push(`${tw}: not an object`); return; }
        if (!t.config) errors.push(`${tw}: missing 'config'`);
        else configNames.add(t.config);
        if (!t.label) errors.push(`${tw}: missing 'label'`);
        if (!VIZ.includes(t.viz)) errors.push(`${tw}: viz must be one of ${VIZ.join('|')} (got '${t.viz}')`);
        if (!Array.isArray(t.highlight_columns) || t.highlight_columns.length === 0) {
          errors.push(`${tw}: highlight_columns must be a non-empty array`);
        } else {
          t.highlight_columns
            .filter(c => withheld.has(c))
            .forEach(c => errors.push(`${tw}: highlight column '${c}' is also in withheld_columns`));
        }
      });
      if (req('primary_config') && !configNames.has(cap.primary_config)) {
        errors.push(`${where}: primary_config '${cap.primary_config}' is not among this capability's tables`);
      }
    }
  });

  return errors;
}

// CLI entry
function main() {
  const registryFile = process.argv[2] || DEFAULT_REGISTRY;
  let registry;
  try {
    registry = loadRegistry(registryFile);
  } catch (err) {
    console.error(`validate:capabilities FAIL — cannot read/parse ${registryFile}: ${err.message}`);
    process.exit(1);
  }
  const errors = validateRegistry(registry);
  if (errors.length) {
    console.error('validate:capabilities FAIL');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }
  const n = registry.capabilities.length;
  console.log(`validate:capabilities PASS — ${n} capabilit${n === 1 ? 'y' : 'ies'} valid`);
}

if (require.main === module) main();

module.exports = { loadRegistry, validateRegistry, DEFAULT_REGISTRY, DOMAINS, STATUSES, VIZ };
