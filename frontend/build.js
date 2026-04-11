const { build } = require('esbuild');

build({
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'browser',
  format: 'esm',
  outfile: 'dist/index.js',
  minify: true,
  // firebase is bundled in — no peerDependencies needed
  packages: 'bundle',
}).then(() => {
  console.log('Build complete.');
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
