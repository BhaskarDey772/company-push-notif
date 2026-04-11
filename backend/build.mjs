import { build } from 'esbuild';
import { execSync } from 'child_process';

const shared = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  format: 'cjs',
  minify: true,
};

Promise.all([
  // Default: firebase-admin bundled in — zero extra installs
  build({ ...shared, outfile: 'dist/index.js', packages: 'bundle' }),

  // Slim: firebase-admin external — for users who already have it in their project
  build({ ...shared, outfile: 'dist/index.slim.js', external: ['firebase-admin', 'firebase-admin/messaging'] }),
]).then(() => {
  execSync('tsc --emitDeclarationOnly --outDir dist', { stdio: 'inherit' });
  console.log('Build complete.');
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
