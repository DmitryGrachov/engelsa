import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeFilePlanPath } from '../src/sctipts/utils/file-plan-path.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = resolve(root, 'src/res/data.json');
const mainAssetsDir = resolve(root, 'assets/main');

const PLAN_FIELDS = [
    { key: 'filePlan', label: 'filePlan' },
    { key: 'file_plan_on_floor', label: 'file_plan_on_floor' }
];

if (!existsSync(dataPath)) {
    console.error(`data.json not found: ${dataPath}`);
    process.exit(1);
}

if (!existsSync(mainAssetsDir)) {
    console.error(`assets/main not found: ${mainAssetsDir}`);
    process.exit(1);
}

const availableFiles = new Set(readdirSync(mainAssetsDir));
const data = JSON.parse(readFileSync(dataPath, 'utf8'));

/** @type {Record<string, { updated: number; unchanged: number; missing: Set<string> }>} */
const stats = Object.fromEntries(
    PLAN_FIELDS.map(({ label }) => [label, { updated: 0, unchanged: 0, missing: new Set() }])
);

for (const item of data) {
    for (const { key, label } of PLAN_FIELDS) {
        if (typeof item?.[key] !== 'string')
            continue;

        const nextPath = normalizeFilePlanPath(item[key]);

        if (!nextPath)
            continue;

        const fileName = nextPath.split('/').pop();

        if (fileName && !availableFiles.has(fileName))
            stats[label].missing.add(fileName);

        if (item[key] === nextPath) {
            stats[label].unchanged += 1;
            continue;
        }

        item[key] = nextPath;
        stats[label].updated += 1;
    }
}

writeFileSync(dataPath, `${JSON.stringify(data, null, '\t')}\n`, 'utf8');

for (const { label } of PLAN_FIELDS) {
    const fieldStats = stats[label];

    console.log(`${label} paths updated: ${fieldStats.updated}`);
    console.log(`${label} paths already normalized: ${fieldStats.unchanged}`);

    if (fieldStats.missing.size) {
        console.warn(`WARN: ${fieldStats.missing.size} ${label} images are missing in assets/main`);
        console.warn([...fieldStats.missing].slice(0, 10).join('\n'));
    }
}
