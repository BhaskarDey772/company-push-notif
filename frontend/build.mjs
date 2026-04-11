import { build } from 'esbuild';

const shared = {
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'browser',
  format: 'esm',
  minify: true,
};

Promise.all([
  // Default: firebase bundled in — zero extra installs
  build({ ...shared, outfile: 'dist/index.js', packages: 'bundle' }),

  // Slim: firebase external — for users who already have firebase in their project
  build({ ...shared, outfile: 'dist/index.slim.js', external: ['firebase', 'firebase/app', 'firebase/messaging'] }),
]).then(() => {
  console.log('Build complete.');
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
