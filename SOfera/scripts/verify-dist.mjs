import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'dist/index.html',
  'dist/assets/icons/pois/theatre.svg',
  'dist/assets/main_logo.svg',
  'dist/lib/settings.json',
];

const missing = required.filter((rel) => !existsSync(resolve(root, rel)));

if (missing.length) {
  console.error('Build incomplete. Missing:\n', missing.map((p) => `  - ${p}`).join('\n'));
  console.error('\nRun: npm run build');
  console.error('Ensure ./assets/ exists. For 3D scene add ./models/ before build.');
  process.exit(1);
}

if (!existsSync(resolve(root, 'dist/models/SOfera2.sog'))) {
  console.warn('WARN: dist/models/SOfera2.sog missing — add ./models/ before build or upload models to server.');
}

const buildIdPath = resolve(root, 'dist/build-id.txt');
if (existsSync(buildIdPath)) {
  console.log(`dist/ OK. build-id: ${readFileSync(buildIdPath, 'utf8').trim()}`);
} else {
  console.log('dist/ OK: static assets present.');
}
