const { build } = require('esbuild');
const { execSync } = require('child_process');

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  format: 'cjs',
  outfile: 'dist/index.js',
  minify: true,
  // Node built-ins are always available — keep them external
  // Everything else (firebase-admin, etc.) gets bundled in
  packages: 'bundle',
}).then(() => {
  // Emit .d.ts separately — esbuild doesn't generate type declarations
  execSync('tsc --emitDeclarationOnly --outDir dist', { stdio: 'inherit' });
  console.log('Build complete.');
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
