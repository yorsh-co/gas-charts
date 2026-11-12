/**
 * Assembles the manual fixture into `.manual-charts/`, a folder that
 * `clasp push` can send to a throwaway Apps Script project.
 *
 * Run through `npm run manual:build`, which compiles the library first. The
 * target project is read from MANUAL_CHARTS_SCRIPT_ID, so no ID is stored in
 * the repository. The first argument overrides the output folder and the
 * second the folder holding the compiled library (default `dist/`).
 * See manual/README.md.
 */
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = process.argv[2]
  ? resolve(process.argv[2])
  : join(ROOT, '.manual-charts');
const DIST = process.argv[3] ? resolve(process.argv[3]) : join(ROOT, 'dist');

const scriptId = process.env.MANUAL_CHARTS_SCRIPT_ID;
if (!scriptId) {
  console.error(
    'MANUAL_CHARTS_SCRIPT_ID is not set (the throwaway Apps Script project).',
  );
  process.exit(1);
}

const { gasdev } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

/** Writes `content` to `path` under the output folder, creating directories. */
function emit(path, content) {
  const target = join(OUT, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

/**
 * Whether a compiled file holds nothing but comments, a `"use strict"`
 * directive or `export {}`, as type-only files do.
 */
function isEmpty(code) {
  return (
    code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/^\s*(['"])use strict\1;?\s*$/gm, '')
      .replace(/^\s*export\s*\{\s*\};?\s*$/gm, '')
      .trim() === ''
  );
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// The compiled library, one file each, in load order. Type-only files compile
// to nothing and are left out.
const libraryFiles = [];
for (const file of gasdev.loadOrder) {
  const compiled = file.replace(/\.ts$/, '.js');
  const code = readFileSync(join(DIST, compiled), 'utf8');
  if (isEmpty(code)) continue;

  const target = `lib/gas-charts/${compiled}`;
  emit(target, code);
  libraryFiles.push(target);
}

cpSync(join(ROOT, 'manual/app.js'), join(OUT, 'app.js'));
cpSync(join(ROOT, 'manual/appsscript.json'), join(OUT, 'appsscript.json'));

const pushOrder = [...libraryFiles, 'app.js'];
emit(
  '.clasp.json',
  `${JSON.stringify({ scriptId, rootDir: '.', filePushOrder: pushOrder }, null, 2)}\n`,
);

// Apps Script rejects a file that does not parse, but only on push.
for (const file of pushOrder) {
  execFileSync(process.execPath, ['--check', join(OUT, file)]);
}

console.log(
  `✓ Built ${OUT}\n  Next: cd ${relative(process.cwd(), OUT) || '.'} && npx clasp push`,
);
