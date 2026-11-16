const fs = require('node:fs');
const path = require('node:path');

// Source: the public digitalmodel repository, docs/api/<page> at commit
// c13bd2b7ae8513f05c6d20772aa245255ce18f1d, published at
// https://vamseeachanta.github.io/digitalmodel/<page>. Assets under _assets/ and
// cfd/viz/ are byte-identical to that commit. Local edits to the three pages:
// - one canonical link per page, on the www host;
// - relative links to pages that are not copied point at their public URLs;
// - forecast footer: tracking chip and the AQWA phase-sign clause removed; the
//   horizon text states that the sea-type horizons are fixed illustrative
//   presets; the helideck chip no longer quotes values, and the caution/limit
//   values are labelled as indicative screening values.
const COPIED_PAGES = [
  'digitalmodel/cfd/sloshing-cfd-study.html',
  'digitalmodel/hydro/short-horizon-motion-forecast.html',
  'digitalmodel/buckling/ship-plate-buckling.html',
];

function copyDigitalmodelPages(outputDir, contentDir = path.resolve(__dirname, '../content')) {
  for (const page of COPIED_PAGES) {
    if (!fs.statSync(path.join(contentDir, page)).isFile()) throw new Error(`Missing copied page: ${page}`);
  }
  // These standalone documents contain inline programs. Copy their bytes and
  // local assets together, without template expansion or HTML serialization.
  fs.cpSync(path.join(contentDir, 'digitalmodel'), path.join(outputDir, 'digitalmodel'), { recursive: true });
}

if (require.main === module) copyDigitalmodelPages(process.argv[2] || 'dist');

module.exports = { COPIED_PAGES, copyDigitalmodelPages };
