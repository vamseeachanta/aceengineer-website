const fs = require('node:fs');
const path = require('node:path');

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
